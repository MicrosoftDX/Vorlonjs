var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ExpressDashboard = (function (_super) {
        __extends(ExpressDashboard, _super);
        function ExpressDashboard() {
            _super.call(this, "express", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }
        ExpressDashboard.prototype.getID = function () {
            return "EXPRESS";
        };
        ExpressDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this.toogleMenu();
            });
        };
        ExpressDashboard.prototype.toogleMenu = function () {
            $('.plugin-express .open-menu').click(function () {
                $('.plugin-express .open-menu').removeClass('active-menu');
                $('.plugin-express #searchlist').val('');
                $('.plugin-express .explorer-menu').hide();
                $('.plugin-express #' + $(this).data('menu')).show();
                $('.plugin-express .new-entry').fadeOut();
                $(this).addClass('active-menu');
            });
        };
        ExpressDashboard.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
        };
        return ExpressDashboard;
    }(VORLON.DashboardPlugin));
    VORLON.ExpressDashboard = ExpressDashboard;
    VORLON.Core.RegisterDashboardPlugin(new ExpressDashboard());
})(VORLON || (VORLON = {}));
