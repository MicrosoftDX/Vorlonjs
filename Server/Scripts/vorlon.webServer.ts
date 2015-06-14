import express = require("express");
import path = require("path");
import stylus = require("stylus");

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import httpConfig = require("../config/vorlon.httpconfig"); 

export module VORLON {
    export class WebServer {
        private _bodyParser = require("body-parser");
        private _cookieParser = require("cookieparser");
        private _favicon = require("favicon");
        private _session = require("express-session");
        private _json = require("json");
        private _multer = require("multer");
        private _passport = require('passport');
        private _localStrategy = require('passport-local').Strategy;

        static DisableLogin = true;
        private _components: Array<iwsc.VORLON.IWebServerComponent>;
        private http: httpConfig.VORLON.HttpConfig;
        private _app: express.Express;

        constructor() {
            this._app = express();
            this._components = new Array<iwsc.VORLON.IWebServerComponent>();
            this.http = new httpConfig.VORLON.HttpConfig();
        }

        public init(): void {
            //Initialize login management
            this.initializeLogin();

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
                secret: '1th3is4is3as2e5cr6ec7t7keyf23or1or5lon5',
                saveUninitialized: true,
                resave: true }));
            app.use(this._bodyParser.json());
            app.use(this._bodyParser.urlencoded({ extended: true }));
            app.use(this._multer());
            app.use(this._passport.initialize());
            app.use(this._passport.session());

            //Authorization CORS
            //Ressource : http://enable-cors.org
            app.use((req, res, next) => {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });

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

        private initializeLogin(): void {

            this._passport.use(new this._localStrategy(
                {   // set the field name here
                    usernameField: 'username',
                    passwordField: 'password'
                },
                function (username, password, done) {

                    if (username === "vorlon" && password === "vorlon") {
                        return done(null, { "id": "1", "username": "vorlon" });
                    }
                    else {
                        return done(null, false, { message: "The user is not exist" });
                    }
                }
                ));

            this._passport.serializeUser(function (user, done) {
                done(null, user.id);
            });

            this._passport.deserializeUser(function (id, done) {
                if (id === "1") {
                    return done(null, { "id": "1", "username": "vorlon" });
                }
                else {
                    return done(new Error('User ' + id + ' does not exist'));
                }
            });
        }

        //middleware for authentication
        static RequireAuth(req, res, next) {
            // check if the user is logged in
            if (!WebServer.DisableLogin && !req.isAuthenticated()) {
                //req.session.messages = "You need to login to view this page";
                res.redirect('/login');
            }
            next();
        }
    }
}
