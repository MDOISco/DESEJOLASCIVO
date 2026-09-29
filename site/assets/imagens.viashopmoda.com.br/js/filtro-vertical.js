function abreMenuFiltroVertical() {
    $("#divFiltroVertical").find("ul").each(function(){
        var dis = $(this).css("display");
        var filtro = $(this).attr("id").split("_")[1];
        if (dis == "block"){
            $(this).parent().find("#"+filtro+" > i").addClass("fal fa-minus");
            $(this).parent().find("#"+filtro).toggleClass("filtro-vertical-titulo-noborder");
        }else {
            $(this).parent().find("#"+filtro+" > i").addClass("fal fa-plus");
        }
    });
    $(".filtros > p").click(clickToggleAbreMenuFiltro);
}
function clickToggleAbreMenuFiltro(event){
    var filtroClick = $(this);
    filtroClick.next().slideToggle();
    filtroClick.toggleClass("filtro-vertical-titulo-noborder");
    filtroClick.find("i").toggleClass("fa-minus");
    filtroClick.find("i").toggleClass("fa-plus");
}

function montaLiFiltros(filtros){
    var getFiltroHtml = getFiltroDeUrlComHtml();
    var tela = verificaTipoResolucaoPagina();
    var asideFiltros = $(".filtro-vertical").not(".carregando");
    var divFiltroVertical = $("<div>").attr("id", "divFiltroVertical").addClass("filtros").addClass("caixaGeral-sombra");
    $.each(filtros, function(ind, val){
        if (val.conteudo.length < 1){
            return
        }
        var ulFiltro = montaLiFiltroVertical(filtros, ind, val);
        
        var tituloFiltro = $("<p>");
        var i = $("<i>");

        tituloFiltro.text(val.nome);
        tituloFiltro.addClass("filtro-vertical-titulo");
        tituloFiltro.attr("id",ind);
        tituloFiltro.append(i);

        asideFiltros.append(divFiltroVertical);
        divFiltroVertical.append(tituloFiltro);
        
        divFiltroVertical.append(ulFiltro);
    });

    //quando mobile, mudar exibição dos filtros
    if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
        var spanTituloFechar = $("<span>").addClass("titulo-fechar").html('<i class="fal fa-times"></i>fechar');
        $("#divFiltroVertical").prepend(spanTituloFechar)
        var divMobileFiltro_Geral = $("<div>").addClass("btn-filtros-mobile");
        var divMobileFiltro_Filtrar = $("<div>").addClass("btnMobile-abre-filtro").html('filtrar<i class="fas fa-filter"></i>');
        var divMobileFiltro_Ordenar = $("<div>").addClass("btnMobile-abre-ordenar").html('ordenar<i class="fas fa-sort-size-down-alt"></i>');
        asideFiltros.append(divMobileFiltro_Geral);
            divMobileFiltro_Geral.append(divMobileFiltro_Filtrar);
            divMobileFiltro_Geral.append(divMobileFiltro_Ordenar);

        //ativando botoes para abrir filtro
        $(".btnMobile-abre-filtro").on("click", function(){
            $("#divFiltroVertical p, #divFiltroVertical ul").css("display", "block");
            $("#ordenar").css("display", "none");
            $("#filtroVertical_ordenar").css("display", "none");
            $("#divFiltroVertical").slideDown();
        });
        $(".btnMobile-abre-ordenar").on("click", function(){
            $("#divFiltroVertical p, #divFiltroVertical ul").css("display", "none");
            $("#ordenar").css("display", "block");
            $("#filtroVertical_ordenar").css("display", "block");
            $("#divFiltroVertical").slideDown();
        });

        $(".titulo-fechar").on("click", function(){
            $("#divFiltroVertical").slideUp();
        });
    }

    if (tela.tipoTela != 'desktop'){
        if (getFiltroHtml != null){
            // divFiltroVertical.append($('<a>').attr({
            //     href: '/',
            // }).addClass('remover-filtros-no-filtro').text('Remover filtros'));
        }
    }

}
function limitaExibicaoDosFiltros(filtro){
    var filtrosLi = filtro.find("a");
    var filtroNome = filtro.attr("id").split("_")[1];
    var filtroNomeTxt = $("#"+filtroNome).text();
    var idVerMais = "verMais_"+filtroNome;
    var limitarQtdFiltro = 15;
    if (filtrosLi.length >= limitarQtdFiltro) {
        $.each(filtrosLi, function(index, val){
            if (index >= limitarQtdFiltro) {
                $(this).css("display","none");
            }
        });
        var aVerMais = $("<p>").addClass("filtro-vertical-vermais").attr("id", idVerMais).text("Ver Mais");
        filtro.append(aVerMais);
        // filtro.css("background-color","red");
    }
}
function initialBtnVermaisFiltroVertial() {
    $(".filtro-vertical-vermais").click(function(){
        var nomeFiltro = $(this).parent().attr("id").split("_")[1];
        if (nomeFiltro == "tamanhos" || nomeFiltro == "cores") { var displayNome = "inline-block";}
        else { var displayNome = "block"; }
        var liFiltros = $(this).parent().find("a");
        $.each(liFiltros, function(){
            $(this).fadeIn();
        });
        $("#verMais_"+nomeFiltro).css("display","none");
    });
}
function montaLiFiltroVertical(filtros, indFiltro, valFiltro){
    var ul = $("<ul>");
    ul.attr("id", "filtroVertical_"+indFiltro);
    $.each(valFiltro.conteudo, function(indConteudo, valConteudo){
        var codigo = parseInt(valConteudo.codigo);
        var textoPrincipal = replaceAll(valConteudo.textoPrincipal, '/', " ");
        var descricao = valConteudo.descricao;

        var a = $("<a>");
        var li = $("<li>");
        
        var li_class = "";
        var tagA_id = "liFiltroVertical_"+indFiltro+"_"+codigo;
        var tagA_title = descricao;


        if (indFiltro == "cores") {
            var tagA_href = descricao;
            var verifCorestampa = verificaRetornoCssEstampaCor(valConteudo.textoPrincipal);
            li.css(verifCorestampa.attr, verifCorestampa.cont);
        } else {
            var tagA_href = textoPrincipal;
            var verifCorestampa = verificaRetornoCssEstampaCor(valConteudo.textoPrincipal);
            li.text(valConteudo.textoPrincipal);
        }
        if (indFiltro == "tamanhos") {
            li_class = "notranslate";
        }

        
        // condição para tratar o filtro "preços", poisse ele virem zerados não é para exibi-los na página. 
        // Mas eles podem vir undefined ou maior que 1
        if (valConteudo.contaprodutos != 0) {
            a.attr("href", montaNovoLinkFiltroVertical(
                indFiltro,
                tagA_href,
                codigo)
            );
            a.attr("id", tagA_id)
            if (tagA_title != textoPrincipal) {
                a.attr("data-title", tagA_title);
            }
            li.addClass(li_class);
            a.append(li);
            ul.append(a);
        }
    });

    limitaExibicaoDosFiltros(ul);
    return ul;
}
function verifUrlGetFiltroHtml(){
    var urlAtual = window.location.href;
    var verifUrlAtual = urlAtual.split(".");
    var filtrosSelecionados = [];
    if (verifUrlAtual[verifUrlAtual.length-1].substring(0,4) == "html") {
        return true;
    } else {
        return false;
    }
}

function montaNovoLinkFiltroVertical(sessao, filtro, valor) {
    var sessao = sessao.toLowerCase();
    var search = searchToObject();
    var getFiltroHtml = getFiltroDeUrlComHtml();
    var verifSeTiraPedido = location.pathname.indexOf('tirapedido');
    var queryString = '';

    // nao é filtro unico de .html
    if (getFiltroHtml){
        search[getFiltroHtml.key] = getFiltroHtml.value;
    }

    // existe alguma busca no get
    if (Object.values(search).length > 0){
        search[sessao] = valor;
        queryString = new URLSearchParams(search).toString();
        queryString = '?'+queryString;

    // nao existe busca no get
    } else {
        var filtro = replaceAll(removerCaracteresEspeciais(removerAcentos(filtro.toLowerCase()))," ", "-");
        queryString = sessao+'/'+filtro+'-'+valor+'.html';
        if (verifSeTiraPedido != -1){
            queryString = '?'+sessao+'='+valor;
        }
    }

    if (verifSeTiraPedido != -1){
        queryString = 'tirapedido'+queryString;
    }

    return queryString;



    return '';
    if (verifUrlGetFiltroHtml()) { //quando se tem apenas 1 filtro selecionado - retorna html true
        var removeExtensaoHtml = urlAtual.split(".html")[0];
        var splitUrlAtual = removeExtensaoHtml.split("/");
        var sessaoAtual = splitUrlAtual[3];
        var splitValorAtual = splitUrlAtual[4].split("-");
        var valorAtual = splitValorAtual[splitValorAtual.length - 1];
        if (sessaoAtual == sessao || sessao == "pre-venda") {
            var retorno = sessao+"/"+filtro+"-"+valor+".html";
        } else {
            var retorno = "?"+sessaoAtual+"="+valorAtual+"&"+sessao+"="+valor;
        }
    } else {
        var verifFiltroJaExistente = getFiltroSelecionados(nossosFiltros);
        console.log(verifFiltroJaExistente)
        if (verifFiltroJaExistente.length > 0 || location.pathname.indexOf('tirapedido') >= 0) {
            
            if (objSearch.vitrine != undefined) {
                verifFiltroJaExistente.push({sessao:'vitrine', valor:objSearch.vitrine});
            }
            // var arrVarsGet = verifFiltroJaExistente.substr(1).split("&");
            var verifAddNovoFiltro = true;

            var objUrl = [];
            $.each(verifFiltroJaExistente, function(index, value){
                var data = [];
                // var getsessao = value.split("=")[0];
                // var getValor = value.split("=")[1];
                var getsessao = value.sessao;
                var getValor = value.valor;

                if (getsessao == sessao){
                    data["sessao"] = sessao;
                    data["valor"] = valor;
                    verifAddNovoFiltro = false
                } else {
                    data["sessao"] = getsessao;
                    data["valor"] = getValor;
                }
                if (verifAddNovoFiltro){
                    var retorno = doRetorno+"&"+sessao+"="+valor;
                } else {
                    var retorno = doRetorno;
                }
                objUrl.push(data);
            });

            var doRetorno = location.pathname+"?";
            $.each(objUrl, function(index, value){
                doRetorno = doRetorno+value["sessao"]+"="+value["valor"]+"&";
            });
            if (verifAddNovoFiltro){
                var retorno = doRetorno+sessao+"="+valor;
            } else {
                var retorno = doRetorno.substr(0,doRetorno.length-1);
            }

        } else {
            var retorno = sessao+"/"+filtro+"-"+valor+".html"; //caso nao ter selecionado nenhum filtro ainda.
        }
    }
    console.log(retorno)
    return retorno;
}
function getFiltroSelecionados(filtros=null){
    var obj=[];
    var search={};

    if (location.href.indexOf('.html') != -1) {
        var split_pathname = location.pathname.replace('.html', '').split('/');
        var split_id = split_pathname[2].split("-");
        search[split_pathname[1]] = split_id[split_id.length - 1];
    } else {
        search = searchToObject();
    }

    //add filtros manuais aos nossos filtros
    if (search.busca){
        filtros.busca = {
            name: 'busca',
            nome: 'busca',
            conteudo: []
        }
    }

    $.each(search, function(ind, val){
        if (!filtros[ind]){
            return;
        }
        var data = [];
        data["nome"] = filtros[ind].nome;
        data["sessao"] = ind;
        data["valor"] = val;
        var indNomeFiltroSel = $.inArray(val, array_column(filtros[ind].conteudo, 'codigo'));

        if (indNomeFiltroSel != -1){
            var nomeFiltroSel = filtros[ind].conteudo[indNomeFiltroSel].textoPrincipal;
            switch(ind) {
                case 'cores':
                var nomeFiltroSel = filtros[ind].conteudo[indNomeFiltroSel].descricao;
                break;
            }
            data["nomeFiltroSel"] = nomeFiltroSel;
            data["nomeFiltroSel"] = nomeFiltroSel;
        }

        obj.push(data);
    });
    return obj;
}
function montaLiFiltrosSelecionados(filtrosSelecionados){
    
    var objSearch = searchToObject();
    var divFiltroVertical = $(".filtro-vertical");
    divFiltroVertical.find(".selecionados").remove();
    var p = $("<p>").addClass("filtro-vertical-titulo").css("border","none").text("filtros selecionados")
    var div = $("<div>").addClass("selecionados").addClass("caixaGeral-sombra");
    var ul = $("<ul>");


    var btnLimpar = $("<a>").attr("title","LIMPAR FILTROS").addClass("btn-caixaGeral-sombra").text("limpar filtros");
    
    if (location.pathname.indexOf('tirapedido') != -1) {
        var urlTiraPedido = location.pathname;
        if (objSearch.vitrine != undefined){
            urlTiraPedido += "?vitrine="+objSearch.vitrine;
        }
        btnLimpar.attr('href', urlTiraPedido);
    } else {
        btnLimpar.attr('href', "/");
    }
    
    btnLimpar.prepend($("<i>").addClass("fal fa-times"));

    var li_buscaNosFiltros = montaContainerBuscarNosFiltros(filtrosSelecionados);
    ul.append(li_buscaNosFiltros);
    li_buscaNosFiltros.find(".fa-times").click(function(){
        clickRemoverFiltro(filtrosSelecionados, 'busca');
    });

    $.each(filtrosSelecionados, function(index, value){
        var sessao = value.sessao;
        var iconeFechar = '<i class="fal fa-times"></i>';
        var li = $("<li>").addClass("btn-removeFiltro").attr("data-nomesessao", sessao).html(iconeFechar+value.nomeFiltroSel);

        var icone = $("<span>").addClass("fal fa-check")
        if (sessao != 'cores') {
            icone.css('padding-right', '5px');
        }
        $($("#filtroVertical_"+sessao+' a')[0]).find('li').prepend(icone);

        if (!value.nomeFiltroSel) {
            return;
        }

        li.click(function(){
            clickRemoverFiltro(filtrosSelecionados, sessao);
        });

        ul.append(li);
    });
    divFiltroVertical.prepend(div);
    div.append(p);
    div.append(ul);
    div.append(btnLimpar);

    //ao selecionar o filtro deletaremos os banner da index
    $(".banners-index ul").html("");
}
function montaContainerBuscarNosFiltros(){
    var search = searchToObject();
   
    var label = $("<label>");
    var div = $("<div>");
    var input = $("<input>").attr({
        'type': 'text',
        'id': 'inputBuscaNoFiltro',
        // 'value': replaceAll(obj.valor, "-", " "),
        'value': (search.busca) ? search.busca : '',
        'placeholder': 'Buscar nos filtros',
    });
    var iconeFechar = $("<i>").addClass("fal fa-times");
    var iconeBuscar = $("<i>").addClass("fal fa-search");
    var li = $("<li>").addClass("filtrosel-busca").attr("data-nomesessao", 'busca');

    if (search.busca){
        li.append(iconeFechar);
    }
    label.append(div);
    div.append(input);
    div.append(iconeBuscar);
    li.append(label);

    iconeBuscar.click(function(){
        var inputVal = removerCaracteresEspeciais($(this).parent().find("input").val());
        var queryString = '';

        // verificando se estamos em uma pagina de filtro unico (.html) mas não sendo de um produto
        if (location.pathname.indexOf('.html') != -1) {
            var splitUrl = location.pathname.replace('.html', '').split('/');
            var splitId = splitUrl[2].split('-');
            search[splitUrl[1]] = splitId[splitId.length-1];
        }

        search.busca = inputVal;
        queryString = new URLSearchParams(search).toString();
        window.open('?'+queryString, "_self");
    });
    input.keypress(function(e){
        if(e.which == 13){//Enter key pressed
            iconeBuscar.click();//Trigger search button click event
        }
    });

    return li;
}
function clickRemoverFiltro(filtrosSelecionados, sessaoClicada){
    var montaRetorno = "";
    $.each(filtrosSelecionados, function(index, value){
        if (value.sessao != sessaoClicada) {
            montaRetorno = montaRetorno+value.sessao+"="+value.valor+"&";
        }
    });
    var base_url = (location.pathname.indexOf('tirapedido') >= 0) ? "tirapedido?" : "?";
    var retorno = base_url+montaRetorno.substring(0,(montaRetorno.length-1));
    window.open(retorno, "_self");
}
