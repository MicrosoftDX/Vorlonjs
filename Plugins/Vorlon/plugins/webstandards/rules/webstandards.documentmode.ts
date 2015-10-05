module VORLON.WebStandards.Rules.DOM {
    export var modernDocType = <IDOMRule>{
        id: "webstandards.documentmode",
        title: "use modern doctype",
        description: "Modern doctype like &lt;!DOCTYPE html&gt; are better for browser compatibility and enable using HTML5 features.",
        nodeTypes: ["META"],
        
        prepare: function(rulecheck: any, analyseSummary: any, htmlString: string) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";          
        },
        
        check: function(node: HTMLElement, rulecheck: any, analyseSummary: any, htmlString: string) {
            var httpequiv = node.getAttribute("http-equiv");
            
            if (httpequiv && httpequiv.toLowerCase() == "x-ua-compatible"){
                var content = node.getAttribute("content");
                if (!(content.toLowerCase().indexOf("edge") >= 0)){
                    rulecheck.failed = true;
                    //current.content = doctype.html;
                    rulecheck.items.push({
                        title : "your website use IE's document mode compatibility for an older version of IE ",
                        content : VORLON.Tools.htmlToString(node.outerHTML)
                    });
                }
            }
        },
        
        endcheck: function(rulecheck: any, analyseSummary: any, htmlString: string) {
            //console.log("checking comment " + node.nodeValue);
            var doctype = analyseSummary.doctype || {};
            var current = {
                title : "used doctype is <br/>" + VORLON.Tools.htmlToString(doctype.html)
            }
            
            if (doctype.publicId || doctype.systemId){
                rulecheck.failed = true;
                //current.content = doctype.html;
                rulecheck.items.push(current);
            }
        }
    }
}
