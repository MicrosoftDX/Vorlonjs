module VORLON.WebStandards.Rules.DOM {
    
    export var imagesShouldHaveAlt = <IDOMRule>{
        id: "accessibility.images-should-have-alt",
        title: "images should have alt attribute",
        description : "Add alt attribute on images to enable blind people to get meaning for images.",
        nodeTypes: ["IMG", "AREA"],
        
        prepare: function(rulecheck: any, analyzeSummary: any, htmlString: string) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";      
            rulecheck.nbfailed = 0;
            rulecheck.nbcheck = 0;    
        },
        
        check: function(node: HTMLElement, rulecheck: any, analyzeSummary: any, htmlString: string) {
            //console.log("check alt images ");
            var altattr = node.attributes.getNamedItem("alt");
            
            rulecheck.nbcheck++;
            if (!altattr || !altattr.value) {
                rulecheck.nbfailed++;
                rulecheck.failed = true;
                rulecheck.items.push({
                    content : VORLON.Tools.htmlToString(node.outerHTML)
                })
            } else {
            }
        }
    }
   
}
