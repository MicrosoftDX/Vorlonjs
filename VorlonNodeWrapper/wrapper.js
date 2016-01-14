var urljoin = require("url-join");

(function(){
    exports.start = function(vorlonjsURL, dashboardId, callback){
        if(dashboardId == undefined){
            dashboardId = "default";
        }
        
        var XMLHttpRequest = require("xhr2");
        var xhr = new XMLHttpRequest();
        
        xhr.onload = function (){
            try {
                eval(xhr.responseText);
                VORLON.Core.StartClientSide(vorlonjsURL, dashboardId);
                callback(true, xhr.status);            
            }
            catch(e){
                callback(false, xhr.status);            
            }
        };
        
        xhr.open("get", urljoin(vorlonjsURL, "vorlon.node.js"), true);
        xhr.send();
    }
})();