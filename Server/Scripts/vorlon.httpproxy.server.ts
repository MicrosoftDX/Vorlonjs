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
            var position = str.indexOf("<head");            
            if (position > 0) {
                var closing = str.indexOf(">", position) + 1;
                
                console.log("PROXY Injert vorlon script in website with SESSIONID " + vorlonsessionid);
                var beforehead = str.substr(0, closing);
                var afterhead =  str.substr(closing);
                str = beforehead + " " + _script + afterhead;
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
            this._proxy.on("proxyReq", this.proxyRequest.bind(this));
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
                    console.log("PROXY REQUEST from target " + targetProxyUrl);
                    var opt = <any>{
                        target: targetProxyUrl,
                        changeOrigin: true
                    };
                    if (targetProxyUrl.indexOf("https:") === 0){
                        opt.secure = true;
                    }
                    this._proxy.web(req, res, opt);
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
                    var opt = <any>{
                        target: target,
                        changeOrigin: true
                    };
                    if (target.indexOf("https:") === 0){
                        opt.secure = true;
                    }
                    this._proxy.web(req, res, opt);
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
        
        private proxyRequest(proxyReq, req: express.Request, res: express.Response, opt) {
            var e = proxyReq;
        }
        
        private proxyResult(proxyRes, req: express.Request, res: express.Response) {
            var port = process.env.PORT || 1337;
            var _proxy = this;
            
            if (proxyRes.statusCode >= 300){
                console.warn("received status " + proxyRes.statusCode + " " + proxyRes.statusMessage);
                console.warn(proxyRes.req._header);
            }
            
            if (proxyRes.headers && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].match("text/html")) {
                var targetProxyUrl = req.query.targeturl;                
                if (!targetProxyUrl){
                    targetProxyUrl = req.cookies[this._proxyCookieName];
                } 
                
                if (!targetProxyUrl){
                    console.warn("PROXY request HTML Content but no url...");
                    return;
                }
                
                var uri = url.parse(targetProxyUrl);
                console.log("result from path " + uri.href);
                console.log("Proxy load website for target " + uri.href);
                var pat = /^(https?:\/\/)?(?:www\.)?([^\/]+)/;
                var match = uri.href.match(pat); 
                var vorlonsessionid = match[2];
                var _script = "<script src=\"http://localhost:" + port + "/vorlon.js/"+ vorlonsessionid +"/\"></script>"
                var chunks, end = res.end, writeHead = res.writeHead, write = res.write;
                
                
                res.writeHead = function () {
                    if (proxyRes.headers && proxyRes.headers["content-length"]) {
                        res.setHeader("content-length", <any>parseInt(proxyRes.headers["content-length"], 10) + _script.length);
                    }                            
                    res.setHeader("transfer-encoding", "");                            
                    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                    res.header('Expires', '-1');
                    res.header('Pragma', 'no-cache');
                    
                    //we must set cookie only if url was requested through Vorlon
                    if (req.query.targeturl){
                         console.log("set cookie " + req.query.targeturl);
                        res.cookie(_proxy._proxyCookieName, req.query.targeturl);
                    }
                    
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