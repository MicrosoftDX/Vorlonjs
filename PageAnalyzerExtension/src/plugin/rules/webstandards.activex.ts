module VORLON.WebStandards.Rules.DOM {
    export var dontUsePlugins = <IDOMRule>{
        id: "webstandards.dont-use-plugins",
        title: "Use HTML5",
        description : "Use HTML5 features instead of native plugins. Many browsers no longer support them.",
        nodeTypes: ["EMBED", "OBJECT"],
        
        prepare: function(rulecheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems";    
        },
        
        check: function(node: HTMLElement, rulecheck: any, analyzeSummary: any, htmlString: string) {
            //console.log("check for plugins");
                        
            var source :string = null, data:string  = null, type:string  = null;
            
            var source = node.getAttribute("src");
            if (source) source = source.toLowerCase(); else source = "";
                        
            var data = node.getAttribute("data");
            if (data) data = data.toLowerCase(); else data = "";
               
            var type = node.getAttribute("type");
            if (type) type = type.toLowerCase(); else type = "";
                                     
            if (source.indexOf(".swf") > 0 || data.indexOf("swf") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "Consider using HTML5 instead of Flash", content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            }
            else if (type.indexOf("silverlight") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "Consider using HTML5 instead of Silverlight", content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            } else if (source.indexOf(".svg") > 0 || data.indexOf("svg") > 0) {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "Avoid using SVG with " + node.nodeType, content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            } else {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "Use HTML5 features (such as canvas, video and audio elements) instead of hosting plugins with embed and object elements", content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            }
        }
    }
}
