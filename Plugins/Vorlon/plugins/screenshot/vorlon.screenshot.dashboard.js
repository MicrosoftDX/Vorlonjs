var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ScreenShotDashboard = (function (_super) {
        __extends(ScreenShotDashboard, _super);
        function ScreenShotDashboard() {
            _super.call(this, "screenshot", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }
        ScreenShotDashboard.prototype.getID = function () {
            return "SCREEN";
        };
        ScreenShotDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._inputField = filledDiv.querySelector('.getScreen');
                _this._pageres = require('./pageres');
                _this._inputField.addEventListener("click", function (evt) {
                    $('.screen-wrapper').find('div').fadeIn();
                    _this.sendToClient({
                        message: 'screen'
                    });
                });
            });
        };
        ScreenShotDashboard.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.message == 'screen') {
                new this._pageres({ delay: 2 })
                    .src(receivedObject.url)
                    .dest('./screens')
                    .run()
                    .then(function () {
                    $('.screen-img').attr('src', 'toto').fadeIn();
                    $('.screen-wrapper').find('p').fadeIn();
                    $('.screen-wrapper').find('div').fadeOut();
                });
            }
        };
        return ScreenShotDashboard;
    }(VORLON.DashboardPlugin));
    VORLON.ScreenShotDashboard = ScreenShotDashboard;
    VORLON.Core.RegisterDashboardPlugin(new ScreenShotDashboard());
})(VORLON || (VORLON = {}));
