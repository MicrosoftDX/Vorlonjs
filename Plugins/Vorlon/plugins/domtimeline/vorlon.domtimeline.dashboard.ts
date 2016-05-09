/// <reference path="api/vorlon.core.d.ts" />
/// <reference path="api/vorlon.dashboardPlugin.d.ts" />
module VORLON {
	
    export class DOMTimelineDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("domtimeline", "control.html", "control.css");
            (<any>this)._ready = true;
            this._messageHandlers = {};
            this._messageId = 0;
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "DOMTIMELINE";
        }

        // This code will run on the dashboard //////////////////////

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard
        private _inputField: HTMLInputElement
        private _outputDiv: HTMLElement
        private _toastDiv: HTMLElement
        private _messageId: number;
        private _messageHandlers: {[s:string]:(receivedObject:any)=>void};
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._inputField = <HTMLInputElement>filledDiv.querySelector('#echoInput');
                this._outputDiv = <HTMLElement>filledDiv.querySelector('#output');
                this._toastDiv = <HTMLElement>filledDiv.querySelector('#toast');

				// Handle toolbar buttons
				var me = this;
				var clientCommands = filledDiv.querySelectorAll("[data-client-command]");
				for(var i = clientCommands.length; i--;) { var clientCommand = <HTMLElement>clientCommands[i];
					clientCommand.onclick = function(event) {
						me.sendMessageToClient(this.getAttribute("data-client-command"), (e)=>me.logMessage(e));
					};
				}

                // Send message to client when user types and hits return
                this._inputField.addEventListener("keydown", (evt) => {
                    if (evt.keyCode === 13) {
                        this.sendMessageToClient(this._inputField.value, (e)=>me.logMessage(e));
                        this._inputField.value = "";
                    }
                });
                
                // Refresh the output from time to time
                var alreadyKnownEvents = [];
                setInterval(function() {
                    me.sendMessageToClient(
                        "domHistory.generateDashboardData("+alreadyKnownEvents.length+")", 
                        (e)=>{
                            alreadyKnownEvents = e.message.history = alreadyKnownEvents.concat(e.message.history);
                            for(var i = alreadyKnownEvents.length; i--;) {
                                alreadyKnownEvents[i].isCancelled = i >= e.message.pastEventsCount;
                            }
                            me._outputDiv.textContent=JSON.stringify(e.message,null,"    ");
                        }
                    ); 
                }, 100);
            })
        }

        // When we get a message from the client, just show it        
        public logMessage(receivedObject: any) {
            var message = document.createElement('p');
            message.textContent = receivedObject.message;
            this._toastDiv.appendChild(message);
        }
		
        // sends a message to the client, and enables you to provide a callback for the reply
		public sendMessageToClient(message: string, callback:(receivedObject:any)=>void = undefined) {
            var messageId = this._messageId++;
            if(callback) this._messageHandlers[messageId] = callback;
			this.sendToClient({message,messageId});
		}

        // execute the planned callback when we receive a message from the client
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            var callback = this._messageHandlers[receivedObject.messageId];
            if(callback) {
                this._messageHandlers[receivedObject.messageId] = undefined;
                callback(receivedObject);
            }
        }
    }

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new DOMTimelineDashboard());
}
