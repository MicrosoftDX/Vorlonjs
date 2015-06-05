var VORLON;
(function (VORLON) {
    var Plugin = (function () {
        //public trace = function(msg){}
        function Plugin(name, htmlFragmentUrl, cssStyleSheetUrl) {
            this.loadingDirectory = "vorlon/plugins";
            this._ready = true;
            this._id = "";
            this._type = VORLON.PluginType.OneOne;
            this.traceLog = function (msg) {
                console.log(msg);
            };
            this.traceNoop = function (msg) {
            };
            this.name = name;
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
            this.debug = false;
        }
        Object.defineProperty(Plugin.prototype, "Type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Plugin.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (val) {
                this._debug = val;
                if (val) {
                    this.trace = this.traceLog;
                }
                else {
                    this.trace = this.traceNoop;
                }
            },
            enumerable: true,
            configurable: true
        });
        Plugin.prototype.getID = function () {
            return this._id;
        };
        Plugin.prototype.isReady = function () {
            return this._ready;
        };
        Plugin.prototype.startClientSide = function () {
        };
        Plugin.prototype.startDashboardSide = function (div) {
        };
        Plugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
        };
        Plugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        Plugin.prototype.sendToClient = function (data, incrementVisualIndicator) {
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Dashboard, "message", incrementVisualIndicator);
        };
        Plugin.prototype.sendToDashboard = function (data, incrementVisualIndicator) {
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message", incrementVisualIndicator);
        };
        Plugin.prototype.refresh = function () {
            console.error("Please override plugin.refresh()");
        };
        Plugin.prototype._insertHtmlContentAsync = function (divContainer, callback) {
            var _this = this;
            var basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }
            var request = new XMLHttpRequest();
            request.open('GET', basedUrl + this.htmlFragmentUrl, true);
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
        Plugin.prototype._loadNewScriptAsync = function (scriptName, callback) {
            var basedUrl = "";
            if (this.loadingDirectory.indexOf('http') === 0) {
                basedUrl = this.loadingDirectory + "/" + this.name + "/";
            }
            else {
                basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            }
            var scriptToLoad = document.createElement("script");
            scriptToLoad.setAttribute("src", basedUrl + scriptName);
            scriptToLoad.onload = callback;
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(scriptToLoad, first);
        };
        Plugin.prototype._stripContent = function (content) {
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
        return Plugin;
    })();
    VORLON.Plugin = Plugin;
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.plugin.js.map