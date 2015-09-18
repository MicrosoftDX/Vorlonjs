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
        private _proxy = null;
        private _server = null;
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;
        
        constructor() {
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
        }
        
        private insertVorlonScript(str: string, uri, _script: string) {
            var position = str.indexOf("</head>");
            str = str.substr(0, position) + " " + _script + str.substr(position);
            return str;
        }
        
        private changePath(str: string, uri) {
            var re = new RegExp("href=\"/", 'g');
            str= str.replace(re, "href=\"" + uri.href);
            /*re = new RegExp("src=\"/", 'g');
            str= str.replace(re, "src=\"" + uri.href);*/
            return str;
        }
        
        public start(): void {
        }
        
        public addRoutes(app: express.Express, passport: any): void {
            app.get("/HttpProxy", this.home());
            app.get("/HttpProxy/inject", this.inject());
            var _appProxy = express();
            _appProxy.use("/:url/", this.websiteInProxy());
            http.createServer(_appProxy).listen(5050, () => {
                console.log(colors.blue("http proxy server ") + colors.green.bold("started ") + colors.blue("on port ") + colors.yellow("5050 "));
            });            
        }
        
        //Routes
        private websiteInProxy() {
            return (req: express.Request, res: express.Response) => {
                res.setHeader("Content-Type", "text/plain");
                var uri = url.parse(decodeURIComponent(req.params.url));
                console.log("Ask proxy to load website.", uri);
                
                this._proxy = httpProxy.createProxyServer({});
                this._proxy.web(req, res, { 
                    target: uri.href,
                    changeOrigin: true ,
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
                    console.log("Proxy load website.", proxyRes);
                    var pat = /^(https?:\/\/)?(?:www\.)?([^\/]+)/;
                    var match = uri.href.match(pat); 
                    var port = process.env.PORT || 1337;
                    var _script = "<script src=\"http://localhost:" + port + "/vorlon.js/"+ match[2] +"/\"></script>"
                    if (proxyRes.headers && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].match("text/html")) {
                        var chunks,
                            end = response.end,
                            writeHead = response.writeHead,
                            write = response.write;
                        
                        var _that = this;
                        response.writeHead = function () {
                            if (proxyRes.headers && proxyRes.headers["content-length"]) {
                                response.setHeader("content-length", parseInt(proxyRes.headers["content-length"], 10) + _script.length);
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
                                var tmp = _that.insertVorlonScript(chunks.toString(), uri, _script);
                                console.log("Insert vorlon script in website.");
                                tmp = _that.changePath(tmp, uri);
                                write.apply(this, [tmp]);
                            } else {
                                end.apply(this, arguments);
                            }
                        };
                    }
                });  
            };
        }
        private home() {
            return (req: express.Request, res: express.Response) => {
                res.render('httpproxy', { baseURL: this.baseURLConfig.baseURL });
            };
        }
        
        private inject() {
            return (req: express.Request, res: express.Response) => {                
                res.end("http://localhost:5050/" + encodeURIComponent(req.query.url));
            };
        }
    }
}