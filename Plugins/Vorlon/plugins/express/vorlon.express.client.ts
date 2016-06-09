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
            return "NODEJS";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard

            //we don't really need to do anything in this sample
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {
            //this.setupExpressHook();
        }

        public setupExpressHook(){
          console.log('Hooking express');

            var expressSource;

            if (!Tools.IsWindowAvailable) {
                if (!this._hookAlreadyDone) {
                    this._hookAlreadyDone = true;
                    var express = require('express');
                }
            }

            this.hooked = true;
        }

        private _hookPrototype(that, expressSource) {
            if(!this._previousExpress){
                this._previousExpress = expressSource.application.init;
            }

            expressSource.application.init = function() {
                console.log('IN EXPRESS !');
                return that._previousExpress.apply(this);
            }
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            if (!Tools.IsWindowAvailable) {
              if (receivedObject == 'express') {
                this.sendToDashboard({ type: 'express', data: global.express_vorlonJS});
              }
            }
        }
    }

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new ExpressClient());
}
