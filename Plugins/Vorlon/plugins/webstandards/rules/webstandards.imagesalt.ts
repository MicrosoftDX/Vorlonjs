module VORLON.WebStandards.Rules.DOM {
    
    export var imagesShouldHaveAlt = <IDOMRule>{
        id: "accessibility.images-should-have-alt",
        title: "",
        nodeTypes: ["IMG"],
        check: function(node: Node, rulecheck: any, analyseSummary: any, htmlString: string) {
            console.log("check alt images ");
            var altattr = node.attributes.getNamedItem("alt");
            rulecheck.nbfailed = rulecheck.nbfailed || 0;
            rulecheck.nbcheck = rulecheck.nbcheck || 0;
            rulecheck.nbcheck++;
            if (!altattr || !altattr.value) {
                rulecheck.nbfailed++;
                rulecheck.failed = true;
            } else {
            }
        }
    }
   
}
