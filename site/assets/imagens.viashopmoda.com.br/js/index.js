var verifCarregamentoProdutos=false;
var carregarProdutos_qtdGeral = 24;
var tokenProdutosIndex = "VjFSQ2IxTXlVbk5qUld4WFlXdEtjRlJVUVhkUFVUMDk";

// A index monta a lista por AJAX, entao a altura do documento na hora em que o navegador
// tenta restaurar o scroll nao tem relacao com a altura de quando saimos daqui: ele acaba
// jogando a pessoa pro fim da pagina. Nos assumimos o posicionamento em
// restauraPosicaoProdutoVisitado(). Precisa rodar cedo, antes da primeira tentativa dele.
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }


// Retorno pelo back/forward cache: o ready nao roda de novo, entao esse listener e a unica
// chance de reagir. O DOM e a lista voltam intactos, mas a posicao de scroll nao e confiavel:
// o WebKit (Safari e todos os navegadores do iOS) reaplica a posicao salva ao restaurar, e
// com scrollRestoration em 'manual' ele pula esse passo e a pagina volta no topo. Como o card
// ja esta no DOM, reposicionamos pelo estado gravado no pagehide - nos navegadores que ja
// devolveram o scroll certo isso cai no mesmo destino e nao move nada.
window.addEventListener('pageshow', function(e){
    if (!e.persisted) { return; }

    verifCarregamentoProdutos = false;
    restauraPosicaoProdutoVisitado(); //tambem limpa o estado depois de usar
});


// Qualquer saida da index (link do topo, filtro, rodape, aba fechando) grava a posicao,
// nao so o clique num produto. Sem isso a volta por outro link reconstruia apenas a
// primeira pagina e a pessoa caia no fim da lista.
window.addEventListener('pagehide', function(){
    var anterior = getLocalstorage_QueryMaisProdutos();
    salvaEstadoListagem(anterior ? anterior.idProduto : null); //preserva o produto ja clicado
});


$(function(){

    var tela = verificaTipoResolucaoPagina();
    var larguraFoto = $($('.div-produtos-index .li-produto>a')[0]).outerWidth();
    if (tela.tipoTela == "mobile") {
        var larguraFoto = ($(window).width() / 2) - 28.5;
    }
    $('.div-produtos-index .li-produto .produto-img').css({
        'background-color': 'red',
        'height': (((larguraFoto / 900) * 100) * 1350) / 100+'px'
    });


    var getQuery_maisProdutos = getLocalstorage_QueryMaisProdutos();

    //o estado salvo so vale para a mesma URL (mesmos filtros/busca/ordenacao)
    if ((getQuery_maisProdutos != null) && (getQuery_maisProdutos.urlOrigem != undefined) && (getQuery_maisProdutos.urlOrigem != location.href)) {
        removeLocalstorage_QueryMaisProdutos();
        getQuery_maisProdutos = null;
    }

    if (getQuery_maisProdutos == null) {
        // carga direta. Antes isso ficava dentro de um handler de scroll e num load limpo
        // no topo, sem interacao, o evento podia nunca vir e a lista nao carregava.
        if (location.pathname != '/index2.php') {
            carregaDadosProdutos(criaObjetoCarregaProduto(tokenProdutosIndex, 0, carregarProdutos_qtdGeral));
        }

    } else {
        if (getQuery_maisProdutos.limite > carregarProdutos_qtdGeral) {
            var limite = getQuery_maisProdutos.limite;
        } else {
            var limite = (getQuery_maisProdutos.pagina * getQuery_maisProdutos.limite) + carregarProdutos_qtdGeral;
        }

        // executar o ready
        carregaDadosProdutos(criaObjetoCarregaProduto(tokenProdutosIndex, 0, limite));
    }

    initBtnMaisProdutos();
    initialAcoesBtnProduto();
});
//PRODUTOS INDEX

function carregaDadosProdutos(objCarregaProdutos) {
    verifCarregamentoProdutos=true;
    // return;
    $.get("json/", objCarregaProdutos, function(data){
        
        var response = JSON.parse(data);

        responseTodosProdutos(response, objCarregaProdutos);

    }).fail(function(data){

        var responseJson = JSON.parse(data.responseText);
        lerRetornoJson(data.codigo, responseJson);

    }).always(alwaysCarregaProdutoOuCatalogo);
}


function responseTodosProdutos(response, objCarregaProdutos){

    if (!objCarregaProdutos) {
        objCarregaProdutos = criaObjetoCarregaProduto(tokenProdutosIndex, 0, 24);
    }

    if (objCarregaProdutos.pagina > 0) {
        alterarHtmButtonCarregando($("#carregarMaisProdutos"), false);
    }
    
    if (response.erro != undefined){
        $('.banner-principal').remove();
        $('.condicoes').remove();
        $('.banners-index-mobile').remove();
        $('.banners-index').remove();
        montaContainerSemProdutos($(".container-produtos"), response.erro);
        return;
    }

    abreConteudoProdutos(JSON.stringify(response), objCarregaProdutos.pagina, objCarregaProdutos.limite);

    if (objCarregaProdutos.pagina == 0) {
        abreMenuFiltroVertical();  //so carrega essa função dos filtros (click toggleSlide) na primeira página de produtos.
        restauraPosicaoProdutoVisitado();
    } else {
        var ancora = $("#pagina"+objCarregaProdutos.pagina);
        if (ancora.length > 0) {
            scrolPaginaAutomaticoQdoCarregarMaisProdutos(ancora.offset().top - 65);
        }
    }

}


/**
 * Guarda o que é preciso para remontar a listagem exatamente como ela estava.
 * @param {string|null} idProduto código do produto clicado, ou null quando a saída foi por
 *                                outro link qualquer (aí a volta é restaurada pelo scrollY).
 */
function salvaEstadoListagem(idProduto){
    var jsonQueryPaginacao = JSON.parse($("#carregarMaisProdutos").attr("data-paginacao") || "null");
    if (!jsonQueryPaginacao) { return; }

    var estado = criaObjetoCarregaProduto(tokenProdutosIndex, jsonQueryPaginacao.pagina, jsonQueryPaginacao.limite);
    estado.urlOrigem = location.href;      //validado no retorno
    estado.scrollY = window.pageYOffset;

    setLocalstorage_QueryMaisProdutos(estado, (idProduto == undefined) ? null : idProduto);
}


/**
 * Reposiciona a lista onde o usuário estava, quando ele volta e a página precisou ser
 * reconstruída (ou seja, quando o bfcache não pôde ser usado).
 */
function restauraPosicaoProdutoVisitado(){
    var estado = getLocalstorage_QueryMaisProdutos();
    if (estado == null) { return; }

    //saiu por outro link (rodapé, topo, filtro): não há card alvo, restauramos pelo scrollY
    var elemProduto = (estado.idProduto == null) ? $() : $("#produto"+estado.idProduto);
    removeLocalstorage_QueryMaisProdutos();

    // sem animação: o usuário quer estar onde parou, não assistir à rolagem.
    // A altura de cada card já é reservada em montaLiProdutoComVideo() antes da imagem
    // carregar, então a lista não muda de tamanho depois deste ponto.
    var alvoDoScroll = function(){
        if (elemProduto.length > 0) {
            return Math.max(0, elemProduto.offset().top - 65); //ancora no card, imune a mudança de layout
        }
        return Math.max(0, estado.scrollY || 0);
    };
    var irParaOProduto = function(){
        window.scrollTo(0, alvoDoScroll());
    };
    irParaOProduto();

    //desfaz o destaque do card visitado (o scale(1.5) é aplicado em montaLiProdutoComVideo)
    if (elemProduto.length > 0) {
        setTimeout(function(){
            elemProduto.find(".produto-img").css({'transform': 'scale(1)'});
        }, 300);
    }

    //uma reancoragem de segurança quando fontes e imagens terminarem de resolver
    var reancorar = function(){
        if (Math.abs($(window).scrollTop() - alvoDoScroll()) > 4) {
            irParaOProduto();
        }
    };

    if (document.readyState == "complete") {
        //o load ja passou (o ajax demorou mais que a pagina): reancora no proximo frame
        setTimeout(reancorar, 0);
    } else {
        $(window).one('load', reancorar);
    }
}


function abreConteudoProdutos(data, pagina, limite){
    //lendo JSON
    var json_produtos = JSON.parse(data);
    var filtros = json_produtos.filtros;
    var produtos = json_produtos.produtos.conteudo;
    var contaProdutos = json_produtos.contaprodutos.conteudo[0].total;
    var destino = "#ulListaProdutos";

    var colecoes_prevenda = false;
    if (json_produtos.colecoesprevenda!= undefined){
        colecoes_prevenda = json_produtos.colecoesprevenda.conteudo;
    }

    if (pagina == 0) {
        var filtros = json_produtos.filtros;
        var verifFiltrosSelecionados = getFiltroSelecionados(filtros);

        montaLiFiltros(filtros);
        if (verifFiltrosSelecionados.length > 0) {
            montaLiFiltrosSelecionados(verifFiltrosSelecionados);
            var getQuery_maisProdutos = getLocalstorage_QueryMaisProdutos();
            if ((getQuery_maisProdutos == null) && (window.location.href.split("/")[3].length > 0)){
                // scrolPaginaAutomaticoQdoCarregarMaisProdutos(($(".container-produtos").offset().top - 65));
            }
        }
    } else {
        var aAncora = $("<a>").attr("id", "pagina"+pagina).css("display", "block");
        $(destino).append(aAncora);
    }

    // remove o esqueleto ANTES de inserir os produtos. Ele fica acima da lista real, entao
    // sair depois (e com fadeOut) faz tudo subir ~1 tela e a posicao restaurada se perde.
    if (pagina == 0) {
        $(".container-produtos #carregandoEelemento").remove();
    }

    for (var i = 0; i < produtos.length; i++) {
        var produto = produtos[i];
        montaLiProdutoComVideo(destino, produto);
    }

    if ($('.container-preco .atacado .valor').text() == "") {
        $('.container-preco .atacado').addClass('link');
        $('.container-preco .atacado').click(function(){
            window.open('/login', '_self');
        });
    }

    //setando a qtde total de produtos na pagina
    var btncarregarMaisProdutos = $("#carregarMaisProdutos");
    if (limite > carregarProdutos_qtdGeral) {
        var totalPaginas = Math.ceil(contaProdutos / limite);
    } else {
        var totalPaginas = Math.ceil(contaProdutos / carregarProdutos_qtdGeral);
    }

    var dataPaginacao = {
        pagina:pagina,
        limite:limite,
        totalPaginas:totalPaginas,
        contaProdutos:contaProdutos
    };
    btncarregarMaisProdutos.attr("data-paginacao", JSON.stringify(dataPaginacao));
    btncarregarMaisProdutos.prop("disabled", false);

    if (pagina == (totalPaginas - 1)){
        $("#carregarMaisProdutos").fadeOut(function(){
            // $(this).remove();
        })
    }

    //executando as funções
    initialBtnVermaisFiltroVertial();


    importarArquivos(modulosParaImportar('requests'));
    importarArquivos(modulosParaImportar('clientesDepoimentos'));


    if (pagina == 0) {
        // handler unico e namespaced: antes um novo era registrado a cada "carregar mais",
        // e todos mediam offset() a cada evento de scroll.
        $(window).off("scroll.depoimentos").on("scroll.depoimentos", function() {
            var lisProduto = $("#ulListaProdutos").find(".li-produto");

            if (lisProduto.length < 4) {return;}
            var ultimoLiProduto = $(lisProduto[lisProduto.length - 4]);
            if ($(window).height() + $(window).scrollTop() >= ultimoLiProduto.offset().top) {
                montaContentDepoimentos();
                $(window).off("scroll.depoimentos"); //ja montou, nao precisa mais medir
            }

        });
    }

}

function montaContentDepoimentos(){

    var container = $('.container-depoimentos');

    if (container.find('.content-depoimentos').length > 0) {
        return;
    }

    var elemResp = $('<div>').addClass('elemento-responsivo');
    var elemEspacoEsq = $('<div>');
    var contentDepoimentos = $('<div>').addClass('content-depoimentos');

    elemEspacoEsq.css('width', $('section.container-produtos .filtro-vertical').outerWidth()+'px');
    contentDepoimentos.css('width', $('section.container-produtos .div-produtos-index').outerWidth()+'px');
    
    elemResp.append(elemEspacoEsq).append(contentDepoimentos);
    container.append(elemResp);


    getClienteDepoimentos(contentDepoimentos, function(ulDepoimentos){
        ulDepoimentos.slick({
            arrows: true,
            dots: true,
            infinite: false,
            slidesToShow: 3,
            slidesToScroll: 3,
            centerPadding: '100px',
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
    });

}


function initBtnMaisProdutos(){
    $("#carregarMaisProdutos").click(function(){
        removeLocalstorage_QueryMaisProdutos();

        //somente altera o contudo do botão para "carregando..."
        alterarHtmButtonCarregando($(this));

        //setando variaveis
        var _this = $(this);
        var jsonQueryPaginacao = JSON.parse(_this.attr("data-paginacao"));
        var pagina = jsonQueryPaginacao.pagina;
        var limite = jsonQueryPaginacao.limite;

        //verifica se o retorno do "limite" é maior que q qtd padrão, se não for altera a forma de calcular
        if (limite > carregarProdutos_qtdGeral) {
            var proxPagina = limite / carregarProdutos_qtdGeral;
        } else {
            var proxPagina = pagina + 1;
        }

        //envia para função que vai requisitar o Json dos produtos
        carregaDadosProdutos(criaObjetoCarregaProduto(tokenProdutosIndex, proxPagina, carregarProdutos_qtdGeral));

        $('section.container-depoimentos .slick-next').trigger('click');

    });
}


function initialAcoesBtnProduto(){
    // Delegado no container e ligado uma unica vez: vale para os produtos ja renderizados e
    // para os que chegarem no "carregar mais". Antes essa funcao rodava a cada pagina carregada
    // e rebindava todos os <a>, entao um clique disparava um handler por pagina ja carregada
    // (varios window.open seguidos, empilhando entradas no historico).
    $("#ulListaProdutos").off("click.produto").on("click.produto", ".li-produto > a", function(e){
        var id_produto = $(this).parent().attr("id").split("produto")[1];

        // Executa o video
        if ($(e.target).hasClass('abrir-video')) {
            e.preventDefault();
            var cont_foto = $(this).find('.foto');
            var cont_player = montaCont_iframePlayerVideo(id_produto, $(this).find('.cont-video').attr('data-video'));
            cont_foto.append(cont_player);
            exePlayerVideo(cont_player.find('> div'), {altura:cont_foto.height(), largura:cont_foto.width()});
            return;
        }

        if ($(e.target).hasClass('container-toggleplay')) {
            e.preventDefault();
            return;
        }

        if ($(e.target).hasClass('abrir-login')) {
            return; //o proprio <a> de login navega
        }

        //ctrl/cmd/shift/botao do meio: abre em outra aba e esta pagina nao sai do lugar
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) { return; }

        //gravando no sessionStorage o query da paginação e o card de onde saímos
        salvaEstadoListagem(id_produto);

        //sem preventDefault: o <a href> navega nativamente, gerando uma unica entrada no historico
    });
}

function verifBtnCarregarMaisProduto(atual, ultima){
}

function scrolPaginaAutomaticoQdoCarregarMaisProdutos(altura){
    $("html, body").animate({scrollTop: altura+"px"}, 1000); //rola pagina ate a proxima sessao
}
