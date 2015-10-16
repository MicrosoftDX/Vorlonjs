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

        public checkLocalFallBack(id: any) {

            if (this._currentAnalyze && this._currentAnalyze.processing)
                return;
            this._currentAnalyze = {
                processing: true,
                pendingLoad: 0,
                stylesheets: [],
                id: Math.floor(Math.random() * 10000000) + 1,
                results: {}
            };
            var stylesheets = document.querySelectorAll("link[rel=stylesheet]");
            var inlineStylesheets = document.querySelectorAll("style");
            var empty = true;
            if (inlineStylesheets.length) {
                empty = false;
                for (var x = 0; x < inlineStylesheets.length; x++) {
                    this._currentAnalyze.pendingLoad++;
                    this._currentAnalyze.stylesheets.inline = {};
                    this.documentContent({ id: id, url: "inline", content: (<HTMLElement>inlineStylesheets[x]).innerHTML, status: 200 })
                }
            }
            if (stylesheets.length) {
                empty = false;
                for (var i = 0; i < stylesheets.length; i++) {
                    var s = stylesheets[i];
                    var href = s.attributes.getNamedItem("href");
                    if (href) {
                        this._currentAnalyze.stylesheets[href.value] = { loaded: false, content: null };
                        this.localFetchDocument({ url: href.value, id: id })
                        this._currentAnalyze.pendingLoad++;
                    }
                }
            }
            if (empty) {

                this.sendCommandToDashboard("htmlContent", { html: this.sendedHTML, doctype: this._doctype, url: window.location, browserDetection: this.browserDetectionHook, id: id, fallBackErrorList: [] });
            }
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
            if (data.analyzeCssFallback)
                var fallBackErrorList = this.checkLocalFallBack(data.id);
            else
                this.sendCommandToDashboard("htmlContent", { html: allHTML, doctype: this._doctype, url: window.location, browserDetection: this.browserDetectionHook, id: data.id, fallBackErrorList: null });
        }

        public localFetchDocument(data: { id: string, url: string }) {
            var xhr = null;
            if (!data || !data.url) {
                this.trace("invalid localFetch request");
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
            this.trace("local fetching " + documentUrl);

            try {

                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            var encoding = xhr.getResponseHeader("X-VorlonProxyEncoding") || xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            this.trace("encoding for " + documentUrl + " is " + encoding);

                            this.documentContent({ id: data.id, url: data.url, status: xhr.status, content: xhr.responseText, contentLength: contentLength, encoding: encoding });
                        }
                        else {
                            this.documentContent({ id: data.id, url: data.url, status: xhr.status, content: null, error: xhr.statusText });
                        }
                    }
                };

                xhr.open("GET", documentUrl, true);
                xhr.send(null);
            } catch (e) {
                console.error(e);
                this.documentContent({ id: data.id, url: data.url, status: 0, content: null, error: e.message });
            }
        }


        private documentContent(data: { id: string, url: string, content: string, error?: string, encoding?: string, contentLength?: string, status: number }) {
            var item = null;
            var container = this._currentAnalyze.stylesheets;
            if (container[data.url]) {
                item = container[data.url];

            }
            if (item) {
                this._currentAnalyze.pendingLoad--;
                item.loaded = true;
                item.encoding = data.encoding;
                item.content = data.content;
                item.contentLength = data.contentLength;
                item.error = data.error;
                item.status = data.status;

                if (data.error) {
                    item.loaded = false;
                }

                if (this._currentAnalyze.pendingLoad == 0) {
                    this._currentAnalyze.processing = false;
                }
            }
            this.analyzeCssDocument(data.url, data.content, this._currentAnalyze, data.id);

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
        analyzeCssDocument(url, content, analyze, id) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            // console.log("processing css " + url);
            for (var i = 0; i < parsed.length; i++) {
                var selector = parsed[i].selector;
                var rules = parsed[i].rules;

                var resultsList = this.checkPrefix(rules);
                if (resultsList.length > 0) {
                    if (!this._currentAnalyze.results[url])
                        this._currentAnalyze.results[url] = {}
                    if (!this._currentAnalyze.results[url][selector])
                        this._currentAnalyze.results[url][selector] = [];
                    for (var x = 0; x < resultsList.length; x++) {
                        this._currentAnalyze.results[url][selector].push(resultsList[x]);
                    }
                }


            }

            if (this._currentAnalyze.pendingLoad == 0) {
                // this.sendCommandToDashboard("cssPrefixeResutls", { data: this._currentAnalyze.results });
                this.sendCommandToDashboard("htmlContent", { html: this.sendedHTML, doctype: this._doctype, url: window.location, browserDetection: this.browserDetectionHook, id: id, fallBackErrorList: this._currentAnalyze.results });
            }

        }

        public fetchDocument(data: { id: string, url: string }, localFetch: boolean = false) {
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
