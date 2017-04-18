declare var cssjs: any;

module VORLON {
    var _webstandardsRefreshLoop;
    var rulesLabels = {
        "webstandards": "Web standards",
        "accessibility": "Accessibility",
        "performances": "Performance",
        "mobileweb": "Mobile web",
    }
    
    var rulesOrders = {
        "webstandards": 0,
        "accessibility": 1,
        "performances": 2,
        "mobileweb": 3,
    }

    export class WebStandardsDashboard extends DashboardPlugin {
        constructor() {
            super("webstandards", "control.html", "control.css");
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            this._ready = true;
        }

        private _startCheckButton: HTMLButtonElement;
        private _rootDiv: HTMLElement;
        private _currentAnalyseId: string;
        private _analysePending: boolean;
        private _analyseResult: any;
        private _cancelMode = false;

        private _rulesPanel: WebStandardsRulesPanel = null;
        private _ruleDetailPanel: WebStandardsRuleDetailPanel = null;
        
        private _switchToRun(): void {
            this._startCheckButton.innerHTML = "Run";  
            this._cancelMode = false;  
        }

        private _switchToCancel(): void {
            this._startCheckButton.innerHTML = "Cancel";  
            this._cancelMode = true;  
        }

        public startDashboardSide(div: HTMLDivElement = null): void {

            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._ruleDetailPanel = new WebStandardsRuleDetailPanel(this, filledDiv.querySelector('#webstandards-ruledetailpanel'));
                this._rulesPanel = new WebStandardsRulesPanel(this, filledDiv.querySelector('#webstandards-rulespanel'), this._ruleDetailPanel);

                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._rootDiv = <HTMLElement>filledDiv;

                //btn start
                this._startCheckButton.addEventListener("click", (evt) => {
                    if (this._cancelMode) {
                        this._switchToRun();
                        this.sendCommandToClient('cancelAnalyze', { id: this._currentAnalyseId });
                        return;
                    }
                    
                    this._switchToCancel();

                    this._rootDiv.classList.add("loading");
                    this._rulesPanel.clear("Analyzing in progress...");
                    this._currentAnalyseId = VORLON.Tools.CreateGUID();
                    this._analysePending = true;
                    this._analyseResult = null;
                    this.sendCommandToClient('startNewAnalyze', { id: this._currentAnalyseId });
                });

                clearInterval(_webstandardsRefreshLoop);
                _webstandardsRefreshLoop = setInterval(() => {
                    this.checkLoadingState();
                }, 3000);
            });
        }

        setAnalyseResult(result: any) {
            this._rootDiv.classList.remove("loading");
            this._ruleDetailPanel.setMessage("Click on a rule in the result panel to show details");
            this._rulesPanel.setRules(result);
            this._switchToCancel();
        }

        analyseCanceled(id: string) {
            this._rootDiv.classList.remove("loading");
            this._switchToRun();
            this._rootDiv.classList.remove("loading");
            this._rulesPanel.clear("Analyze your page by clicking on the run button above.");
        }

        checkLoadingState() {
            if (this._analyseResult && this._analysePending) {
                this._analysePending = false;
                this._rootDiv.classList.remove("loading");
                this._ruleDetailPanel.setMessage("Click on a rule in the result panel to show details");
                this._rulesPanel.setRules(this._analyseResult);
                this._switchToRun();

            }
        }
    }

    WebStandardsDashboard.prototype.DashboardCommands = {
        analyseResult: function(data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.setAnalyseResult(data.result);
        },

        analyseCanceled: function(data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.analyseCanceled(data.id);
        }
    };

    Core.RegisterDashboardPlugin(new WebStandardsDashboard());

    class WebStandardsRulesPanel {
        element: HTMLElement;
        detailpanel: WebStandardsRuleDetailPanel;
        selectedRuleElt: HTMLElement;
        plugin: WebStandardsDashboard;

        constructor(plugin: WebStandardsDashboard, element: Element, detailpanel: WebStandardsRuleDetailPanel) {
            this.plugin = plugin;
            this.element = <HTMLElement>element;
            this.element.style.display = "none";
            this.detailpanel = detailpanel;
        }

        clear(msg) {
            this.element.style.display = "none";
            this.detailpanel.clear(msg);
        }

        setRules(analyze) {
            this.plugin.trace("RENDER ANALYZE");
            this.plugin.trace(analyze);
            this.element.style.display = "";
            this.element.innerHTML = "";
            this.renderRules(analyze.results.rules, this.element, 1);
        }

        renderRules(rules, parent: HTMLElement, level: number) {
            var items = [];
            for (var n in rules) {
                var rule = rules[n];
                
                if (rule.skipRootLevel) {
                    for (var index = 0; index < rule.items.length; index++) {
                        items.push(rule.items[index]);  
                    }
                    continue;
                }
                if (!rule.title) {
                    rule.title = rulesLabels[rule.id];
                }
                if (!rule.title) {
                    rule.title = n;
                }
                
                rule.order = rulesOrders[rule.id];
                items.push(rule);              
            }

            items.sort(function(a, b) {
                if (a.order === b.order) {
                    return 0;
                }
                return a.order < b.order ? -1 : 1;
            })

            items.forEach((rule) => {
                this.renderRule(rule, parent, level);
            })
        }        

        renderRule(rule, parent: HTMLElement, level: number) {
            var ruleitem = new FluentDOM('DIV', 'rule level' + level, parent);
            ruleitem.append('DIV', 'title', (title) => {
                if (rule.failed !== undefined) {
                    var check = title.createChild("IMG", "state");
                    
                    check.attr("src", rule.failed ? "images/failed.png" : "images/checked.png");
                }
                title.createChild("SPAN").text(rule.title).addClass("titleText");
                
                var chevron;
                
                if (level === 1) {
                    chevron = title.createChild("IMG").addClass("chevron").attr("src", "images/closedchevron.png");
                    if (rule.id === "webstandards") {
                        chevron.addClass("rotated");
                    }                    
                }
                if (rule.rules) {
                    title.click(() => {
                        ruleitem.toggleClass("collapsed");
                        ruleitem.toggleClass("expanded");
                        
                        if (chevron) {
                            if (ruleitem.hasClass("collapsed")) {
                                chevron.toggleClass("rotated");
                            } else {
                                chevron.toggleClass("rotated");
                            }
                        }
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
                if (rule.id == "webstandards") {
                    ruleitem.addClass("expanded");
                }
                else {
                    ruleitem.addClass("collapsed");
                }
                ruleitem.append('DIV', 'childs', (childs) => {
                    this.renderRules(rule.rules, childs.element, level + 1);
                });
            }
        }
    }

    class WebStandardsRuleDetailPanel {
        element: HTMLElement;
        plugin: WebStandardsDashboard;

        constructor(plugin: WebStandardsDashboard, element: Element) {
            this.element = <HTMLElement>element;
            this.plugin = plugin;
        }

        setRule(rule : IRuleCheck) {
            this.element.innerHTML = "";

            var fluent = FluentDOM.forElement(this.element);
            fluent.append("DIV", "ruledetailpanel-content", (content) => {
                content.append("DIV", "item", (item) => {
                    if (rule.type)
                        item.addClass(rule.type);

                    item.append("H1", "title", (title) => {
                        var check = title.createChild("IMG", "state");                    
                        check.attr("src", rule.failed ? "images/failed.png" : "images/checked.png");
                        
                        title.createChild("SPAN", "text").text(rule.title);
                    });

                    if (rule.description) {
                        item.append("DIV", "description", (desc) => {
                            desc.text(rule.description);
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

        renderItem(item : IRuleCheck, parent: FluentDOM) {
            parent.append("DIV", "item", (itemelt) => {
                if (item.type) {
                    itemelt.addClass(item.type);
                }
                if (item.title && item.alert) {
                    itemelt.createChild("SPAN", "state fa " + (item.failed ? "fa-close" : "fa-check")).text(item.title);
                }
                else if (item.title) {
                    itemelt.createChild("DIV", "title").text(item.title);
                }
                if (item.message) {
                    itemelt.createChild("DIV", "message").text(item.message);
                }
                if (item.content) {
                    itemelt.createChild("DIV", "content").text(item.content);
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
