module VORLON.WebStandards.Rules.CSS {
    export var cssfallback = <ICSSRule>{
        id: "webstandards.cssfallback",
        title: "incorrect use of css fallback",
        description: "Ensure css fallback.",
        
        prepare: function(rulecheck, analyzeSummary){
            this.fallBackErrorList = []
        },
        
        check: function(url, ast, rulecheck: any, analyzeSummary: any) { 
            var parsed = ast;
            
            for (var i = 0; i < parsed.length; i++) {
                var selector = parsed[i].selector;
                var rules = parsed[i].rules;

                var resultsList = this.checkPrefix(rules);
                if (resultsList.length > 0) {
                    // if (!results[url])
                    //     results[url] = {}
                    // if (!results[url][selector])
                    //     results[url][selector] = [];
                    //     
                    // for (var x = 0; x < resultsList.length; x++) {
                    //     results[url][selector].push(resultsList[x]);
                    // }
                    
                    this.fallBackErrorList.push(resultsList);
                }
                
            }    
        },
        
        capitalizeFirstLetter : function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        
        checkPrefix: function(rules: Array<any>): Array<string> {
            var errorList = [];
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf('-webkit') === 0) {
                        var _unprefixedPropertyName = this.unprefixedPropertyName(rules[i].directive)
                        var good = this.checkIfNoPrefix(rules, _unprefixedPropertyName);
                        if (!good) {
                            var divTest = document.createElement('div');
                            divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] = rules[i].value;
                            if (divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] !== undefined) {
                                good = true;
                            }
                        }
                        if (!good) {
                            errorList.push(rules[i].directive);
                        }
                    }
                }

            return errorList;
        },
        
        checkIfNoPrefix : function(rules: Array<any>, prefix: string) {
            var present = false;
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf(prefix) === 0) {
                        present = true;
                        break;
                    }
                }
            if (!present) {
                present = this.checkIfMsPrefix(rules, prefix);
            }

            return present;
        },

        checkIfMsPrefix : function(rules: Array<any>, prefix: string) {
            var present = false;
            if (rules && rules.length)
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].directive.indexOf('-ms-' + prefix) === 0) {
                        present = true;
                        break;
                    }
                }

            return present;
        },

        unprefixedPropertyName : function(property: string) {
            return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
        },
        
        endcheck: function(rulecheck: any, analyzeSummary: any) {
            //console.log("check css css fallback");
            var nodes: any = [];

            rulecheck.items = [];
            var failed = false;
            if (!this.fallBackErrorList) {
                rulecheck.title = "(disabled !) incorrect use of css fallback";
                failed = true;
                var np = {
                    title: "the check of css Fallback is disabled",
                    type: "blockitems",
                    failed: true,
                    items: []
                }
                rulecheck.items.push(np);
            }
            else {
                for (var ii = 0; ii < this.fallBackErrorList.length; ii++) {
                    for (var fallErrorFile in this.fallBackErrorList[ii]) {
                        failed = true;
                        var fallError = this.fallBackErrorList[ii][fallErrorFile];
                        var proprules = {
                            title: fallErrorFile,
                            type: "itemslist",
                            items: []
                        }
                        
                        for (var errorFile in fallError) {
                            var peroor = {
                                failed: true,
                                id: "." + fallError[errorFile][ind],
                                items: [],
                                title: errorFile
                            }
                            proprules.items.push(peroor);

                            for (var ind = 0; ind < fallError[errorFile].length; ind++) {
                                peroor.items.push({
                                    failed: true, id: "." + fallError[errorFile][ind], items: [],
                                    title: "from " + fallError[errorFile][ind] + " to " + fallError[errorFile][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""), type: "error"
                                });
                            }
                            if (proprules.items.length) {
                                rulecheck.items.push(proprules);
                            }
                        }
                    }
                }
            }
            rulecheck.failed = failed;
        },
    }
}