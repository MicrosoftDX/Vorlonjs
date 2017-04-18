window.browser = window.msBrowser ||
    window.browser ||
    window.chrome;
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, targetTabId) {
            var _this = this;
            this._targetTabId = targetTabId;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        _this.onRealtimeMessageReceived(request);
                    });
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        _this.onRealtimeMessageReceived(request);
                    });
                    break;
            }
        }
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, command) {
            if (messageType === void 0) { messageType = "message"; }
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    messageType: messageType
                },
                data: objectToSend
            };
            if (command) {
                message.command = command;
            }
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    browser.runtime.sendMessage(message);
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.tabs.sendMessage(this._targetTabId, message);
                    break;
            }
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));
