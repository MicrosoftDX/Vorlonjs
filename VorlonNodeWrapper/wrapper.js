var urljoin = require("url-join");
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./vorlon-storage');

(function(){
    exports.start = function(vorlonjsURL, dashboardId, callback){
        if(dashboardId == undefined){
            dashboardId = "default";
        }
        
        var XMLHttpRequest = require("xhr2");
        var xhr = new XMLHttpRequest();
        var vorlonNodeUrl = urljoin(vorlonjsURL, "vorlon.node.max.js/" + dashboardId);
        
        xhr.onload = function (){
            try {
                eval(xhr.responseText);
                VORLON.Core.StartClientSide(vorlonjsURL, dashboardId);                
                callback(true, "n/a");            
            }
            catch(e){
                console.log("Wrapper Vorlon.js error : " + e.message);
                callback(false, e.message);            
            }
        };
        
        xhr.open("get", vorlonNodeUrl, true);
        xhr.send();
    }
})();