const global_estoque=[];
const global_produtosSelecionados=[];
var global_bodyScrollY = window.scrollY;

function montaTabelaEstoque(containerEstoque, produto, supervitrine, sacola, callbackSuccess, callbackFail){

    // if (typeof supervitrine == 'object') {
    //     $.each(supervitrine, function(indSuper, valSuper){
    //         $.each(valSuper.grades.conteudo, function(indGrade, valGrade){
    //             console.log(valGrade)
    //             if (array_column(produto.grades.conteudo, 'codigo').indexOf(valGrade.codigo) != -1){
    //                 return;
    //             }
    //             produto.grades.conteudo.push({
    //                 codigo: valGrade.codigo,
    //                 descricao: valGrade.descricao,
    //                 isKit: valGrade.isKit,
    //                 textoPrincipal: valGrade.textoPrincipal,
    //             });
    //         });
    //     });
    // }
    // console.log(produto)

    containerEstoque.addClass('notranslate');

    var tela = verificaTipoResolucaoPagina();
    var contTabelas = containerEstoque.find('.cont-tabelas');

    importarArquivos(modulosParaImportar('requests'));


    /**
     * Tratar o produto e não retornar a tabela de estoque
     */
    if (parseFloat(produto.preco) <= 0) {
        contTabelas.html('<p style="margin: 3em 0;font-size:1em;">'+global_traducao.tabela_estoque.produto_indisponivel+'</p>');
        if (typeof callbackFail == "function") {
            callbackFail(contTabelas);
        }
        return;
    }

    var opcaoMenuDefault = ($.inArray(produto.menuAcaoTabelaEstoque, ["+","-","="]) == -1) ? "+" : produto.menuAcaoTabelaEstoque;
    // Iniciando criação das tabelas
    var tabelaGrades = $('<table>').addClass('tabela-estoque grades').attr({
        "data-idproduto": produto.codigo,
        "data-idpreco": produto.preco,
        "data-adicionar-remover-default": opcaoMenuDefault,
        "data-adicionar-remover": opcaoMenuDefault
    });
    var contentTabelaEstampas = $('<div>').addClass('cont-tabela-estampas');
    var contentTabelaGrades = $('<div>').addClass('cont-tabela-grades cont-scroll-grades');

    //grades
    var thead = $("<thead>");
    var theadTr = $("<tr>");
    var theadTh = $("<th>");
    var theadDiv = $("<div>");
    var tbody = $("<tbody>").addClass('tbody');
    tabelaGrades.append(thead);
    thead.append(theadTr);
    theadTr.append(theadTh);
    theadTh.append(theadDiv);
    $.each(produto.grades.conteudo, function (index, value){
        // console.log(value);
        var divTdGrade = $("<div>").html(value.descricao);
        var theadTd = $("<td>").addClass('notranslate').attr("data-idgrade", value.codigo);
        theadTd.append(divTdGrade);
        theadTr.append(theadTd);
        
        if (value.isKit == 'S') {
            var spanGradeDetalhes = $('<span>').addClass('grade-detalhes').html(value.textoPrincipal);
            divTdGrade.append(spanGradeDetalhes);
            theadTd.addClass('grade-kit')
        }

    });

    //estampas
    tabelaGrades.append(tbody);
    $.each(produto.estampas.conteudo, function (in_es, val_es){
        var tbodyTr = $("<tr>").attr("data-idestampa", val_es.codigo);
        var verifCorestampa = verificaRetornoCssEstampaCor(val_es.textoPrincipal);
        var tbodyDivEstampa = $("<div>").attr({
            'data-idestampa': val_es.codigo,
            'data-descricaoestampa': val_es.descricao,
        }).addClass('estampa-foto').css(verifCorestampa.attr, verifCorestampa.cont);
        var tbodyTh = $("<th>").append(tbodyDivEstampa).append($("<div>").addClass('estampa-nome notranslate').text(val_es.descricao));
        tbody.append(tbodyTr);
        tbodyTr.append(tbodyTh);
        $.each(produto.grades.conteudo, function(in_gr, val_gr){
            var tbodyTd = $("<td>").attr({
                "data-idproduto": val_es.idproduto,
                "data-idgrade": val_gr.codigo,
                "data-idestampa": val_es.codigo
            }).addClass('sem-estoque');
            var tbodyInput = $("<input>").attr("type", "tel").attr("pattern", "[0-9]*").attr("data-mascara", "somenteNumeros").attr("maxlength", "3");
            tbodyInput.prop('readonly', true).attr('placeholder', '0');
            tbodyTd.append(tbodyInput);
            tbodyTr.append(tbodyTd);
        });
    });


    var tabelaEstampas = cloneThEstampasTabelaEstoque(tabelaGrades);
    tabelaGrades.find('thead th').remove();
    tabelaGrades.find('tbody th').remove();

    contentTabelaEstampas.append(tabelaEstampas)
    contentTabelaGrades.append(tabelaGrades);

    contTabelas.append(contentTabelaEstampas);
    contTabelas.append(contentTabelaGrades);

    // Fim da montagem da tabela de estoque
  
    // produto sem preço
    if (produto.preco == undefined) {

        montaContBloqEstoque(containerEstoque);
        tabelaGrades.find('tbody td[class!="sem-estoque"]').off('click');

    } else {

        // le os produtos e altera as configs na tabela estoque
        $.each(produto.estoque.conteudo, function(ind, val){
            var idProduto = val.idproduto;
            var idGrade = val.codigodagrade;
            var idEstampa = val.codigodaestampa;
            var tdNaTabela = tabelaGrades.find('td[data-idproduto="'+idProduto+'"][data-idgrade="'+idGrade+'"][data-idestampa="'+idEstampa+'"]');
            global_bodyScrollY = window.scrollY;

            tdNaTabela.attr('data-estoque', val.estoque);
            tdNaTabela.attr('data-precodiferenciado', val.precodiferenciado);
            tdNaTabela.attr('data-precodiferenciadoxt', formataValorFloatParaMonetario(global_bodyData.moeda, val.precodiferenciado));
            tdNaTabela.addClass('after-placeholder');

            if (parseFloat(val.estoque) == 0) {

                tdNaTabela.off("click").html("");

            } else {
                
                tdNaTabela.removeClass("sem-estoque");

                var preco = parseFloat(produto.preco);
                var precoDiferenciado = parseFloat(val.precodiferenciado);

                // verificar preço diferenciado
                if (precoDiferenciado > 0 && precoDiferenciado != preco) {
                    preco = precoDiferenciado;
                    tdNaTabela.append(montaContPrecoDiferenciado(produto.moeda, produto.preco, val.precodiferenciado));
                }

                switch(produto.mostrarNaTabelaEstoque){
                    default:
                        break;
                    case 'estoque':
                        tdNaTabela.addClass('mostrar-estoque');
                        break;
                    case 'preco':
                        tdNaTabela.addClass('mostrar-precodiferenciadoxt');
                        break;
                }

                processaGlobalEstoque.add(idProduto, idGrade, idEstampa, val.estoque, preco, 0);

            }

        });
    


        tabelaGrades.find('tbody td input').on('focus', function () {
            if (
                $(this).parent().parent().parent().parent().attr('data-adicionar-remover') == "+" || 
                $(this).parent().parent().parent().parent().attr('data-adicionar-remover') == "-"
            ){
                this.blur();
            }
        });

        // ação de add produto à sacola
        tabelaGrades.find('tbody td[class!="sem-estoque"]').click(function(event){
            clickAddProdutoSacola(event, $(this), containerEstoque);
        });
        tabelaGrades.find('tbody td[class!="sem-estoque"] input').on('change', function(event){
            clickAddProdutoSacola(event, $(this).parent(), containerEstoque);
        });
    
        montaElemMensagemTabelaEstoque.btnComprar(containerEstoque);

    }

    // preenche os campos com os valores da sacola atual
    $.each(sacola, function(ind, val){
        var idProduto = val.codigodoproduto;
        var idGrade = val.codigodagrade;
        var idEstampa = val.codigodaestampa;
        var tdNaTabela = tabelaGrades.find('td[data-idproduto="'+idProduto+'"][data-idgrade="'+idGrade+'"][data-idestampa="'+idEstampa+'"]');
        tdNaTabela.removeClass('after-placeholder');

        var quantidade = val.quantidade;
        if (val.quantidade == 0) {
            tdNaTabela.addClass('after-placeholder');
            quantidade = "";
        }

        tdNaTabela.find('input').val(quantidade);
    });


    montaElemMensagemTabelaEstoque.topo(containerEstoque);
    montaElemMensagemTabelaEstoque.rodape(containerEstoque);


    if (typeof callbackSuccess == "function") {
        callbackSuccess(contTabelas);
    }

}


/****************************************************************** */
/****************************************************************** */
/****************************************************************** */
/**
 * Eventos
 */
function clickAddProdutoSacola(event, tdClick, containerEstoque){
    if (tdClick.hasClass('sem-estoque')){
        return;
    }

    if ($('[data-rastreio]').length == 1){
        window.scrollTo(0, global_bodyScrollY);
    }

    var adicionarOuRemover = tdClick.parent().parent().parent().attr('data-adicionar-remover');
    var idProduto = tdClick.attr('data-idproduto');
    var idGrade = tdClick.attr('data-idgrade');
    var idEstampa = tdClick.attr('data-idestampa');
    var estoque = tdClick.attr('data-estoque');
    var input = tdClick.find('input');
    var qtdAtual = (input.val() == "") ? 0 : parseFloat(input.val());

    if (adicionarOuRemover == "+") {
        if (event.type != "click") {return;}
        var novaQtd = qtdAtual + processaStorageTabelaEstoque.getQtd();
        if (novaQtd == input.val()){return;}

    } else if (adicionarOuRemover == "-") {
        if (event.type != "click") {return;}       
        var novaQtd = qtdAtual - processaStorageTabelaEstoque.getQtd();
        if (novaQtd == input.val()){return;}

    } else if (adicionarOuRemover == "=") {
        var novaQtd = qtdAtual;
        if (event.type == "click") {return;}
    }


    if (novaQtd > parseFloat(estoque)) {
        novaQtd = parseFloat(estoque);
        var contAvisoGrade = montaContMsgAvisoTd("aviso-grade", global_traducao.tabela_estoque.adicionado_estoque_disponivel.replace("{QTD_ESTOQUE_DISPONIVEL}", estoque), 3000);
        tdClick.append(contAvisoGrade);
    }


    montaContAdicionandoProdutoSacola(containerEstoque);

    novaQtd = (novaQtd < 0 ) ? 0 : novaQtd;
    input.val((novaQtd==0)?"":novaQtd)
    
    var produtoAdd = processaGlobalEstoque.find(idProduto, idGrade, idEstampa);
    produtoAdd.quantidade = novaQtd;
    var objPost = {
        acao: $('table.tabela-estoque.grades').attr('data-adicionar-remover'),
        origem: containerEstoque.attr('class').split(' ')[1],
        data: [produtoAdd]
    };

    requestSacola(containerEstoque, objPost);

}

function requestSacola(containerEstoque, objPost){
    var objPostData = objPost.data[0];
    
    var tdNaTabela = $('.tabela-estoque.grades td[data-idproduto="'+objPostData.idProduto+'"][data-idgrade="'+objPostData.idGrade+'"][data-idestampa="'+objPostData.idEstampa+'"]');
    if (objPostData.quantidade == undefined || objPostData.quantidade == 0){
        if (tdNaTabela.parent().parent().parent().attr('data-adicionar-remover') != "=") {
            tdNaTabela.addClass('after-placeholder');
        }
    } else {
        tdNaTabela.removeClass('after-placeholder');
    }


    requestApiLoja_POST({acao:"addSacola"}, objPost, function(data){
        var objResponse = JSON.parse(data);

        if (objResponse.retorno == true){

            // retorno data
            if (typeof objResponse.data == "object") {
                $.each(objResponse.data, function(ind, val){
                    
                    // Produto Adicionado
                    if (val.produtoAdicionado != undefined) {
                        sendPixel('sacola', {
                            moeda: val.produtoAdicionado.moeda,
                            produtos: [val.produtoAdicionado]
                        });
                    }
        
                });
            }

            if (objResponse.token!=undefined && objResponse.token!=""){
                $('body').attr('data-token-api-loja', objResponse.token);
            }

        }

    }, "", function(data){

        var objResponse = JSON.parse(data.responseText);

        var qtdTotalCompradaParaProduto=0;

        abreSacolaDAO(true, objResponse.abreSacola);

        // Varrendo todos os inputs do container estoque
        $.each(containerEstoque.find('table.tabela-estoque tbody td[class!="sem-estoque"] input'), function(ind, val){
            if ($(val).val() != "") {
                qtdTotalCompradaParaProduto = qtdTotalCompradaParaProduto + parseFloat($(val).val());
            }
        });

        // Se o produto não tiver nenhuma variação adicionada na sacola, voltamos o botão para somar
        if (qtdTotalCompradaParaProduto == 0) {
            acaoDefault = containerEstoque.find('[data-adicionar-remover-default]').attr('data-adicionar-remover-default');
            containerEstoque.find('.cont-mensagem-tabela-estoque-topo [data-acao="'+acaoDefault+'"]').trigger("click");
        }

        montaContAdicionandoProdutoSacola();
        montaElemMensagemTabelaEstoque.topo(containerEstoque);
        montaElemMensagemTabelaEstoque.rodape(containerEstoque);

    });

}


/****************************************************************** */
/****************************************************************** */
/****************************************************************** */
/**
 * Gerais
 */
const processaGlobalEstoque = {
    add: function(idProduto, idGrade, idEstampa, estoque, preco, quantidade) {
        var add = {
            idProduto: idProduto,
            idGrade: idGrade,
            idEstampa: idEstampa,
            estoque: estoque,
            preco: preco,
            quantidade: quantidade
        }
        global_estoque.push(add);
        return global_estoque;
    },
    find: function(idProduto, idGrade, idEstampa){
        var retorno=null;
        $.each(global_estoque, function(ind, val){
            if (idProduto == val.idProduto && idGrade == val.idGrade && idEstampa == val.idEstampa) {
                retorno = val;
            }
        });
        return retorno;
    }
};
const montaElemMensagemTabelaEstoque = {
    btnComprar: function(containerEstoque){
        var tela = verificaTipoResolucaoPagina();
        var largTdsGrades = 81;

        if (tela.tipoTela == "mobile") {
            switch(containerEstoque.attr('class').split(' ')[1]){
                case 'catalogo':
                case 'live':
                    largTdsGrades = 71;           
                    break;
            }
        }


        var largTabelaEstampas = containerEstoque.find('table.tabela-estoque.estampas').outerWidth();
        var largTabelaGrades = containerEstoque.find('.cont-tabela-grades').find('thead td').length * largTdsGrades;
        var larguraBtn = largTabelaEstampas + largTabelaGrades;

        var contBtnComprar = $('<div>').css('width', larguraBtn+'px').addClass('btn-comprar').html('<button id="btnAbrirSacolaEstoque" class="finalizar"><i class="fal fa-shopping-bag"></i>'+global_traducao.alteracao_btn_sacola.comprar+'</button>');
        containerEstoque.find('.cont-tabelas').after(contBtnComprar);
        
        contBtnComprar.find('button').click(function(){
            abreSacolaDAO(true, true);
        });

    },
    topo: function(containerEstoque){

        var elemClass = 'cont-mensagem-tabela-estoque-topo';
        var totalSacolaProduto = eachItensDoProduto(containerEstoque);

        if (containerEstoque.find('.'+elemClass).length == 0) {

            var container = $('<div>').addClass('cont-mensagem-tabela-estoque-topo')
            var contAlterarQtd = $('<div>').addClass('alterar-qtd-add-sacola');
            var contInputAlterarQtd = $('<div>').addClass('cont-input');
            var input = $('<input>').attr({
                name: 'configEstoqueQtd',
                type: 'tel',
                maxlength:'3'
            });
    
            var contMsg1 = $('<span>').text(global_traducao.tabela_estoque.abreviacao_quantidade+': ');
            var contMsg2 = $('<span>').text("");
    
            var btnAdicionar = $('<div>').attr('data-acao', '+').html('<i class="far fa-plus-circle"></i> '+global_traducao.tabela_estoque.menu_acao_tabela_estoque["+"][0]);
            var btnRemomer = $('<div>').attr('data-acao', '-').html('<i class="far fa-minus-circle"></i> '+global_traducao.tabela_estoque.menu_acao_tabela_estoque["-"][0]);
            var btnDefinir = $('<div>').attr('data-acao', '=').html('<i class="far fa-pause-circle"></i> '+global_traducao.tabela_estoque.menu_acao_tabela_estoque["="][0]);
        
            container.append(btnAdicionar).append(btnRemomer).append(btnDefinir);      
            // container.append(contAlterarQtd.append(contMsg1).append(contInputAlterarQtd.append(input)).append(contMsg2));
        
            containerEstoque.find('.cont-tabelas').before(container);
        
            container.find('div[data-acao]').click(function(){
                $(this).parent().removeClass('on')
                var clickAcao = $(this).attr('data-acao');
                processaStorageTabelaEstoque.setAcao(clickAcao);
                alterarAcaoAdicionarRemover(containerEstoque, clickAcao);
            });

            container.click(function(){
                $(this).removeClass('on')
            });


            alterarAcaoAdicionarRemover(containerEstoque);

            contAlterarQtd.click(function(event){
                toggleTabelaGradesClickInput(event);
            });
    
        }
    
    },
    rodape: function(containerEstoque){
        var elemClass = 'cont-mensagem-tabela-estoque-rodape';
        var totalSacolaProduto = eachItensDoProduto(containerEstoque);
    
        if (totalSacolaProduto.qtdTotal > 0) {
            
            var contTotais = containerEstoque.find('.'+elemClass+' .totais-produto');
    
            if (containerEstoque.find('.'+elemClass).length == 0) {
    
                var contInfosRodape = $('<div>').addClass(elemClass);
                var contTotaisProduto = $('<div>').addClass('totais-produto').html('<i class="fad fa-shopping-bag"></i><span class="valor">'+totalSacolaProduto.valorMonetario+'</span> (<span class="total">'+totalSacolaProduto.qtdTotal+'</span> '+global_traducao.tabela_estoque.abreviacao_unidades+')');
                var contApagarTudo = $('<div>').addClass('apagar-todos').html('<i class="fad fa-eraser"></i>'+global_traducao.tabela_estoque.btn_apagar_todos);
    
                containerEstoque.find('.btn-comprar').after(contInfosRodape);
                contInfosRodape.append(contTotaisProduto).append(contApagarTudo);
    
                contApagarTudo.click(function(){
                    montaContAdicionandoProdutoSacola(containerEstoque);
                    var arrDataPost = eachLocalizarIdProdutosParaApagar(containerEstoque);
                    containerEstoque.find('table.tabela-estoque.grades input').val("");
                    var objPost = {
                        acao: $('table.tabela-estoque.grades').attr('data-adicionar-remover'),
                        origem: containerEstoque.attr('class').split(' ')[1],
                        data: arrDataPost
                    };
                    requestSacola(containerEstoque, objPost);
                });
    
                contTotaisProduto.click(function(){
                    abreSacolaDAO(true, true);
                });
    
            } else {
    
                //cont total produto
                contTotais.find('.total').text(totalSacolaProduto.qtdTotal);
                contTotais.find('.valor').text(totalSacolaProduto.valorMonetario);
    
            }
    
        } else {
            containerEstoque.find('.'+elemClass).remove();
        }    
    },
};
function toggleTabelaGradesClickInput(event){
    var tabelaGrades = $('table.tabela-estoque.grades');
    var tds = tabelaGrades.find('tbody td[class!="sem-estoque"]');
    tds.find('input').prop('readonly', false);
    tds.off('click');
}
function eachLocalizarIdProdutosParaApagar(containerEstoque){
    var tds = containerEstoque.find('table.tabela-estoque.grades tbody td[class!="sem-estoque"]');
    var arrIdsProduto=[], ret=[];
    $.each(tds, function(ind, val){
        var idProduto = $(val).attr('data-idproduto');
        if ($(val).find('input').val() == "" || $(val).find('input').val() == "0") {return;}
        if ($.inArray(idProduto, arrIdsProduto) == -1) {
            arrIdsProduto.push(idProduto);
        }
    });
    $.each(arrIdsProduto, function(ind, val){
        ret.push({idProduto:val});
    });
    return ret;
}
function eachItensDoProduto(containerEstoque){
    var total = 0;
    var valor = 0;
    var inputs = containerEstoque.find('table.tabela-estoque.grades input');
    $.each(inputs, function(ind, val){
        var td = $(val).parent();
        var quantidade = ($(val).val() == "") ? 0 : parseFloat($(val).val());
        var precoDiferenciado = td.attr('data-precodiferenciado');
        if (quantidade > 0 && precoDiferenciado != undefined) {
            valor = valor + (quantidade * parseFloat(precoDiferenciado));
            total = total + quantidade;
        }
    });
    return {
        qtdTotal: total,
        valorTotal:valor,
        valorMonetario: formataValorFloatParaMonetario(global_bodyData.moeda, valor)
    }

}
function cloneThEstampasTabelaEstoque(elemTable){
    var table = $('<table>').addClass('tabela-estoque estampas');
    var thead = $('<thead>').html('<tr><th>&nbsp;</th></tr>');
    var tbody = $('<tbody>');

    $.each(elemTable.find('tbody tr th'), function(ind, val){
        var tr = $('<tr>').attr('data-idestampa', $(val).parent().attr('data-idestampa'));
        var th = $('<th>').html($(val).html());
        tbody.append(tr.append(th));
    });
    table.append(thead).append(tbody);
    return table;
}

function alterarAcaoAdicionarRemover(containerEstoque, acao=null){

    var acaoDefault = containerEstoque.find('[data-adicionar-remover-default]').attr('data-adicionar-remover-default');
    var tds = $('.cont-tabelas table.tabela-estoque.grades tbody td[class!="sem-estoque"]');
    var inputs = tds.find('input');
    
    var novaAcao = (acao==null) ? processaStorageTabelaEstoque.getAcao() : acao;
    novaAcao = (novaAcao==null) ? acaoDefault : novaAcao;
    
    if ($.inArray($(inputs[0]).attr('placeholder'), ["0","+","-","="]) != -1) {
        inputs.attr('placeholder', novaAcao);
    }

    var configsInput = {
        // attr: {placeholder: novaAcao},
        attr: {},
        prop: {readonly: true},
        css: {border: 'none'}
    }

    if (novaAcao == "="){
        configsInput = {
            // attr: {placeholder: ''},
            attr: {},
            prop: {readonly: false},
            css: {border: '1px solid #e6e6e6'}
        }
        tds.removeClass('after-placeholder');
    } else {
        tds.filter(function(ind){
            var inputVal = parseFloat($(this).find('input').val());
            if (isNaN(inputVal)) {
                $(this).addClass('after-placeholder');
            }
        });
    }

    inputs.attr(configsInput.attr).prop(configsInput.prop).css(configsInput.css);

    $('.cont-mensagem-tabela-estoque-topo [data-acao]').removeClass('on');
    $('.cont-mensagem-tabela-estoque-topo [data-acao="'+novaAcao+'"]').addClass('on');
    $('table.tabela-estoque.grades').attr('data-adicionar-remover', novaAcao);
    $('.cont-mensagem-tabela-estoque-topo input[name="configEstoqueQtd"]').val(processaStorageTabelaEstoque.getQtd());

}

function montaContPrecoDiferenciado(moeda, preco, precodiferenciado){
    var diff = (preco - precodiferenciado);
    var novoPreco = (preco - precodiferenciado);
    if (diff < 0) {
        var novoPreco = (precodiferenciado - preco);
    }
    var msg_txt = (diff > 0) ? global_traducao.tabela_estoque.preco_grade_com_desconto : global_traducao.tabela_estoque.preco_grade_com_acrescimo;
    var html = msg_txt.replace("{VALOR}", formataValorFloatParaMonetario(moeda, novoPreco.toFixed(2)));
    return $("<span>").addClass("msgpadrao-absolute-estoque acrescimo").html(html);
}
function montaContBloqEstoque(containerEstoque){

    setTimeout(() => {
        var contTabelas = containerEstoque.find('.cont-tabelas');
        var contBloq = $('<div>').addClass("cont-elem-bloq-estoque").html('<i class="far fa-lock-alt"></i>');
        var contMsg = $('<div>').addClass("content-msg-bloq-estoque").html('<span class="msgpadrao-logar csscustom-bg-topo csscustom-color-topo"><a href="/login"><i class="far fa-lock-alt"></i> '+global_traducao.tabela_estoque.montarelem_msg_bloq_estoque+'</a></span></div>');
        var tabelaEstampas = contTabelas.find('table.tabela-estoque.estampas');
        var tabelaGrades = contTabelas.find('table.tabela-estoque.grades');
    
        tabelaGrades.parent().append(contBloq);
        contTabelas.parent().append(contMsg);

        tabelaGrades.parent().css('overflow', 'hidden');
        // contMsg.css('width', (tabelaEstampas.outerWidth() + tabelaGrades.outerWidth())+'px');
        contBloq.css({
            'top': (tabelaGrades.find("thead").outerHeight()+1)+'px',
            'left': '0px',
            'width': 'calc(100% - 1px)',
            'height': 'calc(100% - '+(tabelaGrades.find("thead").outerHeight()+2)+'px',
        });        
    }, 700);
}
function montaContAdicionandoProdutoSacola(containerEstoque=false){
    var elemClassCarregando = "enviando-produtos";
    var btnComprar = $(".btn-comprar button");

    if ($('.'+elemClassCarregando).length > 0 || containerEstoque === false) {
        $('.'+elemClassCarregando).fadeOut(function(){$(this).remove();});
        btnComprar.html('<i class="fal fa-shopping-bag"></i>'+global_traducao.alteracao_btn_sacola.comprar);
        return;
    }
    var cont = $('<div>').addClass(elemClassCarregando).html('<div><i class="fa-duotone fa-spinner fa-spin"></i></div>');
    containerEstoque.prepend(cont);
    btnComprar.html('<i class="fa-duotone fa-spinner fa-spin"></i>'+global_traducao.alterar_btn_produto_sacola.adicionando);
}
function montaContMsgAvisoTd(nome, htmlMsg, timeout=null){
    var cont = $("<span>").addClass("msgpadrao-absolute-estoque "+nome).html(htmlMsg);

    if (timeout){

        cont.addClass('mostrar');

        setTimeout(function(){
            cont.fadeOut(function(){$(this).remove()});
        }, timeout);
    }

    return cont;
}
function getIdsDaTd(elemTd){
    return {
        idProduto: elemTd.attr('data-idproduto'),
        idGrade: elemTd.attr('data-idgrade'),
        idEstampa: elemTd.attr('data-idestampa'),
    
    };
}

var processaStorageTabelaEstoque = {

    key: function(){
        return "CONFIGSTABELAESTOQUE";
    },
    setQtd: function(val) {
        var get = this.get();
        var set = {};
        if (get != null) {
            set = get;
        }
        set.qtd = parseInt(val);
        return this.set(JSON.stringify(set));
    },
    getQtd: function() {
        var get = this.get();
        var retPadrao = 1;
        if (get == null) {
            return retPadrao;
        } else {
            if (!get.qtd) {
                return retPadrao;
            }
        }
        return get.qtd;

    },
    setAcao: function(val) {
        var get = this.get();
        var set = {};
        if (get != null) {
            set = get;
        }
        set.acao = val;
        return this.set(JSON.stringify(set));
    },
    getAcao: function() {
        var get = this.get();
        var retPadrao = null;
        if (get == null) {
            return retPadrao;
        } else {
            if (!get.acao) {
                return retPadrao;
            }
        }
        return get.acao;
    },
    set: function(set) {
        return sessionStorage.setItem(this.key(), set);
    },
    get: function() {
        var get = sessionStorage.getItem(this.key());
        return JSON.parse(get);
    },
    del: function() {
        return sessionStorage.removeItem(this.key());
    }

}
