module VORLON.WebStandards.Rules.CSS {
    export var cssprefixes = <ICSSRule>{
        id: "webstandards.prefixes",
        title: "incorrect use of prefixes",
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
            
            var convertNode = function (node, prefixe) {
                var rules: string = "";
                node.rules.forEach((rule, i) => {
                   rules = rules + rule.directive + " "; 
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
                        for (var x = 0, len = node.rules.length; x < len; x++) {
                            var property = node.rules[x].directive;
                            if (compatiblePrefixes.hasOwnProperty(property)) {
                                if (compatiblePrefixes[property].indexOf(property) == -1)
                                    compatiblePrefixes[property].push(property);
                                    
                                nodes.push(convertNode(node, property));
                            }
                        }
                    }
                    
                    if (node.type === "media"){
                        checkNodes(node.subStyles);    
                    }
                });
            }
            checkNodes(ast);
            
            rulecheck.items = rulecheck.items || [];
			for (i = 0, len = nodes.length; i < len; i++) {
                var allProperty = compatiblePrefixes[nodes[i].prefixe];
                var prefixes = [];
                allProperty.forEach((prop, y) => {
                    if (nodes[i].rules.search(prop) === -1) {
                        prefixes.push(prop);
                    }
                });
                if (prefixes.length > 0) {
                    rulecheck.items.push(<ResultCSSPrefixe>{
                        prefixesMissing: prefixes,
                        selector: nodes.selector
                    });
                }
            }
            if (rulecheck.items.length > 0) {
                rulecheck.failed = true;
            }
        }
    }
}