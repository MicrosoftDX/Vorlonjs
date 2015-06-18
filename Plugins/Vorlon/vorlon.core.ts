module VORLON {

    export class _Core {
        _clientPlugins = new Array<ClientPlugin>();
        _dashboardPlugins = new Array<DashboardPlugin>();
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

        public get ClientPlugins(): Array<ClientPlugin> {
            return Core._clientPlugins;
        }
        
        public get DashboardPlugins(): Array<DashboardPlugin> {
            return Core._dashboardPlugins;
        }

        public RegisterClientPlugin(plugin: ClientPlugin): void {
            Core._clientPlugins.push(plugin);
        }
        
        public RegisterDashboardPlugin(plugin: DashboardPlugin): void {
            Core._dashboardPlugins.push(plugin);
        }
        
        public StartClientSide(serverUrl = "'http://localhost:1337/'", sessionId = "", listenClientId = ""): void {
            Core._side = RuntimeSide.Client;
            Core._sessionID = sessionId;
            Core._listenClientId = listenClientId;
           
            // Checking socket.io
            if ((<any>window).io === undefined) {

                if (this._socketIOWaitCount < 10) {
                    this._socketIOWaitCount++;
                    // Let's wait a bit just in case socket.io was loaded asynchronously
                    setTimeout(function () {
                        console.log("Vorlon.js: waiting for socket.io to load...");
                        Core.StartClientSide(serverUrl, sessionId, listenClientId);
                    }, 1000);
                } else {
                    console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                    Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                }
                return;
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
            for (var index = 0; index < Core._clientPlugins.length; index++) {
                var plugin = Core._clientPlugins[index];
                plugin.startClientSide();
            }

            // Handle client disconnect
            window.addEventListener("beforeunload", function () {
                Core.Messenger.sendRealtimeMessage("", { socketid: Core.Messenger.socketId }, Core._side, "clientclosed");
            }, false);

            // Start global dirty check, at this point document is not ready,
            // little timeout to defer starting dirtycheck
            setTimeout(() => {
                this.startClientDirtyCheck();
            }, 500);
        }

        public startClientDirtyCheck() {
            var mutationObserver = (<any>window).MutationObserver || (<any>window).WebKitMutationObserver || null;
            if (mutationObserver) {
                if (!document.body.__vorlon)
                    document.body.__vorlon = {};

                var config = { attributes: true, childList: true, subtree: true, characterData: true };
                document.body.__vorlon._observerMutationObserver = new mutationObserver((mutations) => {
                    var sended = false;
                    mutations.forEach((mutation) => {
                        if (mutation.target && mutation.target.__vorlon && mutation.target.__vorlon.ignore) {
                            return;
                        }

                        if (mutation.target && !sended && mutation.target.__vorlon && mutation.target.parentNode && mutation.target.parentNode.__vorlon && mutation.target.parentNode.__vorlon.internalId) {
                            setTimeout(() => {
                                var internalId = null;
                                if (mutation && mutation.target && mutation.target.parentNode && mutation.target.parentNode.__vorlon && mutation.target.parentNode.__vorlon.internalId)
                                    internalId = mutation.target.parentNode.__vorlon.internalId;

                                Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                                    type: 'contentchanged',
                                    internalId: internalId
                                }, Core._side, 'message');
                            }, 300);
                        }
                        sended = true;
                    });
                });
                document.body.__vorlon._observerMutationObserver.observe(document.body, config);
            } else {
                console.log("dirty check using html string");
                var content;
                if (document.body)
                    content = document.body.innerHTML;

                setInterval(() => {
                    var html = document.body.innerHTML;
                    if (content != html) {
                        content = html;
                        Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                            type: 'contentchanged'
                        }, Core._side, 'message');
                    }
                }, 2000);
            }
        }

        public StartDashboardSide(serverUrl = "'http://localhost:1337/'", sessionId = "", listenClientId = "", divMapper: (string) => HTMLDivElement = null): void {
            Core._side = RuntimeSide.Dashboard;
            Core._sessionID = sessionId;
            Core._listenClientId = listenClientId;

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
            
            // Checking socket.io
            if ((<any>window).io === undefined) {

                if (this._socketIOWaitCount < 10) {
                    this._socketIOWaitCount++;
                    // Let's wait a bit just in case socket.io was loaded asynchronously
                    setTimeout(function () {
                        console.log("Vorlon.js: waiting for socket.io to load...");
                        Core.StartDashboardSide(serverUrl, sessionId, listenClientId, divMapper);
                    }, 1000);
                } else {
                    console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                    Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                }
                return;
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
            for (var index = 0; index < Core._dashboardPlugins.length; index++) {
                var plugin = Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        }

        private _OnStopListenReceived(): void {
            Core._listenClientId = "";
        }

        private _OnIdentifyReceived(message: string): void {
            //console.log('identify ' + message);
            if (Core._side === RuntimeSide.Dashboard) {
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

            if (Core._side === RuntimeSide.Dashboard) {
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
                divError.style.zIndex = "1001";

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
                for (var index = 0; index < Core._clientPlugins.length; index++) {
                    var plugin = Core._clientPlugins[index];
                    plugin.refresh();
                }
            } else {
                var elt = <HTMLElement>document.querySelector('.dashboard-plugins-overlay');
                Tools.AddClass(elt, 'hidden');
            }
        }

        private _RetrySendingRealtimeMessage(plugin: DashboardPlugin, message: VorlonMessage) {
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
                Core._clientPlugins.forEach((plugin) => {
                    Core._DispatchPluginMessage(plugin, message);
                });
                Core._dashboardPlugins.forEach((plugin) => {
                    Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                Core._clientPlugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                Core._dashboardPlugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        }

        private _DispatchPluginMessage(plugin: BasePlugin, message: VorlonMessage): void {
            plugin.trace('received ' + JSON.stringify(message));
            if (message.metadata.side === RuntimeSide.Client) {
                if (!plugin.isReady()) { // Plugin is not ready, let's try again later
                    Core._RetrySendingRealtimeMessage(<DashboardPlugin>plugin, message);
                } else {
                    Core._DispatchFromClientPluginMessage(<DashboardPlugin>plugin, message);
                }
            } else {
                Core._DispatchFromDashboardPluginMessage(<ClientPlugin>plugin, message);
            }
        }

        private _DispatchFromClientPluginMessage(plugin: DashboardPlugin, message: VorlonMessage): void {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        }

        private _DispatchFromDashboardPluginMessage(plugin: ClientPlugin, message: VorlonMessage): void {
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
