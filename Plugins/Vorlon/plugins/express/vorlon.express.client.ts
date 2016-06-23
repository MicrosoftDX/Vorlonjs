module VORLON {
    export class ExpressClient extends ClientPlugin {
        private _previousExpress;
        private _expressSource;
        private _hookAlreadyDone;
        public hooked: boolean = false;

        constructor() {
            super("express"); // Name
            this._ready = true; // No need to wait
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "EXPRESS";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard

            //we don't really need to do anything in this sample
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {

        }


        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            if (!Tools.IsWindowAvailable) {
              if (receivedObject == 'express') {
                if (typeof global.EXPRESS_VORLONJS === 'undefined') {
                    this.sendToDashboard({ type: 'express', data: false});
                } else {
                    this.sendToDashboard({ type: 'express', data: true});
                }
              } else if (receivedObject == 'express_route') {
                  var routes = [];
                global.EXPRESS_VORLONJS._router.stack          // registered routes
                .filter(r => r.route)    // take out all the middleware
                .map(r => routes.push(r.route))  // get all the paths
                this.sendToDashboard({ type: 'express_route', data: routes});
              } else if (receivedObject == 'express_request') {
                var __this = this;
                var found = false;
                var middlewares = global.EXPRESS_VORLONJS._router.stack;
                for (var m = 0, len = middlewares.length; m < len; m++) { 
                    if (middlewares[m].name == 'request_interceptor') {
                        found = true;
                    }   
                }
                
                if (!found) {
                    global.EXPRESS_VORLONJS.use('request_interceptor', function(req, res, next) {
                        req.on("end", function() {
                            __this.sendToDashboard({ 
                                type: 'express_request', 
                                data: {
                                    code: res.statusCode,
                                    method: req.method,
                                    url: req.url,
                                    headers: req.headers
                                }
                            });
                        });
                        next();
                    });
                }
                
                var middlewares = global.EXPRESS_VORLONJS._router.stack;
                for (var m = 0, len = middlewares.length; m < len; m++) { 
                    if (middlewares[m].regexp.toString().indexOf('request_interceptor') != -1) {
                            var element = middlewares[m];
                            var regexp = /^\/?(?=\/|$)/i;
                            global.EXPRESS_VORLONJS._router.stack[m].regexp = regexp;
                            global.EXPRESS_VORLONJS._router.stack[m].name = 'request_interceptor';
                            global.EXPRESS_VORLONJS._router.stack.splice(m, 1);
                            global.EXPRESS_VORLONJS._router.stack.splice(2, 0, element);
                    }   
                }
              } else if (receivedObject == 'express_locals') {
                  this.sendToDashboard({ type: 'express_locals', data: JSON.stringify(global.EXPRESS_VORLONJS.locals, undefined, 4)});
              }
            }
        }
    }

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new ExpressClient());
}
