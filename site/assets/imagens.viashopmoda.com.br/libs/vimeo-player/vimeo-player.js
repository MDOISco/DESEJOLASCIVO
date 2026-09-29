/**
 * https://github.com/vimeo/player.js
 */
const containerTogglePlay = function(acao){
    var classContainer = 'container-toggleplay';
    var elemContainer = $('.'+classContainer);
    var acoes = {
        criar: function(){
            var container = $('<div>').addClass(classContainer).html('<div class="playpause"><i class="fa-duotone fa-circle-play fa-beat"></i></div>');
            return container;    
        },
        remover: function(){
            elemContainer.fadeOut(function(){$(this).remove();});
        },
        play: function(){
            elemContainer.find('.playpause').addClass('video-paused');
        },
        pause: function(){
            elemContainer.find('.playpause').removeClass('video-paused');
        }
    }
    return acoes[acao]();
}

function exeVimeoPlayer(elem, dimensoes) {
    var iframeId = elem.attr('id');
    var origem = elem.data('origem');
    var codVideo = elem.data('codvideo');
    var largura = dimensoes.largura;
    var altura = dimensoes.altura;
    var objQueryAttrsVideo = {
        "autoplay": 1,
        "title": 0,
        "byline": 0,
        "controls": 0,
        "portrait": 0,
        "speed": 0,
        "badge": 0,
        "autopause": 1,
        "player_id": 0,
        "app_id": 235905
    };


    switch(origem){
        case "live":
            // objQueryAttrsVideo.controls = 1;
            break;
    }

    var queryAttrsVideo = new URLSearchParams(objQueryAttrsVideo).toString();

    var embedVideoIframe = $('<iframe>').attr({
        id: iframeId,
        src: "https://player.vimeo.com/video/"+codVideo+"?"+queryAttrsVideo,
        width: dimensoes.largura+'px',
        height: dimensoes.altura+'px',
        frameborder:0,
        allow:'autoplay',
        allowfullscreen: '',
        // title: obj_video.titulo
    });

    elem.before(embedVideoIframe);
    elem.remove();


    var elemTooglePlayPause = containerTogglePlay("criar");
    const vimeoPlayer = new Vimeo.Player(embedVideoIframe);

    embedVideoIframe.after(elemTooglePlayPause);

    elemTooglePlayPause.click(function(e){
        eventsPlayPause('click', vimeoPlayer);
    });

    vimeoPlayer.on('play', function(e) {
        if (global_tela.tipoTela == "desktop"){
            containerTogglePlay("play");
        }
    });


    switch(origem){
        
        case "live":
            // vimeoPlayer.on('progress', function(e) {
            //     console.log(vimeoPlayer.getCurrentTime());
            // });
            break;

        case "videoProdutoIndex":
            vimeoPlayer.on('ended', function(e) {
                embedVideoIframe.parent().fadeOut(function(){$(this).remove()});
            });
            break;

        case "videoProduto":
            vimeoPlayer.on('ended', function(e) {
                embedVideoIframe.parent().fadeOut(function(){$(this).remove()});
                $('#videosProdutos .elevate-zoom-active').removeClass('elevate-zoom-active');
                $('#slick-slide00').trigger('click');
                $($('#fotosProdutos .slick-track .slick-slide')[0]).trigger('click');
            });
            break;

    }



}


/**
 * Events
 */
const eventsPlayPause = function(event, player){  
    var events = {
        click: function(e){
            player.getPaused().then(function(paused) {
                if (paused) {
                    player.play();
                    containerTogglePlay("play");
                } else {
                    player.pause();
                    containerTogglePlay("pause");
                }
            }).catch(function(error) {
                alert(error)
            });
        }
    }
    events[event]();
}
