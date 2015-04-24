import vorlonServer = require("./Scripts/vorlon.server");
import vorlonDashboard = require("./Scripts/vorlon.dashboard");
import vorlonWebserver = require("./Scripts/vorlon.webServer");

//WEBSERVER
var webServer = new vorlonWebserver.VORLON.WebServer();

//DASHBOARD
var dashboard = new vorlonDashboard.VORLON.Dashboard();

//VORLON SERVER
var server = new vorlonServer.VORLON.Server();

webServer.components.push(dashboard);
webServer.components.push(server);
webServer.start();
