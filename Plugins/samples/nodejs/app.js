var vorlonWrapper = require("../../../VorlonNodeWrapper");

vorlonWrapper.start("http://localhost:1337", "default", function(success, status){
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
});

