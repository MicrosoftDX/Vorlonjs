module VORLON.WebStandards.Rules.Files {
    export var contentEncoding = <IFileRule>{
        id: "performances.contentencoding",
        title: "encode static content",
        description: "content encoding like gzip or deflate helps reducing the network bandwith required to display your website, it is especially important for mobile devices. Use content encoding for static files like CSS and JavaScript files.",
       
        check: function(rulecheck: any, analyzeSummary: any) {
            rulecheck.items = rulecheck.items || [];
            rulecheck.type = "blockitems";    
            for (var n in analyzeSummary.files.stylesheets){     
                var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                if (!isVorlonInjection && analyzeSummary.files.stylesheets[n].encoding && analyzeSummary.files.stylesheets[n].encoding == "none"){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : "use content encoding for " + n
                    });
                }                
            }
            
            for (var n in analyzeSummary.files.scripts){                
                var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                if (!isVorlonInjection && analyzeSummary.files.scripts[n].encoding && analyzeSummary.files.scripts[n].encoding == "none"){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : "use content encoding for " + n
                    });
                }
            }
        }
    }
}
