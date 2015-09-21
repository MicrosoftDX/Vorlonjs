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
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;
        
        constructor() {
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
            this._proxy = httpProxy.createProxyServer({});
        }
        
        private insertVorlonScript(str: string, uri, _script: string) {
            var position = str.indexOf("</head>");
            str = str.substr(0, position) + " " + _script + str.substr(position);
            return str;
        }
        
        private changePath(str: string, uri) {4
            str = str.replace(/<head>([.\s\S]+?)<\/head>/gmi, function (tag) {
                tag = tag.replace(/<link(.+?)>/gmi, function (css) {
                    var link = css.match(/href=\"(.+?)\"/g);
                    if (link && link[0].match(/(^[\/]{2})|(http)/) == null) {
                        css = css.replace(/href=\"/g, "href=\"" + uri.href);
                    }
                    return css;
                }); 
                tag = tag.replace(/<script(.+?)>/gmi, function (script) {
                    var link = script.match(/src=\"(.+?)\"/g);
                    if (link && link[0].match(/(^[\/]{2})|(http)/) == null) {
                        script = script.replace(/src=\"/g, "src=\"" + uri.href);
                    }
                    return script;
                });
                return tag;
            });
            /*re = new RegExp("src=\"/", 'g');
            str= str.replace(re, "src=\"" + uri.href);*/
            return str;
        }
        
        public start(): void {
        }
        
        public addRoutes(app: express.Express, passport: any): void {
            app.get("/HttpProxy", this.home());
            app.get("/HttpProxy/inject", this.inject());
            this._server = express();
            this._server.use(cookieParser());
            this._server.use("/", this.websiteInProxy());
            http.createServer(this._server).listen(5050, () => {
                console.log(colors.blue("http proxy server ") + colors.green.bold("started ") + colors.blue("on port ") + colors.yellow("5050 "));
            });
            this._proxy.on("error", this.proxyError);
            this._proxy.on("proxyRes", this.proxyResult.bind(this));
        }
        
        //Routes
        private websiteInProxy() {
            return (req: express.Request, res: express.Response) => {
                res.setHeader("Content-Type", "text/plain");
                var uri = url.parse(req.cookies["_url"]);
                console.log("Ask proxy to load website.");
                console.log("Cookies: ", req.cookies)
                this._proxy.web(req, res, { 
                    target: uri.href,
                    changeOrigin: true
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
                var uri = url.parse(req.query.url);
                res.cookie("_url", uri.protocol + "//" + uri.hostname);
                res.end("http://localhost:5050/" /* + encodeURIComponent(req.query.url)*/); 
            };
        }
        
        //Events HttpProxy
        private proxyError(error, req: express.Request, res: express.Response) {
            var json;
            console.error("proxy error", error);
            if (!res.headersSent) {
                res.writeHead(500, { "content-type": "application/json" });
            }
            
            json = { error: "proxy_error", reason: error.message };
            res.end(JSON.stringify(json));
        }
        
        private proxyResult(proxyRes, req: express.Request, res: express.Response) {
            console.log("Proxy load website.");
            var uri = url.parse(req.cookies["_url"]);
            var pat = /^(https?:\/\/)?(?:www\.)?([^\/]+)/;
            var match = uri.href.match(pat); 
            var port = process.env.PORT || 1337;
            var _script = "<script src=\"http://localhost:" + port + "/vorlon.js/"+ match[2] +"/\"></script>"
            if (proxyRes.headers && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].match("text/html")) {
                var chunks,
                    end = res.end,
                    writeHead = res.writeHead,
                    write = res.write;
                
                var _that = this;
                res.writeHead = function () {
                    if (proxyRes.headers && proxyRes.headers["content-length"]) {
                        res.setHeader("content-length", <any>parseInt(proxyRes.headers["content-length"], 10) + _script.length);
                    }                            
                    res.setHeader("transfer-encoding", "");                            
                    res.setHeader("cache-control", "no-cache");
                    
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
                        var tmp = _that.insertVorlonScript(chunks.toString(), uri, _script);
                        console.log("Insert vorlon script in website.");
                        //tmp = _that.changePath(tmp, uri);
                        write.apply(this, [tmp]);
                    } else {
                        end.apply(this, arguments);
                    }
                };
            }
        }
    }
}