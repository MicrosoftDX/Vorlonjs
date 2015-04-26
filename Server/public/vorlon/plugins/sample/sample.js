var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var Sample = (function (_super) {
        __extends(Sample, _super);
        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        function Sample() {
            //     name   ,  html for dash   css for dash
            _super.call(this, "sample", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }
        //Return unique id for your plugin
        Sample.prototype.getID = function () {
            return "SAMPLE";
        };
        Sample.prototype.refresh = function () {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
            //we don't really need to do anything in this sample
        };
        // This code will run on the client //////////////////////
        // Start the clientside code
        Sample.prototype.startClientSide = function () {
            //don't actually need to do anything at startup
            console.log('Start client');
        };
        // Handle messages from the dashboard, on the client
        Sample.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            console.log('Got message from sample plugin', receivedObject.message);
            //The dashboard will send us an object like { message: 'hello' }
            //Let's just return it, reversed
            var data = {
                message: receivedObject.message.split("").reverse().join("")
            };
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, 0 /* Client */, "message", true);
        };
        Sample.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._inputField = filledDiv.querySelector('#echoInput');
                _this._outputDiv = filledDiv.querySelector('#output');
                // Send message to client when user types and hits return
                _this._inputField.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13) {
                        VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                            message: _this._inputField.value
                        }, 1 /* Dashboard */);
                        _this._inputField.value = "";
                    }
                });
            });
        };
        // When we get a message from the client, just show it
        Sample.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            var message = document.createElement('p');
            message.textContent = receivedObject.message;
            this._outputDiv.appendChild(message);
        };
        return Sample;
    })(VORLON.Plugin);
    VORLON.Sample = Sample;
    //Register the plugin with vorlon core
    VORLON.Core.RegisterPlugin(new Sample());
})(VORLON || (VORLON = {}));
