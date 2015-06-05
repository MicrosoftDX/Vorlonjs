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
            this._commandHistory = [];
            this._ready = false;
            this._id = "CONSOLE";
        }
        InteractiveConsole.prototype.startClientSide = function () {
            var _this = this;
            // Overrides clear, log, error and warn
            VORLON.Tools.Hook(window.console, "clear", function () {
                var data = {
                    type: "clear"
                };
                _this.sendToDashboard(data, true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "log", function (message) {
                var data = {
                    message: message,
                    type: "log"
                };
                _this.sendToDashboard(data, true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "debug", function (message) {
                var data = {
                    message: message,
                    type: "debug"
                };
                _this.sendToDashboard(data, true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "info", function (message) {
                var data = {
                    message: message,
                    type: "info"
                };
                _this.sendToDashboard(data, true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "warn", function (message) {
                var data = {
                    message: message,
                    type: "warn"
                };
                _this.sendToDashboard(data, true);
                _this._cache.push(data);
            });
            VORLON.Tools.Hook(window.console, "error", function (message) {
                var data = {
                    message: message,
                    type: "error"
                };
                //Core.Messenger.sendMonitoringMessage(this.getID(), data.message);
                _this.sendToDashboard(data, true);
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
                _this.sendToDashboard(data, true);
                _this._cache.push(data);
                return error;
            });
        };
        InteractiveConsole.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            switch (receivedObject.type) {
                case "eval":
                    try {
                        eval(receivedObject.order);
                    }
                    catch (e) {
                        console.error("Unable to execute order: " + e.message);
                    }
                    break;
            }
        };
        InteractiveConsole.prototype.refresh = function () {
            this.sendToDashboard({
                type: "clear"
            });
            for (var index = 0; index < this._cache.length; index++) {
                this.sendToDashboard(this._cache[index], true);
            }
        };
        InteractiveConsole.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                // Log container
                _this._containerDiv = VORLON.Tools.QuerySelectorById(filledDiv, "logs");
                // Interactive console
                _this._interactiveInput = VORLON.Tools.QuerySelectorById(div, "input");
                _this._interactiveInput.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13) {
                        _this.sendToClient({
                            order: _this._interactiveInput.value,
                            type: "eval"
                        });
                        _this._commandHistory.push(_this._interactiveInput.value);
                        _this._commandIndex = null;
                        _this._interactiveInput.value = "";
                    }
                    if (evt.keyCode === 38) {
                        if (_this._commandIndex == null)
                            _this._commandIndex = _this._commandHistory.length;
                        if (_this._commandHistory.length > 0 && _this._commandIndex > 0) {
                            _this._commandIndex--;
                            _this._interactiveInput.value = _this._commandHistory[_this._commandIndex];
                        }
                    }
                    else if (evt.keyCode === 40) {
                        if (_this._commandHistory.length > 0 && _this._commandIndex != null) {
                            if (_this._commandIndex < _this._commandHistory.length - 1) {
                                _this._commandIndex++;
                                _this._interactiveInput.value = _this._commandHistory[_this._commandIndex];
                            }
                            else {
                                _this._interactiveInput.value = "";
                                _this._commandIndex = null;
                            }
                        }
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
                case "debug":
                    messageDiv.innerHTML = receivedObject.message;
                    VORLON.Tools.AddClass(messageDiv, "logDebug");
                    break;
                case "info":
                    messageDiv.innerHTML = receivedObject.message;
                    VORLON.Tools.AddClass(messageDiv, "logInfo");
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