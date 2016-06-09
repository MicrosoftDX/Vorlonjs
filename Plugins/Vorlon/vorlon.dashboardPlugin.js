var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var DashboardPlugin = (function (_super) {
        __extends(DashboardPlugin, _super);
        function DashboardPlugin(name, htmlFragmentUrl, cssStyleSheetUrl, JavascriptSheetUrl) {
            _super.call(this, name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = (cssStyleSheetUrl instanceof Array) ? cssStyleSheetUrl : (typeof cssStyleSheetUrl === 'undefined') ? [] : [cssStyleSheetUrl];
            this.JavascriptSheetUrl = (JavascriptSheetUrl instanceof Array) ? JavascriptSheetUrl : (typeof JavascriptSheetUrl === 'undefined') ? [] : [JavascriptSheetUrl];
            this.debug = VORLON.Core.debug;
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
                this.trace(this.getID() + ' send command to client ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Dashboard, "message", command);
            }
        };
        DashboardPlugin.prototype.sendCommandToPluginClient = function (pluginId, command, data) {
            if (data === void 0) { data = null; }
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin client ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(pluginId, data, VORLON.RuntimeSide.Dashboard, "protocol", command);
            }
        };
        DashboardPlugin.prototype.sendCommandToPluginDashboard = function (pluginId, command, data) {
            if (data === void 0) { data = null; }
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin dashboard ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(pluginId, data, VORLON.RuntimeSide.Client, "protocol", command);
            }
        };
        DashboardPlugin.prototype._insertHtmlContentAsync = function (divContainer, callback) {
            var _this = this;
            var basedUrl = vorlonBaseURL + "/" + this.loadingDirectory + "/" + this.name + "/";
            var alone = false;
            if (!divContainer) {
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }
            var request = new XMLHttpRequest();
            request.open('GET', basedUrl + this.htmlFragmentUrl, true);
            request.onreadystatechange = function (ev) {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var headID = document.getElementsByTagName("head")[0];
                        for (var i = 0; i < _this.cssStyleSheetUrl.length; i++) {
                            var cssNode = document.createElement('link');
                            cssNode.type = "text/css";
                            cssNode.rel = "stylesheet";
                            cssNode.href = basedUrl + _this.cssStyleSheetUrl[i];
                            cssNode.media = "screen";
                            headID.appendChild(cssNode);
                        }
                        for (var i = 0; i < _this.JavascriptSheetUrl.length; i++) {
                            var jsNode = document.createElement('script');
                            jsNode.type = "text/javascript";
                            jsNode.src = basedUrl + _this.JavascriptSheetUrl[i];
                            headID.appendChild(jsNode);
                        }
                        divContainer.innerHTML = _this._stripContent(request.responseText);
                        if ($(divContainer).find('.split').length && $(divContainer).find('.split').is(":visible") && !$(divContainer).find('.vsplitter').length) {
                            $(divContainer).find('.split').split({
                                orientation: $(divContainer).find('.split').data('orientation'),
                                limit: $(divContainer).find('.split').data('limit'),
                                position: $(divContainer).find('.split').data('position'),
                            });
                        }
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
            var xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im;
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
    }(VORLON.BasePlugin));
    VORLON.DashboardPlugin = DashboardPlugin;
})(VORLON || (VORLON = {}));
