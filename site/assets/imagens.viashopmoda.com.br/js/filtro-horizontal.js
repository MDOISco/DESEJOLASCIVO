$(function(){
    if (location.pathname == '/index2.php') {
        return;
    }
    carregaFiltroHorizontal();
});

//funções
function carregaFiltroHorizontal(){
    $.get("json/?token=VmpGU1MxSXlWbGhVYmxKWFlsUldZVlpxUm5ka01XeHlZVVpPYkZZd2JEVlpWV2hoWVcxS1dHUjZTbHBoYTJ0NFZGVmFjMWRIVWpaTlJEQTk=", function(data){
        var json = JSON.parse(data).montamenu;
        montaMenuHorizontal_principal(json);
    }).fail(function(){
        var objErro = {retorno: data, funcao:"carregaFiltroHorizontal"};
        montaErroGeralCarregarAjax(objErro);
        exeAjaxRequest("fail", {});
    }).always(function(){
        exeAjaxRequest("always", {});
    });
}

function montaMenuHorizontal_principal(json){
    var ul = $(".filtro-horizontal .elemento-responsivo");
    ul.html("");
    if (json.conteudo.length == 1) {
        ul.html('<li class="li-menu-filtro-horizontal"><div title="SEU MENU DE OPÇÕES">SEU MENU DE OPÇÕES</div></li>')
    } else {
        $.each(json.conteudo, function(index, value){
            var li = $("<li>").attr('id', 'liFiltroHorizontal_'+value.id).addClass("li-menu-filtro-horizontal");
            if (value.textoPrincipal.length > 25) {
                var verif_textoPrincipal = value.textoPrincipal.substr(0,23)+"...";
            } else {
                var verif_textoPrincipal = value.textoPrincipal;
            }
            //removerAcentos(value.textoPrincipal)
            var descricao = removerAcentos(value.descricao);
            if (descricao == "colecoes") {
                var cssSeparaConteudo = 'colecao'+value.id;
            } else if (descricao == "desconto") {
                var cssSeparaConteudo = 'descontos';
            } else {
                var cssSeparaConteudo = descricao+"-"+removerAcentos(value.textoPrincipal).toLowerCase();
            }
            var divMenu = $("<div>").addClass('texto').text(verif_textoPrincipal).attr("title", value.textoPrincipal);
            var divSub = $("<div>").addClass("conteudo-menu-horizontal "+cssSeparaConteudo);
            var divElemResponsivo = $("<div>").addClass("elemento-responsivo");
            var sectionSubMenu = $("<section>").addClass("categorias");
            //criando as opções do menu
            var ulSubMenu = montaMenuHorizontal_secundario(value);
            var sectionProdutoDest = montaMenuHorizontal_produtoDest(value.produtoprincipal, value);

            if (value.categorias.totalReg > 0) {
                ul.append(li);
                li.append(divMenu);
                li.append(divSub);
                divSub.append(divElemResponsivo);
                divElemResponsivo.append(sectionSubMenu);
                sectionSubMenu.append(ulSubMenu);
                divElemResponsivo.append(sectionProdutoDest);
            }
        });
        initMenuFiltroHorizontal();
    }
}

function initMenuFiltroHorizontal() {
    var tela = verificaTipoResolucaoPagina();
    var elem_menu = $(".li-menu-filtro-horizontal");

    // Abrir quando passar o mouse
    if (tela.tipoTela === "desktop") {
        elem_menu.mouseenter(abreMenuFiltroHorizontal).mouseleave(fechaMenuFiltroHorizontal);
        elem_menu.click(function(){
            window.open($(this).find('.conteudo-menu-horizontal .ver-todos').attr('href'), "_self");
        });
        // console.log(elem_menu.find('.conteudo-menu-horizontal .ver-todos').attr('href'))

    // Abrir quando clicar
    } else {
        elem_menu.click(function(e){
            if ($(this).hasClass('on') === false) {
                console.log($(this));
                $('html, body').animate({ scrollTop: ($(this).offset().top - ($('#topoPagina').outerHeight()+5))+'px'}, 500);
                $(".li-menu-filtro-horizontal").removeClass('on');
                $(this).addClass('on');
            } else {
                $(".li-menu-filtro-horizontal").removeClass('on');
            }
        })
    }
}
function abreMenuFiltroHorizontal(e) {
    $(this).addClass('on');
}
function fechaMenuFiltroHorizontal(e){
    $(this).removeClass('on');
}

function montaContImagem(imagem){
    var ul = $("<ul>");
    var li = $("<li>");



    ul.append(li);
    return ul;
}
function montaMenuHorizontal_secundario(json){
    var ul = $("<ul>");

    //criando o link de ver todos
    if (json.descricao == 'desconto') {
        var href_verTodos = '?desconto=1&ordenar=2';
    } else {
        var href_verTodos = '/'+json.descricao+'/'+replaceAll(removerCaracteresEspeciais(removerAcentos(json.textoPrincipal.toLowerCase()))," ", "-")+'-'+json.id+'.html';
    }
    var a_verTodos = $('<a>').addClass('ver-todos').attr('href', href_verTodos);
    var li_verTodos = $('<li>').text('todos de '+json.textoPrincipal);
    ul.append(a_verTodos);
        a_verTodos.append(li_verTodos);

    //each para criar as categorias
    $.each(json.categorias.conteudo, function(index, value){
        if (json.descricao == "desconto" && json.id == 1) { //verifica se for o filtro desconto e traz o ordenar na latex via GET
            var montaLink = json.descricao+"="+json.id+"&categorias="+value.codigo+"&ordenar=2";
        } else {
            var montaLink = json.descricao+"="+json.id+"&categorias="+value.codigo;
        }
        var aLink = $("<a>").attr("href","?"+montaLink);
        var li = $("<li>");
        li.text(value.textoPrincipal);
        ul.append(aLink);
        aLink.append(li);
    });
    return ul;
}

function montaMenuHorizontal_produtoDest(produtoPrincipal, json){

    if (json.descricao == 'desconto') {
        var link = '?desconto=1&ordenar=2';
    } else {
        var link = '/'+json.descricao+'/'+replaceAll(removerCaracteresEspeciais(removerAcentos(json.textoPrincipal.toLowerCase()))," ", "-")+'-'+json.id+'.html';
    }


    var section = $("<section>").addClass("produto-destaque");

    if (produtoPrincipal.totalReg == 0) {
        return section;
    }

    var a = $("<a>").attr("href", link);
    var divFoto = $("<div>").addClass("foto").css('background-image', 'url("'+alterarTamanhoDaFotoDoProduto(produtoPrincipal.conteudo[0].foto)+'")');
    var divDescricao = $("<div>").addClass("descricao").text("todos de "+json.textoPrincipal);


    section.append(a);
    a.append(divFoto.append(divDescricao));
    // a.append(divDescricao);
    return section;
}
