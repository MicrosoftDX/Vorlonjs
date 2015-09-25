module VORLON {
    export class WebStandardsClient extends ClientPlugin {
        public sendedHTML : string;
        
        constructor() {
            super("webstandards");
            this._id = "WEBSTANDARDS";
            this._ready = true;
            //this.debug = true;
            console.log('Web Standards started');
        }


        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        }

        // Start the clientside code
        public startClientSide(): void {
            
        }
        
        public startNewAnalyse(): void {
            var allHTML = document.documentElement.outerHTML;
            this.sendedHTML = allHTML;
            this.sendCommandToDashboard("htmlContent", { html : allHTML });
        }
        
        private getStyleSheets(){
            var stylesheets = document.querySelectorAll("link[rel=stylesheet]");
            
        }
        
        private getScripts(){
            
        }
    }
    
    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyse: function (data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.startNewAnalyse();
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new WebStandardsClient());
}
