declare var cssjs: any;

module VORLON {
    var _webstandardsRefreshLoop;

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

        public startDashboardSide(div: HTMLDivElement = null): void {
            var script = <HTMLScriptElement>document.createElement("SCRIPT");
            script.src = "/javascripts/css.js";
            document.body.appendChild(script);

            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._rootDiv = <HTMLElement>filledDiv;

                this._startCheckButton.addEventListener("click", (evt) => {
                    this._currentAnalyse = { processing: true };
                    this._rootDiv.classList.add("loading");
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
                this._rootDiv.classList.remove("loading");
                this._currentAnalyse.ended = true;
            }
        }

        receiveHtmlContent(data: { html: string, doctype: any }) {
            if (!this._currentAnalyse) {
                this._currentAnalyse = { processing: true };
            }
            
            //console.log('received html from client ', data.html);
            var fragment: HTMLDocument = document.implementation.createHTMLDocument("analyse");
            fragment.documentElement.innerHTML = data.html;
            this._currentAnalyse.pendingLoad = 0;

            this._currentAnalyse.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src) {
                    this._currentAnalyse.scripts[src.value] = { loaded: false, content: null };
                    //console.log("found script " + src.value);
                    this.sendCommandToClient('fetchDocument', { url: src.value });
                    this._currentAnalyse.pendingLoad++;
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

            this.analyseDOM(fragment, data.html, this._currentAnalyse);
        }

        receiveDocumentContent(data: { url: string, content: string, error?: string, status: number }) {
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
            }

            if (item) {
                this._currentAnalyse.pendingLoad--;
                item.loaded = true;
                item.content = data.content;

                if (this._currentAnalyse.pendingLoad == 0) {
                    this._currentAnalyse.processing = false;
                }
            }
        }

        analyseDOM(document: HTMLDocument, htmlContent : string, analyse) {
            var generalRules = [];
            var rules = {
                domRulesIndex: <any>{},
                domRulesForAllNodes: []
            };
            analyse.results = {};
            
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = <IDOMRule>VORLON.WebStandards.Rules.DOM[n];
                if (rule) {
                    if (rule.generalRule) {
                        generalRules.push(rule);
                    } else {
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
            
            generalRules.forEach((r) => {
                this.applyDOMNodeRule(document, r, analyse, htmlContent);
            });
            this.analysePluginFree(document);
            console.log("DOM NODES ANALYSE ended")
            console.log(analyse.results)
        }

        analyseDOMNode(node: Node, rules: any, analyse, htmlContent : string) {
            //console.log("checking " + node.nodeName);
            var specificRules = rules.domRulesIndex[node.nodeName];
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
            current.rules = current.rules || {};
            tokens.forEach(function(t) {
                if (!current.rules)
                    current.rules = {};
                if (!current.rules[t])
                    current.rules[t] = {};

                current = current.rules[t];
            });
            
            return current;
        }

        applyDOMNodeRule(node: Node, rule: IDOMRule, analyse, htmlContent : string) {
            var current = this.initialiseRuleSummary(rule, analyse);
            rule.check(node, current, analyse, htmlContent);
        }

        analyseCssDocument(url, content, analyse) {
            var parser = new cssjs();
            //parse css string
            var parsed = parser.parseCSS(content);
            console.log("processed css");
            console.log(parsed);
                        
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var rule = <IDOMRule>VORLON.WebStandards.Rules.CSS[n];
                if (rule) {
                    this.applyCSSRule(url, parsed, rule, analyse);
                }
            }

            console.log("analysed");
            console.log(analyse);
        }

        applyCSSRule(fileurl, ast, rule, analyse) {
            var current = this.initialiseRuleSummary(rule, analyse);
            rule.check(fileurl, ast, current, analyse);
        }
        
        private removeItems(original, itemsToRemove) {
            var cleaned = [],
                remove;
            for (var i = 0; i < original.length; i++) {
                remove = true;
                for (var j = 0; j < itemsToRemove.length; j++) {
                    if (original[i] === itemsToRemove[j]) {
                        remove = false;
                        break;
                    }
                }
                if (remove) {
                    cleaned.push(original[i]);
                }
            }
            return cleaned;
        }
        
        private concatNodeList(first, second) {
            var tab = [];
            for (var i = 0; i < first.length; i++) {
                tab.push(first[i]);
            }
            for (var i = 0; i < second.length; i++) {
                tab.push(second[i]);
            }
            return tab;
        }
        
        private analysePluginFree(html: HTMLDocument) {
            var objects = html.querySelectorAll('object'),
                embeds = html.querySelectorAll('embed'),
                //objectParams = html.querySelectorAll('object param[value*=swf]'),
                objectSWFparams = html.querySelectorAll('object[data*=swf]'),
                objectSVGparams = html.querySelectorAll('object[data*=svg]'),
                embedsSWF = html.querySelectorAll('embed[src*=swf]'),
                embedsSVG = html.querySelectorAll('embed[src*=svg]');
                
            var activeXcontrols: number = objects.length /*- objectParams.length*/ - objectSWFparams.length - objectSVGparams.length
                                + embeds.length - embedsSVG.length - embedsSWF.length;
                                    
            if (activeXcontrols > 0) {
                var endPoint, lines: Array<DataResult>= [], matches: RegExpExecArray,
                    objectsToRemove = this.concatNodeList(/*this.concatNodeList(objectParams, objectSWFparams)*/objectSWFparams, objectSVGparams),
                    embedsToRemove = this.concatNodeList(embedsSWF, embedsSVG),
                    uniqueObjects = this.removeItems(objects, objectsToRemove),
                    uniqueEmbeds = this.removeItems(embeds, embedsToRemove);
                    
                var htmlString = html.documentElement.innerHTML;
                if (uniqueObjects.length > 0) {
                    for (var i = 0; i < uniqueObjects.length; i++) {
                        var regExp = new RegExp(uniqueObjects[i].outerHTML, "gi");
                        matches = regExp.exec(htmlString);
                        if (matches && matches.length > 0) {
                            endPoint = htmlString.indexOf(matches[0]);
                            var nbLine = htmlString.substr(0, endPoint).split('\n').length + 1;
                            lines.push(<DataResult>{ lineNumber: nbLine, file: "", testName: "pluginfree" });
                        }
                    }
                }
                if (uniqueEmbeds.length > 0) {
                    for (var i = 0; i < uniqueEmbeds.length; i++) {
                        var regExp = new RegExp(uniqueEmbeds[i].outerHTML, "gi");
                        matches = regExp.exec(htmlString);
                        if (matches && matches.length > 0) {
                            endPoint = htmlString.indexOf(matches[0]);
                            var nbLine = htmlString.substr(0, endPoint).split('\n').length + 1;
                            lines.push(<DataResult>{ lineNumber: nbLine, file: "", testName: "pluginfree" });
                        }
                    }
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
}

module VORLON.WebStandards.Rules.DOM {
    export var imagesShouldHaveAlt = <IDOMRule>{
        id: "accessibility.images-should-have-alt",
        title: "",
        nodeTypes: ["IMG"],
        check: function(node: Node, rulecheck: any, analyseSummary: any, htmlString: string) {
            console.log("check alt images ");
            var altattr = node.attributes.getNamedItem("alt");
            rulecheck.nbfailed = rulecheck.nbfailed || 0;
            rulecheck.nbcheck = rulecheck.nbcheck || 0;
            rulecheck.nbcheck++;
            if (!altattr || !altattr.value) {
                rulecheck.nbfailed++;
                rulecheck.failed = true;
            } else {

            }
        }
    }
    
    export var dontUsePlugins = <IDOMRule>{
        id: "webstandards.dont-use-plugins",
        title: "",
        nodeTypes: ["EMBED", "OBJECT"],
        check: function(node: HTMLElement, rulecheck: any, analyseSummary: any, htmlString: string) {
            console.log("check for plugins");
                        
            var source :string = null, data:string  = null, type:string  = null;
            
            var source = node.getAttribute("src");
            if (source) source = source.toLowerCase(); else source = "";
                        
            var data = node.getAttribute("data");
            if (data) data = data.toLowerCase(); else data = "";
               
            var type = node.getAttribute("type");
            if (type) type = type.toLowerCase(); else type = "";
            
            rulecheck.items = rulecheck.items || [];             
            if (source.indexOf(".swf") > 0 || data.indexOf("swf") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "think about using HTML5 instead of Flash", content : (<HTMLElement>node).outerHTML })
            }
            else if (type.indexOf("silverlight") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "think about using HTML5 instead of Silverlight", content : (<HTMLElement>node).outerHTML })
            } else if (source.indexOf(".svg") > 0 || data.indexOf("svg") > 0) {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "dont't use SVG with " + node.nodeType, content : (<HTMLElement>node).outerHTML })
            } else {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "use HTML5 instead of embed or object elements", content : (<HTMLElement>node).outerHTML })
            }
        }
    }
}

module VORLON.WebStandards.Rules.CSS {
    export var imagesShouldHaveAlt = <ICSSRule>{
        id: "webstandards.prefixes",
        title: "incorrect use of prefixes",
        check: function(url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css prefixes");

        }
    }
}