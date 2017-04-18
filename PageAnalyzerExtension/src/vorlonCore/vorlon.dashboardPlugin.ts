window.browser = (function(){
  return  window.msBrowser      ||
          window.browser       ||
          window.chrome;
})();

module VORLON {
    export class DashboardPlugin extends BasePlugin {
        public htmlFragmentUrl;
        public cssStyleSheetUrl;

        public DashboardCommands: any;

        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string) {
            super(name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
        }

        public startDashboardSide(div: HTMLDivElement): void { }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void { }

        public sendToClient(data: any){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard, "message");
        }

        public sendCommandToClient(command: string, data: any = null) {
            if (Core.Messenger) {
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard, "message", command);
            }
        }
        
        public trace(message:string):void {
            console.log(message);
        }

        public _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void {
            var basedUrl = this.loadingDirectory + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }

            var request = new XMLHttpRequest();
            request.open('GET', browser.extension.getURL(basedUrl + this.htmlFragmentUrl), true);

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
