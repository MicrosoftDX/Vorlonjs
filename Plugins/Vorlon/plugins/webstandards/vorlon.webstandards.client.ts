module VORLON {
    export class WebStandardsClient extends ClientPlugin {

        constructor() {
            super("webstandards");
            this._id = "WEBSTANDARDS";
            this._ready = true;
            //this.debug = true;
            console.log('Web Standards started');
        }


        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        }

        // Start the clientside code
        public startClientSide(): void {
            
        }
    }
    
    WebStandardsClient.prototype.ClientCommands = {
        example: function (data: any) {
            var plugin = <WebStandardsClient>this;
            //
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new WebStandardsClient());
}
