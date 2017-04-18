module VORLON.WebStandards.Rules.DOM {

    export var deviceIcons = <IDOMRule>{
        id: "mobileweb.deviceIcons",
        title: "Define platform icons",
        description: "Add platform-specific icons for users who pin your site to the home screen of their mobile device.",
        nodeTypes: ["meta", "link"],

        prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];
            rulecheck.type = "blockitems"; 
            rulecheck.data = {
                hasWindowsIcons : false,
                hasWindowsNotification : false,
                hasIOSIcons : false
            }
        },

        check: function(node: HTMLElement, rulecheck: IRuleCheck, analyzeSummary: any, htmlString: string) {
            if (node.nodeName == "LINK") {
                var rel = node.getAttribute("rel");
                if (rel && rel == "apple-touch-icon-precomposed") {
                    rulecheck.data.hasIOSIcons = true;
                }
            } else if (node.nodeName == "META") {
                var name = node.getAttribute("name");
                if (name) {
                    if (name.toLowerCase() == "msapplication-notification") {
                        rulecheck.data.hasWindowsNotification = true;
                    } else if (name.toLowerCase().indexOf("msapplication-") == 0) {
                        rulecheck.data.hasWindowsIcons = true;
                    }
                }
            }
        },

        endcheck: function(rulecheck: IRuleCheck, analyzeSummary) {
            if (!rulecheck.data.hasIOSIcons) {
                rulecheck.failed = true;
                rulecheck.items.push({
                    title: 'Provide iOS icons by adding link tags, like <link rel="apple-touch-icon" href="youricon" sizes="57x57"" />'
                });
            }

            if (!rulecheck.data.hasWindowsIcons) {
                rulecheck.failed = true;
                //https://msdn.microsoft.com/en-us/library/dn255024(v=vs.85).aspx
                rulecheck.items.push({
                    title: 'Provide Universal Windows Platform (UWP) tiles by adding meta tags, like <link name="msapplication-square150x150logo" content="yourimage" />'
                });
            }

        }
    }

}
