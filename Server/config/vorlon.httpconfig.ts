import fs = require("fs");
import http = require("http");
import https = require("https");
import path = require("path");
import config = require("./vorlon.configprovider");

export module VORLON {
    export class HttpConfig {
        public useSSL: boolean;
        public protocol: String;
        public httpModule;
        public options;
        public host;
        public port;
        public socket;
        public proxyHost;
        public proxyPort;
        public enableWebproxy: boolean;
        public vorlonServerURL: string;
        public vorlonProxyURL: string;
        public proxyEnvPort: boolean;

        public constructor() {
            var catalogdata: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);

            if (catalog.useSSL) {
                this.useSSL = true;
                this.protocol = "https";
                this.httpModule = https;
                this.options = {
                    key: fs.readFileSync(path.resolve(__dirname, "../", catalog.SSLkey)),
                    cert: fs.readFileSync(path.resolve(__dirname, "../", catalog.SSLcert))
                }
            }
            else {
                this.useSSL = false;
                if (catalog.useSSLAzure) {
                    this.protocol = "https";
                    this.httpModule = http;
                }
                else {
                    this.protocol = "http";
                    this.httpModule = http;
                }
            }
            this.proxyHost = process.env.PROXY_HOST || catalog.proxyHost || 'localhost';
            this.proxyEnvPort = catalog.proxyEnvPort;
            if (catalog.proxyEnvPort)
                this.proxyPort = process.env.PORT;
            else
                this.proxyPort = catalog.proxyPort || 5050;
            this.host = process.env.HOST || catalog.host || 'localhost';
            this.port = process.env.PORT || catalog.port || 1337;
            this.socket = (typeof catalog.socket === 'string' && catalog.socket.length > 0) ? catalog.socket : undefined;
            this.proxyPort = catalog.proxyPort || 5050;
            this.enableWebproxy = catalog.enableWebproxy || false;
            this.vorlonServerURL = catalog.vorlonServerURL || "";
            this.vorlonProxyURL = catalog.vorlonProxyURL || "";
        }
    }
}
