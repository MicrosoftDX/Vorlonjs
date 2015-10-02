module VORLON.WebStandards.Rules.DOM {
    
    export var imagesShouldHaveAlt = <IDOMRule>{
        id: "accessibility.images-should-have-alt",
        title: "Images should have alt attribute",
        description : "Add alt attribute on images to enable blind people to get meaning for images.",
        nodeTypes: ["IMG"],
        check: function(node: HTMLElement, rulecheck: any, analyseSummary: any, htmlString: string) {
            console.log("check alt images ");
            var altattr = node.attributes.getNamedItem("alt");
            rulecheck.nbfailed = rulecheck.nbfailed || 0;
            rulecheck.nbcheck = rulecheck.nbcheck || 0;
            rulecheck.nbcheck++;
            if (!altattr || !altattr.value) {
                rulecheck.nbfailed++;
                rulecheck.failed = true;
                rulecheck.items = rulecheck.items || [];
                rulecheck.items.push({
                    content : VORLON.Tools.htmlToString(node.outerHTML)
                })
            } else {
            }
        }
    }
   
}
