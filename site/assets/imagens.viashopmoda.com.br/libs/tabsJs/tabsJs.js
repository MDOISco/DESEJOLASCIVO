(function($){
    "use strict";

    $.fn.extend({
        //plugin name - venobox
        tabsJs: function(options) {
            var plugin, container, option, elems;
            plugin = this;
            container = $(plugin);

            // default options
            var defaults = {
                tema: 'linha', //str: 'coluna'
                menuBorda: true, //bool
                menuAlign: false, //bool false | str: 'center' ou 'right'
                conteudoBorda: true, //bool
                bordas: 'tudo', //str: 'tudo'=menu e conteudo; 'top'=so no menu; 'nada'= sem borda;
                addMenu: false, //obj: ex: ['.btn-click', '#btnClick'] e id do conteudo em data-tabsjs-id="#tab2";
                init: function(){},
                addClasses: function(){
                    container.addClass('tabsJs-container '+defaults.tema);
                    container.find('ul').addClass('tabs-opcoes');
                    container.find('> div').addClass('tabs-conteudo');
                    container.find('> div div').addClass('tabs-infos');
                },
                getElems: function(){
                    return {
                        opcoesCont: container.find('.tabs-opcoes'),
                        opcoesLi: container.find('.tabs-opcoes').find('li'),
                        conteudoCont: container.find('.tabs-conteudo'),
                        conteudoInfos: container.find('.tabs-infos'),
                    }
                },
                click: function(elems, id){
                    elems.opcoesLi.removeClass('show');
                    elems.conteudoInfos.removeClass('show');
                    $(id).addClass('show');
                    $.each(elems.opcoesLi, function(ind, val){
                        if ($(val).find('a').attr('href') == id) {
                            $(val).addClass('show');
                        }
                    });
                },
            };

            option = $.extend(defaults, options);

            // callback plugin initialization
            option.init(plugin);

            //add classes
            option.addClasses(container);

            //elementos
            elems = option.getElems(container);

            // configs
            if (!defaults.menuAlign === false) {
                elems.opcoesCont.css('text-align', defaults.menuAlign);
            }
            if (defaults.bordas = 'top') {
                elems.conteudoCont.css('border', 'none');
                elems.conteudoCont.css('border-top', '1px solid #C8CED3');
            } else if (defaults.bordas == 'nada') {
                elems.opcoesCont.find('li').css('border', 'none');
                elems.conteudoCont.css('border', 'none');
            }

            //Iniciando aplicação
            //mostrando o primeiro infos
            $(elems.conteudoInfos[0]).addClass('show');
            $(elems.opcoesLi[0]).addClass('show');

            //Ação click nas opções
            elems.opcoesCont.find('a').click(function(e){
                e.preventDefault();
                var th = $(this);
                var click_id = th.attr('href');
                console.log(click_id)
                option.click(elems, click_id);
            });

            if (defaults.addMenu !== false) {
                $.each($(defaults.addMenu), function(ind, val){
                    $(val).click(function(){
                        var click_id = $(this).data('tabsjs-id');
                        option.click(elems, click_id);
                    });
                });
            }

        } // venobox

    }); // extend

})(jQuery);
