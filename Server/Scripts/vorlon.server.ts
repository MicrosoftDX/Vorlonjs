import redis = require("redis");
import express = require("express");
import winston = require("winston");
import http = require("http");
import socketio = require("socket.io");
import fs = require("fs");
import path = require("path");
var fakeredis = require("fakeredis");

var winstonDisplay = require("winston-logs-display");
import redisConfigImport = require("../config/VORLON.RedisConfig");
var redisConfig = redisConfigImport.VORLON.RedisConfig;

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");

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
                        if(currentclient.opened){
                            clients.push({ "clientid": currentclient.clientId, "displayid": currentclient.displayId, "waitingevents": currentclient.waitingevents });
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
                //Read Socket.io file
                var javascriptFile: string;
                fs.readFile(path.join(__dirname, "../public/javascripts/socket.io-1.3.5.js"),(err, data) => {
                    if (err) {
                        this._log.error("ROUTE : Error reading JS File");
                        return;
                    }
                    javascriptFile = data.toString();
                    //Read Vorlon.js one file
                    fs.readFile(path.join(__dirname, "../public/vorlon/vorlon.max.js"),(err, data) => {
                        if (err) {
                            this._log.error("ROUTE : Error reading JS File");
                            return;
                        }
                        var vorlonpluginfiles: string = data.toString();
                        vorlonpluginfiles = vorlonpluginfiles.replace('this.loadingDirectory = "Vorlon/plugins";', 'this.loadingDirectory = "http://' + req.headers.host + '/vorlon/plugins";')
                        javascriptFile += "\r" + vorlonpluginfiles;
                        javascriptFile += "\r (function() { VORLON.Core.Start('http://" + req.headers.host + "/', '" + req.params.idsession + "'); }());";
                        res.send(javascriptFile);
                    });
                });
            });

            //DisplayLogs
            winstonDisplay(app, this._log);
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
            socket.on("helo",(message: any) => {
                var receiveMessage = JSON.parse(message);
                var session = this.sessions[receiveMessage._sessionId];

                if (session == null) {
                    session = new Session();
                    this.sessions[receiveMessage._sessionId] = session;
                }

                if (session.connectedClients[receiveMessage._clientId] == undefined) {
                    session.connectedClients[receiveMessage._clientId] = new Client(receiveMessage._clientId, socket, ++session.nbClients);
                    this._log.info("PLUGIN : Send Refresh clientlist to dashboard (" + session.connectedClients[receiveMessage._clientId].displayId + ")[" + receiveMessage.ua + "] on sessionid : " + receiveMessage._sessionId + " socketid = " + socket.id, { type: "PLUGIN", session: receiveMessage._sessionId });

                    if (this.dashboards[receiveMessage._sessionId] != undefined) {
                        this.dashboards[receiveMessage._sessionId].emit("refreshclients");
                    }

                    this._log.info("PLUGIN : New client (" + session.connectedClients[receiveMessage._clientId].displayId + ")[" + receiveMessage.ua + "] on sessionid : " + receiveMessage._sessionId + " socketid = " + socket.id, { type: "PLUGIN", session: receiveMessage._sessionId });
                }
                else {
                    session.connectedClients[receiveMessage._clientId].socket = socket;
                    session.connectedClients[receiveMessage._clientId].opened = true;
                     if (this.dashboards[receiveMessage._sessionId] != undefined) {
                        this.dashboards[receiveMessage._sessionId].emit("refreshclients");
                    }
                    this._log.info("PLUGIN : Client Reconnect (" + session.connectedClients[receiveMessage._clientId].displayId + ")[" + receiveMessage.ua + "] on sessionid : " + receiveMessage._sessionId + " socketid = " + socket.id, { type: "PLUGIN", session: receiveMessage._sessionId });
                }

                this._log.info("PLUGIN : Number clients in session : " + session.nbClients + 1, { type: "PLUGIN", session: receiveMessage._sessionId });
                
                //If dashboard already connected to this socket send "helo" else wait
                if ((receiveMessage._clientId != "") && (receiveMessage._clientId == this.sessions[receiveMessage._sessionId].currentClientId)) {
                    this._log.info("PLUGIN : Send helo to client to open socket : " + receiveMessage._clientId, { type: "PLUGIN", session: receiveMessage._sessionId });
                    socket.emit("helo", receiveMessage._clientId);
                }
                else {
                    this._log.info("PLUGIN : New client (" + session.connectedClients[receiveMessage._clientId].displayId + ") wait...", { type: "PLUGIN", session: receiveMessage._sessionId });
                }
            });

            socket.on("message",(message: any) => {
                var receiveMessage = JSON.parse(message);

                if (this.dashboards[receiveMessage._sessionId] != null) {
                    if (receiveMessage._clientId === "") {
                        //No broadcast id _clientID ===""
                        //this.dashboards[receiveMessage._sessionId].emit("message", message);
                        //***
                        //this._log.info("PLUGIN : " + receiveMessage._pluginID + " message receive without clientId sent to dashboard for session id :" + receiveMessage._sessionId, { type: "PLUGIN", session: receiveMessage._sessionId });
                    }
                    else {
                        //Send message if _clientID = clientID selected by dashboard
                        if (receiveMessage._clientId === this.sessions[receiveMessage._sessionId].currentClientId) {
                            this.dashboards[receiveMessage._sessionId].emit("message", message);
                            //this._log.info("PLUGIN : " + receiveMessage._pluginID + " message receive from clientid " + receiveMessage._clientId + " send to dashboard for session id :" + receiveMessage._sessionId, { type: "PLUGIN", session: receiveMessage._sessionId });
                        }
                        else {
                            this._log.error("PLUGIN : " + receiveMessage._pluginID + " message from client that must be disconnected clientID = " + receiveMessage._clientId + " this session " + this.sessions[receiveMessage._sessionId].currentClientId, { type: "PLUGIN", session: receiveMessage._sessionId });
                        }
                    }
                }
                else {
                    this._log.error("PLUGIN : No dashboard for session id :" + receiveMessage._sessionId, { type: "PLUGIN", session: receiveMessage._sessionId });
                }
            });

            socket.on("waitingevents",(message: any) => {
                var receiveMessage = JSON.parse(message);
                if (this.dashboards[receiveMessage._sessionId] != null) {
                    this.dashboards[receiveMessage._sessionId].emit("waitingevents", message);
                    this.sessions[receiveMessage._sessionId].connectedClients[receiveMessage._clientId].waitingevents = receiveMessage._waitingEvents;
                }
            });

            socket.on("disconnect",() => {
                for (var session in this.sessions) {
                    for (var client in this.sessions[session].connectedClients) {
                        if (this.sessions[session].connectedClients[client].socket.id === socket.id) {
                            this.sessions[session].connectedClients[client].opened = false;
                            this._log.info("PLUGIN : Delete client socket " + socket.id + " for session " + session + "(" + session + ") ", { type: "PLUGIN", session: session });
                        }
                    }
                }
            });

            socket.on("clientclosed",(message: any) => {
                var receiveMessage = JSON.parse(message);
                for (var session in this.sessions) {
                    for (var client in this.sessions[session].connectedClients) {
                        if (receiveMessage.socketid === this.sessions[session].connectedClients[client].socket.id) {
                            this.sessions[session].connectedClients[client].opened = false;
                            this._log.info("PLUGIN : Send RefreshClients to Dashboard " + socket.id + " for session " + session + "(" + session + ") ", { type: "PLUGIN", session: session });
                            this.dashboards[session].emit("refreshclients");
                            this._log.info("PLUGIN : Client Close " + socket.id + " for session " + session + "(" + session + ") ", { type: "PLUGIN", session: session });
                        }
                    }
                }
            });
        }

        public addDashboard(socket: SocketIO.Socket): void {
            socket.on("helo",(message: any) => {
                var receiveMessage = JSON.parse(message);
                var dashboard = this.dashboards[receiveMessage._sessionId];

                if (dashboard == null) {
                    this._log.info("DASHBOARD : New Dashboard with session id : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
                else {
                    this._log.info("DASHBOARD : Reconnect on session id : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }

                this.dashboards[receiveMessage._sessionId] = socket;

                //if client listen by dashboad send helo to selected client
                if (receiveMessage._listenClientId !== "") {
                    this._log.info("DASHBOARD : Client selected for this dashboad = " + receiveMessage._listenClientId, { type: "DASHBOARD", session: receiveMessage._sessionId });

                    if (this.sessions[receiveMessage._sessionId] != undefined) {
                        this._log.info("DASHBOARD : Change currentClient on dashboar" + receiveMessage._clientId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                        this.sessions[receiveMessage._sessionId].currentClientId = receiveMessage._listenClientId;

                        for (var client in this.sessions[receiveMessage._sessionId].connectedClients) {
                            if (this.sessions[receiveMessage._sessionId].connectedClients[client].clientId === receiveMessage._listenClientId) {
                                if (this.sessions[receiveMessage._sessionId].connectedClients[client].socket != null) {
                                    this.sessions[receiveMessage._sessionId].connectedClients[client].socket.emit("helo", receiveMessage._listenClientId);
                                    this._log.info("DASHBOARD : Send helo to this socketid : " + this.sessions[receiveMessage._sessionId].connectedClients[client].socket.id, { type: "DASHBOARD", session: receiveMessage._sessionId });
                                }
                            }
                            else {
                                this._log.info("DASHBOARD : Wait this socketid again ... (" + this.sessions[receiveMessage._sessionId].connectedClients[client].socket.id + ")", { type: "DASHBOARD", session: receiveMessage._sessionId });
                            }
                        }

                        //Send Helo to DashBoard
                        this._log.info("DASHBOARD : Send helo to Dashboard on this sessionid : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                        socket.emit("helo", receiveMessage._listenClientId);
                    }
                }
                else {
                    this._log.info("DASHBOARD : No client selected for this dashboad on this session : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
            });

            socket.on("protocol",(message: any) => {
                var receiveMessage = JSON.parse(message);
                var dashboard = this.dashboards[receiveMessage._sessionId];
                if (dashboard == null) {
                    this._log.error("DASHBOARD : No Dashboard to send message for sessionid : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
                else {
                    dashboard.emit("message", message);
                    this._log.info("DASHBOARD : Dashboard send message for sessionid : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
            });

            socket.on("identify",(message: any) => {
                var receiveMessage = JSON.parse(message);
                this._log.info("DASHBOARD : Received identify for sessionid : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                var session = this.sessions[receiveMessage._sessionId];

                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if(currentclient.opened){
                            currentclient.socket.emit("identify", currentclient.displayId);
                            this._log.info("DASHBOARD : Dashboard send identify " + currentclient.displayId + " to socketid : " + currentclient.socket.id, { type: "DASHBOARD", session: receiveMessage._sessionId });
                            nbClients++;
                        }
                    }
                    this._log.info("DASHBOARD : Send " + session.nbClients + " identify(s)", { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
                else {
                    this._log.error("DASHBOARD : No client for sessionid : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
            });

            socket.on("message",(message: any) => {
                var receiveMessage = JSON.parse(message);
                var arrayClients = this.sessions[receiveMessage._sessionId];

                if (arrayClients != null) {
                    for (var client in arrayClients.connectedClients) {
                        if (receiveMessage._listenClientId === arrayClients.connectedClients[client].clientId) {
                            arrayClients.connectedClients[client].socket.emit("message", message);
                            this._log.info("DASHBOARD : Send message to socketid : " + arrayClients.connectedClients[client].socket.id, { type: "DASHBOARD", session: receiveMessage._sessionId });
                        }
                    }
                    this._log.info("DASHBOARD : Send " + arrayClients.nbClients + " message(s)", { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
                else {
                    this._log.error("DASHBOARD : No client for sessionid : " + receiveMessage._sessionId, { type: "DASHBOARD", session: receiveMessage._sessionId });
                }
            });

            socket.on("disconnect",() => {
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

        constructor(clientId: string, socket: SocketIO.Socket, displayId: number, opened: boolean = true) {
            this.clientId = clientId;
            this.socket = socket;
            this.displayId = displayId;
            this.opened = opened;
            this.waitingevents = 0;
        }
    }
}
