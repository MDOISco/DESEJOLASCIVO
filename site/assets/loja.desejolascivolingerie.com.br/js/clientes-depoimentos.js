function getClienteDepoimentos(elemAppend, callbackInitSlick){

    requestApiLoja_GET({acao:"consultarDepoimentos"}, function(data){
        
        var response = JSON.parse(data);

        if (response.depoimentos.length == 0) {
            elemAppend.html("");
            return;
        }

        var contTitulo = $('<div>').addClass('cont-tit').text(global_traducao.titulo_depoimentos_index);
        var ulDepoimentos = $('<ul>').addClass('ul-depoimentos');

        $.each(response.depoimentos, function(ind, val){
            var li = montaContLiDepoimento(ind, val);
            ulDepoimentos.append(li);
        });
        
        elemAppend.append(contTitulo).append(ulDepoimentos);

        if (typeof callbackInitSlick == "function") {
            callbackInitSlick(ulDepoimentos);
        }

    });

}

function montaContainerDepoimentosIndex(){

    var containerDepoimentos = $('section.container-depoimentos');
    if (containerDepoimentos.length == 0) {

        var container = $('<section>').addClass('container-depoimentos');
        $('section.container-produtos').after(container);

    } else {
        return;
    }

    getClienteDepoimentos(elemAppend);

}

function montaContLiDepoimento(ind, val){

    var li = $('<li>').addClass('li-depoimento');
    var contLi = $('<div>');

    var contIcone = $('<div>').addClass('cont-icone csscustom-color-menu').html('<i class="fas fa-heart"></i>');
    var linha1 = $('<div>').addClass('linha1');
    var linha2 = $('<div>').addClass('linha2');
    var linha3 = $('<div>').addClass('linha3');

    var htmlInfos = '<div class="nome notranslate">'+val.nome_completo+'</div>';
    htmlInfos += '<div class="localidade notranslate">'+val.localidade+'</div>';

    var contDepoimento = $('<div>').addClass('cont-depoimento').html('<p>'+val.depoimento+'</p>');
    var contFoto = $('<div>').addClass('cont-foto').html('<img src="'+val.src_foto+'">');
    var contInfos = $('<div>').addClass('cont-infos').html(htmlInfos);

    linha1.append(contFoto);
    linha2.append(contDepoimento);
    linha3.append(contInfos);

    li.append(contLi);
    contLi.append(contIcone).append(linha1).append(linha2).append(linha3)

    return li;

}