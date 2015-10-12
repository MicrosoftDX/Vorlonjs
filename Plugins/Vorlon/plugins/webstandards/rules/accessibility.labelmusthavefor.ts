module VORLON.WebStandards.Rules.DOM {
    
    export var labelMustHaveFor = <IDOMRule>{
        id: "accessibility.label-must-have-for",
        title: "label tag must have a \"for\" attribute",
        description : "label tag is intended to be used with input field. Label tags help people with disabilities to identify input fields.",
        nodeTypes: ["label"],
                
        prepare: function(rulecheck: any, analyseSummary: any, htmlString: string) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";      
            rulecheck.nbfailed = 0;
            rulecheck.nbcheck = 0;    
        },
        
        check: function(node: HTMLElement, rulecheck: any, analyseSummary: any, htmlString: string) {
            var forAttr = node.getAttribute("for");
            rulecheck.nbcheck++;
            if (!forAttr) {
                rulecheck.nbfailed++;
                rulecheck.failed = true;
                rulecheck.items.push({
                    content : VORLON.Tools.htmlToString(node.outerHTML)
                })
            } 
        }
    }
   
}
