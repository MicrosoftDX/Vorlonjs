module VORLON {
    export class InteractiveConsole extends Plugin {
        _cache = [];

        constructor() {
            super("interactiveConsole", "control.html", "control.css");
            this._ready = false;
        }

        public getID(): string {
            return "CONSOLE";
        }

        public startClientSide(): void {
            // Overrides clear, log, error and warn
            Tools.Hook(window.console, "clear",(): void => {
                var data = {
                    type: "clear"
                };

                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "log",(message: string): void => {
                var data = {
                    message: message,
                    type: "log"
                };

                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "warn",(message: string): void => {
                var data = {
                    message: message,
                    type: "warn"
                };

                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "error",(message: string): void => {
                var data = {
                    message: message,
                    type: "error"
                };
                //Core.Messenger.sendMonitoringMessage(this.getID(), data.message);
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", true);

                this._cache.push(data);
            });

            // Override Error constructor
            var previousError = Error;

            Error = <any>((message: string) => {
                var error = new previousError(message);

                var data = {
                    message: message,
                    type: "exception"
                };

                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", true);

                this._cache.push(data);

                return error;
            });
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            switch (receivedObject.type) {
                case "eval":
                    try {
                        console.log("Executing order: " + receivedObject.order);
                        eval(receivedObject.order);
                    } catch (e) {
                        console.error("Unable to execute order: " + e.message);
                    }
                    break;
            }
        }

        public refresh(): void {
            Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "clear"
            }, RuntimeSide.Client);

            for (var index = 0; index < this._cache.length; index++) {
                Core.Messenger.sendRealtimeMessage(this.getID(), this._cache[index], RuntimeSide.Client, "message", true);
            }
        }

        // DASHBOARD
        private _containerDiv: HTMLElement;
        private _interactiveInput: HTMLInputElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                // Log container
                this._containerDiv = document.getElementById("logs");

                // Interactive console
                this._interactiveInput = <HTMLInputElement>document.getElementById("input");
                this._interactiveInput.addEventListener("keydown",(evt) => {
                    if (evt.keyCode === 13) {
                        Core.Messenger.sendRealtimeMessage(this.getID(), {
                            order: this._interactiveInput.value,
                            type: "eval"
                        }, RuntimeSide.Dashboard);

                        this._interactiveInput.value = "";
                    }
                });

                this._ready = true;
            });
        }
        
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === "clear") {
                while (this._containerDiv.hasChildNodes()) {
                    this._containerDiv.removeChild(this._containerDiv.lastChild);
                }
                return;
            }

            var messageDiv = document.createElement("div");
            Tools.AddClass(messageDiv, "log");
            switch (receivedObject.type) {
                case "log":
                    messageDiv.innerHTML = receivedObject.message;
                    Tools.AddClass(messageDiv, "logMessage");
                    break;
                case "warn":
                    messageDiv.innerHTML = receivedObject.message;
                    Tools.AddClass(messageDiv, "logWarning");
                    break;
                case "error":
                    messageDiv.innerHTML = receivedObject.message;
                    Tools.AddClass(messageDiv, "logError");
                    break;
                case "exception":
                    messageDiv.innerHTML = receivedObject.message;
                    Tools.AddClass(messageDiv, "logException");
                    break;
                case "order":
                    this._interactiveInput.value = "document.getElementById(\"" + receivedObject.order + "\")";
                    return;
            }

            this._containerDiv.insertBefore(messageDiv, this._containerDiv.childNodes.length > 0 ? this._containerDiv.childNodes[0] : null);
        }
    }

    // Register
    Core.RegisterPlugin(new InteractiveConsole());
}