import express = require("express");
import http = require("http");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import ws = require("./vorlon.webServer");
import vauth = require("./vorlon.authentication");

export module VORLON {
    export class Dashboard implements iwsc.VORLON.IWebServerComponent {
        constructor() {
            //Nothing for now
        }

        public addRoutes(app: express.Express, passport: any): void {
            app.route('/').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard);
            app.route('/dashboard').get(vauth.VORLON.Authentication.ensureAuthenticated,this.defaultDashboard);
            app.route('/dashboard/').get(vauth.VORLON.Authentication.ensureAuthenticated,this.defaultDashboard);

            app.route('/dashboard/:sessionid').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboard);
            app.route('/dashboard/:sessionid/reset').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboardServerReset);
            app.route('/dashboard/:sessionid/:clientid').get(vauth.VORLON.Authentication.ensureAuthenticated,this.dashboardWithClient);
            
            //login
            app.post('/login',   
                    passport.authenticate('local', 
                        { failureRedirect: '/login',
                          successRedirect: '/',
                          failureFlash: false })
                );
            
           app.route('/login').get(this.login);     
        }

        public start(httpServer: http.Server): void {
            //Not implemented
        }

        //Routes
        private defaultDashboard(req: express.Request, res: express.Response) {
            res.redirect('/dashboard/default');
        }

        private dashboard(req: express.Request, res: express.Response) {
            res.render('dashboard', { title: 'Dashboard', sessionid: req.params.sessionid, clientid: "" });
        }

        private dashboardWithClient(req: express.Request, res: express.Response) {
            res.render('dashboard', { title: 'Dashboard', sessionid: req.params.sessionid, clientid: req.params.clientid });
        }

        private getsession(req: express.Request, res: express.Response) {
            res.render('getsession', { title: 'Get Session' });
        }
        
        private login(req: express.Request, res: express.Response) {
            res.render('login', { message: 'Please login' });
        }

        private dashboardServerReset(req: any, res: any) {
            var sessionid = req.params.sessionid;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        res.send("Done.");
                    }
                }
            }

            xhr.open("GET", "http://" + req.headers.host + "/api/reset/" + sessionid);
            xhr.send();
        }
    }
};
