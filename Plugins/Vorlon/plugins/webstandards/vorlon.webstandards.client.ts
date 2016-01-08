declare var cssjs: any;

module VORLON {
    export class WebStandardsClient extends ClientPlugin {
        public sendedHTML: string;
        private _doctype: any;
        private _currentAnalyze: any = {};
        private _refreshLoop : any;

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
            //this.debug = true;
            this._loadNewScriptAsync("css.js", () => {
                this._loadNewScriptAsync("axe.min.js", () => {
                    this._ready = true;
                }, true);
            }, true); 
        }


        public refresh(): void {
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

        public startNewAnalyze(data): void {            
            this.trace("start webstandards analyze " + data.id);

            this._currentAnalyze = {
                id: data.id,
                results: {},
                processing: true,
                canceled: false,
                location : window.location.href,
                html: document.documentElement.outerHTML,
                browserDetection : this.browserDetectionHook,
                doctype: {
                    html: null,
                    name: null,
                    publicId: null,
                    systemId: null
                },
                files: {
                    scripts: {},
                    stylesheets: {}
                },
                pendingLoad: 0,
                lastActivity: new Date()
            };

            this.prepareAnalyze(this._currentAnalyze);

            var node = document.doctype;
            if (node) {
                var doctypeHtml = "<!DOCTYPE "
                    + node.name
                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                    + '>';

                this._currentAnalyze.doctype = {
                    html: doctypeHtml,
                    name: node.name,
                    publicId: node.publicId,
                    systemId: node.systemId
                }
            }

            var stylesheets = document.querySelectorAll("link[rel=stylesheet]");
            var nbStylesheets = stylesheets.length;
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    var file = { url: href.value, loaded: false, content: null };
                    this._currentAnalyze.files.stylesheets[href.value] = file;
                    this.getDocumentContent({ analyzeid : data.id, url: href.value }, file, (url: string, file: {content : string}) => {
                        this.analyzeCssDocument(url, file.content, this._currentAnalyze);
                    });
                }
            }

            var scripts = document.querySelectorAll("script");
            var nbScripts = scripts.length;
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src && src.value) {
                    var isVorlon = src.value.indexOf('vorlon.js') > 0 || src.value.indexOf('vorlon.min.js') > 0 || src.value.indexOf('vorlon.max.js') > 0;
                    if (!isVorlon) {
                        var file = { url: src.value, loaded: false, content: null };
                        this._currentAnalyze.files.scripts[src.value] = file;
                        this.getDocumentContent({ analyzeid : data.id, url: src.value }, file, (url: string, file: {content : string}) => {
                            this.analyzeJsDocument(url, file.content, this._currentAnalyze);
                        });
                    }
                }
            }

            this.analyzeDOM(document, this._currentAnalyze.html, this._currentAnalyze);      
            this._refreshLoop = <any>setInterval(()=>{
                this.checkLoadingState();
            }, 1000);
        }

        checkLoadingState() {
            if (this._currentAnalyze && this._currentAnalyze.pendingLoad <= 0) {
                this.trace("resource load completed");
                this._currentAnalyze.processing = false;
            }

            if (!this._currentAnalyze || this._currentAnalyze.ended || this._currentAnalyze.canceled) {
                return;
            }

            if (this._currentAnalyze.processing) {
                return;
            } else {                
                this._currentAnalyze.ended = true;
                this.endAnalyze(this._currentAnalyze);
            }
        }

        initialiseRuleSummary(rule, analyze) {
            var tokens = rule.id.split('.');
            var current = analyze.results;
            var id = "";
            current.rules = current.rules || {};
            tokens.forEach(function(t) {
                id = (id.length > 0) ? "." + t : t;

                if (!current.rules) {
                    current.rules = {};
                }

                if (!current.rules[t])
                    current.rules[t] = { id: id };

                current = current.rules[t];
            });

            if (current.failed === undefined) {
                current.failed = false;
                current.title = rule.title;
                current.description = rule.description;
            }

            return current;
        }

        prepareAnalyze(analyze) {
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = <ICSSRule>VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.prepare)
                        cssrule.prepare(current, analyze);
                }
            }

            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.prepare)
                        scriptrule.prepare(current, analyze);
                }
            }
            
            for (var n in VORLON.WebStandards.Rules.Accessibility) {
                var accessibilityRule = <IRule>VORLON.WebStandards.Rules.Accessibility[n];
                if (accessibilityRule) {
                    var current = this.initialiseRuleSummary(accessibilityRule, analyze);
                    if (accessibilityRule.prepare)
                        accessibilityRule.prepare(current, analyze);
                }
            }
        }

        endAnalyze(analyze) {
            clearInterval(this._refreshLoop);
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = <IDOMRule>VORLON.WebStandards.Rules.DOM[n];
                if (rule && !rule.generalRule && rule.endcheck) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.endcheck(current, analyze);
                }
            }

            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = <ICSSRule>VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.endcheck)
                        cssrule.endcheck(current, analyze);
                }
            }

            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.endcheck)
                        scriptrule.endcheck(current, analyze);
                }
            }           

            this.analyzeFiles(this._currentAnalyze);
            this.trace("sending result to dashboard");
            this.sendCommandToDashboard("analyseResult", { result : this._currentAnalyze });
        }
        
        cancelAnalyse(id : string){            
            clearInterval(this._refreshLoop);
            this.trace("canceling analyze " + id);
            if (this._currentAnalyze && this._currentAnalyze.id == id){
                this.trace("analyze " + id + " canceled");
                this._currentAnalyze.canceled = true;
                this._currentAnalyze.processing = false;
                this.sendCommandToDashboard("analyseCanceled", { id : this._currentAnalyze.id });
            }
        }

        analyzeDOM(document: HTMLDocument, htmlContent: string, analyze) {
            var generalRules = [];
            var commonRules = [];

            var rules = {
                domRulesIndex: <any>{},
                domRulesForAllNodes: []
            };
            
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = <IDOMRule>VORLON.WebStandards.Rules.DOM[n];
                if (rule) {
                    var rulecheck = this.initialiseRuleSummary(rule, analyze);
                    if (rule.prepare) {
                        rule.prepare(rulecheck, analyze);
                    }

                    if (rule.generalRule) {
                        generalRules.push(rule);
                    } else {
                        commonRules.push(rule);
                        if (rule.nodeTypes.length) {
                            rule.nodeTypes.forEach(function(n) {
                                n = n.toUpperCase();
                                if (!rules.domRulesIndex[n])
                                    rules.domRulesIndex[n] = [];

                                rules.domRulesIndex[n].push(rule);
                            });
                        } else {
                            rules.domRulesForAllNodes.push(rule);
                        }
                    }
                }
            }

            this.analyzeDOMNode(document, rules, analyze, htmlContent);

            generalRules.forEach((rule) => {
                this.applyDOMNodeRule(document, rule, analyze, htmlContent);
            });
        }

        analyzeDOMNode(node: Node, rules: any, analyze, htmlContent: string) {
            if (node.nodeName === "STYLE") {
                this.analyzeCssDocument("inline", (<HTMLElement>node).innerHTML, analyze);
            }

            if (node.nodeName === "SCRIPT") {
                var domnode = <HTMLElement>node;
                var scriptType = domnode.getAttribute("type");
                var hasContent = domnode.innerHTML.trim().length > 0;

                if (!scriptType || scriptType == "text/javascript" && hasContent) {
                    this.analyzeJsDocument("inline", domnode.innerHTML, analyze);
                }
            }

            var specificRules = rules.domRulesIndex[node.nodeName.toUpperCase()];
            if (specificRules && specificRules.length) {
                specificRules.forEach((r) => {
                    this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }

            if (rules.domRulesForAllNodes && rules.domRulesForAllNodes.length) {
                rules.domRulesForAllNodes.forEach((r) => {
                    this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }

            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                this.analyzeDOMNode(node.childNodes[i], rules, analyze, htmlContent);
            }
        }

        applyDOMNodeRule(node: Node, rule: IDOMRule, analyze, htmlContent: string) {
            var current = this.initialiseRuleSummary(rule, analyze);
            rule.check(node, current, analyze, htmlContent);
        }

        analyzeCssDocument(url, content, analyze) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            this.trace("processing css " + url);
                        
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var rule = <ICSSRule>VORLON.WebStandards.Rules.CSS[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, parsed, current, analyze);
                }
            }
        }

        analyzeFiles(analyze) {
            for (var n in VORLON.WebStandards.Rules.Files) {
                var rule = <IFileRule>VORLON.WebStandards.Rules.Files[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(current, analyze);
                }
            }
        }

        analyzeJsDocument(url, content, analyze) {
            this.trace("processing script " + url);
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var rule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, content, current, analyze);
                }
            }
        }

        public getDocumentContent(data: { analyzeid : string, url: string }, file: { content : string, loaded : boolean, status?: number, encoding?:string,contentLength?:number, error?:any}, resultcallback: (url: string, file: { content : string, loaded : boolean}) => void) {
            this._currentAnalyze.pendingLoad++;
            this.trace("request file " + data.url + " " + this._currentAnalyze.pendingLoad);
            this.xhrDocumentContent(data, (url: string, content: string, status: number, contentlength: number, encoding: string, error: any) => {
                file.content = content;
                file.loaded = (error == null || error == undefined);
                file.encoding = encoding;
                file.contentLength = contentlength;
                file.error = error;
                file.status = status;
                this._currentAnalyze.lastActivity = new Date();
                this._currentAnalyze.pendingLoad--;
                this.checkLoadingState();
                
                if (file.loaded && !this._currentAnalyze.canceled){
                    resultcallback(data.url, file);
                }
            });
        }

        public xhrDocumentContent(data: { analyzeid : string, url: string }, resultcallback: (url: string, content: string, status: number, contentlength?: number, encoding?: string, errors?: any) => void) {
            var xhr = null;
            var completed = false;
            var timeoutRef = null;
            if (!data || !data.url) {
                this.trace("invalid fetch request");
                return;
            }

            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0) {
                documentUrl = window.location.protocol + documentUrl;
            }

            documentUrl = this.getAbsolutePath(documentUrl);
            this.trace("fetching " + documentUrl);

            try {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            completed = true;
                            clearTimeout(timeoutRef);
                            var encoding = xhr.getResponseHeader("X-VorlonProxyEncoding") || xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            this.trace("encoding for " + data.url + " is " + encoding);
                            resultcallback(data.url, xhr.responseText, xhr.status, contentLength, encoding, null);
                        }
                        else {
                            completed = true;
                            clearTimeout(timeoutRef);
                            resultcallback(data.url, null, xhr.status, null, null, xhr.responseText);
                        }
                    }
                };

                xhr.open("GET", documentUrl, true);
                xhr.send(null);
                timeoutRef = setTimeout(() => {
                    if (!completed) {
                        completed = true;
                        this.trace("fetch timeout for " + data.url);
                        xhr.abort();
                        resultcallback(data.url, null, null, null, null, "timeout");
                    }
                }, 20 * 1000);
            } catch (e) {
                console.error(e);
                completed = true;
                clearTimeout(timeoutRef);
                resultcallback(data.url, null, null, null, null, e.message);
            }
        }

        public getAbsolutePath(url) {
            var a = document.createElement('a');
            a.href = url;
            return a.href;
        }
    }

    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyze: function(data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.startNewAnalyze(data);
        },

        cancelAnalyze: function(data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.cancelAnalyse(data.id);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new WebStandardsClient());
}
