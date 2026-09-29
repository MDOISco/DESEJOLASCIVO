var global_getSacolaAtual;

$(function(){

    //quando clicar na sacola do topo >> abre
    $("#topoMenuUsuario").click(function(){
        $("#formLoginUsuario").addClass("formLoginUsuario-on");
    });
    //quando clicar na sacola do topo >> abre
    $(".topo-sacola").click(function(){
        abreSacolaDAO(true);
    });
    //quando clicar no fundo (sacola ja aberta) >> fecha
    $("#escondePaginaMinhaSacola, .minha-sacola h2").click(function(){
        // Na página de checkout fecharemos a sacola somente clicando no botão finalizar compra na sacola para atualizar os produtos
        var desabilita_paginas = ["checkout"];
        if (desabilita_paginas.indexOf(verificaPaginaAtual()) != -1) {
            location.reload();
            return;    
        }
        abreSacolaDAO(false);
    });

    //quando clicar no topo da sacola ja aberta >> fecha
    $(".minha-sacola .btn-mostra-romaneio, .container-romaneio-sacola .btn-fechar-romaneio").click(function(){
        var container_romaneio = $('.container-romaneio-sacola');
        if (container_romaneio.hasClass('on') === false) {
            container_romaneio.addClass('on');
        } else {
            container_romaneio.removeClass('on');
        }
    });
    
    // Ativa botão de finalizar compra
    finalizarCompra();


    var tamanhoJanela = formataTamanho_JanelaVenoboxModoInline("simularfretes");
    $('.abre-venobox-simular-fretes').venobox({
        framewidth: tamanhoJanela.largura,
        frameheight: tamanhoJanela.altura,
    });

});
function abreSacolaDAO(status, abreSacola=true) {

    // calcAlturaElementosMinhaSacola();

    if (status == true) {

        carregaMinhaSacola();
        verifSeAbreSacola(abreSacola);
        $('body > jdiv').css('display', 'none');

    } else {

        $(".minha-sacola").removeClass("minha-sacola-on");
        $("#escondePaginaMinhaSacola").fadeOut();
        // $("body").css("overflow-y","");
        travaScrollDoBody("sacola", false);
        // mostraContainerBeneficiosNaCompra();
        $('body > jdiv').css('display', 'inline');

    }

}

function verifSeAbreSacola(s){
    if (s){
        travaScrollDoBody("sacola");
        $("#escondePaginaMinhaSacola").fadeIn();
        $(".minha-sacola").addClass("minha-sacola-on");
        $('.container-romaneio-sacola').removeClass('on');
    }
}
function carregaMinhaSacola() {
    carregandoElemento(".minha-sacola", true);
    var vitrine = $('body').attr('data-vitrine');
    var query = {};
    if (vitrine != undefined) {
        query = {vitrine: vitrine};
    }

    $.get("json/?token=VjFod1MxSXlSblJUV0d4c1VqSmpPUT09", query, function(data){

        $("#ulProdutosMinhaSacola").html("");
        $('.cont-tabela-romaneio').remove();
        
        if (data == "false") {
            $('.minha-sacola #carregandoEelemento').remove();
            return;
        }

        var tela = verificaTipoResolucaoPagina();
        var retorno = JSON.parse(data);
        var verificaCompra = retorno.verificacompra.conteudo[0];
        global_getSacolaAtual = retorno;

        var opcoesRomaneio = {
            tirapedido: $('.minha-sacola .cont-menu-romaneio .btn-ir-tira-pedido'),
            fretes: $('.minha-sacola .cont-menu-romaneio .mostra-simular-fretes'),
            romaneio: $('.minha-sacola .cont-menu-romaneio .btn-mostra-romaneio'),
        };

        
        var produtos = retorno.sacola.conteudo;
        var somaTotalSacola = 0;
        var somaQtdProdutos = 0;
        $.each(produtos, function(produto, value){
            somaTotalSacola = (somaTotalSacola + (parseFloat(value.preco) * parseFloat(value.quantidade)));
            somaQtdProdutos = somaQtdProdutos + parseInt(value.quantidade);
            montaLiMinhaSacola(value);
        });

        // Montar sacola como romaneio
        var container_romaneio = $('.minha-sacola .container-romaneio-sacola .cont-romaneio');
        
        if (retorno.sacola.totalReg > 0) {

            var cont_romaneio = montaTabelaProdutosRomeaneio(retorno.sacola);
            container_romaneio.html('');
            container_romaneio.append(cont_romaneio);

            opcoesRomaneio.tirapedido.css('display', 'block');
            opcoesRomaneio.fretes.css('display', 'block');
            opcoesRomaneio.romaneio.css('display', 'block');

        } else {

            opcoesRomaneio.tirapedido.css('display', 'none');
            opcoesRomaneio.fretes.css('display', 'none');
            opcoesRomaneio.romaneio.css('display', 'none');
    
        }
        
        if (verificaCompra.mododeexibirprecos == "ExibeAtacado"){
            opcoesRomaneio.tirapedido.css('display', 'block');
        } else {
            opcoesRomaneio.tirapedido.css('display', 'none');
        }


        $(document).on('click', '.btnExcluirProduto-cancelar', function(){
            fecharVenoBoxIframe(true);
        });
    

        abreResumoMinhaSacola();
        retorno["sacola"]["total"] = somaTotalSacola;
        // beneficiosNaCompra(retorno);
        initialAcoesPosCarregarMinhaSacola();


        //verifica total sacola com o nó verificacompra se esta nos padrões (compraminima)
        var formVaiProCheckout = $("#formFinalizarCompraMinhaSacola")
        var botaoCheckout = formVaiProCheckout.find(".button-finalizarcomprar").removeClass('finalizar');
        var verifBtnCompra = verficaSeLiberaBotaoSacolaParaFinalizarCompra(somaQtdProdutos, somaTotalSacola, retorno.verificacompra.conteudo[0]);
        botaoCheckout.addClass(verifBtnCompra.classe).prop(verifBtnCompra.prop).html(verifBtnCompra.icone+verifBtnCompra.texto);

    }).fail(function(data){
        var responseJson = JSON.parse(data.responseText);
        lerRetornoJson(data.codigo, responseJson);
    }).always(function(){
    });
}




function verficaSeLiberaBotaoSacolaParaFinalizarCompra(totalProdutos, totalSacola, verificaCompra){
    var traducao = leJsonInfosGeraisForms();
    var modopedidominimo = verificaCompra.modopedidominimo;
    var compraMinima = verificaCompra.compraminima;
    var compraMaxima = verificaCompra.compramaxima;
    var moeda = verificaMoeda(verificaCompra.moeda);
    var ret_disabled = {retorno: false, texto: traducao.alteracao_btn_sacola.finalizar_compra};
    var configsBotao = {
        icone: '<i class="fal fa-shopping-bag"></i>',
        texto: traducao.alteracao_btn_sacola.finalizar_compra,
        classe: "finalizar",
        prop: {
            disabled: false,
        },
    }

    if (modopedidominimo == 'Valor') {
        if (totalSacola == 0) {
            configsBotao.prop.disabled = true;
            configsBotao.texto = traducao.alteracao_btn_sacola.sacola_vazia;

        } else if (totalSacola < parseFloat(compraMinima)) {
            configsBotao.prop.disabled = true;
            configsBotao.texto = traducao.alteracao_btn_sacola.minimo_valor.replace("{MINIMO_VALOR}", formataValorFloatParaMonetario(moeda, compraMinima));
        
        } else if (totalSacola > parseFloat(compraMaxima)) {
            configsBotao.prop.disabled = true;
            configsBotao.texto = traducao.alteracao_btn_sacola.maximo_valor.replace("{MAXIMO_VALOR}", formataValorFloatParaMonetario(moeda, compraMaxima));

        }

    } else if (modopedidominimo == 'Pecas') {

        if (totalProdutos == 0) {
            configsBotao.prop.disabled = true;
            configsBotao.texto = traducao.alteracao_btn_sacola.sacola_vazia;

        } else if (totalProdutos < parseFloat(compraMinima)) {
            configsBotao.prop.disabled = true;
            configsBotao.texto = traducao.alteracao_btn_sacola.minimo_pecas.replace("{MINIMO_PECAS}", parseInt(compraMinima));
        
        } else if (totalProdutos > parseFloat(compraMaxima)) {
            configsBotao.prop.disabled = true;
            configsBotao.texto = traducao.alteracao_btn_sacola.maximo_pecas.replace("{MAXIMO_PECAS}", parseInt(compraMaxima));

        }
    }

    if (compraMaxima == -1) {
        configsBotao.prop.disabled = true;
        configsBotao.icone = '<i class="far fa-clock"></i>';
        configsBotao.classe = "aviso-consignado";
        configsBotao.texto = traducao.alteracao_btn_sacola.aguardar_liberacao_consignado;

    }

    return configsBotao;
}
function preRequestSacola(acao, idReg, idProduto, idGrade, idEstampa, quantidade=0, preco=0){
    var tdEstoque = $('td[data-idproduto="'+idProduto+'"][data-idgrade="'+idGrade+'"][data-idestampa="'+idEstampa+'"]');
    var contQuantidade = $('div.quantidade[data-idproduto="'+idProduto+'"][data-idgrade="'+idGrade+'"][data-idestampa="'+idEstampa+'"]');
    var tabelaEstoque = tdEstoque.parent().parent().parent();
    var containerEstoque = tabelaEstoque.parent().parent().parent();
    var objPost = {
        acao: acao,
        origem: "sacola",
        data: [
            {
                idReg: idReg,
                idProduto: idProduto,
                idGrade: idGrade,
                idEstampa: idEstampa,        
            }
        ]
    }

    if (quantidade > 0) {
        objPost.data[0].quantidade = quantidade;
    }
    if (preco > 0) {
        objPost.data[0].preco = preco;
    }

    quantidade = (quantidade==0)?"":quantidade;
    tdEstoque.find('input').val(quantidade);
    contQuantidade.find('input').val(quantidade);

    requestSacola(containerEstoque, objPost);

}
function deleteProdutoMinhaSacola(elemClick){

    carregandoElemento('.minha-sacola', true);
    
    var idReg = $(elemClick).attr('data-id');
    var liSacola = $('li[data-idreg="'+idReg+'"');
    var idProduto = liSacola.attr('data-idproduto');
    var idGrade =liSacola.attr('data-idgrade');
    var idEstampa = liSacola.attr('data-idestampa');

    preRequestSacola('-', idReg, idProduto, idGrade, idEstampa);

    fecharVenoBoxIframe(true);

}

function initialAcoesPosCarregarMinhaSacola(){
    var tamanhoJanela = formataTamanho_JanelaVenoboxModoInline("deletaproduto");
    $('.venobox').venobox({
        framewidth: tamanhoJanela.largura,
        frameheight: tamanhoJanela.altura
    });
}

/*FINALIZAR COMPRA*/
function finalizarCompra(){
    $(".button-finalizarcomprar").click(function(event){
        event.preventDefault();
        sendPixel('checkout', {
            produtos: global_getSacolaAtual.sacola.conteudo
        });
        alterarHtmButtonCarregando($(this));

        setTimeout(function(){
            window.open("checkout", "_self");
        },1500);
    });
}




/**
 * Montando elementos
 */
function montaLiMinhaSacola(produto){
    var idReg = produto.id;
    var idProduto = produto.codigo;
    var srcPrimeiraFotoProduto = produto.fotos.conteudo[0].arquivo;
    var descricao = limitaCaracteres(produto.descricao, 55);
    var referencia = produto.referencia;
    var quantidade = parseFloat(produto.quantidade);
    var precoProduto = produto.preco;
    var valorTotalProduto = formataValorFloatParaMonetario(produto.moeda, (quantidade * precoProduto));
    var verifCorestampa = verificaRetornoCssEstampaCor(produto.estampas.conteudo[0].textoPrincipal);
    var estampaNome = produto.estampas.conteudo[0].descricao;
    var idEstampa = produto.estampas.conteudo[0].codigo;
    var grade = produto.grade;
    var gradeNome = produto.gradeNome;
    var idGrade = produto.gradeId;
    var estoque = parseFloat(produto.quantidadeemestoque.conteudo[0].estoque);

    var ul = $("#ulProdutosMinhaSacola");
    var li = $("<li>").attr({
        "data-idReg": idReg,
        "data-idproduto": idProduto,
        "data-idgrade": idGrade,
        "data-idestampa": idEstampa,
    }).addClass("li-produto-minha-sacola");
    var spanFechar = $("<span>").addClass("fal fa-trash-alt sacolaProdutoExcluir");
    var aFechar = $("<a>").attr({
        href: "#divConfirmaExcluirProduto_"+idReg,
        "data-vbtype": "inline"
    }).addClass("venobox vbox-item");
    // var inputIdReg = $("<input>");
    var divFoto = $("<div>").addClass("foto link-acessar-produto");
    var imgFoto = $("<img>").attr("src", alterarTamanhoDaFotoDoProduto(srcPrimeiraFotoProduto, 2));
    var pDescricao = $("<p>").addClass("descricao");
    var pReferencia = $("<p>").addClass("referencia");
    var divQuantidade = $("<div>").attr({
        "data-idproduto": idProduto,
        "data-idgrade": idGrade,
        "data-idestampa": idEstampa,
    }).addClass("quantidade");
    var divQuantidadeMenos = $("<div>");
    var divQuantidadeMais = $("<div>");
    var InputQuantidade = $("<input>").attr({
        name: "sacolaQtd",
        maxlength: 3,
        value: quantidade
    });
    var pValorTotalProduto = $("<p>");
    var divCor = $("<div>")
    var divNomeCor = $("<div>");
    var IconCor = $("<i>");
    var divTamanho = $("<div>");
    var IconTamanho = $("<i>");
    var iconBtnQtdMenos = $("<span>").addClass("fal fa-minus");
    var iconBtnQtdMais = $("<span>").addClass("fal fa-plus");

    var linha1 = $("<div>").addClass("linha um");
    var linha2 = $("<div>").addClass("linha dois");
    var linha3 = $("<div>").addClass("linha tres");

    
    divQuantidadeMenos.addClass("btn-qtd-minhasacola").attr('data-acao', '-').append(iconBtnQtdMenos);
    divQuantidadeMais.addClass("btn-qtd-minhasacola").attr('data-acao', '+').append(iconBtnQtdMais);
    InputQuantidade.addClass("inputHiddenSacola-quantidade");
    pValorTotalProduto.addClass("valor notranslate");
    divCor.attr('title', estampaNome).addClass("cor notranslate");
    divTamanho.attr('title', grade).addClass("tamanho notranslate");

    pDescricao.html(descricao)
    pReferencia.text(referencia)
    pValorTotalProduto.text(valorTotalProduto);
    divNomeCor.addClass('nome').text(limitaCaracteres(estampaNome, 19));
    IconCor.css(verifCorestampa.attr, verifCorestampa.cont);
    IconTamanho.text(limitaCaracteres(grade, 8));

    ul.append(li);
    li.append(aFechar.append(spanFechar));
    li.append(divFoto.append(imgFoto));
    li.append(linha1.append(pDescricao.append(pReferencia)));
    li.append(linha2.append(divQuantidade.append(divQuantidadeMenos).append(InputQuantidade).append(divQuantidadeMais)).append(pValorTotalProduto));
    li.append(linha3.append(divCor.append(divNomeCor).append(IconCor)).append(divTamanho.append(IconTamanho)));
    li.append(montaElementoMensagemExcluirProduto({idReg: idReg, foto: srcPrimeiraFotoProduto, grade: grade, corIcone: IconCor.clone(), cor: estampaNome}));


    var clickAcessarProduto = function(event){
        var urlProduto = montaUrlProdutoDetalhar(descricao, idProduto);
        location.href = "/"+urlProduto;
    }

    var alterarQtdNaSacola = function(event){
        var contQuantidade = $(this).parent();
        var elemClick = $(contQuantidade.context);
        var inputQtd = contQuantidade.find('input');
        var qtdAtual = parseFloat(inputQtd.val());
        var acao = elemClick.attr('data-acao');
        var exe={msg:false, request:true};
                
        if (elemClick.prop('tagName') == "INPUT") {
            acao = "=";
            var novaQtd = parseFloat(elemClick.val());
            
            if (novaQtd > estoque) {
                novaQtd = estoque
                exe.msg=true;
                exe.request=true;
            }

        } else {
            var novaQtd = (elemClick.attr('data-acao')=="+") ? qtdAtual + 1 : qtdAtual - 1;

            if (novaQtd > estoque) {
                exe.msg=true;
                exe.request=false;
            }
        
        }

        if (exe.msg) {
            novaQtd = parseFloat(estoque);
            var contAvisoGrade = montaContMsgAvisoTd("aviso-grade", global_traducao.tabela_estoque.adicionado_estoque_disponivel.replace("{QTD_ESTOQUE_DISPONIVEL}", estoque), 3000);
            contQuantidade.append(contAvisoGrade);
        }
        
        if (exe.request) {
            carregandoElemento(".minha-sacola", true);
            preRequestSacola(acao, idReg, idProduto, idGrade, idEstampa, novaQtd, precoProduto);
        }

    }
    
    li.find('.link-acessar-produto').click(clickAcessarProduto);
    divQuantidade.find('input').on('change', alterarQtdNaSacola);
    divQuantidade.find('.btn-qtd-minhasacola').click(alterarQtdNaSacola);

}
function montaElementoMensagemExcluirProduto(elems){
    // Deletar produto pela sacola utilizando a nova request
    importarArquivos(modulosParaImportar('requests'));

    //definida de acordo com a resolução da pagina do usuario
    var tamanhoJanela = formataTamanho_JanelaVenoboxModoInline("deletaproduto");

    var divGeral = $("<div>").attr("id", "divConfirmaExcluirProduto_"+elems.idReg).css("display", "none");
    var divContent = $("<div>").addClass("content-confirma-excluir-produto-sacola");
    var divFoto = $("<div>").addClass("foto").css("height", tamanhoJanela.altura-5).css("background-image", 'url("'+alterarTamanhoDaFotoDoProduto(elems.foto)+'")');
    var divInfos = $("<div>").addClass("infos");
        var divPergunta = $("<div>").addClass("pergunta").text("Você tem certeza que deseja remover este produto?");
        var divGradeEstampa = $("<div>").addClass("grade-estampa");
            var spanIconCor = elems.corIcone;
            var spanCor = $("<span>").addClass("cor").text(elems.cor);
            var spanGrade = $("<span>").addClass("tamanho").text(elems.grade);
        var btnConfirma = $("<button>").attr("id", "btn_"+elems.idReg).attr("onclick", "deleteProdutoMinhaSacola(this)").attr('data-id', elems.idReg).addClass("btnExcluirProduto-confirmar").text("SIM");
        var btnCancela = $("<button>").addClass("cancelar btnExcluirProduto-cancelar").text("NÃO");

        divGeral.append(divContent);
        divContent.append(divFoto);
            // divFoto.append(img);
        divContent.append(divInfos);
        divInfos.append(divPergunta);
        divInfos.append(divGradeEstampa);
        divGradeEstampa.append(spanIconCor);
        divGradeEstampa.append(spanCor);
        divGradeEstampa.append(spanGrade);
        divInfos.append(btnConfirma);
        divInfos.append(btnCancela);

        return divGeral;
}

// function beneficiosNaCompra(obj){
//     $('.beneficios-compra').remove();
//     var valor_total = obj.sacola.total;
//     var frete_gratis = parseFloat(obj.verificacompra.conteudo[0].condicoes_frete.gratis);
//     var moeda = obj.verificacompra.conteudo[0].moeda;
//     var porcent = 0;
//     var contHtml_beneficios = "";
//     if (frete_gratis > 0) {
//         if (valor_total == 0) {
//             var mensagem = "Frete grátis a partir de "+formataValorFloatParaMonetario(moeda, frete_gratis)+" garanta já!";
//         } else if (frete_gratis > valor_total) {
//             porcent = ((valor_total / frete_gratis) *100);
//             var mensagem = "Faltam "+formataValorFloatParaMonetario(moeda, (frete_gratis - valor_total))+" para o frete grátis!";
//         } else {
//             porcent = 100;
//             contHtml_beneficios = '<div class="frete-gratis"><i class="fad fa-parachute-box"></i></div>';
//             var mensagem = "Parabéns! Seu frete será por nossa conta.";
//         }

//         var container = $('<div>').addClass('beneficios-compra');
//         var content = $('<div>');
//         var texto = $('<p>');
//         var barra_porcent = $('<div>').addClass('barra');
//         var fundo = $('<div>').addClass('fundo');
//         var beneficios = $('<div>').addClass('beneficios');

//         texto.text(mensagem);
//         beneficios.html(contHtml_beneficios);

//         container.append(content);
//         content.append(texto);
//         content.append(barra_porcent);
//         content.append(fundo);
//         content.append(beneficios);
//         beneficios.append(beneficios);

//         $('h1').before(container);

//         setTimeout(function(){
//             barra_porcent.css('width', porcent+"%");
//         }, 1000);
//     }
// }



/**
 * Genéricas
 */

function calcAlturaElementosMinhaSacola(){
    return
    var objTamanhoTela = verificaTipoResolucaoPagina();
    if (objTamanhoTela.tipoTela == "desktop") {
        var fatorCalc = 0;

    } else if (objTamanhoTela.tipoTela == "tablet") {
        var fatorCalc = 10;

    } else if (objTamanhoTela.tipoTela == "mobile") {
        var fatorCalc = 20;
    }
    var altura_sacola = ($(window).height() - ($(".minha-sacola h2").outerHeight() + $(".minha-sacola .finalizar-compra").outerHeight())) - fatorCalc;
    $(".minha-sacola .div-scroll").css("height",altura_sacola+"px");
}
// function mostraContainerBeneficiosNaCompra() {
//     var container = $('.beneficios-compra');
//     container.addClass('on');
//     setTimeout(function(){
//         container.removeClass('on');
//     }, 5000);
// }

