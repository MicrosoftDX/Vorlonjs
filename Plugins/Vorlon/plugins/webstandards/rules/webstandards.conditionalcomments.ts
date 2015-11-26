module VORLON.WebStandards.Rules.DOM {
    export var dontUseBrowserConditionalComment = <IDOMRule>{
        id: "webstandards.avoid-browser-specific-css",
        title: "avoid conditional comments",
        description: "Conditional comments are not the best way to adapt your website to target browser, and support is dropped for IE > 9.",
        nodeTypes: ["#comment"],

        prepare: function(rulecheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";          
        },

        check: function(node: Node, rulecheck: any, analyzeSummary: any, htmlString: string) {
            //console.log("checking comment " + node.nodeValue);
            var commentContent = node.nodeValue.toLowerCase();

            var hasConditionalComment = 
                commentContent.indexOf("[if ie ") >= 0 ||
                commentContent.indexOf("[if !ie]") >= 0 ||
                commentContent.indexOf("[if gt ie ") >= 0 ||
                commentContent.indexOf("[if gte ie ") >= 0 ||
                commentContent.indexOf("[if lt ie ") >= 0 ||
                commentContent.indexOf("[if lte ie ") >= 0;
            
            if (hasConditionalComment) {
                rulecheck.failed = true;
                rulecheck.items.push({
                    title: VORLON.Tools.htmlToString(node.nodeValue)
                });
            } 
        }
    }
}
