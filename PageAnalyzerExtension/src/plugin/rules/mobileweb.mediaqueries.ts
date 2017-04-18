module VORLON.WebStandards.Rules.CSS {
    export var mobileMediaqueries = <ICSSRule>{
        id: "mobileweb.usemediaqueries",
        title: "Use responsive design",
        description: "Use CSS media queries to tailor your site to a specific range of screen sizes while still supporting less common display ratios.",
        
        prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.type = "blockitems"; 
            if (!rulecheck.data){  
                rulecheck.data = {
                    cssnbqueries : 0,
                    domnbqueries : 0
                };
            }         
        },
        
        check: function (url, ast, rulecheck: IRuleCheck, analyzeSummary: any) {
            //console.log("check css prefixes");

            this.checkNodes(url, rulecheck, ast);
        },

        checkNodes: function (url, rulecheck: IRuleCheck, ast) {
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
                            rulecheck.data.cssnbqueries++;
                        }
                    }
                }
            });
        },
        
        endcheck: function(rulecheck: IRuleCheck, analyzeSummary: any){            
        }
    }
}

module VORLON.WebStandards.Rules.DOM {
    export var mobileMediaqueries = <IDOMRule>{
        id: "mobileweb.usemediaqueries",
        title: "Use responsive approaches",
        description: "Use CSS media queries to tailor your site to a specific range of screen sizes while still supporting less common display ratios.",        
        nodeTypes: ["link"],
		
		prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || []; 
            if (!rulecheck.data){  
                rulecheck.data = {
                    cssnbqueries : 0,
                    domnbqueries : 0
                };
            }       
        },
        
        check: function(node: HTMLElement, rulecheck: IRuleCheck, analyzeSummary: any, htmlstring : string) {
			if (!node.getAttribute) //not an HTML element
				return;
                          
            var rel = node.getAttribute("rel");
            if (rel && rel.toLocaleLowerCase() == "stylesheet"){
                var media = node.getAttribute("media");
                if (media){
                    media = media.toLowerCase();
                    if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0){
                        rulecheck.data.domnbqueries++;
                    }
                }
            }        
        },
        
        endcheck : function(rulecheck: IRuleCheck, analyzeSummary){
            //console.log("media queries css:" + rulecheck.cssnbqueries + ", dom:" + rulecheck.domnbqueries);
            if (rulecheck.data.cssnbqueries==0 && rulecheck.data.domnbqueries==0){
                if (rulecheck.data.cssnbqueries==0){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : 'your css (either files or inline) does not use any media queries'
                    });
                }
                
                if (rulecheck.data.domnbqueries==0){
                    rulecheck.failed = true;
                    rulecheck.items.push({
                        title : 'your link tags does not use any media queries'
                    });
                }
            }
        }
    }   
}