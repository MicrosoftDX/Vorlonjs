module VORLON.WebStandards.Rules.DOM {
    
    export var avoidMetaRefresh = <IDOMRule>{
        id: "accessibility.avoid-meta-refresh",
        title: "avoid meta refresh",
        description : "Reading a webpage with your fingers is a lot harder and slower. Avoid auto refreshing your page",
        nodeTypes: ["meta"],
                
        check: function(node: HTMLElement, rulecheck: any, analyzeSummary: any, htmlString: string) {
            var equiv = node.getAttribute("http-equiv");
            if (equiv && equiv.toLowerCase() == "refresh"){
                rulecheck.failed = true;
            }
        }
    }
   
}
