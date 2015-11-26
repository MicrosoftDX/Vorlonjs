module VORLON.WebStandards.Rules.DOM {
    export var browserinterop = <IDOMRule>{
        id: "webstandards.avoid-browser-specific-content",
        title: "avoid browser specific content",
        description: "Avoid serving content based on user-agent. Browsers evolve fast and user-agent based content may frustrate your users by not getting the best content for their preferred browser.",
        nodeTypes: ["#comment"],

        userAgents: {
            "Microsoft Edge": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240',
            "Microsoft IE11": 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko',
            "Google Chrome": 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
            "Firefox": 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0'
        },

        prepare: function(rulecheck: IRuleCheck, analyzeSummary) {
            rulecheck.items = rulecheck.items || [];
            rulecheck.type = "blockitems";
            analyzeSummary.files.browserInterop = {};

            var serverurl = (<any>VORLON.Core)._messenger._serverUrl;
            if (!serverurl){
                console.warn('no Vorlon server url for browser interop', (<any>VORLON.Core)._messenger);
                return;
            }
            
            if (serverurl[serverurl.length - 1] !== '/')
                serverurl = serverurl + "/";
                
            for (var n in this.userAgents) {
                this.fetchHTMLDocument(serverurl, n, this.userAgents[n], analyzeSummary);
            }
        },

        check: function(node: Node, rulecheck: IRuleCheck, analyzeSummary: any, htmlString: string) {

        },

        endcheck: function(rulecheck: IRuleCheck, analyzeSummary: any) {
            var detection = analyzeSummary.files.browserInterop;
            var comparisons = {};

            for (var n in detection) {
                for (var b in detection) {
                    if (b != n && !comparisons[n + b]) {
                        //console.log("comparing content from " + n + " and " + b);
                        comparisons[b + n] = true;
                        if (detection[b].loaded && detection[n].loaded && detection[b].content != detection[n].content) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: n + " and " + b + " received different content"
                            })
                        }
                    }
                }
            }
        },

        fetchHTMLDocument: function(serverurl, browser, userAgent, analyzeSummary) {
            var xhr = null;
            var timeoutRef = null;
            var completed = false;
            
            var documentUrl = serverurl + "httpproxy/fetch?fetchurl=" + encodeURIComponent(analyzeSummary.location) + "&fetchuseragent=" + encodeURIComponent(userAgent);
            //console.log("getting HTML reference for " + browser + " " + documentUrl);

            try {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        completed = true;
                        clearTimeout(timeoutRef);
                        analyzeSummary.pendingLoad--;
                        //console.log("received content for " + browser + "(" + xhr.status + ") " + analyzeSummary.pendingLoad);
                        if (xhr.status == 200) {
                            analyzeSummary.files.browserInterop[browser] = {
                                loaded: true, url: analyzeSummary.location.href, userAgent: userAgent, status: xhr.status, content: xhr.responseText
                            }
                        }
                        else {
                            analyzeSummary.files.browserInterop[browser] = {
                                loaded: false, url: analyzeSummary.location.href, userAgent: userAgent, status: xhr.status, content: null, error: xhr.statusText
                            }
                        }
                    }
                };

                xhr.open("GET", documentUrl, true);
                analyzeSummary.pendingLoad++;
                xhr.send(null);
                //console.log("request file " + browser + " " + analyzeSummary.pendingLoad);
                timeoutRef = setTimeout(() => {
                    if (!completed) {
                        completed = true;
                        analyzeSummary.pendingLoad--;
                        console.warn("fetch timeout for " + browser);
                        xhr.abort();
                        analyzeSummary.files.browserInterop[browser] = {
                            loaded: false, url: analyzeSummary.location.href, userAgent: userAgent, status: xhr.status, content: null, error: "timeout"
                        }
                    }
                }, 20 * 1000);
                
            } catch (e) {
                analyzeSummary.pendingLoad--;
                console.error(e);
                console.warn("received error for " + browser + "(" + xhr.status + ") " + analyzeSummary.pendingLoad);
                analyzeSummary.files.browserInterop[browser] = { loaded: false, url: analyzeSummary.location.href, status: 0, content: null, error: e.message };
            }
        }
    }
}
