module VORLON.WebStandards.Rules.CSS {
    export var mobileMediaqueries = <ICSSRule>{
        id: "mobileweb.usemediaqueries",
        title: "use responsive approaches",
        description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",
        
        prepare: function(rulecheck: any, analyzeSummary: any) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems"; 
            if (rulecheck.cssnbqueries == undefined) rulecheck.cssnbqueries = 0;          
        },
        
        check: function (url, ast, rulecheck: any, analyzeSummary: any) {
            //console.log("check css prefixes");

            this.checkNodes(url, rulecheck, ast);
        },

        checkNodes: function (url, rulecheck, ast) {
            if (!ast)
                return;

            ast.forEach((node, i) => {
                var nodeitem = <any>null;                
                    
                //scan content for media queries
                if (node.type === "media") {
                    var media = node.selector;
                    if (media){
                        media = media.toLowerCase();
                        if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0){
                            rulecheck.cssnbqueries++;
                        }
                    }
                }
            });
        },
        
        endcheck: function(rulecheck: any, analyzeSummary: any){            
        }
    }
}

module VORLON.WebStandards.Rules.DOM {
    export var mobileMediaqueries = <IDOMRule>{
        id: "mobileweb.usemediaqueries",
        title: "use responsive approaches",
        description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",        
        nodeTypes: ["link"],
		
		prepare: function(rulecheck: any, analyzeSummary: any, htmlString: string) {
            rulecheck.items = rulecheck.items || [];   
            if (rulecheck.domnbqueries == undefined) rulecheck.domnbqueries = 0;       
        },
        
        check: function(node: HTMLElement, rulecheck: any, analyzeSummary: any, htmlstring : string) {
			if (!node.getAttribute) //not an HTML element
				return;
                          
            var rel = node.getAttribute("rel");
            if (rel && rel.toLocaleLowerCase() == "stylesheet"){
                var media = node.getAttribute("media");
                if (media){
                    media = media.toLowerCase();
                    if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0){
                        rulecheck.domnbqueries++;
                    }
                }
            }        
        },
        
        endcheck : function(rulecheck, analyzeSummary, htmlstring : string){
            //console.log("media queries css:" + rulecheck.cssnbqueries + ", dom:" + rulecheck.domnbqueries);
            if (rulecheck.cssnbqueries==0 && rulecheck.domnbqueries==0){
                if (rulecheck.cssnbqueries==0){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : 'your css (either files or inline) does not use any media queries'
                    });
                }
                
                if (rulecheck.domnbqueries==0){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : 'your link tags does not use any media queries'
                    });
                }
            }
        }
    }   
}