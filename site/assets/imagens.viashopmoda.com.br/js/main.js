//globals
const global_tela = verificaTipoResolucaoPagina();
var verifExecProdRelacionados = false;
var idsProdutosRelacionados = null;
const global_traducao = leJsonInfosGeraisForms();
var global_precoUnitProduto;
var global_objPrecoPorGrade = [];
var global_objTodosProdutosSelecionados = [];
var global_tokenSubmit = [];
var global_bodyData = {
    plataforma: $('body').attr('data-plataforma'),
    moeda: $('body').attr('data-moeda'),
    lang: $('body').attr('data-lang'),
    langBrowser: $('body').attr('data-lang-browser'),
    device: $('body').attr('data-device'),
    app: $('body').attr('data-app'),
    tokenApiLoja: $('body').attr('data-token-api-loja'),
    tokenClienteApiLoja: $('body').attr('data-token-cliente-api-loja'),
    // dataIdTrack: $('body').attr('data-idtrack'),
}
var getBodyData = function(){
    return {
        plataforma: $('body').attr('data-plataforma'),
        moeda: $('body').attr('data-moeda'),
        lang: $('body').attr('data-lang'),
        langBrowser: $('body').attr('data-lang-browser'),
        device: $('body').attr('data-device'),
        app: $('body').attr('data-app'),
        urlBase: $('body').attr('data-urlbase'),
        subdominioImagens: "https://"+$('body').attr('data-subdominio-imagens')+".",
    };
};

  
$(function(){

    const target = document.body;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'style') {
                // console.log('%cAlteração detectada no style do BODY!', 'color: red; font-size: 16px;');
                // console.log('Novo style:', document.body.getAttribute('style'));
                // console.log('Stack trace:');
                // console.trace();
                var identificarAttrTop = $('body').attr('style').indexOf('top: 40px');
                if (identificarAttrTop > -1) {
                    $('body').css('top', 0);
                }
            }
        });
    });
    observer.observe(target, { attributes: true });


    // startDebugApp();

    var search = searchToObject();

    $.ajaxSetup({
        headers: {
            tokenApiLoja: global_bodyData.tokenApiLoja
        }
    });

    getPixelsDeIntegracao();

    criaBtnGeralSubirTopoPagina();

    $(window).scroll(function() {
        var scrollAtual = $(window).scrollTop();
        acaoScrollBtnGeralSubirTopoPagina();
    });

    global_tokenSubmit = getTokenSubmit();

    if (location.pathname == "/pagamentoconcluido") {
        $.get("json/?token=VjFSQ2ExSXlTbk5pUm1oT1ZqTm9jRmx0ZUV0TmJGWlZVMVJXYTFadGREVmFWVkpIWVVaWmVGTnFTVDA9", {pedido: getUrlByGetPosInterrogacao()}, function(data){
        }).fail(function(){
            exeAjaxRequest("fail", {});
        }).always(function(){
            exeAjaxRequest("always", {});
        });
    
    }
   
    window.onbeforeunload = function(){
        processaStorageHistory("ADD", window.location.href);
    };

});

function startDebugApp(){
    var debugApp=[];
    var bodyData = getBodyData();
    var cookieLogin = getCookieLogin();
    var sessionId = getCookieSessionId();

    // if (bodyData.app == "N"){
    //     debugApp.push('DESKTOP');
    // } else {
    //     debugApp.push(bodyData.app);
    // }
    // debugApp.push('?'+location.search);
    // debugApp.push(sessionId);
    if (cookieLogin){
        debugApp.push(cookieLogin.cliente+':'+cookieLogin.data);
    }
    // debugApp.push('tokennotify: '+getCookie('tokennotify'));

    // debugApp.push('<hr>>>>'+document.cookie.split('; ').join('<br>>> '));

    $('#topoPagina').after($('<div>').attr({
        'data-debugapp': 'sim'
    }).css({
        'position': 'absolute',
        'background-color': 'black',
        'color':'white',
        'padding': '5px',
        'z-index': '10000',
        'width': '100%',
        'box-sizing': 'border-box',
        'overflow-wrap': 'anywhere'
    }).html(debugApp.join("<br>")));

}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function leJsonInfosGeraisForms(){
    var elem = $('#jsonInfosGeraisForms');
    var obj = JSON.parse(elem.text());
    $.map(obj, function(val, ind) {
        if (ind.indexOf('html_') != -1) {
            delete obj[ind];
        }
    });
    return obj;
}
function importarArquivos(obj){
    var date = new Date();
    if (obj == undefined) {
        console.log("modulo não encontrado");
        return;
    }

    var id_import = obj.name+'Import';

    if (obj.css != undefined) {
        $.each(obj.css, function(ind, val){
            if ($('link[href*="'+val+'"]').length === 0) {
                var tag = $('link');
                var file = $('<link>').attr({
                    id: 'css_'+id_import,
                    rel: 'stylesheet',
                    href: val+'?'+date.getTime()
                });
                $(tag[tag.length-1]).after(file);
            }
        })
    }
    if (obj.js) {
        $.each(obj.js, function(ind, val){
            if ($('script[src*="'+val+'"]').length === 0) {
                var tag = $('script');
                var file = $('<script>').attr({
                    id: 'js_'+id_import,
                    type: (obj.type == undefined) ? 'text/javascript' : obj.type,
                    src: val+'?'+date.getTime()
                });
                if (obj.async){
                    file.prop('async', true);
                }
                $(tag[tag.length-1]).after(file);
            }
        })
    }
    return;
}

function modulosParaImportar(modulo){
    if (modulo==undefined){
        console.log("módulo '"+modulo+"' não enviado");
        return;
    }
    var modulos = {
        frete: {
            name: 'cotarfrete',
            js: ['../scripts/cotar-fretes/cotar-fretes.js'],
            css: ['../scripts/cotar-fretes/cotar-fretes.css'],
            async: true
        },
        buscarEndereco: {
            name: 'buscarEndereco',
            js: ['../scripts/buscar-endereco/buscar-endereco.js'],
            css: ['../scripts/buscar-endereco/buscar-endereco.css'],
            async: true
        },
        clientesDepoimentos: {
            name: 'clientesDepoimentos',
            js: ['./js/clientes-depoimentos.js'],
            css: ['./css/clientes-depoimentos.css'],
            async: true
        },
        requests: {
            name: 'requests',
            js: ['./js/requests.js'],
        },
        animacaoConfetti: {
            name: 'animacaoConfetti',
            css: ['./libs/jquery-animacoes/confetti.css'],
            js: ['./libs/jquery-animacoes/confetti.js'],
        },
        alerts: {
            name: 'alerts',
            css: ['./libs/jquery-alerts/alerts.css'],
            js: ['./libs/jquery-alerts/alerts.js'],
        },
        jqueryCountDown: {
            name: 'jqueryCountDown',
            js: ['./libs/jquery.countdown-2.0.2/jquery.countdown.min.js'],
        },
        btnShare: {
            name: 'btnShare',
            css: ['./libs/jquery-btn-share/btn-share.css'],
            js: ['./libs/jquery-btn-share/btn-share.js'],
        },
        recuperarSenha: {
            name: 'recuperarSenha',
            css: ['./libs/modal-recuperar-senha/modal-recuperar-senha.css'],
            js: ['./libs/modal-recuperar-senha/modal-recuperar-senha.js'],
        },
    };
    return modulos[modulo]
}

function searchToObject() {
    var pairs = window.location.search.substring(1).split("&"),
      obj = {},
      pair,
      i;
  
    for ( i in pairs ) {
      if ( pairs[i] === "" ) continue;
  
      pair = pairs[i].split("=");
      obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
    }
  
    return obj;
}

function transformaCepParaInt(cep){
    return cep.replace(/-/g, "");
}


function removeCaracteresEspeciaisDoInput(){
    $('input').on("input", function(){
        var val = $(this).val();
        var replace = replaceAll(val, "'", "");
        $(this).val(replace);
    });
}

function lerRetornoJson(codigo, responseJson){
    if (responseJson.redirecionar != undefined && responseJson.redirecionar != ""){
        location.href = responseJson.redirecionar;
    }
}

function addHtmlBtnCarregando(buttonElem){
    var traducao = leJsonInfosGeraisForms();
    var novoElem = {
        html: buttonElem.attr('data-html-original'),
        prop: {
            disabled: false
        }
    }
    if (!buttonElem.prop('disabled')) {
        buttonElem.attr({
            'data-html-original': buttonElem.html(),
        });
        novoElem.prop.disabled = true;
        novoElem.html = '<i class="fa-duotone fa-spinner fa-spin"></i>'+traducao.texto_carregando;
    } else {
        buttonElem.attr({
            'data-html-original': '',
        });
    }
    buttonElem.prop(novoElem.prop).html(novoElem.html);
}

function travaScrollDoBody(origem, travar=true){
    var body = $('body');
    if (travar){
        if (
            body.attr('data-origem-trava-scroll') == undefined ||
            body.attr('data-origem-trava-scroll') == ""
        ){
            body.attr('data-origem-trava-scroll', origem);
        }
        body.css("overflow", "hidden");
    } else {
        if (body.attr('data-origem-trava-scroll') == origem){
            body.css("overflow", "unset");
            body.attr('data-origem-trava-scroll', "");
        }
    }
}


function criaBtnGeralSubirTopoPagina(){
    var btnSubirPagina = $("<div>").attr("id", "btnGeralSubirPagina").addClass('btn-bolinha').html('<i class="fal fa-arrow-up"></i>');
    $("body").append(btnSubirPagina);

    $("#btnGeralSubirPagina").click(function(){
        $('html, body').animate({ scrollTop: '0px'}, 1000); //rola pagina ate a proxima sessao
    });
}
function acaoScrollBtnGeralSubirTopoPagina(){
    if (verificaPaginaAtual().split("_")[0] != "iframe") {
        var posicaoScrollAtual = $(window).scrollTop();
        var tamanhoTela = $(window).height();
        var posicaoFooter = $("footer").offset().top;

        if (posicaoScrollAtual >= tamanhoTela - 90) {
            $("#btnGeralSubirPagina").addClass("btn-subir-aparece");
            if (posicaoScrollAtual+tamanhoTela > posicaoFooter) {
                var top_ParaNoFooter = posicaoFooter - ($("#btnGeralSubirPagina").height()+60);
                $("#btnGeralSubirPagina").addClass("paraNoFooter").css("top", top_ParaNoFooter);
            } else {
                $("#btnGeralSubirPagina").removeClass("paraNoFooter").css("top", "unset");
            }
        } else {
            $("#btnGeralSubirPagina").removeClass("btn-subir-aparece");
        }
    }
}

function exePlayerVideo(cont_video, dimensoes){
    /**
     * Transforma codvideo em int e verifica se NaN é youtube se não é vimeo
     */
    if (isNaN(cont_video.attr('data-codvideo'))) {
        // console.log('youtube');
        exeYoutubePlayer(cont_video, dimensoes);
    } else {
        // console.log('vimeo');
        exeVimeoPlayer(cont_video, dimensoes)
    }

}

function getNomeUsuarioLogadoDOM(){
    var v = $("#topoMenuUsuario span strong").text();
    if (v.length < 1) {
        return "";
    } else {
        var prim = v.substr(0,1).toUpperCase();
        return " "+prim+v.substr(1,v.length);
    }
}
function getUrlJs(retorno) { //retorno a variavel get declarada na var retorno na chamada da função getUrlJs("idproduto")
    var parts = window.location.search.substr(1).split("&");
    var $_GET = {};
    for (var i = 0; i < parts.length; i++) {
        var temp = parts[i].split("=");
        $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    return $_GET[retorno];
}

function carregandoElemento(idElemento, status) {
    if (status) {
        var span = $("<span>").attr("id", "carregandoEelemento").append($("<i>").addClass("fa-duotone fa-spinner fa-spin"));
        $(idElemento).prepend(span);
    } else {
        var span = $(idElemento+" #carregandoEelemento");
        span.fadeOut(function(){
            $(this).remove();
        });
    }
}

// function carregandoPagina(status, mensagem) {
//     $("#carregaPagina p").html(mensagem);
//     if (status == true) {
//         $("#carregaPagina").fadeIn();
//     } else {
//         $("#carregaPagina").fadeOut();
//     }
// }
function verificaPaginaAtual(){
    var url = window.location.pathname;
    var retorno;
    var splitUrl = url.split("/")[1];
    if (splitUrl.length == 0) { //index
        retorno = "index";
    } else {
        if (splitUrl.split(".")[1] == "html") {
            retorno = "produto";
        } else {
            retorno = splitUrl;
        }
    }
    return retorno;
    // return splitUrl[splitUrl.length-1]
}

function empty(e) {
    switch (e) {
      case "":
      case 0:
      case "0":
      case null:
      case false:
      case undefined:
        return true;
      default:
        return false;
    }
  }
// function mostraLogoNoTopo () {
//     var posicaoAtual = $(this).scrollTop();
//     var posicaoFiltroHorizontal = $(".filtro-horizontal").offset().top;
//     //faz aparecer a logomarca no topo
//     if (posicaoAtual > posicaoFiltroHorizontal) {
//         $(".logo > div").stop().fadeIn();
//     } else {
//         $(".logo > div").stop().fadeOut();
//     }
// }

function valorMonetario (valor) {
    if (valor == undefined) {
        return "";
    } else {
        return valor.replace('.',',');
    }
}

function array_column(a,i,ok) {
    return a.reduce((c,v,k) => ok===undefined ? [c[k]=v[i],c][1] : [c[v[ok]]=i===null?v:v[i],c][1],[]);
}
function aplicaClasseInputRed(id, status){
    if (status == true) {
        $("#"+id).addClass("input-red");
    } else {
        $("#"+id).removeClass("input-red");
    }
}

function aplicaClasseInputGreen(id, status){
    if (status == true) {
        $("#"+id).addClass("input-green");
    } else {
        $("#"+id).removeClass("input-green");
    }
}

function getFiltroDeUrlComHtml(){
    if (location.pathname.indexOf('.html') == -1) {
        return null;
    }
    var splitUrl = location.pathname.replace('.html', '').split('/');
    var splitId = splitUrl[2].split("-");

    var ret = {};
    ret.key = splitUrl[1];
    ret.value = splitId[splitId.length-1];
    return ret;

}

function transformaInteiro (v){
    return parseFloat(v.replace(",", "."));
}
function somenteNumeros(str){
    if (typeof str != 'string') {
        return str;
    }
    return str.replace(/\D+/g, '');
}
function formataValor(valor) {
    valor = valor.toString().replace(/\D/g,"");
    valor = valor.toString().replace(/(\d)(\d{8})$/,"$1.$2");
    valor = valor.toString().replace(/(\d)(\d{5})$/,"$1.$2");
    valor = valor.toString().replace(/(\d)(\d{2})$/,"$1,$2");
    if (valor.substr(0,1) =="-") {
        return "-"+valor;
    } else {
        return valor;
    }
}
function formataValorFloatParaMonetario(moeda, _valor){
    var valor = parseFloat(_valor);
    switch (moeda) {
        case 'BRL':
            locales = 'pt-BR';
            simbolo = 'R$';
            break;
        case 'USD':
            locales = 'en-IN';
            simbolo = '$';
            break;
        case 'EUR':
            locales = 'en-IN';
            simbolo = '€';
            break;
    }
    var formata = parseFloat(valor).toLocaleString(locales, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return simbolo+' '+formata;
}

function removerAcentos(str) {
    var string = str;
    var mapaAcentosHex = {
        a : /[\xE0-\xE6]/g,
        A : /[\xC0-\xC6]/g,
        e : /[\xE8-\xEB]/g,
        E : /[\xC8-\xCB]/g,
        i : /[\xEC-\xEF]/g,
        I : /[\xCC-\xCF]/g,
        o : /[\xF2-\xF6]/g,
        O : /[\xD2-\xD6]/g,
        u : /[\xF9-\xFC]/g,
        U : /[\xD9-\xDC]/g,
        c : /\xE7/g,
        C : /\xC7/g,
        n : /\xF1/g,
        N : /\xD1/g,
    };

    for ( var letra in mapaAcentosHex ) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace( expressaoRegular, letra );
    }

	return string;
}

function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null; // caso não exista
}
function getCookieLogin(){
    var cookie = getCookie('CookPrimeiroAcesso');
    if (cookie){
        return JSON.parse(cookie);
    }
    return null;
}
function getCookieSessionId(){
    return getCookie('PHPSESSID');
}

/*********************************************************************************************************/
/*********************************************************************************************************/
// function apiBuscaCep(cep, destino, codigoPais='br'){
//     // console.log(apiBuscaCep.caller);
//     // return;
//     var cep = transformaCepParaInt(cep);
//     if (codigoPais == 'br') {
//         if (cep.length != 8){return;}

//         $.get("https://viacep.com.br/ws/"+cep+"/json/", function(data){
//             console.log(data)
//             preecheEnderecoPosBuscaCep(data, destino);
//         }).fail(function(){}).always(function(){});

//     } else {
//         console.log(cep, destino, codigoPais);
//         return;
//         if (cep.length < 4){return;}

//         var query = {
//             acao: 'consultarCodigoPostal',
//             pais: codigoPais,
//             codigopostal: cep,
//         };
//         console.log(query)
//         requestApiLoja_GET(query, function(data){
//             console.log(data);
//             preecheEnderecoPosBuscaCep(JSON.parse(data), destino);
//         });
//     }
// }


/* FORMULARIOS */
function initialInputsEffect(){

    //para campos ja preenchidos
    $.each($(".input-effect"), function () {
        var label = $(this).find("label");
        var div = $(this).find(".div");
        var input = $(this).find(".input");
        if ($(this).find(".input").val() != "" && $(this).find(".input").val() != undefined) {
            div.addClass("div-focus");
            input.addClass("input-focus");
        }
        if ($(this).find("select").prop("tagName") == "SELECT"){
            if ($(this).find('select').data('inputeffect') == false){return;}
            $(this).prepend($('<i class="icone-dropdown-options fal fa-chevron-down"></i>'));
        }
    });
    $.each($(".checkbox-effect"), function(){
        if ($(this).find('.checkbox-effect-icon').length > 0){return;}
        var input = $(this).find("input");
        input.css("display", "none");
        var checkboxIcon = $("<span>").addClass("checkbox-effect-icon");
        $(this).find("label").find("div").prepend(checkboxIcon);
    });
    $.each($(".radio-effect"), function(){
        if ($(this).hasClass('inited') == false && $(this).find('.radio-options').length > 0) {
            $(this).addClass('inited');
            var input = $(this).find("input");
            input.css("display", "none");
            var checkboxIcon = $("<span>").addClass("radio-effect-icon");
            input.parent().find(".div").prepend(checkboxIcon);

            input.on("change", function(){
                changeRadioEffect($(this));
            });    
        }
    });
    changeRadioEffect($('.radio-effect input[data-checked="true"]'));

    //clicar na seta do select input-effect i.fa-chevron-down
    $(".input-effect i.fa-chevron-down").click(function(){
        inputEffectAcao($(this).parent(), true);
    });
    // $(".input-effect").on("focusin", function () {
    $(".input-effect").on("click", function () {
        if ($(this).find(".input").val() != undefined){
            inputEffectAcao($(this), true);
        }
    });
    $(".input-effect").on("focusin", function () {
        inputEffectAcao($(this), true);
    });
    // $(".input-effect").on("focusout", function () {
    $(".input-effect input, .input-effect select").on("blur", function () {
        inputEffectAcao($(this).parent().parent(), false);
    });
    $(".input-effect").on("focusout", function () {
        inputEffectAcao($(this), false);
    });

    $(".checkbox-effect input").on("change", function(){
        $(this).parent().parent().parent().find("label").removeClass("input-effect-red");
        if ($(this).prop("checked") == true) {
            $(this).parent().find(".checkbox-effect-icon").removeClass("fa-square");
            $(this).parent().find(".checkbox-effect-icon").addClass("fa-check-square");
        } else {
            $(this).parent().find(".checkbox-effect-icon").removeClass("fa-check-square");
            $(this).parent().find(".checkbox-effect-icon").addClass("fa-square");
        }
    });
}

function changeRadioEffect(input){
    var thisVal = input.val();
    var tagName = input.attr("name");
    input.parent().parent().parent().find(".radio-options").removeClass("radio-option-checked");
    input.parent().parent().parent().find(".radio-options").removeClass("radio-effect-red");
    $.each($('input[name="'+tagName+'"]'), function(){
        if (thisVal == $(this).val()) {
            $(this).parent().find(".radio-effect-icon").removeClass("fa-circle");
            $(this).parent().find(".radio-effect-icon").addClass("fal fa-dot-circle");
            $(this).parent().parent().addClass("radio-option-checked");
            $(this).prop('checked', true);
        } else {
            $(this).parent().find(".radio-effect-icon").removeClass("fa-dot-circle");
            $(this).parent().find(".radio-effect-icon").addClass("fa-circle");
            $(this).parent().parent().removeClass("radio-option-checked");
            $(this).prop('checked', false);
        }
    });

}
function inputEffectAcao(elem, acao){
    if (elem.prop('tagName') == "LABEL") {
        elem = elem.parent();
    }
    var div = elem.find(".div");
    var input = elem.find(".input");
    var typeInput = elem.find("input").attr("type");

    if (typeInput != "radio" && typeInput != "checkbox") {
        if (acao == true){
            elem.addClass("input-effect-focus");
            div.addClass("div-focus");
            input.addClass("input-focus");
            $(this).find(".input").focus();
        } else {
            if (input.val() == "") {
                div.removeClass("div-focus");
                input.removeClass("input-focus");
                elem.removeClass("input-effect-focus");
            }
        }
    }
}
function checkboxEffect_Verifpreenchimento(){
    $.each($(".checkbox-effect"), function(){
        var input = $(this).find("input");
       if (input.prop("checked") == true) {
            $(this).find(".checkbox-effect-icon").addClass("fal fa-check-square");
       } else {
            $(this).find(".checkbox-effect-icon").addClass("fal fa-square");
        }
    });
}
function radioEffect_Verifpreenchimento(){
    $.each($(".radio-effect"), function(){
        var input = $(this).find("input");
       if (input.prop("radio") == true) {
            $(this).find(".radio-effect-icon").addClass("far fa-dot-circle");
       } else {
            $(this).find(".radio-effect-icon").addClass("far fa-circle");
        }
    });
}

function transformarEmdata(s){
    if (s == "hoje"){
        var dataV = new Date;
        var objData = {
            data: dataV,
            dia: dataV.getDate(),
            mes: ("0"+(dataV.getMonth()+1)).slice(-2),
            ano: dataV.getFullYear()
        }
    } else {
        var split = s.split("/");
        var dataV = new Date(split[1] + "/" + split[0] + "/" + split[2]);
        var objData = {
            data: dataV,
            dia: dataV.getDate(),
            mes: ("0"+(dataV.getMonth()+1)).slice(-2),
            ano: dataV.getFullYear()
        }
    }
    return objData;
}
function limitaCaracteres(string, limite){
    if (string == null || string == "") {
        return "Sem nome";
    }
    if (string.length > limite) {
        var retorno = string.substr(0,(limite-3))+"...";
    } else {
        var retorno = string;
    }
    return retorno;
}
function montaErroGeralCarregarAjax(obj){
    var div = $("<div>").attr("id", "erroGeralCarregarAjax").text("Algo não deu certo! Recarregue a página novamente.");
}
function replaceAll(str, de, para){
    var pos = str.indexOf(de);
    while (pos > -1){
		str = str.replace(de, para);
		pos = str.indexOf(de);
	}
    return (str);
}
function montaUrlProdutoDetalhar(descricao, codigo) {
    // arruma espaços duplicados e espaços no inicio e fim da str
    // var repla = replaceAll(descricao, /\s{2,}/g, ' ').trim();
    var repla = replaceAll(descricao, "-", "");

    repla = repla.replace(/\s{2,}/g, ' ').trim();

    // codigo=0 é quando utilizamos os link no rodapé.
    // E neles precisam considerar as preposições 'de', 'e' e etc...
    if (codigo != 0) {
        // Inicia nos replaces
        repla = replaceAll(repla, " É ", " ");
        repla = replaceAll(repla, " E ", " ");
        repla = replaceAll(repla, " A ", " ");
        repla = replaceAll(repla, " AS ", " ");
        repla = replaceAll(repla, " O ", " ");
        repla = replaceAll(repla, " DE ", " ");
        repla = replaceAll(repla, " DO ", " ");
        repla = replaceAll(repla, " EM ", " ");
        repla = replaceAll(repla, " NA ", " ");
        repla = replaceAll(repla, " NO ", " ");
        repla = replaceAll(repla, " C/ ", " ");
    }

    repla = replaceAll(repla, " ", "-");
    repla = replaceAll(repla, "/", "-");
    repla = replaceAll(repla, "\\", "-");
    repla = replaceAll(repla, "|", "-");
    repla = replaceAll(repla, "?", "");

    var arrumaDescricao = removerCaracteresEspeciais(repla)
    var url = limitaCaracteres(arrumaDescricao, 150)+"-"+codigo+".html";

    return url.toLowerCase();
}
function removerCaracteresEspeciais(str){
    var repla = removerAcentos(str);
    repla = replaceAll(repla, "/", "");
    repla = replaceAll(repla, "\\", "");
    repla = replaceAll(repla, "|", "");
    repla = replaceAll(repla, "(", "");
    repla = replaceAll(repla, ")", "");
    repla = replaceAll(repla, "[", "");
    repla = replaceAll(repla, "]", "");
    repla = replaceAll(repla, "{", "");
    repla = replaceAll(repla, "}", "");
    repla = replaceAll(repla, "\"", "");
    repla = replaceAll(repla, "'", "");
    repla = replaceAll(repla, "!", "");
    repla = replaceAll(repla, "@", "");
    repla = replaceAll(repla, "#", "");
    repla = replaceAll(repla, "$", "");
    repla = replaceAll(repla, "%", "");
    repla = replaceAll(repla, "&", "");
    repla = replaceAll(repla, "*", "");
    repla = replaceAll(repla, "_", "");
    repla = replaceAll(repla, "=", "");
    repla = replaceAll(repla, "+", "");
    repla = replaceAll(repla, "%", "");
    repla = replaceAll(repla, "^", "");
    repla = replaceAll(repla, "~", "");
    repla = replaceAll(repla, ";", "");
    repla = replaceAll(repla, ":", "");
    repla = replaceAll(repla, ".", "");
    repla = replaceAll(repla, ",", "");
    repla = replaceAll(repla, "`", "");
    repla = replaceAll(repla, "´", "");
    repla = replaceAll(repla, "<", "");
    repla = replaceAll(repla, ">", "");

    return repla;
}
function getIdProdutoDaUrl() {
    var url = window.location.pathname;
    var urlProduto = url.split("/")[1];
    var splitIdProduto = urlProduto.split("-");
    var idProduto = splitIdProduto[(splitIdProduto.length - 1)].split(".")[0];
    return idProduto;
}
function getUrlProdutoDaUrl() {
    return window.location.pathname;
}

//FUNÇÕES RESPOPNSÁVEIS POR CRIAR LI DO PRODUTO
function montaLiProdutoComVideo(destino, produto) {
    var ul = $(destino);
    var txtReferencia = produto.referencia;
    var estampas = produto.estampas
    var txtDescricao = txtReferencia+" - "+limitaCaracteres(produto.descricao, 110);
    var foto_alt = produto.referencia+' '+produto.descricao+' '+produto.colecao;
    var foto_title = "";
    // var foto_title = produto.descricao;
    // console.log(produto.referencia)
    // console.log(produto.descricao)
    // console.log(produto.colecao)
    // console.log(foto_alt)

    //criando elementos
    var li = $("<li>").addClass("li-produto");
    // var cont_descontoOff = montaCont_produtoDescontoOff(produto);
    // var cont_tipoEntrega = montaCont_tipoEntrega(produto);
    var cont_video = montaCont_video(produto);
    var cont_a = $('<a>');
    // var sectionPreco = montaSectionPreco(produto);
    var sectionPreco = montaSectionPrecoProduto(produto.objSectionPrecos);
    var cont_estampas = montaCont_estampas(estampas);
    var cont_foto = $("<div>").addClass("foto");
    var foto = $("<img>").addClass("produto-img");
    var foto = $("<img>").addClass("produto-img").attr("alt", montaUrlProdutoDetalhar(foto_alt, 0).split("-0")[0]);
    var descricao = $("<p>").addClass("descricao");

    //criando atributos
    li.attr("id", "produto"+produto.codigo);
    cont_a.attr("href", montaUrlProdutoDetalhar(produto.descricao, produto.codigo));
    descricao.attr("title", produto.descricao).html(txtDescricao);
    foto.attr("src", alterarTamanhoDaFotoDoProduto(produto.fotos.conteudo[0].arquivo));

     // Selecionando o produtona index ao retornar
    var getQuery_maisProdutos = getLocalstorage_QueryMaisProdutos();
    if (destino == "#ulListaProdutos" && getQuery_maisProdutos != null) {
        if (produto.codigo == getQuery_maisProdutos.idProduto) {
            foto.css({
                'transform': 'scale(1.5)'
            });
        }
    }

    montaElemTagsDeUmProduto(produto, {append:li});

    // Append elems
    li.append(cont_a);
        // cont_a.append(cont_descontoOff);
        // cont_a.append(cont_tipoEntrega);
        cont_a.append(cont_video);
        cont_a.append(cont_foto);
            cont_foto.append(foto);
        cont_a.append(sectionPreco);
        cont_a.append(cont_estampas);
        cont_a.append(descricao);

    ul.append(li);

    if (destino != "#ulProdutosRelacionados") {
        // analisamos o tamanho da largura do elemento que recebe a foto para melhorar a impressão na tela.
        // Essa análose não será feita quando produtos relacionafdos
        cont_foto.css({
            'background-color': '#f9f9f9',
            'height': (((cont_a.outerWidth() / 900) * 100) * 1350) / 100+'px'
        });
    }

    if (li.find('.produto-desconto-off').length > 0) {
        cont_tipoEntrega.css('left', li.find('.produto-desconto-off').outerWidth()+5+'px');
    }

}


function montaElemTagsDeUmProduto(produto, objConfigs){
    var container = $('<div>').addClass('container-tags notranslate');
    var ul = $('<ul>');
    var objTags = {};

    container.attr({
        'data-tooltip': (objConfigs.tooltip == undefined) ? 'true' : objConfigs.tooltip,
    });

    // Desconto montaCont_produtoDescontoOff();
    if (produto.descontoOff != "0") {
        var descontoOff={};
        descontoOff.class = "ativo";
        descontoOff.bgcolor = "#ffaa00";
        descontoOff.icone = "fal fa-percent";
        descontoOff.desc = produto.descontoOff;
        objTags.descontoOff = descontoOff;
    }

    // Tipo de entrega montaCont_tipoEntrega();
    if (produto.txt_entrega != undefined) {
        var tipoEntrega={};
        tipoEntrega.bgcolor = (produto.dias_entrega == '0') ? "#008000" : "#444345";
        tipoEntrega.icone = (produto.dias_entrega == '0') ? "fal fa-bolt" : "fal fa-alarm-clock";
        tipoEntrega.desc = produto.txt_entrega;
        objTags.tipoEntrega = tipoEntrega;
    }

    $.each(objTags, function(ind, val){
        var li = $('<li>').addClass(ind);
        var contIcone = $('<div>').addClass('cont-icone');
        var contDesc = $('<div>').addClass('cont-desc').html(val.desc);

        if (val.icone != undefined){
            contIcone.html('<i class="'+val.icone+'"></i>');
        }

        if (val.class != undefined){
            li.addClass(val.class);
        }

        if (val.bgcolor != undefined){
            li.css('background-color', val.bgcolor);
            contIcone.css('background-color', val.bgcolor);
            contDesc.css('background-color', val.bgcolor);
        }

        li.append(contIcone).append(contDesc);
        ul.append(li);
    });
    container.append(ul);


    // diferentes formas de destino
    if (objConfigs.before) {
        objConfigs.before.before(container);
        return;
    }
    if (objConfigs.after) {
        objConfigs.after.after(container);
        return;
    }
    if (objConfigs.append) {
        objConfigs.append.append(container);
        return;
    }
    if (objConfigs.prepend) {
        objConfigs.prepend.prepend(container);
        return;
    }
    
}
function montaCont_produtoDescontoOff(produto){
    var descontoOff = produto.descontoOff;
    if (descontoOff !== "0" && descontoOff !== false && descontoOff !== "" && descontoOff !== undefined) {
        var container = $('<div>').addClass('notranslate produto-desconto-off')
        var cont_porcent = $('<span>');
            var desconto = $('<span>').text(descontoOff);
            var porcent = $('<span>').text('%');
        var cont_off = $('<span>').text('OFF');

        cont_porcent.append(desconto).append(porcent);
        container.append(cont_porcent);
        container.append(cont_off);
        return container;
    }
}
function montaCont_tipoEntrega(produto){
    var diasEntrega = produto.dias_entrega;
    var txtTipoEntrega = produto.txt_entrega;
    var classe = '';
    var icone = '';
    var container = $('<div>').addClass('notranslate produto-tipo-entrega'); 
    if (txtTipoEntrega != undefined) {
        classe = 'tipo-entrega-'+diasEntrega;
        icone = (diasEntrega == '0') ? '<i class="fal fa-bolt"></i>' : '<i class="fal fa-alarm-clock"></i>';
        container.addClass(classe).html(icone+' '+txtTipoEntrega)
    }
    return container;
}
function montaCont_video(produto){
    var container = $('<div>').addClass('cont-video link-produto-index abrir-video').attr('data-video', produto.video);
    if (produto.video !== "") {
        var icone = $('<i>').addClass('fab fa-youtube abrir-video');
        container.append(icone);
    }
    return container;
}

function calcProporcaoAlturaDoVideo(){
    var largMax = 1903;
    var altAmax = 670;
    var largTela = $(window).width();

    var propLarg = (largTela * 100) / largMax;
    var propAlt = (altAmax * propLarg) / 100;

    var obj = {
        largura: largTela,
        altura: parseInt(propAlt)
    }

    return obj;
}


function montaCont_estampas(estampas) {
    var ul = $("<ul>").addClass("estampas");
    if (estampas.totalReg > 0) {
        $.each(estampas.conteudo, function(in_es, val_es){
            var getResolucao = verificaTipoResolucaoPagina();
            if (getResolucao.tipoTela == "mobile") {
                var maxEstampas = 5;
            } else {
                var maxEstampas = 9;
            }
            if (in_es < maxEstampas) {
                var verifCorestampa = verificaRetornoCssEstampaCor(val_es.textoPrincipal);
                var li = $("<li>");
                li.css(verifCorestampa.attr, verifCorestampa.cont);
                ul.append(li);
            }
        });
    }
    return ul;
}

function montaUlEstampasProdutos(array) {
    var ul = $("<ul>");
    $.each(array.conteudo, function(in_es, val_es){
        var getResolucao = verificaTipoResolucaoPagina();
        if (getResolucao.tipoTela == "mobile") {
            var maxEstampas = 5;
        } else {
            var maxEstampas = 9;
        }
        if (in_es < maxEstampas) {
            var verifCorestampa = verificaRetornoCssEstampaCor(val_es.textoPrincipal);
            var li = $("<li>");
            li.css(verifCorestampa.attr, verifCorestampa.cont);
            ul.append(li);
        }
    });
    return ul;
}
function verificaMostraPrecoProduto(obj){
    var moeda = '<span>'+verificaMoeda(obj.moeda)+'</span>';
    var iconePreco = '<span><i class="fad fa-lock-alt"></i></span>';
    var targetLink = (verificaPaginaAtual().indexOf("iframe")) ? "_self" : "_parent";

    if (obj.preco == undefined) { //nao esta logado
        var PrecoAntigo = "";
        var Preco = moeda+" "+iconePreco;
        var Parcelamento = '<a href="/login" target="'+targetLink+'">VER PREÇO DE ATACADO</a>';
    } else {
        var Preco = moeda+" <span>"+formataValorFloatParaMonetario(moeda, parseFloat(obj.preco).toFixed(2))+"</span>";
        if (obj.ParcelamentoSemJuros > 1) {
            var Parcelamento = obj.ParcelamentoSemJuros +"x <span>"+formataValorFloatParaMonetario(moeda, parseFloat(obj.precoParcelado).toFixed(2))+"</span>";
        }
        var verifPreco = parseFloat(obj.precoAntigo).toFixed(2);
        // if (obj.precoAntigo != undefined && obj.precoAntigo != "0.00" && obj.precoAntigo != "0.000" && obj.precoAntigo != "0.0000") {
        if (verifPreco != "0.00") {
            var PrecoAntigo = formataValorFloatParaMonetario(moeda, verifPreco);
        }
    }
    var retorno = {
        txtPrecoAntigo: PrecoAntigo,
        txtPreco: Preco,
        txtParcelamento: Parcelamento
    };
    return retorno;
}
function montaSectionPreco(produto){
    if (montaSectionPreco.caller == null){
        var caller = "index";
    } else {
        var caller = (montaSectionPreco.caller.name == 'montaProduto') ? "produto" : "index";
    }
    var arrElemsPreco = montaObjContainerPreco(produto, caller);
    var container = $('<section>').addClass('container-preco');
    if (arrElemsPreco.length == 2) {
        if (caller == 'index') {
            container.addClass('varejo-atacado');
        }
    }
    $.each(arrElemsPreco, function(ind, val){
        //verifica se a função que chamou esta é a função da pagina de produtos e alterarmos algumas configs de exibição
        if (caller === 'produto' && produto.mostrapreco === "2") {
            if (val.id == 'varejo') {
                val.nome = "compre para uso proprio";
                if (produto.exibevideoAtacado == "N") {
                    container.append(montaContentPreco(val));
                }
            }
            if (val.id == 'atacado') {
                val.nome = "compre para revender";
                if (produto.exibevideoAtacado == "S") {
                    container.append(montaContentPreco(val));
                }
            }
        } else {
            container.append(montaContentPreco(val));
        }
    });

    return container;
}
function montaObjContainerPreco(produto, caller){

    var ret = [];
    var iconeBloqPreco = '<i class="fad fa-lock-alt"></i>';
    var moeda = verificaMoeda(produto.moeda);
    var precoAntigo = (produto.precoAntigo === undefined || produto.precoAntigo == "0.00") ? false : formataValorFloatParaMonetario(moeda, parseFloat(produto.precoAntigo));

    if (produto.mostrapreco === "1") {
        var preco = (produto.preco === undefined || produto.preco === "0.00") ? iconeBloqPreco : formataValorFloatParaMonetario(moeda, parseFloat(produto.preco));
        var parcelamento = montaSectionPreco_parcelamentoSemJurosPrecoProduto(produto.ParcelamentoSemJuros, moeda, produto.preco, caller);
        var verif_nome = (produto.preco == produto.mostraprecoAtacado) ? 'compre para revender' : 'compre para uso proprio';
            verif_nome = (produto.mostraprecoAtacado == produto.mostraprecoVarejo && produto.mostraprecoVarejo != "") ? 'compre para revender' : verif_nome;
            verif_nome = (produto.mostraprecoAtacado == "" && produto.mostraprecoVarejo == "") ? 'compre para revender' : verif_nome;

        var compra = {
            id: 'compra',
            nome: verif_nome,
            moeda: moeda,
            precoAntigo: precoAntigo,
            preco: preco,
            parcelamento: parcelamento,
        };
        ret.push(compra);

    } else if (produto.mostrapreco === "2") {
        if (produto.mostraprecoVarejo !== undefined) {
            var preco = (produto.mostraprecoVarejo === "") ? iconeBloqPreco : formataValorFloatParaMonetario(moeda, parseFloat(produto.mostraprecoVarejo).toFixed(2));
            var parcelamento = montaSectionPreco_parcelamentoSemJurosPrecoProduto(produto.ParcelamentoSemJuros, moeda, produto.mostraprecoVarejo, caller);
            var varejo = {
                id: 'varejo',
                nome: 'uso proprio',
                precoAntigo: precoAntigo,
                moeda: moeda,
                preco: preco,
                parcelamento: parcelamento,
            };
            ret.push(varejo);
        }

        if (produto.mostraprecoAtacado !== undefined) {
            var preco = (produto.mostraprecoAtacado === "") ? iconeBloqPreco : formataValorFloatParaMonetario(moeda, parseFloat(produto.mostraprecoAtacado).toFixed(2));
            var parcelamento = montaSectionPreco_parcelamentoSemJurosPrecoProduto(produto.ParcelamentoSemJuros, moeda, produto.mostraprecoAtacado, caller);
            var atacado = {
                id: 'atacado',
                nome: 'revenda',
                precoAntigo: precoAntigo,
                moeda: moeda,
                preco: preco,
                parcelamento: parcelamento,
            };
            ret.push(atacado);
        }
    }
    return ret;
}
function montaSectionPreco_parcelamentoSemJurosPrecoProduto(parcelas, moeda, preco, caller){
    if (parcelas === undefined) {
        if (caller == "index") {
            var targetLink = (verificaPaginaAtual().indexOf("iframe")) ? "_self" : "_parent";
            return 'VER PREÇO DE REVENDA';
            // return '<a href="/login" target="'+targetLink+'">VER PREÇO DE REVENDA</a>';
        }
    } else {
        var qtd = parseInt(parcelas);
        return (qtd < 2) ? false : qtd+'x '+formataValorFloatParaMonetario(moeda, (parseFloat(preco) / qtd).toFixed(2));
    }
}
function montaContentPreco(obj){
    $.each(obj, function(ind, val){
        obj[ind] = (val === false) ? '' : val;
    });
    var container = $('<div>').addClass(obj.id);
    var cont_preco = $('<div>').addClass('cont-preco');
    var cont_precoAntigo = $('<del>').addClass('preco-antigo notranslate');
    var cont_moeda = $('<span>').addClass('moeda notranslate');
    var cont_valor = $('<span>').addClass('valor notranslate');
    if (obj.preco.indexOf('<') >= 0) { cont_valor.addClass('icone'); }
    var cont_nome = $('<span>').addClass('nome');
    var cont_parcelamento = $('<p>').addClass('parcelamento');

    //Conteudo
    cont_precoAntigo.html(obj.precoAntigo);
    cont_moeda.html(obj.moeda);
    cont_valor.html(obj.preco);
    cont_nome.html(obj.nome);
    cont_parcelamento.html(obj.parcelamento);

    //DOM
    container.append(cont_preco);
    if (obj.precoAntigo != "") { cont_preco.append(cont_precoAntigo); }
    // if (obj.moeda != "") { cont_preco.append(cont_moeda); }
    if (obj.preco != "") { cont_preco.append(cont_valor); }
    if (obj.nome != "") { cont_preco.append(cont_nome); }
    if (obj.parcelamento != "") { container.append(cont_parcelamento); }

    return container;
}


/**
 * 
 * @param {*} srcFoto caminho completo da foto
 * @param {*} tamanho int que representa o tamanho da foto. De 0 a 3, sendo: maior 0, 1 media_, 2 thumb_ e 3 mini_
 * @returns 
 */
function alterarTamanhoDaFotoDoProduto(srcFoto, tamanho=0){
    var prefix = "";
    switch(tamanho){
        case 1:
            prefix = 'media_'
            break
        case 2:
            prefix = 'thumb_'
            break
        case 3:
            prefix = 'mini_'
            break
    }
    var split = srcFoto.split("/")
    split[split.length-1] = prefix+split[split.length-1]
    // console.log(split)
    return split.join('/');
}

function verificaRetornoCssEstampaCor(v){
    if (v.indexOf('arquivo-nao-enviado') != -1) {
        v = "imagens/img_pixel.png";
    }
    var bodyData = getBodyData();
    var obj = {};
    if(v.substr(0,1) == "#") {
        obj["attr"] = 'background-color';
        obj["cont"] = v;
    } else {
        obj["attr"] = 'background-image';
        obj["cont"] = 'url("'+bodyData.subdominioImagens+bodyData.urlBase+'/'+v+'")';
    }
    return obj;
}




// function addPrecoEstoqueGradeEstampaNaGlobalPrecoEstoque(idProduto, idGrade, idEstampa, preco, estoque, quantidade, valorTotal, lucrosugerido){
//     var add = montaObjetoProdutosSelecionados(idProduto, idGrade, idEstampa, preco, estoque, quantidade, valorTotal, lucrosugerido);
//     global_objPrecoPorGrade.push(add);
// }
// function addQtdDaSacolaNaTabelaEstoque(destino, sacola){
//     $.each(sacola, function(index, value){
//         var td = destino.find("td[data-idgrade='"+value.codigodagrade+"'][data-idestampa='"+value.codigodaestampa+"']");
//         var input = destino.find("td[data-idgrade='"+value.codigodagrade+"'][data-idestampa='"+value.codigodaestampa+"']").find("input");
//         if (value.quantidade > 0)
//             input.val(value.quantidade);
//         mudaCssTdEstoqueSeSelecionado(td, value.quantidade);
//         addGradeEstampaNaGlobalProdutosSelecionados(verifPrecoCorretoGradeestampa(value.codigodoproduto, value.codigodagrade, value.codigodaestampa, value.quantidade));
//     });
// }
// function mudaCssTdEstoqueSeSelecionado(td, qtd){
//     if (qtd > 0) {
//         td.addClass("td-selecionado");
//     } else {
//         td.removeClass("td-selecionado");
//     }
// }
// function addEstoquePrecoGradeEstampa(destino, produto){
    
//     var preco =  produto.preco;
//     var lucrosugerido =  produto.lucrosugeridonoproduto;
//     var estoque =  produto.estoque.conteudo;
//     var moeda = produto.moeda;
    
//     $.each(estoque, function(index, value){

//         var td = destino.find("td[data-idproduto='"+value.idproduto+"'][data-idgrade='"+value.codigodagrade+"'][data-idestampa='"+value.codigodaestampa+"']");

//         if (preco) { //verifica se esta logado
//             if (value.estoque > 0) {

//                 if (parseFloat(value.precodiferenciado) > 0 && parseFloat(value.precodiferenciado) != preco) {
//                     var retornoPreco = value.precodiferenciado;
//                     var retornoLucroSugerido = value.lucrosugeridonoprodutodiferenciado;
//                     var verifDifPreco = (retornoPreco - preco);
//                     var txtDifPreco = (verifDifPreco > 0) ? "acréscimo" : "desconto";
//                     td.prepend($("<span>").addClass("msgpadrao-absolute-estoque acrescimo").html("Grade com "+txtDifPreco+" de <br>"+formataValorFloatParaMonetario(moeda, (retornoPreco - preco).toFixed(2))));
//                 } else {
//                     var retornoPreco = preco;
//                     var retornoLucroSugerido = lucrosugerido;
//                 }
//                 addPrecoEstoqueGradeEstampaNaGlobalPrecoEstoque(value.idproduto, value.codigodagrade, value.codigodaestampa, retornoPreco, value.estoque, 0, retornoPreco, retornoLucroSugerido);
//             } else {
//                 td.addClass("sem-estoque").attr({
//                     title: "Desculpe"+ getNomeUsuarioLogadoDOM() +", mas este produto não está disponível."
//                 }).html('');
//             }
            
//         } else {
//             td.off();
//             if (value.estoque > 0) {
//             }
//         }
//     });
// }
// function montaObjetoProdutosSelecionados(idProduto, idGrade, idEstampa, preco, estoque, quantidade, valorTotal, lucrosugerido) {
//     var obj = {
//         idProduto: idProduto,
//         idGrade: idGrade,
//         idEstampa: idEstampa,
//         preco: preco,
//         estoque: estoque,
//         quantidade: quantidade,
//         valorTotal: valorTotal,
//         lucrosugerido: lucrosugerido
//     }
//     return obj;
// }

function verificaSeUsuarioEstaLogado() {
    var textoPreco = $(".produto-infos .container-preco > div:first-child .cont-preco > .valor").text();
    var split = textoPreco.split(" ");
    var preco = split[split.length-1];
    var verifPreco = preco.replace(".","").replace(",",".") * 1;
    if (verifPreco) {
        return true;
    } else {
        return false;
    }
}
function verificaMoeda(s) {
    var moeda = "BRL";
    if (s != undefined) {
        moeda = s;
    }
    return moeda;
}

// function addGradeEstampaNaGlobalProdutosSelecionados(add){
//     if (add!==undefined) {

//         if (global_objTodosProdutosSelecionados.length < 1) {
//             global_objTodosProdutosSelecionados.push(add);
//         } else {
//             var verif = false;
//             var new_data = [];
//             $.each(global_objTodosProdutosSelecionados, function(index, value){
//                 var verifidProduto = global_objTodosProdutosSelecionados[index].idProduto;
//                 var verifGrade = global_objTodosProdutosSelecionados[index].idGrade;
//                 var verifEstampa = global_objTodosProdutosSelecionados[index].idEstampa;
//                 if (verifidProduto == add.idProduto && verifGrade == add.idGrade && verifEstampa == add.idEstampa){
//                     verif = true;
//                     new_data = {
//                         index: index,
//                         qtd: add.quantidade,
//                         total: add.quantidade * add.preco
//                     }
//                 }
//             });
//             if (verif == true) {
//                 global_objTodosProdutosSelecionados[new_data.index].quantidade = new_data.qtd;
//                 global_objTodosProdutosSelecionados[new_data.index].valorTotal = new_data.total;
//             } else if (verif == false) {
//                 global_objTodosProdutosSelecionados.push(add);
//             }
//         }
//     }
// }

// function verifPrecoCorretoGradeestampa(idProduto, idGrade, idEstampa, quantidade){
//     console.log(idProduto, idGrade, idEstampa, quantidade)
//     console.log(global_objPrecoPorGrade)
//     var retorno = [];
//     $.each(global_objPrecoPorGrade, function(index, value){
//         var verifProduto = global_objPrecoPorGrade[index].idProduto;
//         var verifGrade = global_objPrecoPorGrade[index].idGrade;
//         var verifEstampa = global_objPrecoPorGrade[index].idEstampa;

//         if (verifProduto == idProduto && verifGrade == idGrade && verifEstampa == idEstampa) {
//             var preco = global_objPrecoPorGrade[index].preco;
//             var estoque = global_objPrecoPorGrade[index].estoque;
//             var lucrosugerido = global_objPrecoPorGrade[index].lucrosugerido;
//             var valorTotal = quantidade * preco;
//             novo_obj = montaObjetoProdutosSelecionados(idProduto, idGrade, idEstampa, preco, estoque, parseInt(quantidade), valorTotal, lucrosugerido);
//             retorno.push(novo_obj);
//         }
//     });
//     return retorno[0];
// }

// function addOuAlterarQtddeUmproduto(elemTd, novaQtd){
//     var idProduto = elemTd.attr("data-idproduto");
//     var idGrade = elemTd.attr("data-idgrade");
//     var idEstampa = elemTd.attr("data-idestampa");
//     if (isNaN(novaQtd)){
//         novaQtd = 0;
//     }
//     if (novaQtd >= 0) {
//         var verifEstoqueMaximo = verifPrecoCorretoGradeestampa(idProduto, idGrade, idEstampa, novaQtd);
//         if (novaQtd > verifEstoqueMaximo.estoque) {
//             novaQtd = verifEstoqueMaximo.estoque;
//             elemTd.find("input").val(verifEstoqueMaximo.estoque);
//             elemTd.prepend($("<span>").addClass("msgpadrao-absolute-estoque erro-quantidade").html("Desculpe<strong>"+ getNomeUsuarioLogadoDOM() +"</strong>, dispomos de apenas "+ verifEstoqueMaximo.estoque +" em nosso estoque."));
//             elemTd.find("input").css("border-color","red");
//             elemTd.find("input").css("background-color","#FFF2F2");
//             setTimeout(function(){
//                 $(".msgpadrao-absolute-estoque").fadeOut(function(){
//                     $(this).remove();
//                 });
//                 elemTd.find("input").css("border-color","");
//                 elemTd.find("input").css("background-color","");
//             }, 3000);
//         }
//         if (novaQtd == 0) {
//             elemTd.find("input").val("");
//         } else {
//             elemTd.find("input").val(novaQtd);
//         }
//         addGradeEstampaNaGlobalProdutosSelecionados(verifPrecoCorretoGradeestampa(idProduto, idGrade, idEstampa, novaQtd));
//         mudaCssTdEstoqueSeSelecionado(elemTd, novaQtd);
//         //add produtos selecionados na variavel global
//         calcQtdEValorDosProdutosSelecionados();
//     }
// }
function habilitaBotaoAddSacola(status){
    var traducao = leJsonInfosGeraisForms();
    if (status){
        $(".btn_addSacola").html('<i class="fal fa-shopping-bag"></i>'+traducao.alterar_btn_produto_sacola.adicionar).prop("disabled", false);
    } else {
        $(".btn_addSacola").html('<i class="fal fa-chevron-up"></i>'+traducao.alterar_btn_produto_sacola.adicionar).prop("disabled", true);
    }
}

function criaObjetoParaAddNaSacola(idProduto, gradeId, estampaId, qtd, preco, lucrosugerido){
    var obj = {
        Ped_CodProduto: idProduto,
        Ped_CodGrade: gradeId,
        Ped_CodEstampa: estampaId,
        Ped_Qtde: qtd,
        Ped_Preco: preco,
        lucrosugerido: lucrosugerido
    }
    return obj;
}


/*verificando cadastro de newsletter*/
function getCadastroNewsLetter(){
    return localStorage.getItem(_LS_cadastroNewsletter);
}
function verificaLocalStorage_cadastroNewsletter(){
    var getLs = JSON.parse(getCadastroNewsLetter());
    if (getLs.email != null) {
        return getLs.email;
    } else {
        return false;
    }
}

function initialBtnClosemodalVenobox(){
    $(".vbox-close-iframe").click(function(){
        fecharVenoBoxIframe(true);
    });
}
function fecharVenoBoxIframe(status){
    if (status) {
        $(parent.document).find(".vbox-overlay").fadeOut(700, function() {
            $(parent.document).find("body").removeClass("vbox-open");
            $(this).remove();
        });
    }
}

//funções a serem solicitadas para trabalhar com a sacola
function abreResumoMinhaSacola(){
    $(".topo-sacola > span").css('width', $(".topo-sacola > span").outerWidth()+'px');
    var spanCarregando = '<i class="fa-duotone fa-spinner fa-spin"></i>';
    // $("#resumoCheckout_subtotal").html(spanCarregando);
    // $("#resumoCheckout_valortotal").html(spanCarregando);
    $(".topo-sacola > span").html(spanCarregando);

    var success = function(data){
        
        importarArquivos(modulosParaImportar('alerts'));
        importarArquivos(modulosParaImportar('animacaoConfetti'));
        
        var response = JSON.parse(data);
        if (response.erro) {
            $(".topo .topo-sacola > span").text('R$ 0,00');
            $(".topo .topo-sacola i > span").text('0');
            return;
        }
        
        var sacolaTotais = response.totais;
        var sacolaResumo = response.resumo;
        var sacolaConquistas = response.conquistas;
        var mensagensConquistas = response.mensagensConquistas;
        var mensagemConquista = mensagensConquistas[mensagensConquistas.length-1];
        var totalConquistasResumoSacola = parseInt($('body').attr('data-total-resumo-sacola'));
        
        if (mensagensConquistas.length > totalConquistasResumoSacola){
            exeEventoNovoBeneficio(mensagemConquista, true);
        } else if (sacolaConquistas.length < totalConquistasResumoSacola){
            exeEventoNovoBeneficio('Que pena! Você perdeu um benefício.', false);
        }
        $('body').attr('data-total-resumo-sacola', mensagensConquistas.length)

        preencheResumoSacola(sacolaTotais, sacolaResumo);
        montarRodapeSacola(response);
        carregandoElemento('.minha-sacola', false);
        carregandoElemento('.form-checkout', false);


        
        if (
            verificaPaginaAtual() == 'checkout' &&// estiver na pagina de checkout
            response.gameficacao.length > 0 &&
            $('#msgAvisoBeneficioCheckout').length == 0 && // não estiver mostrando a mensagem
            $('.minha-sacola-on').length == 0 // sacola não estiver aberta
        ){
            var referrer = (document.referrer.indexOf('tirapedido') == -1) ? '/' : '/tirapedido';
            $('body').alerts({
                id: 'msgAvisoBeneficioCheckout',
                position: 'absolute',
                mensagemHtml: response.gameficacao[0].titulo,
                // botaoHtml: 'Continuar comprando',
                // botaoHref: document.location.origin+referrer,
                tempoExibicao: 5000,
                tipoMensagem: '',
                show:function(container){
                }
            });
        }


    };
    var fail = function(data){
        // console.log(data);
        $('#ulProdutosMinhaSacola').html('').append($('<div>').css({
            'padding-top': '1em',
        }).html('Erro ao carregar os dados.'));
        carregandoElemento('.minha-sacola', false);
    };

    var valorFrete = $("#resumoCheckout_frete").attr("data-valor");
    var post = {};

    if (valorFrete!=0){
        post.valorFrete = valorFrete;
    }
    if (global_montaCupom){
        post.valorDesconto = global_montaCupom.desconto;
    }

    // console.log(post);

    requestApiLojaV2_GET('sacola/totais', post, success, fail);

}
function exeEventoNovoBeneficio(mensagemHtml=null, novoBeneficio=true){
    if ($('.minha-sacola-on').length > 0) {
        // console.log('alerta não exibido com sacola aberta');
        // return;
    }
    if (!mensagemHtml) {
        return;
    }

    var tipoMensagem = '';
    if (novoBeneficio) {
        var tipoMensagem = 'sucesso';
    }

    $('body').alerts({
        mensagemHtml: mensagemHtml,
        tipoMensagem: tipoMensagem,
        show:function(container){
            container.click(function(){
                abreSacolaDAO(true);
            })
        },
        // tempoExibicao: 0,
    });

    if (novoBeneficio) {
        startConfetti({
            followScreen:true
        });
        setTimeout(function(){
            stopConfetti();
        },1000);
    }
}

function preencheResumoSacola(totais, resumo){

    $(".topo .topo-sacola > span").text(totais.valorSubtotalTxt);
    $(".topo .topo-sacola i > span").text(totais.itensTxt);

    $('.container-finalizar-compra-catalogo').find('span').text(totais.itensTxt);
    $('.container-finalizar-compra-live').find('span').text(totais.itensTxt);
    
    $("#resumoCheckout_frete").text((totais.valorFrete==0)?"a calcular":totais.valorFreteTxt);
    $("#resumoCheckout_subtotal").text(totais.valorSubtotalTxt);
    $("#resumoCheckout_valortotal").text(totais.valorTotalTxt);
    $("#resumoCheckout_qtdprodutos").text(totais.itensTxt);
    $("#resumoCheckout_desconto").text('- '+totais.valorDescontoGameficacaoTxt);
    $("#resumoCheckout_conquistas").text('- '+totais.valorDescontoGameficacaoTxt);
    $("#resumoCheckout_desconto").text(totais.valorDescontoGameficacaoTxt);

    var indexBeneficios = $.inArray('beneficios', array_column(resumo, 'name'));
    if (indexBeneficios == -1){
        $("#resumoCheckout_beneficios").parent().remove();
    } else {
        $("#resumoCheckout_beneficios").html(resumo[indexBeneficios].valor);
    }
    
    if (totais.valorDescontoGameficacao == 0){
        $("#resumoCheckout_desconto").parent().remove();
        $("#resumoCheckout_conquistas").parent().remove();
    }

    if (totais.itens > 0){
        $(".topo-sacola > span").css('width', 'auto');
    }
    if (totais.itens == 0 || totais.valor == 0){
        $(".button-finalizarcomprar").attr("disabled", true);
    }

    if (
        global_tela.tipoTela != 'desktop' &&
        verificaPaginaAtual() == 'checkout'
    ){
        console.log($('.resumo-sacola').height())
        $('form.form-checkout').css('margin-top', ($('.resumo-sacola').height()+30)+'px')
    }


}

function montarRodapeSacola(sacola){

    var resumo = sacola.resumo;
    var gameficacao = sacola.gameficacao;

    var container = $('#containerRodapeSacola');
    container.html('');

        
    // gameficacao
    if (gameficacao.length > 0) {
        var ulGameficacao = $('<ul>').addClass('gameficacao-sacola');
        $.each(gameficacao, function(ind, val){
            var li = $('<li>').addClass(val.name);
            var cont_titulo = $('<div>').addClass('titulo').html(val.titulo);
            var cont_percent = $('<div>').addClass('percent').html(val.percent);
            li.append(cont_titulo).append(cont_percent);
            ulGameficacao.append(li);
        });
        container.append(ulGameficacao);
    }

    
    // resumo
    var ulResumo = $('<ul>').addClass('novoresumo-sacola');
    $.each(resumo, function(ind, val){
        var li = $('<li>').addClass(val.name);
        var cont_titulo = $('<div>').addClass('titulo').html(val.titulo);
        var cont_valor = $('<div>').addClass('resumo').html(val.valor);
        li.append(cont_titulo).append(cont_valor);
        ulResumo.append(li);
    });
    container.append(ulResumo);


}











//PAGINAS GENERICAS
function montaTabelaProdutosRomeaneio(json){
    var somaValorTotal=0;
    var somaTotalProdutos=0;
    var objDetalhes = {
        referencias: [],
        grades: [],
        cores: [],
    };

    //coloca na pagina a qtd total de produtos
    var resumo_qtdprodutos = json.totalReg;

    var container = $('<div>').addClass('cont-tabela-romaneio');

    if (json.conteudo.length>0) {
        var table = $('<table>').addClass("tabela-romaneio sacola");

        // THEAD
        var thead = $('<thead>');
        var thead_tr = $('<tr>');

        var arr_thead = {
            produto: {
                txt: "produto",
                width: 30,
            },
            tamanho: {
                txt: "tamanho",
                attr: {'align':'center'},
                width: 10,
            },
            estampa: {
                txt: "estampa",
                width: 20,
            },
            preco: {
                txt: "preço",
                attr: {'align':'right'},
                width: 12.5,
            },
            quantidade: {
                txt: "qtde",
                attr: {'align':'center'},
                width: 15,
            },
            total: {
                txt: "total",
                attr: {'align':'right'},
                width: 12.5,
            }
        };
        var tela = verificaTipoResolucaoPagina();
        if (tela.tipoTela === "mobile") {
            arr_thead.produto.width = 20;
            arr_thead.tamanho.txt = 'tam';
            arr_thead.tamanho.width = 5;
            arr_thead.preco.width = 25;
            arr_thead.quantidade.width = 5;
            arr_thead.total.width = 25;
        }

        $.each(arr_thead, function(ind, val){
            var td = $('<td>').text(val.txt);
            if (ind === "produto") {
                td.html(val.txt+'<i class="fas fa-plus-circle btn-mostra-descricao"></i>');
            } else {
                td.text(val.txt);
            }
            var attr_td={};
            var td_width=0;
            thead_tr.append(td);
            td.css('width', val.width+'%');
            if (val.attr!==undefined) {
                td.attr(val.attr);
            }
        });

        // TBODY
        var tbody = $('<tbody>');
        $.each(json.conteudo, function (ind, val){
            // elementos
            var tbody_tr = $('<tr>');
            var td_produto = $('<td>')
            var td_grade = $('<td>').addClass('notranslate').attr('align', 'center');
            var td_cor = $('<td>').addClass('notranslate');
            var td_valorUnit = $('<td>').attr('align', 'right');
            var td_quantidade = $('<td>').addClass('notranslate').attr('align', 'center');
            var td_valorTotal = $('<td>').attr('align', 'right');

            // variaveis
            var nomeCor = (val.estampas.conteudo.length < 1) ? "" : val.estampas.conteudo[0].descricao;
            var valorUnit = formataValorFloatParaMonetario(val.moeda, val.preco);
            var valorTotal = (val.preco * val.quantidade);

            // escrevendo nos elementos
            var texto_descricao = limitaCaracteres(val.descricao, (31-val.referencia.length));
            td_produto.attr('title',  val.referencia+' - '+val.descricao).html('<span class="referencia">'+val.referencia+'</span> - <span class="descricao">'+val.descricao+'</span>');
            td_grade.text(val.grade);
            td_cor.text(nomeCor).addClass('quebra-linha');
            td_valorUnit.text(valorUnit).addClass('mesma-linha');
            td_quantidade.text(val.quantidade);
            td_valorTotal.text(formataValorFloatParaMonetario(val.moeda, valorTotal)).addClass('mesma-linha');

            tbody_tr.append(td_produto).append(td_grade).append(td_cor).append(td_valorUnit).append(td_quantidade).append(td_valorTotal);
            thead.append(thead_tr);
            tbody.append(tbody_tr);

            // Somando total
            somaTotalProdutos = (somaTotalProdutos + parseInt(val.quantidade));
            somaValorTotal = (somaValorTotal + valorTotal);

            // Montando obj dos detalhes
            if ($.inArray(val.referencia, objDetalhes.referencias) < 0) {
                objDetalhes.referencias.push(val.referencia);
            }
            if ($.inArray(val.grade, objDetalhes.grades) < 0) {
                objDetalhes.grades.push(val.grade);
            }
            if ($.inArray(nomeCor, objDetalhes.cores) < 0) {
                objDetalhes.cores.push(nomeCor);
            }
        });

        var novoDetalhes={
            referencias: [],
            grades: [],
            cores: [],
        };
        $.each(json.conteudo, function (ind, val){
            var index_referencias = $.inArray(val.referencia, objDetalhes.referencias);
            var index_grades = $.inArray(val.grade, objDetalhes.grades);
            var cor = (val.estampas.conteudo.length < 1) ? "" : val.estampas.conteudo[0].descricao;
            var index_cores = $.inArray(cor, objDetalhes.cores);
            var qtd = parseInt(val.quantidade);
            //referencias
            if (novoDetalhes.referencias[index_referencias] === undefined) {
                novoDetalhes.referencias[index_referencias] = {
                    item: val.referencia,
                    qtd: qtd,
                };
            } else {
                novoDetalhes.referencias[index_referencias].qtd = (novoDetalhes.referencias[index_referencias].qtd + qtd);
            }

            //grades
            if (novoDetalhes.grades[index_grades] === undefined) {
                novoDetalhes.grades[index_grades] = {
                    item: val.grade,
                    qtd: qtd,
                };
            } else {
                novoDetalhes.grades[index_grades].qtd = (novoDetalhes.grades[index_grades].qtd + qtd);
            }

            //cores
            if (novoDetalhes.cores[index_cores] === undefined) {
                novoDetalhes.cores[index_cores] = {
                    item: cor,
                    qtd: qtd,
                };
            } else {
                novoDetalhes.cores[index_cores].qtd = (novoDetalhes.cores[index_cores].qtd + qtd);
            }
        });

        var cont_detalhes = $('<div>').addClass('cont-detalhes');
        $.each(novoDetalhes, function(ind, val){
            var cont_coluna = $('<div>').addClass('coluna '+ind);
            var table = $('<table>').addClass("tabela-romaneio detalhes");
            var thead = $('<thead>');
            var thead_tr = $('<tr>');
            var nome_coluna = "";
            if (ind==="referencias"){
                nome_coluna = "produto";
            } else if (ind==="grades"){
                nome_coluna = "tamanho";
            } else if (ind==="cores"){
                nome_coluna = "estampa";
            }
            var thead_td_item = $('<td>').text(nome_coluna);
            var thead_td_qtd = $('<td>').text('qtde')

            var tbody = $('<tbody>');
            $.each(val, function(ind_item, val_item){
                var tbody_tr = $('<tr>');
                var tbody_td_item = $('<td>').text(val_item.item).addClass('quebra-linha notranslate');
                var tbody_td_qtd = $('<td>').addClass('quantidade notranslate').text(val_item.qtd);
                tbody.append(tbody_tr);
                tbody_tr.append(tbody_td_item);
                tbody_tr.append(tbody_td_qtd);
            });


            thead.append(thead_tr);
            thead_tr.append(thead_td_item);
            thead_tr.append(thead_td_qtd);

            table.append(thead);
            table.append(tbody);

            cont_coluna.append(table);
            cont_detalhes.append(cont_coluna);
        });

        // TFOOT
        var tfoot = $('<tfoot>');
        var tfoot_tr = $('<tr>');
        var tfoot_td_texto = $('<td>').addClass('texto-footer').attr('colspan', 4);
        var tfoot_td_totalProdutos = $('<td>').attr('align', 'center').text(somaTotalProdutos);
        var tfoot_td_valorTotal = $('<td>').attr('align', 'right').addClass('mesma-linha').text(formataValorFloatParaMonetario(json.conteudo[0].moeda, somaValorTotal));
        tfoot_tr.append(tfoot_td_texto).append(tfoot_td_totalProdutos).append(tfoot_td_valorTotal)
        tfoot.append(tfoot_tr);

        // APPEND TABLE
        table.append(thead);
        table.append(tbody);
        table.append(tfoot);

        // APPEND CONTAINER
        container.append(table);
        container.append(cont_detalhes);

        // AÇÕES DOS ELEMENTOS DA TABELA
        thead_tr.find('.btn-mostra-descricao').click(function(){
            if ($(this).hasClass('fa-plus-circle')) {
                $(this).removeClass('fa-plus-circle');
                $(this).addClass('fa-minus-circle');
            } else {
                $(this).removeClass('fa-minus-circle');
                $(this).addClass('fa-plus-circle');
            }
            var tabela = $(this).parent().parent().parent().parent();
            $.each(tabela.find('tbody tr'), function(){
                var td = $(this).find('td:first');
                var desc = td.find('.descricao');
                var text, data_text;
                if (desc.attr('data-text') === undefined || desc.attr('data-text') === "") {
                    text = td.attr('title').split(' - ')[1];
                    data_text = desc.text();
                } else {
                    text = desc.attr('data-text');
                    data_text = "";
                }
                td.find('.descricao').attr('data-text', data_text).text(text)
            });
        });

    }
    // RETORNO
    return container;
}

function montaContMenuRomaneio() {
    var ls_escolha = 'grade';
    var container = $('<div>').addClass('exibe-pedido-tipo');
    var label = $('<label>').text('Ver como:');
    var ul = $('<ul>');
    var arr_opcoes = [
        { name: "grade", texto: "Sacola", icone: "fal fa-shopping-bag", cont: $('#verpedido_ulProdutos')},
        { name: "lista", texto: "Romaneio", icone: "fal fa-th-list", cont: $('.verpedido-produtossacola .cont-tabela-romaneio')}
    ];
    $.each(arr_opcoes, function(ind, val){
        val.cont.css('display', 'none');
        var li = $('<li>').addClass(val.name).html('<i class="'+val.icone+'"></i>'+val.texto);
        if (ls_escolha === val.name) {
            li.addClass('on');
            val.cont.css('display', 'block');
        }

        li.click(function(){
            var elem_click = $(this);
            var container = elem_click.parent().parent().parent().parent();
            $.each(arr_opcoes, function(ind, val){
                container.find('li.'+val.name+'.on').removeClass('on');
                val.cont.css('display', 'none');
                if (elem_click.hasClass(val.name)) {
                    elem_click.addClass('on');
                    val.cont.css('display', 'block');
                }
            });
        });
        ul.append(li);
    });

    container.append(label).append(ul);
    return container;
}

function removeElementosTopoDOM(){
    $("#topoPagina").find("#labelBuscaTopo").remove();
    $("#topoPagina").find("#inputBuscaTopo").css("opacity", "0").css("visibility", "hidden");
    if (verificaPaginaAtual() != "checkout") {
        $("#topoPagina").find(".topo-sacola").remove();
    }
    if (verificaPaginaAtual() == "pagamento") {
        $("#topoMenuAvisos").remove();
        $("#topoMenuUsuario").remove();
    }
}
function verificaTipoResolucaoPagina(){
    var limiteTablet = 1024;
    var limiteMobile = 767;
    var larg = $(window).width();
    var alt = $(window).height();
    var disp;

    if (larg > limiteMobile && larg <= limiteTablet) {
        disp = "tablet";
    } else if (larg <= limiteMobile) {
        disp = "mobile";
    } else {
        disp = "desktop";
    }
    return {
        tipoTela: disp,
        largura: larg,
        altura: alt
    }
}
function getUrlByGetPosInterrogacao(){
    var somenteVars =  window.location.href.split("?")[1];
    if (somenteVars == undefined) {
        return false;
    } else {
        var somentePosInterrogacao = somenteVars.split("&")[0];
        return somentePosInterrogacao;
    }
}
function ativaBtnAbreConteudo(){
    var novaClasse = "btn-field-abreconteudo-mobile";
    var elemLegendTitulo = $(".resumo-sacola>div>legend");
    if (verificaTipoResolucaoPagina().tipoTela != "desktop") {
        elemLegendTitulo.addClass(novaClasse);
        var arr_paginas = ["checkout", "pagamento", "exibepedido"]
        if ($.inArray(verificaPaginaAtual(), arr_paginas)) {
            criaResumoDaCompraMobile();
        }
    }

    var elementoPai = $("."+novaClasse).parent();
    var elementosFilhos = $("."+novaClasse).parent().find("div");
    $("."+novaClasse).on("click", function(){
        if (elementosFilhos.css("display") == "none") {
            $(".form-checkout").addClass("mobile-ativaConteudoLadoDireito");
            $(".btn-field-abreconteudo-mobile").find(".fechar-elemento").addClass("open");
            elementosFilhos.slideDown("fast");

        } else {
            elementosFilhos.slideUp("fast");
            setTimeout(function(){
                $(".form-checkout").removeClass("mobile-ativaConteudoLadoDireito");
                $(".btn-field-abreconteudo-mobile").find(".fechar-elemento").removeClass("open");
            },200);
        }
    });
}

function criaResumoDaCompraMobile(){
    var elemLegendTitulo = $(".resumo-sacola>div>legend");
    var totalItens = $(".qtdprodutos").find("span").clone().text();
    var valorTotal = $(".total").find("span").clone().text();
    elemLegendTitulo.prepend($("<i>").addClass("fal fa-chevron-down fechar-elemento"));
    elemLegendTitulo.append($("<span>").addClass("resumodacompra-resumomobile").html(valorTotal+" ("+totalItens+" "+verificaPluralDePalavras(totalItens, "item", "itens")+")"));
}
function alterarHtmButtonCarregando(elemBtn, alterar=true, texto="texto_carregando", disabled=true, iconeClass="fa-duotone fa-spinner fa-spin"){
    var traducao = leJsonInfosGeraisForms();
    var elemIcone = elemBtn.find("i");

    if (texto == "texto_carregando") {
        texto = traducao.texto_carregando;
    }
    
    if (alterar){
        elemBtn.attr('data-icone', elemIcone.attr('class'));
        elemBtn.attr('data-texto', elemBtn.text());
    } else {
        disabled = false;
        iconeClass = elemBtn.attr('data-icone');
        texto = elemBtn.attr('data-texto');
        elemBtn.attr('data-icone', '');
        elemBtn.attr('data-texto', '');
    }

    elemBtn.prop("disabled", disabled);
    
    if (elemBtn.find("span").length == 0){
        elemBtn.html('<i class="'+iconeClass+'"></i><span>'+texto+'</span>');
    } else {
        elemBtn.find("span").text(texto);
        elemIcone.removeClass().addClass(iconeClass);
    }
}
function verificaPluralDePalavras(qtd, palavra, plural) {
    var float = parseFloat(qtd);
    if (float == 1) {
        return palavra;
    } else {
        return plural;
    }
}
function verifTargetDeLink(link){
    var host = window.location.hostname;
    var link = link;
    if (link == "null" || link == undefined) {
        link = "";
    }
    
    if (link.indexOf("http") == -1) {
        return "_self";
    }
    if (link.indexOf(host) == -1) {
        return "_blank";
    }
    return "_blank";
}

//MONTANDO MENSAGEM À DIREITA COM INFOS DA LOJA PARA PÁGINA DE CADASTRO E CLIENTE EM ANÁLISE
function formataTamanho_JanelaVenoboxModoInline(tipo){
    var tela = verificaTipoResolucaoPagina();
    var medidas = {
        continuarcompra: {
            desktop: {lar: 1000,alt: 565},
            tablet: {lar: "",alt: 430},
            mobile: {lar: "", alt: tela.altura*0.55}
        },
        deletaproduto: {
            desktop: {lar: 1000,alt: 565},
            tablet: {lar: "",alt: 430},
            mobile: {lar: "", alt: 230}
        },
        simularfretes: {
            desktop: {lar: 900,alt: 600},
            tablet: {lar: "",alt: 430},
            mobile: {lar: "", alt: (tela.altura - ((tela.altura*10)/100))}
        }
    }
    
    return {
        largura: medidas[tipo][tela.tipoTela].lar,
        altura: medidas[tipo][tela.tipoTela].alt
    }
}


function exeAjaxRequest(acao, obj) {
    if (acao == "reload") {
        window.location.reload();
        return false;
    } else if (acao == "fail") {
        console.log("Erro.");
    }
 }

 function getTokenSubmit(){
    $.get("json/index.php", {token:'VjJ0V2FrNVhUbk5qUm1oUFZteEtjbFpxUW5kTlJteFhZVVpLVVZWVU1Eaz0='},function(json){
        var obj =  JSON.parse(json);
        global_tokenSubmit = obj;
    }).fail(function(){
        exeAjaxRequest("fail", {});
    }).always(function(){
        exeAjaxRequest("always", {});
    });
}
function appendTokenSubmitNoForm(form){
    var obj = global_tokenSubmit;
    var input = $('<input>').attr({
        'name': 'token',
        'value': obj.token,
        'type': 'hidden',
    });
    form.append(input);
}

function copiar(e) {
    e.preventDefault();
    var texto = $(this).attr('data-copiar');
    var msg = ($(this).attr('data-copiar-mensagem') == undefined) ? global_traducao.copiado : $(this).attr('data-copiar-mensagem');
    
    var textarea = $('<textarea>').text(texto).attr({id: 'textareaCopiar', display: 'none'});
    var copiado = $('<div>').addClass('content-copiado').html('<i class="fal fa-check"></i><p>'+msg+'</p>');

    $('body').append(textarea);

    var copyText = document.getElementById("textareaCopiar");
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");

    textarea.remove();

    copiado.css({
        top: $(this).offset().top,
        left: $(this).offset().left,
    });
    $('body').append(copiado);
    setTimeout(function(){
        copiado.addClass('on');
    }, 500);
    setTimeout(function(){
        copiado.fadeOut(function(){
            $(this).remove();
        });
    }, 3500);

    // document.getElementById("clip_btn").innerHTML='<i class="fas fa-clipboard-check"></i>';
}

/*-----------------------------------------------------------------------------------------------------------------------------*/
//PIXELS
    function getPixelsDeIntegracao() {
        $.get("json/?token=VjFaYWFrMVZNVWRqUm1oaFUwZDRZVlpxUVRGTmJHUnpZVVUxVVZWVU1Eaz0=", function(data){
            // var obj = JSON.parse(atob(data));
            // console.log(data);
            // return;

            var resp = JSON.parse(data);

            //init google analytcs
            // initPixelIntegracoes(integracao);
            // createPixelIntegracao(integracao);

            
            // importarArquivos({js:['./scripts/events.js']});
            initPixel(resp.cliente, resp.loja, resp.integracoes, resp.session_id);


            if (location.pathname === "/pagamentoconcluido") {
                // sendPixelPagamento();
                sendPixel('pagamento');
            }

        }).fail(function(){
            exeAjaxRequest("fail", {});
        }).always(function(){
            exeAjaxRequest("always", {});
        });
    }

/*-----------------------------------------------------------------------------------------------------------------------------*/
//ENVIO DE EMAILS
function enviaEmails(obj){
    // $.post("libs/enviodeemails/enviaemail.php", obj, function(data){
    $.get("parceiros/envia_emails.asp", obj, function(data){
        // console.log(data);
    });
}

    
/*-----------------------------------------------------------------------------------------------------------------------------*/
//MONTA ELEMENTOS PARA LEAD

 function listaTodosEstadosBr(){
    return [["AC", "Acre"],["AL", "Alagoas"],["AP", "Amapá"],["AM", "Amazonas"],["BA", "Bahia"],["CE", "Ceará"],["DF", "Distrito Federal"],["ES", "Espírito Santo"],["GO", "Goias"],["MA", "Maranhão"],["MT", "Mato Grosso"],["MS", "Mato Grosso do Sul"],["MG", "Minas Gerais"],["PA", "Pará"],["PB", "Paraíba"],["PR", "Paraná"],["PE", "Pernambuco"],["PI", "Piauí"],["RJ", "Rio de Janeiro"],["RN", "Rio Grande do Norte"],["RS", "Rio Grande do Sul"],["RO", "Rondônia"],["RR", "Roraima"],["SC", "Santa Catarina"],["SP", "São Paulo"],["SE", "Sergipe"],["TO", "Tocantins"]];
}
function listaTodosPaises(){
    var allCountries = [ [ "Afghanistan (‫افغانستان‬‎)", "af", "93" ], [ "Albania (Shqipëri)", "al", "355" ], [ "Algeria (‫الجزائر‬‎)", "dz", "213" ], [ "American Samoa", "as", "1", 5, [ "684" ] ], [ "Andorra", "ad", "376" ], [ "Angola", "ao", "244" ], [ "Anguilla", "ai", "1", 6, [ "264" ] ], [ "Antigua and Barbuda", "ag", "1", 7, [ "268" ] ], [ "Argentina", "ar", "54" ], [ "Armenia (Հայաստան)", "am", "374" ], [ "Aruba", "aw", "297" ], [ "Ascension Island", "ac", "247" ], [ "Australia", "au", "61", 0 ], [ "Austria (Österreich)", "at", "43" ], [ "Azerbaijan (Azərbaycan)", "az", "994" ], [ "Bahamas", "bs", "1", 8, [ "242" ] ], [ "Bahrain (‫البحرين‬‎)", "bh", "973" ], [ "Bangladesh (বাংলাদেশ)", "bd", "880" ], [ "Barbados", "bb", "1", 9, [ "246" ] ], [ "Belarus (Беларусь)", "by", "375" ], [ "Belgium (België)", "be", "32" ], [ "Belize", "bz", "501" ], [ "Benin (Bénin)", "bj", "229" ], [ "Bermuda", "bm", "1", 10, [ "441" ] ], [ "Bhutan (འབྲུག)", "bt", "975" ], [ "Bolivia", "bo", "591" ], [ "Bosnia and Herzegovina (Босна и Херцеговина)", "ba", "387" ], [ "Botswana", "bw", "267" ], [ "Brazil (Brasil)", "br", "55" ], [ "British Indian Ocean Territory", "io", "246" ], [ "British Virgin Islands", "vg", "1", 11, [ "284" ] ], [ "Brunei", "bn", "673" ], [ "Bulgaria (България)", "bg", "359" ], [ "Burkina Faso", "bf", "226" ], [ "Burundi (Uburundi)", "bi", "257" ], [ "Cambodia (កម្ពុជា)", "kh", "855" ], [ "Cameroon (Cameroun)", "cm", "237" ], [ "Canada", "ca", "1", 1, [ "204", "226", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905" ] ], [ "Cape Verde (Kabu Verdi)", "cv", "238" ], [ "Caribbean Netherlands", "bq", "599", 1, [ "3", "4", "7" ] ], [ "Cayman Islands", "ky", "1", 12, [ "345" ] ], [ "Central African Republic (République centrafricaine)", "cf", "236" ], [ "Chad (Tchad)", "td", "235" ], [ "Chile", "cl", "56" ], [ "China (中国)", "cn", "86" ], [ "Christmas Island", "cx", "61", 2, [ "89164" ] ], [ "Cocos (Keeling) Islands", "cc", "61", 1, [ "89162" ] ], [ "Colombia", "co", "57" ], [ "Comoros (‫جزر القمر‬‎)", "km", "269" ], [ "Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", "cd", "243" ], [ "Congo (Republic) (Congo-Brazzaville)", "cg", "242" ], [ "Cook Islands", "ck", "682" ], [ "Costa Rica", "cr", "506" ], [ "Côte d’Ivoire", "ci", "225" ], [ "Croatia (Hrvatska)", "hr", "385" ], [ "Cuba", "cu", "53" ], [ "Curaçao", "cw", "599", 0 ], [ "Cyprus (Κύπρος)", "cy", "357" ], [ "Czech Republic (Česká republika)", "cz", "420" ], [ "Denmark (Danmark)", "dk", "45" ], [ "Djibouti", "dj", "253" ], [ "Dominica", "dm", "1", 13, [ "767" ] ], [ "Dominican Republic (República Dominicana)", "do", "1", 2, [ "809", "829", "849" ] ], [ "Ecuador", "ec", "593" ], [ "Egypt (‫مصر‬‎)", "eg", "20" ], [ "El Salvador", "sv", "503" ], [ "Equatorial Guinea (Guinea Ecuatorial)", "gq", "240" ], [ "Eritrea", "er", "291" ], [ "Estonia (Eesti)", "ee", "372" ], [ "Eswatini", "sz", "268" ], [ "Ethiopia", "et", "251" ], [ "Falkland Islands (Islas Malvinas)", "fk", "500" ], [ "Faroe Islands (Føroyar)", "fo", "298" ], [ "Fiji", "fj", "679" ], [ "Finland (Suomi)", "fi", "358", 0 ], [ "France", "fr", "33" ], [ "French Guiana (Guyane française)", "gf", "594" ], [ "French Polynesia (Polynésie française)", "pf", "689" ], [ "Gabon", "ga", "241" ], [ "Gambia", "gm", "220" ], [ "Georgia (საქართველო)", "ge", "995" ], [ "Germany (Deutschland)", "de", "49" ], [ "Ghana (Gaana)", "gh", "233" ], [ "Gibraltar", "gi", "350" ], [ "Greece (Ελλάδα)", "gr", "30" ], [ "Greenland (Kalaallit Nunaat)", "gl", "299" ], [ "Grenada", "gd", "1", 14, [ "473" ] ], [ "Guadeloupe", "gp", "590", 0 ], [ "Guam", "gu", "1", 15, [ "671" ] ], [ "Guatemala", "gt", "502" ], [ "Guernsey", "gg", "44", 1, [ "1481", "7781", "7839", "7911" ] ], [ "Guinea (Guinée)", "gn", "224" ], [ "Guinea-Bissau (Guiné Bissau)", "gw", "245" ], [ "Guyana", "gy", "592" ], [ "Haiti", "ht", "509" ], [ "Honduras", "hn", "504" ], [ "Hong Kong (香港)", "hk", "852" ], [ "Hungary (Magyarország)", "hu", "36" ], [ "Iceland (Ísland)", "is", "354" ], [ "India (भारत)", "in", "91" ], [ "Indonesia", "id", "62" ], [ "Iran (‫ایران‬‎)", "ir", "98" ], [ "Iraq (‫العراق‬‎)", "iq", "964" ], [ "Ireland", "ie", "353" ], [ "Isle of Man", "im", "44", 2, [ "1624", "74576", "7524", "7924", "7624" ] ], [ "Israel (‫ישראל‬‎)", "il", "972" ], [ "Italy (Italia)", "it", "39", 0 ], [ "Jamaica", "jm", "1", 4, [ "876", "658" ] ], [ "Japan (日本)", "jp", "81" ], [ "Jersey", "je", "44", 3, [ "1534", "7509", "7700", "7797", "7829", "7937" ] ], [ "Jordan (‫الأردن‬‎)", "jo", "962" ], [ "Kazakhstan (Казахстан)", "kz", "7", 1, [ "33", "7" ] ], [ "Kenya", "ke", "254" ], [ "Kiribati", "ki", "686" ], [ "Kosovo", "xk", "383" ], [ "Kuwait (‫الكويت‬‎)", "kw", "965" ], [ "Kyrgyzstan (Кыргызстан)", "kg", "996" ], [ "Laos (ລາວ)", "la", "856" ], [ "Latvia (Latvija)", "lv", "371" ], [ "Lebanon (‫لبنان‬‎)", "lb", "961" ], [ "Lesotho", "ls", "266" ], [ "Liberia", "lr", "231" ], [ "Libya (‫ليبيا‬‎)", "ly", "218" ], [ "Liechtenstein", "li", "423" ], [ "Lithuania (Lietuva)", "lt", "370" ], [ "Luxembourg", "lu", "352" ], [ "Macau (澳門)", "mo", "853" ], [ "Macedonia (FYROM) (Македонија)", "mk", "389" ], [ "Madagascar (Madagasikara)", "mg", "261" ], [ "Malawi", "mw", "265" ], [ "Malaysia", "my", "60" ], [ "Maldives", "mv", "960" ], [ "Mali", "ml", "223" ], [ "Malta", "mt", "356" ], [ "Marshall Islands", "mh", "692" ], [ "Martinique", "mq", "596" ], [ "Mauritania (‫موريتانيا‬‎)", "mr", "222" ], [ "Mauritius (Moris)", "mu", "230" ], [ "Mayotte", "yt", "262", 1, [ "269", "639" ] ], [ "Mexico (México)", "mx", "52" ], [ "Micronesia", "fm", "691" ], [ "Moldova (Republica Moldova)", "md", "373" ], [ "Monaco", "mc", "377" ], [ "Mongolia (Монгол)", "mn", "976" ], [ "Montenegro (Crna Gora)", "me", "382" ], [ "Montserrat", "ms", "1", 16, [ "664" ] ], [ "Morocco (‫المغرب‬‎)", "ma", "212", 0 ], [ "Mozambique (Moçambique)", "mz", "258" ], [ "Myanmar (Burma) (မြန်မာ)", "mm", "95" ], [ "Namibia (Namibië)", "na", "264" ], [ "Nauru", "nr", "674" ], [ "Nepal (नेपाल)", "np", "977" ], [ "Netherlands (Nederland)", "nl", "31" ], [ "New Caledonia (Nouvelle-Calédonie)", "nc", "687" ], [ "New Zealand", "nz", "64" ], [ "Nicaragua", "ni", "505" ], [ "Niger (Nijar)", "ne", "227" ], [ "Nigeria", "ng", "234" ], [ "Niue", "nu", "683" ], [ "Norfolk Island", "nf", "672" ], [ "North Korea (조선 민주주의 인민 공화국)", "kp", "850" ], [ "Northern Mariana Islands", "mp", "1", 17, [ "670" ] ], [ "Norway (Norge)", "no", "47", 0 ], [ "Oman (‫عُمان‬‎)", "om", "968" ], [ "Pakistan (‫پاکستان‬‎)", "pk", "92" ], [ "Palau", "pw", "680" ], [ "Palestine (‫فلسطين‬‎)", "ps", "970" ], [ "Panama (Panamá)", "pa", "507" ], [ "Papua New Guinea", "pg", "675" ], [ "Paraguay", "py", "595" ], [ "Peru (Perú)", "pe", "51" ], [ "Philippines", "ph", "63" ], [ "Poland (Polska)", "pl", "48" ], [ "Portugal", "pt", "351" ], [ "Puerto Rico", "pr", "1", 3, [ "787", "939" ] ], [ "Qatar (‫قطر‬‎)", "qa", "974" ], [ "Réunion (La Réunion)", "re", "262", 0 ], [ "Romania (România)", "ro", "40" ], [ "Russia (Россия)", "ru", "7", 0 ], [ "Rwanda", "rw", "250" ], [ "Saint Barthélemy", "bl", "590", 1 ], [ "Saint Helena", "sh", "290" ], [ "Saint Kitts and Nevis", "kn", "1", 18, [ "869" ] ], [ "Saint Lucia", "lc", "1", 19, [ "758" ] ], [ "Saint Martin (Saint-Martin (partie française))", "mf", "590", 2 ], [ "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "pm", "508" ], [ "Saint Vincent and the Grenadines", "vc", "1", 20, [ "784" ] ], [ "Samoa", "ws", "685" ], [ "San Marino", "sm", "378" ], [ "São Tomé and Príncipe (São Tomé e Príncipe)", "st", "239" ], [ "Saudi Arabia (‫المملكة العربية السعودية‬‎)", "sa", "966" ], [ "Senegal (Sénégal)", "sn", "221" ], [ "Serbia (Србија)", "rs", "381" ], [ "Seychelles", "sc", "248" ], [ "Sierra Leone", "sl", "232" ], [ "Singapore", "sg", "65" ], [ "Sint Maarten", "sx", "1", 21, [ "721" ] ], [ "Slovakia (Slovensko)", "sk", "421" ], [ "Slovenia (Slovenija)", "si", "386" ], [ "Solomon Islands", "sb", "677" ], [ "Somalia (Soomaaliya)", "so", "252" ], [ "South Africa", "za", "27" ], [ "South Korea (대한민국)", "kr", "82" ], [ "South Sudan (‫جنوب السودان‬‎)", "ss", "211" ], [ "Spain (España)", "es", "34" ], [ "Sri Lanka (ශ්‍රී ලංකාව)", "lk", "94" ], [ "Sudan (‫السودان‬‎)", "sd", "249" ], [ "Suriname", "sr", "597" ], [ "Svalbard and Jan Mayen", "sj", "47", 1, [ "79" ] ], [ "Sweden (Sverige)", "se", "46" ], [ "Switzerland (Schweiz)", "ch", "41" ], [ "Syria (‫سوريا‬‎)", "sy", "963" ], [ "Taiwan (台灣)", "tw", "886" ], [ "Tajikistan", "tj", "992" ], [ "Tanzania", "tz", "255" ], [ "Thailand (ไทย)", "th", "66" ], [ "Timor-Leste", "tl", "670" ], [ "Togo", "tg", "228" ], [ "Tokelau", "tk", "690" ], [ "Tonga", "to", "676" ], [ "Trinidad and Tobago", "tt", "1", 22, [ "868" ] ], [ "Tunisia (‫تونس‬‎)", "tn", "216" ], [ "Turkey (Türkiye)", "tr", "90" ], [ "Turkmenistan", "tm", "993" ], [ "Turks and Caicos Islands", "tc", "1", 23, [ "649" ] ], [ "Tuvalu", "tv", "688" ], [ "U.S. Virgin Islands", "vi", "1", 24, [ "340" ] ], [ "Uganda", "ug", "256" ], [ "Ukraine (Україна)", "ua", "380" ], [ "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "ae", "971" ], [ "United Kingdom", "gb", "44", 0 ], [ "United States", "us", "1", 0 ], [ "Uruguay", "uy", "598" ], [ "Uzbekistan (Oʻzbekiston)", "uz", "998" ], [ "Vanuatu", "vu", "678" ], [ "Vatican City (Città del Vaticano)", "va", "39", 1, [ "06698" ] ], [ "Venezuela", "ve", "58" ], [ "Vietnam (Việt Nam)", "vn", "84" ], [ "Wallis and Futuna (Wallis-et-Futuna)", "wf", "681" ], [ "Western Sahara (‫الصحراء الغربية‬‎)", "eh", "212", 1, [ "5288", "5289" ] ], [ "Yemen (‫اليمن‬‎)", "ye", "967" ], [ "Zambia", "zm", "260" ], [ "Zimbabwe", "zw", "263" ], [ "Åland Islands", "ax", "358", 1, [ "18" ] ] ];
    // var allCountries_semBrasil = [ [ "Afghanistan (‫افغانستان‬‎)", "af", "93" ], [ "Albania (Shqipëri)", "al", "355" ], [ "Algeria (‫الجزائر‬‎)", "dz", "213" ], [ "American Samoa", "as", "1", 5, [ "684" ] ], [ "Andorra", "ad", "376" ], [ "Angola", "ao", "244" ], [ "Anguilla", "ai", "1", 6, [ "264" ] ], [ "Antigua and Barbuda", "ag", "1", 7, [ "268" ] ], [ "Argentina", "ar", "54" ], [ "Armenia (Հայաստան)", "am", "374" ], [ "Aruba", "aw", "297" ], [ "Ascension Island", "ac", "247" ], [ "Australia", "au", "61", 0 ], [ "Austria (Österreich)", "at", "43" ], [ "Azerbaijan (Azərbaycan)", "az", "994" ], [ "Bahamas", "bs", "1", 8, [ "242" ] ], [ "Bahrain (‫البحرين‬‎)", "bh", "973" ], [ "Bangladesh (বাংলাদেশ)", "bd", "880" ], [ "Barbados", "bb", "1", 9, [ "246" ] ], [ "Belarus (Беларусь)", "by", "375" ], [ "Belgium (België)", "be", "32" ], [ "Belize", "bz", "501" ], [ "Benin (Bénin)", "bj", "229" ], [ "Bermuda", "bm", "1", 10, [ "441" ] ], [ "Bhutan (འབྲུག)", "bt", "975" ], [ "Bolivia", "bo", "591" ], [ "Bosnia and Herzegovina (Босна и Херцеговина)", "ba", "387" ], [ "Botswana", "bw", "267" ], [ "British Indian Ocean Territory", "io", "246" ], [ "British Virgin Islands", "vg", "1", 11, [ "284" ] ], [ "Brunei", "bn", "673" ], [ "Bulgaria (България)", "bg", "359" ], [ "Burkina Faso", "bf", "226" ], [ "Burundi (Uburundi)", "bi", "257" ], [ "Cambodia (កម្ពុជា)", "kh", "855" ], [ "Cameroon (Cameroun)", "cm", "237" ], [ "Canada", "ca", "1", 1, [ "204", "226", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905" ] ], [ "Cape Verde (Kabu Verdi)", "cv", "238" ], [ "Caribbean Netherlands", "bq", "599", 1, [ "3", "4", "7" ] ], [ "Cayman Islands", "ky", "1", 12, [ "345" ] ], [ "Central African Republic (République centrafricaine)", "cf", "236" ], [ "Chad (Tchad)", "td", "235" ], [ "Chile", "cl", "56" ], [ "China (中国)", "cn", "86" ], [ "Christmas Island", "cx", "61", 2, [ "89164" ] ], [ "Cocos (Keeling) Islands", "cc", "61", 1, [ "89162" ] ], [ "Colombia", "co", "57" ], [ "Comoros (‫جزر القمر‬‎)", "km", "269" ], [ "Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", "cd", "243" ], [ "Congo (Republic) (Congo-Brazzaville)", "cg", "242" ], [ "Cook Islands", "ck", "682" ], [ "Costa Rica", "cr", "506" ], [ "Côte d’Ivoire", "ci", "225" ], [ "Croatia (Hrvatska)", "hr", "385" ], [ "Cuba", "cu", "53" ], [ "Curaçao", "cw", "599", 0 ], [ "Cyprus (Κύπρος)", "cy", "357" ], [ "Czech Republic (Česká republika)", "cz", "420" ], [ "Denmark (Danmark)", "dk", "45" ], [ "Djibouti", "dj", "253" ], [ "Dominica", "dm", "1", 13, [ "767" ] ], [ "Dominican Republic (República Dominicana)", "do", "1", 2, [ "809", "829", "849" ] ], [ "Ecuador", "ec", "593" ], [ "Egypt (‫مصر‬‎)", "eg", "20" ], [ "El Salvador", "sv", "503" ], [ "Equatorial Guinea (Guinea Ecuatorial)", "gq", "240" ], [ "Eritrea", "er", "291" ], [ "Estonia (Eesti)", "ee", "372" ], [ "Eswatini", "sz", "268" ], [ "Ethiopia", "et", "251" ], [ "Falkland Islands (Islas Malvinas)", "fk", "500" ], [ "Faroe Islands (Føroyar)", "fo", "298" ], [ "Fiji", "fj", "679" ], [ "Finland (Suomi)", "fi", "358", 0 ], [ "France", "fr", "33" ], [ "French Guiana (Guyane française)", "gf", "594" ], [ "French Polynesia (Polynésie française)", "pf", "689" ], [ "Gabon", "ga", "241" ], [ "Gambia", "gm", "220" ], [ "Georgia (საქართველო)", "ge", "995" ], [ "Germany (Deutschland)", "de", "49" ], [ "Ghana (Gaana)", "gh", "233" ], [ "Gibraltar", "gi", "350" ], [ "Greece (Ελλάδα)", "gr", "30" ], [ "Greenland (Kalaallit Nunaat)", "gl", "299" ], [ "Grenada", "gd", "1", 14, [ "473" ] ], [ "Guadeloupe", "gp", "590", 0 ], [ "Guam", "gu", "1", 15, [ "671" ] ], [ "Guatemala", "gt", "502" ], [ "Guernsey", "gg", "44", 1, [ "1481", "7781", "7839", "7911" ] ], [ "Guinea (Guinée)", "gn", "224" ], [ "Guinea-Bissau (Guiné Bissau)", "gw", "245" ], [ "Guyana", "gy", "592" ], [ "Haiti", "ht", "509" ], [ "Honduras", "hn", "504" ], [ "Hong Kong (香港)", "hk", "852" ], [ "Hungary (Magyarország)", "hu", "36" ], [ "Iceland (Ísland)", "is", "354" ], [ "India (भारत)", "in", "91" ], [ "Indonesia", "id", "62" ], [ "Iran (‫ایران‬‎)", "ir", "98" ], [ "Iraq (‫العراق‬‎)", "iq", "964" ], [ "Ireland", "ie", "353" ], [ "Isle of Man", "im", "44", 2, [ "1624", "74576", "7524", "7924", "7624" ] ], [ "Israel (‫ישראל‬‎)", "il", "972" ], [ "Italy (Italia)", "it", "39", 0 ], [ "Jamaica", "jm", "1", 4, [ "876", "658" ] ], [ "Japan (日本)", "jp", "81" ], [ "Jersey", "je", "44", 3, [ "1534", "7509", "7700", "7797", "7829", "7937" ] ], [ "Jordan (‫الأردن‬‎)", "jo", "962" ], [ "Kazakhstan (Казахстан)", "kz", "7", 1, [ "33", "7" ] ], [ "Kenya", "ke", "254" ], [ "Kiribati", "ki", "686" ], [ "Kosovo", "xk", "383" ], [ "Kuwait (‫الكويت‬‎)", "kw", "965" ], [ "Kyrgyzstan (Кыргызстан)", "kg", "996" ], [ "Laos (ລາວ)", "la", "856" ], [ "Latvia (Latvija)", "lv", "371" ], [ "Lebanon (‫لبنان‬‎)", "lb", "961" ], [ "Lesotho", "ls", "266" ], [ "Liberia", "lr", "231" ], [ "Libya (‫ليبيا‬‎)", "ly", "218" ], [ "Liechtenstein", "li", "423" ], [ "Lithuania (Lietuva)", "lt", "370" ], [ "Luxembourg", "lu", "352" ], [ "Macau (澳門)", "mo", "853" ], [ "Macedonia (FYROM) (Македонија)", "mk", "389" ], [ "Madagascar (Madagasikara)", "mg", "261" ], [ "Malawi", "mw", "265" ], [ "Malaysia", "my", "60" ], [ "Maldives", "mv", "960" ], [ "Mali", "ml", "223" ], [ "Malta", "mt", "356" ], [ "Marshall Islands", "mh", "692" ], [ "Martinique", "mq", "596" ], [ "Mauritania (‫موريتانيا‬‎)", "mr", "222" ], [ "Mauritius (Moris)", "mu", "230" ], [ "Mayotte", "yt", "262", 1, [ "269", "639" ] ], [ "Mexico (México)", "mx", "52" ], [ "Micronesia", "fm", "691" ], [ "Moldova (Republica Moldova)", "md", "373" ], [ "Monaco", "mc", "377" ], [ "Mongolia (Монгол)", "mn", "976" ], [ "Montenegro (Crna Gora)", "me", "382" ], [ "Montserrat", "ms", "1", 16, [ "664" ] ], [ "Morocco (‫المغرب‬‎)", "ma", "212", 0 ], [ "Mozambique (Moçambique)", "mz", "258" ], [ "Myanmar (Burma) (မြန်မာ)", "mm", "95" ], [ "Namibia (Namibië)", "na", "264" ], [ "Nauru", "nr", "674" ], [ "Nepal (नेपाल)", "np", "977" ], [ "Netherlands (Nederland)", "nl", "31" ], [ "New Caledonia (Nouvelle-Calédonie)", "nc", "687" ], [ "New Zealand", "nz", "64" ], [ "Nicaragua", "ni", "505" ], [ "Niger (Nijar)", "ne", "227" ], [ "Nigeria", "ng", "234" ], [ "Niue", "nu", "683" ], [ "Norfolk Island", "nf", "672" ], [ "North Korea (조선 민주주의 인민 공화국)", "kp", "850" ], [ "Northern Mariana Islands", "mp", "1", 17, [ "670" ] ], [ "Norway (Norge)", "no", "47", 0 ], [ "Oman (‫عُمان‬‎)", "om", "968" ], [ "Pakistan (‫پاکستان‬‎)", "pk", "92" ], [ "Palau", "pw", "680" ], [ "Palestine (‫فلسطين‬‎)", "ps", "970" ], [ "Panama (Panamá)", "pa", "507" ], [ "Papua New Guinea", "pg", "675" ], [ "Paraguay", "py", "595" ], [ "Peru (Perú)", "pe", "51" ], [ "Philippines", "ph", "63" ], [ "Poland (Polska)", "pl", "48" ], [ "Portugal", "pt", "351" ], [ "Puerto Rico", "pr", "1", 3, [ "787", "939" ] ], [ "Qatar (‫قطر‬‎)", "qa", "974" ], [ "Réunion (La Réunion)", "re", "262", 0 ], [ "Romania (România)", "ro", "40" ], [ "Russia (Россия)", "ru", "7", 0 ], [ "Rwanda", "rw", "250" ], [ "Saint Barthélemy", "bl", "590", 1 ], [ "Saint Helena", "sh", "290" ], [ "Saint Kitts and Nevis", "kn", "1", 18, [ "869" ] ], [ "Saint Lucia", "lc", "1", 19, [ "758" ] ], [ "Saint Martin (Saint-Martin (partie française))", "mf", "590", 2 ], [ "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "pm", "508" ], [ "Saint Vincent and the Grenadines", "vc", "1", 20, [ "784" ] ], [ "Samoa", "ws", "685" ], [ "San Marino", "sm", "378" ], [ "São Tomé and Príncipe (São Tomé e Príncipe)", "st", "239" ], [ "Saudi Arabia (‫المملكة العربية السعودية‬‎)", "sa", "966" ], [ "Senegal (Sénégal)", "sn", "221" ], [ "Serbia (Србија)", "rs", "381" ], [ "Seychelles", "sc", "248" ], [ "Sierra Leone", "sl", "232" ], [ "Singapore", "sg", "65" ], [ "Sint Maarten", "sx", "1", 21, [ "721" ] ], [ "Slovakia (Slovensko)", "sk", "421" ], [ "Slovenia (Slovenija)", "si", "386" ], [ "Solomon Islands", "sb", "677" ], [ "Somalia (Soomaaliya)", "so", "252" ], [ "South Africa", "za", "27" ], [ "South Korea (대한민국)", "kr", "82" ], [ "South Sudan (‫جنوب السودان‬‎)", "ss", "211" ], [ "Spain (España)", "es", "34" ], [ "Sri Lanka (ශ්‍රී ලංකාව)", "lk", "94" ], [ "Sudan (‫السودان‬‎)", "sd", "249" ], [ "Suriname", "sr", "597" ], [ "Svalbard and Jan Mayen", "sj", "47", 1, [ "79" ] ], [ "Sweden (Sverige)", "se", "46" ], [ "Switzerland (Schweiz)", "ch", "41" ], [ "Syria (‫سوريا‬‎)", "sy", "963" ], [ "Taiwan (台灣)", "tw", "886" ], [ "Tajikistan", "tj", "992" ], [ "Tanzania", "tz", "255" ], [ "Thailand (ไทย)", "th", "66" ], [ "Timor-Leste", "tl", "670" ], [ "Togo", "tg", "228" ], [ "Tokelau", "tk", "690" ], [ "Tonga", "to", "676" ], [ "Trinidad and Tobago", "tt", "1", 22, [ "868" ] ], [ "Tunisia (‫تونس‬‎)", "tn", "216" ], [ "Turkey (Türkiye)", "tr", "90" ], [ "Turkmenistan", "tm", "993" ], [ "Turks and Caicos Islands", "tc", "1", 23, [ "649" ] ], [ "Tuvalu", "tv", "688" ], [ "U.S. Virgin Islands", "vi", "1", 24, [ "340" ] ], [ "Uganda", "ug", "256" ], [ "Ukraine (Україна)", "ua", "380" ], [ "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "ae", "971" ], [ "United Kingdom", "gb", "44", 0 ], [ "United States", "us", "1", 0 ], [ "Uruguay", "uy", "598" ], [ "Uzbekistan (Oʻzbekiston)", "uz", "998" ], [ "Vanuatu", "vu", "678" ], [ "Vatican City (Città del Vaticano)", "va", "39", 1, [ "06698" ] ], [ "Venezuela", "ve", "58" ], [ "Vietnam (Việt Nam)", "vn", "84" ], [ "Wallis and Futuna (Wallis-et-Futuna)", "wf", "681" ], [ "Western Sahara (‫الصحراء الغربية‬‎)", "eh", "212", 1, [ "5288", "5289" ] ], [ "Yemen (‫اليمن‬‎)", "ye", "967" ], [ "Zambia", "zm", "260" ], [ "Zimbabwe", "zw", "263" ], [ "Åland Islands", "ax", "358", 1, [ "18" ] ] ];
    return allCountries;
}
function getArrPaisByNome(nome){
    var paises = listaTodosPaises();
    var ret=false;
    $.each(paises, function(ind, val){
        if (val[0].indexOf(nome) == 0) {
            ret = val;
            return false;
        }
    });
    return ret;
}
function montaSelectTodosPaises(select, selected, priorizar=false){
    var bodyData = getBodyData();
    var paises = listaTodosPaises();

    $.each(paises, function(ind, val){
        var codigo = val[1];
        if (bodyData.plataforma == "viashopmoda" && codigo == "br") {
            return;
        }
        var pais_completo = val[0];
        var pais = pais_completo.split('(')[0].trim();
        var option = $('<option>').attr({
            'data-index': ind,
            'data-codigo-pais': codigo,
            value: pais
        }).text(pais_completo);
        // if ($.inArray(codigo, priorizarPaises) != -1) {
        //     select.prepend(option);
        // } else {
        // }
        select.addClass('notranslate').append(option);
    });
    if (priorizar !== false){
        priorizarPaisesDoSelect(priorizar);
    }
}
function priorizarPaisesDoSelect(_priorizar){
    var select = $('#cli_pais');
    var priorizar = {
        br: ["br"],
        en: ["us"],
        es: ["ar", "es", "cl", "co", "mx", "pe", "ve"],
        all: ["ar", "br", "es", "cl", "co", "mx", "pe", "us", "ve"]
    }
    var priorizarPaises = priorizar["all"];
    if (global_bodyData.lang != "pt") {
        priorizarPaises = priorizar[global_bodyData.lang];
    }

    // console.log(priorizarPaises)
    // console.log(global_bodyData.lang)
    var option_selecione = $(select.find('option')[0]);
    $.each(priorizarPaises, function(ind, val){
        var option_clonar = select.find('option[data-codigo-pais="'+val+'"]');
        var clone = option_clonar.clone();
        option_clonar.remove();
        clone.attr('data-clone-index', ind);
        if (ind == 0) {
            option_selecione.after(clone);
        } else {
            select.find('option[data-clone-index="'+(ind-1)+'"]').after(clone);
        }
    });
    select.find('option[data-clone-index="'+(priorizarPaises.length - 1)+'"]').after($('<option>').prop('disabled', true).text('---'));

}

function montaSelectTodosEstadosBr(select){
    var lista = listaTodosEstadosBr();
    $.each(lista, function(ind, val){
        var sigla = val[0];
        var nome = val[1];
        var option = $('<option>').attr({
            value: sigla
        }).text(nome);
        select.append(option);
    });
}
function montaContainerSemProdutos(elemAppend, objErro){
    console.log(objErro);

    $('#carregandoEelemento').fadeOut(function(){$(this).remove()});
    elemAppend.html("").css('width', '100%');

    $('#inputBuscaNoFiltro').parent().parent().parent().remove();
    $("#carregarMaisProdutos").remove();
    $(".filtro-vertical").remove();

    var cont = $("<div>").addClass("msg-nenhum-produto-encontrado "+objErro.nome);
    var icone = $("<div>").addClass('icone').html(objErro.icon);
    var tit = $("<div>").addClass('tit').html(objErro.tit);

    cont.append(icone);
    cont.append(tit);

    $.each(objErro.msg, function(ind, val){
        var msg = $("<p>").addClass('msg'+(ind+1)).html(val);
        cont.append(msg);    
    });

    elemAppend.append(cont);

}


/*-----------------------------------------------------------------------------------------------------------------------------*/
//STORAGE DO NAVEGADOR
const processaStorageHistory = function(acao, str){
    var key = "HISTORICO";
    var acoes = {
        'GET': function(){
            var get = localStorage.getItem(key);
            return JSON.parse(get);
        },
        'ADD': function(){
            var get = acoes["GET"]();
            if (get == null) {
                var set = [str];
            } else {
                if (get[0] == str) {return;}
                if (str.indexOf('/login?invalido') != -1) {return;}
                if (str.indexOf('/cadastroemanalise') != -1) {return;}

                get.unshift(str);
                var set = get.slice(0,5);
            }
            localStorage.setItem(key, JSON.stringify(set));
        }
    }
    if (acoes[acao] == undefined) {
        console.log("ação "+acao+" inválida");
        return;
    }
    return acoes[acao]();
}
const processaStorageNavegacao = function(acao, tipo, add){
    var key = "NAVEGACAO";
    var acoes = {
        'GET': function(){
            var get = localStorage.getItem(key);
            return JSON.parse(get);
        },
        'ADD': function(){
            var get = acoes['GET']();
            if (get == null) {
                var set = {};
                set[tipo] = [add]
            } else {
                if (get[tipo] == null) {
                    get[tipo] = [add]
                } else {
                    get[tipo].unshift(add);
                }
                var set = get;
            }
            localStorage.setItem(key, JSON.stringify(set));
        }
    }
    if (acoes[acao] == undefined) {
        console.log('ação '+acao+' inválida');
        return;
    }
    return acoes[acao]();
}
//CRIANDO OS LOCALSTORAGE
    //grava dados digitados no formulario de cadastro de cliente
    function localstorageKEY_CadastroCliente(){
        return "VSMLS_CADASTROCLIENTE";
    }
    //gravar produtos acessados
    function localstorageKEY_ProdutosAcessados(){
        return "VSMLS_PRODUTOSACESSADOS";
    }
    //gravar tentativa de cadastro com dados que ja existem
    function localstorageKEY_CadastroComDadosQueJaExistem(){
        return "VSMLS_CADASTROCOMDADOSQUEJAEXISTEM";
    }
    //gravar tentativa de cadastro com dados que ja existem
    function localstorageKEY_UltimoLogin(){
        return "VSM_ULTIMOLOGINCLIENTE";
    }
    //gravar pagina atual de produto
    function localstorageKEY_QueryMaisProdutos(){
        return "VSM_QUERYMAISPRODUTOS";
    }
    //gravar avisos para o usuário
    function sessionstorageKEY_Avisos(){
        return "VSM_AVISOS";
    }
    //dados do cliente antes do cadastro
    function sessionstorageKEY_Avisos(){
        return "VSM_AVISOS";
    }

//SET LOCALSTORAGE
    function setLocalstorage_CadastroCliente(obj){
        var lsKey = localstorageKEY_CadastroCliente();
        var getLS = localStorage.getItem(lsKey);
        var data = {};
        var json, getLs;
        if (getLS != null) {
            getLs = localStorage.getItem(lsKey);
            data = JSON.parse(getLs);
        }
        data[obj.name] = obj.value;
        json = JSON.stringify(data);
        localStorage.setItem(lsKey, json);
    }

    function setLocalstorage_ProdutosAcessados(obj){
        var objAcessos = [];
        var lsKey = localstorageKEY_ProdutosAcessados();

        if (localStorage.getItem(lsKey)) {
            var getLS = localStorage.getItem(lsKey);
            var objAcessos = JSON.parse(getLS);
            objAcessos.push(obj);
        } else {
            objAcessos.push(obj);
        }
        var add = JSON.stringify(objAcessos);
        localStorage.setItem(lsKey, add);
    }
    function setLocalstorage_CadastroComDadosQueJaExistem(obj){
        localStorage.setItem(localstorageKEY_CadastroComDadosQueJaExistem(), obj);
    }
    function setLocalstorage_UltimoLogin(objCliente){
        var objSetUltimoLogin = {
            nome: objCliente.conteudo[0].nome,
            email: objCliente.conteudo[0].email,
            data:transformarEmdata("hoje").ano+"-"+transformarEmdata("hoje").mes+"-"+transformarEmdata("hoje").dia
        }
        var json = JSON.stringify(objSetUltimoLogin);
        localStorage.setItem(localstorageKEY_UltimoLogin(), json);
    }
    function setLocalstorage_QueryMaisProdutos(objPaginacao, idProduto){
        var json;
        objPaginacao["idProduto"] = idProduto;
        json = JSON.stringify(objPaginacao);
        sessionStorage.setItem(localstorageKEY_QueryMaisProdutos(), json);
    }
//RETORNANDO LOCALSTORAGE
    function getLocalstorage_CadastroCliente(){
        return localStorage.getItem(localstorageKEY_CadastroCliente());
    }
    function getLocalstorage_ProdutosAcessados(){
        return localStorage.getItem(localstorageKEY_ProdutosAcessados())
    }
    function getLocalstorage_CadastroComDadosQueJaExistem(){
        return localStorage.getItem(localstorageKEY_CadastroComDadosQueJaExistem())
    }
    function getLocalstorage_UltimoLogin(){
        return JSON.parse(localStorage.getItem(localstorageKEY_UltimoLogin()));
    }
    function getLocalstorage_QueryMaisProdutos(){
        return JSON.parse(sessionStorage.getItem(localstorageKEY_QueryMaisProdutos()));
    }

//REMOVE LOCALSTORAGE
    function removeLocalstorage_CadastroCliente(){
        localStorage.removeItem(localstorageKEY_CadastroCliente());
    }
    function removeLocalstorage_CadastroComDadosQueJaExistem(){
        localStorage.removeItem(localstorageKEY_CadastroComDadosQueJaExistem());
    }
    function removeLocalstorage_QueryMaisProdutos(){
        sessionStorage.removeItem(localstorageKEY_QueryMaisProdutos());
    }


/**
 * SessionStorage para monstarmos o modal de confirmação se deseja filtrar os produtos de acordo com o tipo de entrega
 * @param {string} acao GET|SET|DEL
 * @param {string} param 
 */
function sessionStorage_confirmFiltroProdutosPorTipoEntrega(acao, param=""){
    var key = function(){
        return "confirmFiltroProdutosPorTipoEntrega";
    }
    var acoes = {
        GET: function(){
            return sessionStorage.getItem(key());
        },
        SET: function(param){
            return sessionStorage.setItem(key(), param);
        },
        DEL: function(){
            return sessionStorage.removeItem(key());
        },
    }
    if (acoes[acao] == undefined) {
        return 'método '+acao+' não encontrado';
    }
    return acoes[acao](param);
}
