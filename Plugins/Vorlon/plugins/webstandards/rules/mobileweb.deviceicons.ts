module VORLON.WebStandards.Rules.DOM {

    export var deviceIcons = <IDOMRule>{
        id: "mobileweb.deviceIcons",
        title: "define platform icons",
        description: "Platform icons helps user pinning your website with an icon that fits well on mobile device home.",
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
                    title: VORLON.Tools.htmlToString('add Apple - iOS icons by adding link tags like <link rel="apple-touch-icon-precomposed" href="youricon" sizes="57x57" />')
                });
            }

            if (!rulecheck.data.hasWindowsIcons) {
                rulecheck.failed = true;
                //https://msdn.microsoft.com/en-us/library/dn255024(v=vs.85).aspx
                rulecheck.items.push({
                    title: VORLON.Tools.htmlToString('add Microsoft - Windows tiles by adding meta tags like <link name="msapplication-square150x150logo" content="yourimage" />')
                });
            }

        }
    }

}
