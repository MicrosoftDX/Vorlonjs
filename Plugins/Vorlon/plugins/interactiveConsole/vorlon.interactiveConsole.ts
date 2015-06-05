﻿module VORLON {
    export class InteractiveConsole extends Plugin {
        _cache = [];

        constructor() {
            super("interactiveConsole", "control.html", "control.css");
            this._ready = false;
            this._id = "CONSOLE";
        }

        public startClientSide(): void {
            // Overrides clear, log, error and warn
            Tools.Hook(window.console, "clear", (): void => {
                var data = {
                    type: "clear"
                };

                this.sendToDashboard(data, true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "log", (message: string): void => {
                var data = {
                    message: message,
                    type: "log"
                };

                this.sendToDashboard(data, true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "debug", (message: string): void => {
                var data = {
                    message: message,
                    type: "debug"
                };

                this.sendToDashboard(data, true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "info", (message: string): void => {
                var data = {
                    message: message,
                    type: "info"
                };

                this.sendToDashboard(data, true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "warn", (message: string): void => {
                var data = {
                    message: message,
                    type: "warn"
                };

                this.sendToDashboard(data, true);

                this._cache.push(data);
            });

            Tools.Hook(window.console, "error", (message: string): void => {
                var data = {
                    message: message,
                    type: "error"
                };
                //Core.Messenger.sendMonitoringMessage(this.getID(), data.message);
                this.sendToDashboard(data, true);

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

                this.sendToDashboard(data, true);

                this._cache.push(data);

                return error;
            });
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            switch (receivedObject.type) {
                case "eval":
                    try {
                        eval(receivedObject.order);
                    } catch (e) {
                        console.error("Unable to execute order: " + e.message);
                    }
                    break;
            }
        }

        public refresh(): void {
            this.sendToDashboard({
                type: "clear"
            });

            for (var index = 0; index < this._cache.length; index++) {
                this.sendToDashboard(this._cache[index], true);
            }
        }

        // DASHBOARD
        private _containerDiv: HTMLElement;
        private _interactiveInput: HTMLInputElement;
        private _commandIndex: number;
        private _commandHistory = [];


        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                // Log container
                this._containerDiv = Tools.QuerySelectorById(filledDiv, "logs");

                // Interactive console
                this._interactiveInput = <HTMLInputElement>Tools.QuerySelectorById(div, "input");
                this._interactiveInput.addEventListener("keydown", (evt) => {
                    if (evt.keyCode === 13) { //enter
                        this.sendToClient({
                            order: this._interactiveInput.value,
                            type: "eval"
                        });

                        this._commandHistory.push(this._interactiveInput.value);
                        this._commandIndex = null;
                        this._interactiveInput.value = "";
                    } if (evt.keyCode === 38) { // up arrow

                        if(this._commandIndex == null) this._commandIndex = this._commandHistory.length;

                        if (this._commandHistory.length > 0 && this._commandIndex > 0) {
                            this._commandIndex--;

                            this._interactiveInput.value = this._commandHistory[this._commandIndex];
                        }
                    } else if (evt.keyCode === 40) { // down arrow
                        if (this._commandHistory.length > 0 && this._commandIndex != null) {
                            if (this._commandIndex < this._commandHistory.length - 1) {
                                this._commandIndex++;
                                this._interactiveInput.value = this._commandHistory[this._commandIndex];
                            } else {
                                this._interactiveInput.value = "";
                                this._commandIndex = null;
                            }
                        }
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
                case "debug":
                    messageDiv.innerHTML = receivedObject.message;
                    Tools.AddClass(messageDiv, "logDebug");
                    break;
                case "info":
                    messageDiv.innerHTML = receivedObject.message;
                    Tools.AddClass(messageDiv, "logInfo");
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