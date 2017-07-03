module VORLON.WebStandards.Rules.Files {
    export var contentEncoding = <IFileRule>{
        id: "performances.contentencoding",
        title: "Encode static content",
        description: "Compress CSS and JavaScript files using content encoding (such as gzip) to reduce your site's network bandwidth requirements, especially on mobile.",
       
        check: function(rulecheck: any, analyzeSummary: any) {
            rulecheck.items = rulecheck.items || [];
            rulecheck.type = "blockitems";    
            for (var n in analyzeSummary.files.stylesheets){     
                var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                if (!isVorlonInjection && analyzeSummary.files.stylesheets[n].encoding && analyzeSummary.files.stylesheets[n].encoding == "none"){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : "Use content encoding for " + n
                    });
                }                
            }
            
            for (var n in analyzeSummary.files.scripts){                
                var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                if (!isVorlonInjection && analyzeSummary.files.scripts[n].encoding && analyzeSummary.files.scripts[n].encoding == "none"){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : "Use content encoding for " + n
                    });
                }
            }
        }
    }
}
