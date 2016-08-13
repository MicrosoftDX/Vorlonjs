import servercontext = require("./config/vorlon.servercontext");
import vorlonServer = require("./Scripts/vorlon.server");
import vorlonDashboard = require("./Scripts/vorlon.dashboard");
import vorlonWebserver = require("./Scripts/vorlon.webServer");
import vorlonHttpProxy = require("./Scripts/vorlon.httpproxy.server");
import winstonLogger = require("./Scripts/vorlon.winstonlogger");

var context = new servercontext.VORLON.DefaultContext();

// if proxyEnvPort==true start a standalone instance of httpProxy
if (!context.httpConfig.proxyEnvPort) {
    //context.logger = new servercontext.VORLON.SimpleConsoleLogger();
    var logger = new winstonLogger.VORLON.WinstonLogger(context);
    //WEBSERVER
    var webServer = new vorlonWebserver.VORLON.WebServer(context);

    //DASHBOARD
    var dashboard = new vorlonDashboard.VORLON.Dashboard(context);

    //VORLON SERVER
    var server = new vorlonServer.VORLON.Server(context);

    //VORLON HTTPPROXY
    var HttpProxy = new vorlonHttpProxy.VORLON.HttpProxy(context, false);

    webServer.components.push(logger);
    webServer.components.push(dashboard);
    webServer.components.push(server);
    webServer.components.push(HttpProxy);
    webServer.start();
}
else {
    var serverProxy = new vorlonHttpProxy.VORLON.HttpProxy(context, true);
    serverProxy.start();
}
