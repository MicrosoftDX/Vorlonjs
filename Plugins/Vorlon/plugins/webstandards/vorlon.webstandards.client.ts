module VORLON {
    export class WebStandardsClient extends ClientPlugin {
        public sendedHTML: string;
        public browserDetectionHook = {
            userAgent: [],
            appVersion: [],
            appName: [],
            product: [],
            vendor: [],
        };
        private exceptions = [
            "vorlon.max.js",
            "vorlon.min.js",
            "vorlon.js",
            "google-analytics.com"
        ];

        constructor() {
            super("webstandards");
            this._id = "WEBSTANDARDS";
            this._ready = true;
            //this.debug = true;            
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        }

        // Start the clientside code
        public startClientSide(): void {
            this.hook(window.navigator, "userAgent");
            this.hook(window.navigator, "appVersion");
            this.hook(window.navigator, "appName");
            this.hook(window.navigator, "product");
            this.hook(window.navigator, "vendor");
        }

        public hook(root, prop) {
            VORLON.Tools.HookProperty(root, prop, (stack) => {
                //this.trace("browser detection " + stack.file);
                //this.trace(stack.stack);
                if (stack.file) {
                    if (this.exceptions.some((s) => { return stack.file.indexOf(s) >= 0 })) {
                        //this.trace("skip browser detection access " + stack.file)
                        
                        return;
                    }
                }
                this.browserDetectionHook[prop].push(stack);
            });
        }

        private capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        public checkLocalFallBack(): Array<string> {

            //var div = document.createElement('div');

            //var compatiblePrefixes = ".vorlonstyletest { -webkit-animation: movement; -webkit-animation-delay: 5ms; -webkit-animation-direction: alternate; -webkit-animation-duration: 5s; -webkit-animation-fill-mode: both; -webkit-animation-iteration-count: infinite; -webkit-animation-name: movement; -webkit-animation-play-state: running; -webkit-animation-timing-function: ease; -webkit-appearance: button; -webkit-border-end: 10px; -webkit-border-end-color: red; -webkit-border-end-style: bold; -webkit-border-end-width: 5px; -webkit-border-start: 10px; -webkit-border-start-color: red; -webkit-border-start-style: bold; -webkit-border-start-width: 10px; -webkit-box-sizing: border-box; -webkit-column-count: 2; -webkit-column-gap: 10px; -webkit-column-rule: dashed; -webkit-column-rule-color: red; -webkit-column-rule-style: dashed; -webkit-column-rule-width: medium; -webkit-column-width: 5px; -webkit-hyphens: manual; /*-webkit-margin-end: ;*/ -webkit-margin-start: 5px; -webkit-padding-end: 10px; -webkit-padding-start: 10px; -webkit-tab-size: 4; -webkit-text-size-adjust: none; -webkit-transform: matrix3d(90deg); -webkit-transform-origin: right; -webkit-transition: ease; -webkit-transition-delay: 1s; -webkit-transition-duration: 1s; -webkit-transition-property: none; -webkit-transition-timing-function: linear; -webkit-user-select: none; } @-webkit-keyframes movement { 0% { opacity: 0; } 100% { opacity: 1; } }";
            var styleList = {
                'animation': 'movement',
                'animationDelay': '5ms',
                'animationDirection': 'alternate',
                'animationDuration': '5s',
                'animationFillMode': 'both',
                'animationIterationCount': 'infinite',
                'animationName': 'movement',
                'animationPlayState': 'running',
                'animationTimingFunction': 'ease',
                'appearance': 'button',
                'borderEnd': '10px',
                'borderEndColor': 'red',
                'borderEndStyle': 'bold',
                'borderEndWidth': '5px',
                'borderStart': '10px',
                'borderStartColor': 'red',
                'borderStartStyle': 'bold',
                'borderStartWidth': '10px',
                'boxSizing': 'border-box',
                'columnCount': '2',
                'columnGap': '10px',
                'columnRule': 'dashed',
                'columnRuleColor': 'red',
                'columnRuleStyle': 'dashed',
                'columnRuleWidth': 'medium',
                'columnWidth': '5px',
                'hyphens': 'manual',
                'marginStart': '5px',
                'paddingEnd': '10px',
                'paddingStart': '10px',
                'tabSize': '4',
                'textSizeAdjust': 'none',
                'transform': 'rotate(90deg)',
                'transformOrigin': 'right',
                'transition': 'ease',
                'transitionDelay': '1s',
                'transitionDuration': '1s',
                'transitionProperty': 'none',
                'transitionTimingFunction': 'linear',
                'userSelect': 'none',
            }
            //var styleelement = document.createElement('style');
            //styleelement.innerHTML = compatiblePrefixes;
            //div.appendChild(styleelement);
            var divTest = document.createElement('div');
            //div.appendChild(divTest);
            var fallBackErrorList = [];
            for (var n in styleList) {
                divTest.style['webkit' + this.capitalizeFirstLetter(n)] = styleList[n];
                if (divTest.style[n] != styleList[n]) {
                    fallBackErrorList.push(n);
                }
            }
            return fallBackErrorList;
        }

        public startNewAnalyse(data): void {
            var allHTML = document.documentElement.outerHTML;
            this.sendedHTML = allHTML;

            var doctype: any;
            var node = document.doctype;

            if (node) {
                var doctypeHtml = "<!DOCTYPE "
                    + node.name
                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                    + '>';
                doctype = {
                    html: doctypeHtml,
                    name: node.name,
                    publicId: node.publicId,
                    systemId: node.systemId
                }
            }
            var fallBackErrorList = this.checkLocalFallBack();
            this.sendCommandToDashboard("htmlContent", { html: allHTML, doctype: doctype, url: window.location, browserDetection: this.browserDetectionHook, id: data.id, fallBackErrorList });
        }

        public fetchDocument(data: { id: string, url: string }) {
            var xhr = null;
            if (!data || !data.url) {
                this.trace("invalid fetch request");
                return;
            }

            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0) {
                documentUrl = window.location.protocol + documentUrl;
            }
            if (documentUrl.indexOf("http") === 0) {
                //external resources may not have Access Control headers, we make a proxied request to prevent CORS issues
                var serverurl = (<any>VORLON.Core._messenger)._serverUrl;
                if (serverurl[serverurl.length - 1] !== '/')
                    serverurl = serverurl + "/";
                var target = this.getAbsolutePath(data.url);
                documentUrl = serverurl + "httpproxy/fetch?fetchurl=" + encodeURIComponent(target);
            }
            this.trace("fetching " + documentUrl);

            try {

                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            var encoding = xhr.getResponseHeader("X-VorlonProxyEncoding") || xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            this.trace("encoding for " + documentUrl + " is " + encoding);
                            //TODO getting encoding is not working in IE (but do in Chrome), must try on other browsers because getting it may enable performance rules
                            this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: xhr.status, content: xhr.responseText, contentLength: contentLength, encoding: encoding });
                        }
                        else {
                            this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: xhr.status, content: null, error: xhr.statusText });
                        }
                    }
                };

                xhr.open("GET", documentUrl, true);
                xhr.send(null);
            } catch (e) {
                console.error(e);
                this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: 0, content: null, error: e.message });
            }
        }

        public getAbsolutePath(url) {
            var a = document.createElement('a');
            a.href = url;
            return a.href;
        }
    }

    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyse: function (data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.startNewAnalyse(data);
        },

        fetchDocument: function (data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.fetchDocument(data);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new WebStandardsClient());
}
