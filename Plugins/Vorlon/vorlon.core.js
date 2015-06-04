var VORLON;
(function (VORLON) {
    var Core = (function () {
        function Core() {
        }
        Object.defineProperty(Core, "Messenger", {
            get: function () {
                return Core._messenger;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Core, "Plugins", {
            get: function () {
                return Core._plugins;
            },
            enumerable: true,
            configurable: true
        });
        Core.RegisterPlugin = function (plugin) {
            Core._plugins.push(plugin);
        };
        Core.Start = function (serverUrl, sessionId, listenClientId, divMapper) {
            if (serverUrl === void 0) { serverUrl = "'http://localhost:1337/'"; }
            if (sessionId === void 0) { sessionId = ""; }
            if (listenClientId === void 0) { listenClientId = ""; }
            if (divMapper === void 0) { divMapper = null; }
            Core._side = 0 /* Client */;
            Core._sessionID = sessionId;
            Core._listenClientId = listenClientId;
            if (!serverUrl) {
                Core._side = 2 /* Both */;
            }
            if (divMapper) {
                Core._side = 1 /* Dashboard */;
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
            if (Core._side !== 2 /* Both */) {
                if (window.io === undefined) {
                    if (this._socketIOWaitCount < 10) {
                        this._socketIOWaitCount++;
                        // Let's wait a bit just in case socket.io was loaded asynchronously
                        setTimeout(function () {
                            console.log("Vorlon.js: waiting for socket.io to load...");
                            Core.Start(serverUrl, sessionId, listenClientId, divMapper);
                        }, 1000);
                    }
                    else {
                        console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                        Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                    }
                    return;
                }
            }
            // Cookie
            var clientId = VORLON.Tools.ReadCookie("vorlonJS_clientId");
            if (!clientId) {
                clientId = VORLON.Tools.CreateGUID();
                VORLON.Tools.CreateCookie("vorlonJS_clientId", clientId, 1);
            }
            // Creating the messenger
            Core._messenger = new VORLON.ClientMessenger(Core._side, serverUrl, sessionId, clientId, listenClientId);
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
            for (var index = 0; index < Core._plugins.length; index++) {
                var plugin = Core._plugins[index];
                Core._startPlugin(Core._plugins[index], divMapper);
            }
            if (Core._side === 0 /* Client */) {
                window.addEventListener("beforeunload", function () {
                    Core.Messenger.sendRealtimeMessage("", { socketid: Core.Messenger.socketId }, Core._side, "clientclosed");
                }, false);
            }
        };
        Core._startPlugin = function (plugin, divMapper) {
            if (divMapper === void 0) { divMapper = null; }
            if (Core._side === 2 /* Both */ || Core._side === 0 /* Client */) {
                plugin.startClientSide();
            }
            if (Core._side === 2 /* Both */ || Core._side === 1 /* Dashboard */) {
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        };
        Core._OnStopListenReceived = function () {
            Core._listenClientId = "";
        };
        Core._OnIdentifyReceived = function (message) {
            //console.log('identify ' + message);
            if (Core._side == 1 /* Dashboard */) {
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
                setTimeout(function () {
                    document.body.removeChild(div);
                }, 4000);
            }
        };
        Core.ShowError = function (message, timeout) {
            if (timeout === void 0) { timeout = 5000; }
            if (Core._side == 1 /* Dashboard */) {
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
                    setTimeout(function () {
                        document.body.removeChild(divError);
                    }, timeout);
                }
            }
        };
        Core._OnError = function (err) {
            Core.ShowError("Error while connecting to server. Server may be offline.<BR>Error message: " + err.message);
        };
        Core._OnIdentificationReceived = function (id) {
            //console.log('helo received ' + id);
            Core._listenClientId = id;
            if (Core._side === 0 /* Client */) {
                for (var index = 0; index < Core._plugins.length; index++) {
                    var plugin = Core._plugins[index];
                    plugin.refresh();
                }
            }
        };
        Core._RetrySendingRealtimeMessage = function (plugin, receivedObject) {
            setTimeout(function () {
                if (plugin.isReady()) {
                    plugin.onRealtimeMessageReceivedFromClientSide(receivedObject);
                    return;
                }
                Core._RetrySendingRealtimeMessage(plugin, receivedObject);
            }, Core._RetryTimeout);
        };
        Core._Dispatch = function (message) {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }
            for (var index = 0, length = Core._plugins.length; index < length; index++) {
                var plugin = Core._plugins[index];
                if (plugin.getID() === message.metadata.pluginID) {
                    Core._DispatchPluginMessage(plugin, message.metadata.side, message.data);
                    return;
                }
            }
        };
        Core._DispatchPluginMessage = function (plugin, side, receivedObject) {
            if (side === 0 /* Client */) {
                if (!plugin.isReady()) {
                    Core._RetrySendingRealtimeMessage(plugin, receivedObject);
                }
                else {
                    plugin.onRealtimeMessageReceivedFromClientSide(receivedObject);
                }
            }
            else {
                plugin.onRealtimeMessageReceivedFromDashboardSide(receivedObject);
            }
        };
        Core._plugins = new Array();
        Core._socketIOWaitCount = 0;
        Core._RetryTimeout = 1002;
        return Core;
    })();
    VORLON.Core = Core;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.core.js.map