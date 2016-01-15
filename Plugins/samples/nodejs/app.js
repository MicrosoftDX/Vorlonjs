var vorlonWrapper = require("../../../VorlonNodeWrapper");
var serverUrl = "http://localhost:1337";
var dashboardSession = "default";

vorlonWrapper.start(serverUrl, dashboardSession, function(success, status){
    if(success){
        var a = 2;
        var first = function(){
            setTimeout(
                function(){
                    console.log(a++);
                    second();
                },
                1000
            );
        } 

        var second = function(){
            setTimeout(
                function(){
                    console.log(a++);
                    first();
                },
                1000
            );
        }

        first();
    }
    else {
        console.log("Vorlon.js server not found (" + serverUrl + "/" + dashboardSession);
    }
});

