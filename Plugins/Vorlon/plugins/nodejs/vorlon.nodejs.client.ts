module VORLON {
    export class NodejsClient extends ClientPlugin {

        constructor() {
            super("nodejs"); // Name
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

        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            if (receivedObject == 'modules') {
                this.sendToDashboard({ type: 'modules', data: Object.keys(require('module')._cache)});
            } else if (receivedObject == 'routes') {
                console.log('test');
                console.log('test2');
                var routes = [];
                this.sendToDashboard({ type: 'modules', data: routes});
            }  else if (receivedObject == 'memory') {
                this.sendToDashboard({ type: 'memory', data: process.memoryUsage()});
            }
        }
    }

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new NodejsClient());
}
