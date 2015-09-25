module VORLON {
    export class WebStandardsClient extends ClientPlugin {
        public sendedHTML : string;
        
        constructor() {
            super("webstandards");
            this._id = "WEBSTANDARDS";
            this._ready = true;
            this.debug = true;
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
        
        public fetchDocument(data: { url : string }){
            var xhr = null;
            if (!data || !data.url){
                this.trace("invalid fetch request");
                return;                
            }
            
            this.trace("fetching " + data.url);
            try
            {
                xhr = new XMLHttpRequest(); 
                xhr.onreadystatechange = () => { 
                    if(xhr.readyState == 4)
                    {
                        if(xhr.status == 200)
                        { 
                            this.sendCommandToDashboard("documentContent", { url : data.url, status : xhr.status, content : xhr.responseText });
                        } 
                        else 
                        { 
                            this.sendCommandToDashboard("documentContent", { url : data.url, status : xhr.status, content : null, error :  xhr.statusText });
                        } 
                    } 
                };
                xhr.open("GET", data.url, true);                
                xhr.send(null); 
            } catch(e)
            { 
                this.sendCommandToDashboard("documentContent", { url : data.url, status : 0, content : null, error : e.message });
            }
        }                    
    }
    
    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyse: function (data: any) {
            var plugin = <WebStandardsClient>this;
            plugin.startNewAnalyse();
        },
        
        fetchDocument : function(data: any){
            var plugin = <WebStandardsClient>this;
            plugin.fetchDocument(data);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new WebStandardsClient());
}
