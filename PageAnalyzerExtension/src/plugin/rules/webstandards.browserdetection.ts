module VORLON.WebStandards.Rules.DOM {
    export var browserdetection = <IDOMRule>{
        id: "webstandards.avoid-browser-detection",
        exceptions : [
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

        prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";  
        },
        
        init: function() {
            var pageWindow = document.parentNode
            this.hook("navigator", "userAgent");
            // this.hook("navigator", "appVersion");
            // this.hook("navigator", "appName");
            // this.hook("navigator", "product");
            // this.hook("navigator", "vendor");
        },
        
        hook: function(root, prop) {
            VORLON.Tools.HookProperty(root, prop, (stack) => {
                //this.trace("browser detection " + stack.file);
                //this.trace(stack.stack);
                if (stack.file) {
                    if (this.isException(stack.file)) {
                        //this.trace("skip browser detection access " + stack.file)
                        
                        return;
                    }
                }
                var check = {
                    title : "Access to window.navigator." + stack.property,
                    content :  "From " + stack.file + " at " + stack.line
                };

                this.violations.push(check);
            });
        },
                   
        check: function(node: Node, rulecheck: IRuleCheck, analyzeSummary: any, htmlString: string) {

        },
        
        isException : function(file){
            if (!file)
                return false;
                
            return this.exceptions.some((e) =>{
                return file.indexOf(e) >= 0;
            })
        },
        
        endcheck: function(rulecheck: IRuleCheck, analyzeSummary: any) {
            if (this.violations.length > 0) {
                rulecheck.failed = true;
                for (var index = 0; index < this.violations.length; index++) {
                    rulecheck.items.push(this.violations[index]);
                }
            }
        },
    }
}
