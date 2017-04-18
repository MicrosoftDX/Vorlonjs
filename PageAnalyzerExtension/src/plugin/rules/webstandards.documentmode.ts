module VORLON.WebStandards.Rules.DOM {
    export var modernDocType = <IDOMRule>{
        id: "webstandards.documentmode",
        title: "Use a modern doctype",
        description: "Use <!DOCTYPE html> to enable HTML5 features and interoperability across modern browsers.",
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
                        title : "Avoid hardcoded docmode compatibility tags (http-equiv='X-UA-Compatible') for older versions of IE.",
                        content : node.outerHTML
                    });
                }
            }
        },
        
        endcheck: function(rulecheck: IRuleCheck, analyzeSummary: any) {
            //console.log("checking comment " + node.nodeValue);
            var doctype = analyzeSummary.doctype || {};
            var current = {
                title : "Page doctype: " + doctype.html
            }
            
            if (doctype.publicId || doctype.systemId){
                rulecheck.failed = true;
                //current.content = doctype.html;
                rulecheck.items.push(current);
            }
        }
    }
}
