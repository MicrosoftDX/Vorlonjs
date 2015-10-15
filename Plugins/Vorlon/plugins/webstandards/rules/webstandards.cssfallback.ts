module VORLON.WebStandards.Rules.CSS {



    export var cssfallback = <ICSSRule>{
        id: "webstandards.cssfallback",
        title: "incorrect use of css fallback",
        description: "Ensure css fallback.",

        check: function(url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css css fallback");

            var nodes: any = [];

            rulecheck.items = [];
            var failed = false;
            if (analyseSummary.fallBackErrorList === null) {
                rulecheck.title = "(disabled !) incorrect use of css fallback";
                failed = true;
                var np = {
                    title: "the check of css Fallback is disabled",
                    type: "blockitems",
                    failed:true,
                    items: []
                }
                rulecheck.items.push(np);
            }
            for (var fallErrorFile in analyseSummary.fallBackErrorList) {
                failed = true;
                var proprules = {
                    title: fallErrorFile,
                    type: "itemslist",
                    items: []
                }
                for (var errorFile in analyseSummary.fallBackErrorList[fallErrorFile]) {
                    var peroor = {
                        failed: true,
                        id: "." + analyseSummary.fallBackErrorList[fallErrorFile][errorFile][ind],
                        items: [],
                        title: errorFile
                    }
                    proprules.items.push(peroor);

                    for (var ind = 0; ind < analyseSummary.fallBackErrorList[fallErrorFile][errorFile].length; ind++) {
                        peroor.items.push({
                            failed: true, id: "." + analyseSummary.fallBackErrorList[fallErrorFile][errorFile][ind], items: [],
                            title: "from " + analyseSummary.fallBackErrorList[fallErrorFile][errorFile][ind] + " to " + analyseSummary.fallBackErrorList[fallErrorFile][errorFile][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""), type: "error"
                        });
                    }
                    if (proprules.items.length) {
                        rulecheck.items.push(proprules);
                    }
                }
            }

            rulecheck.failed = failed;

        },
    }
}