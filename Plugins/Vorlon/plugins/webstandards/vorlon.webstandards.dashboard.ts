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
        private _outputDiv: HTMLElement;
        private _currentAnalyse = null;        

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._outputDiv = <HTMLElement>filledDiv.querySelector('#output');


                // Send message to client when user types and hits return
                this._startCheckButton.addEventListener("click", (evt) => {
                    this._currentAnalyse = {};
                    this.sendCommandToClient('startNewAnalyse');
                    
                });
            })
        }

        receiveHtmlContent(data : { html: string}){
            console.log('received html from client ', data.html);
            var fragment = document.implementation.createHTMLDocument("analyse");
            fragment.documentElement.innerHTML = data.html;
            
            this._currentAnalyse.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            for (var i=0; i<scripts.length ; i++){
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src){
                    this._currentAnalyse.scripts[src.value] = {};
                    console.log("found script " + src.value);
                }
            }
            
            this._currentAnalyse.stylesheets = {};
            var stylesheets = fragment.querySelectorAll("link[rel=stylesheet]");
            for (var i=0; i<stylesheets.length ; i++){
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href){
                    this._currentAnalyse.stylesheets[href.value] = {};
                    console.log("found stylesheet " + href.value);
                }
            }
        }
    }
    
    WebStandardsDashboard.prototype.DashboardCommands = {
        htmlContent : function(data:any){
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveHtmlContent(data);
        },
        
        analyseEnded: function (data: any) {
            var plugin = <WebStandardsDashboard>this;
            //
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new WebStandardsDashboard());
}
