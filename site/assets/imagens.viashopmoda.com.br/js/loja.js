$(function(){
    carregaDadosLoja();

});

function carregaDadosLoja() {
    $.get("json/?token=VmpKd1MwNUhVbk5pU0ZKVFltczFjRlZ1Y0hObFJtUlhVbFJzVVZWVU1Eaz0=", function(json){

        var obj = JSON.parse(json);
        var loja = obj.loja.conteudo[0];


        //elementos a serem alterados
        var logoTopo = $("#logoTopo");
        var footer = $("footer");
    
        logoTopo.html("");
    
        
        if (obj.live.aovivo){
            montaContainerLiveAoVivoTopoLoja();
            montaContainerAnuncioLiveDraggle(obj.live);
        }

        // if (
        //     obj.continuarcompra != null &&
        //     [
        //         'meuspedidos',
        //         'pedido'
        //     ].indexOf(verificaPaginaAtual()) != 0
        // ) {
        //     abreContinuaCompraCliente(obj.continuarcompra.conteudo[0]);
        // }
    
        if (location.pathname != '/index2.php') {
            abreCondicoesLojaJson(obj.condicoes);
        }


        var objInfosLoja = criaObjeto_GlobalFooterLoja(loja);
        if (loja.Loj_DadosDeposito == null){
            loja.Loj_DadosDeposito = '';
        }
        var split = loja.Loj_DadosDeposito.split(';');
        if ((loja.Loj_DadosDeposito) && (split.length > 3)){
            delete objInfosLoja.cnpj;
            objInfosLoja.nome = split[0];
            objInfosLoja.nif = split[1];
            objInfosLoja.cep = split[2];
            objInfosLoja.endereco1 = split[3];
            objInfosLoja.endereco2 = split[4];
            var novoObj = {};
            $.each(objInfosLoja, function(ind, val){
                novoObj[ind]=val;
                if (ind == 'nome'){
                    novoObj['nif'] = objInfosLoja.nif;
                    delete objInfosLoja.nif;
                }
            });
            objInfosLoja = novoObj;
        }
        abreFooter_InfosLoja(objInfosLoja);
        abreFooter_institucional(obj);
        abreFooter_MidiasSociais(criaObjeto_MidiasSociais(loja));
        abreFooter_AppStore(criaObjeto_AppStore(loja));
        abreFooter_TermoAceiteLgpd(obj);
    
    
        var ulInstitucional = footer.find(".institucional");
        // Exibe o container de lead no rodapé (com email) se:
        // Estiver na pagina index ou de produto e não esteja logado
        if ($('.container-lead').length == 1) {
            //colocando o padding top correto de acordo com o numero de conteudo no rodape
            if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
                var contLeadFooter = $('.container-lead');
                contLeadFooter.css({position:'absolute', top:0})
                ulInstitucional.css('top', contLeadFooter.outerHeight()+'px');
                footer.css("padding-top", (((ulInstitucional.find('a').length + 1) * 39)+contLeadFooter.outerHeight())+'px');
            }

            $('#formLeadCliente_footer').submit(function(event){
                event.preventDefault();
                
                var form = $(this);
                form.find('.erro').removeClass('erro');

                // validando
                var errosForm=[];
                var inputNome = form.find('[name="lead_nome"]');
                var inputEmail = form.find('[name="lead_email"]');
                var validaEmail = verificaInputNormal(inputEmail);


                if (inputNome.val().length < 3) {
                    errosForm.push({
                        campo: inputNome,
                        erro: 'Nome inválido!'
                    });
                }
                if (!validaEmail[0]) {
                    errosForm.push({
                        campo: inputEmail,
                        erro: 'Email inválido!'
                    });
                }

                $.each(errosForm, function(ind, val){
                    val.campo.parent().addClass('erro');
                });
                if (errosForm.length > 0){
                    return;
                }


                var success = function(data){
                    var response = JSON.parse(data);

                    var container = $('#formLeadCliente_footer').parent().parent();
                    var form = container.find('form');
                    var icone = $('<i>').addClass(response.icone_class);
                    container.find('.tit i').remove();
                    form.parent().remove();
                    container.addClass('msg_retorno');
                    container.prepend(icone);
                    container.find('.tit p').html(response.nome);
                    container.find('.tit span').html(response.msg);
                };

                requestApiLojaV2_POST("leads/newsletter", {}, {
                    lead_qualpagina: verificaPaginaAtual(),
                    lead_nome: inputNome.val(),
                    lead_email: inputEmail.val(),
                }, success, function(data){
                    console.log(data)
                }, function(data){});
                
            });

        } else {
            if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
                footer.css("padding-top", ((ulInstitucional.find('a').length + 1) * 39)+'px');
            }
        }   

    });
}


function abreFooter_TermoAceiteLgpd(obj){
    var verif_conteudoLgpd=false;
    var verif_conteudoTermosDeUso=false;
    var verif_aceitaCookie = document.cookie.indexOf('useCookieAccepted=true');

    // Verifica se existe algum conteudo com o tipo=3 que se refere a LGPD no institucional da loja
    $.each(obj.institucional.conteudo, function(ind, val){
        if (val.tipo == 3) {
            verif_conteudoLgpd=val.id;
        }
        if (val.titulo == 'TERMOS DE USO') {
            verif_conteudoTermosDeUso=val.id;
        }
    });

    // console.log(obj)
    // console.log(document.cookie)
    // console.log(verif_aceitaCookie)
    if (
        verif_conteudoLgpd !== false &&
        verif_aceitaCookie == -1 &&
        location.pathname.indexOf('pedido') == -1
    ) {
        var nome_loja = obj.loja.conteudo[0].Loj_Nome;
        var texto_aceite =  'Nós salvamos o seu histórico de uso pra oferecer a melhor experiência na '+nome_loja+'. '+
                            'Quando você navega no nosso site, aceita esta condição. '+
                            'Conheça nossa <a href="/politica-de-privacidade">Política de Cookies e Privacidade</a>';

        if (verif_conteudoTermosDeUso !== false){
            texto_aceite += ' e nossos <a href="/institucional?conteudo'+verif_conteudoTermosDeUso+'">Termos de uso</a>.';
        } else {
            texto_aceite += '.';
        }

        var container = $('<div>').addClass('container-aceite-lgpd');
        var content = $('<div>').addClass('elemento-responsivo');
        var msg = $('<div>').addClass('msg').html(texto_aceite);
        var cont_btn = $('<div>').addClass('cont-btn');
        var btn = $('<button>').addClass('finalizar').html('<i class="fal fa-check"></i>Aceitar e fechar');

        container.append(content.append(msg).append(cont_btn.append(btn)));
        $('body').append(container);

        btn.click(function(){
            container.removeClass('on');
            $.post("json/?token=VmpGYWExUXlTa2hTYkd4V1lsZG9jVmxzVlRGTmJHeHhVMnBDYWxKdVFscFdSbEYzVUZFOVBRPT0", global_tokenSubmit, function(data){
                // var obj = JSON.parse(json);
            }).fail(function(){
            }).always(function(){
            });
        });

        setTimeout(function(){
            container.addClass('on');
        },3000);
    }
}
// function abreContinuaCompraCliente(continuarcompra){
//     ///variavies
//     var sessaoBrowser = continuarcompra.ped_sessaobrowser;
//     var elementos = montaLayout_continuarCompraCliente(continuarcompra);
//     //append via DOM
//     $("body").append(elementos.layout);
//     $("body").append(elementos.link);

//     var tamanhoJanela = formataTamanho_JanelaVenoboxModoInline("continuarcompra");
//     setTimeout(function(){
//         $('.continuar-compra-cliente').venobox({
//             framewidth: tamanhoJanela.largura,
//             frameheight: tamanhoJanela.altura
//         }).trigger('click');
//     },2000);
//     // $("#firstlink").venobox().trigger('click');

//     //ação de fechar a janela
//     $(document).on('click', '.btnContinuarSimulacao-nao', function(){
//         alterarHtmButtonCarregando($(".btnContinuarSimulacao-nao"));
//         requestContinuarCompra(sessaoBrowser, false);
//     });
//     //aceitar continuar compra
//     $(document).on('click', '.btnContinuarSimulacao-sim', function(){
//         alterarHtmButtonCarregando($(".btnContinuarSimulacao-sim"));
//         requestContinuarCompra(sessaoBrowser, true);
//     });
// }
// function requestContinuarCompra(sessao, continuar){

//     var post = {
//         continuar: continuar,
//         sessao: sessao,
//     };

//     $.post("json/continuarcompra.php", JSON.stringify(post), function(json){
        
//         if (continuar){
//             abreSacolaDAO(true);
//         }

//         fecharVenoBoxIframe(true);
                    
//     }).fail(function(){
//         location.reload();
//     });

// }
function montaLayout_continuarCompraCliente(obj){
    var container_venobox, container;
    var continuarcompra = obj;
    var qtdepecas = '<span>'+continuarcompra.qtdepecas+'</span> item';
    if (continuarcompra.qtdepecas > 1) {
        var qtdepecas = '<span>'+continuarcompra.qtdepecas+'</span> itens';
    }
    container_venobox = $("<a>").addClass("continuar-compra-cliente").attr({
        "href": "#continuarCompraCliente",
        "data-vbtype": "inline"
    });
    container = $("<div>").attr("id", "continuarCompraCliente").css("display", "none");
    var content = $("<div>").addClass("continuar-compra");
        var icone = $("<i>").addClass("fal fa-cart-plus");
        var msg_titulo = $("<p>").addClass("msg_titulo").html('olá<span>'+getNomeUsuarioLogadoDOM()+'</span>, deseja continuar sua compra iniciada <span>'+continuarcompra.qtdedias+'</span>?');
        var msg_pecas = $("<p>").addClass("msg_pecas").html(qtdepecas+' em sua sacola no valor de <span>'+formataValorFloatParaMonetario(obj.moeda, continuarcompra.valor)+'</span>');
        var content_botoes = $("<div>").addClass("content_botoes");
        var btnSimulacao_Sim = $("<button>").addClass("btnContinuarSimulacao-sim").html('<i class="fal fa-thumbs-up"></i>continuar');
            var btnSimulacao_Nao = $("<button>").addClass("cancelar btnContinuarSimulacao-nao").html('cancelar');
        var msg_rodape = $("<p>").addClass("msg_rodape").text("caso opte por continuar faremos uma reanálise automática das peças em nosso estoque =).")
    container.append(content);
    content.append(icone);
    content.append(msg_titulo);
    content.append(msg_pecas);
    content.append(content_botoes);
        content_botoes.append(btnSimulacao_Sim);
        content_botoes.append(btnSimulacao_Nao);
    content.append(msg_rodape);

    return {
        link: container_venobox,
        layout: container
    };
}

function abreCondicoesLojaJson(condicoes){
    var elemCondicoes = $(".condicoes>ul");
    elemCondicoes.html('');
    
    $.each(condicoes, function(index, value){
        var li = $("<li>");
        var i = $("<i>").addClass(value.icone);
        var h2 = $("<h2>").text(value.tit);
        var p = $("<p>").text(value.txt);
        //verificando se possui mais infos para criar novos elementos
        if (value.hover != undefined&& value.hover != "") {
            li.addClass("mais-infos");
            var cont_maisInfos = $("<div>").addClass("detalhe-condicao").html(value.hover);
            var span_icone_seta = $("<span>").addClass('icone-mais-infos').html('<i class="fal fa-angle-down"></i>')
            li.append(cont_maisInfos);
            p.prepend(span_icone_seta);
        }

        li.append(i);
        li.append(h2);
        li.append(p);

        elemCondicoes.append(li);

        if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
            if (value.hover != "" && value.hover != undefined) {
                cont_maisInfos.css({
                    'display': 'none',
                });
                li.on("click", function(){
                    $(this).toggleClass("mais-infos-on");
                    $(this).find(".detalhe-condicao").toggle();
                });
            }
        }

        if (value.link != undefined && value.link != "") {
            // li.css("cursor", "pointer");
            li.addClass('com-link');
            li.on("click", function(){
                if(value.link.substring(0,4) == "http") {
                    verif_target = "_blank";
                } else {
                    verif_target = "_self";
                }
                window.open(value.link, verif_target);
            });
        }
    });
}

// function abreCondicoesLoja(obj) {
//     console.log(obj)
//     var elemCondicoes = $(".condicoes>ul");
//     $.each(obj.itens, function(index, value){
//         var txtIcone, txtH2, txtP, link, maisInfos;

//         switch (value) {
//             case 'cadastre-se':
//                 txtIcone = "fal fa-unlock-alt";
//                 txtH2 = "cadastre-se";
//                 txtP = (obj.categoriaLoja == "Moda") ? "seja um lojista exclusivo" : "seja uma revendedora";
//                 link = "/cadastro";
//                 maisInfos = "";
//                 break;
//             case 'compra-atacado':
//                 var verif_txtP = (obj.modoPedidoMinimo == "Valor") ? formataValorFloatParaMonetario("BRL", obj.compraMinimaAtacado) : parseInt(obj.compraMinimaAtacado)+" peças";
//                 var verif_txtIcone = (obj.modoPedidoMinimo == "Valor") ? "fal fa-shopping-bag" : "fal fa-tshirt";
//                 txtIcone = verif_txtIcone;
//                 txtH2 = "pedido mínimo";
//                 txtP = "a partir de "+verif_txtP;
//                 link = "";
//                 maisInfos = "";
//                 break;
//             case 'compra-varejo':
//                 txtIcone = "fal fa-unlock-alt";
//                 txtH2 = "cadastre-se";
//                 txtP = (obj.categoriaLoja == "Moda") ? "seja um lojista exclusivo" : "seja uma revendedora";
//                 link = "/cadastro";
//                 maisInfos = "";
//                 break;
//             case 'parcelamento-semconfig':
//                 txtIcone = "fal fa-credit-card";
//                 txtH2 = "parcelamento";
//                 txtP =  "conheça nossas condições";
//                 link = "/institucional?condicoes-de-parcelamento";
//                 maisInfos = "";
//                 break;
//             case 'parcelamento-varejo':
//                 txtIcone = "fal fa-credit-card";
//                 txtH2 = "no varejo";
//                 txtP = "parcele em até "+obj.parcelamentoSemJuros + "x sem juros";

//                 if (obj.parcelamentoNoRodape !== false) {
//                     link = obj.parcelamentoNoRodape[1];
//                 } else {
//                     link = "";
//                 }
//                 maisInfos="";
//                 if (obj.parcelamentoSemJurosAtacado == "0" || obj.parcelamentoSemJurosAtacado == "1") {
//                     maisInfos = "confira nossas condições no atacado";
//                 } else {
//                     maisInfos = "<strong>no atacado</strong><br>parcele em até "+ obj.parcelamentoSemJurosAtacado + "x sem juros<br><br>confira as condições";                    
//                 }
//                 break;
//             case 'parcelamento-atacado':
//                 txtIcone = "fal fa-credit-card";
//                 txtH2 = "no atacado";
//                 txtP = "parcele em até "+ obj.parcelamentoSemJurosAtacado + "x sem juros";
//                 if (obj.parcelamentoNoRodape !== false) {
//                     link = obj.parcelamentoNoRodape[1];
//                 } else {
//                     link = "";
//                 }
//                 maisInfos = "confira as condições";
//                 break;
//             case 'parcelamento-atacado-varejo':
//                 txtIcone = "fal fa-credit-card";
//                 txtH2 = "no atacado";
//                 txtP = "parcele em até "+ obj.parcelamentoSemJurosAtacado + "x sem juros";
//                 if (obj.parcelamentoNoRodape !== false) {
//                     link = obj.parcelamentoNoRodape[1];
//                 } else {
//                     link = "";
//                 }
//                 maisInfos="";
//                 if (obj.parcelamentoSemJurosAtacado == "0" || obj.parcelamentoSemJurosAtacado == "1") {
//                     maisInfos = "confira nossas condições no varejo";
//                 } else {
//                     maisInfos = "<strong>no varejo</strong><br>parcele em até "+ obj.parcelamentoSemJuros + "x sem juros<br><br>confira as condições";
//                 }

//                 break;
//             case 'parcelamento-unico':
//                 txtIcone = "fal fa-credit-card";
//                 txtH2 = "parcelamento";
//                 txtP = "Até "+obj.parcelamentoSemJurosAtacado + "x sem juros";
//                 link = "";
//                 if (obj.parcelamentoNoRodape !== false) {
//                     link = obj.parcelamentoNoRodape[1];
//                 }
//                 maisInfos = "";
//                 break;
//             case 'lucro':
//                 txtIcone = (obj.categoriaLoja == "Moda") ? "fal fa-box-alt" : "fal fa-dollar-sign";
//                 txtH2 = (obj.categoriaLoja == "Moda") ? "pronta-entrega" : "lucre muito";
//                 txtP = (obj.categoriaLoja == "Moda") ? "da fábrica para sua loja" : "lucre até "+ obj.lucroPercentualSugerido +"% na revenda";
//                 link = "/cadastro";
//                 maisInfos = "";
//                 break;
//             case 'frete-gratis':
//                 txtIcone = "fal fa-truck";
//                 txtH2 = "frete grátis";
//                 txtP = obj.msgFreteGratis;
//                 if (obj.freteNoRodape !== false) {
//                     link = obj.freteNoRodape[1];
//                 } else {
//                     link = "";
//                 }
//                 maisInfos = obj.infoFreteGratis;
//                 break;
//             case 'frete-internacional':
//                 txtIcone = "fal fa-globe-americas";
//                 txtH2 = "entrega global";
//                 txtP = "Enviamos para seu país";
//                 link = "/institucional?condicoes-de-frete";
//                 maisInfos = "Clique para saber mais";
//                 break;
//             case 'pra-voce':
//                 txtIcone = "fal fa-heart";
//                 txtH2 = "pra você";
//                 txtP = "Peças que são tendências!";
//                 link = "";
//                 maisInfos = "";
//                 break;
//         }

//         var li = $("<li>");
//         var i = $("<i>").addClass(txtIcone);
//         var h2 = $("<h2>").text(txtH2);
//         var p = $("<p>").text(txtP);
//         //verificando se possui mais infos para criar novos elementos
//         if (maisInfos != "") {
//             li.addClass("mais-infos");
//             var cont_maisInfos = $("<div>").addClass("detalhe-condicao").html(maisInfos);
//             var span_icone_seta = $("<span>").addClass('icone-mais-infos').html('<i class="fal fa-angle-down"></i>')
//             li.append(cont_maisInfos);
//             p.prepend(span_icone_seta);
//         }

//         li.append(i);
//         li.append(h2);
//         li.append(p);

//         elemCondicoes.append(li);

//         if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
//             if (maisInfos != "") {
//                 cont_maisInfos.css({
//                     'display': 'none',
//                 });
//                 li.on("click", function(){
//                     $(this).toggleClass("mais-infos-on");
//                     $(this).find(".detalhe-condicao").toggle();
//                 });
//             }
//         }
//         if (link != "") {
//             // li.css("cursor", "pointer");
//             li.addClass('com-link');
//             li.on("click", function(){
//                 if(link.substring(0,4) == "http") {
//                     verif_target = "_blank";
//                 } else {
//                     verif_target = "_self";
//                 }
//                 window.open(link, verif_target);
//             });
//         }
//     });
// }
function abreFooter_InfosLoja(objInfosLoja) {
    var ulInfosLoja = $("footer .atendimento");
    var conta = 0;
    
    if (ulInfosLoja.hasClass('endereco-resumido')){
        delete objInfosLoja.endereco1
        delete objInfosLoja.endereco2
        delete objInfosLoja.cep
    }

    $.each(objInfosLoja, function(index, value){
        var texto = "";
        var verif = 0;

        if (
            index == "cep" || 
            index == "telefone" || 
            index == "whatsapp" || 
            index == "cnpj" ||
            index == "nif"
        ) {
            texto = index+" ";
        }
        if (index == "endereco1") {
            verif = 2;
        }
        if (index == "endereco2") {
            verif = 3;
        }
        if (value != undefined && value.length > verif) {
            var li = $("<li>").addClass(index).text(texto+value);
            if (
                index == "nome" ||
                index == "cnpj" ||
                index == "endereco1" ||
                index == "endereco2"
            ) {
                li.addClass('notranslate');
            }      

            ulInfosLoja.append(li);
            conta++;
        }
    });

}
function abreFooter_institucional(obj) {
    var bodyData = getBodyData();
    var objInstitucional = obj.institucional.conteudo;
    var objLoja = obj.loja.conteudo[0];

    var objLinks=[];

    // ITENS FIXOS
    // item seja um revendedor
    // var tituloRevendedor = {Moda: "seja um licenciado",Lingerie: "seja uma revendedora"}
    // if (global_bodyData.plataforma == "shopcouture") {
    //     tituloRevendedor = {Moda: "Seja um Revendedor",Lingerie: "Seja um Revendedor"}
    // }
    // objLinks.push({
    //     nome: tituloRevendedor[objLoja.categoriaLoja],
    //     url: "/cadastro"
    // });


    // itens institucionais
    $.each(objInstitucional, function(index, value){
        objLinks.push({
            id: value.id,
            nome: value.titulo,
            url: (value.url) ? value.url : montaUrlInstitucional(value),
        })
    });

    // Item remover conta
    if (bodyData.app != "N") {
        if (objLoja.url_android != null && objLoja.url_ios != null) {
            objLinks.push({
                nome: global_traducao.remover_conta.titulo,
                url: "/login?lgpd=removerdados"
            });
        }
    }

    var footer = $("footer");
    var ul = footer.find(".institucional");

    // montando elementos
    $.each(objLinks, function(index, value){
        var link = $("<a>").attr("href", value.url);
        var li = $("<li>").html(value.nome+'<i class="fal fa-plus"></i>');

        if (value.id != undefined) {
            li.attr({
                'data-id': value.id,
                'data-nome': value.nome,
            })
        }

        ul.append(link.append(li));
    });

}
function montaUrlInstitucional(value){
    var titulo = value.titulo;
    var pagina = "/institucional?conteudo"+value.id;

    if (value.tipo == "3"){
        var pagina = "politica-de-privacidade";
    }
    return pagina;
}

function abreFooter_MidiasSociais(obj){
    var conta = 0;
    $.each(obj, function(index, value){
        if (value.nome != "" && value.nome != null) {
            var aLink = $("<a>").attr("href", value.path+value.nome).attr("target", "_blank");
            var li = $("<li>").addClass(value.icone+" icon-redessociais");
            $("#ul_midiasSociais").append(aLink);
            aLink.append(li);
            conta++;
        }
    });
    if (conta == 0) {
        var aLink = $("<a>");
        var li = $("<li>").attr("title", "MÍDIAS SOCIAIS").addClass("fal fa-question icon-redessociais");
        $("#ul_midiasSociais").append(aLink);
        aLink.append(li);
    }
}
function abreFooter_AppStore(obj){
    var conta = 0;
    $.each(obj, function(index, value){
        if (value.url != "" && value.url != null) {
            var aLink = $("<a>").attr("href", value.url).attr("target", "_blank");
            var li = $("<li>").html(value.icone);
            $("#ul_appStore").append(aLink);
            aLink.append(li);
            conta++;
        }
    });
    if (conta == 0) {
        $("#ul_appStore").parent().remove();
        $(".container-infos-geral .midias-sociais ul").css({
            'border': 'none',
            'margin-bottom': '2em'
        });
    }
}


function criaObjeto_GlobalFooterLoja (obj){
    var obj = {
        nome: obj.Loj_Nome,
        cnpj: obj.Loj_CNPJ,
        endereco1: obj.Loj_Endereco+", "+obj.Loj_Numero,
        endereco2: obj.Loj_Bairro+", "+obj.Loj_Cidade+"/"+obj.Loj_UF,
        cep: obj.Loj_CEP,
        telefone: '+'+obj.Loj_Telefone,
        whatsapp: '+'+obj.Loj_Whatsapp,
        email: obj.Loj_Email,
    }
    return obj;
}
function criaObjeto_MidiasSociais(obj){
    var objMidiasSociais = {
        facebook: {
            path: "https://www.facebook.com/",
            nome: obj.Loj_Facebook,
            icone: "fab fa-facebook-f"
        },
        instagram: {
            path: "https://www.instagram.com/",
            nome: obj.Loj_Instagram,
            icone: "fab fa-instagram"
        },
        youtube: {
            path: "https://www.youtube.com/channel/",
            nome: obj.Loj_Youtube,
            icone: "fab fa-youtube"
        },
        twitter: {
            path: "https://twitter.com/",
            nome: obj.Loj_Twitter,
            icone: "fab fa-twitter"
        }
    }
    return objMidiasSociais;
}

function criaObjeto_AppStore(obj){
    return {
        applestore: {
            url: obj.url_ios,
            icone: '<svg viewBox="0 0 151 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h151v56H0V0z" fill="#000"></path><path d="M50.68 14.95V22h2.37c2.1 0 3.33-1.3 3.33-3.53 0-2.21-1.24-3.52-3.33-3.52h-2.37zm.88.8H53c1.6 0 2.49.97 2.49 2.73 0 1.75-.89 2.73-2.49 2.73h-1.43v-5.46h-.01zM57.88 22h.85v-5.08h-.85V22zm.43-5.98a.53.53 0 100-1.06.53.53 0 000 1.06zm1.98 2.3c0 .74.47 1.18 1.42 1.41l.8.2c.59.14.79.35.79.71 0 .46-.42.75-1.11.75-.7 0-1.08-.27-1.19-.85h-.84c.1.95.84 1.55 2.03 1.55 1.13 0 1.96-.63 1.96-1.51 0-.73-.37-1.13-1.4-1.38l-.8-.2c-.56-.13-.82-.37-.82-.72 0-.45.4-.75 1.03-.75.62 0 1.01.32 1.08.86h.8c-.03-.9-.77-1.56-1.88-1.56-1.1 0-1.87.62-1.87 1.5v-.01zM68 16.83c-.73 0-1.32.38-1.64.95h-.02v-.86h-.8v6.77h.85v-2.52h.02c.3.56.89.92 1.61.92 1.28 0 2.16-1.04 2.16-2.63 0-1.6-.88-2.63-2.18-2.63zm-.16 4.51c-.87 0-1.46-.75-1.46-1.88s.59-1.88 1.46-1.88c.9 0 1.47.73 1.47 1.88s-.57 1.88-1.47 1.88zm5.8.75c1.4 0 2.35-1.01 2.35-2.63 0-1.62-.95-2.63-2.35-2.63-1.4 0-2.35 1.01-2.35 2.63 0 1.62.94 2.63 2.35 2.63zm0-.75c-.9 0-1.49-.68-1.49-1.88 0-1.2.6-1.88 1.5-1.88.89 0 1.47.68 1.47 1.88 0 1.2-.58 1.88-1.48 1.88zm3.7.66h.86v-2.99c0-.86.52-1.42 1.32-1.42.78 0 1.17.45 1.17 1.27V22h.85v-3.3c0-1.15-.65-1.87-1.76-1.87-.79 0-1.33.36-1.61.9h-.02v-.8h-.8V22h-.01zm5.83 0h.85v-5.08h-.85V22zm.76-5.81l1.14-1.47h-.93l-.87 1.47h.66zm5.9.73h-.89l-1.4 4.18h-.02l-1.4-4.18h-.9L87.1 22h.87l1.87-5.08h-.01zm3.06.65c.8 0 1.33.6 1.35 1.46h-2.76c.05-.85.61-1.46 1.4-1.46h.01zm1.33 2.97c-.14.48-.62.81-1.26.81-.91 0-1.48-.64-1.48-1.61v-.05h3.64v-.32c0-1.54-.85-2.54-2.22-2.54-1.4 0-2.3 1.07-2.3 2.65 0 1.6.89 2.6 2.34 2.6 1.1 0 1.97-.65 2.11-1.54h-.83zm2.3 1.46h.85v-7.05h-.85V22zm5.05 0h.85v-2.99c0-.86.52-1.42 1.32-1.42.78 0 1.17.45 1.17 1.27V22h.85v-3.3c0-1.15-.65-1.87-1.76-1.87-.78 0-1.33.36-1.61.9h-.02v-.8h-.8V22zm7.45-.63c-.61 0-1.02-.32-1.02-.8 0-.48.4-.79 1.08-.83l1.35-.08v.41c0 .73-.61 1.3-1.41 1.3zm-.2.72c.7 0 1.34-.38 1.64-.96h.02V22h.8v-3.51c0-1.01-.75-1.66-1.94-1.66-1.2 0-1.95.68-2.01 1.56h.82c.1-.5.52-.8 1.17-.8.7 0 1.11.36 1.11.98V19l-1.45.08c-1.17.07-1.84.62-1.84 1.48 0 .92.68 1.53 1.69 1.53h-.01z" fill="#F5F5F5"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M35.62 14.22a5.48 5.48 0 01-1.32 4 4.92 4.92 0 01-3.83 1.76 5.22 5.22 0 011.35-3.86 5.95 5.95 0 013.8-1.9zm4.71 8.53c-.16.09-2.82 1.63-2.79 4.76A5.52 5.52 0 0041 32.56c-.02.1-.53 1.8-1.8 3.55-1.06 1.54-2.17 3.04-3.94 3.07-.83.02-1.4-.22-2-.46a5.37 5.37 0 00-4.63.02c-.56.22-1.1.45-1.86.48-1.68.06-2.97-1.64-4.07-3.17-2.2-3.1-3.9-8.75-1.61-12.6a6.33 6.33 0 015.3-3.13c.924.04 1.831.261 2.67.65.61.24 1.16.45 1.6.45.4 0 .93-.2 1.55-.44.98-.38 2.17-.84 3.4-.71.83.02 3.2.32 4.72 2.48zm54.26 15.49c.79-.7 1.18-1.6 1.18-2.7 0-.9-.27-1.65-.8-2.25a6.6 6.6 0 00-2.54-1.58 6.99 6.99 0 01-1.94-1c-.41-.34-.62-.76-.62-1.28 0-.46.18-.85.54-1.17.42-.36 1-.54 1.76-.54.95 0 1.8.2 2.56.6l.53-1.7a6.63 6.63 0 00-3.03-.62c-1.36 0-2.45.34-3.27 1.02a3.26 3.26 0 00-1.23 2.63c0 1.63 1.17 2.88 3.5 3.72.87.31 1.48.65 1.85 1 .37.37.55.81.55 1.34 0 .6-.22 1.07-.67 1.42-.45.35-1.07.53-1.88.53a5.98 5.98 0 01-3.1-.83l-.49 1.74c.87.54 2.03.8 3.46.8 1.56 0 2.77-.37 3.64-1.13zm-35.6.94h2.28L56.95 26.2H54.3l-4.3 13h2.22l1.19-3.82h4.33l1.26 3.8h-.01zm-2.75-8.8l1.13 3.39h-3.59l1.11-3.4c.3-1.08.5-1.9.64-2.44h.04c.33 1.28.55 2.1.67 2.44v.01zM71 38.15a5.24 5.24 0 001.32-3.78c0-1.42-.38-2.57-1.14-3.45a3.61 3.61 0 00-2.84-1.3c-1.45 0-2.53.55-3.25 1.67h-.04l-.12-1.49h-1.88c.05 1.06.08 2.09.08 3.09V43h2.14v-4.94h.04c.56.9 1.47 1.33 2.73 1.33 1.18 0 2.16-.4 2.96-1.23v-.01zm-1.5-5.95c.42.6.63 1.35.63 2.26a3.9 3.9 0 01-.67 2.39c-.45.6-1.08.9-1.88.9-.69 0-1.24-.23-1.67-.7a2.46 2.46 0 01-.65-1.72v-1.57c0-.16.03-.37.1-.63a2.36 2.36 0 012.28-1.85c.78 0 1.4.3 1.86.92zm13.88 2.18c0 1.6-.44 2.86-1.32 3.78a3.93 3.93 0 01-2.95 1.23c-1.27 0-2.18-.44-2.74-1.33h-.04V43H74.2V32.9c0-1-.02-2.03-.07-3.09H76l.12 1.49h.04a3.59 3.59 0 013.24-1.68c1.14 0 2.09.44 2.85 1.31a5.09 5.09 0 011.13 3.45zm-2.17.08c0-.91-.22-1.66-.64-2.26a2.2 2.2 0 00-1.86-.92 2.36 2.36 0 00-2.28 1.85c-.06.26-.1.47-.1.63v1.57c0 .68.22 1.25.65 1.72.42.47.98.7 1.67.7.8 0 1.43-.3 1.88-.9.45-.6.68-1.4.68-2.39zm21.63-3.08h-2.36v4.55c0 1.15.41 1.73 1.25 1.73.38 0 .7-.03.95-.1l.06 1.58c-.43.16-.98.23-1.67.23a2.596 2.596 0 01-1.98-.75c-.47-.5-.71-1.34-.71-2.52v-4.73h-1.4v-1.56h1.4V28.1l2.1-.62v2.33h2.36v1.57zm9.37 6.59a5.054 5.054 0 001.26-3.55c0-1.4-.4-2.54-1.23-3.43-.86-.91-2-1.37-3.4-1.37-1.47 0-2.64.47-3.5 1.4a5.006 5.006 0 00-1.3 3.56 4.903 4.903 0 001.26 3.45 4.365 4.365 0 003.38 1.36c1.46 0 2.64-.47 3.53-1.42zm-1.53-5.7c.38.61.57 1.35.57 2.22 0 .86-.2 1.61-.59 2.24a2.153 2.153 0 01-1.92 1.14c-.83 0-1.48-.37-1.94-1.12-.399-.67-.6-1.44-.58-2.22 0-.9.2-1.65.58-2.26a2.161 2.161 0 011.96-1.12c.83 0 1.47.37 1.92 1.12zm9.75-.63a3.817 3.817 0 00-.68-.05c-.75 0-1.33.27-1.74.83-.36.49-.54 1.1-.54 1.85v4.91h-2.14l.02-6.42c0-1.07-.02-2.06-.08-2.94h1.87l.08 1.79h.05c.23-.62.59-1.11 1.07-1.49.48-.33 1-.5 1.55-.5.2 0 .38.02.53.04v1.98h.01zm9.48 3.36c.06-.26.08-.57.08-.94 0-1.17-.28-2.16-.85-2.95-.71-1-1.76-1.5-3.15-1.5-1.41 0-2.53.5-3.36 1.5a5.273 5.273 0 00-1.2 3.52c0 1.44.43 2.59 1.28 3.44a4.759 4.759 0 003.52 1.29c1.24 0 2.32-.2 3.23-.58l-.34-1.45c-.78.3-1.64.45-2.6.45-.85 0-1.55-.22-2.1-.66-.59-.49-.9-1.2-.93-2.12h6.42zm-2.37-3.08c.28.45.42.98.41 1.6h-4.45c.06-.63.27-1.17.63-1.62.43-.57 1-.85 1.7-.85.77 0 1.33.29 1.7.87h.01z" fill="#F5F5F5"></path></svg>'
        },
        googleplay: {
            url: obj.url_android,
            icone: '<svg viewBox="0 0 151 56" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h151v56H0V0z" fill="#000"></path><path d="M75.65 29.38c-2.39 0-4.34 1.81-4.34 4.3a4.261 4.261 0 004.34 4.28c2.4 0 4.35-1.82 4.35-4.29a4.25 4.25 0 00-4.35-4.29zm0 6.9c-1.31 0-2.44-1.07-2.44-2.6 0-1.55 1.13-2.61 2.44-2.61s2.44 1.06 2.44 2.6-1.14 2.6-2.44 2.6v.01zm-9.48-6.9c-2.4 0-4.35 1.81-4.35 4.3a4.26 4.26 0 004.35 4.28c2.39 0 4.34-1.82 4.34-4.29a4.25 4.25 0 00-4.34-4.29zm0 6.9c-1.32 0-2.45-1.07-2.45-2.6 0-1.55 1.13-2.61 2.45-2.61 1.3 0 2.44 1.06 2.44 2.6s-1.13 2.6-2.44 2.6v.01zM54.89 30.7v1.81h4.4a3.82 3.82 0 01-1 2.3 4.501 4.501 0 01-3.4 1.32 4.8 4.8 0 01-4.82-4.84 4.799 4.799 0 014.83-4.84c1.45 0 2.52.56 3.3 1.3l1.3-1.28a6.44 6.44 0 00-4.61-1.84 6.79 6.79 0 00-6.82 6.67 6.8 6.8 0 006.82 6.67c2 0 3.5-.64 4.69-1.87a6 6 0 001.59-4.25c0-.43-.03-.82-.1-1.14h-6.18v-.01zM101 32.1c-.36-.95-1.46-2.73-3.7-2.73s-4.09 1.74-4.09 4.3c0 2.4 1.83 4.28 4.3 4.28a4.3 4.3 0 003.6-1.9l-1.48-.97a2.47 2.47 0 01-2.12 1.19 2.2 2.2 0 01-2.1-1.3l5.79-2.38-.2-.48v-.01zm-5.9 1.44a2.36 2.36 0 012.25-2.5c.76 0 1.4.37 1.61.9l-3.87 1.6h.01zm-4.71 4.16h1.9V25.09h-1.9v12.62-.01zm-3.11-7.37h-.08a3.001 3.001 0 00-2.28-.96 4.29 4.29 0 00-4.15 4.31c0 2.4 1.99 4.28 4.15 4.28 1.03 0 1.86-.45 2.28-.98h.07v.62c0 1.64-.89 2.52-2.31 2.52a2.4 2.4 0 01-2.18-1.52l-1.66.68a4.12 4.12 0 003.84 2.54c2.22 0 4.1-1.3 4.1-4.47v-7.71h-1.8v.7h.02v-.01zm-2.2 5.94c-1.3 0-2.4-1.1-2.4-2.59 0-1.51 1.1-2.61 2.4-2.61 1.3 0 2.32 1.1 2.32 2.61 0 1.5-1.01 2.59-2.31 2.59h-.01zm24.83-11.19h-4.55V37.7h1.9v-4.78h2.66c2.11 0 4.18-1.52 4.18-3.92s-2.09-3.92-4.19-3.92zm.04 6.08h-2.7v-4.33h2.7a2.204 2.204 0 012.07 1.326c.115.266.176.553.18.844 0 .99-.8 2.17-2.23 2.17l-.02-.01zm11.75-1.8c-1.37 0-2.8.6-3.39 1.92l1.69.7c.36-.7 1.03-.93 1.73-.93.98 0 1.98.58 2 1.62v.13a4.276 4.276 0 00-1.99-.48c-1.82 0-3.66.99-3.66 2.84 0 1.68 1.48 2.77 3.15 2.77 1.27 0 1.99-.56 2.42-1.23h.06v.98h1.84v-4.84c0-2.24-1.68-3.49-3.85-3.49v.01zm-.23 6.9c-.63 0-1.49-.3-1.49-1.06 0-.97 1.08-1.35 2.02-1.35.83 0 1.23.19 1.72.43a2.286 2.286 0 01-2.25 1.99v-.01zm10.77-6.63l-2.18 5.47H130l-2.26-5.47h-2.05l3.39 7.64-1.93 4.25h1.98l5.22-11.9h-2.12l.01.01zm-17.1 8.07h1.9V25.09h-1.9v12.62-.01z" fill="#F5F5F5"></path><path d="M16.92 15.04c-.3.32-.47.8-.47 1.42v22.32c0 .62.18 1.1.47 1.41l.07.07 12.61-12.5v-.28L17 14.97l-.08.07z" fill="url(#paint0_linear)"></path><path d="M33.8 31.94l-4.2-4.17v-.3l4.2-4.17.1.05 4.98 2.8c1.42.8 1.42 2.11 0 2.92l-4.98 2.8-.1.07z" fill="url(#paint1_linear)"></path><path d="M33.9 31.88l-4.3-4.26-12.68 12.57c.47.5 1.24.56 2.12.06l14.86-8.37z" fill="url(#paint2_linear)"></path><path d="M33.9 23.36l-14.87-8.38c-.88-.5-1.65-.43-2.12.06l12.7 12.58 4.29-4.26z" fill="url(#paint3_linear)"></path><path opacity=".2" d="M33.8 31.79L19.04 40.1c-.83.46-1.57.43-2.04.01l-.07.07.07.07c.48.43 1.21.46 2.04 0l14.87-8.38-.1-.1-.01.02z" fill="#000"></path><path opacity=".12" d="M16.92 40.05c-.3-.31-.47-.8-.47-1.41v.15c0 .62.18 1.1.47 1.41l.07-.07-.07-.08zm21.96-11.12l-5.08 2.86.09.09 4.98-2.8c.7-.41 1.06-.94 1.06-1.46-.05.47-.4.95-1.05 1.3v.01z" fill="#000"></path><path opacity=".25" d="M19.03 15.12l19.85 11.19c.64.36 1 .82 1.06 1.3 0-.52-.35-1.05-1.06-1.45L19.03 14.98c-1.43-.8-2.59-.13-2.59 1.49v.15c0-1.63 1.17-2.3 2.59-1.5z" fill="#fff"></path><path d="M48.37 20.55V14.5h1.88c.93 0 1.69.28 2.25.84.55.56.84 1.29.84 2.19 0 .9-.29 1.62-.84 2.19a3.1 3.1 0 01-2.26.83h-1.87zm.79-.74h1.08c.7 0 1.26-.2 1.67-.6.42-.41.63-.97.63-1.7 0-.71-.2-1.26-.63-1.67a2.3 2.3 0 00-1.67-.6h-1.08v4.57zm5.28.74V14.5h.78v6.05h-.78zm3.9.14c-.45 0-.88-.15-1.3-.44a2 2 0 01-.84-1.21l.71-.28c.08.33.26.61.52.84.27.23.56.34.9.34.33 0 .63-.1.87-.26a.85.85 0 00.37-.73c0-.33-.12-.6-.37-.78a3.86 3.86 0 00-1.15-.51 3.12 3.12 0 01-1.23-.66c-.27-.27-.42-.6-.42-1.03 0-.43.18-.8.52-1.13.35-.32.8-.48 1.36-.48a2 2 0 011.26.38c.32.25.54.54.63.84l-.71.3c-.05-.2-.18-.38-.38-.54-.2-.16-.46-.25-.78-.25-.3 0-.56.09-.78.26a.76.76 0 00-.31.62c0 .22.1.42.3.58.19.15.48.29.86.41.3.1.55.2.75.28.2.1.4.22.61.37.2.15.37.33.47.55a1.858 1.858 0 01-.02 1.57c-.12.23-.28.41-.49.54a2.27 2.27 0 01-1.35.41v.01zm3.95-.14h-.79V14.5h2.08c.52 0 .97.17 1.34.51.38.35.57.77.57 1.3 0 .51-.19.94-.57 1.29-.37.34-.82.51-1.34.51h-1.3v2.44h.01zm0-3.2h1.31c.33 0 .6-.1.8-.33.2-.22.29-.46.29-.72 0-.27-.1-.5-.3-.73-.2-.22-.46-.33-.79-.33h-1.31v2.12-.01zm9.19 2.42a3 3 0 01-2.24.92 3.08 3.08 0 01-3.13-3.16c0-.88.29-1.64.89-2.24a3 3 0 012.24-.92 3.1 3.1 0 013.15 3.16c0 .88-.31 1.63-.91 2.24zm-3.9-.5c.45.45 1 .67 1.66.67.65 0 1.21-.22 1.66-.68.45-.45.68-1.03.68-1.73a2.328 2.328 0 00-2.34-2.42c-.65 0-1.21.23-1.66.68a2.37 2.37 0 00-.68 1.74c0 .7.23 1.28.68 1.73v.01zm5.9 1.28V14.5h.96l2.97 4.71h.03l-.03-1.17V14.5h.79v6.05h-.82l-3.1-4.93h-.03l.03 1.17v3.76h-.8zm6.12 0V14.5h.77v6.05h-.78.01zm.72-6.53h-.68l.45-1.07h.85l-.62 1.07zm2.97 6.53l-2.15-6.05H82l1.67 4.91h.03l1.75-4.91h.87l-2.22 6.05h-.81zm7.49-5.3H88v1.91h2.5v.73H88v1.92h2.78v.74H87.2V14.5h3.57v.75h.01zm1.22 5.3V14.5h.78v5.3h2.65v.75H92zm6.46 0V14.5h.96l2.97 4.71h.03l-.03-1.17V14.5h.78v6.05h-.81l-3.1-4.93h-.03l.03 1.17v3.76h-.8zm11.11-.78a2.997 2.997 0 01-2.24.92 3.087 3.087 0 01-2.921-1.944 3.102 3.102 0 01-.219-1.216c0-.88.3-1.64.9-2.24a2.997 2.997 0 012.24-.92 3.1 3.1 0 013.14 3.16 3.094 3.094 0 01-.9 2.24zm-3.9-.5c.45.45 1 .67 1.66.67.65 0 1.2-.22 1.66-.68.45-.45.68-1.03.68-1.73a2.32 2.32 0 00-.653-1.71 2.334 2.334 0 00-1.687-.71c-.65 0-1.21.23-1.66.68a2.377 2.377 0 00-.68 1.74c0 .7.23 1.28.68 1.73v.01z" fill="#F5F5F5"></path><defs><linearGradient id="paint0_linear" x1="28.48" y1="16.22" x2="11.55" y2="33.31" gradientUnits="userSpaceOnUse"><stop offset=".01" stop-color="#00A1FF"></stop><stop offset=".26" stop-color="#00BEFF"></stop><stop offset=".51" stop-color="#00D2FF"></stop><stop offset=".76" stop-color="#00DFFF"></stop><stop offset="1" stop-color="#00E3FF"></stop></linearGradient><linearGradient id="paint1_linear" x1="40.73" y1="27.62" x2="16.1" y2="27.62" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE000"></stop><stop offset=".41" stop-color="#FFBD00"></stop><stop offset=".78" stop-color="orange"></stop><stop offset="1" stop-color="#FF9C00"></stop></linearGradient><linearGradient id="paint2_linear" x1="31.56" y1="29.93" x2="8.6" y2="53.1" gradientUnits="userSpaceOnUse"><stop stop-color="#FF3A44"></stop><stop offset="1" stop-color="#C31162"></stop></linearGradient><linearGradient id="paint3_linear" x1="13.72" y1="7.61" x2="23.98" y2="17.96" gradientUnits="userSpaceOnUse"><stop stop-color="#32A071"></stop><stop offset=".07" stop-color="#2DA771"></stop><stop offset=".48" stop-color="#15CF74"></stop><stop offset=".8" stop-color="#06E775"></stop><stop offset="1" stop-color="#00F076"></stop></linearGradient></defs></svg>'
        }
    }
}

function converteObjCondicoesFreteEmArrayValores(str){
    // console.log(str);
    if(str===null || str==="[]" || str==="") {
        return false;
    }
    var por_estado=[];
    var arr_gratis=[];
    var arr_fixo=[];
    $.each(JSON.parse(str), function(ind, val){
        por_estado[val.estado] = val;

        var float_gratis = parseFloat(val.gratis);
        if (arr_gratis.indexOf(float_gratis) < 0) {
            arr_gratis.push(float_gratis);
        }

        var float_fixo = parseFloat(val.fixo);
        if (arr_fixo.indexOf(float_fixo) < 0) {
            arr_fixo.push(float_fixo);
        }

    });
    return {
        por_estado: por_estado,
        gratis: arr_gratis.sort(function(a,b) { return a - b;}),
        fixo: arr_fixo.sort(function(a,b) { return a - b;}),
    }
}
