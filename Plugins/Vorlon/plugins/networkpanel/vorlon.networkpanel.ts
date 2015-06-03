module VORLON {
    interface NetworkEntry{
        id: string;
        url: string;
        status : number;
        statusText : string;
        method: string;
        responseType: string;
        readyState: number;
    }
    
    export class NetworkPanel extends Plugin {
        constructor() {
            //     name   ,  html for dash   css for dash
            super("networkpanel", "control.html", "control.css");
            this._id = "NETWORKPANEL";
            this._ready = false;        
        }

        public refresh(): void {
        }

        // This code will run on the client //////////////////////

        public startClientSide(): void {
            this.setupXMLHttpRequestHook(true);
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            
        }

        public setupXMLHttpRequestHook(debug){
            var plugin = this;
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
                    readyState: 0,
                }
                xhr.__open = xhr.open;
                xhr.open = function(){
                    data.method = arguments[0];
                    data.url = arguments[1];
                    plugin.trace('request for ' + data.url);

                    plugin.sendToDashboard({ type:'xhr', message: data});
                    return xhr.__open.apply(xhr, arguments);
                }

                xhr.addEventListener('readystatechange', function(){
                    data.readyState = xhr.readyState;
                    plugin.trace('STATE CHANGED ' + data.readyState);

                    if (data.readyState === 4){
                        data.responseType = xhr.responseType;
                        data.status = xhr.status;    
                        data.statusText = xhr.statusText;    
                        plugin.trace('LOADED !!!');
                    }
                    plugin.sendToDashboard({ type:'xhr', message: data});
                });

                return xhr;
            }
            w.XMLHttpRequest = XmlHttpRequestProxy;
        }

        private _render(tagname: string, parentNode:HTMLElement, classname?:string, value?: string): HTMLElement {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        }
        
        private _mapAction(selector: string, onClick: (button: HTMLElement) => void) {
            var button = <HTMLElement>this._dashboardDiv.querySelector(selector);
            button.addEventListener("click", () => onClick(button));
            return button;
        }

        // This code will run on the dashboard //////////////////////

        private _itemsContainer: HTMLElement
        private _dashboardDiv: HTMLDivElement;
        private _items: any;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;
            this._items = {};
            this._insertHtmlContentAsync(div, (filledDiv) => {                
                this._itemsContainer = <HTMLElement>filledDiv.querySelector('.network-items');
                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === 'xhr'){
                var item = <NetworkEntry>receivedObject.message;
                this.processNetworkItem(item);
            }
            this.trace(receivedObject.message);
        }
        
        private processNetworkItem(item: NetworkEntry){
            var storedItem = <NetworkItemCtrl>this._items[item.id];
            if (!storedItem){
                storedItem = new NetworkItemCtrl(this._itemsContainer, item);
                this._items[item.id] = storedItem;
            }
            storedItem.update(item);
        } 
    }
    
    class NetworkItemCtrl {
            element : HTMLElement;
            statusElt : HTMLElement;
            responseTypeElt : HTMLElement;
            
            constructor(parent: HTMLElement, item: NetworkEntry){
                this.element = new VORLON.FluentDOM('DIV', 'network-item')
                    .append('DIV', 'description', (fdDesc) => {
                        fdDesc.append('DIV', 'status item smallitem', (fdStatus) => { 
                            this.statusElt = fdStatus.element;
                            fdStatus.html('<i class="fa fa-spin fa-spinner"></i>'); 
                        })
                        .append('DIV', 'method item smallitem', (fdMethod) => { 
                            fdMethod.text(item.method.toUpperCase()); 
                        })
                        .append('DIV', 'url item', (fdUrl) => { 
                            fdUrl.text(item.url) 
                        })                    
                    })
                    .append('DIV', 'details', (fdDesc) => {
                        fdDesc.append('DIV', 'responsetype', (fdResponseType) => { 
                            this.responseTypeElt = fdResponseType.element;
                            fdResponseType.html('&nbsp;'); 
                        })
                    })
                    
                    .element;
                parent.appendChild(this.element);    
            }
            
            update(item:NetworkEntry){
                if (item.readyState === 4){
                    if (item.status !== 200){
                        this.element.classList.add('error');
                    }
                    this.statusElt.innerText = item.status.toString();
                    this.responseTypeElt.innerText = 'response type : ' + (item.responseType || 'text');
                }
            }
        }

    //Register the plugin with vorlon core
    Core.RegisterPlugin(new NetworkPanel());
}
