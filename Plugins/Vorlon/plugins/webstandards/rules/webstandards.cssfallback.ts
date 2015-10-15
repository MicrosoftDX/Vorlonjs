module VORLON.WebStandards.Rules.CSS {



    export var cssfallback = <ICSSRule>{
        id: "webstandards.cssfallback",
        title: "incorrect use of css fallback",
        description: "Ensure css fallback.",
 
        check: function(url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css css fallback");

            var nodes: any = [];

            rulecheck.items =  [];
            var failed = false;

            for (var fallError in analyseSummary.fallBackErrorList) {
                failed = true;
                var proprules = {
                    title: fallError,
                    type: "itemslist",
                    items: []
                }
                for (var ind = 0; ind < analyseSummary.fallBackErrorList[fallError].length; ind++) {
                    proprules.items.push({ alert: true, failed: true, id: "." + analyseSummary.fallBackErrorList[fallError], items: [],
                     title: "from " + analyseSummary.fallBackErrorList[fallError][ind] + " to " + analyseSummary.fallBackErrorList[fallError][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""),
                      type: "error" });
                }
                if (proprules.items.length) {
                    rulecheck.items.push(proprules);
                }
            }

            rulecheck.failed = failed;

        },
    }
}