const myGoogleElem = '#google_translate_element';


$(function(){
       
    if (
        verificaPaginaAtual().indexOf('iframe') === -1 &&
        $(myGoogleElem).length == 1
    ) {
        
        montaDebug('js google translate: <span id="jsGoogleTranspate">...</span>');
        montaDebug('get configs: <span id="getConfigs">...</span>');
        montaDebug('init google translate: <span id="initGoogleTranspate">...</span>');
        montaDebug('callback #google_translate_element: <span id="callbackMyElem">...</span>');
    
        var observer_initElemGoogle = new MutationObserver(function(){
            montaDebug('ok', '#callbackMyElem');

            setTimeout(function(){
                observerCallback_myElement();
            }, 500);

        });
        observer_initElemGoogle.observe(
            document.querySelector(myGoogleElem),
            {childList: true, attributes: false}
        );
    }

});

/**
 * JS do google executa essa função
 */
function googleTranslateElementInit(){

    if ($(myGoogleElem).length == 0){
        return;
    }

    montaDebug('ok', '#jsGoogleTranspate');

    // Acessar arquivo de configs
    getJsonFile("./libs/google-tradutor/json/configs.json", function(jsonConfigs){

        montaDebug('ok', '#getConfigs');
    
        var traducoes = jsonConfigs.traducoes;
        
        $(myGoogleElem).attr('data-json-configs', JSON.stringify(jsonConfigs));
        
        // Se nossas configs suportar o idioma do browser, chamamos a classe de tradução do google
        if (traducoes[getBodyData().langBrowser] != undefined) {
    
            montaContainerMenuOpcoesTraducao();
    
            new google.translate.TranslateElement({
                pageLanguage: 'pt',
                autoDisplay: false,
                includedLanguages: 'en,es',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element');
        
            montaDebug('ok', '#initGoogleTranspate');
    
        }
    });

}

function carregaConfigs(jsonConfigs){
    montaDebug("carregar configs: ok");

    var traducoes = jsonConfigs.traducoes;
    
    $(myGoogleElem).attr('data-json-configs', JSON.stringify(jsonConfigs));
    
    // Se nossas configs suportar o idioma do browser, chamamos a classe de tradução do google
    if (traducoes[getBodyData().langBrowser] != undefined) {

        montaContainerMenuOpcoesTraducao();

        new google.translate.TranslateElement({
            pageLanguage: 'pt',
            autoDisplay: false,
            includedLanguages: 'en,es',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element');
    
        montaDebug("init google translate: ok");

    }

}


function observerCallback_myElement(){
    
    var elemClassGoogle = $(myGoogleElem).find('a[href="#"]');
    var splitClassGoogle = elemClassGoogle.attr('class').split('-');
    var primeraParteClass = splitClassGoogle[0];
    var classPadrao = splitClassGoogle;
    classPadrao.pop();
    classPadrao = classPadrao.join('-');

    montaDebug("classes: "+classPadrao+' | '+primeraParteClass)

    // add style para sumir com os elementos do google
    $('head').append($('<style>').attr('type', 'text/css').html('[class^="'+primeraParteClass+'"]{visible:hidden!important;display:none!important;}'));

    montaDebug('localizando iframe: <span id="findIframe"></span>');
    findElem($('iframe[class^="'+classPadrao+'"]')[0], function(elem){
        observerCallback_iframeGoogle(classPadrao, primeraParteClass);
    });

}

function observerCallback_iframeGoogle(classPadrao, primeraParteClass){
    montaDebug($('#findIframe').text()+" encontrado", "#findIframe");

    var configs = JSON.parse($(myGoogleElem).attr('data-json-configs'));
    var traducao = configs.traducoes[getBodyData().langBrowser];
    var bodyData = getBodyData();

    if (traducao[getBodyData().lang] != undefined) {
        selMenu(bodyData.lang);
        var elemClick = $("iframe[class^='"+classPadrao+"'").contents().find("span:contains('"+traducao[bodyData.lang]+"')");
        montaDebug("traduzir: "+traducao[bodyData.lang]);
    } else {
        selMenu('pt');
        var elemClick = $($("iframe[class^='"+primeraParteClass+"'")[0]).contents().find("button:contains('"+traducao.original+"')");
        montaDebug("traduzir: "+traducao.original);
    }

    montaDebug("elemClick: "+elemClick.length);
    elemClick.trigger('click');

}




/**
 * Funções Gerais
 */
function getJsonFile(jsonFile, callbackSuccess, callbackFail){
    var date = new Date();
    var pathCompleto = jsonFile+'?';

    var success = function(data, jsonFile){console.log(data, jsonFile);};
    var fail = function(data, jsonFile){console.log(data, jsonFile);};

    $.getJSON(pathCompleto+date.getMilliseconds(), function(data){
        if (typeof callbackSuccess == 'function') {
            callbackSuccess(data, jsonFile);
            return;
        }
        success(data, jsonFile);
    }).fail(function(data){
        if (typeof callbackFail == 'function') {
            callbackFail(data, jsonFile);
            return;
        }
        fail(data, jsonFile);
    });
}
function selMenu(lang_id){
    var container = $('.container-google-tradudor');
    container.find('ul.nav li').removeClass('on');
    container.find('ul.nav li.'+lang_id).addClass('on');
}
function montaContainerMenuOpcoesTraducao(){
    var bodyData = getBodyData();

    if (verificaPaginaAtual().indexOf('iframe') !== -1) {
        return;
    }

    var container = $('body');
    var content = $('<div>').addClass('container-google-tradudor');
    var titulo = $('<div>').addClass('titulo');
    var element_translate = $('<div>').attr('id', 'google_translate_element');
    container.prepend(content);
    var topPositionContent = 'unset';
    if ($('#logoPrincipal').css('display') == "none") {
        topPositionContent = '3.3em';
    }

    var obj_menu = [
        {
            id: 'pt',
            codigo: 'pt-BR',
            titulo: 'Traduzir para português',
        },
        {
            id: 'en',
            codigo: 'en-US',
            titulo: 'Translate to English',
        },
        {
            id: 'es',
            codigo: 'es',
            titulo: 'Traducir al español'
        },
    ];

    var cont_menu = $('<ul>').addClass('nav');
    $.each(obj_menu, function(ind, val){
        var lang = val;
        var li = $('<li>').addClass(lang.id);
        var a = $('<a>');
        var img = $('<img>');
        var url = location.pathname;
        var search = '?lang='+lang.id;
        if (location.search != "") {
            var searchParams = new URLSearchParams(location.search);
            searchParams.set('lang', lang.id);
            search = '?'+searchParams.toString();
        }
        
        a.attr({
            href: url+search,
            title: lang.title
        });
        img.attr({
            'width': '20px',
            'height': '20px',
            'src': bodyData.subdominioImagens+bodyData.urlBase+'/libs/google-tradutor/flags/'+lang.codigo+'.png'
        });
        li.append(a);
        a.append(img);
        cont_menu.append(li);
    });


    // if (location.hostname.indexOf('shopcouture') == -1) {
    //     titulo.text('por Google Tradutor');
    // }

    content.append(titulo);
    // content.append(element_translate);
    content.append(cont_menu);
    container.prepend(content);
}

function findElem(selectorElem, callbackSuccess){
    var counter = 0;
    var timer = setInterval(function() {
        const date = new Date();

        montaDebug((date.getSeconds() + 1 - date.getSeconds())+': '+$(selectorElem).length, "#findIframe");

        if ($(selectorElem).length == 1) {
            clearInterval(timer);
            callbackSuccess(selectorElem);
            return;
        }
        counter++;

    }, 1000);
}

function montaDebug(html, alterarElem=''){
    if ($('#topoDebugLang').length == 0){
        // console.log('init')
        $('body').append($('<div>').addClass('notranslate').attr('id', 'topoDebugLang').css({
            'display': "none",
            'position': "absolute",
            'width': '90%',
            'top': '100px',
            'left': '2.5%',
            'background-color': 'black',
            'color': 'white',
            'padding': '10px',
            'line-height': '30px',
            'z-index': '1000',
            'overflow-wrap': 'anywhere',
        }));
    }

    if (alterarElem == '') {
        $('#topoDebugLang').append($('<div>').html(html));
    } else {
        $(alterarElem).html(html)
    }

    var search = searchToObject();
    if (search.debug == "lang") {
        $('#topoDebugLang').css('display', 'block');
    }
}
