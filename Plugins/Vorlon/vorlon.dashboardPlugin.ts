module VORLON {
    declare var vorlonBaseURL: string;

    export class DashboardPlugin extends BasePlugin {
        public htmlFragmentUrl;
        public cssStyleSheetUrl;

        public DashboardCommands: any;

        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string) {
            super(name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
            this.debug = Core.debug;
        }

        public startDashboardSide(div: HTMLDivElement): void { }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void { }

        public sendToClient(data: any){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard, "message");
        }

        public sendCommandToClient(command: string, data: any = null, incrementVisualIndicator: boolean = false) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to client ' + command);
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard, "message", incrementVisualIndicator, command);
            }
        }

        public sendCommandToPluginClient(pluginId: string, command: string, data: any = null, incrementVisualIndicator: boolean = false) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin client ' + command);
                Core.Messenger.sendRealtimeMessage(pluginId, data, RuntimeSide.Dashboard, "protocol", incrementVisualIndicator, command);
            }
        }              
        
        public sendCommandToPluginDashboard(pluginId : string, command: string, data: any = null, incrementVisualIndicator: boolean = false) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin dashboard ' + command);
                Core.Messenger.sendRealtimeMessage(pluginId, data, RuntimeSide.Client, "protocol", incrementVisualIndicator, command);
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
                        divContainer.innerHTML = this._stripContent(request.responseText);
                        var headID = document.getElementsByTagName("head")[0];
                        var cssNode = document.createElement('link');
                        cssNode.type = "text/css";
                        cssNode.rel = "stylesheet";
                        cssNode.href = basedUrl + this.cssStyleSheetUrl;
                        cssNode.media = "screen";
                        headID.appendChild(cssNode);

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
