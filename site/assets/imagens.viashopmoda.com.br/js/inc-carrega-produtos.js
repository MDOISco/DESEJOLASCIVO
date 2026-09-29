function criaObjetoCarregaProduto(token, pagina, limite){

    var getFiltroHtml = getFiltroDeUrlComHtml();
    var search = searchToObject();

    if (getFiltroHtml) {
        search[getFiltroHtml.key] = getFiltroHtml.value;
    }

    var params = [
        'token',
        'busca',
        'prevenda',
        'entrega',
        'colecoes',
        'generos',
        'categorias',
        'tamanhos',
        'cores',
        'precos',
        'ordenar',
        'desconto',
        'pagina',
        'limite'
    ];

    $.each(params, function(ind, val){
        search[val] = search[val];
    });

    search.token = token;
    search.pagina = pagina;
    search.limite = limite;
    
    if (location.pathname.indexOf("tirapedido") != -1) {
        var split_url = location.pathname.split('/');
        if (split_url.length > 2) {
            search["vitrine"] = split_url[2];
        }
        if (split_url.length > 3) {
            search["rastreio"] = split_url[3];
        }
    }

    return search;

}


function montaCont_iframePlayerVideo(cod_produto, video){
    // var cod_video = video.split('/')[3];
    if (video.indexOf("/") != -1) {
        var split = video.split('/').filter(function (i) {
            return i;
        });
        cod_video = split[split.length-1];
    }

    var container = $('<div>').addClass('cont-iframe-player-video');
    var content = $('<div>');
    content.attr({
        'id': 'youtubePlayer_'+cod_produto,
        'data-codvideo': cod_video,
        'data-origem': 'videoProdutoIndex',
    });
    
    setTimeout(function(){
        container.on('mouseout', function(){
            $(this).fadeOut('fast', function(){
                $(this).remove();
            })
        });
    },2000);

    container.append(content);

    return container;
}


function alwaysCarregaProdutoOuCatalogo(data){
    var resp = JSON.parse(data);
    // console.log(resp.colecoesprevenda)
}


