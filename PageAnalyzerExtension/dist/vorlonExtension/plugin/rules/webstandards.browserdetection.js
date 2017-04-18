var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.browserdetection = {
                    id: "webstandards.avoid-browser-detection",
                    exceptions: [
                        "ajax.googleapis.com",
                        "ajax.aspnetcdn.com",
                        "ajax.microsoft.com",
                        "jquery",
                        "mootools",
                        "prototype",
                        "protoaculous",
                        "google-analytics.com",
                        "partner.googleadservices.com",
                        "vorlon"
                    ],
                    title: "Detect features, not browsers",
                    description: "Use feature detection and avoid hardcoding for specific browsers. Browser detection leads to brittle code and isn't effective on modern browsers, which share similar user agent strings.",
                    nodeTypes: ["#comment"],
                    violations: [],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    init: function () {
                        var pageWindow = document.parentNode;
                        this.hook("navigator", "userAgent");
                        // this.hook("navigator", "appVersion");
                        // this.hook("navigator", "appName");
                        // this.hook("navigator", "product");
                        // this.hook("navigator", "vendor");
                    },
                    hook: function (root, prop) {
                        var _this = this;
                        VORLON.Tools.HookProperty(root, prop, function (stack) {
                            //this.trace("browser detection " + stack.file);
                            //this.trace(stack.stack);
                            if (stack.file) {
                                if (_this.isException(stack.file)) {
                                    //this.trace("skip browser detection access " + stack.file)
                                    return;
                                }
                            }
                            var check = {
                                title: "Access to window.navigator." + stack.property,
                                content: "From " + stack.file + " at " + stack.line
                            };
                            _this.violations.push(check);
                        });
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                    },
                    isException: function (file) {
                        if (!file)
                            return false;
                        return this.exceptions.some(function (e) {
                            return file.indexOf(e) >= 0;
                        });
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        if (this.violations.length > 0) {
                            rulecheck.failed = true;
                            for (var index = 0; index < this.violations.length; index++) {
                                rulecheck.items.push(this.violations[index]);
                            }
                        }
                    },
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
