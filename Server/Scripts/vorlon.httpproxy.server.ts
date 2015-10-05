import express = require("express");
import http = require("http");
import https = require('https');
import path = require("path");
import fs = require("fs");
import util = require("util");
import url = require("url");
import zlib = require("zlib");
var cookieParser = require('cookie-parser')
var colors = require("colors");
var httpProxy = require("http-proxy");

import iwsc = require("./vorlon.IWebServerComponent");
import baseURLConfig = require("../config/vorlon.baseurlconfig");

export module VORLON {
    export class HttpProxy implements iwsc.VORLON.IWebServerComponent {
        private _proxy = null;
        private _fetchproxy = null;
        private _server = null;
        private _proxyPort = 5050;
        private _proxyCookieName = "vorlonProxyTarget";
        private _vorlonScript = "vorlon.max.js";
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;

        constructor() {
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();
            this._proxy = httpProxy.createProxyServer({});
            this._fetchproxy = httpProxy.createProxyServer({});
        }

        private insertVorlonScript(str: string, uri, _script: string, vorlonsessionid: string) {
            var position = str.indexOf("<head");
            if (position > 0) {
                var closing = str.indexOf(">", position) + 1;

                console.log("PROXY Injert vorlon script in website with SESSIONID " + vorlonsessionid);
                var beforehead = str.substr(0, closing);
                var afterhead = str.substr(closing);
                str = beforehead + " " + _script + afterhead;
            }
            return str;
        }

        public start(): void {
        }

        public addRoutes(app: express.Express, passport: any): void {
            app.get("/httpproxy", this.home());
            app.get("/httpproxy/inject", this.inject());
            app.get("/httpproxy/fetch", this.fetchFile());
            app.get("/browserspecificcontent", this.browserSpecificContent());
            this._server = express();
            this._server.use(cookieParser());
            this._server.use("/vorlonproxy/root.html", this.proxyForTarget());
            this._server.use("/vorlonproxy/*", this.proxyForRelativePath());
            this._server.use("/", this.proxyForRootDomain());
            http.createServer(this._server).listen(this._proxyPort, () => {
                console.log("Vorlon.js proxy started on port " + this._proxyPort);
            });
            this._proxy.on("error", this.proxyError);
            this._proxy.on("proxyRes", this.proxyResult.bind(this));
            this._proxy.on("proxyReq", this.proxyRequest.bind(this));
            this._fetchproxy.on("proxyReq", this.proxyFetchRequest.bind(this));
            this._fetchproxy.on("proxyRes", this.proxyFetchResult.bind(this));
        }

        private browserSpecificContent() {
            return (req: express.Request, res: express.Response) => {
                var userAgent = req.headers["user-agent"];
                var reply = function(browsername){
                    res.write('<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Vorlon.js - Test page</title><script src="http://localhost:1337/vorlon.max.js"></script></head><body><div>This is content for ' + browsername + '</div><div> ' + userAgent + '</div></body></html>');
                    res.end();
                }
                if (userAgent == "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36"){
                    reply("Google Chrome")
                }else if (userAgent == "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240"){
                    reply("Microsoft Edge")
                }else if (userAgent == "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko"){
                    reply("IE 11")
                }else {
                    reply("Others")
                }
            }
        }
        
        private fetchFile() {
            return (req: express.Request, res: express.Response) => {
                var targetProxyUrl = req.query.fetchurl;

                console.log("FETCH DOCUMENT " + targetProxyUrl);
                var opt = <any>{
                    target: targetProxyUrl,
                    changeOrigin: true
                };
                res.setHeader("Content-Type", "text/plain");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
                this._fetchproxy.web(req, res, opt);
            };
        }

        private proxyFetchRequest(proxyReq, req: express.Request, res: express.Response, opt) {
            var e = proxyReq;
            proxyReq.path = req.query.fetchurl;            
            if (req.query.fetchuseragent){                
                proxyReq._headers["user-agent"] = req.query.fetchuseragent;
                console.log("FETCH ISSUING UA REQUEST TO " + proxyReq.path);
            }else{
                console.log("FETCH ISSUING REQUEST TO " + proxyReq.path);
            }
        }

        private proxyFetchResult(proxyRes, req: express.Request, res: express.Response) {
            var writeHead = res.writeHead;
            res.writeHead = function() {
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
                res.header('Expires', '-1');
                res.header('Pragma', 'no-cache');
                writeHead.apply(res, arguments);
            };
        }
        
        //Routes
        private proxyForRelativePath() {
            return (req: express.Request, res: express.Response) => {
                //disable accept-encoding
                //req.headers["accept-encoding"] = "";
                                
                res.setHeader("Content-Type", "text/plain");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');

                var cookieUrl = req.cookies[this._proxyCookieName];
                var targetProxyUrl = (<any>req).baseUrl.substr("/vorlonproxy/".length);                                
                // var idx = targetProxyUrl.lastIndexOf('/');
                // if (idx > -1){
                //     targetProxyUrl = targetProxyUrl.substr(0, idx+1);
                // }else{
                //     targetProxyUrl = "";
                // }
                
                if (cookieUrl) {
                    var uri = url.parse(cookieUrl);
                    var target = uri.href;

                    if (targetProxyUrl) {
                        if (target[target.length - 1] != '/')
                            target = target + '/';

                        target = target + targetProxyUrl;
                    }
                    console.log("PROXY RELATIVE REQUEST from target " + target + " for " + (<any>req).baseUrl);
                    var opt = <any>{
                        target: target,
                        changeOrigin: true
                    };
                    if (target.indexOf("https:") === 0) {
                        opt.secure = true;
                    }
                    this._proxy.web(req, res, opt);
                } else {
                    console.warn("PROXY RELATIVE REQUEST but no target for " + (<any>req).baseUrl);
                }
            };
        }

        private proxyForTarget() {
            return (req: express.Request, res: express.Response) => {
                //disable accept-encoding
                //req.headers["accept-encoding"] = "";
                                
                res.setHeader("Content-Type", "text/plain");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');

                var targetProxyUrl = req.query.vorlonproxytarget;
                if (!targetProxyUrl) {
                    targetProxyUrl = req.cookies[this._proxyCookieName];
                }

                if (targetProxyUrl) {
                    console.log("PROXY REQUEST from target " + targetProxyUrl + " for " + (<any>req).baseUrl);
                    var opt = <any>{
                        target: targetProxyUrl,
                        changeOrigin: true
                    };
                    if (targetProxyUrl.indexOf("https:") === 0) {
                        opt.secure = true;
                    }
                    this._proxy.web(req, res, opt);
                } else {
                    console.warn("PROXY REQUEST but no target" + " for " + (<any>req).baseUrl);
                }
            };
        }

        private proxyForRootDomain() {
            return (req: express.Request, res: express.Response) => {
                //disable accept-encoding
                //req.headers["accept-encoding"] = "";
                                
                res.setHeader("Content-Type", "text/plain");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');

                var cookieUrl = req.cookies[this._proxyCookieName];

                if (cookieUrl) {
                    var uri = url.parse(cookieUrl);
                    var target = uri.protocol + "//" + uri.hostname;
                    console.log("PROXY REQUEST for root http domain " + target)
                    var opt = <any>{
                        target: target,
                        changeOrigin: true
                    };
                    if (target.indexOf("https:") === 0) {
                        opt.secure = true;
                    }
                    this._proxy.web(req, res, opt);
                } else {
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
                res.end("http://localhost:" + this._proxyPort + "/vorlonproxy/root.html?vorlonproxytarget=" + encodeURIComponent(req.query.url));
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
            if (proxyReq.path[proxyReq.path.length - 1] == "/") {
                proxyReq.path = proxyReq.path.substr(0, proxyReq.path.length - 1);
            }
            console.log("PROXY ISSUING REQUEST TO " + proxyReq.path);
        }

        private proxyResult(proxyRes, req: express.Request, res: express.Response) {
            var port = process.env.PORT || 1337;
            var _proxy = this;
            var chunks, end = res.end, writeHead = res.writeHead, write = res.write;

            if (proxyRes.statusCode >= 300) {
                console.warn("PROXY received status " + proxyRes.statusCode + " " + proxyRes.statusMessage);
                console.warn(proxyRes.req._header);
            }

            var targetProxyUrl = req.query.vorlonproxytarget;
            if (!targetProxyUrl) {
                targetProxyUrl = req.cookies[this._proxyCookieName];
            }

            if (proxyRes.headers && proxyRes.headers["content-type"] && proxyRes.headers["content-type"].match("text/html")) {
                var encoding = proxyRes.headers["content-encoding"];




                if (!targetProxyUrl) {
                    console.warn("PROXY request HTML Content but no url...");
                    return;
                }

                var uri = url.parse(targetProxyUrl);
                console.log("PROXY result from path " + uri.href);
                console.log("PROXY load website for target " + uri.href);
                var pat = /^(https?:\/\/)?(?:www\.)?([^\/]+)/;
                var match = uri.href.match(pat);
                var vorlonsessionid = match[2];
                var _script = "<script src=\"http://localhost:" + port + "/" + this._vorlonScript + "/" + vorlonsessionid + "/\"></script>"

                if (encoding == "gzip" || encoding == "deflate") {
                    console.warn("PROXY content is encoded to " + encoding);
                    var uncompress = (<any>zlib).Gunzip();
                    if (encoding == "deflate")
                        uncompress = (<any>zlib).Inflate();

                    res.writeHead = function() {
                        if (proxyRes.headers && proxyRes.headers["content-length"]) {
                            res.setHeader("content-length", <any>parseInt(proxyRes.headers["content-length"], 10) + _script.length);
                        }
                        res.setHeader("transfer-encoding", "");
                        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                        res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
                        res.header('Expires', '-1');
                        res.header('Pragma', 'no-cache');
                        res.header('Content-Encoding', '');
                        res.removeHeader('Content-Encoding');
                        res.removeHeader('Content-Length');
                        
                        //we must set cookie only if url was requested through Vorlon
                        if (req.query.vorlonproxytarget) {
                            console.log("set cookie " + req.query.vorlonproxytarget);
                            res.cookie(_proxy._proxyCookieName, req.query.vorlonproxytarget);
                        }

                        writeHead.apply(res, arguments);
                    };

                    (<any>res).write = (data) => {
                        uncompress.write(data);
                    };

                    uncompress.on('data', (data) => {
                        if (chunks) {
                            chunks += data;
                        } else {
                            chunks = data;
                        }
                        return chunks;
                    });

                    uncompress.on('end', (data) => {
                        if (chunks && chunks.toString) {
                            var tmp = _proxy.insertVorlonScript(chunks.toString(), uri, _script, vorlonsessionid);

                            write.apply(res, [tmp]);
                        }
                        end.apply(res);
                    });

                    res.end = function(): void {
                        uncompress.end(arguments[0]);
                    };

                } else {
                    res.writeHead = function() {
                        if (proxyRes.headers && proxyRes.headers["content-length"]) {
                            res.setHeader("content-length", <any>parseInt(proxyRes.headers["content-length"], 10) + _script.length);
                        }
                        res.setHeader("transfer-encoding", "");
                        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                        res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
                        res.header('Expires', '-1');
                        res.header('Pragma', 'no-cache');
                    
                        //we must set cookie only if url was requested through Vorlon
                        if (req.query.vorlonproxytarget) {
                            console.log("set cookie " + req.query.vorlonproxytarget);
                            res.cookie(_proxy._proxyCookieName, req.query.vorlonproxytarget);
                        }

                        writeHead.apply(res, arguments);
                    };

                    res.write = (data) => {
                        if (chunks) {
                            chunks += data;
                        } else {
                            chunks = data;
                        }
                        return chunks;
                    };

                    res.end = function() {
                        if (chunks && chunks.toString) {
                            var tmp = _proxy.insertVorlonScript(chunks.toString(), uri, _script, vorlonsessionid);

                            write.apply(res, [tmp]);
                        }
                        end.apply(res, arguments);
                    };
                }
            } else {
                res.writeHead = function() {
                    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                    res.header('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Encoding, Content-Length, Content-Range');
                    res.header('Expires', '-1');
                    res.header('Pragma', 'no-cache');
                    writeHead.apply(res, arguments);
                };
            }
        }
    }
}