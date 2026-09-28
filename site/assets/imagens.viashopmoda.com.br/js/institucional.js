$(function(){
    btnMenuInstitucional();

    //fazer scrol do resumo caminhar com a scroll
    $(window).scroll(function() {
        var posicaoTelaAtual = $(window).scrollTop();
        var posicaoMenu = $(".menu-institucional").offset().top;
        var alturaMenu = $(".menu-institucional>div").height();
        var qtdItens = $(".menu-institucional li").length;
        
        //menu seguir scroll
        if ((posicaoTelaAtual+80) >= posicaoMenu) {
            var novo_top_menu = posicaoTelaAtual-posicaoMenu+80;

            if (novo_top_menu + $(".menu-institucional>div").outerHeight() < $(".institucional").outerHeight()){
                $(".menu-institucional > div").css("top", novo_top_menu+"px");
            }
            
        } else {
            $(".menu-institucional > div").css("position", "").css("top", "")
        }

        //verificar qual proxima materia
        var todasMaterias = $(".div-materia");
        var materiaEmDestaque;
        $.each(todasMaterias, function(){
            var materia = $(this).attr("id");
            var posi_ini = $(this).offset().top - 210;
            var posi_final = posi_ini + $(this).height() + 50;
            if (posicaoTelaAtual > posi_ini && posicaoTelaAtual < posi_final) {
                // window.history.pushState("", "", "/institucional?"+materia.split("_")[1]);
                $("#menu_"+materia.split("_")[1]).addClass("emevidencia");
            } else {
                $("#menu_"+materia.split("_")[1]).removeClass("emevidencia");
            }
        });
    });

    //setTimeout(function(){
        var somaAltura;
        if (verificaTipoResolucaoPagina().tipoTela == "mobile") {
            somaAltura = 0;
        } else {
            somaAltura = 80;
        }
        $('html, body').animate({ scrollTop: (getPosicaoMateriaSel()-somaAltura)+'px'}, 1000); //rola pagina ate a proxima sessao
    //}, 1000);
    //setTimeout(function(){
    //}, 1000);

});

function getPosicaoMateriaSel(){
    var getSelUrl = getUrlByGetPosInterrogacao();
    if (getSelUrl != false) {
        return $("#"+getSelUrl).offset().top;
    }
}

function btnMenuInstitucional(){
    var elems = $(".menu-institucional li");
    elems.click(function(){
        var posicaoMateria = parseFloat($("#"+$(this).attr("data-id")).offset().top);
        $('html, body').animate({ scrollTop: (posicaoMateria-100)+'px'}, 1000); //rola pagina ate a proxima sessao
    });
}
