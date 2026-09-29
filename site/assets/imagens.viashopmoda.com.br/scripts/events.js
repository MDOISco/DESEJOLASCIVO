/*
    Funções de configs
*/
var plataforma, obj_pixel, obj_loja, session_id, caller="loja", debug=false;

debug = (location.host.indexOf('desenvolvimento') != -1)?true:debug;


plataforma = "viashopmoda"
if (location.hostname.indexOf('shopcouture') != -1){
    plataforma = "shopcouture";
}

function getPixelsViaShop(){
    var ret = {
        facebookpixel: {
            _tk: "1722873644620666"
        },
        googleanalytics: {
            // _tk: "UA-104064209-1",
            _tk: "G-TH72QXR80Z"
        }
    };

    // se for parceiros invocando os eventos, precisamos deixar SOMENTE o googleanalytcs para as variaveis do via
    if (caller == "parceiros"){
        delete ret.facebookpixel;
    }

    if (plataforma == 'shopcouture'){
        ret.googleanalytics._tk = "G-R7ZSDYJ7Z5";
    }

    return ret;
}

function initPixel(cliente, loja, integracoes, _session_id){
    if (initPixel.caller.name == "initPixelsParceiros") {
        caller = "parceiros";
    }

    obj_loja = loja;
    session_id = _session_id;
    obj_pixel = montaObjPixel(cliente, loja, integracoes);
    
    // console.log("------------")
    // console.log(obj_pixel)
    // console.log("------------");


    $.each(obj_pixel.executar, function (ind, val){
        scriptPixels(val);
    });

    // Após criar os scripts das integrações, executa um evento de acesso (PageView)
    setTimeout(() => {
        sendPixel('acesso');
    }, 1000);

}

function scriptPixels(integracao){
    if (debug){console.log("init "+integracao)}

    var loja = obj_pixel.loja[integracao];
    var viashop = null;
    if (obj_pixel.viashop != null){
        viashop = obj_pixel.viashop[integracao]
    }
    switch (integracao) {
        case 'facebookpixel':
            if (loja == undefined){
                return;
            }

            /**
             * So será executado o fbq browser se cliente NÃO estiver logado e não tiver o facebook api (_lg==undefined)
             */
            if (obj_pixel.cliente == null || loja._lg == undefined){
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
                // {external_id: UNIQUE_USER_ID}
                // console.log(session_id)
                fbq('init', loja._tk, {external_id: session_id});
            }
            break;

        case 'googleanalytics':
            // if (loja != null) {
            //     var tag = $('script');
            //     $(tag[0]).after($('<script>').prop({
            //         async: true,
            //     }).attr({
            //         src: "https://www.googletagmanager.com/gtag/js?id="+loja._tk
            //     }));

            // }

            // if (viashop != null) {
            //     var tag = $('script');
            //     $(tag[0]).after($('<script>').prop({
            //         async: true,
            //     }).attr({
            //         src: "https://www.googletagmanager.com/gtag/js?id="+viashop._tk
            //     }));
            // }

            if (loja == null) {
                var cod_gtag = viashop._tk;
            } else {
                var cod_gtag = loja._tk;
            }

            // console.log("init script gtag: "+cod_gtag)
            // Criando Script gtag
            var tag = $('script');
            $(tag[0]).after($('<script>').prop({
                async: true,
            }).attr({
                src: "https://www.googletagmanager.com/gtag/js?id="+cod_gtag,
            }));

            !function(w,a){
                if(w.gtag)return;
                window.dataLayer = window.dataLayer || [];
                a=w.gtag=function(){
                    dataLayer.push(arguments);
                };
            }(window);
            gtag('js', new Date());


            if (loja != null) {  
                // console.log("config gtag: "+loja._tk)          
                gtag('config', loja._tk);
            }

            // criando o config do via, se existir
            if (viashop != null) {  
                // console.log("config gtag: "+viashop._tk)               
                gtag('config', viashop._tk);
            }


            // Verificando o googleadwords
            if (obj_pixel.loja.googleadwords != undefined) {
                // console.log(obj_pixel.loja.googleadwords._tk)
                gtag('config', obj_pixel.loja.googleadwords._tk);
            }
            // console.log("gtag iniciado: ", (typeof gtag == "function")?"true":"false");
            break;

        case 'googletagmanager':
            var cod_gtm = obj_pixel.loja.googletagmanager._tk;
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer', cod_gtm);

            if (loja != null) {
                var noscript = $('<noscript>').append($('<iframe>').attr({
                    'src':'https://www.googletagmanager.com/ns.html?id='+cod_gtm,
                    'height':'0', 'width':'0', 'style': 'display:none;visibility:hidden'
                }));
                $('body').prepend(noscript);
            }

            break;

        case 'tiktokpixel':
            !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                ttq.load(obj_pixel.loja.tiktokpixel._tk);
                ttq.page();
            }(window, document, 'ttq');
            
            break;
    
    }
}

/**************************************************************************/
/*
    Funções de Eventos
*/
/**
 * 
 * @param String evento Nome do evento ex: 'acesso'
 * @param Object params Os parametros específicos de cada evento
 * @returns null Executa o evento na integração desejada
 */
function sendPixel(evento, params=false) {
    if (debug){console.log(obj_pixel, evento, params);}
    var obj_exe=[];

    if (typeof fbq == "function") {
        sendPixel_FacebookPixel(evento, params);
        obj_exe.push('fbq');
    }

    if (typeof gtag == "function") {
        sendPixel_GoogleAnalytics(evento, params);
        obj_exe.push('gtag');
    }

    if (typeof ttq == "object") {
        sendPixel_TikTok(evento, params);
        obj_exe.push('ttq');
    }

    if (debug){console.log(obj_exe);}

}
function sendPixel_FacebookPixel(evento, params){
    if (debug){console.log("facebook", "evento:", evento, "params:", params);}

    /**
     * Variavel token define se a loja possui integração com o facebook api
     * E em alguns eventos iremos executar somente pela api
     */
    if (obj_pixel.loja.facebookpixel == undefined) {
        return;
    }
    var token = obj_pixel.loja.facebookpixel._lg;

    switch (evento) {
        case 'acesso':
            fbq('track', 'PageView');
            break;

        case 'busca':
            fbq('track', 'Search', {search_string: params.busca});
            break;

        case 'cadastro':
            if (token == undefined){
                fbq('track', 'Lead');
            }
            break;

        case 'lead':
            if (token == undefined){
                fbq('track', 'Contact');
            }
            break;

        case 'produto':
            fbq('track', 'ViewContent');
            break;

        case 'sacola':
            fbq('track', 'AddToCart');
            break;

        case 'checkout':
            fbq('track', 'InitiateCheckout');
            break;

        case 'login':
            if (token == undefined){
                fbq('track', 'CompleteRegistration', {
                    currency:'BRL',
                    value:1
                });
            }
            break;

        case 'pagamento':
            fbq('track', 'AddPaymentInfo');
            break;

        case 'pedido':
            if (token == undefined){
                fbq('track', 'Purchase', {
                    value: params.total,
                    currency: moedaToCode(params.moeda),
                });
            }
            break;
        
        default:
            // console.log("facebookpixel -> '"+evento+"' -> not set");
            break;
    }
}
function sendPixel_GoogleAnalytics(evento, params){
    if (debug){console.log("google analytics:", evento, "params:", params);}

    var arr_sendTo=[];
    // console.log(obj_pixel.loja.googleanalytics)
    if (obj_pixel.loja != null) {
        if (obj_pixel.loja.googleanalytics != undefined) {
            arr_sendTo.push(obj_pixel.loja.googleanalytics._tk);
        }
    }
    if (obj_pixel.viashop != null) {
        if (obj_pixel.viashop.googleanalytics != undefined) {
            arr_sendTo.push(obj_pixel.viashop.googleanalytics._tk);
        }
    }
    // preparando string send_to
    var send_to="";
    $.each(arr_sendTo, function(ind, val){
        send_to = send_to+val+",";
    });
    send_to = send_to.substring(0, send_to.length-1);
    // console.log(send_to);

    // var send_to="";
    // console.log(evento);
    // console.log(send_to);

    switch (evento) {
        case 'acesso':
        break;

        case 'busca':
            gtag('event', 'search', {
                event_label: 'Pesquisar',
                send_to: send_to,
                search_term: params.busca
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;

        case 'cadastro':
            gtag('event', 'sign_up', {
                event_label: 'Cadastro',
                send_to: send_to,
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;

        case 'lead':
            gtag('event', 'generate_lead', {
                event_label: 'Entrar em contato',
                send_to: send_to,
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;

        case 'produto':
            var produto = params.produto;

            gtag('event', 'view_item', {
                event_label: 'Ver conteúdo',
                send_to: send_to,
                currency: moedaToCode(produto.moeda),
                items:[googleObjItem(
                    produto.codigo,
                    produto.referencia,
                    produto.descricao,
                    produto.menu.conteudo[0].categoriaDesc,
                    produto.preco,
                    produto.menu.conteudo[0].colecaoDesc,
                    produto.ordem,
                    1,
                    "",
                    ""
                )]
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;
        
        case 'sacola':
            // console.log(params);

            var produtos = params.produtos;
            var arr_items = [];
            $.each(produtos, function(ind, val){
                arr_items.push(googleObjItem(
                    val.Ped_ID,
                    val.Prod_CodRef,
                    val.Prod_Desc,
                    val.Pes_Produto,
                    val.Ped_Preco,
                    val.Col_Desc,
                    val.Prod_Ordem,
                    val.Ped_Qtde,
                    val.EstFot_Desc,
                    val.Grd_Desc
                ))
            });
            // console.log({
            //     event_label: 'Adição ao carrinho',
            //     send_to: send_to,
            //     currency: moedaToCode(params.moeda),
            //     items: arr_items,
            // });
            gtag('event', 'add_to_cart', {
                event_label: 'Adição ao carrinho',
                send_to: send_to,
                currency: moedaToCode(params.moeda),
                items: arr_items,
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;
        
        case 'checkout':
            var produtos = params.produtos;
            var arr_items = [];
            $.each(produtos, function(ind, val){
                arr_items.push(googleObjItem(
                    val.codigo,
                    val.referencia,
                    val.descricao,
                    val.tipoproduto,
                    val.preco,
                    val.colecao,
                    val.ordem,
                    val.quantidade,
                    val.estampas.conteudo[0].descricao,
                    val.grade
                ))
            });

            gtag('event', 'begin_checkout', {
                event_label: 'Início da finalização da compra',
                send_to: send_to,
                items: arr_items,
                checkout_step: 1
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;
        
        case 'checkout-etapas':
            // console.log(params);
            if (params.etapa == 2) {
                var rotulo = 'Identificação';
            } else if (params.etapa == 3) {
                var rotulo = 'Endereço de entrega';
            } else if (params.etapa == 4) {
                var rotulo = 'Forma de envio';
            }
            var obj_event = {
                event_label: rotulo,
                send_to: send_to,
                checkout_step: params.etapa,
            };

            // somente se tiver o obj pedido
            if (params.pedido != undefined) {
                obj_event.items=[];
                $.each(params.pedido.produtos, function(ind, val){
                    obj_event.items.push(googleObjItem(
                        val.codigo,
                        val.referencia,
                        val.descricao,
                        val.tipoproduto,
                        val.preco,
                        val.colecao,
                        val.ordem,
                        val.quantidade,
                        val.estampas.conteudo[0].descricao,
                        val.grade
                    ))
                });
            }
            gtag('event', 'checkout_progress', obj_event);

            // Verifica se o evento disparado possui alguma selecao.
            // Se sim, dispara outro evento para o google
            if (params.selecao != undefined) {
                gtag('event', 'set_checkout_option', {
                    event_label: rotulo,
                    checkout_step: params.etapa,
                    checkout_option: params.selecao,
                    value: params.valor,
                    send_to: send_to,
                });
            }

            break;
        
        case 'login':
            gtag('event', 'login', {
                event_label: 'Registro concluído',
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;
    
        case 'pagamento':
            gtag('event', 'add_payment_info', {
                event_label: 'Adição de informações de pagamento',
                send_to: send_to,
            });

            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords);

            break;

        case 'pedido':
            // console.log(params);
            params.limite_produtos=1000;

            var limite_produtos = (params.limite_produtos==undefined) ? params.produtos.length : params.limite_produtos;
            var obj_pedido = {
                event_label: 'Compra',
                send_to: send_to,
                transaction_id: params.codigopedido+" "+params.origem_pedido.toLowerCase(),
                // affiliation: params.nomeloja,
                value: parseFloat(params.total),
                shipping: params.valordofrete,
                currency: moedaToCode(params.moeda),
                items:[]
            };
            var obj_totais={
                qtd:0,
                valor:0,
                valor_limite:0,
                qtd_limite:0,
            };
            $.each(params.produtos, function(ind, val){
                var item_total = parseFloat(parseInt(val.quantidade) * parseFloat(val.preco));

                obj_pedido.items.push(googleObjItem(
                    val.Ped_ID,
                    val.Prod_CodRef,
                    val.Prod_Desc,
                    val.Pes_Produto,
                    val.Ped_Preco,
                    val.Col_Desc,
                    val.Prod_Ordem,
                    val.Ped_Qtde,
                    val.EstFot_Desc,
                    val.Grd_Desc
                ));
                
                obj_totais.valor = obj_totais.valor + item_total;
                obj_totais.qtd = parseInt(obj_totais.qtd + parseInt(val.quantidade));

                if ((ind+1) >= limite_produtos) {
                    // console.log(ind)
                    // console.log(item_total)
                    obj_totais.valor_limite = obj_totais.valor_limite + item_total;
                    obj_totais.qtd_limite = parseInt(obj_totais.qtd_limite + parseInt(val.quantidade));
                }
            });

            // console.log(obj_totais);
            
            if (obj_pedido.items.length > limite_produtos) {
                var total_anterior = obj_pedido.items.length - limite_produtos;
                obj_pedido.items.splice((limite_produtos-1), obj_pedido.items.length);
                obj_pedido.items[(limite_produtos-1)] = googleObjItem(
                    '0',
                    '',
                    'outras pecas de vestuario',
                    'peças',
                    (obj_totais.valor_limite / obj_totais.qtd_limite),
                    'variadas',
                    0,
                    obj_totais.qtd_limite,
                    'variadas',
                    ''
                );
            }
            // console.log(obj_pedido);

            $.each(obj_pedido.items, function(ind, val){
                obj_pedido.items[ind].item_category5 = params.codigopedido+" "+params.origem_pedido.toLowerCase();
            });

            gtag('event', 'purchase', obj_pedido);
           
            exeGoogleAdWordsNoGtag(evento, obj_pixel.loja.googleadwords, {
                value: parseFloat(params.total),
                currency: moedaToCode(params.moeda),
                transaction_id: params.codigopedido
            });
            
            break;
        
        case 'cancelar-pedido':
            gtag('event', 'refund', {
                event_label: 'Pedido cancelado',
                send_to: send_to,
                transaction_id: params.codigopedido+" "+params.origem_pedido.toLowerCase(),
            })
            break;
        default:
            // console.log("googleanalytics -> '"+evento+"' -> not set");
            break;
    }
}
function sendPixel_TikTok(evento, params){
    if (debug){console.log("tiktok", "evento:", evento, "params:", params);}
    // var token = obj_pixel.loja.tiktokpixel._tk;

    switch (evento) {
        case 'acesso':
            ttq.track('Browse');
            // ttq.page();
            break;

        case 'busca':
            // console.log(params)
            ttq.track('Search', {
                query: params.busca
            });
            break;

        case 'cadastro':
            ttq.track('Subscribe');
            break;

        case 'lead':
            ttq.track('Contact');
            break;

        case 'produto':
            var produto = params.produto;

            ttq.track('ViewContent', tiktokObjItem(
                produto.codigo,
                produto.referencia,
                produto.descricao,
                produto.menu.conteudo[0].categoriaDesc,
                produto.preco,
                produto.menu.conteudo[0].colecaoDesc,
                produto.ordem,
                1,
                "",
                "",
                moedaToCode(produto.moeda)
            ));
            break;

        case 'sacola':
            ttq.track('AddToCart');
            break;

        case 'checkout':
            var produtos = params.produtos;
            var arr_items = [];
            var valor_total = 0;
            $.each(produtos, function(ind, val){
                valor_total = (val.preco * val.quantidade) + valor_total;
                arr_items.push(tiktokObjItem(
                    val.codigo,
                    val.referencia,
                    val.descricao,
                    val.tipoproduto,
                    val.preco,
                    val.colecao,
                    val.ordem,
                    val.quantidade,
                    val.estampas.conteudo[0].descricao,
                    val.grade
                ))
            });
            ttq.track('InitiateCheckout', {
                contents: arr_items,
                value: valor_total,
                currency: 'BRL',
            });
            break;

        case 'login':
            ttq.track('CompleteRegistration');
            break;

        case 'pagamento':
            ttq.track('AddPaymentInfo');
            break;

        case 'pedido':
            var produtos = params.produtos;
            var arr_items = [];
            var valor_total = 0;
            $.each(produtos, function(ind, val){
                valor_total = (val.preco * val.quantidade) + valor_total;
                arr_items.push(tiktokObjItem(
                    val.Ped_ID,
                    val.Prod_CodRef,
                    val.Prod_Desc,
                    val.Pes_Produto,
                    val.Ped_Preco,
                    val.Col_Desc,
                    val.Prod_Ordem,
                    val.Ped_Qtde,
                    val.EstFot_Desc,
                    val.Grd_Desc,
                    moedaToCode(val.moeda)
                ))
            });
            ttq.track('PlaceAnOrder', {
                contents: arr_items,
                value: valor_total,
                currency: 'BRL',
            });
            break;
        
        default:
            // console.log("facebookpixel -> '"+evento+"' -> not set");
            break;
    }
}


function exeGoogleAdWordsNoGtag(event, obj_googleadwords, params={}){
    // console.log(event)
    // console.log(obj_googleadwords)
    if (obj_googleadwords == undefined) {return;}
    if (obj_googleadwords._sc == undefined) {return;}
    if (obj_googleadwords._sc[event] == "" || obj_googleadwords._sc[event] == undefined) {return;}

    params['send_to'] = obj_googleadwords._tk+'/'+obj_googleadwords._sc[event];
    // console.log(params);

    gtag('event', 'conversion', params);
    // console.log(event)
    // console.log(obj_googleadwords)

}

/*
    Demais Funções
*/

function montaObjPixel(cliente, loja, integracoes){
    var obj_pixel={};

    obj_pixel.viashop = verifPixelViaShop(integracoes);
    
    if (integracoes != null) {
        obj_pixel.loja = integracoes;
        delete obj_pixel.loja.viashoppixel;
    }

    obj_pixel.executar = verificaPixelsParaExecutar(obj_pixel);
    obj_pixel.cliente = cliente;
    return obj_pixel;
}

function verificaPixelsParaExecutar(init){
    var data=[];
    $.each(init, function(ind, val){
        if (val!=null){
            $.each(val, function(ind_, val_){
                data.push(ind_);
            });
        }
    });
    // remove os itens repetidos do array
    var filter = data.filter(function(este, i) {
        return data.indexOf(este) === i;
    });
    return filter;
}
function verifPixelViaShop(integracoes){
    // console.log(integracoes)
    var ret=null;
    if (integracoes != null) {
        if (integracoes.viashoppixel == undefined){
            ret = getPixelsViaShop();
        } else {
            if (integracoes.viashoppixel._tk == "Sim"){
                ret = getPixelsViaShop();
            }
        }
    }
    return ret;
}
function formataIdProduto(id_produto){
    // add 5 zeros a esquerda no ID da loja + 6 zeros ao ID do produto
    id_loja = obj_loja.cod.padStart(5, '0');
    if (typeof id_produto != "string") {
        id_produto = id_produto.toString();
    }
    return id_loja+id_produto.padStart(5, '0');
}

function googleObjItem(id, cod_ref, descricao, categoria, preco, colecao, ordem, quantidade=1, nome_estampa="", nome_grade=""){
    var nome_estampa = (nome_estampa==null)?"":nome_estampa;
    var nome_grade = (nome_grade==null)?"":nome_grade;

    var id = formataIdProduto(id);
    var categoria = categoria.toLowerCase();
    var preco = parseFloat(preco);
    var colecao = colecao.toLowerCase();
    var nome_loja = obj_loja.nome.toLowerCase();
    var quantidade = parseInt(quantidade);
    var ordem = parseInt(ordem);
    var monta_name = descricao.toLowerCase();

    //monta_name
    if (cod_ref != "") {
        monta_name = cod_ref.toLowerCase()+" "+monta_name;
    }

    // var obj = {
    //     id: id,
    //     name: monta_name.substring(0,100),
    //     brand: nome_loja.substring(0,100),
    //     category: categoria.substring(0,50),
    //     price: parseFloat(preco).toFixed(2),
    //     quantity: parseInt(quantidade),
    //     currency: moeda,
    //     list_name: colecao.substring(0,50),
    //     list_position: ordem,
    // };
    
    var obj = {
        item_id: id,
        item_name: monta_name.substring(0,100),
        item_brand: nome_loja.substring(0,100),
        item_category: categoria.substring(0,50),
        item_category2: colecao.substring(0,50),
        item_category3: nome_estampa.substring(0,50),
        item_category4: nome_grade.substring(0,50),
        price: parseFloat(preco).toFixed(2),
        quantity: parseInt(quantidade),
        item_variant: nome_estampa.substring(0,50),
        size: nome_grade.substring(0,50),
        index: ordem,
    };

    // if (nome_estampa != "" && nome_estampa != null) {
    //     obj.variant = nome_estampa.toLowerCase().substring(0,25);
    //     if (nome_grade != "") {
    //         obj.variant = obj.variant+" "+nome_grade.toLowerCase().substring(0,25);
    //     }
    // }
    return obj;
}

function tiktokObjItem(id, cod_ref, descricao, categoria, preco, colecao, ordem, quantidade=1, nome_estampa="", nome_grade="", moeda="BRL"){
    var obj = {
        content_type: "product",
        content_id: cod_ref,
        content_category: categoria,
        content_name: descricao,
        quantity: quantidade,
        price: preco,
        currency: moedaToCode(moeda),
    }
    return obj;
}

function initPixelsParceiros(){
    var resp = {}, cliente=null, integracoes=null, loja=null, session_id=null;

    // cliente
    cliente = null;

    // integracoes
    if ($("#cli_pixelanalytics").val() != undefined) {
        integracoes={};
        integracoes.googleanalytics = {
            nome_integracao: "Google Analytics",
            _tk: $("#cli_pixelanalytics").val(),
        }
    }
    // pixel via shop
    if ($("#cli_pixelviashop").val() != undefined) {
        integracoes = (integracoes==null) ? {} : integracoes;
        integracoes.viashoppixel = {
            nome_integracao: "ViaShop Pixel",
            _tk: $("#cli_pixelviashop").val(),
        }
    }

    //loja
    if ($("#Loj_Nome").val() != undefined && $("#via_ID").val() != undefined) {
        loja={};
        loja.nome = $("#Loj_Nome").val();
        loja.cod = $("#via_ID").val();
    }

    //session
    if ($("#session_id").val() != undefined) {
        session_id = $("#session_id").val();
    }

    resp = {
        cliente: cliente,
        integracoes: integracoes,
        loja: loja,
        session_id: session_id,
    }

    // console.log(resp)

    // inicia o processo dos pixels através do ../scripts/events.js (mesmo arquivo usado nas lojas)
    initPixel(resp.cliente, resp.loja, resp.integracoes, resp.session_id);

}
function moedaToCode(moeda){
    return moeda;
    // var ret = 'BRL';
    // switch (moeda) {
    //     case '$':
    //         ret = 'USD';
    //         break;
    // }
    // return ret;
}
