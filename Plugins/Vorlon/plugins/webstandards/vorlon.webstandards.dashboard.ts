module VORLON {
    export class WebStandardsDashboard extends DashboardPlugin {
        constructor() {
            //     name   ,  html for dash   css for dash
            super("webstandards", "control.html", "control.css");
            this._id = "WEBSTANDARDS";
            this._ready = true;
            console.log('Started');
        }

        private _inputField: HTMLInputElement
        private _outputDiv: HTMLElement

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._inputField = <HTMLInputElement>filledDiv.querySelector('#echoInput');
                this._outputDiv = <HTMLElement>filledDiv.querySelector('#output');


                // Send message to client when user types and hits return
                this._inputField.addEventListener("keydown", (evt) => {
                    if (evt.keyCode === 13) {
                        this.sendToClient({
                            message: this._inputField.value
                        });

                        this._inputField.value = "";
                    }
                });
            })
        }

        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            var message = document.createElement('p');
            message.textContent = receivedObject.message;
            this._outputDiv.appendChild(message);
        }
    }
    
    WebStandardsDashboard.prototype.DashboardCommands = {
        example: function (data: any) {
            var plugin = <WebStandardsDashboard>this;
            //
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new WebStandardsDashboard());
}
