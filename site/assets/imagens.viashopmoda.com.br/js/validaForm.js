function verificaInputRadio(divRadios){
    var arrRetorno = [];
    var check_radio = false;
    $.each(divRadios.find("input"), function(){
        var input = $(this);
        if (input.prop("required") == true) {
            if (input.prop("checked") == true)
                check_radio = true;
        }
    });
    if (!check_radio) {
        arrRetorno.push(false);
        arrRetorno.push("selecione uma opção");
    }
    return arrRetorno;
}


function verificaInputCheckbox(divCheckBoxes){
    var arrRetorno = [];
    var checkmin = divCheckBoxes.find("input").attr("data-checkmin");
    var required = divCheckBoxes.find("input").prop("required");
    var conta_checked = 0;
    var mensagens = leJsonInfosGeraisForms();
    var objMsgsValidacao = mensagens.validaForm;

    if (required) {
        $.each(divCheckBoxes.find("input"), function(){
            var input = $(this);
            if (input.prop("checked") == true) {
                conta_checked++;
            }
        });
        if (conta_checked < checkmin) {
            var msg = objMsgsValidacao.marcar_minimo+' '+checkmin;
            if (checkmin == "1") {
                msg =objMsgsValidacao.marcar_minimo_unico;
            }
            arrRetorno.push(false);
            arrRetorno.push(msg);
        } else {
            arrRetorno.push(true);
            arrRetorno.push("");
        }
    } else {
        arrRetorno.push(true);
        arrRetorno.push("");
    }

    return arrRetorno;
}

function verificaInputNormal(input){
    var arrRetorno = [];
    var tipoValidacao = $(input).attr("data-valida");
    var value = $(input).val();
    var mensagens = leJsonInfosGeraisForms();
    var objMsgsValidacao = mensagens.validaForm;

    if (value == "") {
        arrRetorno.push(false);
        arrRetorno.push(objMsgsValidacao.vazio);
    } else {
        
        if ($(input).attr('minlength') != undefined) {
            if ($(input).val().length < $(input).attr('minlength')) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalido);
            }
        }

        if(tipoValidacao == "cpf") {
            if (value.length == 14) {
                var retValidaCPF = validaCPF(value);
                if (retValidaCPF) {
                    arrRetorno.push(true);
                    arrRetorno.push("");
                } else {
                    arrRetorno.push(false);
                    arrRetorno.push(objMsgsValidacao.invalido);
                }
            } else {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.faltando_digitos);
            }
        } else if(tipoValidacao == "cnpj") {
            if (value.length == 18) {
                var retValidaCNPJ = validaCNPJ(value);
                if (retValidaCNPJ) {
                    arrRetorno.push(true);
                    arrRetorno.push("");
                } else {
                    arrRetorno.push(false);
                    arrRetorno.push(objMsgsValidacao.invalido);
                }
            } else {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.faltando_digitos);
            }
        } else if(tipoValidacao == "email") {
            var verifEmail = validaEmail(value);
            if (verifEmail) {
                arrRetorno.push(true);
                arrRetorno.push("");
            } else {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.email_invalido);
            }
        } else if(tipoValidacao == "telefone") {
            var verif_ddd = false;
            var verif_prefix = false;
            var verif_num = false;
            var ddd = value.substring(1,3);
            var valueSplit = value.substring(5, value.length).split("-");
            var prefix = valueSplit[0];
            var num = valueSplit[1];

            if ($.isNumeric(ddd) && ddd.length == 2) verif_ddd = true;
            if ($.isNumeric(prefix) && prefix.length == 4) verif_prefix = true;
            if ($.isNumeric(num) && num.length == 4) verif_num = true;

            if (!verif_ddd || !verif_prefix || !verif_num) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalido);
            }
        } else if(tipoValidacao == "celular") {
            var verif_ddd = false;
            var verif_prefix = false;
            var verif_num = false;
            var ddd = value.substring(1,3);
            var valueSplit = value.substring(5, value.length).split("-");
            var prefix = valueSplit[0];
            var num = valueSplit[1];

            if ($.isNumeric(ddd) && ddd.length == 2) verif_ddd = true;
            if ($.isNumeric(prefix) && (prefix.length == 4 || prefix.length == 5)) verif_prefix = true;
            if ($.isNumeric(num) && num.length == 4) verif_num = true;

            if (!verif_ddd || !verif_prefix || !verif_num) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalido);
            }
        } else if(tipoValidacao == "telefoneinternacional") {
            var verif=true;
            // var split = value.split(' ');
            // if (split.length === 3) {
            //     var v_codPais = (split[0].length < 3) ? false : true;
            //     var v_codArea = (split[2].length < 7) ? false : true;
            //     if (!v_codPais || !v_codArea) {
            //         var verif=false
            //     }
            // } else {
            //     var verif=false
            // }
            // if (!verif) {
            //     arrRetorno.push(false);
            //     arrRetorno.push("internacional inválido");
            // }
        } else if(tipoValidacao == "data") {
            var data_split = value.split("/");
            var dia = parseInt(data_split[0]);
            var mes = parseInt(data_split[1]);
            var ano = parseInt(data_split[2]);
            if (!validaData(ano, mes, dia) || data_split.length != 3) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalida);
            }
        } else if(tipoValidacao == "data-en") {
            var data_split = value.split("/");
            var dia = parseInt(data_split[1]);
            var mes = parseInt(data_split[0]);
            var ano = parseInt(data_split[2]);
        
            if (!validaData(ano, mes, dia) || data_split.length != 3) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalida);
            }
        } else if(tipoValidacao == "cep") {
            // var splitVal = value.split("-");
            // if (splitVal[0].length != 5 || splitVal[1].length != 3) {
            if (value.length < 4) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalido);
            }
        } else if(tipoValidacao == "validadecartaodecredito") {
            var hoje = new Date().getFullYear();
            var splitData = value.split("/");
            var preparaDataParaValidar = splitData[0].trim()+"/"+hoje.toString().substring(0,2)+splitData[1].trim();
            if (!validaDataCartaoDeCredito(preparaDataParaValidar)) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.invalida);
            } else {
                arrRetorno.push(true);
                arrRetorno.push('');
            }
        } else if(tipoValidacao == "texto") {
            arrRetorno.push(true);
            arrRetorno.push("");
        } else if(tipoValidacao == "senha") {
            if (validaSenha(input.val()) == false) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.senha_invalida);
            }
        } else if(tipoValidacao == "nomecomposto") {
            var retorno = false;
            var splitInput = input.val().split(" ");
            var verifSegundoNome = splitInput[1];
            if (verifSegundoNome == "" || verifSegundoNome == undefined) {
                retorno = false;
            } else {
                if (verifSegundoNome.length >= 1) {
                    retorno = true;
                } else {
                    retorno = false;
                }
            }
            //trabalhando o retorno
            if (retorno) {
                arrRetorno.push(true);
                arrRetorno.push("");
            } else {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.incorreto);
            }
        } else if(tipoValidacao == "confirmarsenha") {
            if (input.val() != $("#"+input.attr("data-campovalida")).val()) {
                arrRetorno.push(false);
                arrRetorno.push(objMsgsValidacao.nao_confere);
            }
        } else {
            arrRetorno.push(true);
            arrRetorno.push("");
        }
    }

    //retornando o array
    return arrRetorno;
}
function validaEmail(value){
    var emailFilter=/^.+@.+\..{2,}$/;
    var illegalChars= /[\(\)\<\>\,\;\:\\\/\"\[\] ]/
    // condição
    varif_arroba = (value.split('@').length - 1);
    if(!(emailFilter.test(value)) || value.match(illegalChars) || (varif_arroba != 1)){
        return false;
        // arrRetorno.push(false);
        // arrRetorno.push("inválido. você deve utilizar o padrão: nome@dominio.com.br");
    } else {
        return true;
        // arrRetorno.push(true);
        // arrRetorno.push("");
    }
}
function validaCPF(value){
    value = jQuery.trim(value);
    value = value.replace('.','');
    value = value.replace('.','');
    cpf = value.replace('-','');
    while(cpf.length < 11) cpf = "0"+ cpf;
    var expReg = /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;
    var a = [];
    var b = new Number;
    var c = 11;
    for (i=0; i<11; i++){
        a[i] = cpf.charAt(i);
        if (i < 9) b += (a[i] * --c);
    }
    if ((x = b % 11) < 2) { a[9] = 0 } else { a[9] = 11-x }
    b = 0;
    c = 11;
    for (y=0; y<10; y++) b += (a[y] * c--);
    if ((x = b % 11) < 2) { a[10] = 0; } else { a[10] = 11-x; }

    var retorno = true;
    if ((cpf.charAt(9) != a[9]) || (cpf.charAt(10) != a[10]) || cpf.match(expReg)) retorno = false;

    return retorno;
}
function validaCNPJ(str){
    str = str.replace('.','');
    str = str.replace('.','');
    str = str.replace('.','');
    str = str.replace('-','');
    str = str.replace('/','');
    cnpj = str;
    var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
    digitos_iguais = 1;
    if (cnpj.length < 14 && cnpj.length < 15)
        return false;
    for (i = 0; i < cnpj.length - 1; i++)
        if (cnpj.charAt(i) != cnpj.charAt(i + 1))
    {
        digitos_iguais = 0;
        break;
    }
    if (!digitos_iguais) {
        tamanho = cnpj.length - 2
        numeros = cnpj.substring(0,tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--)
        {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false;
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0,tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--)
        {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false;
        return true;
    } else {
        return false;
    }
}
function validaData(ano, mes, dia){
    var retorno = false;
    var hoje = new Date();
    var bissexto = 0;
    // var data_split = str.split("/");
    // var dia = parseInt(data_split[0]);
    // var mes = parseInt(data_split[1]);
    // var ano = parseInt(data_split[2]);

    //verifica se ano é bissexto
    if ((ano % 4 == 0) || (ano % 100 == 0) || (ano % 400 == 0)) {
        bissexto = 1;
    }
    if ((ano < hoje.getFullYear()-100) || (ano >= hoje.getFullYear())) {
        retorno = false;
    } else if (mes == 2 && dia > 29) {
        retorno = false;
    } else if ((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30){
        retorno = false;
    } else if (mes > 12){
        retorno = false;
    } else {
        retorno = true;
    }
    return retorno;
}
function validaSenha(senha){
    var verifica=true;
    //!, @, #, $, %, &
    for (var i=0; i < senha.length; i++) {
        var valorAscii = senha.charCodeAt(i);
         if (
            (valorAscii != 33) && // !
            (valorAscii < 35 || valorAscii > 38) && // #, $, %, &
            (valorAscii < 48 || valorAscii > 57) && // números
            (valorAscii != 64) && // @
            (valorAscii < 65 || valorAscii > 90) && // Letras maiúsculas
            (valorAscii < 97 || valorAscii > 122) // Letras minúsculas
         ) {
            verifica=false;
        }
    }   
    return verifica;
}
function validaDataParaBusca(str){
    var retorno = false;
    var hoje = new Date();
    var bissexto = 0;
    var data_split = str.split("/");
    var dia = parseInt(data_split[0]);
    var mes = parseInt(data_split[1]);
    var ano = parseInt(data_split[2]);

    if (mes == 2 && dia > 29) {
        retorno = false;
    } else if (ano == hoje.getFullYear() && mes == hoje.getUTCMonth()+1 && dia > hoje.getUTCDate()) {
        retorno = false;
    } else if ((mes == 4 || mes == 6 || mes == 9 || mes == 11) && dia > 30){
        retorno = false;
    } else {
        retorno = true;
    }
    return retorno;
}
function validaDataCartaoDeCredito(str){ //mm/aa
    var retorno = false;
    var hoje = new Date();
    var data_split = str.split("/");
    var mes = data_split[0].trim();
    var ano = data_split[1].trim();

    if (ano > hoje.getFullYear()) {
        retorno = true;
    } else if (ano == hoje.getFullYear()) {
        if (mes > hoje.getMonth()) {
            retorno = true;
        }
    }
    return retorno;
}
function initialMascarasCamposForm(){
    $('[data-mascara="false"]').off('input').on('input', function() {
        // console.log('nao faz nada')
    });
    $('[data-mascara="somenteNumeros"]').on('input', function() {
        var v = $(this).val();
        var replace = $(this).val().replace(/\D+/g, '');
        return $(this).val(replace);
    });
    $('[data-mascara="cpfcnpj"]').on('input', function() {
        var retorno;
        var v = $(this).val();

        if ($(this).attr("data-valida") == "cpf") {
            v=v.replace(/\D/g,"");
            v=v.replace(/(\d{3})(\d)/,"$1.$2");
            v=v.replace(/(\d{3})(\d)/,"$1.$2");
            v=v.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
            retorno = v
        } else {
            v=v.replace(/\D/g,"");
            v=v.replace(/^(\d{2})(\d)/,"$1.$2");
            v=v.replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3");
            v=v.replace(/\.(\d{3})(\d)/,".$1/$2");
            v=v.replace(/(\d{4})(\d)/,"$1-$2");
            retorno = v;
        }
        $(this).val(retorno);
    });
    $('[data-mascara="data"]').on('input', function() {
        var v = this.value;
        v=v.replace(/\D/g,"");
        v=v.replace(/(\d{2})(\d)/,"$1/$2");
        v=v.replace(/(\d{2})(\d)/,"$1/$2");
        $(this).val(v);
    });
    $('[data-mascara="validadecartaodecredito"]').on('input', function() {
        var v = this.value;
        v=v.replace(/\D/g,"");
        v=v.replace(/(\d{2})(\d)/,"$1/$2");
        $(this).val(v);
    });
    $('[data-mascara="cep"]').on('input', function() {
        var v = this.value;
        v=v.replace(/\D/g,"");
        v=v.replace(/(\d{5})(\d)/,"$1-$2");
        $(this).val(v);
    });
    $('[data-mascara="telefone"]').on('input', function() {
        var v = this.value;
        v=v.replace(/\D/g,"");
        v=v.replace(/^(\d\d)(\d)/g,"($1) $2");
        v=v.replace(/(\d{4})(\d)/,"$1-$2");
        $(this).val(v);
    });
    $('[data-mascara="celular"]').on('input', function() {
        var v = this.value;
        v=v.replace(/\D/g,"");
        v=v.replace(/^(\d\d)(\d)/g,"($1) $2");
        v=v.replace(/(\d{5})(\d)/,"$1-$2");
        $(this).val(v);
    });
    $('[data-mascara="telefoneinternacional"]').on('input', function() {
        var texto = this.value;
        texto = texto.replace(/[^\d]/g, '');
        if (texto.length > 0) {
            texto = "+" + texto;
            // if (texto.length > 3) {
            //     texto = [texto.slice(0, 3), " ", texto.slice(3)].join('');
            // }
            // if (texto.length > 6) {
            //     texto = [texto.slice(0, 7), " ", texto.slice(7)].join('');
            // }
            // if (texto.length > 11) {
            //     texto = [texto.slice(0, 11), "-", texto.slice(11)].join('');
            // }
            // if (texto.length > 20) {
            //     texto = texto.substr(0,20);
            // }
        }
        $(this).val(texto);
    });
    $('[data-mascara="numerocartaodecredito"]').on('input', function() {
        var v = this.value;
        v=v.replace(/\D/g,"");
        v=v.replace(/^(\d{4})(\d)/,"$1 $2");
        v=v.replace(/^(\d{4})\.(\d{4})(\d)/,"$1 $2 $3");
        v=v.replace(/^(\d{4})\.(\d{4})\.(\d{4})(\d)/,"$1 $2 $3 $4");

        v=v.replace(/\D/g,"");
        v=v.replace(/^(\d{4})(\d)/g,"$1 $2");
        v=v.replace(/^(\d{4})\s(\d{4})(\d)/g,"$1 $2 $3");
        v=v.replace(/^(\d{4})\s(\d{4})\s(\d{4})(\d)/g,"$1 $2 $3 $4");
        $(this).val(v);
    });

    $('[data-mascara="instagram"]').on("keydown", function(event){
        console.log(event.keyCode)
        var input = $(this);

        input.val(replaceAll(input.val(), " ", ""));

        if (event.keyCode == 32) { return false; }
        if (event.keyCode == 50) {
            if (input.val().length > 0) {
                return false;
            }
        }

        if (
            event.keyCode != 17 &&
            event.keyCode != 86 &&
            event.keyCode != 46 &&
            event.keyCode != 8
        ) {
            if (input.val().substring(0,1) != "@") {
                input.val("@"+input.val());
            }
        }

    }).on("paste", function (event) {
        var input = $(this);

        setTimeout(function(){
            input.val(replaceAll(input.val(), " ", ""));
        },100);

    }).on('blur', function(event){
        var input = $(this);

        try {
            var url = new URL(input.val());
            console.log(url);
            var novoVal = url.pathname.replace('/','');
        } catch {
            var novoVal = input.val();
        }

        if (novoVal.substring(0,1) != "@") {
            novoVal = "@"+novoVal;
        }

        novoVal = novoVal.replace("https", "");
        novoVal = novoVal.replace("http", "");
        novoVal = novoVal.replace(":", "");
        novoVal = novoVal.replace("www.instagram.com", "");
        novoVal = novoVal.replace("instagram.com", "");
        novoVal = novoVal.replace("/", "");
        novoVal = novoVal.replace("//", "");
        novoVal = novoVal.replace(" ", "");

        if (novoVal != "@") {
            input.val(novoVal);
        }
    });

}

function mascaraInputInstagram(event){
    
    console.log(event.keyCode);
    
    var input = $(this);
    console.log(input.val());

    try {
        var url = new URL(input.val());
        var novoVal = url.pathname.substring(1, url.pathname.length);
    } catch {
        var novoVal = input.val();
    }

    novoVal = replaceAll(novoVal, "www.instagram.com", "");
    novoVal = replaceAll(novoVal, "instagram.com", "");
    novoVal = replaceAll(novoVal, "/", "");
    novoVal = replaceAll(novoVal, "@", "");

    switch(event.type){
        case 'blur':
            if (input.val().substring(0,1) != "@") {
                novoVal = "@"+novoVal;
            }
            break;
    }

    input.val(novoVal);


}