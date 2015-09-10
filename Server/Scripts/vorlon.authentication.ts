import fs = require("fs");
import path = require("path");

export module VORLON {
    export class Authentication  {
        public static ActivateAuth: boolean = false;
        public static UserName: string;
        public static Password: string;
        
        public static ensureAuthenticated(req, res, next) { 
            if (!Authentication.ActivateAuth || req.isAuthenticated()) { return next(); } 
            res.redirect('/login');
        } 
        
        public static loadAuthConfig(): void {
             fs.readFile(path.join(__dirname, "../config.json"), "utf8",(err, catalogdata) => {
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
            });
        }
    }
};
