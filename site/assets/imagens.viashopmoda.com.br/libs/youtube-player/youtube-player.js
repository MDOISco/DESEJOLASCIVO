function exeYoutubePlayer(elem, dimensoes, _configs=null) {
    var player;
    var elemId = elem.attr('id');
    var origem = elem.data('origem');
    var codVideo = elem.data('codvideo');
    var largura = dimensoes.largura;
    var altura = dimensoes.altura;

    // console.log(codVideo);

    // Configs do Player
    var configs = _configs;

    if (origem == "bannerPrincipal") {
        var configs = getConfigs_bannerPrincipal();
    } else if (origem == "videoProduto") {
        var configs = getConfigs_videoProduto(elem);
    } else if (origem == "videoProdutoIndex") {
        var configs = getConfigs_videoProdutoIndex(elem);
    } else if (origem == "live") {
        var configs = getConfigs_live(elem);
    }

    window.YT.ready(function() {
        // console.log("ready")
        player = new YT.Player(elemId, {
            width: largura,
            height: altura,
            videoId: codVideo,
            playerVars: configs.playerVars,
            events: configs.events,
        });
    });

}


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// Funções específicas de cada chamada
////////////////////////////////////////////////////////////////////////
// Live
function getConfigs_live(elem){

    var ret = {
        playerVars: {
            'autoplay': 1, //ativa autoplay do video
            'controls': 1, //desativa controles de video
            'showinfo': 0,
            'disablekb': 1,
            'rel': 0, //nao exibe videos relacionados
            'modestbranding': 1
        },
        events: {
            'onReady': function(e){
                // $('.cont-visitantes-aovivo').click(function(eventClick){
                //     console.log(e);
                //     console.log(e.target.getDuration())
                //     console.log(e.target.getCurrentTime())
                //     e.target.seekTo(e.target.getDuration());
                // });
            },
            'onStateChange': function(e){
                // console.log(e)
                // console.log(e.data)
                // console.log(e.target.getDuration());
                // console.log(e.target.showVideoInfo());
                // e.target.seekTo(e.target.getDuration());
                // if (e.data === 2){ // video pausado
                //     $('.cont-live-opcoes').addClass('hide');
                //     $('.cont-chat').removeClass('hide');
                // } else {
                //     $('.cont-live-opcoes').removeClass('hide');
                //     $('.cont-chat').addClass('hide');
                // }
            },
        }
    }
    return ret;
}

// Video no produto INDEX
function getConfigs_videoProdutoIndex(elem){
    var tela = verificaTipoResolucaoPagina();

    var ret = {
        playerVars: {
            'autoplay': 1, //ativa autoplay do video
            'controls': (tela.tipoTela==='mobile') ? 1 : 0, //desativa controles de video
            'showinfo': 0,
            'disablekb': 1,
            // 'fs': 0, //desativa a exibição do botão de tela cheia
            // 'setVolume': 0,
            // 'iv_load_policy': 3,
            // 'enablejsapi': 1,
            'rel': 0, //nao exibe videos relacionados
            'modestbranding': 1
        },
        events: {
            'onReady': function(e){
                e.target.playVideo();
                $('#'+elem.attr('id')).parent().click(function(e){
                    e.preventDefault();
                });
            },
            'onStateChange': function(e){
                if (e.data == 0) { // chechou ao fim
                    e.target.seekTo(0);
                    e.target.stopVideo();
                    $('#'+elem.attr('id')).parent().fadeOut('fast', function(){
                        $(this).remove();
                    }); 
                }
            },
        }
    }
    return ret;
}
// Video no produto - página do produto
function getConfigs_videoProduto(elem){
    var tela = verificaTipoResolucaoPagina();
    var ret = {
        playerVars: {
            'autoplay': 1, //ativa autoplay do video
            'setVolume': 0,
            'mute': 1,
            'muted': 1,
            'controls': (tela.tipoTela==='mobile') ? 1 : 0, //desativa controles de video
            'showinfo': 0,
            'disablekb': 1,
            // 'fs': 0, //desativa a exibição do botão de tela cheia
            // 'setVolume': 0,
            // 'iv_load_policy': 3,
            // 'enablejsapi': 1,
            'rel': 0, //nao exibe videos relacionados
            'modestbranding': 0
        },
        events: {
            'onReady': function(e){
                e.target.playVideo();
                e.target.unMute();            
            },
            'onStateChange': function(e){
                var tela = verificaTipoResolucaoPagina();
                if (e.data == 0) { // chechou ao fim
                    e.target.seekTo(0);
                    e.target.stopVideo();
                    if (tela.tipoTela == "mobile") {
                        $(".foto-video").fadeOut(function(){
                            $(this).remove();
                        });
                    }
                }
            },
        }
    }
    return ret;
}

// Video na Index como banner principal
function getConfigs_bannerPrincipal(){
    var ret = {
        playerVars: {
            'autoplay': 1, //ativa autoplay do video
            'controls': 1, //desativa controles de video
            'fs': 0, //desativa a exibição do botão de tela cheia
            'loop': 1, //faz com que o unico video execute novamente
            // 'playlist' : false,
            'showinfo': 0,
            'setVolume': 0,
            'iv_load_policy': 3,
            'enablejsapi': 1,
            'disablekb': 1,
            'rel': 0, //nao exibe videos relacionados
            'modestbranding': 0
        },
        events: {
            'onReady': function(e){
                console.log(e.target.getAvailableQualityLevels());
                e.target.playVideo();
                e.target.mute();
            },
            'onStateChange': function(e){
                if (e.data == 0) { // chechou ao fim
                    e.target.seekTo(0);
                }
                // if (e.data == 0) { // chechou ao fim
                //     console.log("end 2")
                //     // e.target.playVideo(0);
                //     e.target.seekTo(0);
                // }
            },
        }
    }
    return ret;
}
