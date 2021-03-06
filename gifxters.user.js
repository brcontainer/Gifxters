// ==UserScript==
// @name         Gifxters
// @namespace    com.jefhtavares
// @version      0.2.1
// @description  Find and send gifs in SE chat
// @author       https://github.com/jefhtavares
// @match        http://chat.stackexchange.com/rooms/*
// @match        https://chat.stackexchange.com/rooms/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    function main(){
        if(typeof $ === 'undefined'){
            setTimeout(main, 100);
            return;
        }

        var offset = 0, limit = 6;
        const imgTagTpl = '<img class="gif" src="#GIF-URL#" style="width: 120px; height: 80px; cursor: pointer; margin: 3px;" data-url="#GIF-URL#"> </img>';
        const apiKey = 'dc6zaTOxFJmzC'; //Beta API Key
        const apiUrl = 'http://api.giphy.com/v1/gifs/search';
        const modalOptions = {
            position: { my: 'left bottom', at: 'left bottom', of: $('#widgets') } ,
            appendTo: '#gifxters',
            closeText: '',
            closeOnEscape: true,
            draggable: true,
            resizable: false,
            title: 'Selecionar GIF',
            modal: true
        };

        var findGifs = function () {
            if(!$('#txt-busca').val())
                return;

            offset = 0;
            var params = $.param({q: $('#txt-busca').val(), limit: 6, offset: offset, api_key: apiKey});
            var url = apiUrl + '?' + params;

            $.get(url, function(data){
                var modalSource = modalInicio();

                data.data.forEach(function(el){
                    modalSource += imgTagTpl.replaceAll('#GIF-URL#', el.images.original.url);
                });

                modalSource += modalFim();

                $(modalSource).dialog(modalOptions);
            });
        };

        $.getScript("http://code.jquery.com/ui/1.12.0/jquery-ui.min.js", function(){
            $('<link/>', {
                rel: 'stylesheet',
                type: 'text/css',
                href: 'http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css'
            }).appendTo('head');

            $('#widgets').append(htmlInputs());
        });

        $('.ui-widget-overlay').live('click', function(){
            $('#dialog').dialog('close');
        });

        $('body').on('click', '#bt-buscar', findGifs);
        $('body').on('keydown', '#txt-busca', function(e) {
            if(e.keyCode == 13) {
                findGifs();
            }
        });

        $('body').on('click', '#prev-page', function(){
            offset = offset > 5 ?  offset - 6 : 0;
            alterar($(this).parent().parent());
        });

        $('body').on('click', '#next-page', function(){
            offset += 6;
            alterar($(this).parent().parent());
        });

        function alterar(elemento){
            var params = $.param({q: $('#txt-busca').val(), limit: 6, offset: offset, api_key: apiKey});
            var url = apiUrl + '?' + params;

            $.get(url, function(data){
                adicionarGifs(elemento, data.data);
            });
        }

        function adicionarGifs(parentElement, data){
            $(parentElement).find('#dialog-content').html('');

            var strHtml = '';
            data.forEach(function(el) {
                strHtml += imgTagTpl.replaceAll('#GIF-URL#', el.images.original.url);
            });

            $(parentElement).find('#dialog-content').html(strHtml);
        }

        $('body').on('click', '.gif', function(){
            $('#input').val($(this).data('url'));
            //$('#sayit-button').trigger('click');
            $('#dialog').dialog('destroy');
        });
    }

    function modalFim(){
        return '</div><span>Powered by GIPHY</span><div style="float: right"><button id="prev-page" style="margin-right: 5px;">&#8592;</button><button id="next-page">&#8594;</button></div></div>';
    }

    function modalInicio(){
        return '<div id="dialog"> <div id="dialog-content">';
    }

    function htmlInputs(){
        return '<div id="gifxters" style="position: relative;"><input type="text" id="txt-busca" /> <button class="button" id="bt-buscar">Buscar GIF</button></div>';
    }

    main();
})();
