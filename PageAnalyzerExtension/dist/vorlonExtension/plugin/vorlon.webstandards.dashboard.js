var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var _webstandardsRefreshLoop;
    var rulesLabels = {
        "webstandards": "Web standards",
        "accessibility": "Accessibility",
        "performances": "Performance",
        "mobileweb": "Mobile web",
    };
    var rulesOrders = {
        "webstandards": 0,
        "accessibility": 1,
        "performances": 2,
        "mobileweb": 3,
    };
    var WebStandardsDashboard = (function (_super) {
        __extends(WebStandardsDashboard, _super);
        function WebStandardsDashboard() {
            _super.call(this, "webstandards", "control.html", "control.css");
            this._cancelMode = false;
            this._rulesPanel = null;
            this._ruleDetailPanel = null;
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            this._ready = true;
        }
        WebStandardsDashboard.prototype._switchToRun = function () {
            this._startCheckButton.innerHTML = "Run";
            this._cancelMode = false;
        };
        WebStandardsDashboard.prototype._switchToCancel = function () {
            this._startCheckButton.innerHTML = "Cancel";
            this._cancelMode = true;
        };
        WebStandardsDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._ruleDetailPanel = new WebStandardsRuleDetailPanel(_this, filledDiv.querySelector('#webstandards-ruledetailpanel'));
                _this._rulesPanel = new WebStandardsRulesPanel(_this, filledDiv.querySelector('#webstandards-rulespanel'), _this._ruleDetailPanel);
                _this._startCheckButton = filledDiv.querySelector('#startCheck');
                _this._rootDiv = filledDiv;
                //btn start
                _this._startCheckButton.addEventListener("click", function (evt) {
                    if (_this._cancelMode) {
                        _this._switchToRun();
                        _this.sendCommandToClient('cancelAnalyze', { id: _this._currentAnalyseId });
                        return;
                    }
                    _this._switchToCancel();
                    _this._rootDiv.classList.add("loading");
                    _this._rulesPanel.clear("Analyzing in progress...");
                    _this._currentAnalyseId = VORLON.Tools.CreateGUID();
                    _this._analysePending = true;
                    _this._analyseResult = null;
                    _this.sendCommandToClient('startNewAnalyze', { id: _this._currentAnalyseId });
                });
                clearInterval(_webstandardsRefreshLoop);
                _webstandardsRefreshLoop = setInterval(function () {
                    _this.checkLoadingState();
                }, 3000);
            });
        };
        WebStandardsDashboard.prototype.setAnalyseResult = function (result) {
            this._rootDiv.classList.remove("loading");
            this._ruleDetailPanel.setMessage("Click on a rule in the result panel to show details");
            this._rulesPanel.setRules(result);
            this._switchToCancel();
        };
        WebStandardsDashboard.prototype.analyseCanceled = function (id) {
            this._rootDiv.classList.remove("loading");
            this._switchToRun();
            this._rootDiv.classList.remove("loading");
            this._rulesPanel.clear("Analyze your page by clicking on the run button above.");
        };
        WebStandardsDashboard.prototype.checkLoadingState = function () {
            if (this._analyseResult && this._analysePending) {
                this._analysePending = false;
                this._rootDiv.classList.remove("loading");
                this._ruleDetailPanel.setMessage("Click on a rule in the result panel to show details");
                this._rulesPanel.setRules(this._analyseResult);
                this._switchToRun();
            }
        };
        return WebStandardsDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.WebStandardsDashboard = WebStandardsDashboard;
    WebStandardsDashboard.prototype.DashboardCommands = {
        analyseResult: function (data) {
            var plugin = this;
            plugin.setAnalyseResult(data.result);
        },
        analyseCanceled: function (data) {
            var plugin = this;
            plugin.analyseCanceled(data.id);
        }
    };
    VORLON.Core.RegisterDashboardPlugin(new WebStandardsDashboard());
    var WebStandardsRulesPanel = (function () {
        function WebStandardsRulesPanel(plugin, element, detailpanel) {
            this.plugin = plugin;
            this.element = element;
            this.element.style.display = "none";
            this.detailpanel = detailpanel;
        }
        WebStandardsRulesPanel.prototype.clear = function (msg) {
            this.element.style.display = "none";
            this.detailpanel.clear(msg);
        };
        WebStandardsRulesPanel.prototype.setRules = function (analyze) {
            this.plugin.trace("RENDER ANALYZE");
            this.plugin.trace(analyze);
            this.element.style.display = "";
            this.element.innerHTML = "";
            this.renderRules(analyze.results.rules, this.element, 1);
        };
        WebStandardsRulesPanel.prototype.renderRules = function (rules, parent, level) {
            var _this = this;
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
            items.sort(function (a, b) {
                if (a.order === b.order) {
                    return 0;
                }
                return a.order < b.order ? -1 : 1;
            });
            items.forEach(function (rule) {
                _this.renderRule(rule, parent, level);
            });
        };
        WebStandardsRulesPanel.prototype.renderRule = function (rule, parent, level) {
            var _this = this;
            var ruleitem = new VORLON.FluentDOM('DIV', 'rule level' + level, parent);
            ruleitem.append('DIV', 'title', function (title) {
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
                    title.click(function () {
                        ruleitem.toggleClass("collapsed");
                        ruleitem.toggleClass("expanded");
                        if (chevron) {
                            if (ruleitem.hasClass("collapsed")) {
                                chevron.toggleClass("rotated");
                            }
                            else {
                                chevron.toggleClass("rotated");
                            }
                        }
                    });
                }
                else {
                    title.click(function () {
                        if (_this.selectedRuleElt) {
                            _this.selectedRuleElt.classList.remove("selected");
                        }
                        ruleitem.element.classList.add("selected");
                        _this.selectedRuleElt = ruleitem.element;
                        _this.detailpanel.setRule(rule);
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
                ruleitem.append('DIV', 'childs', function (childs) {
                    _this.renderRules(rule.rules, childs.element, level + 1);
                });
            }
        };
        return WebStandardsRulesPanel;
    })();
    var WebStandardsRuleDetailPanel = (function () {
        function WebStandardsRuleDetailPanel(plugin, element) {
            this.element = element;
            this.plugin = plugin;
        }
        WebStandardsRuleDetailPanel.prototype.setRule = function (rule) {
            var _this = this;
            this.element.innerHTML = "";
            var fluent = VORLON.FluentDOM.forElement(this.element);
            fluent.append("DIV", "ruledetailpanel-content", function (content) {
                content.append("DIV", "item", function (item) {
                    if (rule.type)
                        item.addClass(rule.type);
                    item.append("H1", "title", function (title) {
                        var check = title.createChild("IMG", "state");
                        check.attr("src", rule.failed ? "images/failed.png" : "images/checked.png");
                        title.createChild("SPAN", "text").text(rule.title);
                    });
                    if (rule.description) {
                        item.append("DIV", "description", function (desc) {
                            desc.text(rule.description);
                        });
                    }
                    if (rule.items && rule.items.length) {
                        item.append("DIV", "items", function (itemselt) {
                            rule.items.forEach(function (item) {
                                _this.renderItem(item, itemselt);
                            });
                        });
                    }
                });
            });
        };
        WebStandardsRuleDetailPanel.prototype.renderItem = function (item, parent) {
            var _this = this;
            parent.append("DIV", "item", function (itemelt) {
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
                    itemelt.append("DIV", "items", function (itemselt) {
                        item.items.forEach(function (item) {
                            _this.renderItem(item, itemselt);
                        });
                    });
                }
            });
        };
        WebStandardsRuleDetailPanel.prototype.clear = function (msg) {
            this.setMessage(msg);
        };
        WebStandardsRuleDetailPanel.prototype.setMessage = function (msg) {
            this.element.innerHTML = '<div class="empty">' + msg + '</div>';
        };
        return WebStandardsRuleDetailPanel;
    })();
})(VORLON || (VORLON = {}));
