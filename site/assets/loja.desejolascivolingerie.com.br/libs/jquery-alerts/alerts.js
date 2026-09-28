(function($){
    "use strict";

    $.fn.extend({
        //plugin name - venobox
        alerts: function(options) {
            var APP, elemInit;
            var date = new Date();
            elemInit = $(this);

            // default options
            var defaults = {
                id: date.getTime(),
                efeito: 'alerts-efeito-topo',
                tipoMensagem: null, // sucesso, alerta e erro
                position: 'fixed',
                tempoExibicao: 6000, // miliseconds
                botaoHtml: false,
                botaoHref: false,
                init: function(){
                    // console.log(APP);
                    $('container-alerts').remove();

                    var container = APP.create();
                    APP._show(container);
                    if (APP.tempoExibicao > 0){
                        APP.hide(container);
                    }

                },
                create: function(){
                    var container = criarContainer();
                    var content = criarContent(APP.mensagemHtml);
                    var btnAcao = criarContentBotaoAcao(APP.botaoHtml, APP.botaoHref);
                    var barraProgresso = criarBarraProgresso();

                    container.addClass(APP.efeito);

                    container.css({
                        top: ($('#topoPagina').outerHeight()-2)+'px',
                    });

                    if (APP.tipoMensagem) {
                        container.find('.content').addClass(APP.tipoMensagem)
                    }
                    container.find('.content').append(content).append(btnAcao).append(barraProgresso);
                    $('body').append(container);

                    return container;
                },
                _show: function(container){

                    if (typeof APP.show == 'function') {
                        APP.show(container);
                    }

                    setTimeout(function(event){
                        container.addClass('on');
                    },500);

                },
                hide: function(container){

                    var timeoutHandle;
                    var timeOutExe = function(container){
                        container.removeClass('on');
                        setTimeout(function(){
                            container.remove()
                        },500)
                    }

                    timeoutHandle = window.setTimeout(function(event){
                        timeOutExe(container);
                    }, APP.tempoExibicao);

                    container.mouseover(function(event){
                        window.clearTimeout(timeoutHandle);
                    });

                    container.mouseout(function(event){
                        timeoutHandle = window.setTimeout(function(event){
                            timeOutExe(container);
                        }, 3000);    
                    });            
                    
                },
            };

            APP = $.extend(defaults, options);

            // callback plugin initialization
            APP.init();


            function criarContainer(){
                var container = $('<div>').addClass('container-alerts');
                var content = $('<div>').addClass('content');
                var elem_resp = $('<div>').addClass('elemento-responsivo');

                if (APP.id){
                    container.attr('id', APP.id);
                }
                container.css('position', APP.position);

                container.append(content).append(elem_resp);
                return container;
            }
            function criarContent(html){
                var content = $('<div>').addClass('cont-alerta').html(html);
                return content;
            }
            function criarContentBotaoAcao(html, href){
                if (html == false || href == false) {
                    return $('<span>');
                }
                var content = $('<div>').addClass('cont-btn-acao');
                var btn = $('<a>').attr('href', href).html(html);
                return content.append(btn);
            }
            function criarBarraProgresso(){
                var container = $('<div>').addClass('cont-barra-progressao');
                var content = $('<div>').addClass('content');

                container.append(content);
                return container;

            }

        }

    });

})(jQuery);
