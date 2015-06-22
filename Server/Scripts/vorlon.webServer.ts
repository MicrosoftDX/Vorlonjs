import express = require("express");
import path = require("path");
import stylus = require("stylus");

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import vauth = require("./vorlon.authentication");
import httpConfig = require("../config/vorlon.httpconfig"); 


export module VORLON {
    export class WebServer {
        private _bodyParser = require("body-parser");
        private _cookieParser = require("cookieparser");
        private _favicon = require("favicon");
        private _session = require("express-session");
        private _json = require("json");
        private _multer = require("multer");
       // private _flash = require('connect-flash');

        private _components: Array<iwsc.VORLON.IWebServerComponent>;
        private http: httpConfig.VORLON.HttpConfig;
        private _app: express.Express;

        constructor() {
            this._app = express();
            this._components = new Array<iwsc.VORLON.IWebServerComponent>();
            this.http = new httpConfig.VORLON.HttpConfig();
        }

        public init(): void {
            for (var id in this._components) {
                var component = this._components[id];
                component.addRoutes(this._app);
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
            this.init();

            //Sets
            app.set('port', process.env.PORT || 1337);
            app.set('views', path.join(__dirname, '../views'));
            app.set('view engine', 'jade');

            //Uses
            app.use(stylus.middleware(path.join(__dirname, '../public')));
            app.use(express.static(path.join(__dirname, '../public')));
            app.use(this._cookieParser);
            app.use(this._favicon);
            app.use(this._session({
               // secret: '1th3is4is3as2e5cr6ec7t7keyf23or1or5lon5',
                expires: false,
                saveUninitialized: true,
                resave: true }));
            app.use(this._bodyParser.json());
            app.use(this._bodyParser.urlencoded({ extended: true }));
            app.use(this._multer());
            app.use(vauth.VORLON.Authentication.Passport.initialize());
            app.use(vauth.VORLON.Authentication.Passport.session());
           // app.use(this._flash());
          
            //Authorization CORS
            //Ressource : http://enable-cors.org
            app.use((req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });
            
            vauth.VORLON.Authentication.initAuthentication();

            if (this.http.useSSL) {
                this.http.httpModule = this.http.httpModule.createServer(this.http.options, app).listen(app.get('port'), () => {
                    console.log('Vorlon with SSL listening on port ' + app.get('port'));
                });
            } else {
                this.http.httpModule = this.http.httpModule.createServer(app).listen(app.get('port'), () => {
                    console.log('Vorlon listening on port ' + app.get('port'));
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
