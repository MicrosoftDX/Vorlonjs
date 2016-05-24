module VORLON {
    declare var vorlonBaseURL: string;
    declare var $: any;
    
    export class DashboardPlugin extends BasePlugin {
        public htmlFragmentUrl;
        public cssStyleSheetUrl;
        public JavascriptSheetUrl;

        public DashboardCommands: any;

        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl?: (string | string[]), JavascriptSheetUrl?: (string | string[])) {
            super(name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = (cssStyleSheetUrl instanceof Array) ? cssStyleSheetUrl : (typeof cssStyleSheetUrl === 'undefined') ? [] : [cssStyleSheetUrl];
            this.JavascriptSheetUrl = (JavascriptSheetUrl instanceof Array) ? JavascriptSheetUrl : (typeof JavascriptSheetUrl === 'undefined') ? [] : [JavascriptSheetUrl];
            this.debug = Core.debug;
        }

        public startDashboardSide(div: HTMLDivElement): void { }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void { }

        public sendToClient(data: any){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard, "message");
        }

        public sendCommandToClient(command: string, data: any = null) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to client ' + command);
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard, "message", command);
            }
        }

        public sendCommandToPluginClient(pluginId: string, command: string, data: any = null) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin client ' + command);
                Core.Messenger.sendRealtimeMessage(pluginId, data, RuntimeSide.Dashboard, "protocol", command);
            }
        }              
        
        public sendCommandToPluginDashboard(pluginId : string, command: string, data: any = null) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin dashboard ' + command);
                Core.Messenger.sendRealtimeMessage(pluginId, data, RuntimeSide.Client, "protocol", command);
            }
        }

        public _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void {
            var basedUrl = vorlonBaseURL + "/" + this.loadingDirectory + "/" + this.name + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }

            var request = new XMLHttpRequest();
            request.open('GET', basedUrl + this.htmlFragmentUrl, true);

            request.onreadystatechange = (ev: Event) => {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var headID = document.getElementsByTagName("head")[0];
                        for (var i = 0; i < this.cssStyleSheetUrl.length; i++) {
                            var cssNode = document.createElement('link');
                            cssNode.type = "text/css";
                            cssNode.rel = "stylesheet";
                            cssNode.href = basedUrl + this.cssStyleSheetUrl[i];
                            cssNode.media = "screen";
                            headID.appendChild(cssNode);
                        }
                        
                        for (var i = 0; i < this.JavascriptSheetUrl.length; i++) {
                            var jsNode = document.createElement('script');
                            jsNode.type = "text/javascript";
                            jsNode.src = basedUrl + this.JavascriptSheetUrl[i];
                            headID.appendChild(jsNode);
                        }
                        
                        divContainer.innerHTML = this._stripContent(request.responseText);
                        if($(divContainer).find('.split').length && $(divContainer).find('.split').is(":visible") && !$(divContainer).find('.vsplitter').length) {
                            $(divContainer).find('.split').split({
                                orientation: $(divContainer).find('.split').data('orientation'),
                                limit: $(divContainer).find('.split').data('limit'),
                                position: $(divContainer).find('.split').data('position'),
                            });                      
                        }

                        var firstDivChild = <HTMLDivElement>(divContainer.children[0]);

                        if (alone) {
                            firstDivChild.className = "alone";
                        }

                        callback(firstDivChild);
                    } else { // Failed
                        throw new Error("Error status: " + request.status + " - Unable to load " + basedUrl + this.htmlFragmentUrl);
                    }
                }
            };
            request.send(null);
        }

        private _stripContent(content): string {
            // in case of SVG injection
            var xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im;
            // for HTML content
            var bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;

            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            }
            return content;
        }
    }
}
