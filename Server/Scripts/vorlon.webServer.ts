import express = require("express");
import path = require("path");
import stylus = require("stylus");
import fs = require("fs");

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import vauth = require("./vorlon.authentication");
import httpConfig = require("../config/vorlon.httpconfig"); 
import baseURLConfig = require("../config/vorlon.baseurlconfig"); 

export module VORLON {
    export class WebServer {
        private _bodyParser = require("body-parser");
        private _cookieParser = require("cookie-parser");
        private _methodOverride = require("method-override");
        private _session = require("express-session");
        private _json = require("json");
        private _multer = require("multer");
        private _passport = require("passport");
        private _localStrategy = require("passport-local");
        private _twitterStrategy = require("passport-twitter");
       // private _flash = require('connect-flash');

        private _components: Array<iwsc.VORLON.IWebServerComponent>;
        private http: httpConfig.VORLON.HttpConfig;
        private _app: express.Express;
        private baseURLConfig: baseURLConfig.VORLON.BaseURLConfig;

        constructor() {
            this._app = express();
            this._components = new Array<iwsc.VORLON.IWebServerComponent>();
            this.http = new httpConfig.VORLON.HttpConfig();
            this.baseURLConfig = new baseURLConfig.VORLON.BaseURLConfig();  
        }

        public init(): void {
            for (var id in this._components) {
                var component = this._components[id];
                component.addRoutes(this._app, this._passport);
            }
        }

        public get components(): Array<iwsc.VORLON.IWebServerComponent> {
            return this._components;
        }

        public set components(comp: Array<iwsc.VORLON.IWebServerComponent>) {
            this._components = comp;
        }

        public start(): void {
            var app = this._app;
            
            //Command line
            var stopExecution = false;
            process.argv.forEach(function (val, index, array) {
                switch (val) {
                    case "--version":
                        fs.readFile(path.join(__dirname, "../../package.json"), "utf8",(err, packageData) => {
                            if (err) {
                                this._log.error("Error reading package.json file");
                                return;
                            }
                            
                            var _package = JSON.parse(packageData.replace(/^\uFEFF/, ''));
                            console.log('Vorlon.js v' + _package.version);
                        });
                        stopExecution = true;
                        break;
                }
            });
            
            if (stopExecution) {
                return;
            }

            //Sets
            app.set('port', process.env.PORT || 1337);
            app.set('views', path.join(__dirname, '../views'));
            app.set('view engine', 'jade');

            //Uses
            this._passport.use(new this._localStrategy(function(username, password, done) { 
                    // insert your MongoDB check here. For now, just a simple hardcoded check.
                    if (username === vauth.VORLON.Authentication.UserName && password === vauth.VORLON.Authentication.Password)
                    {
                        done(null, { user: username });
                    }
                    else
                    {
                        done(null, false);
                    }
                })
            );
            
            this._passport.serializeUser(function(user, done) { 
                done(null, user); 
            }); 
        
            this._passport.deserializeUser(function(user, done) { 
                done(null, user); 
            }); 

            app.use(stylus.middleware(path.join(__dirname, '../public')));
            app.use(express.static(path.join(__dirname, '../public')));
            app.use(this._bodyParser.urlencoded({ extended: false }));
            app.use(this._bodyParser.json());
            app.use(this._cookieParser());
            app.use(this._multer());
            app.use(this._methodOverride());
            app.use(this._session({
                secret: '1th3is4is3as2e5cr6ec7t7keyf23or1or5lon5',
                expires: false,
                saveUninitialized: true,
                resave: true }));
            app.use(this._passport.initialize());
            app.use(this._passport.session());
            
            vauth.VORLON.Authentication.loadAuthConfig();
          
            this.init();
            
            app.use((req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });

            if (this.http.useSSL) {
                this.http.httpModule = this.http.httpModule.createServer(this.http.options, app).listen(app.get('port'), () => {
                    console.log('Vorlon.js with SSL listening on port ' + app.get('port'));
                });
            } else {
                this.http.httpModule = this.http.httpModule.createServer(app).listen(app.get('port'), () => {
                    console.log('Vorlon.js listening on port ' + app.get('port'));
                });
            }

            for (var id in this._components) {
                var component = this._components[id];
                component.start(this.http.httpModule);
            }
        }

        public get httpServer(){
            return this.http.httpModule;
        }
    }
}
