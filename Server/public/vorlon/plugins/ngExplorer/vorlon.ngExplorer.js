var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var NgExplorerPlugin = (function (_super) {
        __extends(NgExplorerPlugin, _super);
        function NgExplorerPlugin() {
            _super.call(this, "ngExplorer", "control.html", "control.css");
            this._ready = true;
            console.log('Started ngExplorer');
        }
        NgExplorerPlugin.prototype.getID = function () {
            return "NGEXPLORER";
        };
        NgExplorerPlugin.prototype.refresh = function () {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        };
        // Client side
        NgExplorerPlugin.prototype.startClientSide = function () {
        };
        // Handle messages from the dashboard, on the client
        NgExplorerPlugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), {}, 0 /* Client */, "message", true);
        };
        NgExplorerPlugin.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this._scopesView = VORLON.Tools.QuerySelectorById(filledDiv, "scopes-view");
                _this._scopeDetailsView = VORLON.Tools.QuerySelectorById(filledDiv, "scope-details-view");
                $('.ng-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
            });
        };
        // When we get a message from the client, just show it
        NgExplorerPlugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
        };
        return NgExplorerPlugin;
    })(VORLON.Plugin);
    VORLON.Core.RegisterPlugin(new NgExplorerPlugin());
})(VORLON || (VORLON = {}));
