module VORLON {
    export class WebStandardsClient extends ClientPlugin {
        public sendedHTML : string;
        public browserDetectionHook = {
            userAgent : [],
            appVersion : [],
            appName: [],
            product: [],
            vendor: [],
        };
        
        constructor() {
            super("webstandards");
            this._id = "WEBSTANDARDS";
            this._ready = true;
            //this.debug = true;            
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        }

        // Start the clientside code
        public startClientSide(): void {
            this.hook(window.navigator, "userAgent");
            this.hook(window.navigator, "appVersion");
            this.hook(window.navigator, "appName");
            this.hook(window.navigator, "product");
            this.hook(window.navigator, "vendor");            
        }
        
        public hook(root, prop){
            VORLON.Tools.HookProperty(root, prop, (stack) => {
                this.trace("browser detection " + stack.file);
                this.trace(stack.stack);
                if (stack.file){
                    if (stack.file.indexOf("vorlon.max.js") >= 0 || stack.file.indexOf("vorlon.min.js") >= 0 || stack.file.indexOf("vorlon.js") >= 0){
                        this.trace("skip browser detection access " + stack.file)
                        
                        return;
                    }
                }
                this.browserDetectionHook[prop].push(stack);
            });
        }
        
        public startNewAnalyse(): void {
            var allHTML = document.documentElement.outerHTML;
            this.sendedHTML = allHTML;
            
            var doctype : any;            
            var node = document.doctype;
            
            if (node){
                var doctypeHtml = "<!DOCTYPE "
                + node.name
                + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                + (!node.publicId && node.systemId ? ' SYSTEM' : '') 
                + (node.systemId ? ' "' + node.systemId + '"' : '')
                + '>';
                doctype = {
                    html : doctypeHtml,
                    name : node.name,
                    publicId : node.publicId,
                    systemId : node.systemId
                }
            }
            
            this.sendCommandToDashboard("htmlContent", { html : allHTML, doctype: doctype, url : window.location, browserDetection : this.browserDetectionHook });
        }
        
        public fetchDocument(data: { url : string }){
            var xhr = null;
            if (!data || !data.url){
                this.trace("invalid fetch request");
                return;                
            }
            
            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0){
                documentUrl = window.location.protocol + documentUrl;
            }
            if (documentUrl.indexOf("http") === 0){
                //external resources may not have Access Control headers, we make a proxied request to prevent CORS issues
                var serverurl = (<any>VORLON.Core._messenger)._serverUrl;
                if (serverurl[serverurl.length-1] !== '/')
                    serverurl = serverurl + "/";
                var target = this.getAbsolutePath(data.url);
                documentUrl = serverurl + "httpproxy/fetch?fetchurl=" + encodeURIComponent(target);
            }
            this.trace("fetching " + documentUrl);
                
            try {
           
                xhr = new XMLHttpRequest(); 
                xhr.onreadystatechange = () => { 
                    if(xhr.readyState == 4)
                    {
                        if(xhr.status == 200)
                        { 
                            var encoding = xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            this.trace("encoding for " + documentUrl + " is " + encoding);
                            //TODO getting encoding is not working in IE (but do in Chrome), must try on other browsers because getting it may enable performance rules
                            this.sendCommandToDashboard("documentContent", { url : data.url, status : xhr.status, content : xhr.responseText, contentLength: contentLength, encoding : encoding });
                        } 
                        else  {
                            this.sendCommandToDashboard("documentContent", { url : data.url, status : xhr.status, content : null, error :  xhr.statusText });
                        } 
                    } 
                };
                
                xhr.open("GET", documentUrl, true);                
                xhr.send(null); 
            } catch(e) {
                console.error(e); 
                this.sendCommandToDashboard("documentContent", { url : data.url, status : 0, content : null, error : e.message });
            }
        }    
        
        public getAbsolutePath(url){
            var a = document.createElement('a');
            a.href = url;
            return a.href;
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
