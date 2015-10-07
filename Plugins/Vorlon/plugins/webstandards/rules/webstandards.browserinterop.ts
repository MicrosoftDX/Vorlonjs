module VORLON.WebStandards.Rules.DOM {
    export var browserinterop = <IDOMRule>{
        id: "webstandards.avoid-browser-specific-content",
        title: "avoid browser specific content",
        description: "Avoid serving content based on user-agent. Browsers evolve fast and user-agent based content may frustrate your users by not getting the best content for their preferred browser.",
        nodeTypes: ["#comment"],
        
        userAgents: {
            "Microsoft Edge" : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240',
            "Microsoft IE11" : 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
            "Google Chrome" : 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
            "Firefox" : 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0'
        },

        prepare: function(rulecheck: any, analyseSummary: any, htmlString: string) {
            rulecheck.items = rulecheck.items || [];
            rulecheck.type = "blockitems";
            analyseSummary.files.browserInterop = {};
            
            for (var n in this.userAgents){
                this.fetchHTMLDocument(n, this.userAgents[n], analyseSummary);
            }
        },

        check: function(node: Node, rulecheck: any, analyseSummary: any, htmlString: string) {

        },

        endcheck: function(rulecheck: any, analyseSummary: any, htmlString: string) {
            var detection = analyseSummary.files.browserInterop;
            var comparisons = {};
            
            for (var n in detection){
                for (var b in detection){                    
                    if (b != n && !comparisons[n+b]){
                        console.log("comparing content from " + n + " and " + b);
                        comparisons[b+n] = true;
                        if (detection[b].loaded && detection[n].loaded && detection[b].content != detection[n].content){
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title : n + " and " + b + " received different content"
                            })
                        }
                    }
                }
            }
        },

        fetchHTMLDocument: function(browser, userAgent, analyseSummary) {
            var xhr = null;            
            
            var serverurl = (<any>VORLON.Core._messenger)._serverUrl;
            if (serverurl[serverurl.length-1] !== '/')
                serverurl = serverurl + "/";            
            var documentUrl = serverurl + "httpproxy/fetch?fetchurl=" + encodeURIComponent(analyseSummary.location.href) + "&fetchuseragent=" + encodeURIComponent(userAgent);
            console.log("getting HTML reference for " + browser + " " + documentUrl);

            try {

                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        console.log("received content for " + browser + " " + documentUrl + "(" + xhr.status + ")");

                        analyseSummary.pendingLoad--;
                        if (xhr.status == 200) {                            
                            analyseSummary.files.browserInterop[browser] = {
                                loaded: true, url : analyseSummary.location.href, userAgent : userAgent, status : xhr.status, content : xhr.responseText
                            }
                        }
                        else {
                            analyseSummary.files.browserInterop[browser] = {
                                loaded: false, url : analyseSummary.location.href, userAgent : userAgent, status : xhr.status, content : null, error :  xhr.statusText
                            }
                        }
                    }
                };

                xhr.open("GET", documentUrl, true);
                analyseSummary.pendingLoad++;
                xhr.send(null);
            } catch (e) {
                analyseSummary.pendingLoad--;
                console.error(e);
                analyseSummary.files.browserInterop[browser] = { loaded: false, url: analyseSummary.location.href, status: 0, content: null, error: e.message };
            }
        }
    }
}
