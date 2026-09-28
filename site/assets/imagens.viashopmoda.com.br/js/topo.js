var global_montaValorFrete = [];
var global_escolhaValorFrete = false;
var global_montaCupom = false;

// Numa volta pelo back/forward cache o JS nao roda de novo e o contador da sacola fica
// congelado com o valor de antes da navegacao (o usuario adiciona itens no produto, volta
// e o topo mostra o total antigo). So o resumo do topo precisa ser refeito: a gaveta ja se
// recarrega sozinha em carregaMinhaSacola() a cada abertura.
window.addEventListener('pageshow', function(e){
    if (!e.persisted) { return; }
    abreResumoMinhaSacola();
});

$(function(){

    importarArquivos(modulosParaImportar('requests'));

    montaMenuTopo();

    requestApiLojaV2_GET('atendimento', {}, function(data){
            var response = JSON.parse(data);
            var container = $("<div>").addClass("content-whatsapp-rodape");
            var content = $("<div>").addClass("icon-whats");
            var imgWhatsapp = $("<img>").attr({
                "width": "50px",
                "height": "50px",
                "src": response.img_whatsapp
            });
            container.append(content.append(imgWhatsapp))
            $('footer').before(container);
            content.click(function(event){
                if (!response.mostrar_form){
                    abreLibsWhatsAppWeb(response.whatsapp, response.mensagem);
                    return;
                }
                montaWhatsappRodape(response);
            });
        }
    );
});

function montaMenuTopo(){
    criaTopoPagina();

    if ($.inArray(verificaPaginaAtual(), ["cadastro", "checkout"]) != -1) {
        $('#topoPagina li.busca').remove();
        // return;
    }

    requestApiLoja_GET(
        {acao:"menuTopo"},
        function(data){
            var response = JSON.parse(data);
            var container = $('<ul>').addClass("notranslate");

            $.each(response, function(ind, val){
                var li_opcao = $('<li>').html(val.icone+'<span>'+val.txt+'</span>');

                if (val.class != undefined){
                    li_opcao.addClass(val.class);
                }
                if (val.id != undefined){
                    li_opcao.attr("id", val.id);
                }
                if (val.link != undefined){
                    li_opcao.attr("onclick", 'javascript:window.open("'+val.link+'", "_self");');
                }

                if (val.menu != undefined){
                    var ul_menuLogado = $('<ul>').addClass("ul-submenu-topo-pagina-off").html(val.menu.html);
                    if (val.menu.attr != undefined) {
                        ul_menuLogado.attr(val.menu.attr);
                    }
                    li_opcao.append(ul_menuLogado)
                }

                if (ind == "minha_sacola") {
                    li_opcao.find("i").append($('<span>'));
                }

                container.append(li_opcao);
            });
            $('#topoPagina li.opcoes').append(container);
        },
        function(data){
        },
        function(data){

            setTimeout(function(){
                abreResumoMinhaSacola();
            },500);

            if (location.pathname.indexOf("/tirapedido") != -1) {
                $('#minha_conta-tira_pedido').remove();
            } else {
                $('#minha_conta-loja_virtual').remove();
            }

            $("#inputBuscaTopo").keyup(function(){
                if (getValInputBuscaTopo().length > 1) {
                    $("#btnExcluirBuscaCarregando").html('<i class="fa-duotone fa-spinner fa-spin"></i>');
                }
                clearTimeout(this.interval);
                this.interval = setTimeout(doBuscaTopo, 500);
            });
        
            $(".topo-sacola").click(function(){
                abreSacolaDAO(true);
            });

            $("#topoMenuUsuario, #topoMenuAtendimento, #topoMenuAvisos, .link-topo-opcoes.topo-sacola").on("click", function(e){
                var event = $(e.target);
                var elemClick = $(this);
                var elemClickId = elemClick.attr("id");
                $.each($(".ul-submenu-topo-pagina-off"), function(){
                    var verifClickId = $(this).parent().attr("id");
                    if (verifClickId == elemClickId) {
                        $(this).parent().toggleClass("link-topo-opcoes-hover");
                        $(this).toggleClass("ul-submenu-topo-pagina-on");
                    } else {
                        $(this).parent().removeClass("link-topo-opcoes-hover");
                        $(this).removeClass("ul-submenu-topo-pagina-on");
                    }
                });
            });
                
            $("#topoMenuUsuario .logout").click(function(e){
                e.preventDefault();
                window.open("json/login.php?token=VjFkMGFrNVhTblJUV0hCWFlXdEZPUT09", "_self");
            });
        
        },
    )
}

function getValInputBuscaTopo(){
    return removerCaracteresEspeciais($("#inputBuscaTopo").val());
}
function resetBuscaTopo(){
    $("#inputBuscaTopo").val("");
    $(".busca-topo-resultados").css("display", "none");
    $("#btnExcluirBuscaCarregando").html("");
}
function replaceBuscaCaractereVazio(string){
    return replaceAll(string, " ", "-");
}

function abreBuscaTopo(){
    $("#inputBuscaTopo").keyup(function(){
        if (getValInputBuscaTopo().length > 1) {
            $("#btnExcluirBuscaCarregando").html('<i class="fa-duotone fa-spinner fa-spin"></i>');
        }
        clearTimeout(this.interval);
        this.interval = setTimeout(doBuscaTopo, 500);
    });
}
function doBuscaTopo(){
    var divResultadoBusca = $(".busca-topo-resultados");
    var strInputBusca = getValInputBuscaTopo();
    var strInputBusca = $("#inputBuscaTopo").val();
    console.log(strInputBusca)
    var objGet = {token: "VmpGU1MxSXlWbGhVYmxKWFlsUldZVlpxUW5abFJtdzJVMnM1YUZGVU1Eaz0=", busca: replaceBuscaCaractereVazio(strInputBusca)}

    // processaStorageNavegacao("ADD", "busca", {path:location.pathname, val:strInputBusca});

    $.get("json/", objGet, function(data){
        if (getValInputBuscaTopo().length == 0) {
            resetBuscaTopo();
            return;
        }

        $("#btnExcluirBuscaCarregando").html('<i class="btn-remove-busca fal fa-times"></i>');

        $(".btn-remove-busca").click(function(){
            resetBuscaTopo();
        });
    
        divResultadoBusca.css("display", "block").html("");

        var json = JSON.parse(data);
        // sendPixelBusca({json:json, busca: getValInputBuscaTopo()});
        sendPixel('busca', {busca:getValInputBuscaTopo()})

        var label = $("#inputBuscaTopo").parent().parent().find("label");
        var resultSessoes = criaElementosResultadoBusca_sessoes(json.sessoes);
        var resultProdutos = criaElementosResultadoBusca_produtos(json.produtos);
        var resultTodosResultados = criaElementosResultadoBusca_verTodosResultados(json.totaldeprodutos);
        resultProdutos.append(resultTodosResultados);

        divResultadoBusca.append(resultSessoes)
        divResultadoBusca.append(resultProdutos);
        label.append(divResultadoBusca);

        var alturaResult = (resultProdutos.find('li').length * ($(resultProdutos.find('li')[0]).outerHeight()+15));
        var limitaAltura = ($(window).height() - $('#topoPagina').outerHeight() - parseInt(divResultadoBusca.css('padding')) - resultTodosResultados.outerHeight());
        if (alturaResult >= limitaAltura) {
            resultSessoes.css('height',(limitaAltura + parseInt(divResultadoBusca.css('padding'))));
            resultProdutos.find('>ul').css('height', limitaAltura);
        }
    }).fail(function(data){
        var responseJson = JSON.parse(data.responseText);
        lerRetornoJson(data.codigo, responseJson);
    }).always(function(){
        exeAjaxRequest("always", {});
    });
}
function criaElementosResultadoBusca_sessoes(obj){
    var divSessoes = $("<div>").addClass("result-sessoes");
    //adicionando o busca por
    var divBuscaPor =  $("<div>").addClass("sessao");
    var pBuscaPor = $("<p>").text("busca por");
    var ulBuscaPor = $("<ul>");
    var liBuscaPor = $("<li>").addClass("termo-buscado notranslate").text(getValInputBuscaTopo());

    divSessoes.append(divBuscaPor);
    divBuscaPor.append(pBuscaPor);
    divBuscaPor.append(ulBuscaPor);
    ulBuscaPor.append(liBuscaPor);

    //adcionando as sessoes
    $.each(obj, function(ind_sessao, val_sessao){
        if (val_sessao.conteudo.length < 1){
            return;
        }

        var divContent =  $("<div>").addClass("sessao");
        var pTitulo = $("<p>").text("localizado em "+val_sessao.nome);
        var spanTotalResults = $("<span>");
        var ulSessao = $("<ul>");
        $.each(val_sessao.conteudo, function(ind_conteudo, val_conteudo){
            var li = $("<li>").text(val_conteudo.textoPrincipal);
            var aLink = $("<a>").attr("href", ((location.pathname.indexOf('tirapedido') >= 0) ? location.pathname+"?" : "?")+"busca="+replaceBuscaCaractereVazio(removerAcentos(getValInputBuscaTopo()))+"&"+ind_sessao+"="+val_conteudo.codigo);
            aLink.append(li);
            ulSessao.append(aLink);
        });
        divContent.append(pTitulo);
        pTitulo.append(spanTotalResults);
        divContent.append(ulSessao);
        divSessoes.append(divContent);



        // if (va_sessao.totalReg > 0) {
        //     var divContent =  $("<div>").addClass("sessao");
        //     var pTitulo = $("<p>").text("localizado em "+in_sessao);
        //     var spanTotalResults = $("<span>");//.text(" ("+va_sessao.totalReg+")");
        //     var ulSessao = $("<ul>");
        //     $.each(va_sessao.conteudo, function(in_li, va_li){
        //         var li = $("<li>").text(va_li.textoPrincipal);
        //         var aLink = $("<a>").attr("href", ((location.pathname.indexOf('tirapedido') >= 0) ? location.pathname+"?" : "?")+"busca="+replaceBuscaCaractereVazio(removerAcentos(getValInputBuscaTopo()))+"&"+removerAcentos(in_sessao)+"="+va_li.codigo);
        //         aLink.append(li);
        //         ulSessao.append(aLink);
        //     });
        //     divContent.append(pTitulo);
        //     pTitulo.append(spanTotalResults);
        //     divContent.append(ulSessao);
        //     divSessoes.append(divContent);
        // }
    });
    return divSessoes;
}
function criaElementosResultadoBusca_produtos(obj){
    var divProdutos = $("<div>").addClass("result-produtos");
    // var divEsconderTecladoMobile = $("<div>").addClass("div-esconder-teclado-mobile").html('<i class="fal fa-keyboard"></i>esconder teclado');
    var ulProdutos = $("<ul>");

    $.each(obj.conteudo, function(index, value){
        var urlProduto = (verificaPaginaAtual() == 'catalogo') ? 'catalogo?idproduto='+value.codigo : montaUrlProdutoDetalhar(value.descricao, value.codigo);

        var li = $("<li>");
        var a = $("<a>").attr('data-oi', 'oi').attr("href", urlProduto);
        var img = $("<img>").attr("src", alterarTamanhoDaFotoDoProduto(value.fotos.conteudo[0].arquivo, 3));
        var pDescricao = $("<p>").addClass("descricao").text(limitaCaracteres(value.descricao, 150));
        var pReferencia = $("<p>").addClass("referencia").text(value.referencia);
        //verificando o preço
        // var sectionPreco = montaSectionPreco(value);
        // var sectionPreco = montaSectionPrecoProduto(value.objSectionPrecos);
        a.append(li);
        li.append(img);
        li.append(pDescricao);
            pDescricao.append(pReferencia);
        // li.append(sectionPreco);
        ulProdutos.append(a);
    });
    divProdutos.append(ulProdutos);

    return divProdutos;

}
function criaElementosResultadoBusca_verTodosResultados(obj){
    var p = $("<p>").addClass("ver-todos-resultados-busca");
    if (obj.conteudo[0].quantidade > 0) {
        var base_url = ((location.pathname.indexOf('tirapedido') >= 0) ? location.pathname+'?' : '?')
        var aLinkVerodosResultados = $("<a>");
        aLinkVerodosResultados.attr("href", base_url+"busca="+$("#inputBuscaTopo").val());
        aLinkVerodosResultados.text("Veja todos os resultados da busca ("+obj.conteudo[0].quantidade+")");
        p.append(aLinkVerodosResultados)
    } else {
        p.text("nenhum resultado encontrado com esse termo.");
    }

    return p;
}
function criaTopoPagina(){
    var base_url = (location.pathname.indexOf('tirapedido') >= 0) ? location.pathname+'' : '/';
    var bodyData = getBodyData();

    var divTopoPagina = $("#topoPagina");
    var ulLogo = $("<ul>");
    var liLogo = $("<li>");
    var aLinkLogo = $("<a>").attr("href", base_url);
    var divLogo = $("<div>");

    var liBusca = $("<li>");
    var labelBusca = $("<label>");
    var divResultadoBusca = $("<div>").addClass("busca-topo-resultados");
    var iconBusca = $("<i>");
    var inputBusca = $("<input>");
    var spanInputBusca = $("<span>");
    var btnFecharBusca = $("<span>");

    var liOpcoes = $("<li>");
    var ulOpcoes = $("<ul>");
        var liOpcoesUsuario = $("<li>");
            var iconUsuario = $("<i>");
            var spanUsuario = $("<span>");
            var strongUsuario = $("<strong>");
        var liOpcoesAtendimento = $("<li>");
            var iconAtendimento = $("<i>");
            var spanAtendimento = $("<span>");
        var liOpcoesAvisos = $("<li>").css('display', 'none');
            var iconAvisos = $("<i>");
            var spanAvisos = $("<span>");
            var ulAvisos = $("<ul>");
        var liOpcoesSacola = $("<li>");
            var iconSacola = $("<i>");
            var spanSacola = $("<span>");
            var divMsgAddSacola = $("<div>");


    ulLogo.addClass("elemento-responsivo");
        liLogo.addClass("logo");
        divLogo.attr("id", "logoTopo");
    liBusca.addClass("busca");
        labelBusca.attr("for","inputBuscaTopo");
        labelBusca.attr("id","labelBuscaTopo");
        divResultadoBusca.addClass("busca-topo-resultados").css("display","none");
        iconBusca.addClass("fal fa-search");
        spanInputBusca.attr("id", "spanInputBuscaTopo");
        btnFecharBusca.attr("id", "btnExcluirBuscaCarregando");
        inputBusca.attr("id", "inputBuscaTopo");
        inputBusca.attr("name","busca");
        inputBusca.attr("type", "text");
        inputBusca.attr("placeholder", "O que você procura?");
        
        liOpcoes.addClass("opcoes");

    divTopoPagina.append(ulLogo);
        ulLogo.append(liLogo);
        liLogo.append(aLinkLogo);
        aLinkLogo.append(divLogo);
        ulLogo.append(liBusca);
            liBusca.append(labelBusca);
                labelBusca.append(iconBusca);
                labelBusca.append(divResultadoBusca);
                liBusca.append(spanInputBusca);
                spanInputBusca.append(inputBusca);
                spanInputBusca.append(btnFecharBusca);
            ulLogo.append(liOpcoes);
    
    //função para mobile (celular) que ativa o campo de busca
    if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
        ativaFuncoesTopoParaMobile();
    }

}
function ativaFuncoesTopoParaMobile(){
    var elemBusca = $("#topoPagina .busca");
    var input = elemBusca.find("input");
    var elemsOpcoes = $("#topoPagina .opcoes");
    var html_iconFechar = '<i class="btn-remove-busca fal fa-times"></i>'

    $("#labelBuscaTopo").on("click", function(){
        $("#btnExcluirBuscaCarregando").html(html_iconFechar);
        elemBusca.addClass("topo-busca-on");
        input.css("display", "block");
        elemsOpcoes.css("display", "none");
        $('.cont-aovivo-topo').css('display', 'none');
    });
    $("#btnExcluirBuscaCarregando").on("click", function(){
        elemBusca.removeClass("topo-busca-on");
        input.css("display", "none");
        elemsOpcoes.css("display", "inline-block");
        resetBuscaTopo();
        $('.cont-aovivo-topo').css('display', 'inline-block');
    });
}

function verificaFormTopoLogin(campo) {
    var value  = campo.val();
    if (value.length > 5) {
        aplicaClasseInputRed(campo.attr("id"), false)
        campo.next().text("");
        return true;
    } else {
        aplicaClasseInputRed(campo.attr("id"), true)
        campo.next().text("Preenchimento incorreto");
        campo.focus();
        return false;
    }
}

function montaWhatsappRodape(response){

    if ($('.container-lead-rodape').length != 0) {
        return;
    }

    var bodyData = getBodyData();
    var responseAtendimento = response.atendimento;
    var iconeWhatsapp = response.img_whatsapp;
    var fotoVendedora = response.foto;
    var titulo = response.titulo;
    var mensagem = response.mensagem;
    var whatsapp = response.whatsapp;

    var containerIconeWhats = $('.content-whatsapp-rodape');
    var containerLead = $('<div>').addClass('container-lead-rodape');
    var content = $('<div>').addClass('content');
    var btn_fechar = $('<div>').addClass('cont-fechar').html('<i class="fal fa-times"></i>');
    var foto_vendedora = $('<div>').addClass('foto-vendedor').html('<div><img src="'+fotoVendedora+'"></div>');
    var cont_titulo = $('<div>').addClass('titulo').text(titulo);
    var cont_form = $('<div>').addClass('cont-form');
    var form = $('<form>').attr({id:'formLeadRodape', action: 'index.php'});
    var contInputNome = $('<div>').addClass('cont-input input-nome').html('<label></label>');
    var inputNome = $('<input>').attr({
        type: 'text',
        id: 'lead_nome',
        name: 'lead_nome',
        placeholder: 'Seu nome',
    });
    
    var contInputWhatsapp = $('<div>').addClass('cont-input input-whatsapp').html('<label></label>');
    var inputWhatsapp = $('<input>').attr({
        type: 'tel',
        id: 'lead_whats',
        name: 'lead_whats',
        maxlength: 15,
        placeholder: 'Seu WhatsApp',
    }).css({ // para ajustar com o select do ddi
        'margin-left': '50px',
        'width': 'calc(100% - 50px)'
    });

    var inputHiddenDDI = $('<input>').attr({
        type: 'hidden',
        id: 'lead_whatsddi',
        name: 'lead_whatsddi',
    });

    var contBtnSubmit = $('<div>').addClass('cont-btn').html('<button type="submit">Falar agora!</button>');

    contInputNome.find('label').append(inputNome)
    contInputWhatsapp.find('label').append(inputWhatsapp)
   
        
    form.append(contInputNome).append(contInputWhatsapp).append(inputHiddenDDI).append(contBtnSubmit);
    form.append(btn_fechar);
    cont_form.append(cont_titulo);
    cont_form.append(form);
    content.append(foto_vendedora);
    content.append(cont_form);
    containerLead.append(content);   
    containerIconeWhats.prepend(containerLead)


    var initialCountry = "br";
    if (global_bodyData.lang == "en") {
        initialCountry = "us";
    }
    var objInitTelInput = {
        autoHideDialCode: true,
        separateDialCode: false,
        initialCountry: initialCountry,
        preferredCountries: ["br","us"],
        countrySearch: true,
    };
    var inputTelCelular = document.querySelector("#lead_whats");
    var iti_telCelular = window.intlTelInput(inputTelCelular, objInitTelInput);
    var selectedCountryData = iti_telCelular.getSelectedCountryData();
    $('#lead_whatsddi').val(selectedCountryData.dialCode);

    inputTelCelular.addEventListener("countrychange", function(event){
        acoesTelInputCelular(iti_telCelular)
    });

    acoesTelInputCelular(iti_telCelular)


    btn_fechar.click(function(){
        $('.container-lead-rodape').fadeOut('fast', function(){
            $(this).remove();
        });
    });

    
    form.submit(function(event){
        event.preventDefault();

        var form = $(this);
        form.find('.erro').removeClass('erro');

        // validando
        var errosForm=[];
        var contNome = form.find('.cont-input.input-nome');
        var contWhatsapp = form.find('.cont-input.input-whatsapp');


        if (contNome.find('input').val().length < 3) {
            errosForm.push({
                content: contNome,
                erro: 'Nome inválido!'
            });
        }
        if (contWhatsapp.find('input').val().length < 10) {
            errosForm.push({
                content: contWhatsapp,
                erro: 'Telefone inválido!'
            });
        }


        $.each(errosForm, function(ind, val){
            val.content.addClass('erro');
        });
        if (errosForm.length > 0){
            return;
        }

       
        var success = function(data){
            var response = JSON.parse(data);
            sendPixel('lead');
            abreLibsWhatsAppWeb(response.whatsapp, response.mensagem);
        };

        requestApiLojaV2_POST("leads/atendimento", {}, {
            lead_qualpagina: verificaPaginaAtual(),
            lead_nome: contNome.find('input').val(),
            lead_whatsddi: form.find('[name="lead_whatsddi"]').val(),
            lead_whatsapp: contWhatsapp.find('input').val(),
            vendedor_ddi: response.ddi,
            vendedor_celular: response.celular,
            rastreio_vendedor: response.rastreio_vendedor,
        }, success, function(data){
            console.log(data)
        }, function(data){});

    });
}
function acoesTelInputCelular(iti){
    var selectedCountryData = iti.getSelectedCountryData();
    var newPlaceholder = intlTelInputUtils.getExampleNumber(selectedCountryData.iso2, true, intlTelInputUtils.numberFormat.INTERNATIONAL);
    var newMask = newPlaceholder.replace(/[1-9]/g, "0");
    $(iti.telInput).mask(newMask);
    $('#lead_whatsddi').val(selectedCountryData.dialCode);
}


function abreLibsWhatsAppWeb(cel, msg){
    var cel = parseInt(cel.replace(/[^0-9]/g,''));
    var link_whats = 'https://wa.me/+'+cel+'?text='+msg;
    location.href = link_whats;
}

function retornaElementoFotoAtendimento(v){
    if (v == "" || v == null) {
        return '<i class="fas fa-user-circle"></i>';
    } else {
        return $("<img>").attr("src", v);
    }
}


