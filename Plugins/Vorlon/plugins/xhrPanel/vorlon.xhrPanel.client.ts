module VORLON {

    export class XHRPanelClient extends ClientPlugin {
        public hooked: boolean = false;
        public cache: Array<NetworkEntry> = [];

        constructor() {
            super("xhrPanel");
            this._id = "XHRPANEL";
            this._ready = false;        
        }
            
        public refresh(): void {
            this.sendStateToDashboard();
            this.sendCacheToDashboard();
        }

        public sendStateToDashboard() {
            this.sendCommandToDashboard('state', { hooked: this.hooked });
        }

        public sendCacheToDashboard() {
            for (var i = 0, l = this.cache.length; i < l; i++) {
                this.sendCommandToDashboard('xhr', this.cache[i]);
            }
        }

        public clearClientCache() {
            this.cache = [];
        }

        // This code will run on the client //////////////////////

        public startClientSide(): void {
            //this.setupXMLHttpRequestHook();
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {            
        }

        public setupXMLHttpRequestHook(){
            var that = this;
            var w = <any>window;
            w.___XMLHttpRequest = w.XMLHttpRequest;
            var XmlHttpRequestProxy = function() {
                var xhr = new w.___XMLHttpRequest();
                var data = {
                    id: VORLON.Tools.CreateGUID(),
                    url: null,
                    status : null,
                    statusText : null,
                    method: null,
                    responseType: null,
                    responseHeaders : null,
                    requestHeaders : [],
                    readyState: 0,
                }
                that.cache.push(data);
                xhr.__open = xhr.open;
                xhr.__send = xhr.send;
                xhr.__setRequestHeader = xhr.setRequestHeader;
                
                //todo catch send to get posted data
                //see https://msdn.microsoft.com/en-us/library/hh772834(v=vs.85).aspx
                
                xhr.open = function() {
                    data.method = arguments[0];
                    data.url = arguments[1];
                    that.trace('request for ' + data.url);
                    that.sendCommandToDashboard('xhr', data);
                    
                    xhr.__open.apply(xhr, arguments);
                    return xhr.__open.apply(xhr, arguments);
                }
                
                xhr.setRequestHeader = function() {
                    var header = {
                        name : arguments[0],
                        value : arguments[1]
                    }
                    data.requestHeaders.push(header);
                    return xhr.__setRequestHeader.apply(xhr, arguments);
                }

                xhr.addEventListener('readystatechange', () => {
                    data.readyState = xhr.readyState;
                    that.trace('STATE CHANGED ' + data.readyState);

                    if (data.readyState === 4){
                        data.responseType = xhr.responseType;
                        data.status = xhr.status;    
                        data.statusText = xhr.statusText;
                        
                        if (xhr.getAllResponseHeaders)    
                            data.responseHeaders = xhr.getAllResponseHeaders();
                        
                        that.trace('LOADED !!!');
                    }
                    that.sendCommandToDashboard('xhr', data);
                });

                return xhr;
            }
            w.XMLHttpRequest = XmlHttpRequestProxy;
            this.hooked = true;
            this.sendStateToDashboard();
        }

        public removeXMLHttpRequestHook() {
            if (this.hooked) {
                this.trace('xhrPanel remove hook');
                var w = <any>window;
                w.XMLHttpRequest = w.___XMLHttpRequest;
                this.hooked = false;
                this.sendStateToDashboard();
            }
        }

        private _render(tagname: string, parentNode:HTMLElement, classname?:string, value?: string): HTMLElement {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        }
    }

    XHRPanelClient.prototype.ClientCommands = {
        start: function (data: any) {
            var plugin = <XHRPanelClient>this;
            plugin.setupXMLHttpRequestHook();
        },
        stop: function (data: any) {
            var plugin = <XHRPanelClient>this;
            plugin.removeXMLHttpRequestHook();
        },
        getState: function (data: any) {
            var plugin = <XHRPanelClient>this;
            plugin.sendStateToDashboard();
        },
        clear: function (data: any) {
            var plugin = <XHRPanelClient>this;
            plugin.clearClientCache();
        }
    };
    
    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new XHRPanelClient());
}
