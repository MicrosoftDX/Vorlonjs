var urljoin = require("url-join");

(function(){
    exports.start = function(vorlonjsURL, dashboardId, callback){
        if(dashboardId == undefined){
            dashboardId = "default";
        }
        
        var XMLHttpRequest = require("xhr2");
        var xhr = new XMLHttpRequest();
        var vorlonNodeUrl = urljoin(vorlonjsURL, "vorlon.node.js/" + dashboardId);
        
        xhr.onload = function (){
            try {
                eval(xhr.responseText);
                VORLON.Core.StartClientSide(vorlonjsURL, dashboardId);
                callback(true, "n/a");            
            }
            catch(e){
                callback(false, e.message);            
            }
        };
        
        xhr.open("get", vorlonNodeUrl, true);
        xhr.send();
    }
})();