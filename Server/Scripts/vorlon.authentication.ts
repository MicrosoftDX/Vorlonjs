import fs = require("fs");
import path = require("path");
import config = require("../config/vorlon.configprovider");

export module VORLON {
    export class Authentication  {
        public static ActivateAuth: boolean = false;
        public static UserName: string;
        public static Password: string;
        public static BaseURL: string;

        public static ensureAuthenticated(req, res, next) {
            if (!Authentication.ActivateAuth || req.isAuthenticated()) { return next(); }
            res.redirect(Authentication.BaseURL + '/login');
        }

        public static loadAuthConfig(baseURL : string): void {
             fs.readFile(config.VORLON.ConfigProvider.getConfigPath(), "utf8",(err, catalogdata) => {
                if (err) {
                    return;
                }
                var catalog = JSON.parse(catalogdata.replace(/^\uFEFF/, ''));

                if(catalog.activateAuth){
                    Authentication.ActivateAuth = catalog.activateAuth;
                }
                if(catalog.username){
                    Authentication.UserName = catalog.username;
                }
                if(catalog.password){
                    Authentication.Password = catalog.password;
                }
                Authentication.BaseURL = baseURL;
            });
        }
    }
};
