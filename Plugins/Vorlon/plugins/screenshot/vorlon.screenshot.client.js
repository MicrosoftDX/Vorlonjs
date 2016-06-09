var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ScreenShotClient = (function (_super) {
        __extends(ScreenShotClient, _super);
        function ScreenShotClient() {
            _super.call(this, "screenshot");
            this._ready = true;
        }
        ScreenShotClient.prototype.getID = function () {
            return "SCREEN";
        };
        ScreenShotClient.prototype.refresh = function () {
        };
        ScreenShotClient.prototype.startClientSide = function () {
        };
        ScreenShotClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            if (receivedObject.message == 'screen') {
                console.log('here');
                this.sendToDashboard({ url: location.href, message: 'screen' });
            }
        };
        return ScreenShotClient;
    }(VORLON.ClientPlugin));
    VORLON.ScreenShotClient = ScreenShotClient;
    VORLON.Core.RegisterClientPlugin(new ScreenShotClient());
})(VORLON || (VORLON = {}));
