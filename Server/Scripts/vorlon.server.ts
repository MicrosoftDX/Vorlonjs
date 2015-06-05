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

        constructor() {
            //LOGS      
            winston.cli();
            this._log = new winston.Logger({
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
                    new winston.transports.Console({
                        level: 'debug',
                        handleExceptions: true,
                        json: false,
                        colorize: true
                    }),
                    new winston.transports.File({ filename: 'vorlonjs.log' })
                ],
                exceptionHandlers: [
                    new winston.transports.File({ filename: 'exceptions.log', timestamp: true, maxsize: 1000000 })
                ],
                exitOnError: false
            });

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
        }

        public addRoutes(app: express.Express): void {
            app.get("/api/createsession",(req: any, res: any) => {
                this.json(res, this.guid());
            });

            app.get("/api/reset/:idSession", (req: any, res: any) => {
                var session = this.sessions[req.params.idSession];
                if(session && session.connectedClients){
                    for (var client in session.connectedClients) {
                        delete session.connectedClients[client];
                    }
                }
                delete this.sessions[req.params.idSession];
                res.writeHead(200, {  });
                res.end();
            });

            app.get("/api/getclients/:idSession",(req: any, res: any) => {
                var session = this.sessions[req.params.idSession];
                var clients = new Array();
                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if(currentclient.opened) {
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

            app.get("/api/range/:idsession/:idplugin/:from/:to",(req: any, res: any) => {
                this._redisApi.lrange(req.params.idsession + req.params.idplugin, req.params.from, req.params.to,(err: any, reply: any) => {
                    this._log.info("API : Get Range data from : " + req.params.from + " to " + req.params.to + " = " + reply, { type: "API", session: req.params.idsession });
                    this.json(res, reply);
                });
            });

            app.post("/api/push",(req: any, res: any) => {
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

            app.get("/vorlon.max.js/",(req: any, res: any) => {
              res.redirect("/vorlon.max.js/default");
            });

            app.get("/vorlon.max.js/:idsession",(req: any, res: any) => {
                this._sendVorlonJSFile(false, req, res);
            });

            app.get("/vorlon.js/",(req: any, res: any) => {
              res.redirect("/vorlon.js/default");
            });

            app.get("/vorlon.js/:idsession",(req: any, res: any) => {
                this._sendVorlonJSFile(true, req, res);
            });
            
            app.get("/vorlon.max.autostartdisabled.js/",(req: any, res: any) => {
              this._sendVorlonJSFile(false, req, res, false);
            });
            
             app.get("/vorlon.autostartdisabled.js/",(req: any, res: any) => {
              this._sendVorlonJSFile(true, req, res, false);
            });

            //DisplayLogs
            winstonDisplay(app, this._log);
        }

        private _sendVorlonJSFile(ismin: boolean, req: any, res: any, autostart:boolean = true){
            //Read Socket.io file
            var javascriptFile: string;
                            
            fs.readFile(path.join(__dirname, "../public/catalog.json"), "utf8", (err, catalogdata) => {
                if (err) {
                    this._log.error("ROUTE : Error reading catalon.json file");
                    return;
                }
                    
                var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
                console.log(catalogstring);
                var catalog = JSON.parse(catalogstring);
                var vorlonpluginfiles: string = "";
                var javascriptFile: string = "";
                
                
                //read the socket.io file if needed
                if(catalog.includeSocketIO){
                    javascriptFile += fs.readFileSync(path.join(__dirname, "../public/javascripts/socket.io-1.3.5.js"));
                }

                if(ismin){
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.js"));
                }
                else{
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.max.js"));
                }
                
                for(var pluginid = 0; pluginid < catalog.plugins.length; pluginid++){
                    var plugin = catalog.plugins[pluginid];
                    
                    //Read Vorlon.js file
                    if(ismin){
                        vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".min.js"));
                    }
                    else{
                        vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".js"));
                    }
                }
                
                vorlonpluginfiles = vorlonpluginfiles.replace('"vorlon/plugins"', '"http://' + req.headers.host + '/vorlon/plugins"');
                javascriptFile += "\r" + vorlonpluginfiles;
                
                if(autostart){
                    javascriptFile += "\r (function() { VORLON.Core.Start('http://" + req.headers.host + "/', '" + req.params.idsession + "'); }());";
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
			if (redisConfig.fackredis === false)
			{
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
                //this._log.warn("CLIENT helo " + message);
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
                    this._log.info("PLUGIN : Send Refresh clientlist to dashboard (" + client.displayId + ")[" + data.ua + "] on sessionid : " + metadata.sessionId + " socketid = " + socket.id, { type: "PLUGIN", session: metadata.sessionId });
                    if (dashboard != undefined) {
                        dashboard.emit("refreshclients");
                    }

                    this._log.info("PLUGIN : New client (" + client.displayId + ")[" + data.ua + "] on sessionid : " + metadata.sessionId + " socketid = " + socket.id, { type: "PLUGIN", session: metadata.sessionId });
                }
                else {
                    client.socket = socket;
                    client.opened = true;
                    if (dashboard != undefined) {
                        dashboard.emit("refreshclients");
                    }
                    this._log.info("PLUGIN : Client Reconnect (" + client.displayId + ")[" + data.ua + "] on sessionid : " + metadata.sessionId + " socketid = " + socket.id, { type: "PLUGIN", session: metadata.sessionId });
                }

                this._log.info("PLUGIN : Number clients in session : " + session.nbClients + 1, { type: "PLUGIN", session: metadata.sessionId });
                
                //If dashboard already connected to this socket send "helo" else wait
                if ((metadata.clientId != "") && (metadata.clientId == session.currentClientId)) {
                    this._log.info("PLUGIN : Send helo to client to open socket : " + metadata.clientId, { type: "PLUGIN", session: metadata.sessionId });
                    socket.emit("helo", metadata.clientId);
                }
                else {
                    this._log.info("PLUGIN : New client (" + client.displayId + ") wait...", { type: "PLUGIN", session: metadata.sessionId });
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
                        if (receiveMessage.metadata.clientId === session.currentClientId) {
                            dashboard.emit("message", message);
                            //this._log.info("PLUGIN : " + receiveMessage._pluginID + " message receive from clientid " + receiveMessage._clientId + " send to dashboard for session id :" + receiveMessage._sessionId, { type: "PLUGIN", session: receiveMessage._sessionId });
                        }
                        else {
                            this._log.error("PLUGIN : " + receiveMessage.metadata.pluginID + " message from client that must be disconnected clientID = " + receiveMessage.metadata.clientId + " this session " + session.currentClientId, { type: "PLUGIN", session: receiveMessage.metadata.sessionId });
                        }
                    }
                }
                else {
                    this._log.error("PLUGIN : No dashboard for session id :" + receiveMessage.metadata.sessionId, { type: "PLUGIN", session: receiveMessage.metadata.sessionId });
                }
            });

            socket.on("waitingevents",(message: string) => {
                //this._log.warn("CLIENT waitingevents " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var dashboard = this.dashboards[receiveMessage.metadata.sessionId];
                if (dashboard != null) {
                    dashboard.emit("waitingevents", message);
                    var session = this.sessions[receiveMessage.metadata.sessionId];
                    var client = session.connectedClients[receiveMessage.metadata.clientId];
                    client.waitingevents = receiveMessage.metadata.waitingEvents;
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
                            this._log.info("PLUGIN : Delete client socket " + socket.id + " for session " + session + "(" + session + ") ", { type: "PLUGIN", session: session });
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
                            this._log.info("PLUGIN : Send RefreshClients to Dashboard " + socket.id + " for session " + session + "(" + session + ") ", { type: "PLUGIN", session: session });
                            if (this.dashboards[session])
                            {
                                this.dashboards[session].emit("refreshclients");
                            }
                            this._log.info("PLUGIN : Client Close " + socket.id + " for session " + session + "(" + session + ") ", { type: "PLUGIN", session: session });
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
                    this._log.info("DASHBOARD : New Dashboard with session id : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                }
                else {
                    this._log.info("DASHBOARD : Reconnect on session id : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                }

                this.dashboards[metadata.sessionId] = socket;
                dashboard = socket;

                //if client listen by dashboad send helo to selected client
                if (metadata.listenClientId !== "") {
                    this._log.info("DASHBOARD : Client selected for this dashboad = " + metadata.listenClientId, { type: "DASHBOARD", session: metadata.sessionId });
                    var session = this.sessions[metadata.sessionId];
                    if (session != undefined) {
                        this._log.info("DASHBOARD : Change currentClient on dashboar" + metadata.clientId, { type: "DASHBOARD", session: metadata.sessionId });
                        session.currentClientId = metadata.listenClientId;

                        for (var clientId in session.connectedClients) {
                            var client = session.connectedClients[clientId]
                            if (client.clientId === metadata.listenClientId) {
                                if (client.socket != null) {
                                    client.socket.emit("helo", metadata.listenClientId);
                                    this._log.info("DASHBOARD : Send helo to this socketid : " + client.socket.id, { type: "DASHBOARD", session: metadata.sessionId });
                                }
                            }
                            else {
                                this._log.info("DASHBOARD : Wait this socketid again ... (" + client.socket.id + ")", { type: "DASHBOARD", session: metadata.sessionId });
                            }
                        }

                        //Send Helo to DashBoard
                        this._log.info("DASHBOARD : Send helo to Dashboard on this sessionid : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                        socket.emit("helo", metadata.listenClientId);
                    }
                }
                else {
                    this._log.info("DASHBOARD : No client selected for this dashboad on this session : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                }
            });

            socket.on("protocol",(message: string) => {
                //this._log.warn("DASHBOARD protocol " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = this.dashboards[metadata.sessionId];
                if (dashboard == null) {
                    this._log.error("DASHBOARD : No Dashboard to send message for sessionid : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                }
                else {
                    dashboard.emit("message", message);
                    this._log.info("DASHBOARD : Dashboard send message for sessionid : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                }
            });

            socket.on("identify",(message: string) => {
                //this._log.warn("DASHBOARD identify " + message);
                var receiveMessage = <VorlonMessage>JSON.parse(message);
                var metadata = receiveMessage.metadata;
                this._log.info("DASHBOARD : Received identify for sessionid : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                var session = this.sessions[metadata.sessionId];

                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if(currentclient.opened){
                            currentclient.socket.emit("identify", currentclient.displayId);
                            this._log.info("DASHBOARD : Dashboard send identify " + currentclient.displayId + " to socketid : " + currentclient.socket.id, { type: "DASHBOARD", session: metadata.sessionId });
                            nbClients++;
                        }
                    }
                    this._log.info("DASHBOARD : Send " + session.nbClients + " identify(s)", { type: "DASHBOARD", session: metadata.sessionId });
                }
                else {
                    this._log.error("DASHBOARD : No client for sessionid : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
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
                            this._log.info("DASHBOARD : Send message to socketid : " + client.socket.id, { type: "DASHBOARD", session: metadata.sessionId });
                        }
                    }
                    this._log.info("DASHBOARD : Send " + arrayClients.nbClients + " message(s)", { type: "DASHBOARD", session: metadata.sessionId });
                }
                else {
                    this._log.error("DASHBOARD : No client for sessionid : " + metadata.sessionId, { type: "DASHBOARD", session: metadata.sessionId });
                }
            });

            socket.on("disconnect",(message: string) => {      
                //this._log.warn("DASHBOARD disconnect " + message);          
                //Delete dashboard session
                for (var dashboard in this.dashboards) {
                    if (this.dashboards[dashboard].id === socket.id) {
                        delete this.dashboards[dashboard];
                        this._log.info("DASHBOARD : Delete dashboard socket " + socket.id + " for session " + dashboard + "(" + dashboard + ")", { type: "DASHBOARD", dashboard: dashboard });
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
        command?: string;
        data?: any
    }
}
