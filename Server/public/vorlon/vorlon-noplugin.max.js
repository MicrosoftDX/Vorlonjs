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
                previousFunction.apply(rootObject, optionalParams);
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
            var basedUrl = "";
            if (this.loadingDirectory.indexOf('http') === 0) {
                basedUrl = this.loadingDirectory + "/" + this.name + "/";
            }
            else {
                basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            }
            var scriptToLoad = document.createElement("script");
            scriptToLoad.setAttribute("src", basedUrl + scriptName);
            scriptToLoad.onload = callback;
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(scriptToLoad, first);
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
        Core._RetryTimeout = 1002;
        return Core;
    })();
    VORLON.Core = Core;
})(VORLON || (VORLON = {}));
