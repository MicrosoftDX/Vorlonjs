module VORLON.WebStandards.Rules.CSS {
    export var cssprefixes = <ICSSRule>{
        id: "webstandards.prefixes",
        title: "incorrect use of prefixes",
        description : "Ensure you use all vendor prefixes and unprefixed version for HTML5 CSS properties.",
        check: function(url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css prefixes");
            var compatiblePrefixes = {
                'animation': 'webkit',
                'animation-delay': 'webkit',
                'animation-direction': 'webkit',
                'animation-duration': 'webkit',
                'animation-fill-mode': 'webkit',
                'animation-iteration-count': 'webkit',
                'animation-name': 'webkit',
                'animation-play-state': 'webkit',
                'animation-timing-function': 'webkit',
                'appearance': 'webkit moz',
                'border-end': 'webkit moz',
                'border-end-color': 'webkit moz',
                'border-end-style': 'webkit moz',
                'border-end-width': 'webkit moz',
                'border-image': 'webkit o',
                'border-start': 'webkit moz',
                'border-start-color': 'webkit moz',
                'border-start-style': 'webkit moz',
                'border-start-width': 'webkit moz',
                'box-sizing': 'webkit',
                'column-count': 'webkit moz',
                'column-gap': 'webkit moz',
                'column-rule': 'webkit moz',
                'column-rule-color': 'webkit moz',
                'column-rule-style': 'webkit moz',
                'column-rule-width': 'webkit moz',
                'column-width': 'webkit moz',
                'hyphens': 'webkit moz ms',
                'margin-end': 'webkit moz',
                'margin-start': 'webkit moz',
                'padding-end': 'webkit moz',
                'padding-start': 'webkit moz',
                'tab-size': 'webkit moz o',
                'text-size-adjust': 'webkit moz ms',
                'transform': 'webkit ms',
                'transform-origin': 'webkit ms',
                'transition': 'webkit moz o',
                'transition-delay': 'webkit moz o',
                'transition-duration': 'webkit',
                'transition-property': 'webkit',
                'transition-timing-function': 'webkit',
                'user-select': 'webkit moz ms'
            };
            
            var variations,
                prefixed,
                arrayPush = Array.prototype.push,
                applyTo: Array<string> = new Array<string>();
                
            for (var prop in compatiblePrefixes) {
                if (compatiblePrefixes.hasOwnProperty(prop)) {
                    variations = [];
                    prefixed = compatiblePrefixes[prop].split(' ');
                    for (var i = 0, len = prefixed.length; i < len; i++) {
                        variations.push('-' + prefixed[i] + '-' + prop);
                    }
                    compatiblePrefixes[prop] = variations;
                    variations.forEach((obj, i) => {
                       applyTo[obj] = i; 
                    });
                }
            }
            
            var unprefixedPropertyName = function(property){
                return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
            }
            
            var convertNode = function (node, prefixe) {
                var rules: string[] = [];
                node.rules.forEach((rule, i) => {
                   rules.push(rule.directive);                    
                });
                
                return {
                    selector: node.selector,
                    rules: rules,
                    prefixe: prefixe
                };
            }
            
            var nodes: any = [];
            function checkNodes(items){
                if (!items)
                    return;
                    
                items.forEach((node, i) => {
                    if (node.rules && node.rules.length > 0) {
                        var checked = <any>{};
                        for (var x = 0, len = node.rules.length; x < len; x++) {
                            var property = node.rules[x].directive;
                            var unprefixed = unprefixedPropertyName(property);
                                
                            if (!checked[unprefixed] && compatiblePrefixes.hasOwnProperty(unprefixed)) {
                                if (compatiblePrefixes[unprefixed].indexOf(unprefixed) == -1)
                                    compatiblePrefixes[unprefixed].push(unprefixed);
                                    
                                nodes.push(convertNode(node, unprefixed));
                            }
                            checked[unprefixed] = true;
                        }
                    }
                    
                    //scan content of media queries
                    if (node.type === "media"){
                        checkNodes(node.subStyles);    
                    }
                });
            }
            checkNodes(ast);
            
            var itemsInError = [];
			for (i = 0, len = nodes.length; i < len; i++) {
                var allProperty = compatiblePrefixes[nodes[i].prefixe];                
                var prefixes = [];
                
                allProperty.forEach((prop, y) => {
                    var hasPrefix = nodes[i].rules.some((r) => { return r == prop });
                    if (!hasPrefix) {
                        prefixes.push(prop);
                    }
                });
                
                if (prefixes.length > 0) {
                    itemsInError.push({
                        content: "missing " + prefixes + " for <strong>" + nodes[i].prefixe + "</strong>",
                        title: nodes[i].selector
                    });
                }
            }
            if (itemsInError.length > 0) {
                rulecheck.failed = true;
                rulecheck.items = rulecheck.items || [];
                rulecheck.items.push({
                    title : url,
                    type : "itemslist",
                    items : itemsInError
                })
            }
        }
    }
}