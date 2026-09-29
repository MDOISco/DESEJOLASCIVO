$(function(){
    carregaBannerPrincipal();

});
function carregaBannerPrincipal(url) {
    $.get("json/?token=VmpGamVGSXlVbGhUYmxKWFltMTRjVlV3Vm5ka01XeDBUVlU1YWxJd05VbFZiVFZPVUZFOVBRPT0=", function(data){
        var bodyData = getBodyData();
        var json = JSON.parse(data);
        var tela = verificaTipoResolucaoPagina();
        var httpReferer = json.bannerPrincipal.conteudo[0].httpReferer;
        var diretorio = json.bannerPrincipal.conteudo[0].diretorio;
        var banners = json.bannerPrincipal.conteudo[0].bannerPrincipal;
        var banners_mobile = banners.mobile;

        // Vefrifica acesso pelo APP
        if (bodyData == "S") {
            /**
             * Fazendo a transição para lojas que não tiverem o parametro "app" no banner principal
             */
            if (typeof banners.app == "object") {
                if (banners.app.length > 0) {
                    banners_mobile =  banners.app;
                }
            }
        }

        if (tela.tipoTela != "mobile") {
            montaBannerPrincipal_Desktop({banners: banners, diretorio: diretorio}, tela.tipoTela);
            $(".banner-principal").slick({
                dots: true,
                arrows: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                autoplay: true,
                autoplaySpeed: 5000,
            });
        } else {
            montaBannerPrincipal_Mobile({banner: banners_mobile, diretorio: diretorio});
            $(".banner-principal").slick({
                dots: true,
                arrows: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 5000,
            });
        }
    }).fail(function(){
        exeAjaxRequest("fail", {});
    }).always(function(){
        exeAjaxRequest("always", {});
    });
}
function montaBannerPrincipal_Mobile(banners) {
    var obj_banner = [];
    var bodyData = getBodyData();
    //se a loja ainda não enviou nenhum banner (json esta vazio)
    if (banners.banner == undefined) {
        var add_banner = {
            src: bodyData.subdominioImagens+bodyData.urlBase+'/imagens/bannerinicial_mobile.jpg',
            href: 'http://viashop.moda/',
        }
        obj_banner.push(add_banner);
    } else {
        $.each(banners.banner, function (ind, val){
            var add_banner = {
                src: val.src,
                href: val.link,
                target: verifTargetDeLink(val.link),
            }
            obj_banner.push(add_banner);
        });
    }

    $.each(obj_banner, function (ind, val){
        var cont_banner = $("<div>").append($("<img>").attr("src", val.src));
        if (val.href == false || val.href == "") {
            $(".banner-principal").append(cont_banner);
        } else {
            var aLink = $("<a>").attr("target", val.target).attr("href", val.href);
            aLink.append(cont_banner);
            $(".banner-principal").append(aLink);
        }
    });
}

function montaBannerPrincipal_Desktop(banners, tipoTela){
    var bodyData = getBodyData();

    //{"video": [{"type": "youtube", "link": "", "src": "ItS2skqeuA0"}], "desktop": [{"type": "imagem", "link": "http://www.viashopmoda.com.br", "src": "slide01.jpg"}, {"type": "imagem", "link": "http://www.viashopmoda.com.br", "src": "slide02.jpg"}],"mobile": {"type": "imagem", "link": "http://www.viashopmoda.com.br", "src": "banner-index-mob-01.jpg"}}
    if (banners.banners.video.length == 0 || tipoTela == "tablet") {
        var eachBanners = banners.banners.desktop;
    } else {
        var eachBanners = banners.banners.video;
    }
    var sectionBannerPrincipal = $("section.banner-principal");
    var dimensoes = calcProporcaoAlturaDoVideo();

    //se a loja ainda não enviou nenhum banner (json esta vazio)
    if (banners.banners.desktop.length > 0) {
        $.each(eachBanners, function(index, val){
            if (val.type == "imagem") {
                var linha = $("<div>").append($("<img>").attr("src", val.src));
                if (val.link == "") {
                    sectionBannerPrincipal.append(linha);
                } else {
                    var aLink = $("<a>").attr("target", verifTargetDeLink(val.link)).attr("href", val.link);
                    aLink.append(linha);
                    sectionBannerPrincipal.append(aLink);
                }
            } else if (val.type == "youtube") {
                var dimensoes = calcProporcaoAlturaDoVideo();

                var divBlockAlpha = $("<div>").addClass("youtubePlayer-blockalpha");
                var aLink = $("<div>").css({
                    width: dimensoes.largura,
                    height: dimensoes.altura
                });
                var linha = $("<div>").addClass("youtubePlayer").attr({
                    "id": "youtubePlayer_"+val.src,
                    "data-codvideo": val.src,
                    "data-origem": 'bannerPrincipal',
                });
                sectionBannerPrincipal.append(aLink);
                aLink.append(divBlockAlpha);
                aLink.append(linha);

                //executando API do youtube
                exeYoutubePlayer(linha, dimensoes);
                cssIframeYoutubePlayer($('#youtubePlayer_'+val.src.replace('/')), val);
            }
        });
    } else {
        var link = $("<a>").attr("target", "_blank").attr("href", "http://viashop.moda/treinamento/");
        var linha = $("<div>").append($("<img>").attr("src", bodyData.subdominioImagens+bodyData.urlBase+"/imagens/bannerinicial_desktop.jpg"));
        link.append(linha);
        sectionBannerPrincipal.append(link);
    }
}

function cssIframeYoutubePlayer(elem, val){
    if (val.tamanhodobanner == "sim") {
        var add_css = {
            position: 'absolute',
            top: '-25%',
            left: '0',
            width: '100%',
            height: '150%'
        };
    } else {
        var add_css = {
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%'
        };
    }
    elem.css(add_css);
}

function onYouTubeIframeAPIReady(video, wid, hei) {
    var player;
    player = new YT.Player('youtubePlayer_'+video, {
        width: wid,
        height: hei,
        videoId: video,
        playerVars: {
                        'autoplay': 1, //ativa autoplay do video
                        'controls': 0, //desativa controles de video
                        'fs': 0, //desativa a exibição do botão de tela cheia
                        'loop': 1, //faz com que o unico video execute novamente
                        'playlist' : video,
                        'showinfo': 0,
                        'setVolume': 0,
                        'iv_load_policy': 3,
                        'enablejsapi': 1,
                        'disablekb': 1,
                        'rel': 0, //nao exibe videos relacionados
                        'modestbranding': 0
                    },
        events: {
            'onReady': onYouTubePlayerReady
        }
    });

    $('#youtubePlayer_'+video).css({
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%'
    });
}
function onYouTubePlayerReady(event) {
    var dimensoes = calcProporcaoAlturaDoVideo();
    event.target.playVideo();
    // event.target.setSize(width=(dimensoes.largura+300), height=dimensoes.altura);
    event.target.mute();
}
