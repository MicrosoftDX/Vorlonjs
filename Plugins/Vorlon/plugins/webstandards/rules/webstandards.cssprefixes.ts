module VORLON.WebStandards.Rules.CSS {
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

    export var cssprefixes = <ICSSRule>{
        id: "webstandards.prefixes",
        title: "incorrect use of prefixes",
        description: "Ensure you use all vendor prefixes and unprefixed version for HTML5 CSS properties.",
        check: function (url, ast, rulecheck: any, analyseSummary: any) {
            console.log("check css prefixes");

            var nodes: any = [];
            var filerules = {
                title: url,
                type: "itemslist",
                items: []
            }
            rulecheck.items = rulecheck.items || [];
            this.checkNodes(url, compatiblePrefixes, filerules, ast, nodes);

            if (filerules.items.length) {
                rulecheck.items.push(filerules);
                rulecheck.failed = true;
            }
        },

        unprefixedPropertyName: function (property) {
            return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
        },

        getMissingPrefixes: function (compatiblePrefixes, node, property) {
            var allProperty = compatiblePrefixes[property];
            var prefixes = [];


            allProperty.forEach((prop, y) => {
                var hasPrefix = node.rules.some((r) => { return r.directive == prop });
                if (!hasPrefix) {
                    prefixes.push(prop);
                }
            });

            return prefixes;
        },

        checkNodes: function (url, compatiblePrefixes, rulecheck, ast, nodes) {
            if (!ast)
                return;

            ast.forEach((node, i) => {
                var nodeitem = <any>null;

                if (node.rules && node.rules.length > 0) {
                    var checked = <any>{};
                    for (var x = 0, len = node.rules.length; x < len; x++) {
                        var property = node.rules[x].directive;
                        var unprefixed = this.unprefixedPropertyName(property);

                        if (!checked[unprefixed] && compatiblePrefixes.hasOwnProperty(unprefixed)) {
                            if (compatiblePrefixes[unprefixed].indexOf(unprefixed) == -1)
                                compatiblePrefixes[unprefixed].push(unprefixed);

                            var missings = this.getMissingPrefixes(compatiblePrefixes, node, unprefixed);
                            if (missings.length) {
                                if (!nodeitem) {
                                    rulecheck.failed = true;
                                    rulecheck.items = rulecheck.items || [];
                                    nodeitem = {
                                        title: node.selector,
                                        items: []
                                    }
                                    rulecheck.items.push(nodeitem);
                                }

                                nodeitem.items.push({
                                    title: "<strong>" + unprefixed + "</strong> : missing " + missings,
                                })
                            }    
                            //nodes.push(this.convertNode(node, unprefixed));
                        }
                        checked[unprefixed] = true;
                    }
                }
                    
                //scan content of media queries
                if (node.type === "media") {
                    this.checkNodes(url, compatiblePrefixes, rulecheck, node.subStyles, nodes);
                }
            });
        }
    }
}