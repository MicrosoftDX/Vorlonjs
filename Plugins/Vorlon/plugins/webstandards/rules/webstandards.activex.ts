module VORLON.WebStandards.Rules.DOM {
    export var dontUsePlugins = <IDOMRule>{
        id: "webstandards.dont-use-plugins",
        title: "",
        nodeTypes: ["EMBED", "OBJECT"],
        check: function(node: HTMLElement, rulecheck: any, analyseSummary: any, htmlString: string) {
            console.log("check for plugins");
                        
            var source :string = null, data:string  = null, type:string  = null;
            
            var source = node.getAttribute("src");
            if (source) source = source.toLowerCase(); else source = "";
                        
            var data = node.getAttribute("data");
            if (data) data = data.toLowerCase(); else data = "";
               
            var type = node.getAttribute("type");
            if (type) type = type.toLowerCase(); else type = "";
            
            rulecheck.items = rulecheck.items || [];             
            if (source.indexOf(".swf") > 0 || data.indexOf("swf") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "think about using HTML5 instead of Flash", content : (<HTMLElement>node).outerHTML })
            }
            else if (type.indexOf("silverlight") > 0){
                rulecheck.failed = true;
                rulecheck.items.push({ message: "think about using HTML5 instead of Silverlight", content : (<HTMLElement>node).outerHTML })
            } else if (source.indexOf(".svg") > 0 || data.indexOf("svg") > 0) {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "dont't use SVG with " + node.nodeType, content : (<HTMLElement>node).outerHTML })
            } else {
                rulecheck.failed = true;
                rulecheck.items.push({ message: "use HTML5 instead of embed or object elements", content : (<HTMLElement>node).outerHTML })
            }
        }
    }
}
