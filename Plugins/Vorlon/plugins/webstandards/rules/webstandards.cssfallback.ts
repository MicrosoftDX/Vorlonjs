module VORLON.WebStandards.Rules.CSS {



    export var cssfallback = <ICSSRule>{
        id: "webstandards.cssfallback",
        title: "incorrect use of css fallback",
        description: "Ensure css fallback.",
        check: function(url, ast, rulecheck: any, analyzeSummary: any) {},
        endcheck: function(rulecheck: any, analyzeSummary: any) {
            console.log("check css css fallback");

            var nodes: any = [];

            rulecheck.items = [];
            var failed = false;
            if (analyzeSummary.fallBackErrorList === null) {
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
            else{
              for (var ii=0;ii< analyzeSummary.fallBackErrorList.length;ii++) {
          
          
   
      
       for (var fallErrorFile in analyzeSummary.fallBackErrorList[ii]) {
                failed = true;
                var proprules = {
                    title: fallErrorFile,
                    type: "itemslist",
                    items: []
                }
                for (var errorFile in analyzeSummary.fallBackErrorList[ii][fallErrorFile]) {
                    var peroor = {
                        failed: true,
                        id: "." + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind],
                        items: [],
                        title: errorFile
                    }
                    proprules.items.push(peroor);

                    for (var ind = 0; ind < analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile].length; ind++) {
                        peroor.items.push({
                            failed: true, id: "." + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind], items: [],
                            title: "from " + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind] + " to " + analyzeSummary.fallBackErrorList[ii][fallErrorFile][errorFile][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""), type: "error"
                        });
                    }
                    if (proprules.items.length) {
                        rulecheck.items.push(proprules);
                    }
                }
            }   }     
            }
            rulecheck.failed = failed;

        },
    }
}