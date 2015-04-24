var VORLON;
(function (VORLON) {
    var Tools = (function () {
        function Tools() {
        }
        Tools.SetImmediate = function (func) {
            if (window.setImmediate) {
                setImmediate(func);
            }
            else {
                setTimeout(func, 0);
            }
        };
        Tools.Hook = function (rootObject, functionToHook, hookingFunction) {
            var previousFunction = rootObject[functionToHook];
            rootObject[functionToHook] = function () {
                var optionalParams = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    optionalParams[_i - 0] = arguments[_i];
                }
                hookingFunction(optionalParams);
                previousFunction.call(rootObject, optionalParams);
            };
        };
        Tools.CreateCookie = function (name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        };
        Tools.ReadCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return "";
        };
        // from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
        Tools.CreateGUID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        Tools.RemoveEmpties = function (arr) {
            var len = arr.length;
            for (var i = len - 1; i >= 0; i--) {
                if (!arr[i]) {
                    arr.splice(i, 1);
                    len--;
                }
            }
            return len;
        };
        Tools.AddClass = function (e, name) {
            if (e.classList) {
                if (name.indexOf(" ") < 0) {
                    e.classList.add(name);
                }
                else {
                    var namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (var i = 0, len = namesToAdd.length; i < len; i++) {
                        e.classList.add(namesToAdd[i]);
                    }
                }
                return e;
            }
            else {
                var className = e.className;
                var names = className.split(" ");
                var l = Tools.RemoveEmpties(names);
                var toAdd;
                if (name.indexOf(" ") >= 0) {
                    namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (i = 0; i < l; i++) {
                        var found = namesToAdd.indexOf(names[i]);
                        if (found >= 0) {
                            namesToAdd.splice(found, 1);
                        }
                    }
                    if (namesToAdd.length > 0) {
                        toAdd = namesToAdd.join(" ");
                    }
                }
                else {
                    var saw = false;
                    for (i = 0; i < l; i++) {
                        if (names[i] === name) {
                            saw = true;
                            break;
                        }
                    }
                    if (!saw) {
                        toAdd = name;
                    }
                }
                if (toAdd) {
                    if (l > 0 && names[0].length > 0) {
                        e.className = className + " " + toAdd;
                    }
                    else {
                        e.className = toAdd;
                    }
                }
                return e;
            }
        };
        Tools.RemoveClass = function (e, name) {
            if (e.classList) {
                if (e.classList.length === 0) {
                    return e;
                }
                var namesToRemove = name.split(" ");
                Tools.RemoveEmpties(namesToRemove);
                for (var i = 0, len = namesToRemove.length; i < len; i++) {
                    e.classList.remove(namesToRemove[i]);
                }
                return e;
            }
            else {
                var original = e.className;
                if (name.indexOf(" ") >= 0) {
                    namesToRemove = name.split(" ");
                    Tools.RemoveEmpties(namesToRemove);
                }
                else {
                    if (original.indexOf(name) < 0) {
                        return e;
                    }
                    namesToRemove = [name];
                }
                var removed;
                var names = original.split(" ");
                var namesLen = Tools.RemoveEmpties(names);
                for (i = namesLen - 1; i >= 0; i--) {
                    if (namesToRemove.indexOf(names[i]) >= 0) {
                        names.splice(i, 1);
                        removed = true;
                    }
                }
                if (removed) {
                    e.className = names.join(" ");
                }
                return e;
            }
        };
        return Tools;
    })();
    VORLON.Tools = Tools;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.tools.js.map
var VORLON;
(function (VORLON) {
    (function (RuntimeSide) {
        RuntimeSide[RuntimeSide["Client"] = 0] = "Client";
        RuntimeSide[RuntimeSide["Dashboard"] = 1] = "Dashboard";
        RuntimeSide[RuntimeSide["Both"] = 2] = "Both";
    })(VORLON.RuntimeSide || (VORLON.RuntimeSide = {}));
    var RuntimeSide = VORLON.RuntimeSide;
    (function (PluginType) {
        PluginType[PluginType["OneOne"] = 0] = "OneOne";
        PluginType[PluginType["MulticastReceiveOnly"] = 1] = "MulticastReceiveOnly";
        PluginType[PluginType["Multicast"] = 2] = "Multicast";
    })(VORLON.PluginType || (VORLON.PluginType = {}));
    var PluginType = VORLON.PluginType;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.enums.js.map
var VORLON;
(function (VORLON) {
    var Plugin = (function () {
        function Plugin(name, htmlFragmentUrl, cssStyleSheetUrl) {
            this.loadingDirectory = "Vorlon/plugins";
            this._ready = true;
            this._type = 0 /* OneOne */;
            this.name = name;
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
        }
        Object.defineProperty(Plugin.prototype, "Type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Plugin.prototype.getID = function () {
            return "";
        };
        Plugin.prototype.isReady = function () {
            return this._ready;
        };
        Plugin.prototype.startClientSide = function () {
        };
        Plugin.prototype.startDashboardSide = function (div) {
        };
        Plugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
        };
        Plugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        Plugin.prototype.refresh = function () {
            console.error("Please override plugin.refresh()");
        };
        Plugin.prototype._insertHtmlContentAsync = function (divContainer, callback) {
            var _this = this;
            var basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }
            var request = new XMLHttpRequest();
            request.open('GET', basedUrl + this.htmlFragmentUrl, true);
            request.onreadystatechange = function (ev) {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        divContainer.innerHTML = _this._stripContent(request.responseText);
                        var headID = document.getElementsByTagName("head")[0];
                        var cssNode = document.createElement('link');
                        cssNode.type = "text/css";
                        cssNode.rel = "stylesheet";
                        cssNode.href = basedUrl + _this.cssStyleSheetUrl;
                        cssNode.media = "screen";
                        headID.appendChild(cssNode);
                        var firstDivChild = (divContainer.children[0]);
                        if (alone) {
                            firstDivChild.className = "alone";
                        }
                        callback(firstDivChild);
                    }
                    else {
                        throw new Error("Error status: " + request.status + " - Unable to load " + basedUrl + _this.htmlFragmentUrl);
                    }
                }
            };
            request.send(null);
        };
        Plugin.prototype._loadNewScriptAsync = function (scriptName, callback) {
            var basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            var scriptToLoad = document.createElement("script");
            scriptToLoad.setAttribute("src", basedUrl + scriptName);
            scriptToLoad.onload = callback;
            document.body.appendChild(scriptToLoad);
        };
        Plugin.prototype._stripContent = function (content) {
            // in case of SVG injection
            var xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im;
            // for HTML content
            var bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            }
            return content;
        };
        return Plugin;
    })();
    VORLON.Plugin = Plugin;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.plugin.js.map
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, serverUrl, sessionId, clientId, listenClientId) {
            var _this = this;
            this._isConnected = false;
            this._isConnected = false;
            this._sessionId = sessionId;
            this._clientId = clientId;
            VORLON.Core._listenClientId = listenClientId;
            this._serverUrl = serverUrl;
            this._waitingEvents = 0;
            switch (side) {
                case 0 /* Client */:
                    this._socket = io.connect(serverUrl);
                    this._isConnected = true;
                    break;
                case 1 /* Dashboard */:
                    this._socket = io.connect(serverUrl + "/dashboard");
                    this._isConnected = true;
                    break;
            }
            if (this.isConnected) {
                var manager = io.Manager(serverUrl);
                manager.on('connect_error', function (err) {
                    if (_this.onError) {
                        _this.onError(err);
                    }
                });
                this._socket.on('message', function (message) {
                    var receivedObject = JSON.parse(message);
                    var pluginID = receivedObject._pluginID;
                    delete receivedObject._pluginID;
                    if (_this.onRealtimeMessageReceived) {
                        _this.onRealtimeMessageReceived(pluginID, receivedObject);
                    }
                });
                this._socket.on('helo', function (message) {
                    VORLON.Core._listenClientId = message;
                    if (_this.onHeloReceived) {
                        _this.onHeloReceived(message);
                    }
                });
                this._socket.on('identify', function (message) {
                    if (_this.onIdentifyReceived) {
                        _this.onIdentifyReceived(message);
                    }
                });
                this._socket.on('stoplisten', function () {
                    if (_this.onStopListenReceived) {
                        _this.onStopListenReceived();
                    }
                });
                this._socket.on('waitingevents', function (message) {
                    if (_this.onWaitingEventsReceived) {
                        var receivedObject = JSON.parse(message);
                        _this.onWaitingEventsReceived(receivedObject._clientId, receivedObject._waitingEvents);
                    }
                });
                this._socket.on('refreshclients', function () {
                    if (_this.onRefreshClients) {
                        _this.onRefreshClients();
                    }
                });
            }
        }
        Object.defineProperty(ClientMessenger.prototype, "isConnected", {
            get: function () {
                return this._isConnected;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientMessenger.prototype, "clientId", {
            set: function (value) {
                this._clientId = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientMessenger.prototype, "socketId", {
            get: function () {
                return this._socket.id;
            },
            enumerable: true,
            configurable: true
        });
        ClientMessenger.prototype.sendWaitingEvents = function (pluginID, waitingevents) {
            var objectToSend = {};
            objectToSend._pluginID = pluginID;
            objectToSend._side = 0 /* Client */;
            objectToSend._sessionId = this._sessionId;
            objectToSend._clientId = this._clientId;
            objectToSend._listenClientId = VORLON.Core._listenClientId;
            objectToSend._waitingEvents = waitingevents;
            if (this.isConnected) {
                var message = JSON.stringify(objectToSend);
                this._socket.emit("waitingevents", message);
            }
        };
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, incrementVisualIndicator) {
            if (messageType === void 0) { messageType = "message"; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            objectToSend._pluginID = pluginID;
            objectToSend._side = side;
            objectToSend._sessionId = this._sessionId;
            objectToSend._clientId = this._clientId;
            objectToSend._listenClientId = VORLON.Core._listenClientId;
            if (!this.isConnected) {
                // Directly raise response locally
                if (this.onRealtimeMessageReceived) {
                    this.onRealtimeMessageReceived(pluginID, objectToSend);
                }
                return;
            }
            else {
                if (VORLON.Core._listenClientId === "" && messageType === "message") {
                    if (incrementVisualIndicator) {
                        this._waitingEvents++;
                        this.sendWaitingEvents(pluginID, this._waitingEvents);
                    }
                }
                else {
                    var message = JSON.stringify(objectToSend);
                    this._socket.emit(messageType, message);
                    this._waitingEvents = 0;
                    this.sendWaitingEvents(pluginID, 0);
                }
            }
        };
        ClientMessenger.prototype.sendMonitoringMessage = function (pluginID, message) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                    }
                }
            };
            xhr.open("POST", this._serverUrl + "api/push");
            xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            var data = JSON.stringify({ "_idsession": this._sessionId, "id": pluginID, "message": message });
            //xhr.setRequestHeader("Content-length", data.length.toString());
            xhr.send(data);
        };
        ClientMessenger.prototype.getMonitoringMessage = function (pluginID, onMonitoringMessage, from, to) {
            if (from === void 0) { from = "-20"; }
            if (to === void 0) { to = "-1"; }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (onMonitoringMessage)
                            onMonitoringMessage(JSON.parse(xhr.responseText));
                    }
                    else {
                        if (onMonitoringMessage)
                            onMonitoringMessage(null);
                    }
                }
                else {
                    if (onMonitoringMessage)
                        onMonitoringMessage(null);
                }
            };
            xhr.open("GET", this._serverUrl + "api/range/" + this._sessionId + "/" + pluginID + "/" + from + "/" + to);
            xhr.send();
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.clientMessenger.js.map
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
                if (Core._side === 2 /* Both */ || Core._side === 0 /* Client */) {
                    plugin.startClientSide();
                }
                if (Core._side === 2 /* Both */ || Core._side === 1 /* Dashboard */) {
                    plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
                }
            }
            if (Core._side === 0 /* Client */) {
                window.addEventListener("beforeunload", function () {
                    Core.Messenger.sendRealtimeMessage("", { socketid: Core.Messenger.socketId }, Core._side, "clientclosed");
                }, false);
            }
        };
        Core._OnStopListenReceived = function () {
            Core._listenClientId = "";
        };
        Core._OnIdentifyReceived = function (message) {
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
            div.innerHTML = message;
            document.body.appendChild(div);
            setTimeout(function () {
                document.body.removeChild(div);
            }, 4000);
        };
        Core._OnError = function (err) {
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
            divError.innerHTML = "Error while connecting to server. Server may be offline.<BR>Error message: " + err.message;
            document.body.appendChild(divError);
            setTimeout(function () {
                document.body.removeChild(divError);
            }, 5000);
        };
        Core._OnIdentificationReceived = function (id) {
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
        Core._Dispatch = function (pluginID, receivedObject) {
            var side = receivedObject._side;
            delete receivedObject._side;
            for (var index = 0; index < Core._plugins.length; index++) {
                var plugin = Core._plugins[index];
                if (plugin.getID() === pluginID) {
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
                    return;
                }
            }
        };
        Core._plugins = new Array();
        Core._RetryTimeout = 1000;
        return Core;
    })();
    VORLON.Core = Core;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.core.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var InteractiveConsole = (function (_super) {
        __extends(InteractiveConsole, _super);
        function InteractiveConsole() {
            _super.call(this, "interactiveConsole", "control.html", "control.css");
            this._cache = [];
            this._ready = false;
        }
        InteractiveConsole.prototype.getID = function () {
            return "CONSOLE";
        };
        InteractiveConsole.prototype.startClientSide = function () {
            var _this = this;
            // Overrides log, error and warn
            VORLON.Tools.Hook(window.console, "log", function (message) {
                var data = {
                    message: message,
                    type: "log"
                };
                VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), data, 0 /* Client */, "message", true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "warn", function (message) {
                var data = {
                    message: message,
                    type: "warn"
                };
                VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), data, 0 /* Client */, "message", true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "error", function (message) {
                var data = {
                    message: message,
                    type: "error"
                };
                //Core.Messenger.sendMonitoringMessage(this.getID(), data.message);
                VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), data, 0 /* Client */, "message", true);
                _this._cache.push(data);
            });
            // Override Error constructor
            var previousError = Error;
            Error = (function (message) {
                var error = new previousError(message);
                var data = {
                    message: message,
                    type: "exception"
                };
                VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), data, 0 /* Client */, "message", true);
                _this._cache.push(data);
                return error;
            });
        };
        InteractiveConsole.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            switch (receivedObject.type) {
                case "eval":
                    try {
                        console.log("Executing order: " + receivedObject.order);
                        eval(receivedObject.order);
                    }
                    catch (e) {
                        console.error("Unable to execute order: " + e.message);
                    }
                    break;
            }
        };
        InteractiveConsole.prototype.refresh = function () {
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "clear"
            }, 0 /* Client */);
            for (var index = 0; index < this._cache.length; index++) {
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), this._cache[index], 0 /* Client */, "message", true);
            }
        };
        InteractiveConsole.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                // Log container
                _this._containerDiv = document.getElementById("logs");
                // Interactive console
                _this._interactiveInput = document.getElementById("input");
                _this._interactiveInput.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13) {
                        VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                            order: _this._interactiveInput.value,
                            type: "eval"
                        }, 1 /* Dashboard */);
                        _this._interactiveInput.value = "";
                    }
                });
                _this._ready = true;
            });
        };
        InteractiveConsole.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.type === "clear") {
                while (this._containerDiv.hasChildNodes()) {
                    this._containerDiv.removeChild(this._containerDiv.lastChild);
                }
                return;
            }
            var messageDiv = document.createElement("div");
            VORLON.Tools.AddClass(messageDiv, "log");
            switch (receivedObject.type) {
                case "log":
                    messageDiv.innerHTML = receivedObject.message;
                    VORLON.Tools.AddClass(messageDiv, "logMessage");
                    break;
                case "warn":
                    messageDiv.innerHTML = receivedObject.message;
                    VORLON.Tools.AddClass(messageDiv, "logWarning");
                    break;
                case "error":
                    messageDiv.innerHTML = receivedObject.message;
                    VORLON.Tools.AddClass(messageDiv, "logError");
                    break;
                case "exception":
                    messageDiv.innerHTML = receivedObject.message;
                    VORLON.Tools.AddClass(messageDiv, "logException");
                    break;
                case "order":
                    this._interactiveInput.value = "document.getElementById(\"" + receivedObject.order + "\")";
                    return;
            }
            this._containerDiv.insertBefore(messageDiv, this._containerDiv.childNodes.length > 0 ? this._containerDiv.childNodes[0] : null);
        };
        return InteractiveConsole;
    })(VORLON.Plugin);
    VORLON.InteractiveConsole = InteractiveConsole;
    // Register
    VORLON.Core.RegisterPlugin(new InteractiveConsole());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.interactiveConsole.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var DOMExplorer = (function (_super) {
        __extends(DOMExplorer, _super);
        function DOMExplorer() {
            _super.call(this, "domExplorer", "control.html", "control.css");
            this._internalId = 0;
            this._ready = false;
        }
        DOMExplorer.prototype.getID = function () {
            return "DOM";
        };
        DOMExplorer.prototype._getAppliedStyles = function (node) {
            // Style sheets
            var styleNode = new Array();
            var sheets = document.styleSheets;
            var style;
            var appliedStyles = new Array();
            for (var c = 0; c < sheets.length; c++) {
                var rules = sheets[c].rules || sheets[c].cssRules;
                for (var r = 0; r < rules.length; r++) {
                    var rule = rules[r];
                    var selectorText = rule.selectorText;
                    var matchedElts = document.querySelectorAll(selectorText);
                    for (var index = 0; index < matchedElts.length; index++) {
                        var element = matchedElts[index];
                        style = rule.style;
                        if (element === node) {
                            for (var i = 0; i < style.length; i++) {
                                if (appliedStyles.indexOf(style[i]) === -1) {
                                    appliedStyles.push(style[i]);
                                }
                            }
                        }
                    }
                }
            }
            // Local style
            style = node.style;
            if (style) {
                for (index = 0; index < style.length; index++) {
                    if (appliedStyles.indexOf(style[index]) === -1) {
                        appliedStyles.push(style[index]);
                    }
                }
            }
            // Get effective styles
            var winObject = document.defaultView || window;
            for (index = 0; index < appliedStyles.length; index++) {
                var appliedStyle = appliedStyles[index];
                if (winObject.getComputedStyle) {
                    styleNode.push(appliedStyle + ":" + winObject.getComputedStyle(node, "").getPropertyValue(appliedStyle));
                }
            }
            return styleNode;
        };
        DOMExplorer.prototype._packageNode = function (node) {
            node.__internalId = this._internalId;
            var packagedNode = {
                id: node.id,
                name: node.localName,
                classes: node.className,
                styles: this._getAppliedStyles(node),
                internalId: this._internalId++
            };
            return packagedNode;
        };
        DOMExplorer.prototype._packageDOM = function (root, packagedObject) {
            if (!root.children || root.children.length === 0) {
                return;
            }
            for (var index = 0; index < root.children.length; index++) {
                var node = root.children[index];
                var packagedNode = this._packageNode(node);
                this._packageDOM(node, packagedNode);
                if (!packagedObject.children) {
                    packagedObject.children = [];
                }
                packagedObject.children.push(packagedNode);
            }
        };
        DOMExplorer.prototype._packageAndSendDOM = function () {
            this._internalId = 0;
            var packagedObject = this._packageNode(document.body);
            this._packageDOM(document.body, packagedObject);
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), packagedObject, 0 /* Client */);
        };
        DOMExplorer.prototype.startClientSide = function () {
            var _this = this;
            document.addEventListener("DOMContentLoaded", function () {
                if (VORLON.Core.Messenger.isConnected) {
                    document.addEventListener("DOMNodeInserted", function () {
                        _this.refresh();
                    });
                    document.addEventListener("DOMNodeRemoved", function () {
                        _this.refresh();
                    });
                }
                _this.refresh();
            });
        };
        DOMExplorer.prototype._getElementByInternalId = function (internalId, node) {
            if (node.__internalId === internalId) {
                return node;
            }
            for (var index = 0; index < node.children.length; index++) {
                var result = this._getElementByInternalId(internalId, node.children[index]);
                if (result) {
                    return result;
                }
            }
            return null;
        };
        DOMExplorer.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            var element = this._getElementByInternalId(receivedObject.order, document.body);
            if (!element) {
                return;
            }
            switch (receivedObject.type) {
                case "select":
                    element.__savedBorder = element.style.border;
                    element.style.border = "2px solid red";
                    break;
                case "unselect":
                    element.style.border = element.__savedBorder;
                    break;
                case "ruleEdit":
                    element.style[receivedObject.property] = receivedObject.newValue;
                    break;
            }
        };
        DOMExplorer.prototype.refresh = function () {
            var _this = this;
            VORLON.Tools.SetImmediate(function () {
                _this._packageAndSendDOM();
            }); // Give some time for the DOM to rebuild
        };
        DOMExplorer.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this._treeDiv = document.getElementById("treeView");
                _this._styleView = document.getElementById("styleView");
                _this._ready = true;
            });
        };
        DOMExplorer.prototype._makeEditable = function (element) {
            element.contentEditable = "true";
            element.focus();
            VORLON.Tools.AddClass(element, "editable");
            var range = document.createRange();
            range.setStart(element, 0);
            range.setEnd(element, 1);
            window.getSelection().addRange(range);
        };
        DOMExplorer.prototype._generateClickableValue = function (label, value, internalId) {
            var _this = this;
            // Value
            var valueElement = document.createElement("div");
            valueElement.contentEditable = "false";
            valueElement.innerHTML = value || "&nbsp;";
            valueElement.className = "styleValue";
            valueElement.addEventListener("keydown", function (evt) {
                if (evt.keyCode === 13 || evt.keyCode === 9) {
                    VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                        type: "ruleEdit",
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    }, 1 /* Dashboard */);
                    evt.preventDefault();
                    valueElement.contentEditable = "false";
                    VORLON.Tools.RemoveClass(valueElement, "editable");
                }
            });
            valueElement.addEventListener("blur", function () {
                valueElement.contentEditable = "false";
                VORLON.Tools.RemoveClass(valueElement, "editable");
            });
            valueElement.addEventListener("click", function () { return _this._makeEditable(valueElement); });
            return valueElement;
        };
        // Generate styles for a selected node
        DOMExplorer.prototype._generateStyle = function (property, value, internalId, editableLabel) {
            var _this = this;
            if (editableLabel === void 0) { editableLabel = false; }
            var label = document.createElement("div");
            label.innerHTML = property;
            label.className = "styleLabel";
            label.contentEditable = "false";
            this._styleView.appendChild(label);
            var valueElement = this._generateClickableValue(label, value, internalId);
            this._styleView.appendChild(valueElement);
            if (editableLabel) {
                label.addEventListener("blur", function () {
                    label.contentEditable = "false";
                    VORLON.Tools.RemoveClass(label, "editable");
                });
                label.addEventListener("click", function () {
                    _this._makeEditable(label);
                });
                label.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13 || evt.keyCode === 9) {
                        _this._makeEditable(valueElement);
                        evt.preventDefault();
                    }
                });
            }
        };
        DOMExplorer.prototype._generateStyles = function (styles, internalId) {
            var _this = this;
            while (this._styleView.hasChildNodes()) {
                this._styleView.removeChild(this._styleView.lastChild);
            }
            for (var index = 0; index < styles.length; index++) {
                var style = styles[index];
                var splits = style.split(":");
                this._generateStyle(splits[0], splits[1], internalId);
            }
            // Append add style button
            this._generateButton(this._styleView, "+", "styleButton", function (button) {
                _this._styleView.removeChild(button);
                _this._generateStyle("property", "value", internalId, true);
                _this._styleView.appendChild(button);
            });
        };
        DOMExplorer.prototype._appendSpan = function (parent, className, value) {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;
            parent.appendChild(span);
        };
        DOMExplorer.prototype._generateColorfullLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeTag", "&lt;");
            this._appendSpan(link, "nodeName", receivedObject.name);
            if (receivedObject.id) {
                this._appendSpan(link, "nodeAttribute", " id");
                this._appendSpan(link, "nodeTag", "=\"");
                this._appendSpan(link, "nodeValue", receivedObject.id);
                this._appendSpan(link, "nodeTag", "\"");
            }
            if (receivedObject.classes) {
                this._appendSpan(link, "nodeAttribute", " class");
                this._appendSpan(link, "nodeTag", "=\"");
                this._appendSpan(link, "nodeValue", receivedObject.classes);
                this._appendSpan(link, "nodeTag", "\"");
            }
            this._appendSpan(link, "nodeTag", "&gt;");
        };
        DOMExplorer.prototype._generateColorfullClosingLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeTag", "&lt;/");
            this._appendSpan(link, "nodeName", receivedObject.name);
            this._appendSpan(link, "nodeTag", "&gt;");
        };
        DOMExplorer.prototype._generateButton = function (parentNode, text, className, onClick) {
            var button = document.createElement("div");
            button.innerHTML = text;
            button.className = className;
            button.addEventListener("click", function () { return onClick(button); });
            parentNode.appendChild(button);
        };
        DOMExplorer.prototype._generateTreeNode = function (parentNode, receivedObject, first) {
            var _this = this;
            if (first === void 0) { first = false; }
            var root = document.createElement("div");
            parentNode.appendChild(root);
            var container = document.createElement("div");
            this._generateButton(root, "-", "treeNodeButton", function (button) {
                if (container.style.display === "none") {
                    container.style.display = "";
                    button.innerHTML = "-";
                }
                else {
                    container.style.display = "none";
                    button.innerHTML = "+";
                }
            });
            // Main node
            var linkText = document.createElement("a");
            linkText.__targetInternalId = receivedObject.internalId;
            this._generateColorfullLink(linkText, receivedObject);
            linkText.addEventListener("click", function () {
                if (_this._previousSelectedNode) {
                    VORLON.Tools.RemoveClass(_this._previousSelectedNode, "treeNodeSelected");
                    VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                        type: "unselect",
                        order: _this._previousSelectedNode.__targetInternalId
                    }, 1 /* Dashboard */);
                }
                VORLON.Tools.AddClass(linkText, "treeNodeSelected");
                VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                    type: "select",
                    order: receivedObject.internalId
                }, 1 /* Dashboard */);
                _this._generateStyles(receivedObject.styles, receivedObject.internalId);
                _this._previousSelectedNode = linkText;
            });
            linkText.href = "#";
            linkText.className = "treeNodeHeader";
            root.appendChild(linkText);
            root.className = first ? "firstTreeNodeText" : "treeNodeText";
            // Tools
            if (receivedObject.id) {
                var toolsLink = document.createElement("a");
                toolsLink.innerHTML = "#";
                toolsLink.className = "treeNodeTools";
                toolsLink.href = "#";
                toolsLink.addEventListener("click", function () {
                    VORLON.Core.Messenger.sendRealtimeMessage("CONSOLE", {
                        type: "order",
                        order: receivedObject.id
                    }, 0 /* Client */, "protocol");
                });
                root.appendChild(toolsLink);
            }
            // Children
            if (receivedObject.children) {
                for (var index = 0; index < receivedObject.children.length; index++) {
                    var childObject = receivedObject.children[index];
                    this._generateTreeNode(container, childObject);
                }
            }
            if (receivedObject.name) {
                var closingLink = document.createElement("div");
                closingLink.className = "treeNodeClosingText";
                this._generateColorfullClosingLink(closingLink, receivedObject);
                container.appendChild(closingLink);
            }
            root.appendChild(container);
        };
        DOMExplorer.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
            this._generateTreeNode(this._treeDiv, receivedObject, true);
        };
        return DOMExplorer;
    })(VORLON.Plugin);
    VORLON.DOMExplorer = DOMExplorer;
    // Register
    VORLON.Core.RegisterPlugin(new DOMExplorer());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.domExplorer.js.map
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var FeatureSupported = (function () {
        function FeatureSupported() {
        }
        return FeatureSupported;
    })();
    VORLON.FeatureSupported = FeatureSupported;
    var ModernizrReport = (function (_super) {
        __extends(ModernizrReport, _super);
        function ModernizrReport() {
            _super.call(this, "modernizrReport", "control.html", "control.css");
            this.supportedFeatures = [];
            this._ready = false;
        }
        ModernizrReport.prototype.getID = function () {
            return "MODERNIZR";
        };
        ModernizrReport.prototype.startClientSide = function () {
            var _this = this;
            this._loadNewScriptAsync("modernizr.js", function () {
                if (Modernizr) {
                    _this.supportedFeatures.push({ featureName: "Application cache", isSupported: Modernizr.applicationcache, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Audio tag", isSupported: Modernizr.audio, type: "html" });
                    _this.supportedFeatures.push({ featureName: "background-size", isSupported: Modernizr.backgroundsize, type: "css" });
                    _this.supportedFeatures.push({ featureName: "border-image", isSupported: Modernizr.borderimage, type: "css" });
                    _this.supportedFeatures.push({ featureName: "border-radius", isSupported: Modernizr.borderradius, type: "css" });
                    _this.supportedFeatures.push({ featureName: "box-shadow", isSupported: Modernizr.boxshadow, type: "css" });
                    _this.supportedFeatures.push({ featureName: "canvas", isSupported: Modernizr.canvas, type: "html" });
                    _this.supportedFeatures.push({ featureName: "canvas text", isSupported: Modernizr.canvastext, type: "html" });
                    _this.supportedFeatures.push({ featureName: "CSS Animations", isSupported: Modernizr.cssanimations, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Columns", isSupported: Modernizr.csscolumns, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Gradients", isSupported: Modernizr.cssgradients, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Reflections", isSupported: Modernizr.cssreflections, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Transforms", isSupported: Modernizr.csstransforms, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Transforms 3d", isSupported: Modernizr.csstransforms3d, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Transitions", isSupported: Modernizr.csstransitions, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Drag'n'drop", isSupported: Modernizr.draganddrop, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Flexbox", isSupported: Modernizr.flexbox, type: "css" });
                    _this.supportedFeatures.push({ featureName: "@font-face", isSupported: Modernizr.fontface, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Generated Content (:before/:after)", isSupported: Modernizr.generatedcontent, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Geolocation API", isSupported: Modernizr.geolocation, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "hashchange Event", isSupported: Modernizr.hashchange, type: "html" });
                    _this.supportedFeatures.push({ featureName: "History Management", isSupported: Modernizr.history, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Color Values hsla()", isSupported: Modernizr.hsla, type: "css" });
                    _this.supportedFeatures.push({ featureName: "IndexedDB", isSupported: Modernizr.indexeddb, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Inline SVG in HTML5", isSupported: Modernizr.inlinesvg, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "Input Attribute autocomplete", isSupported: Modernizr.input.autocomplete, type: "html" });
                    /* TO DO: Inputs... */
                    _this.supportedFeatures.push({ featureName: "localStorage", isSupported: Modernizr.localstorage, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Multiple backgrounds", isSupported: Modernizr.multiplebgs, type: "css" });
                    _this.supportedFeatures.push({ featureName: "opacity", isSupported: Modernizr.opacity, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Cross-window Messaging", isSupported: Modernizr.postmessage, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Color Values rgba()", isSupported: Modernizr.rgba, type: "css" });
                    _this.supportedFeatures.push({ featureName: "sessionStorage", isSupported: Modernizr.sessionstorage, type: "html" });
                    _this.supportedFeatures.push({ featureName: "SVG SMIL animation", isSupported: Modernizr.smil, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "SVG", isSupported: Modernizr.svg, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "SVG Clipping Paths", isSupported: Modernizr.svgclippaths, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "text-shadow", isSupported: Modernizr.textshadow, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Touch Events", isSupported: Modernizr.touch, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "Video", isSupported: Modernizr.video, type: "html" });
                    _this.supportedFeatures.push({ featureName: "WebGL", isSupported: Modernizr.webgl, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "Web Sockets", isSupported: Modernizr.websockets, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Web SQL Database", isSupported: Modernizr.websqldatabase, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Web Workers", isSupported: Modernizr.webworkers, type: "html" });
                    _this.supportedFeatures.push({ featureName: "A [download] attribute", isSupported: Modernizr.adownload, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Mozilla Audio Data API", isSupported: Modernizr.audiodata, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "HTML5 Web Audio API", isSupported: Modernizr.webaudio, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Battery Status API", isSupported: Modernizr.battery, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Low Battery Level", isSupported: Modernizr.lowbattery, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Blob Constructor", isSupported: Modernizr.blobconstructor, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Canvas toDataURL image/jpeg", isSupported: Modernizr.todataurljpeg, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Canvas toDataURL image/png", isSupported: Modernizr.todataurlpng, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Canvas toDataURL image/webp", isSupported: Modernizr.todataurlwebp, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "HTML5 Content Editable Attribute", isSupported: Modernizr.contenteditable, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Content Security Policy", isSupported: Modernizr.contentsecuritypolicy, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "HTML5 Context Menu", isSupported: Modernizr.contextmenu, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Cookie", isSupported: Modernizr.cookies, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Cross-Origin Resource Sharing", isSupported: Modernizr.cors, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-position Shorthand", isSupported: Modernizr.bgpositionshorthand, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-position-x/y", isSupported: Modernizr.bgpositionxy, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-repeat: space", isSupported: Modernizr.bgrepeatspace, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-repeat: round", isSupported: Modernizr.bgrepeatround, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-size: cover", isSupported: Modernizr.bgsizecover, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS Box Sizing", isSupported: Modernizr.boxsizing, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS Calc", isSupported: Modernizr.csscalc, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS Cubic Bezier Range", isSupported: Modernizr.cubicbezierrange, type: "noncore" });
                    //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-runin, type: "noncore" });
                    //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-table, type: "noncore" });
                    var message = {};
                    message.features = _this.supportedFeatures;
                    VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), message, 0 /* Client */, "message");
                }
            });
        };
        ModernizrReport.prototype.refresh = function () {
            var message = {};
            message.features = this.supportedFeatures;
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), message, 0 /* Client */, "message");
        };
        ModernizrReport.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        ModernizrReport.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._cssFeaturesListTable = document.getElementById("cssFeaturesList");
                _this._htmlFeaturesListTable = document.getElementById("htmlFeaturesList");
                _this._miscFeaturesListTable = document.getElementById("miscFeaturesList");
                _this._nonCoreFeaturesListTable = document.getElementById("nonCoreFeaturesList");
                _this._ready = true;
            });
        };
        ModernizrReport.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            var targettedTable;
            var supportedFeatures = receivedObject.features;
            for (var i = 0; i < supportedFeatures.length; i++) {
                switch (supportedFeatures[i].type) {
                    case "css":
                        targettedTable = this._cssFeaturesListTable;
                        break;
                    case "misc":
                        targettedTable = this._miscFeaturesListTable;
                        break;
                    case "noncore":
                        targettedTable = this._nonCoreFeaturesListTable;
                        break;
                    default:
                        targettedTable = this._htmlFeaturesListTable;
                        break;
                }
                var rowCount = targettedTable.rows.length;
                var row = targettedTable.insertRow(rowCount);
                row.insertCell(0).innerHTML = supportedFeatures[i].featureName;
                var cellSupported = row.insertCell(1);
                cellSupported.align = "center";
                if (supportedFeatures[i].isSupported) {
                    cellSupported.className = "modernizrFeatureSupported";
                    cellSupported.innerHTML = "✔";
                }
                else {
                    cellSupported.className = "modernizrFeatureUnsupported";
                    cellSupported.innerHTML = "×";
                }
            }
        };
        return ModernizrReport;
    })(VORLON.Plugin);
    VORLON.ModernizrReport = ModernizrReport;
    // Register
    VORLON.Core.RegisterPlugin(new ModernizrReport());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.modernizrReport.js.map