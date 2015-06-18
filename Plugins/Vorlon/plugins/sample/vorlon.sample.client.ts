module VORLON {
    export class SampleClient extends ClientPlugin {

        constructor() {
            super("sample"); // Name
            this._ready = true; // No need to wait
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "SAMPLE";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard

            //we don't really need to do anything in this sample
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {
            //don't actually need to do anything at startup
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            console.log('Got message from sample plugin', receivedObject.message);
            //The dashboard will send us an object like { message: 'hello' }
            //Let's just return it, reversed
            var data = {
                message: receivedObject.message.split("").reverse().join("")
            };

            this.sendToDashboard(data);
        }
    }

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new SampleClient());
}
