module VORLON.WebStandards.Rules.DOM {
    export var modernDocType = <IDOMRule>{
        id: "webstandards.documentmode",
        title: "use modern doctype",
        description: "Modern doctype like <!DOCTYPE html> are better for browser compatibility and enable using HTML5 features.",
        nodeTypes: ["META"],
        
        prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";          
        },
        
        check: function(node: HTMLElement, rulecheck: IRuleCheck, analyzeSummary: any, htmlString: string) {
            var httpequiv = node.getAttribute("http-equiv");
            
            if (httpequiv && httpequiv.toLowerCase() == "x-ua-compatible"){
                var content = node.getAttribute("content");
                if (!(content.toLowerCase().indexOf("edge") >= 0)){
                    rulecheck.failed = true;
                    //current.content = doctype.html;
                    rulecheck.items.push({
                        title : "your website use IE's document mode compatibility for an older version of IE ",
                        content : node.outerHTML
                    });
                }
            }
        },
        
        endcheck: function(rulecheck: IRuleCheck, analyzeSummary: any) {
            //console.log("checking comment " + node.nodeValue);
            var doctype = analyzeSummary.doctype || {};
            var current = {
                title : "used doctype is " + doctype.html
            }
            
            if (doctype.publicId || doctype.systemId){
                rulecheck.failed = true;
                //current.content = doctype.html;
                rulecheck.items.push(current);
            }
        }
    }
}
