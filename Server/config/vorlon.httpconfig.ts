import fs = require("fs");
import http = require("http");
import https = require("https");
import path = require("path");

export module VORLON {
    export class HttpConfig {
        public useSSL: boolean;
        public protocol: String;
        public httpModule;
        public options;
        public port;

        public constructor() {            
            var catalogdata: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");            
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);

            if (catalog.useSSL) {
                this.useSSL = true;
                this.protocol = "https";
                this.httpModule = https;
                this.options = {
                    key: fs.readFileSync(catalog.SSLkey),
                    cert: fs.readFileSync(catalog.SSLcert) 
                }
            }
            else {
                this.useSSL = false;
                this.protocol = "http";
                this.httpModule = http;
            }
            this.port = process.env.PORT || catalog.port || 1337;
        }
    }
}