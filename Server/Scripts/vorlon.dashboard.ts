import express = require("express");
import http = require("http");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import ws = require("./vorlon.webServer");

export module VORLON {
    export class Dashboard implements iwsc.VORLON.IWebServerComponent {
        private _passport = require('passport');

        constructor() {
            //Nothing for now
        }

        public addRoutes(app: express.Express): void {
            //Get
            //app.route('/').get(this.getsession);
            //app.route('/login').get(this.login);
            //app.route('/dashboard').get(ws.VORLON.WebServer.RequireAuth, this.getsession);
            //app.route('/getsession').get(this.getsession);

            app.route('/').get(this.defaultDashboard);
            app.route('/dashboard').get(this.defaultDashboard);
            app.route('/dashboard/').get(this.defaultDashboard);

            app.route('/dashboard/:sessionid').get(this.dashboard);
            app.route('/dashboard/:sessionid/reset').get(this.dashboardServerReset);
            app.route('/dashboard/:sessionid/:clientid').get(this.dashboardWithClient);

            //Post
            app.route('/login').post(this.loginPost);
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

        private login(req: express.Request, res: express.Response) {
            if (req.user) {
                // already logged in
                res.redirect('/');
            } else {
                // not logged in, show the login form, remember to pass the message
                // for displaying when error happens
                res.render('login', { message: "Please login" });
            }
        }

        private loginPost(req, res, next) {
            // ask passport to authenticate
            this._passport.authenticate('local', function (err, user, info) {
                if (err) {
                    // if error happens
                    return next(err);
                }

                if (!user) {
                    // if authentication fail, get the error message that we set
                    // from previous (info.message) step, assign it into to
                    // req.session and redirect to the login page again to display
                    //req.session.messages = info.message;
                    return res.redirect('/login');
                }

                // if everything's OK
                req.logIn(user, function (err) {
                    if (err) {
                        //req.session.messages = "Error";
                        return next(err);
                    }

                    // set the message
                    req.session.messages = "Login successfully";
                    return res.redirect('/');
                });

            })(req, res, next);
        }
    }
};
