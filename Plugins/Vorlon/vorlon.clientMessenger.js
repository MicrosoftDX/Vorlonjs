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
                case VORLON.RuntimeSide.Client:
                    this._socket = io.connect(serverUrl);
                    this._isConnected = true;
                    break;
                case VORLON.RuntimeSide.Dashboard:
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
                    var received = JSON.parse(message);
                    if (_this.onRealtimeMessageReceived) {
                        _this.onRealtimeMessageReceived(received);
                    }
                });
                this._socket.on('helo', function (message) {
                    //console.log('messenger helo', message);
                    VORLON.Core._listenClientId = message;
                    if (_this.onHeloReceived) {
                        _this.onHeloReceived(message);
                    }
                });
                this._socket.on('identify', function (message) {
                    //console.log('messenger identify', message);
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
                    //console.log('messenger waitingevents', message);
                    if (_this.onWaitingEventsReceived) {
                        var receivedObject = JSON.parse(message);
                        _this.onWaitingEventsReceived(receivedObject);
                    }
                });
                this._socket.on('refreshclients', function () {
                    //console.log('messenger refreshclients');
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
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: VORLON.RuntimeSide.Client,
                    sessionId: this._sessionId,
                    clientId: this._clientId,
                    listenClientId: VORLON.Core._listenClientId,
                    waitingEvents: waitingevents
                }
            };
            if (this.isConnected) {
                var messagestr = JSON.stringify(message);
                this._socket.emit("waitingevents", messagestr);
            }
        };
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, incrementVisualIndicator) {
            if (messageType === void 0) { messageType = "message"; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    sessionId: this._sessionId,
                    clientId: this._clientId,
                    listenClientId: VORLON.Core._listenClientId
                },
                data: objectToSend
            };
            if (!this.isConnected) {
                // Directly raise response locally
                if (this.onRealtimeMessageReceived) {
                    this.onRealtimeMessageReceived(message);
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
                    var strmessage = JSON.stringify(message);
                    this._socket.emit(messageType, strmessage);
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