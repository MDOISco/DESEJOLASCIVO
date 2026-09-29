function montaSectionPrecoProduto(objSectionPrecos){

    var section = $('<section>').addClass('notranslate container-section-preco '+objSectionPrecos.pagina);
    var ul = $('<ul>');

    $.each(objSectionPrecos.section, function(ind, val){
        var li = $('<li>').addClass('cont-tipo '+ind);

        $.each(val, function(ind_tipo, val_tipo){
            var contTipo = $('<div>').addClass('cont-infos '+ind_tipo);

            $.each(val_tipo, function(ind_infos, val_infos){
                var contInfos = $('<div>').addClass('infos '+ind_infos);
                contInfos.html(val_infos);
                contTipo.append(contInfos);
            });

            li.append(contTipo);
        });
    
        ul.append(li);
    });

    section.append(ul);

    return section;


}