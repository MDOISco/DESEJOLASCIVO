
var verifCarregamentoBannerSecundarios=false
// {"peq":[{"src":"bannerSecundarioPequeno1.jpg","link":"","type":"imagem"},{"src":"bannerSecundarioPequeno2.jpg","link":"","type":"imagem"}],"med":[{"src":"bannerSecundarioMedio.jpg","link":"","type":"imagem"}],"gra":[{"src":"bannerSecundarioGrande.jpg","link":"","type":"imagem"}]}

$(function(){

    carregaBannerSecundario();

});

function carregaBannerSecundario(url) {
    verifCarregamentoBannerSecundarios=true;
    $.get("json/?token=VmpGamVGSXlVbGhUYmxKWFltMTRjVlJYZUdGalZuQkhXWHBHYUUxWGVGcFZNalZEWVZkU05rMUVhejA9", function(data){
        montaBannerSecundario(JSON.parse(data));
    }).fail(function(){
        exeAjaxRequest("fail", {});
    }).always(function(){
        exeAjaxRequest("always", {});
    });
}

function montaBannerSecundario(json){
    var tela = verificaTipoResolucaoPagina();

    var diretorio = json.bannerSecundario.conteudo[0].diretorio;
    var banners = json.bannerSecundario.conteudo[0].bannerSecundario;

    if (tela.tipoTela == "mobile") {

        var container = $("section.banners-index-mobile");
        var ul = $("<ul>");
        $.each(banners.peq, function(index, value){
            var li = $("<li>");
            var a = $("<a>");
            var img = $("<img>");
            var link = value.link;           
            if (link == ""){
                link = "/cadastro";
            }
            a.attr({
                target: verifTargetDeLink(link),
                href: link    
            })
            img.attr("src", value.src);
            ul.append(li.append(a.append(img)));
        });
        container.append(ul);

    } else {

        var container = $("section.banners-index");
        var sectionBannersIndex = container.find(".elemento-responsivo");
    
        if (verifica_PequenosEMedio(banners) == 3) {
            sectionBannersIndex.append(monstaElementosBannerSecundario("med", diretorio, banners.med));
            sectionBannersIndex.append(monstaElementosBannerSecundario("peq", diretorio, banners.peq));
        }
        if (banners.gra[0] != undefined) {
            sectionBannersIndex.append(monstaElementosBannerSecundario("gra", diretorio, banners.gra));
        }
    }

}
function verifica_PequenosEMedio(obj) {
    var peq1 = obj.peq[0];
    var peq2 = obj.peq[1];
    var med = obj.med[0];
    var gra = obj.gra[0];

    var conta = 0;
    var verif_banners = [peq1, peq2, med]

    $.each(verif_banners, function(index, value){
        if (value != undefined) {
            conta++;
        }
    });
    return conta;
}
function monstaElementosBannerSecundario(banner, diretorio, obj){
    var li = $("<li>").addClass("ban-"+banner);
    $.each(obj, function(index, value){
        var img = $("<img>").attr("src", value.src);
        var link = value.link;
        if (link == "") {
            link = "/cadastro";
        }
        var aLink = $("<a>").attr({
            target: verifTargetDeLink(link),
            href: link
        });
        li.append(aLink);
        aLink.append(img);
    });
    return li;
}
