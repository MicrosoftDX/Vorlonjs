module VORLON.WebStandards.Rules.CSS {
    export var mobileMediaqueries = <ICSSRule>{
        id: "mobileweb.usemediaqueries",
        title: "use responsive approaches",
        description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",
        
        prepare: function(rulecheck: any, analyseSummary: any) {
            rulecheck.items = rulecheck.items || [];   
            rulecheck.nbqueries = 0;          
        },
        
        check: function (url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css prefixes");

            var nodes: any = [];
            var filerules = {
                title: url,
                type: "itemslist",
                items: []
            }
            rulecheck.items = rulecheck.items || [];
            this.checkNodes(url, filerules, ast, nodes);

            if (filerules.items.length) {
                rulecheck.items.push(filerules);
                rulecheck.failed = true;
            }
        },

        checkNodes: function (url, rulecheck, ast, nodes) {
            if (!ast)
                return;

            ast.forEach((node, i) => {
                var nodeitem = <any>null;                
                    
                //scan content of media queries
                if (node.type === "media") {
                    rulecheck.nbqueries++;
                }
            });
        },
        
        endcheck: function(rulecheck: any, analyseSummary: any){
            if (rulecheck.nbqueries==0){
                rulecheck.failed = true;
			}
        }
    }
}