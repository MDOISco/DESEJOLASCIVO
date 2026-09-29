
var global_getUrlIdProduto = getIdProdutoDaUrl();

$(function(){

    //verifica se o acesso foi feito com o "loja.asp" (via antigo)
    if (global_getUrlIdProduto == "loja") {
        //redireciona pq não existe a esse produto
        window.location = location.origin;
    } else {
        //carregando o produto da pagina
        carregaProduto(global_getUrlIdProduto, getUrlProdutoDaUrl());
    }

});

//funções
function carregaProduto(idproduto, urlProduto){
    var obj = {
        token: "VmpKNGIySXlUa2RpU0ZKWFlXdGFjRll3Vmt0T1ZteHhVMnhPVGxZeFNrbFVNV1IzWVZVeGNWSnFUbHBoTWxKWVZGVmtTMDB4UWxWTlJEQTk=",
        id: idproduto,
        tag: urlProduto,
    }

    $.get("json/", obj, function(data){

        var response = JSON.parse(data);

        if (response.erro != undefined){
            $(".container-produto").removeClass('carregando').css('display', 'block');
            montaContainerSemProdutos($(".container-produto"), response.erro);
            return;
        }

        montaProduto(response);

    });
}
function carregaProdutosRelacionados(ids){
    // var liCarregandoProdutosRelacionados = $("<li>").attr("id", "carregandoProdutosRelacionados").append($("<span>").addClass("fa-duotone fa-spinner fa-spin"));
    // $("#ulProdutosRelacionados").append(liCarregandoProdutosRelacionados)
    var obj = {
        token: "VmpKNGIySXlUa2RpU0ZKWFltMVNjVmxzVW5OamJIQkhZVVpPYTJKVk1UWlZNakUwWVZaSmQxZHVSbHBXYlUweFdrWmFjMWRHVm5WWGJYQnJaV3BCTlE9PQ==",
        ids: ids
    }
    $.post("json/?token=VmpKNGIySXlUa2RpU0ZKWFltMVNjVmxzVW5OamJIQkhZVVpPYTJKVk1UWlZNakUwWVZaSmQxZHVSbHBXYlUweFdrWmFjMWRHVm5WWGJYQnJaV3BCTlE9PQ", {ids: ids}, function(data){
        var json = JSON.parse(data);
        if (json.produtos.conteudo.length > 0) {
            $('.produtos-relacionados .titulo-sessao').css('display', 'block');
            montaProdutosRelacionados(json.produtos);
        }
    }).fail(function(){
        exeAjaxRequest("fail", {});
    }).always(function(){
        exeAjaxRequest("always", {});
    });
}
function montaProdutosRelacionados(json){
    for (var i = 0; i < json.totalReg; i++) {
        var produto = json.conteudo[i];
        montaLiProdutoComVideo("#ulProdutosRelacionados", produto);
    }
    $("#carregandoProdutosRelacionados").remove();
    // initialAcoesBtnProduto();
    initialSlickProdutosRelacionados();
}
function montaLsProdutosAcessadosParaRelacionados(){
    var produtos = JSON.parse(getLocalstorage_ProdutosAcessados());
    var arrIdsUnicos = [];
    for (var i = (produtos.length-1); i >= 0; i--){
        if ($.inArray(produtos[i].idproduto, arrIdsUnicos) < 0 && produtos[i].idproduto != global_getUrlIdProduto) { //ja tem
            arrIdsUnicos.push(produtos[i].idproduto);
        }
    }
    return arrIdsUnicos.toString();
}
function montaMenuNavegacao(menu){
    var getStorageHistory = processaStorageHistory("GET");

    var ul = $("<ul>");

    if (getStorageHistory == null) {
        var obj_liInicio = {texto: "INÍCIO", link: "/"};
    } else {
        var obj_liInicio = {texto: "VOLTAR", link: getStorageHistory[0]};
    }

    var section = $(".menu-navegacao");
    var aInicio = $("<a>").attr("href", obj_liInicio.link).text(obj_liInicio.texto);
    var liInicio = $("<li>").append(aInicio);
    var aGenero = $("<a>").attr("href", "/generos/"+replaceAll(removerAcentos(menu.generoDesc.toLowerCase())," ", "-")+"-"+menu.generoID+".html").text(menu.generoDesc);
    var liGenero = $("<li>").append(aGenero);
    var aCategorias = $("<a>").attr("href", "/categorias/"+replaceAll(removerAcentos(menu.categoriaDesc.toLowerCase())," ", "-")+"-"+menu.categoriaID+".html").text(menu.categoriaDesc);
    var liCategorias = $("<li>").append(aCategorias);
    var aColecao = $("<a>").attr("href", "/colecoes/"+replaceAll(removerAcentos(menu.colecaoDesc.toLowerCase())," ", "-")+"-"+menu.colecaoID+".html").text(menu.colecaoDesc);
    var liColecao = $("<li>").append(aColecao);

    section.append(ul);
    ul.append(liInicio);
    ul.append(liGenero);
    ul.append(liCategorias);
    ul.append(liColecao);
}
function montaProduto(json){
    console.log(json)
    //variaveis
    var search = searchToObject();
    
    var produto = json.produtos.conteudo[0];
    var sacola = json.sacola.conteudo;
    var supervitrine = json.supervitrine;
    var supersacola = json.supersacola;
    var tela = verificaTipoResolucaoPagina();
    var verif_supervitrine=false;
    if (supervitrine !== undefined) {
        if (supervitrine.totalReg > 0) {
            verif_supervitrine=true;
        }
    }

    var objDetalhesProduto = montaObjDetalhesProduto(produto);

    var infos = $(".produto-infos");
    idsProdutosRelacionados = produto.relacionados;
    if (idsProdutosRelacionados != "") {
        $("#ulProdutosRelacionados").attr('data-relacionados', 'sim');
    }

    //montando pagina do produto
    montaMenuNavegacao(produto.menu.conteudo[0]);

    //grava no localstorage o produto acessado
    var dataHoje = transformarEmdata("hoje");
    var dataCompleta = dataHoje.ano+"-"+dataHoje.mes+"-"+dataHoje.dia
    var objProdutoAcessado = {idproduto: produto.codigo, data: dataCompleta, precoAtacado:produto.precoAtacado}
    setLocalstorage_ProdutosAcessados(objProdutoAcessado);

    var objFotoDefault=produto.fotos.conteudo[0];
    //foto principal
    if ($.isNumeric(search.estampa)) {
        $.each(produto.fotos.conteudo, function(ind, val){
            if (val.descricao == search.estampa) {
                objFotoDefault = val;
            }
        });
    }

    var fotoZoom = alterarTamanhoDaFotoDoProduto(objFotoDefault.arquivo);

    //informações do produto
    infos.find(".titulo").text(produto.descricao);
    infos.find(".referencia").text("Ref.: "+produto.referencia);


    montaElemTagsDeUmProduto(produto, {after:$('.container-produto .referencia'), tooltip:false});
    montaContMiniDetalhesProduto(objDetalhesProduto);
    // var sectionPreco = montaSectionPreco(produto);
    var sectionPreco = montaSectionPrecoProduto(produto.objSectionPrecos);


    if (tela.tipoTela == "mobile") {
        infos.append(sectionPreco);
    } else {
        // infos.find('.mini-detalhes-produto').after(sectionPreco);
        infos.append(sectionPreco);
    }


    //Add as estampas nas infos do produto
    var id_produro_acessado = global_getUrlIdProduto;
    var container_infosEstampas = $('<ul>').addClass('cont-estampas');
    $.each(produto.estampas.conteudo, function(ind, val){
        var css_estampa = verificaRetornoCssEstampaCor(val.textoPrincipal);
        var li_estampa = $('<li>').attr({
            'data-codigoestampa': val.codigo,
        });
        var estampa = $('<a>').css(css_estampa.attr, css_estampa.cont).attr({
            'data-descricaoestampa': val.descricao,
        });

        var link_estampa = 'javascript:void(0)';
        if (verif_supervitrine) {
            if (id_produro_acessado != val.idproduto) {
                link_estampa = montaUrlProdutoDetalhar(val.descricaoproduto, val.idproduto)+'?estampa='+val.codigo;
            }
        }

        estampa.attr("href", link_estampa);

        if (objFotoDefault.descricao == val.codigo) {
            li_estampa.addClass('acessando');
        }

        li_estampa.append(estampa)
        container_infosEstampas.append(li_estampa);

    });
    
    infos.find('#fotosProdutos').before(container_infosEstampas);

    
    $('.cont-estampas li').click(function(){
        // qdo -1 se trata do link do outro produto (supervitrine)
        if ($(this).find('a').attr('href').indexOf('void') == -1) {
            return;
        }
        
        $(this).parent().find('li').removeClass('acessando');
        $(this).addClass('acessando');
        var cod_estampa = $(this).attr('data-codigoestampa');

        // da um click na foto miniatura no carrossel (slick) para abrir a foto no zoom
        abreFotoDoSlickParaZoomClickNaEstampa(cod_estampa);

        $('#tabelaEstoque tbody tr, table.tabela-estoque.estampas tr').removeClass('sel-estampa-foto');
        $('#tabelaEstoque tbody tr[data-idestampa="'+cod_estampa+'"], table.tabela-estoque.estampas tbody tr[data-idestampa="'+cod_estampa+'"]').addClass('sel-estampa-foto');

    });
    

    // var content_nomeDaFoto = montaElemContentNomeDaFoto(descricao_foto);
    var sectionFotoPrincipal = $("<section>").addClass("foto-principal").attr('data-estampa-foto', objFotoDefault.descricao);
    var imgFotoPrincipal = $("<img>").attr("id","fotoPrincipal").attr("data-zoom-image", fotoZoom).attr("src", fotoZoom).attr("alt", produto.descricao);

    // sectionFotoPrincipal.append(content_nomeDaFoto.css('font-size','0.7em'))
    sectionFotoPrincipal.append(imgFotoPrincipal)
    $(".produto-foto").append(sectionFotoPrincipal);

    //miniaturas dos produtos
    montaMiniaturasProduto(produto, objFotoDefault); //monta as miniaturas já no elemento correto
    montaMiniaturasVideo(produto.videoProduto, produto.videoAtacado, objFotoDefault.arquivo, produto.exibevideoAtacado); //monta as miniaturas já no elemento correto

    //tabela estoque
    montaTabelaEstoque($("#containerEstoque"), produto, supervitrine.conteudo, sacola, function(){}, function(){});

    //criando content com a estampa da foto
    if ((tela.tipoTela == "mobile")) {
        var container_fotos = $('#fotosProdutos a[data-descricao="'+objFotoDefault.descricao+'"]');
    } else {
        var container_fotos = $(".produto-foto").find('.foto-principal');
    }

    montaElemContentEstampaDaFoto(objFotoDefault.descricao, container_fotos);

    //Detalhes do produto (rodape)
    montaContDetalhesProduto($('#tabsDetalhesProduto'), objDetalhesProduto);


    /**
     * Corrigir a mensagem para clientes que configuram exibição do preço de atacado.
     * Informação original retornada no json
     */
    if ($($('.container-produto .container-preco .msg-preco-produto p')[0]).text() == "ou "+$('.container-produto .container-preco .cont-preco .nome').text()) {
        $($('.container-produto .container-preco .msg-preco-produto p')[0]).text("somente no atacado")
    }


    setTimeout(function(){
        sendPixel('produto', {
            produto: produto
        });
    },3000);

    
    $(".carregando-produto").addClass("carregando-produto-off");
    $(".container-produto").removeClass("carregando").fadeIn("slow").css("display","inline-block");
    $(".cont-tabela-estoque").fadeIn("slow");

    //carrega todas as bibliotecas apos produto ser carregado na pagina DOM.
    initialLibsProduto(produto, objFotoDefault);
    initialMascarasCamposForm();

}
function ajustaTamanhoDeElementosDoProduto(){
    //coloca botao de finalizar compra do tamanho da tabela estoque
    var largTabelaEstoque = $("#tabelaEstoque").width();
    var getResolucao = verificaTipoResolucaoPagina();
    //executa somente quando:
    //não é mobile
    // largura da tabela é maior q a resolução
    // qdo exite largura no elemento da tabela estoque
    if (getResolucao.tipoTela == "desktop" && largTabelaEstoque < getResolucao.largura && largTabelaEstoque != null) {
        // $(".div_btnAddSacola").css("width", largTabelaEstoque+"px");
        $(".cont-tabelas").css("width", (largTabelaEstoque+5)+"px");
    }
}

function abreFotoDoSlickParaZoomClickNaEstampa(cod_estampa){
    var tela = verificaTipoResolucaoPagina();

    var elemSlick = $('a.slick-slide[data-descricao="'+cod_estampa+'"][role="option"]');
    elemSlick = (elemSlick.length>1)?$(elemSlick[0]):elemSlick;
    
    if (elemSlick.length == 0){
        var alturaElementoEstoque = $(".cont-tabela-estoque").offset().top;
        var scrollTela = alturaElementoEstoque - 50;
        $('html,body').animate({scrollTop: scrollTela}, 800);
    }

    var itensPorPagina = $('a.slick-slide[aria-hidden="false"]').length;   
    var slickIndex = parseInt(elemSlick.attr('data-slick-index'));

    if (tela.tipoTela != "mobile"){
        slickIndex = slickIndex+1;
    }

    var paginaMiniatura = Math.ceil((slickIndex / itensPorPagina));

    if (tela.tipoTela != "mobile"){
        paginaMiniatura = paginaMiniatura-1;
    }

    var elemDotsPagina = $('#slick-slide0'+paginaMiniatura);

    elemSlick.click();
    
    if (tela.tipoTela == "desktop") {
        $('#slick-slide0'+paginaMiniatura).click();
    } else {
        if (isNaN(paginaMiniatura) === false) {
            $('.fotos-produto').slick('slickGoTo', paginaMiniatura);
        }
    }

}

function montaObjDetalhesProduto(produto) {
    var traducao = leJsonInfosGeraisForms();
    var ret = [];
    var descricao = produto.descricaodoproduto;
    var tabelademedidas = produto.tabelademedidas;

    if (descricao !== "" && descricao !== null && descricao !== undefined && descricao !== false) {
        var oDescricao = {
            id: 'descricao',
            css_mini: 'descricao', //usado para acessar o plug-in tabsJs de outro elemento
            titulo: traducao.descricao_produto,
            icone: '<i class="fal fa-align-left"></i>',
            conteudo: descricao,
        }
        ret.push(oDescricao);

    }
    if (tabelademedidas !== null && tabelademedidas !== undefined && tabelademedidas !== false) {
        if (tabelademedidas.materia !== "") {
            var oTabelaMedidas = {
                id: 'tabelaMedidas',
                css_mini: 'tabela-medidas', //usado para acessar o plug-in tabsJs de outro elemento
                titulo: "Tabela de medidas",
                icone: '<i class="fal fa-ruler"></i>',
                conteudo: tabelademedidas.materia,
            }
            ret.push(oTabelaMedidas);
        }
    }
    return ret;
}
function montaContDetalhesProduto(elem, obj){
    if (obj.length > 0) {
        var ul_titulo = $('<ul>');
        var cont_conteudo = $('<div>');
        var oAddMenu = [];

        $.each(obj, function(ind, val){
            var li_titulo = $('<li>').html('<a href="#'+val.id+'">'+val.icone+val.titulo+'</a>');
            var conteudo = $('<div>').attr('id', val.id).html(val.conteudo);
            ul_titulo.append(li_titulo);
            cont_conteudo.append(conteudo);
            oAddMenu.push('.mini-detalhes-produto .'+val.css_mini);
        });

        elem.append(ul_titulo);
        elem.append(cont_conteudo);

        elem.tabsJs({
            // menuAlign: 'center',
            bordas: 'top',
            addMenu: oAddMenu,
        });
    }

}
function montaContMiniDetalhesProduto(obj){
    var container = $('.mini-detalhes-produto');
    $.each(obj, function(ind, val){
        var tela = verificaTipoResolucaoPagina();
        var content = $('<div>').addClass(val.css_mini).data('tabsjs-id', '#'+val.id).html(val.icone+val.titulo);
        container.append(content);
        content.click(function(){
            var tamanho_prodRelacionados = 0;
            var dif = 160;
            var elemRelacionados = $('#ulProdutosRelacionados').data('relacionados');
            if (elemRelacionados == 'sim' && $('#ulProdutosRelacionados *').length == 0) {
                tamanho_prodRelacionados = 800
                dif = 120;
                if (tela.tipoTela == "mobile") {
                    tamanho_prodRelacionados = 568;
                }
            }
            if (tela.tipoTela == "mobile") {
                dif = 60;
            }
            var top = ($('#'+val.id).parent().parent().offset().top + tamanho_prodRelacionados) - dif;

            setTimeout(function(){
                $('html, body').animate({ scrollTop: top}, 1000); //rola pagina ate a proxima sessao
            }, 200);
        });
    });
}
function montaElemContentSalvarFoto(){
    var container = $("<div>").addClass("btn-salvarFoto").html('<i class="fal fa-cloud-download"></i>SALVAR FOTO');
    return container;
}
function montaElemContentEstampaDaFoto(cod_estampa, container){
    var th_estampa = $('table.tabela-estoque.estampas tr[data-idestampa="'+cod_estampa+'"] th');
    $('.cont-estampa-foto').remove();

    //aqui
    $('li[data-codigoestampa]').removeClass("acessando");
    $('li[data-codigoestampa="'+cod_estampa+'"]').addClass("acessando");

    if (th_estampa.length == 0) {
        $('table.tabela-estoque.estampas tbody tr').removeClass('sel-estampa-foto');
    } else {

        $('table.tabela-estoque.estampas tbody tr').removeClass('sel-estampa-foto');
        th_estampa.parent().addClass('sel-estampa-foto');

        $.each(container, function(ind, val){
            var clone_estampa = th_estampa.clone().html();
            var cont_estampa = $("<div>").addClass("cont-estampa-foto").html(clone_estampa);
            $(container[ind]).append(cont_estampa);

            cont_estampa.click(function(){
                th_estampa.parent().removeClass('sel-estampa-foto');
                var tela = verificaTipoResolucaoPagina();
                var offset_th = th_estampa.parent().offset();
                var desc_altura = (tela.altura*40)/100;

                // destaca a linha da tabela do estoque da estampa
                $("html, body").animate({scrollTop:(offset_th.top-desc_altura)}, '500');
                setTimeout(function(){
                    th_estampa.parent().addClass('sel-estampa-foto');
                },600);
            });
        });

        // $('table.tabela-estoque.estampas tbody').on('mouseenter', function(){
        //     $(this).find('tr').addClass('sel-estampa-foto-hover');
        // });

        // $('table.tabela-estoque.estampas tbody').on('mouseleave', function(){
        //     $(this).find('tr').removeClass('sel-estampa-foto-hover');
        // });

    }
}
function montaElemContentNomeDaFoto(desc){
    var container = $("<div>").addClass("hover-nome-foto-zoom").text(desc);
    return container;

}
function clickSalvarFotoProduto(){
    var bodyData = getBodyData();
    var getSrc;
    if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
        var getTagsA = $(this).parent().find("a");
        $.each(getTagsA, function(){
            var __this = $(this);
            if (__this.attr("aria-hidden") == "false") {
                getSrc = __this.attr("data-zoom-image");
            }
        });
    } else {
        getSrc = $(this).parent().find("img").attr("src");
    }

    getSrc = "/upload/"+getSrc.split("/upload/")[1];

    var splitSrc = getSrc.split("/");
    var urlCompleta = location.origin;
    var nomeLoja = urlCompleta.split(".")[1];
    var foto = urlCompleta+"/"+getSrc;

    var a = document.createElement('a');
    a.href = foto;
    a.download = nomeLoja+"-"+splitSrc[(splitSrc.length-1)];
    document.body.appendChild(a);
    a.click();
}
function montaMiniaturasProduto(produto, objFotoDefault){
    var tela = verificaTipoResolucaoPagina();
    var fotosProdutos = $("#fotosProdutos");
    fotosProdutos.html("");

    $.each(produto.fotos.conteudo, function(index, value){

        if (tela.tipoTela == "mobile") {
            var fotoThumb = alterarTamanhoDaFotoDoProduto(value.arquivo);
        } else {
            var fotoThumb = alterarTamanhoDaFotoDoProduto(value.arquivo, 2);
        }
        var fotoZoom = alterarTamanhoDaFotoDoProduto(value.arquivo);
        var a = $("<a>").attr("href","javascript:void(0)").attr({
            'data-image': fotoZoom,
            'data-zoom-image': fotoZoom,
            'data-descricao': value.descricao,
        });
        var content_thumb = $("<img>").attr("src", fotoThumb);

        if (value.codigo == objFotoDefault.codigo) {
            a.addClass('elevate-zoom-active');
        }

        a.append(content_thumb);
        fotosProdutos.append(a);

    });

}
function montaMiniaturasVideo(videoProduto, videoAtacado, fotoPrincipal, exibevideoAtacado){
    var tela = verificaTipoResolucaoPagina();
    var videosProdutos = $("#videosProdutos");

    if (
        (videoProduto == null || videoProduto == "") &&
        (videoAtacado == null || videoAtacado == "")
    ) {
        videosProdutos.remove();
        return;
    }

    var arrVideosProduto = {
        produto: {
            codVideo: videoProduto,
        },
        atacado: {
            codVideo: videoAtacado,
        }
    };
   
    videosProdutos.html("");
    
    $.each(arrVideosProduto, function(ind, val){
        if (val.codVideo == null || val.codVideo == "") {
            return;
        }
        var codVideo = val.codVideo;
        if (val.codVideo.indexOf("/") != -1) {
            var split = codVideo.split('/').filter(function (i) {
                return i;
            });
            codVideo = split[split.length-1];
        }

        var content_thumb = $("<img>").attr("src", fotoPrincipal);
        var a = $("<a>").attr("href","javascript:void(0)").attr({
            'data-codvideo': codVideo,
        }).addClass('img-video-'+ind);

        a.append(content_thumb);
        videosProdutos.append(a);

        a.click(function(){
            $('.elevate-zoom-active').removeClass('elevate-zoom-active');
            $(this).addClass('elevate-zoom-active');
            clickVideoProduto($(this));
        });

    });
}

function clickVideoProduto(elem){
    $(".foto-video").remove();

    var tela = verificaTipoResolucaoPagina();

    if (tela.tipoTela == "mobile") {
        var container = $('.fotos-produto');
        var cont_foto = container;
        var btnSalvarFoto = container.find('.btn-salvarFoto');
        var dimensoes = {
            largura: $(cont_foto.find('a.slick-slide')[0]).width(),
            altura: $(cont_foto.find('a.slick-slide')[0]).height(),
        };
    } else {
        var container = $('.produto-foto');
        var cont_foto = container.find('.foto-principal');
        var btnSalvarFoto = container.find('.btn-salvarFoto');
        var dimensoes = {
            largura: cont_foto.width(),
            altura: cont_foto.height(),
        };    
    }

    var cont_zoom = $('.zoomContainer');

    var foto_video = $("<section>").addClass("foto-video");
    var cont_fechar = $("<div>").addClass("cont-opcoes fechar").html('<i class="fal fa-times"></i>');
    var cont_iframe = $("<div>").addClass("cont-iframe");
    var cont_video = $('<div>').attr({
        'id': 'youtubePlayer_'+elem.attr('data-codvideo'),
        'data-codvideo': elem.attr('data-codvideo'),
        "data-origem": "videoProduto",
    });

    foto_video.css({
        'position': 'absolute',
        'overflow': 'hidden',
        'top': '0px',
        'left': '0px',
        'z-index': '+1',
        'width': dimensoes.largura,
        'height': dimensoes.altura,
        'background-color': 'black'
    });
    cont_iframe.css({
        'position': 'absolute',
        'z-index': '1',
        'transform': 'scale(1.4)',
    });
    
    // cont_foto.css('display', 'none');
    btnSalvarFoto.css('display', 'none');
    cont_zoom.css('display', 'none');

    cont_fechar.click(function(){
        $(".foto-video").fadeOut(function(){
            $(this).remove();
        });
    });

    foto_video.append(cont_fechar);
    foto_video.append(cont_iframe);
    cont_iframe.append(cont_video);
    container.append(foto_video);

    // exeYoutubePlayer(cont_video, dimensoes);
    exePlayerVideo(cont_video, dimensoes);

    $("html, body").animate({ scrollTop: foto_video.offset().top - $('#topoPagina').outerHeight()});

}

function moverScrollDaPagina(){
    var scrollPagina = $(window).scrollTop();
    var alturaPagina = $(window).height();
    var alturaTopoPagina = $("#topoPagina").height() - 2;
    var eleEstoque = $(".cont-tabela-estoque").offset().top - 250;
    var eleProdRelacionados = $(".produtos-relacionados").offset().top + 200;

    //carregar os produtos relacionados somente qdo sroll chegar a um certa altura
    if ((scrollPagina + alturaPagina) > eleProdRelacionados) {
        if (!verifExecProdRelacionados) {
            verifExecProdRelacionados = true;
            if (idsProdutosRelacionados){
                carregaProdutosRelacionados(idsProdutosRelacionados);
            }
        }
    }
}

function mostraMensagemAddProdutoSacola(){
    $(".div-mensagem-add-sacola").text("Produtos adicionados a sacola.").fadeIn("fast");
    setTimeout(function(i){
        $(".div-mensagem-add-sacola").fadeOut("fast");
    },7000);
}


//carrega todas as bibliotecas apos produto ser carregado na pagina DOM.
function initialLibsProduto(produto, objFotoDefault){
    var tela = verificaTipoResolucaoPagina();
    var bodyData = getBodyData();

    if (tela.tipoTela == "mobile") { //desativa o click nas tags <a>
        $("#fotoPrincipal a").click(function(e){
            e.preventDefault();
        });
    } else {
        $("#fotoPrincipal").elevateZoom({
            gallery:'fotosProdutos',
            zoomType: "inner",
            cursor: "crosshair",
            zoomWindowFadeIn: 500,
            zoomWindowFadeOut: 750,
            cursor: 'crosshair',
            galleryActiveClass: 'elevate-zoom-active'
        });
    }

    $('.fotos-produto').slick({
        arrows: true,
        dots: true,
        infinite: false,
        slidesToShow: 6,
        slidesToScroll: 6,
        responsive:[
            {
                breakpoint: 1351,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5,
                }
            },
            {
                breakpoint: 1156,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4,
                }
            },
            {
                breakpoint: 873,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            },
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    infinite: true,
                    dots: true,
                    centerPadding: '50px',
                    slidesToShow: 1,
                    slidesToScroll: 1,
                }
            },
        ]
    });

    abreFotoDoSlickParaZoomClickNaEstampa(objFotoDefault.descricao);

    $('.fotos-produto').on('afterChange', function(slick, currentSlide){
        if (tela.tipoTela == "mobile"){
            $('.cont-estampas li').removeClass("acessando");
            var cod_estampa = $(slick.currentTarget).find('a.slick-slide[aria-hidden="false"]').attr('data-descricao');
            $('li[data-codigoestampa="'+cod_estampa+'"]').addClass("acessando");
        }
    });
    
    if (tela.tipoTela != "mobile" && $('.fotos-produto').find('button.slick-arrow').length == 0) {
        //<button type="button" data-role="none" class="slick-prev slick-arrow slick-disabled" aria-label="Previous" role="button" aria-disabled="true" style="display: block;">Previous</button>
        $('.fotos-produto').prepend($('<button>').addClass('slick-prev slick-arrow slick-disabled').css('display', 'block'));
        $('.fotos-produto').append($('<button>').addClass('slick-next slick-arrow slick-disabled').css('display', 'block'));
    }
    
    if (tela.tipoTela == "mobile" && produto.fotos.conteudo.length === 1){
        $('.fotos-produto').append($('<ul>').addClass('slick-dots dots-fake-fotos-produto').css('display', 'block').html('<li class="slick-active" aria-hidden="false" role="presentation" aria-selected="true" aria-controls="navigation00" id="slick-slide00"></li>'));
    }


    //add evento de clicar na miniatura e alterar o conteudo da descrição da foto
    if ((verificaTipoResolucaoPagina().tipoTela == "mobile")) {
        $('.fotos-produto').on('afterChange', function(slick, currentSlide){
            var cod_estampa = $(this).find('.slick-current').attr('data-descricao');
            montaElemContentEstampaDaFoto(cod_estampa, $('.fotos-produto a[data-descricao="'+cod_estampa+'"]'));
        });
    } else {
        $("#fotosProdutos > div > div a").click(function(){
            montaElemContentEstampaDaFoto($(this).attr('data-descricao'), $(".produto-foto").find('.foto-principal'));
        });
    }

    var add_salvarFoto = $(".produto-foto");
    if (tela.tipoTela == "mobile") {
        add_salvarFoto = $("#fotosProdutos");
    }
    
    if (
        produto.objSectionPrecos.compraAtacado 
        // && bodyData.app == 'N'
    ) {
        var content_salvaFoto = montaElemContentSalvarFoto();
        add_salvarFoto.prepend(content_salvaFoto);
        content_salvaFoto.click(clickSalvarFotoProduto);
    }
        
    //funcções para o movimentar da tela
    $(document.body).on('touchmove', moverScrollDaPagina);
    $(window).on("scroll", moverScrollDaPagina);

}




function initialSlickProdutosRelacionados(){
    //produtos relacionados
    $('.produtos-relacionados > section > ul').slick({
        arrows: false,
        dots:true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3,
            responsive:[
                {
                    breakpoint: 767,
                    settings: {
                        centerPadding: '0',
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                }
            ]
    });
}

function historyBackPrevent(){
    $(window).on("hashchange", function(e) {
        e.preventDefault();
        e.originalEvent.state;
    });
}
