var getCardFlag = {
    check: function(cardnumber) {
        var bodyData = getBodyData();
        var cardnumber = cardnumber.replace(/[^0-9]+/g, '');
        var pathImagens = bodyData.subdominioImagens+bodyData.urlBase+"/imagens/cartoes/";

        var cards = {
            amex: /^3[47][0-9]/,
            aura: /^(5078\d{2})(\d{2})(\d{11})$/, // ver
            diners: /^3(?:0[0-5]|[68][0-9])[0-9]/,
            discover: /^6(?:011|5[0-9]{2})[0-9]/,
            elo: /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/, // testar
            hipercard: /^(606282(\d{3})?)|(3841\d{15})/,
            jcb: /^(?:2131|1800|35\d{3})/,
            mastercard: /^5[1-5][0-9]/,
            visa: /^4[0-9](?:[0-9]{3})/,
        };
        // var cards = {
        //     amex: /^3[47][0-9]{13}/,
        //     aura: /^(5078\d{2})(\d{2})(\d{11})$/,
        //     diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}/,
        //     discover: /^6(?:011|5[0-9]{2})[0-9]{12}/,
        //     elo: /^((((636368)|(438935)|(504175)|(451416)|(636297))\d{0,10})|((5067)|(4576)|(4011))\d{0,12})/,
        //     hipercard: /^(606282\d{10}(\d{3})?)|(3841\d{15})/,
        //     jcb: /^(?:2131|1800|35\d{3})\d{11}/,
        //     mastercard: /^5[1-5][0-9]{14}/,
        //     visa: /^4[0-9]{12}(?:[0-9]{3})/,
        // };


        var cardName = "generic";

        for (var flag in cards) {
            if(cards[flag].test(cardnumber)) {
                cardName = flag;
            }
        }

        return {
            name: cardName,
            img: pathImagens+cardName+".png",
        };

    }
}