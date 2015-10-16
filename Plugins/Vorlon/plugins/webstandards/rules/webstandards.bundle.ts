module VORLON.WebStandards.Rules.Files {
    export var browserdetection = <IFileRule>{
        id: "webstandards.bundles",
        title: "try to bundle your files",
        description: "to optimise http requests, try to bundle your JS and CSS files !",
       
        check: function(cssFilesCount: number, jsFilesCount: number, rulecheck: any, analyzeSummary: any) {
            if (cssFilesCount > 4 || jsFilesCount > 4)
                rulecheck.failed = true;
        }
    }
}
