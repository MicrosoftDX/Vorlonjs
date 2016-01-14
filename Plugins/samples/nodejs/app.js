var vorlon = require("./vorlon-nodejs-plugins.max.js");

vorlon.Core.StartClientSide("http://localhost:1337", "default");

// var XMLHttpRequest = require("xhr2");
// var xhr = new XMLHttpRequest();
// xhr.onload = function (){
//     eval(xhr.responseText);
//     VORLON.Core.StartClientSide("http://localhost:1337", "default");
// };
// xhr.open("get", "http://localhost:1337/vorlon.node.js", true);
// xhr.send();



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