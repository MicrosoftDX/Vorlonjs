import redis = require("redis");
import express = require("express");
import winston = require("winston");
import http = require("http");
import socketio = require("socket.io");
import fs = require("fs");
import path = require("path");
var fakeredis = require("fakeredis");

var winstonDisplay = require("winston-logs-display");
import redisConfigImport = require("../config/vorlon.redisconfig");
var redisConfig = redisConfigImport.VORLON.RedisConfig;
import httpConfig = require("../config/vorlon.httpconfig");
import logConfig = require("../config/vorlon.logconfig"); 
import baseURLConfig = require("../config/vorlon.baseurlconfig"); 

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import tools = require("./vorlon.tools");

export module VORLON {
    export class Server implements iwsc.VORLON.IWebServerComponent {
        public sessions = new Array<Session>();
        public dashboards = new Array<SocketIO.Socket>();

        private _io: any;
        private _redisApi: any;
        private _log: winston.LoggerInstance;
        private http: httpConfig.VORLON.HttpConfig;
        private logConfig: logConfig.VORLON.LogConfig;
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;

        constructor() {
            this.logConfig = new logConfig.VORLON.LogConfig();
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
            
            //LOGS      
            winston.cli();
            this._log = new winston.Logger(<any>{
                levels: {
                    info: 0,
                    warn: 1,
                    error: 2,
                    verbose: 3,
                    api: 4,
                    dashboard: 5,
                    plugin: 6
                },
                transports: [
                    new winston.transports.File(<any>{ filename: this.logConfig.vorlonLogFile, level: this.logConfig.level})
                ],
                exceptionHandlers: [
                    new winston.transports.File(<any>{ filename: this.logConfig.exceptionsLogFile, timestamp: true, maxsize: 1000000 })
                ],
                exitOnError: false
            });

            if (this.logConfig.enableConsole) {
                this._log.add(winston.transports.Console, <any>{
                        level: this.logConfig.level,
                        handleExceptions: true,
                        json: false,
                        timestamp: function() {
                            var date:Date = new Date();
                            return date.getFullYear() + "-" + 
                            date.getMonth() + "-" +
                            date.getDate() + " " +
                            date.getHours() + ":" + 
                            date.getMinutes() + ":" +
                            date.getSeconds();
                        },
                        colorize: true
                    });
            }

            winston.addColors({
                info: 'green',
                warn: 'cyan',
                error: 'red',
                verbose: 'blue',
                api: 'gray',
                dashboard: 'pink',
                plugin: 'yellow'
            });

            this._log.cli();
           
            //Redis
            if (redisConfig.fackredis === true) {
                this._redisApi = fakeredis.createClient();
            }
            else {
                this._redisApi = redis.createClient(redisConfig._redisPort, redisConfig._redisMachine);
                this._redisApi.auth(redisConfig._redisPassword,(err) => {
                    if (err) { throw err; }
                });
            }
            //SSL
            this.http = new httpConfig.VORLON.HttpConfig();
        }

        public addRoutes(app: express.Express, passport: any): void {
            app.get(this.baseURLConfig.baseURL + "/api/createsession",(req: any, res: any) => {
                this.json(res, this.guid());
            });

            app.get(this.baseURLConfig.baseURL + "/api/reset/:idSession",(req: any, res: any) => {
                var session = this.sessions[req.params.idSession];
                if (session && session.connectedClients) {
                    for (var client in session.connectedClients) {
                        delete session.connectedClients[client];
                    }
                }
                delete this.sessions[req.params.idSession];
                res.writeHead(200, {});
                res.end();
            });

            app.get(this.baseURLConfig.baseURL + "/api/getclients/:idSession",(req: any, res: any) => {
                var session = this.sessions[req.params.idSession];
                var clients = new Array();
                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if (currentclient.opened) {
                            var name = tools.VORLON.Tools.GetOperatingSystem(currentclient.ua);
                            clients.push({ "clientid": currentclient.clientId, "displayid": currentclient.displayId, "waitingevents": currentclient.waitingevents, "name": name });
                            nbClients++;
                        }
                    }
                    this._log.info("API : GetClients nb client " + nbClients + " in session " + req.params.idSession, { type: "API", session: req.params.idSession });
                }
                else {
                    this._log.warn("API : No client in session " + req.params.idSession, { type: "API", session: req.params.idSession });
                }
                //Add header no-cache
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.header('Expires', '-1');
                res.header('Pragma', 'no-cache');
                this.json(res, clients);
            });

            app.get(this.baseURLConfig.baseURL + "/api/range/:idsession/:idplugin/:from/:to",(req: any, res: any) => {
                this._redisApi.lrange(req.params.idsession + req.params.idplugin, req.params.from, req.params.to,(err: any, reply: any) => {
                    this._log.info("API : Get Range data from : " + req.params.from + " to " + req.params.to + " = " + reply, { type: "API", session: req.params.idsession });
                    this.json(res, reply);
                });
            });

            app.post(this.baseURLConfig.baseURL + "/api/push",(req: any, res: any) => {
                var receiveMessage = req.body;
                this._log.info("API : Receve data to log : " + JSON.stringify(req.body), { type: "API", session: receiveMessage._idsession });
                this._redisApi.rpush([receiveMessage._idsession + receiveMessage.id, receiveMessage.message], err => {
                    if (err) {
                        this._log.error("API : Error data log : " + err, { type: "API", session: receiveMessage._idsession });
                    } else {
                        this._log.info("API : Push data ok", { type: "API", session: receiveMessage._idsession });
                    }
                });
                this.json(res, {});
            });

            app.get(this.baseURLConfig.baseURL + "/vorlon.max.js/",(req: any, res: any) => {
                res.redirect("/vorlon.max.js/default");
            });

            app.get(this.baseURLConfig.baseURL + "/vorlon.max.js/:idsession",(req: any, res: any) => {
                this._sendVorlonJSFile(false, req, res);
            });

            app.get(this.baseURLConfig.baseURL + "/vorlon.js",(req: any, res: any) => {
                res.redirect(this.baseURLConfig.baseURL + "/vorlon.js/default");
            });

            app.get(this.baseURLConfig.baseURL + "/vorlon.js/:idsession",(req: any, res: any) => {
                this._sendVorlonJSFile(true, req, res);
            });

            app.get(this.baseURLConfig.baseURL + "/vorlon.max.autostartdisabled.js",(req: any, res: any) => {
                this._sendVorlonJSFile(false, req, res, false);
            });

            app.get(this.baseURLConfig.baseURL + "/vorlon.autostartdisabled.js",(req: any, res: any) => {
                this._sendVorlonJSFile(true, req, res, false);
            });
            
            app.get(this.baseURLConfig.baseURL + "/config.json",(req: any, res: any) => {
                this._sendConfigJson(req, res);
            });

            //DisplayLogs
            winstonDisplay(app, this._log);
        }
        
        private _sendConfigJson(req: any, res: any) {
           
            fs.readFile(path.join(__dirname, "../config.json"), "utf8",(err, catalogdata) => {
                if (err) {
                    this._log.error("ROUTE : Error reading config.json file");
                    return;
                }
                
                var catalog = JSON.parse(catalogdata.replace(/^\uFEFF/, ''));
                
                //remove auth data to not send username and password outside ;)
                if(catalog.activateAuth){
                    delete catalog.activateAuth;
                }
                if(catalog.username){
                    delete catalog.username;
                }
                if(catalog.password){
                    delete catalog.password;
                }
                
                catalogdata = JSON.stringify(catalog);
                res.header('Content-Type', 'application/json');
                res.send(catalogdata);
            });
        }

        private _sendVorlonJSFile(ismin: boolean, req: any, res: any, autostart: boolean = true) {
            //Read Socket.io file
            var javascriptFile: string;

            fs.readFile(path.join(__dirname, "../config.json"), "utf8",(err, catalogdata) => {
                if (err) {
                    this._log.error("ROUTE : Error reading config.json");
                    return;
                }

                var configstring = catalogdata.toString().replace(/^\uFEFF/, '');
                var baseUrl = this.baseURLConfig.baseURL;
                var catalog = JSON.parse(configstring);
                var vorlonpluginfiles: string = "";
                var javascriptFile: string = "";
                                
                javascriptFile += 'var vorlonBaseURL="' + baseUrl + '";\n';

                //read the socket.io file if needed
                if (catalog.includeSocketIO) {
                    javascriptFile += fs.readFileSync(path.join(__dirname, "../public/javascripts/socket.io-1.3.6.js"));
                }

                if (ismin) {
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.js"));
                }
                else {
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.max.js"));
                }

                for (var pluginid = 0; pluginid < catalog.plugins.length; pluginid++) {
                    var plugin = catalog.plugins[pluginid];
                    if (plugin && plugin.enabled){
                        //Read Vorlon.js file
                        if (ismin) {
                            vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".client.min.js"));
                        }
                        else {
                            vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".client.js"));
                        }
                    }
                }

                vorlonpluginfiles = vorlonpluginfiles.replace('"vorlon/plugins"', '"' + this.http.protocol + '://' + req.headers.host + baseUrl + '/vorlon/plugins"');
                javascriptFile += "\r" + vorlonpluginfiles;

                if (autostart) {
                    javascriptFile += "\r (function() { VORLON.Core.StartClientSide('" + this.http.protocol + "://" + req.headers.host + "/', '" + req.params.idsession + "'); }());";
                }

                res.header('Content-Type', 'application/javascript');
                res.send(javascriptFile);
            });
        }

        public start(httpServer: http.Server): void {
            //SOCKET.IO
            var io = socketio(httpServer);
            this._io = io;

            //Redis
            var redisConfig = redisConfigImport.VORLON.RedisConfig;
            if (redisConfig.fackredis === false) {
                var pub = redis.createClient(redisConfig._redisPort, redisConfig._redisMachine);
                pub.auth(redisConfig._redisPassword);
                var sub = redis.createClient(redisConfig._redisPort, redisConfig._redisMachine);
                sub.auth(redisConfig._redisPassword);
                var socketredis = require("socket.io-redis");
                io.adapter(socketredis({ pubClient: pub, subClient: sub }));
            }
            //Listen on /
            io.on("connection", socket => {
                this.addClient(socket);
            });

            //Listen on /dashboard
            var dashboardio = io
                .of("/dashboard")
                .on("connection", socket => {
                this.addDashboard(socket);
            });
        }

        public get io(): any {
            return this._io;
        }

        public set io(io: any) {
            this._io = io;
        }

        private guid(): string {
            return "xxxxxxxx".replace(/[xy]/g, c => {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        private json(res, data) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            if (typeof data === "string")
                res.write(data);
            else
                res.write(JSON.stringify(data));
            res.end();
        }

        
        public addClient(socket: SocketIO.Socket): void {
            socket.on("helo",(message: string) => {
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var data = receiveMessage.data;
                var session = this.sessions[metadata.sessionId];

                if (session == null) {
                    session = new Session();
                    this.sessions[metadata.sessionId] = session;
                }

                var client = <Client>session.connectedClients[metadata.clientId];
                var dashboard = this.dashboards[metadata.sessionId];
                if (client == undefined) {
                    var client = new Client(metadata.clientId, data.ua, socket, ++session.nbClients);
                    session.connectedClients[metadata.clientId] = client;
                    this._log.info(formatLog("PLUGIN", "Send Refresh clientlist to dashboard (" + client.displayId + ")[" + data.ua + "] socketid = " + socket.id, receiveMessage));
                    if (dashboard != undefined) {
                        dashboard.emit("refreshclients");
                    }

                    this._log.info(formatLog("PLUGIN", "New client (" + client.displayId + ")[" + data.ua + "] socketid = " + socket.id, receiveMessage));
                }
                else {
                    client.socket = socket;
                    client.opened = true;
                    if (dashboard != undefined) {
                        dashboard.emit("refreshclients");
                    }
                    this._log.info(formatLog("PLUGIN", "Client Reconnect (" + client.displayId + ")[" + data.ua + "] socketid=" + socket.id, receiveMessage));
                }

                this._log.info(formatLog("PLUGIN", "Number clients in session : " + (session.nbClients + 1), receiveMessage));
                
                //If dashboard already connected to this socket send "helo" else wait
                if ((metadata.clientId != "") && (metadata.clientId == session.currentClientId)) {
                    this._log.info(formatLog("PLUGIN", "Send helo to client to open socket : " + metadata.clientId, receiveMessage));
                    socket.emit("helo", metadata.clientId);
                }
                else {
                    this._log.info(formatLog("PLUGIN", "New client (" + client.displayId + ") wait...", receiveMessage));
                }
            });

            socket.on("message",(message: string) => {
                //this._log.warn("CLIENT message " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var dashboard = this.dashboards[receiveMessage.metadata.sessionId];
                if (dashboard != null) {
                    var session = this.sessions[receiveMessage.metadata.sessionId];
                    if (receiveMessage.metadata.clientId === "") {
                        //No broadcast id _clientID ===""
                        //this.dashboards[receiveMessage._sessionId].emit("message", message);
                        //***
                        //this._log.info("PLUGIN : " + receiveMessage._pluginID + " message receive without clientId sent to dashboard for session id :" + receiveMessage._sessionId, { type: "PLUGIN", session: receiveMessage._sessionId });
                    }
                    else {
                        //Send message if _clientID = clientID selected by dashboard
                        if (session && receiveMessage.metadata.clientId === session.currentClientId) {
                            dashboard.emit("message", message);
                            this._log.info(formatLog("PLUGIN", "PLUGIN=>DASHBOARD", receiveMessage));
                        }
                        else {
                            this._log.error(formatLog("PLUGIN", "must be disconnected", receiveMessage));
                        }
                    }
                }
                else {
                    this._log.error(formatLog("PLUGIN", "no dashboard found", receiveMessage));
                }
            });

            socket.on("waitingevents",(message: string) => {
                //this._log.warn("CLIENT waitingevents " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var dashboard = this.dashboards[receiveMessage.metadata.sessionId];
                if (dashboard != null) {
                    dashboard.emit("waitingevents", message);
                    var session = this.sessions[receiveMessage.metadata.sessionId];
                    if (session && session.connectedClients) {
                        var client = session.connectedClients[receiveMessage.metadata.clientId];
                        client.waitingevents = receiveMessage.metadata.waitingEvents;
                    }
                }
            });

            socket.on("disconnect",(message: string) => {
                //this._log.warn("CLIENT disconnect " + message);
                for (var sessionId in this.sessions) {
                    var session = this.sessions[sessionId]
                    for (var clientId in session.connectedClients) {
                        var client = session.connectedClients[clientId];
                        if (client.socket.id === socket.id) {
                            client.opened = false;
                            this._log.info(formatLog("PLUGIN", "Delete client socket " + socket.id));
                        }
                    }
                }
            });

            socket.on("clientclosed",(message: string) => {
                //this._log.warn("CLIENT clientclosed " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                for (var session in this.sessions) {
                    for (var client in this.sessions[session].connectedClients) {
                        if (receiveMessage.data.socketid === this.sessions[session].connectedClients[client].socket.id) {
                            this.sessions[session].connectedClients[client].opened = false;
                            if (this.dashboards[session]) {
                                this._log.info(formatLog("PLUGIN", "Send RefreshClients to Dashboard " + socket.id, receiveMessage));
                                this.dashboards[session].emit("refreshclients");
                            } else {
                                this._log.info(formatLog("PLUGIN", "NOT sending RefreshClients, no Dashboard " + socket.id, receiveMessage));
                            }
                            this._log.info(formatLog("PLUGIN", "Client Close " + socket.id, receiveMessage));
                        }
                    }
                }
            });
        }

        public addDashboard(socket: SocketIO.Socket): void {
            socket.on("helo",(message: string) => {
                //this._log.warn("DASHBOARD helo " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = this.dashboards[metadata.sessionId];

                if (dashboard == null) {
                    this._log.info(formatLog("DASHBOARD", "New Dashboard", receiveMessage));
                }
                else {
                    this._log.info(formatLog("DASHBOARD", "Reconnect", receiveMessage));
                }

                this.dashboards[metadata.sessionId] = socket;
                dashboard = socket;

                //if client listen by dashboard send helo to selected client
                if (metadata.listenClientId !== "") {
                    this._log.info(formatLog("DASHBOARD", "Client selected for :" + metadata.listenClientId, receiveMessage));
                    var session = this.sessions[metadata.sessionId];
                    if (session != undefined) {
                        this._log.info(formatLog("DASHBOARD", "Change currentClient " + metadata.clientId, receiveMessage));
                        session.currentClientId = metadata.listenClientId;

                        for (var clientId in session.connectedClients) {
                            var client = session.connectedClients[clientId]
                            if (client.clientId === metadata.listenClientId) {
                                if (client.socket != null) {
                                    this._log.info(formatLog("DASHBOARD", "Send helo to socketid :" + client.socket.id, receiveMessage));
                                    client.socket.emit("helo", metadata.listenClientId);
                                    
                                }
                            }
                            else {
                                this._log.info(formatLog("DASHBOARD", "Wait for socketid (" + client.socket.id + ")", receiveMessage));
                            }
                        }

                        //Send Helo to DashBoard
                        this._log.info(formatLog("DASHBOARD", "Send helo to Dashboard", receiveMessage));
                        socket.emit("helo", metadata.listenClientId);
                    }
                }
                else {
                    this._log.info(formatLog("DASHBOARD", "No client selected for this dashboard"));
                }
            });

            socket.on("protocol",(message: string) => {
                //this._log.warn("DASHBOARD protocol " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = this.dashboards[metadata.sessionId];
                if (dashboard == null) {
                    this._log.error(formatLog("DASHBOARD", "No Dashboard to send message", receiveMessage));
                }
                else {
                    dashboard.emit("message", message);
                    this._log.info(formatLog("DASHBOARD", "Dashboard send message", receiveMessage));
                }
            });

            socket.on("identify",(message: string) => {
                //this._log.warn("DASHBOARD identify " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                this._log.info(formatLog("DASHBOARD", "Identify clients", receiveMessage));
                var session = this.sessions[metadata.sessionId];

                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if (currentclient.opened) {
                            currentclient.socket.emit("identify", currentclient.displayId);
                            this._log.info(formatLog("DASHBOARD", "Dashboard send identify " + currentclient.displayId + " to socketid : " + currentclient.socket.id, receiveMessage));
                            nbClients++;
                        }
                    }
                    this._log.info(formatLog("DASHBOARD", "Send " + session.nbClients + " identify(s)", receiveMessage));
                }
                else {
                    this._log.error(formatLog("DASHBOARD", " No client to identify...", receiveMessage));
                }
            });

            socket.on("message",(message: string) => {
                //this._log.warn("DASHBOARD message " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var arrayClients = this.sessions[metadata.sessionId];

                if (arrayClients != null) {
                    for (var clientId in arrayClients.connectedClients) {
                        var client = arrayClients.connectedClients[clientId];
                        if (metadata.listenClientId === client.clientId) {
                            client.socket.emit("message", message);
                            this._log.info(formatLog("DASHBOARD", "DASHBOARD=>PLUGIN", receiveMessage));
                            //this._log.info(formatLog("DASHBOARD", "Send to client socketid : " + client.socket.id, receiveMessage));
                        }
                    }
                    //this._log.info("DASHBOARD : " + metadata.sessionId + " Send " + (receiveMessage.command ? receiveMessage.command: "") + " to " + arrayClients.nbClients + " client(s)");
                }
                else {
                    this._log.error(formatLog("DASHBOARD", "No client for message", receiveMessage));
                }
            });

            socket.on("disconnect",(message: string) => {      
                //this._log.warn("DASHBOARD disconnect " + message);          
                //Delete dashboard session
                for (var dashboard in this.dashboards) {
                    if (this.dashboards[dashboard].id === socket.id) {
                        delete this.dashboards[dashboard];
                        this._log.info(formatLog("DASHBOARD", "Delete dashboard " + dashboard + " socket " + socket.id));
                    }
                }

                //Send disconnect to all client
                for (var session in this.sessions) {
                    for (var client in this.sessions[session].connectedClients) {
                        this.sessions[session].connectedClients[client].socket.emit("stoplisten");
                    }
                }
            });
        }
    }

    export class Session {
        public currentClientId = "";
        public nbClients = -1;
        public connectedClients = new Array<Client>();
    }

    export class Client {
        public clientId: string;
        public displayId: number;
        public socket: SocketIO.Socket;
        public opened: boolean;
        public waitingevents: number;
        public ua: string;

        constructor(clientId: string, ua: string, socket: SocketIO.Socket, displayId: number, opened: boolean = true) {
            this.clientId = clientId;
            this.ua = ua;
            this.socket = socket;
            this.displayId = displayId;
            this.opened = opened;
            this.waitingevents = 0;
        }
    }

    export interface VorlonMessageMetadata {
        pluginID: string;
        side: number;
        sessionId: string;
        clientId: string;
        listenClientId: string;
        waitingEvents?: number;
    }

    export interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string
        data?: any
    }

    function formatLog(type: string, message: string, vmessage?: VorlonMessage) {
        var buffer = [];
        buffer.push(type);
        if (type.length < 10) {
            for (var i = type.length; i < 10; i++) {
                buffer.push(" ");
            }
        }
        buffer.push(" : ");

        if (vmessage) {
            if (vmessage.metadata && vmessage.metadata.sessionId)
                buffer.push(vmessage.metadata.sessionId + " ");
        }

        if (message)
            buffer.push(message + " ");

        if (vmessage) {
            if (vmessage.metadata) {
                if (vmessage.metadata.pluginID) {
                    buffer.push(vmessage.metadata.pluginID);
                    if (vmessage.command)
                        buffer.push(":" + vmessage.command)

                    buffer.push(" ");
                }

                if (vmessage.metadata.clientId) {
                    buffer.push(vmessage.metadata.clientId);
                }
            }
        }

        
        return buffer.join("");
    }

}
