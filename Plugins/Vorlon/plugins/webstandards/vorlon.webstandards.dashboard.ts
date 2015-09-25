module VORLON {
    export class WebStandardsDashboard extends DashboardPlugin {
        constructor() {
            //     name   ,  html for dash   css for dash
            super("webstandards", "control.html", "control.css");
            this._id = "WEBSTANDARDS";
            this.debug = true;
            this._ready = true;
            console.log('Started');
        }

        private _startCheckButton: HTMLButtonElement;
        private _rootDiv: HTMLElement;
        private _currentAnalyse = null;        
        private _refreshloop : any;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._rootDiv = <HTMLElement>filledDiv;

                // Send message to client when user types and hits return
                this._startCheckButton.addEventListener("click", (evt) => {
                    this._currentAnalyse = { processing: true };
                    this._rootDiv.classList.add("loading");
                    this.sendCommandToClient('startNewAnalyse');
                });

                this._refreshloop = setInterval(() => {
                    this.checkLoadingState();
                }, 3000);
            });
        }
        
        checkLoadingState(){
            if (!this._currentAnalyse || this._currentAnalyse.ended){
                return;                
            }
            
            if (this._currentAnalyse.processing){           
                             
            } else {
                this._rootDiv.classList.remove("loading");
                this._currentAnalyse.ended = true;
            }
        }

        receiveHtmlContent(data : { html: string}){
            if (!this._currentAnalyse){
                this._currentAnalyse =  { processing : true };
            }
            
            console.log('received html from client ', data.html);
            var fragment = document.implementation.createHTMLDocument("analyse");
            fragment.documentElement.innerHTML = data.html;
            this._currentAnalyse.pendingLoad = 0;
            
            this._currentAnalyse.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            for (var i=0; i<scripts.length ; i++){
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src){
                    this._currentAnalyse.scripts[src.value] = { loaded : false, content : null };
                    console.log("found script " + src.value);
                    this.sendCommandToClient('fetchDocument', { url: src.value });
                    this._currentAnalyse.pendingLoad++;
                }
            }
            
            this._currentAnalyse.stylesheets = {};
            var stylesheets = fragment.querySelectorAll("link[rel=stylesheet]");
            for (var i=0; i<stylesheets.length ; i++){
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href){
                    this._currentAnalyse.stylesheets[href.value] = { loaded : false, content : null };
                    console.log("found stylesheet " + href.value);
                    this.sendCommandToClient('fetchDocument', { url: href.value });
                    this._currentAnalyse.pendingLoad++;
                }
            }
        }
        
        receiveDocumentContent(data: { url:string, content: string, error?:string, status : number }){
            console.log("document loaded " + data.url + " " + data.status);
            var item = null;
            if (this._currentAnalyse.stylesheets[data.url]){
                item = this._currentAnalyse.stylesheets[data.url];                
            }
            if (this._currentAnalyse.scripts[data.url]){
                item = this._currentAnalyse.scripts[data.url];                
            }
            
            if (item){
                this._currentAnalyse.pendingLoad--;
                item.loaded = true;
                item.content = data.content;
                
                if (this._currentAnalyse.pendingLoad == 0){
                    this._currentAnalyse.processing = false;
                }
            }
        }
    }
    
    WebStandardsDashboard.prototype.DashboardCommands = {
        htmlContent : function(data:any){
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveHtmlContent(data);
        },
        
        documentContent: function (data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveDocumentContent(data);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new WebStandardsDashboard());
}
