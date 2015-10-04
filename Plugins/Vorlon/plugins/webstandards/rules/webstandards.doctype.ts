module VORLON.WebStandards.Rules.DOM {
    export var modernDocType = <IDOMRule>{
        id: "webstandards.use-modern-doctype",
        title: "use modern doctype",
        description: "Modern doctype like &lt;!DOCTYPE html&gt; are better for browser compatibility.",
        nodeTypes: [],
        generalRule : true,

        check: function(node: Node, rulecheck: any, analyseSummary: any, htmlString: string) {
            //console.log("checking comment " + node.nodeValue);
            var doctype = analyseSummary.doctype || {};
            rulecheck.items = rulecheck.items || [];
            var current = {
                title : "used doctype is <br/>" + VORLON.Tools.htmlToString(doctype.html)
            }
            
            if (doctype.publicId || doctype.systemId){
                rulecheck.failed = true;
            }
        }
    }
}
