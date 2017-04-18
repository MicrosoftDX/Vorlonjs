module VORLON.WebStandards.Rules.DOM {

    export var useViewport = <IDOMRule>{
        id: "mobileweb.use-viewport",
        title: "Use meta viewport",
        description: "Use the meta viewport tag to scale down your site on smaller devices. A good default is <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
        nodeTypes: ["meta"],

        prepare: function(rulecheck : IRuleCheck, analyzeSummary) {
            rulecheck.failed = true;
        },

        check: function(node: HTMLElement, rulecheck : IRuleCheck, analyzeSummary: any, htmlString: string) {
            var viewportattr = node.getAttribute("name");
            if (viewportattr && viewportattr.toLowerCase() == "viewport") {
                rulecheck.failed = false;
            }
            
        }
    }

}
