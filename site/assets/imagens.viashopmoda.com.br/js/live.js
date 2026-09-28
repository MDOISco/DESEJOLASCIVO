function montaContainerLiveAoVivoTopoLoja(){
    // console.log($('.cont-aovivo-topo'));
    $('.cont-aovivo-topo').remove();

    var container = $('#topoPagina .logo');
    var cont_aovivo = $('<div>').addClass('cont-aovivo-topo').html('<i class="fa-solid fa-circle fa-beat-fade fa-xs"></i><span class="notranslate">LIVE</span>');

    container.append(cont_aovivo);
    
    cont_aovivo.click(function(){
        location.href = "/live";
        // if (location.pathname.indexOf('live') == -1){
        //     abreLive();
        // }
    });

}

function abreLive(){
    // console.log($('.container-live').length);
    if ($('.container-live').length > 0){
        return;
    }

    montaContainerCarregandoLive()

    var live = "aovivo";
    var obj_search = searchToObject();

    if (obj_search.assistir != undefined){
        live = obj_search.assistir.split('-');
        live = live[live.length-1];
    }

    $(document).live({
        live: live
    });

}

function montaContainerCarregandoLive(){
    var container = $('<div>').addClass('container-carregando-live');
    var content = $('<div>');
    var i = $('<i>').addClass('fa-duotone fa-spinner fa-spin');
    var p = $('<p>').text('Carregando Live...');
    container.append(content.append(i).append(p));
    $('body').append(container);
    setTimeout(function(){
        container.css('opacity', 1);
    },500);
}

function montaContainerAnuncioLiveDraggle(live){
    var storageName = "ANUNCIOLIVEFECHADA";
    var arrPaginasAbrirLive = ["index","produto","catalogo","meuspedidos"];
    var getStorage = sessionStorage.getItem(storageName);

    if (
        ($.inArray(verificaPaginaAtual(), arrPaginasAbrirLive) == -1) ||
        getStorage == "true"
    ) {
        return;
    }

    var container = $('<div>').addClass('container-anuncio-live');
    var content = $('<div>');
    var contFechar = $('<div>').addClass('cont-fechar').html('<i class="fal fa-times"></i>');
    var contFoto = $('<div>').addClass('cont-foto').html('<img src="'+live.foto+'">');
    var contInfos = $('<a>').attr({
        'href': live.url,
    }).addClass('cont-infos').html('<div class="icone"><i class="fa-solid fa-circle fa-beat-fade fa-2xs" style="color: #ffffff;"></i> live</div><div class="tit">'+live.titulo+'</div>');

    content
        .append(contFoto)
        .append(contInfos)
        // .append(contFechar)
    container.append(content);
    $('body').append(container);


    let foiArrastado = false;
    container.draggable({
        helper: 'original',
        cancel: '.container-anuncio-live .cont-fechar',
        create: function(){
            foiArrastado = false;
            helperEventDraggable('create', 'criarContFechar');
        },
        drag: function() {
            foiArrastado = true;
        },
        start: function(event, ui){
            helperEventDraggable('start', 'deleteContFechar');
        },
        stop: function(event, ui){
            foiArrastado = false;
            helperEventDraggable('stop', 'criarContFechar');
        },
    });

    contInfos.on("touchend", function(e){
        e.preventDefault();
        if (foiArrastado === false){
            window.location.href = $(this).attr("href");
        }
    });

}

function helperEventDraggable(nomeEvento, metodo){
    var metodos = {
        criarContFechar: function(nomeEvento){
            var contFechar = $('<div>').addClass('container-anuncio-live-cont-fechar').html('<i class="fal fa-times"></i>');
            $('body').append(contFechar);

            var tela = verificaTipoResolucaoPagina();
            var containerPosition = $('.container-anuncio-live').position();
            var containerSize = [$('.container-anuncio-live').width(), $('.container-anuncio-live').height()];
            var fecharSize = [contFechar.width(), contFechar.height()];
            if (tela.tipoTela == "mobile"){
                contFechar.css({
                    top: (nomeEvento=='stop') ? (containerPosition.top + 177)+'px' : 'unset',
                    bottom: (nomeEvento=='stop') ? 'unset' : '25px',
                    left: (containerPosition.left + (containerSize[0]/2)) - (fecharSize[0])+'px',
                });
            } else {
                contFechar.css({
                    top: (containerPosition.top - (fecharSize[0] / 2))+'px',
                    left: (containerPosition.left + containerSize[0]) - (fecharSize[1] / 2)+'px',
                });
            }

            setTimeout(function(){
                contFechar.addClass('on');
            },500);
            
            contFechar.on('click', function(event){
                sessionStorage.setItem('ANUNCIOLIVEFECHADA', "true");
                $(this).fadeOut(function(){
                    $(this).remove();
                });
                $('.container-anuncio-live').fadeOut(function(){
                    $(this).remove();
                });
            });
        },
        deleteContFechar: function(nomeEvento){
            $('.container-anuncio-live-cont-fechar').remove();
        },
    };
    metodos[metodo](nomeEvento);
}
