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

//# sourceMappingURL=../../plugins/interactiveConsole/vorlon.interactiveConsole.js.map