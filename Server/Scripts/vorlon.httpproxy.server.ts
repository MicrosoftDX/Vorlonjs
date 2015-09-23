import express = require("express");
import http = require("http");
import https = require('https');
import path = require("path");
import fs = require("fs");
import util = require("util");
import url = require("url");
var cookieParser = require('cookie-parser')
var colors = require("colors");
var httpProxy = require("http-proxy");

import iwsc = require("./vorlon.IWebServerComponent");
import baseURLConfig = require("../config/vorlon.baseurlconfig"); 

export module VORLON {
    export class HttpProxy implements iwsc.VORLON.IWebServerComponent {
        private _proxy = null;
        private _server = null;
        private _proxyPort = 5050;
        private _proxyCookieName = "vorlonProxyTarget";
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;
        
        constructor() {
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
            this._proxy = httpProxy.createProxyServer({});
        }
        
        private insertVorlonScript(str: string, uri, _script: string, vorlonsessionid:string) {
            var position = str.indexOf("</head>");
            if (position > 0){
                console.log("PROXY Injert vorlon script in website with SESSIONID " + vorlonsessionid);
                str = str.substr(0, position) + " " + _script + str.substr(position);
            }
            return str;
        }
        
        public start(): void {
        }
        
        public addRoutes(app: express.Express, passport: any): void {
            app.get("/HttpProxy", this.home());
            app.get("/HttpProxy/inject", this.inject());
            this._server = express();
            this._server.use(cookieParser());
            this._server.use("/vorlonproxy", this.proxyForTarget());
            this._server.use("/", this.proxyForRootDomain());
            http.createServer(this._server).listen(this._proxyPort, () => {
                console.log("Vorlon.js proxy started on port " + this._proxyPort);
            });
            this._proxy.on("error", this.proxyError);
            this._proxy.on("proxyRes", this.proxyResult.bind(this));
        }
        
        //Routes
        private proxyForTarget() {
            return (req: express.Request, res: express.Response) => {
                //disable accept-encoding
                req.headers["accept-encoding"] = "";
                                
                res.setHeader("Content-Type", "text/plain");
                
                var targetProxyUrl = req.query.targeturl;                
                if (!targetProxyUrl){
                    targetProxyUrl = req.cookies[this._proxyCookieName];
                } 
                
                if (targetProxyUrl){
                    console.log("PROXY REQUEST from target " + targetProxyUrl)
                    this._proxy.web(req, res, { 
                        target: targetProxyUrl,
                        changeOrigin: true
                    });
                }else{
                    console.warn("PROXY REQUEST but no target");
                }
            };
        }
        
        private proxyForRootDomain() {
            return (req: express.Request, res: express.Response) => {
                //disable accept-encoding
                req.headers["accept-encoding"] = "";
                                
                res.setHeader("Content-Type", "text/plain");
                
                var cookieUrl = req.cookies[this._proxyCookieName];
                
                if (cookieUrl){
                    var uri = url.parse(cookieUrl);
                    var target = uri.protocol + "//" + uri.hostname;
                    console.log("PROXY REQUEST for root http domain " + target)
                    this._proxy.web(req, res, { 
                        target: target,
                        changeOrigin: true
                    });
                }else{
                    console.warn("PROXY REQUEST from root but no cookie...");
                }
            };
        }
        
        private home() {
            return (req: express.Request, res: express.Response) => {
                res.render('httpproxy', { baseURL: this.baseURLConfig.baseURL });
            };
        }
        
        private inject() {
            return (req: express.Request, res: express.Response) => {   
                var uri = url.parse(req.query.url);
                //res.cookie(this._proxyCookieName, uri.protocol + "//" + uri.hostname);
                console.log("request for proxiing " + uri.hostname + " to port " + this._proxyPort)
                res.end("http://localhost:" + this._proxyPort + "/vorlonproxy?targeturl=" + encodeURIComponent(req.query.url)); 
            };
        }
        
        //Events HttpProxy
        private proxyError(error, req: express.Request, res: express.Response) {
            var json;
            console.log("proxy error", error);
            if (!res.headersSent) {
                res.writeHead(500, { "content-type": "application/json" });
            }
            
            json = { error: "proxy_error", reason: error.message };
            res.end(JSON.stringify(json));
        }
        
        private proxyResult(proxyRes, req: express.Request, res: express.Response) {
            var port = process.env.PORT || 1337;
            var _proxy = this;
            
            if (proxyRes.headers && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].match("text/html")) {
                if (!req.query.targeturl){
                    console.warn("no url...");
                    return;
                }
                
                var uri = url.parse(decodeURIComponent(req.query.targeturl));
                console.log("result from path " + uri.href);
                console.log("Proxy load website for target " + uri.href);
                var pat = /^(https?:\/\/)?(?:www\.)?([^\/]+)/;
                var match = uri.href.match(pat); 
                var vorlonsessionid = match[2];
                var _script = "<script src=\"http://localhost:" + port + "/vorlon.js/"+ vorlonsessionid +"/\"></script>"
                var chunks,
                    end = res.end,
                    writeHead = res.writeHead,
                    write = res.write;
                
                
                res.writeHead = function () {
                    if (proxyRes.headers && proxyRes.headers["content-length"]) {
                        res.setHeader("content-length", <any>parseInt(proxyRes.headers["content-length"], 10) + _script.length);
                    }                            
                    res.setHeader("transfer-encoding", "");                            
                    res.setHeader("cache-control", "no-cache");
                    console.log("set cookie " + req.query.targeturl);
                    res.cookie(_proxy._proxyCookieName, req.query.targeturl);
                    writeHead.apply(this, arguments);
                };
                
                res.write = (data) => {
                    if (chunks) {
                        chunks += data;
                    } else {
                        chunks = data;
                    }
                    return chunks;
                };
                
                res.end = function () {
                    if (chunks && chunks.toString) {
                        var tmp = _proxy.insertVorlonScript(chunks.toString(), uri, _script, vorlonsessionid);
                        
                        write.apply(this, [tmp]);
                    }
                    end.apply(this, arguments);
                };
            }
        }
    }
}