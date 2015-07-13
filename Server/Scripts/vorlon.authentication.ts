
export module VORLON {
    export class Authentication  {
        public static ActivateAuth: boolean = false;
        
        public static ensureAuthenticated(req, res, next) { 
            if (!Authentication.ActivateAuth || req.isAuthenticated()) { return next(); } 
            res.redirect('/login');
        } 
    }
};
