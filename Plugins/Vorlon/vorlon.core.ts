module VORLON {

    export class _Core {
        _plugins = new Array<Plugin>();
        _messenger: ClientMessenger;
        _sessionID: string;
        _listenClientId: string;
        _side: RuntimeSide;
        _errorNotifier: any;
        _messageNotifier: any;
        _socketIOWaitCount = 0;
        public debug: boolean = false;

        _RetryTimeout = 1002;

        public get Messenger(): ClientMessenger {
            return Core._messenger;
        }

        public get Plugins(): Array<Plugin> {
            return Core._plugins;
        }

        public RegisterPlugin(plugin: Plugin): void {
            Core._plugins.push(plugin);
        }

        public Start(serverUrl = "'http://localhost:1337/'", sessionId = "", listenClientId = "", divMapper: (string) => HTMLDivElement = null): void {
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
                        setTimeout(function () {
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

                // Start global dirty check
                var content;
                if (document.body)
                    content = document.body.innerHTML;
                setInterval(() => {
                    if (!content) {
                        if (document.body)
                            content = document.body.innerHTML;
                        return;
                    }
                    var html = document.body.innerHTML
                    if (content != html) {
                        content = html;
                        Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                            type: 'contentchanged',
                            content: html
                        }, Core._side, 'message');
                    }
                }, 2000);
            }
        }

        private _startPlugin(plugin: Plugin, divMapper: (string) => HTMLDivElement = null) {
            if (Core._side === RuntimeSide.Both || Core._side === RuntimeSide.Client) {
                plugin.startClientSide();
            }

            if (Core._side === RuntimeSide.Both || Core._side === RuntimeSide.Dashboard) {
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        }

        private _OnStopListenReceived(): void {
            Core._listenClientId = "";
        }

        private _OnIdentifyReceived(message: string): void {
            //console.log('identify ' + message);
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

        private ShowError(message: string, timeout = 5000) {

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

        private _OnError(err: Error): void {
            Core.ShowError("Error while connecting to server. Server may be offline.<BR>Error message: " + err.message);
        }

        private _OnIdentificationReceived(id: string): void {
            //console.log('helo received ' + id);
            Core._listenClientId = id;

            if (Core._side === RuntimeSide.Client) {
                // Refresh plugins
                for (var index = 0; index < Core._plugins.length; index++) {
                    var plugin = Core._plugins[index];
                    plugin.refresh();
                }
            }
        }

        private _RetrySendingRealtimeMessage(plugin: Plugin, message: VorlonMessage) {
            setTimeout(() => {
                if (plugin.isReady()) {
                    Core._DispatchFromClientPluginMessage(plugin, message);
                    return;
                }

                Core._RetrySendingRealtimeMessage(plugin, message);
            }, Core._RetryTimeout);
        }

        private _Dispatch(message: VorlonMessage): void {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }

            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                Core._plugins.forEach((plugin) => {
                    Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                Core._plugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        }

        private _DispatchPluginMessage(plugin: Plugin, message: VorlonMessage): void {
            plugin.trace('received ' + JSON.stringify(message));
            if (message.metadata.side === RuntimeSide.Client) {
                if (!plugin.isReady()) { // Plugin is not ready, let's try again later
                    Core._RetrySendingRealtimeMessage(plugin, message);
                } else {
                    Core._DispatchFromClientPluginMessage(plugin, message);
                }
            } else {
                Core._DispatchFromDashboardPluginMessage(plugin, message);
            }
        }

        private _DispatchFromClientPluginMessage(plugin: Plugin, message: VorlonMessage): void {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        }

        private _DispatchFromDashboardPluginMessage(plugin: Plugin, message: VorlonMessage): void {
            if (message.command && plugin.ClientCommands) {
                var command = plugin.ClientCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromDashboardSide(message.data);
        }
    }

    export var Core = new _Core();
}
