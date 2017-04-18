module VORLON.WebStandards.Rules.Files {
    var cssFilesLimit = 5;
    var scriptsFilesLimit = 5;
    
    export var filesBundle = <IFileRule>{
        id: "performances.bundles",
        title: "Bundle content files",
        description: "Consolidate stylesheet and script files to minimize http requests and speed up load times.",
       
        check: function(rulecheck: any, analyzeSummary: any) {
            rulecheck.items = rulecheck.items || [];
            rulecheck.type = "blockitems";    
            var countStylesheets = 0;
            for (var n in analyzeSummary.files.stylesheets){  
                var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;    
                if (!isVorlonInjection)          
                    countStylesheets++;
            }
            
            if (countStylesheets > cssFilesLimit){
                rulecheck.failed = true;
                rulecheck.items.push({
                    title : "Your page loads more than " + cssFilesLimit + " stylesheet files. Consider combining them."
                });
            }
            
            var countScripts = 0;
            for (var n in analyzeSummary.files.scripts){
                var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;    
                if (!isVorlonInjection)          
                    countScripts++;
            }
            
            if (countScripts > scriptsFilesLimit){
                rulecheck.failed = true;
                rulecheck.items.push({
                    title : "Your page loads more than " + scriptsFilesLimit + " script files. Consider combining them."
                });
            }
        }
    }
}
