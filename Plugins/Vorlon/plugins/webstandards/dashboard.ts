declare var cssjs: any;

module VORLON {
    var _webstandardsRefreshLoop;
    var rulesLabels = {
        "webstandards": "Web standards",
        "accessibility": "Accessibility",
        "performances": "Performances",
        "mobileweb": "Mobile web",
    }

    export class WebStandardsDashboard extends DashboardPlugin {
        constructor() {
            super("webstandards", "control.html", "control.css");
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            this._ready = true;
        }

        private _startCheckButton: HTMLButtonElement;
        private _cancelCheckButton: HTMLButtonElement;
        private _rootDiv: HTMLElement;
        private _currentAnalyze = null;
        private _rulesPanel: WebStandardsRulesPanel = null;
        private _ruleDetailPanel: WebStandardsRuleDetailPanel = null;
        public analyzeCssFallback: boolean = true;

        public startDashboardSide(div: HTMLDivElement = null): void {
            var script = <HTMLScriptElement>document.createElement("SCRIPT");
            script.src = "/javascripts/css.js";
            document.body.appendChild(script);

            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._ruleDetailPanel = new WebStandardsRuleDetailPanel(filledDiv.querySelector('#webstandards-ruledetailpanel'));
                this._rulesPanel = new WebStandardsRulesPanel(filledDiv.querySelector('#webstandards-rulespanel'), this._ruleDetailPanel);

                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._cancelCheckButton = <HTMLButtonElement>filledDiv.querySelector('#cancelCheck');
                this._rootDiv = <HTMLElement>filledDiv;

                this._startCheckButton.addEventListener("click", (evt) => {
                    this._startCheckButton.disabled = true;
                    this._cancelCheckButton.disabled = false;
                    this._currentAnalyze = {
                        processing: true,
                        id: VORLON.Tools.CreateGUID()
                    };
                    this._rootDiv.classList.add("loading");
                    this._rulesPanel.clear("analyze in progress...");
                    this.sendCommandToClient('startNewAnalyze', { id: this._currentAnalyze.id, analyzeCssFallback: this.analyzeCssFallback });
                });

                this._cancelCheckButton.addEventListener("click", (evt) => {
                    this._startCheckButton.disabled = false;
                    this._cancelCheckButton.disabled = true;
                    this._currentAnalyze.processing = false;
                    this._currentAnalyze.canceled = true;
                    this._rootDiv.classList.remove("loading");
                    this._rulesPanel.clear("retry by clicking on start button");
                });

                clearInterval(_webstandardsRefreshLoop);
                _webstandardsRefreshLoop = setInterval(() => {
                    this.checkLoadingState();
                }, 3000);
            });
        }

        checkLoadingState() {
            if (this._currentAnalyze && this._currentAnalyze.pendingLoad <= 0) {
                console.log("resource load completed");
                this._currentAnalyze.processing = false;
            }
                
            if (!this._currentAnalyze || this._currentAnalyze.ended || this._currentAnalyze.canceled) {
                return;
            }

            if (this._currentAnalyze.processing) {

            } else {
                this.endAnalyze(this._currentAnalyze);
                this._rootDiv.classList.remove("loading");
                this._currentAnalyze.ended = true;
                this._ruleDetailPanel.setMessage("click on a rule in the result panel to show details");
                this._rulesPanel.setRules(this._currentAnalyze);
                this._startCheckButton.disabled = false;
                this._cancelCheckButton.disabled = true;
            }
        }

        receiveHtmlContent(data: { id: string, html: string, doctype: any, url: any, browserDetection: any, stylesheetErrors: any }) {
            if (!this._currentAnalyze) {
                this._currentAnalyze = { processing: true };
            }

            if (!this._currentAnalyze.files) {
                this._currentAnalyze.files = {};
            }

            this._currentAnalyze.lastActivity = new Date();

            this._currentAnalyze.html = data.html;
            this._currentAnalyze.doctype = data.doctype;
            this._currentAnalyze.location = data.url;
            this._currentAnalyze.browserDetection = data.browserDetection;

            var fragment: HTMLDocument = document.implementation.createHTMLDocument("analyze");
            fragment.documentElement.innerHTML = data.html;
            this._currentAnalyze.pendingLoad = 0;

            this._currentAnalyze.files.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            var nbScripts = scripts.length;
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src && src.value) {
                    var isVorlon = src.value.indexOf('vorlon.js') > 0 || src.value.indexOf('vorlon.min.js') > 0 || src.value.indexOf('vorlon.max.js') > 0;
                    if (!isVorlon) {
                        this._currentAnalyze.files.scripts[src.value] = { loaded: false, content: null };
                        this.sendCommandToClient('fetchDocument', { url: src.value, id: this._currentAnalyze.id, type: "script" });
                        this._currentAnalyze.pendingLoad++;
                        console.log("request file " + src.value + " " + this._currentAnalyze.pendingLoad);
                    }
                }
            }

            this._currentAnalyze.files.stylesheets = {};
            var stylesheets = fragment.querySelectorAll("link[rel=stylesheet]");
            var nbStylesheets = stylesheets.length;
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    this._currentAnalyze.files.stylesheets[href.value] = { loaded: false, content: null };
                    this.sendCommandToClient('fetchDocument', { url: href.value, id: this._currentAnalyze.id, type: "stylesheet", analyzeCssFallback: this.analyzeCssFallback });
                    this._currentAnalyze.pendingLoad++;
                    console.log("request file " + href.value + " " + this._currentAnalyze.pendingLoad);
                }
            }
            if (!this._currentAnalyze.fallBackErrorList)
                this._currentAnalyze.fallBackErrorList = [];

            if (data.stylesheetErrors)
                this._currentAnalyze.fallBackErrorList.push(data.stylesheetErrors);
            this._currentAnalyze.results = {};
            this.prepareAnalyze(this._currentAnalyze)
            this.analyzeDOM(fragment, data.html, this._currentAnalyze);

        }

        receiveDocumentContent(data: { id: string, url: string, content: string, error?: string, encoding?: string, contentLength?: string, status: number, stylesheetErrors: any }) {
            var item = null;
            var itemContainer = null;

            this._currentAnalyze.lastActivity = new Date();


            for (var n in this._currentAnalyze.files) {
                var container = this._currentAnalyze.files[n];
                if (container[data.url]) {
                    item = container[data.url];
                    itemContainer = n;
                }
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

                
            }

            if (itemContainer === "stylesheets") {
                if (this.analyzeCssFallback) {
                    if (!this._currentAnalyze.fallBackErrorList)
                        this._currentAnalyze.fallBackErrorList = [];
                    if (data.stylesheetErrors)
                        this._currentAnalyze.fallBackErrorList.push(data.stylesheetErrors);

                }
                else {
                    this._currentAnalyze.fallBackErrorList = null;
                }
                this.analyzeCssDocument(data.url, data.content, this._currentAnalyze);
            }

            if (itemContainer === "scripts") {
                this.analyzeJsDocument(data.url, data.content, this._currentAnalyze);
            }
            console.log("receive content " + data.url + " " + this._currentAnalyze.pendingLoad);
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
                        rule.prepare(rulecheck, analyze, htmlContent);
                    }

                    if (rule.generalRule) {
                        generalRules.push(rule);
                    } else {
                        commonRules.push(rule);
                        if (rule.nodeTypes.length) {
                            rule.nodeTypes.forEach(function (n) {
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

        initialiseRuleSummary(rule, analyze) {
            var tokens = rule.id.split('.');
            var current = analyze.results;
            var id = "";
            current.rules = current.rules || {};
            tokens.forEach(function (t) {
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

        applyDOMNodeRule(node: Node, rule: IDOMRule, analyze, htmlContent: string) {
            var current = this.initialiseRuleSummary(rule, analyze);
            rule.check(node, current, analyze, htmlContent);
        }

        analyzeCssDocument(url, content, analyze) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            console.log("processing css " + url);
                        
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
            console.log("processing script " + url);
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var rule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, content, current, analyze);
                }
            }
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
        }

        endAnalyze(analyze) {
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = <IDOMRule>VORLON.WebStandards.Rules.DOM[n];
                if (rule && !rule.generalRule && rule.endcheck) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.endcheck(current, analyze, this._currentAnalyze.html);
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
        }
    }

    WebStandardsDashboard.prototype.DashboardCommands = {
        htmlContent: function (data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveHtmlContent(data);
        },

        documentContent: function (data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveDocumentContent(data);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new WebStandardsDashboard());

    class WebStandardsRulesPanel {
        element: HTMLElement;
        detailpanel: WebStandardsRuleDetailPanel;
        selectedRuleElt: HTMLElement;

        constructor(element: Element, detailpanel: WebStandardsRuleDetailPanel) {
            this.element = <HTMLElement>element;
            this.element.style.display = "none";
            this.detailpanel = detailpanel;
        }

        clear(msg) {
            this.element.style.display = "none";
            this.detailpanel.clear(msg);
        }

        setRules(analyze) {
            console.log("RENDER ANALYZE");
            console.log(analyze);
            this.element.style.display = "";
            this.element.innerHTML = "";
            this.renderRules(analyze.results.rules, this.element, 1);
        }

        renderRules(rules, parent: HTMLElement, level: number) {
            var items = [];
            for (var n in rules) {
                var rule = rules[n];
                //if (rule.rules || rule.failed){
                if (!rule.title) {
                    rule.title = rulesLabels[rule.id];
                }
                if (!rule.title) {
                    rule.title = n;
                }
                items.push(rule);              
                //}  
            }

            items.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            })

            items.forEach((rule) => {
                this.renderRule(rule, parent, level);
            })
        }

        renderRule(rule, parent: HTMLElement, level: number) {
            var ruleitem = new FluentDOM('DIV', 'rule level' + level, parent);
            ruleitem.append('DIV', 'title', (title) => {
                if (rule.failed !== undefined) {
                    title.createChild("SPAN", "state fa " + (rule.failed ? "fa-close" : "fa-check"));
                }
                title.createChild("SPAN").text(rule.title);
                if (rule.rules) {
                    title.click(() => {
                        ruleitem.toggleClass("collapsed");
                        ruleitem.toggleClass("expanded");
                    });
                }
                else {
                    title.click(() => {
                        if (this.selectedRuleElt) {
                            this.selectedRuleElt.classList.remove("selected");
                        }
                        ruleitem.element.classList.add("selected");
                        this.selectedRuleElt = ruleitem.element;
                        this.detailpanel.setRule(rule);
                    });
                }
            });

            if (rule.rules) {
                ruleitem.addClass("collapsible");
                ruleitem.addClass("collapsed");
                ruleitem.append('DIV', 'childs', (childs) => {
                    this.renderRules(rule.rules, childs.element, level + 1);
                });
            }
        }
    }

    class WebStandardsRuleDetailPanel {
        element: HTMLElement;

        constructor(element: Element) {
            this.element = <HTMLElement>element;
        }

        setRule(rule) {
            this.element.innerHTML = "";

            var fluent = FluentDOM.forElement(this.element);
            fluent.append("DIV", "ruledetailpanel-content", (content) => {
                content.append("DIV", "item", (item) => {
                    if (rule.type)
                        item.addClass(rule.type);

                    item.append("H1", "title", (title) => {
                        title.createChild("SPAN", "state fa " + (rule.failed ? "fa-close" : "fa-check"));
                        title.createChild("SPAN", "text").html(rule.title);
                    });

                    if (rule.description) {
                        item.append("DIV", "description", (desc) => {
                            desc.html(rule.description);
                        });
                    }

                    if (rule.items && rule.items.length) {
                        item.append("DIV", "items", (itemselt) => {
                            rule.items.forEach((item) => {
                                this.renderItem(item, itemselt);
                            });
                        });
                    }
                });
            });
        }

        renderItem(item, parent: FluentDOM) {
            parent.append("DIV", "item", (itemelt) => {
                if (item.type) {
                    itemelt.addClass(item.type);
                }
                if (item.title && item.alert) {
                    itemelt.createChild("SPAN", "state fa " + (item.failed ? "fa-close" : "fa-check")).html(item.title);
                }
                else if (item.title) {
                    itemelt.createChild("DIV", "title").html(item.title);
                }
                if (item.message) {
                    itemelt.createChild("DIV", "message").html(item.message);
                }
                if (item.content) {
                    itemelt.createChild("DIV", "content").html(item.content);
                }

                if (item.items && item.items.length) {
                    itemelt.append("DIV", "items", (itemselt) => {
                        item.items.forEach((item) => {
                            this.renderItem(item, itemselt);
                        });
                    });
                }
            });
        }

        clear(msg) {
            this.setMessage(msg);
        }

        setMessage(msg) {
            this.element.innerHTML = '<div class="empty">' + msg + '</div>';
        }
    }
}
