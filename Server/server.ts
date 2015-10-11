import vorlonServer = require("./Scripts/vorlon.server");
import vorlonDashboard = require("./Scripts/vorlon.dashboard");
import vorlonWebserver = require("./Scripts/vorlon.webServer");
import vorlonHttpProxy = require("./Scripts/vorlon.httpproxy.server");

//WEBSERVER
var webServer = new vorlonWebserver.VORLON.WebServer();

//DASHBOARD
var dashboard = new vorlonDashboard.VORLON.Dashboard();

//VORLON SERVER
var server = new vorlonServer.VORLON.Server();

//VORLON HTTPPROXY
var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(false);

webServer.components.push(dashboard);
webServer.components.push(server);
webServer.components.push(HttpProxy);
webServer.start();

// comment above to deploy a standalone instance of httpProxy
// and uncomment the following

/*import httpproxyServer = require("./Scripts/vorlon.httpproxy.server");

var server = new httpproxyServer.VORLON.HttpProxy(true);
server.start();*/
