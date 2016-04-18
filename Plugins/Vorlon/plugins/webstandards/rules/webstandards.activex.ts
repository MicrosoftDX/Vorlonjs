module VORLON.WebStandards.Rules.DOM {
    export var dontUsePlugins = <IDOMRule>{
        id: "webstandards.dont-use-plugins",
        title: "object and embed",
        description : "With HTML5 embed or object tags can often be replaced with HTML5 features.",
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
                rulecheck.items.push({ message: "consider using HTML5 instead of Flash", content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            }
            else if (type.indexOf("silverlight") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "consider using HTML5 instead of Silverlight", content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            } else if (source.indexOf(".svg") > 0 || data.indexOf("svg") > 0) {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "dont't use SVG with " + node.nodeType, content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            } else {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "use HTML5 instead of embed or object elements", content : VORLON.Tools.htmlToString((<HTMLElement>node).outerHTML) })
            }
        }
    }
}
