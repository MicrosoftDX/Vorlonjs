module VORLON.WebStandards.Rules.CSS {



    export var cssfallback = <ICSSRule>{
        id: "webstandards.cssfallback",
        title: "incorrect use of css fallback",
        description: "Ensure css fallback.",
        check: function (url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css css fallback");

            var nodes: any = [];

            rulecheck.items = rulecheck.items || [];
            var failed = false;
            if (analyseSummary.fallBackErrorList && analyseSummary.fallBackErrorList.length) {
                if (analyseSummary.fallBackErrorList && analyseSummary.fallBackErrorList.length) {

                    for (var ind = 0; ind < analyseSummary.fallBackErrorList.length; ind++) {
                        var csspropname = analyseSummary.fallBackErrorList[ind].name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
                        var proprules = {
                            title: csspropname,
                            type: "itemslist",
                            items: []
                        }

                        if (analyseSummary.fallBackErrorList[ind].failed) {
                            proprules.items.push({alert:true, failed: analyseSummary.fallBackErrorList[ind].failed, id: "." + analyseSummary.fallBackErrorList[ind].name, items: [], title: "from -webkit-" + csspropname + " to " + csspropname, type: "error" });
                            failed = true;
                        }
                        else {
                            proprules.items.push({alert:true, failed: analyseSummary.fallBackErrorList[ind].failed, id: "." + analyseSummary.fallBackErrorList[ind].name, items: [], title: "from -webkit-" + csspropname + " to " + csspropname, type: "good" });
                        }
                        if (proprules.items.length) {
                            rulecheck.items.push(proprules);
                        }
                    }
                }
            }
            rulecheck.failed = failed;

        },
    }
}