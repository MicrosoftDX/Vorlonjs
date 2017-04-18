declare var axe: any;

module VORLON.WebStandards.Rules.Accessibility {

    export var aXeCheck = <IRule>{
        id: "accessibility.aXeCheck",
        title: "Check for accessibility issues",
        description: "Use the aXe testing library to catch common accessibility issues.",

        prepare: function(rulecheck : IRuleCheck, analyzeSummary: any) {   
            analyzeSummary.pendingLoad++;         
            // Using aXe
            axe.a11yCheck(document, (results) => {    
                rulecheck.items = [];
                                
                rulecheck.failed = (results.violations.length > 0);
                rulecheck.skipRootLevel = rulecheck.failed ;
                            
                for (var index = 0; index < results.violations.length; index++) {
                    var check = results.violations[index];

                    var item = {
                        description: check.description,
                        failed: true,
                        id: check.id, 
                        title: check.help,
                        type: "blockitems",
                        items: []                    
                    };
                    
                    rulecheck.items.push(item);
                    
                    for (var nodeIndex = 0; nodeIndex < check.nodes.length; nodeIndex++) {
                        var node = check.nodes[nodeIndex];
                        var nodeEntry = {
                            title: node.html,
                            items: []
                        };
                        
                        item.items.push(nodeEntry);
                        
                        for (var anyIndex = 0; anyIndex < node.any.length; anyIndex++) {
                            nodeEntry.items.push({ title: node.any[anyIndex].message});
                        }
                    }
                }
                
                analyzeSummary.pendingLoad--; 
            });
        }
    }
}
