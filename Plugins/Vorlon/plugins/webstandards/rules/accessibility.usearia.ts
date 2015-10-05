module VORLON.WebStandards.Rules.DOM {
    var ariaAttributes = ['role',
		'aria-atomic',
		'aria-busy',
		'aria-controls',
		'aria-describedby',
		'aria-disabled',
		'aria-dropeffect',
		'aria-flowto',
		'aria-grabbed',
		'aria-haspopup',
		'aria-hidden',
		'aria-invalid',
		'aria-label',
		'aria-labelledby',
		'aria-live',
		'aria-owns',
		'aria-relevant',
		'aria-autocomplete',
		'aria-checked',
		'aria-expanded',
		'aria-level',
		'aria-multiline',
		'aria-multiselectable',
		'aria-orientation',
		'aria-pressed',
		'aria-readonly',
		'aria-required',
		'aria-selected',
		'aria-sort',
		'aria-valuemax',
		'aria-valuemin',
		'aria-valuenow',
		'aria-valuetext',
		'aria-activedescendant',
		'aria-posinset',
		'aria-setsize'];
        
    export var useAriaAttributes = <IDOMRule>{
        id: "accessibility.use-aria",
        title: "Use aria attributes",
        description : "Use accessibility attributes like aria-label to provide meaningful information for people with visual disabilities.",
        nodeTypes: [],
		
		prepare: function(rulecheck: any, analyseSummary: any, htmlString: string) {
            rulecheck.ariaCount = 0;          
        },
        
        check: function(node: HTMLElement, rulecheck: any, analyseSummary: any, htmlstring : string) {
			if (!node.getAttribute) //not an HTML element
				return;
             
            ariaAttributes.forEach(function(a){
                if(node.getAttribute(a)){
                    rulecheck.ariaCount++;
                }
            })            
        },
        
        endcheck : function(rulecheck, analyseSummary, htmlstring : string){
			if (rulecheck.ariaCount==0){
                rulecheck.failed = true;
			}
        }
    }
   
}
