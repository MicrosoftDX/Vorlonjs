module VORLON.WebStandards.Rules.Files {
    var cssFilesLimit = 5;
    var scriptsFilesLimit = 5;
    
    export var filesBundle = <IFileRule>{
        id: "performances.bundles",
        title: "try bundling your files",
        description: "Multiple http requests makes your site slower, especially on mobile devices",
       
        check: function(rulecheck: any, analyzeSummary: any) {
            rulecheck.items = rulecheck.items || [];
            var countStylesheets = 0;
            for (var n in analyzeSummary.files.stylesheets){                
                countStylesheets++;
            }
            
            if (countStylesheets > cssFilesLimit){
                rulecheck.failed = true;
                rulecheck.items.push({
                    title : "You have more than " + cssFilesLimit + " stylesheets in your page, consider bundling your stylesheets."
                });
            }
            
            var countScripts = 0;
            for (var n in analyzeSummary.files.scripts){
                countScripts++;
            }
            
            if (countScripts > scriptsFilesLimit){
                rulecheck.failed = true;
                rulecheck.items.push({
                    title : "You have more than " + scriptsFilesLimit + " scripts files in your page, consider bundling your scripts."
                });
            }
        }
    }
}
