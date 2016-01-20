var urljoin = require("url-join");

(function(){
    exports.start = function(vorlonjsURL, dashboardId, async, callback){
        if(dashboardId == undefined){
            dashboardId = "default";
        }
                       
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        var vorlonNodeUrl = urljoin(vorlonjsURL, "vorlon.node.max.js/" + dashboardId);
        
        if (async) {
            xhr.onload = function (){
                try {
                    eval(xhr.responseText);
                    VORLON.Core.StartClientSide(vorlonjsURL, dashboardId);                
                    if (callback) {
                        callback(true, "n/a");
                    }            
                }
                catch(e){
                    console.log("Wrapper Vorlon.js error : " + e.message);
                    if (callback) {
                        callback(false, e.message);
                    }            
                }
            };
        }
        
        xhr.open("get", vorlonNodeUrl, async);
        xhr.send();
        
        if (!async) {
            try {
                eval(xhr.responseText);
                VORLON.Core.StartClientSide(vorlonjsURL, dashboardId);                
                if (callback) {
                    callback(true, "n/a");
                }            
            }
            catch(e){
                console.log("Wrapper Vorlon.js error : " + e.message);
                if (callback) {
                    callback(false, e.message);
                }            
            }
        }
    }
})();