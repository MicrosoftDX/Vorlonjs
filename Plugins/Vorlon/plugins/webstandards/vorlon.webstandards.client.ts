declare var cssjs: any;

module VORLON {
    export class WebStandardsClient extends ClientPlugin {
        public sendedHTML: string;
        private _doctype: any;
        private _currentAnalyze: any = {};
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


        public startNewAnalyze(data): void {
            var allHTML = document.documentElement.outerHTML;
            this.sendedHTML = allHTML;


            var node = document.doctype;

            if (node) {
                var doctypeHtml = "<!DOCTYPE "
                    + node.name
                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                    + '>';
                this._doctype = {
                    html: doctypeHtml,
                    name: node.name,
                    publicId: node.publicId,
                    systemId: node.systemId
                }
            }
            var inlineStylesheets = document.querySelectorAll("style");
            var stylesheetErrors = null;
            if (data.analyzeCssFallback) {
                stylesheetErrors = {}
                if (inlineStylesheets.length) {
                    for (var x = 0; x < inlineStylesheets.length; x++) {
                        this.analyzeCssDocument("inline" + [x], (<HTMLElement>inlineStylesheets[x]).innerHTML, data.id, stylesheetErrors);
                    }
                }
            }
            this.sendCommandToDashboard("htmlContent", { html: allHTML, doctype: this._doctype, url: window.location, browserDetection: this.browserDetectionHook, id: data.id, stylesheetErrors: stylesheetErrors });
        }



        checkIfNoPrefix(rules: Array<any>, prefix: string) {
            var present = false;
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf(prefix) === 0) {
                        present = true;
                        break;
                    }
                }
            if (!present) {
                present = this.checkIfMsPrefix(rules, prefix);
            }

            return present;
        }
        checkIfMsPrefix(rules: Array<any>, prefix: string) {
            var present = false;
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf('-ms-' + prefix) === 0) {
                        present = true;
                        break;
                    }
                }

            return present;
        }
        unprefixedPropertyName(property: string) {
            return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
        }
        checkPrefix(rules: Array<any>): Array<string> {
            var errorList = [];
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf('-webkit') === 0) {
                        var _unprefixedPropertyName = this.unprefixedPropertyName(rules[i].directive)
                        var good = this.checkIfNoPrefix(rules, _unprefixedPropertyName);
                        if (!good) {
                            var divTest = document.createElement('div');
                            divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] = rules[i].value;
                            if (divTest.style[_unprefixedPropertyName] == divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)]) {
                                good = true;
                            }
                        }
                        if (!good) {
                            errorList.push(rules[i].directive);
                        }
                    }
                }

            return errorList;
        }
        analyzeCssDocument(url, content, id, results) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            // console.log("processing css " + url);
            for (var i = 0; i < parsed.length; i++) {
                var selector = parsed[i].selector;
                var rules = parsed[i].rules;

                var resultsList = this.checkPrefix(rules);
                if (resultsList.length > 0) {
                    if (!results[url])
                        results[url] = {}
                    if (!results[url][selector])
                        results[url][selector] = [];
                    for (var x = 0; x < resultsList.length; x++) {
                        results[url][selector].push(resultsList[x]);
                    }
                }
            }

        }

        public fetchDocument(data: { id: string, url: string, type: string, analyzeCssFallback: boolean }, localFetch: boolean = false) {
            var xhr = null;
            if (!data || !data.url) {
                this.trace("invalid fetch request");
                return;
            }

            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0) {
                documentUrl = window.location.protocol + documentUrl;
            }

            documentUrl = this.getAbsolutePath(documentUrl);
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
                            var stylesheetErrors = null;
                            if (data.type === "stylesheet" && data.analyzeCssFallback === true) {
                                stylesheetErrors = {};
                                this.analyzeCssDocument(data.url, xhr.responseText, data.id, stylesheetErrors);
                            }
                            //TODO getting encoding is not working in IE (but do in Chrome), must try on other browsers because getting it may enable performance rules
                            this.sendCommandToDashboard("documentContent", { id: data.id, url: data.url, status: xhr.status, content: xhr.responseText, contentLength: contentLength, encoding: encoding, stylesheetErrors: stylesheetErrors });
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
        startNewAnalyze: function (data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.startNewAnalyze(data);
        },

        fetchDocument: function (data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.fetchDocument(data);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new WebStandardsClient());
}
