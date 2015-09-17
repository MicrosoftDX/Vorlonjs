import express = require("express");
import http = require("http");
import https = require('https');
import path = require("path");
import fs = require("fs");
import util = require("util");
import url = require("url");
var colors = require("colors");
var httpProxy = require("http-proxy");

import iwsc = require("./vorlon.IWebServerComponent");
import baseURLConfig = require("../config/vorlon.baseurlconfig"); 

export module VORLON {
    export class HttpProxy implements iwsc.VORLON.IWebServerComponent {
        private _scriptElm: string = "<script src=\"http://localhost:1337/vorlon.js\"></script>";
        private _app: express.Express;
        private _proxy = null;
        private _server = null;
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;
        
        constructor() {
            this._app = express();
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
        }
        
        private insertVorlonScript(str) {
             var position = str.indexOf("</head>");
             str = str.substr(0, position) + " " + this._scriptElm + str.substr(position);
             return str;
        }
        
        public start(): void {
            this._app.use(express.static(path.join(__dirname, '../public')));
            this._app.get("/", this.home());
            this._app.get("/inject", this.inject());
            this._app.set('views', path.join(__dirname, '../views'));
            this._app.set('view engine', 'jade');
            this._app.listen(2800, () => {
                console.log(colors.blue("http server ") + colors.green.bold("started ") + colors.blue("on port ") + colors.yellow("2800 "));
            });
        }
        
        public addRoutes(app: express.Express, passport: any): void {
        }
        
        //Routes
        private home() {
            return (req: express.Request, res: express.Response) => {
                res.render('httpproxy', { baseURL: this.baseURLConfig.baseURL });
            };
        }
        
        private inject() {
            return (req: express.Request, res: express.Response) => { 
                res.setHeader("Content-Type", "text/plain");
                var uri = url.parse(req.query.url);
                
                if (this._proxy != null) {
                    this._proxy.close();
                    this._proxy = null;
                    this._server.close();
                    this._server = null;
                }
                var options : any = {};
                options = { 
                    target: uri.href, 
                    changeOrigin: true 
                };
                if (uri.protocol === "https:") {
                    options = {
                        target: uri.href, 
                        agent: https.globalAgent, 
                        headers: { 
                            host: uri.hostname 
                        }, 
                        changeOrigin: true
                    };
                    console.log("options => ", options);
                    var proxy = httpProxy.createProxyServer();
                }
                this._proxy = httpProxy.createProxyServer(options);
                this._server = http.createServer((req: express.Request, res: express.Response) => {
                    this._proxy.web(req, res);
                });               
                
                this._proxy.on("error", (error, req, res) => {
                    var json;
                    console.log("proxy error", error);
                    if (!res.headersSent) {
                        res.writeHead(500, { "content-type": "application/json" });
                    }
                    
                    json = { error: "proxy_error", reason: error.message };
                    res.end(JSON.stringify(json));
                });
                
                this._proxy.on("proxyRes", (proxyRes, request, response) => {
                    if (proxyRes.headers && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].match("text/html")) {
                        var chunks,
                            end = response.end,
                            writeHead = response.writeHead,
                            write = response.write;
                        
                        var _that = this;
                        response.writeHead = function () {
                            if (proxyRes.headers && proxyRes.headers["content-length"]) {
                                response.setHeader("content-length", parseInt(proxyRes.headers["content-length"], 10) + _that._scriptElm.length);
                            }                            
                            response.setHeader("transfer-encoding", "");                            
                            response.setHeader("cache-control", "no-cache");
                            
                            writeHead.apply(this, arguments);
                        };
                        
                        response.write = (data) => {
                            if (chunks) {
                                chunks += data;
                            } else {
                                chunks = data;
                            }
                        };
                        response.end = function () {
                            if (chunks && chunks.toString) {
                                var tmp = _that.insertVorlonScript(chunks.toString());
                                write.apply(this, [tmp]);
                            } else {
                                end.apply(this, arguments);
                            }
                        };
                    }
                });
                
                var port = 5050;
                this._server.listen(port, () => {
                    console.log(colors.blue("http proxy server ") + colors.green.bold("started ") + colors.blue("on port ") + colors.yellow("5050 "));
                });
                res.end("http://localhost:5050/");
            };
        }
    }
}