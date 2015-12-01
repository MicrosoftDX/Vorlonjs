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
            "partner.googleadservices.com"
        ],
        title: "avoid browser detection",
        description: "Nowadays, browser have very similar user agent, and browser feature moves very fast. Browser detection leads to britle code. Consider using feature detection instead.",
        nodeTypes: ["#comment"],

        prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";          
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
        
        inspectAccesses : function(root, property, rulecheck){
            var items = root[property];
            
            if (items && items.length){
                items.forEach((item) => {
                    var isException = this.isException(item.file);
                    if (!isException){
                        rulecheck.failed = true;
                        var stacked = item.stack.split("\n");
                        var check = {
                            title : "access to window.navigator." + property,
                            content : stacked.slice(3, stacked.length).join("<br/>")
                        };
                        if (item.file){
                            check.title = check.title + " from " + item.file;
                        }
                        rulecheck.items.push(check);
                    }else{
                        
                    }
                });
            }
        },
        
        endcheck: function(rulecheck: IRuleCheck, analyzeSummary: any) {
            var detection = analyzeSummary.browserDetection;
            this.inspectAccesses(detection, "userAgent", rulecheck);
            this.inspectAccesses(detection, "appVersion", rulecheck);
            this.inspectAccesses(detection, "appName", rulecheck);
            this.inspectAccesses(detection, "product", rulecheck);
            this.inspectAccesses(detection, "vendor", rulecheck);
        },
    }
}
