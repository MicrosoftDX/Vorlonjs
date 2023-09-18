import express = require("express");
import http = require("http");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
import fs = require("fs");
import path = require("path");
var packageJson = require("../../package.json");

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import vauth = require("./vorlon.authentication");
import vorloncontext = require("../config/vorlon.servercontext");
import config = require("../config/vorlon.configprovider");

export module VORLON {
    export class Dashboard implements iwsc.VORLON.IWebServerComponent {
        private baseURLConfig: vorloncontext.VORLON.IBaseURLConfig;
        private _log: vorloncontext.VORLON.ILogger;

        constructor(context : vorloncontext.VORLON.IVorlonServerContext) {
            this.baseURLConfig = context.baseURLConfig;
            this._log = context.logger;
        }

        public addRoutes(app: express.Express, passport: any): void {
            app.route(this.baseURLConfig.baseURL + '/').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard').get(vauth.VORLON.Authentication.ensureAuthenticated,this.defaultDashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard/').get(vauth.VORLON.Authentication.ensureAuthenticated,this.defaultDashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard/:sessionid').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboard());
            app.route(this.baseURLConfig.baseURL + '/dashboard/:sessionid/reset').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboardServerReset());
            app.route(this.baseURLConfig.baseURL + '/dashboard/:sessionid/:clientid').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboardWithClient());
            app.route(this.baseURLConfig.baseURL + '/config').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboardConfig());

            //login
            app.post(this.baseURLConfig.baseURL + '/login',
                    passport.authenticate('local',
                        { failureRedirect: this.baseURLConfig.baseURL + '/login',
                          successRedirect: this.baseURLConfig.baseURL + '/',
                          failureFlash: false })
                );

           app.route(this.baseURLConfig.baseURL + '/login').get((req: express.Request, res: express.Response) => {
                    res.render('login', { baseURL: this.baseURLConfig.baseURL, message: 'Please login' });
                });
           app.get(this.baseURLConfig.baseURL + '/logout', this.logout);
        }

        public start(httpServer: http.Server): void {
            //Not implemented
        }

        //Routes
        private defaultDashboard() {
            return (req: express.Request, res: express.Response) => {
                res.redirect(this.baseURLConfig.baseURL + '/dashboard/default');
            };
        }

        private dashboard() {
            return (req: express.Request, res: express.Response) => {
                var authent = false;
                var configastext = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath());
                var catalog = JSON.parse(configastext.toString().replace(/^\uFEFF/, ''));

                if(catalog.activateAuth){
                    authent = catalog.activateAuth;
                }

                //this._log.debug("authenticated " + authent);
                res.render('dashboard', { baseURL: this.baseURLConfig.baseURL, title: 'Dashboard', sessionid: req.params.sessionid, clientid: "", authenticated: authent, version: packageJson.version });
            }
        }

        private dashboardWithClient() {
            return (req: express.Request, res: express.Response) => {
                res.render('dashboard', { baseURL: this.baseURLConfig.baseURL, title: 'Dashboard', sessionid: req.params.sessionid, clientid: req.params.clientid, version: packageJson.version });
            }
        }

        private dashboardConfig() {
            return (req: express.Request, res: express.Response) => {
                res.render('config', { baseURL: this.baseURLConfig.baseURL, title: 'Configuration', sessionid: "default", clientid: "", version: packageJson.version });
            };
        }

        private getsession(req: express.Request, res: express.Response) {
            return (req: express.Request, res: express.Response) => {
                 res.render('getsession', { title: 'Get Session' });
            }
        }

        private logout(req: any, res: any) {
            req.logout();
            res.redirect('/');
        }

        private dashboardServerReset() {
            return (req: any, res: any) => {
                var sessionid = req.params.sessionid;
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            res.send("Done.");
                        }
                    }
                }

                xhr.open("GET", "http://" + req.headers.host + this.baseURLConfig.baseURL + "/api/reset/" + sessionid);
                xhr.send();
            }
        }
    }
};
