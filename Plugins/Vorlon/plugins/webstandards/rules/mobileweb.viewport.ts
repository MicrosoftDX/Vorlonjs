module VORLON.WebStandards.Rules.DOM {

    export var useViewport = <IDOMRule>{
        id: "mobileweb.use-viewport",
        title: "use meta viewport",
        description: "Use meta viewport tag to choose how your website will get scaled on smaller devices like phones. Define at least &lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"&gt;",
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
