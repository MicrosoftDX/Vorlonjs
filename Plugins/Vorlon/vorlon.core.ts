﻿module VORLON {
    export class Core {
        static _plugins = new Array<Plugin>();
        static _messenger: ClientMessenger;
        static _sessionID: string;
        static _listenClientId: string;
        static _side: RuntimeSide;
        static _errorNotifier: any;
        static _messageNotifier: any;
        static _socketIOWaitCount = 0;

        static _RetryTimeout = 1002;

        public static get Messenger(): ClientMessenger {
            return Core._messenger;
        }

        public static get Plugins(): Array<Plugin> {
            return Core._plugins;
        }

        public static RegisterPlugin(plugin: Plugin): void {
            Core._plugins.push(plugin);
        }

        public static Start(serverUrl = "'http://localhost:1337/'", sessionId = "", listenClientId = "",  divMapper: (string) => HTMLDivElement = null): void {
            Core._side = RuntimeSide.Client;
            Core._sessionID = sessionId;
            Core._listenClientId = listenClientId;
            
            if (!serverUrl) {
                Core._side = RuntimeSide.Both;
            }

            if (divMapper) {
                Core._side = RuntimeSide.Dashboard;
                
                /* Notification elements */
                Core._errorNotifier = document.createElement('x-notify');
                Core._errorNotifier.setAttribute('type', 'error');
                Core._errorNotifier.setAttribute('position', 'top');
                Core._errorNotifier.setAttribute('duration', 5000);
                
                Core._messageNotifier = document.createElement('x-notify');
                Core._messageNotifier.setAttribute('position', 'top');
                Core._messageNotifier.setAttribute('duration', 4000);
                
                document.body.appendChild(Core._errorNotifier);
                document.body.appendChild(Core._messageNotifier);
            }
            
            // Checking socket.io
            if (Core._side !== RuntimeSide.Both) {
                if ((<any>window).io === undefined) {
                    
                    if (this._socketIOWaitCount < 10) {
                        this._socketIOWaitCount++;
                        // Let's wait a bit just in case socket.io was loaded asynchronously
                        setTimeout(function() {
                            console.log("Vorlon.js: waiting for socket.io to load...");
                            Core.Start(serverUrl, sessionId, listenClientId, divMapper);
                        }, 1000);
                    } else {
                        console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                        Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                    }
                    return;
                }   
            }

            // Cookie
            var clientId = Tools.ReadCookie("vorlonJS_clientId");
            if (!clientId) {
                clientId = Tools.CreateGUID();

                Tools.CreateCookie("vorlonJS_clientId", clientId, 1);
            }

            // Creating the messenger
            Core._messenger = new ClientMessenger(Core._side, serverUrl, sessionId, clientId, listenClientId);

            // Connect messenger to dispatcher
            Core.Messenger.onRealtimeMessageReceived = Core._Dispatch;
            Core.Messenger.onHeloReceived = Core._OnIdentificationReceived;
            Core.Messenger.onIdentifyReceived = Core._OnIdentifyReceived;
            Core.Messenger.onStopListenReceived = Core._OnStopListenReceived;
            Core.Messenger.onError = Core._OnError;

            // Say 'helo'
            var heloMessage = {
                ua: navigator.userAgent
            };
            
            Core.Messenger.sendRealtimeMessage("", heloMessage, Core._side, "helo");

            // Launch plugins
            for (var index = 0; index < Core._plugins.length; index++) {
                var plugin = Core._plugins[index];
                Core._startPlugin(Core._plugins[index], divMapper);  
            }

            if (Core._side === RuntimeSide.Client) { // handle client disconnection
                window.addEventListener("beforeunload", function () {
                    Core.Messenger.sendRealtimeMessage("", { socketid: Core.Messenger.socketId }, Core._side, "clientclosed");
                }, false);
            }
        }
        
        private static _startPlugin(plugin : Plugin,  divMapper: (string) => HTMLDivElement = null){
            if (Core._side === RuntimeSide.Both || Core._side === RuntimeSide.Client) {
                plugin.startClientSide();
            }

            if (Core._side === RuntimeSide.Both || Core._side === RuntimeSide.Dashboard) {
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        }

        private static _OnStopListenReceived(): void {
            Core._listenClientId = "";
        }

        private static _OnIdentifyReceived(message: string): void {
            if (Core._side == RuntimeSide.Dashboard) {
                Core._messageNotifier.innerHTML = message;
                Core._messageNotifier.show();
            }
            else {
                var div = document.createElement("div");
                div.style.position = "absolute";
                div.style.left = "0";
                div.style.top = "50%";
                div.style.marginTop = "-150px";
                div.style.width = "100%";
                div.style.height = "300px";
                div.style.fontFamily = "Arial";
                div.style.fontSize = "300px";
                div.style.textAlign = "center";
                div.style.color = "white";
                div.style.textShadow = "2px 2px 5px black";
                div.style.zIndex = "100";
                div.innerHTML = message;
    
                document.body.appendChild(div);
    
                setTimeout(() => {
                    document.body.removeChild(div);
                }, 4000);
            }
        }

        private static ShowError(message: string, timeout = 5000) {
            
            if (Core._side == RuntimeSide.Dashboard) {
                Core._errorNotifier.innerHTML = message;
                Core._errorNotifier.setAttribute('duration', timeout);
                Core._errorNotifier.show();
            }
            else {
                var divError = document.createElement("div");
                divError.style.position = "absolute";
                divError.style.top = "0";
                divError.style.left = "0";
                divError.style.width = "100%";
                divError.style.height = "100px";
                divError.style.backgroundColor = "red";
                divError.style.textAlign = "center";
                divError.style.fontSize = "30px";
                divError.style.paddingTop = "20px";
                divError.style.color = "white";
                divError.style.fontFamily = "consolas";
    
                divError.innerHTML = message;
    
                document.body.appendChild(divError);
    
                if (timeout) {
                    setTimeout(() => {
                        document.body.removeChild(divError);
                    }, timeout);
                }
            }
        }

        private static _OnError(err: Error): void {
            Core.ShowError("Error while connecting to server. Server may be offline.<BR>Error message: " + err.message);
        }

        private static _OnIdentificationReceived(id: string): void {
            Core._listenClientId = id;

            if (Core._side === RuntimeSide.Client) {
                // Refresh plugins
                for (var index = 0; index < Core._plugins.length; index++) {
                    var plugin = Core._plugins[index];
                    plugin.refresh();
                }
            }
        }

        private static _RetrySendingRealtimeMessage(plugin: Plugin, receivedObject: any) {
            setTimeout(() => {
                if (plugin.isReady()) {
                    plugin.onRealtimeMessageReceivedFromClientSide(receivedObject);
                    return;
                }

                Core._RetrySendingRealtimeMessage(plugin, receivedObject);
            },  Core._RetryTimeout);
        }

        private static _Dispatch(pluginID: string, receivedObject: any): void {
            var side = receivedObject._side;
            delete receivedObject._side;
            for (var index = 0,  length = Core._plugins.length; index < length; index++) {
                var plugin = Core._plugins[index];

                if (plugin.getID() === pluginID) {
                    Core._DispatchPluginMessage(plugin, side, receivedObject);
                    return;
                }
            }
        }
        
        private static _DispatchPluginMessage(plugin: Plugin, side: any, receivedObject: any): void {
            if (side === RuntimeSide.Client) {
                if (!plugin.isReady()) { // Plugin is not ready, let's try again later
                    Core._RetrySendingRealtimeMessage(plugin, receivedObject);
                } else {
                     plugin.onRealtimeMessageReceivedFromClientSide(receivedObject);
                }
            } else {
                plugin.onRealtimeMessageReceivedFromDashboardSide(receivedObject);
            }            
        }
    }
}
