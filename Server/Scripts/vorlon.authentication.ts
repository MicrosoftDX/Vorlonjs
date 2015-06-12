
export module VORLON {
    export class Authentication  {
        public static Passport = require("passport");
        public static LocalStrategy = require("passport-local").Strategy;
        public static ActivateAuth: boolean = false;
        
        public static initAuthentication(){
            Authentication.Passport.use(new Authentication.LocalStrategy(function(username, password, done) { 
                    // insert your MongoDB check here. For now, just a simple hardcoded check.
                    if (username === 'vorlon' && password === 'vorlon')
                    {
                        done(null, { user: username });
                    }
                    else
                    {
                        done(null, false);
                    }
                })
            );
            
            Authentication.Passport.serializeUser(function(user, done) { 
                done(null, user.id); 
            }); 
        
            Authentication.Passport.deserializeUser(function(id, done) { 
                done(null,  { 'id' : '1', 'login' : 'vorlon'}); 
            }); 
        }
        
        public static ensureAuthenticated(req, res, next) { 
            if (!Authentication.ActivateAuth || req.isAuthenticated()) { return next(); } 
            res.redirect('/login') 
        } 
    }
};
