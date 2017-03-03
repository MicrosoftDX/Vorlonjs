var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
var VORLON;
(function (VORLON) {
    var DashboardPlugin = (function (_super) {
        __extends(DashboardPlugin, _super);
        function DashboardPlugin(name, htmlFragmentUrl, cssStyleSheetUrl) {
            _super.call(this, name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
        }
        DashboardPlugin.prototype.startDashboardSide = function (div) { };
        DashboardPlugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) { };
        DashboardPlugin.prototype.sendToClient = function (data) {
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Dashboard, "message");
        };
        DashboardPlugin.prototype.sendCommandToClient = function (command, data) {
            if (data === void 0) { data = null; }
            if (VORLON.Core.Messenger) {
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Dashboard, "message", command);
            }
        };
        DashboardPlugin.prototype.trace = function (message) {
            console.log(message);
        };
        DashboardPlugin.prototype._insertHtmlContentAsync = function (divContainer, callback) {
            var _this = this;
            var basedUrl = this.loadingDirectory + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }
            var request = new XMLHttpRequest();
            request.open('GET', browser.extension.getURL(basedUrl + this.htmlFragmentUrl), true);
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
        DashboardPlugin.prototype._stripContent = function (content) {
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
        return DashboardPlugin;
    })(VORLON.BasePlugin);
    VORLON.DashboardPlugin = DashboardPlugin;
})(VORLON || (VORLON = {}));
