declare var cssjs: any;

module VORLON {
    var _webstandardsRefreshLoop;
    var rulesLabels = {
        "webstandards": "Web standards",
        "accessibility": "Accessibility",
        "performances": "Performances"
    }

    export class WebStandardsDashboard extends DashboardPlugin {
        constructor() {
            super("webstandards", "control.html", "control.css");
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            this._ready = true;
            console.log('Started');
        }

        private _startCheckButton: HTMLButtonElement;
        private _rootDiv: HTMLElement;
        private _currentAnalyse = null;
        private _rulesPanel: WebStandardsRulesPanel = null;
        private _ruleDetailPanel: WebStandardsRuleDetailPanel = null;

        public startDashboardSide(div: HTMLDivElement = null): void {
            var script = <HTMLScriptElement>document.createElement("SCRIPT");
            script.src = "/javascripts/css.js";
            document.body.appendChild(script);

            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._ruleDetailPanel = new WebStandardsRuleDetailPanel(filledDiv.querySelector('#webstandards-ruledetailpanel'));
                this._rulesPanel = new WebStandardsRulesPanel(filledDiv.querySelector('#webstandards-rulespanel'), this._ruleDetailPanel);

                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._rootDiv = <HTMLElement>filledDiv;

                this._startCheckButton.addEventListener("click", (evt) => {
                    this._currentAnalyse = { processing: true };
                    this._rootDiv.classList.add("loading");
                    this._rulesPanel.clear("analyse in progress...");
                    this.sendCommandToClient('startNewAnalyse');
                });

                clearInterval(_webstandardsRefreshLoop);
                _webstandardsRefreshLoop = setInterval(() => {
                    this.checkLoadingState();
                }, 3000);
            });
        }

        checkLoadingState() {
            if (!this._currentAnalyse || this._currentAnalyse.ended) {
                return;
            }

            if (this._currentAnalyse.processing) {

            } else {
                this.endAnalyse(this._currentAnalyse);
                this._rootDiv.classList.remove("loading");
                this._currentAnalyse.ended = true;
                this._ruleDetailPanel.setMessage("click on a rule in the result panel to show details");
                this._rulesPanel.setRules(this._currentAnalyse);
            }
        }

        receiveHtmlContent(data: { html: string, doctype: any, url:any, browserDetection : any }) {
            if (!this._currentAnalyse) {
                this._currentAnalyse = { processing: true };
            }

            this._currentAnalyse.doctype = data.doctype;
            this._currentAnalyse.location = data.url;
            this._currentAnalyse.browserDetection  = data.browserDetection;
            
            //console.log('received html from client ', data.html);
            var fragment: HTMLDocument = document.implementation.createHTMLDocument("analyse");
            fragment.documentElement.innerHTML = data.html;
            this._currentAnalyse.pendingLoad = 0;

            this._currentAnalyse.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src && src.value) {
                    var isVorlon = src.value.indexOf('vorlon.js') > 0 || src.value.indexOf('vorlon.min.js') > 0 || src.value.indexOf('vorlon.max.js') > 0;
                    if (!isVorlon) {
                        this._currentAnalyse.scripts[src.value] = { loaded: false, content: null };
                        //console.log("found script " + src.value);
                        this.sendCommandToClient('fetchDocument', { url: src.value });
                        this._currentAnalyse.pendingLoad++;
                    }
                }
            }

            this._currentAnalyse.stylesheets = {};
            var stylesheets = fragment.querySelectorAll("link[rel=stylesheet]");
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    this._currentAnalyse.stylesheets[href.value] = { loaded: false, content: null };
                    //console.log("found stylesheet " + href.value);
                    this.sendCommandToClient('fetchDocument', { url: href.value });
                    this._currentAnalyse.pendingLoad++;
                }
            }
            
            this._currentAnalyse.results = {};            
            this.prepareAnalyse(this._currentAnalyse) 
            this.analyseDOM(fragment, data.html, this._currentAnalyse);
        }

        receiveDocumentContent(data: { url: string, content: string, error?: string, encoding?: string, contentLength?: string, status: number }) {
            //console.log("document loaded " + data.url + " " + data.status);
            var item = null;

            if (this._currentAnalyse.stylesheets[data.url]) {
                item = this._currentAnalyse.stylesheets[data.url];
                if (data.content) {
                    this.analyseCssDocument(data.url, data.content, this._currentAnalyse);
                }
            }

            if (this._currentAnalyse.scripts[data.url]) {
                item = this._currentAnalyse.scripts[data.url];
                if (data.content) {
                    this.analyseJsDocument(data.url, data.content, this._currentAnalyse);
                }
            }

            if (item) {
                this._currentAnalyse.pendingLoad--;
                item.loaded = true;
                item.encoding = data.encoding;
                item.content = data.content;
                item.contentLength = data.contentLength;
                item.error = data.error;
                item.status = data.status;

                if (data.error) {
                    item.loaded = false;
                }

                if (this._currentAnalyse.pendingLoad == 0) {
                    this._currentAnalyse.processing = false;
                }
            }
        }

        analyseDOM(document: HTMLDocument, htmlContent: string, analyse) {
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
                    var rulecheck = this.initialiseRuleSummary(rule, analyse);
                    if (rule.prepare) {
                        rule.prepare(rulecheck, analyse, htmlContent);
                    }

                    if (rule.generalRule) {
                        generalRules.push(rule);
                    } else {
                        commonRules.push(rule);
                        //console.log("indexing " + rule.id);
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

            this.analyseDOMNode(document, rules, analyse, htmlContent);

            generalRules.forEach((rule) => {
                this.applyDOMNodeRule(document, rule, analyse, htmlContent);
            });

            commonRules.forEach((rule) => {
                if (rule.endcheck) {
                    var current = this.initialiseRuleSummary(rule, analyse);
                    rule.endcheck(current, analyse, htmlContent);
                }
            })
            
        }

        analyseDOMNode(node: Node, rules: any, analyse, htmlContent: string) {
            //console.log("checking " + node.nodeName);
            if (node.nodeName === "STYLE") {
                this.analyseCssDocument("inline", (<HTMLElement>node).innerHTML, analyse);
            }

            if (node.nodeName === "SCRIPT") {
                var domnode = <HTMLElement>node;
                var scriptType = domnode.getAttribute("type");
                var hasContent = domnode.innerHTML.trim().length > 0;

                if (!scriptType || scriptType == "text/javascript" && hasContent) {
                    this.analyseJsDocument("inline", domnode.innerHTML, analyse);
                }
            }

            var specificRules = rules.domRulesIndex[node.nodeName.toUpperCase()];
            if (specificRules && specificRules.length) {
                console.log((specificRules.length + rules.domRulesForAllNodes.length) + " rules");
                specificRules.forEach((r) => {
                    this.applyDOMNodeRule(node, r, analyse, htmlContent);
                });
            } else {
                //console.log(rules.domRulesForAllNodes.length + " rules");
            }

            if (rules.domRulesForAllNodes && rules.domRulesForAllNodes.length) {
                rules.domRulesForAllNodes.forEach((r) => {
                    this.applyDOMNodeRule(node, r, analyse, htmlContent);
                });
            }

            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                this.analyseDOMNode(node.childNodes[i], rules, analyse, htmlContent);
            }
        }

        initialiseRuleSummary(rule, analyse) {
            var tokens = rule.id.split('.');
            var current = analyse.results;
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

        applyDOMNodeRule(node: Node, rule: IDOMRule, analyse, htmlContent: string) {
            var current = this.initialiseRuleSummary(rule, analyse);
            rule.check(node, current, analyse, htmlContent);
        }

        analyseCssDocument(url, content, analyse) {
            var parser = new cssjs();
            //parse css string
            var parsed = parser.parseCSS(content);
            console.log("processing css " + url);
                        
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var rule = <ICSSRule>VORLON.WebStandards.Rules.CSS[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyse);
                    rule.check(url, parsed, current, analyse);
                }
            }

            console.log("analysed");
            console.log(analyse);
        }

        analyseJsDocument(url, content, analyse) {
            console.log("processing script " + url);
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var rule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyse);
                    rule.check(url, content, current, analyse);
                }
            }
        }

        prepareAnalyse(analyse) {
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = <ICSSRule>VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyse);
                    if (cssrule.prepare)
                        cssrule.prepare(current, analyse);
                }
            }

            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyse);
                    if (scriptrule.prepare)
                        scriptrule.prepare(current, analyse);
                }
            }
        }
        
        endAnalyse(analyse) {
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = <ICSSRule>VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyse);
                    if (cssrule.endcheck)
                        cssrule.endcheck(current, analyse);
                }
            }

            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = <IScriptRule>VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyse);
                    if (scriptrule.endcheck)
                        scriptrule.endcheck(current, analyse);
                }
            }
        }
    }

    WebStandardsDashboard.prototype.DashboardCommands = {
        htmlContent: function(data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveHtmlContent(data);
        },

        documentContent: function(data: any) {
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
            this.detailpanel.clear();
        }

        setRules(analyse) {
            console.log("RENDER ANALYSE");
            console.log(analyse);
            this.element.style.display = "";
            this.element.innerHTML = "";
            this.renderRules(analyse.results.rules, this.element, 1);
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

            items.sort(function(a, b) {
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
                        title.html(rule.title);
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
                if (item.title) {
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

        clear() {
            this.setMessage("loading...");
        }

        setMessage(msg) {
            this.element.innerHTML = '<div class="empty">' + msg + '</div>';
        }
    }
}
