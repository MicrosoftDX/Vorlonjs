module VORLON {
    export class Plugin {
        public htmlFragmentUrl;
        public cssStyleSheetUrl;

        public loadingDirectory = "vorlon/plugins";
        public name;

        public _ready = true;
        protected _id = "";
        private _debug: boolean;
        public _type = PluginType.OneOne;
        public trace : (msg) => void;
        private traceLog = function(msg){ console.log(msg); };
        private traceNoop = function(msg){  };
        //public trace = function(msg){}

        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string) {
            this.name = name;
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
            this.debug = false;
        }

        public get Type(): PluginType {
            return this._type;
        }
        
        public get debug(): boolean {
            return this._debug;
        }
        
        public set debug(val: boolean) {
            this._debug = val;
            if (val){
                this.trace = this.traceLog;
            }else{
                this.trace = this.traceNoop;
            }
        }

        public getID(): string {
            return this._id;
        }

        public isReady() {
            return this._ready;
        }

        public startClientSide(): void { }
        public startDashboardSide(div: HTMLDivElement): void { }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void { }
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void { }

        public sendToClient(data: any){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Dashboard);
        }
        
        public sendToDashboard(data: any){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client);
        }
        
        public refresh(): void {
            console.error("Please override plugin.refresh()");
        }

        public _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void {
            var basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
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

        public _loadNewScriptAsync(scriptName: string, callback: () => void) {
            var basedUrl = "";
            if(this.loadingDirectory.indexOf('http') === 0){
                basedUrl = this.loadingDirectory + "/" + this.name + "/";
            }
            else{
                basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            }
            var scriptToLoad = document.createElement("script");
            scriptToLoad.setAttribute("src", basedUrl + scriptName);
            scriptToLoad.onload = callback;
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(scriptToLoad, first);
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
