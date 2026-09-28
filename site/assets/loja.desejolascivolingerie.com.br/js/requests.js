function requestApiLojaV2_GET(metodoNaApi="", query={}, callbackSuccess="", callbackFail="", callbackAllways=""){
    var url = "/api/v2/"+metodoNaApi;
    var time = new Date();

    if (metodoNaApi.indexOf('https') != -1) {
        url = metodoNaApi;
    }
   
    var objQuery={};
    objQuery.time = time.getTime();
    objQuery = Object.assign(query, objQuery);
    objQuery = new URLSearchParams(objQuery).toString();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {
        
        if (this.readyState === 4) {
            
            if (typeof callbackAllways == "function") {
                callbackAllways(this);
            }

            if (this.status >= 200 && this.status <= 299) {

                if (typeof callbackSuccess == "function") {
                    callbackSuccess(this.responseText);
                }

            }
    
            if (this.status < 200 || this.status > 299) {

                if (typeof callbackFail == "function") {
                    callbackFail(this.responseText);
                    return;
                }
                
                var response = JSON.parse(this.responseText);
                if (response.reload) {
                    location.reload();
                }

            }

        }

    });

    if (url.indexOf('?') === -1) {
        var urlExe = url+'?'+objQuery;
    } else {
        var urlExe = url+'&'+objQuery;
    }

    xhr.open("GET", urlExe);
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("device", global_bodyData.device);
    xhr.setRequestHeader("TokenApiLoja", global_bodyData.tokenApiLoja);
    xhr.setRequestHeader("TokenClienteApiLoja", global_bodyData.tokenClienteApiLoja);
    xhr.setRequestHeader("Currency", global_bodyData.moeda);
    xhr.setRequestHeader("Language", global_bodyData.lang);
    xhr.setRequestHeader("OrigemRequest", location.origin);

    xhr.send();
}
function requestApiLojaV2_POST(metodoNaApi="", query={}, post={}, callbackSuccess="", callbackFail="", callbackAllways=""){
    var url = "/api/v2/"+metodoNaApi;
    var time = new Date();

    var objQuery={};
    objQuery.time = time.getTime();
    objQuery = Object.assign(query, objQuery);
    objQuery = new URLSearchParams(objQuery).toString();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;


    xhr.addEventListener("readystatechange", function() {

        if (this.readyState === 4) {
            
            if (typeof callbackAllways == "function") {
                callbackAllways(this);
            }

            if (this.status >= 200 && this.status <= 299) {

                if (typeof callbackSuccess == "function") {
                    callbackSuccess(this.responseText);
                }

            }
    
            if (this.status < 200 || this.status > 299) {

                if (typeof callbackFail == "function") {
                    callbackFail(this.responseText);
                    return;
                }
                
                var response = JSON.parse(this.responseText);
                if (response.reload) {
                    location.reload();
                }

            }

        }

    });

    xhr.open("POST", url+'?'+objQuery);
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("TokenApiLoja", global_bodyData.tokenApiLoja);
    xhr.setRequestHeader("TokenClienteApiLoja", global_bodyData.tokenClienteApiLoja);
    xhr.setRequestHeader("Currency", global_bodyData.moeda);
    xhr.setRequestHeader("Language", global_bodyData.lang);
    xhr.setRequestHeader("OrigemRequest", location.origin);

    xhr.send(JSON.stringify(post));

}

function requestApiLoja_GET(query={}, callbackSuccess="a", callbackFail="", callbackAllways=""){
    var url = "/api/";
    var time = new Date();
    
    var objQuery={};
    objQuery.time = time.getTime();
    objQuery = Object.assign(query, objQuery);
    objQuery = new URLSearchParams(objQuery).toString();

    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function() {

        if (this.readyState === 4) {
            if (this.status >= 200 && this.status <= 299) {
                if (typeof callbackSuccess == "function") {
                    callbackSuccess(this.responseText);
                }

            }

            if (typeof callbackAllways == "function") {
                callbackAllways(this);
            }

            if (this.status < 200 || this.status > 299) {

                if (typeof callbackFail == "function") {
                    callbackFail(this.responseText);
                    return;
                }

            }
        }

        // if (this.status < 200 && this.status > 299) {
        //     callbackFail(this);
        // }
        // if (this.readyState === 4) {
        //     callbackSuccess(this.responseText);
        //     if (typeof callbackAllways == "function") {
        //         callbackAllways(this);
        //     }
        // }
    });

    xhr.open("GET", url+'?'+objQuery);
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("TokenApiLoja", global_bodyData.tokenApiLoja);
    xhr.setRequestHeader("Currency", global_bodyData.moeda);
    xhr.setRequestHeader("Language", global_bodyData.lang);
    xhr.setRequestHeader("OrigemRequest", location.origin);

    xhr.send(data);
}
function requestApiLoja_POST(query={}, post={}, callbackSuccess="", callbackFail="", callbackAllways=""){
    var url = "/api/";
    var time = new Date();

    var objQuery={};
    objQuery.time = time.getTime();
    objQuery = Object.assign(query, objQuery);
    objQuery = new URLSearchParams(objQuery).toString();

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;


    xhr.addEventListener("readystatechange", function() {

        if (this.readyState === 4) {
            
            if (typeof callbackAllways == "function") {
                callbackAllways(this);
            }

            if (this.status >= 200 && this.status <= 299) {

                if (typeof callbackSuccess == "function") {
                    callbackSuccess(this.responseText);
                }

            }
    
            if (this.status < 200 || this.status > 299) {

                if (typeof callbackFail == "function") {
                    callbackFail(this.responseText);
                    return;
                }
                
                var response = JSON.parse(this.responseText);
                console.log(response);
                if (response.reload) {
                    location.reload();
                }

            }

        }

    });

    xhr.open("POST", url+'?'+objQuery);
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("TokenApiLoja", global_bodyData.tokenApiLoja);
    xhr.setRequestHeader("OrigemRequest", location.origin);
    xhr.send(JSON.stringify(post));
}

