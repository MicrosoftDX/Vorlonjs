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

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("networkpanel", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "NETWORKPANEL";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard

            //we don't really need to do anything in this sample
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {
            this.setupXMLHttpRequestHook(true);
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            console.log('Got message from sample plugin', receivedObject.message);
            //The dashboard will send us an object like { message: 'hello' }
            //Let's just return it, reversed
            var data = {
                message: receivedObject.message.split("").reverse().join("")
            };

            //Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "xhrcall", true);

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
                    if (debug) 
                        console.log('request for ' + data.url);

                    Core.Messenger.sendRealtimeMessage(plugin.getID(), { type:'xhr', message: data}, RuntimeSide.Client);
                    return xhr.__open.apply(xhr, arguments);
                }

                xhr.addEventListener('readystatechange', function(){
                    data.readyState = xhr.readyState;
                    if (debug) 
                        console.log('STATE CHANGED ' + data.readyState);

                    if (data.readyState === 4){
                        data.responseType = xhr.responseType;
                        data.status = xhr.status;    
                        data.statusText = xhr.statusText;    
                        if (debug) 
                            console.log('LOADED !!!');
                    }
                    Core.Messenger.sendRealtimeMessage(plugin.getID(), { type:'xhr', message: data}, RuntimeSide.Client);
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

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard
        private _itemsContainer: HTMLElement
        private _dashboardDiv: HTMLDivElement;
        private _items: any;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;
            this._items = {};
            this._insertHtmlContentAsync(div, (filledDiv) => {                
                this._itemsContainer = <HTMLElement>filledDiv.querySelector('.network-items');
            });
        }

        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === 'xhr'){
                var item = <NetworkEntry>receivedObject.message;
                this.processNetworkItem(item);
            }
            console.log(receivedObject.message);
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
            
            constructor(parent: HTMLElement, item: NetworkEntry){
                this.element = document.createElement('DIV');
                this.element.className = 'network-item';
                this.element.innerText = item.url;
                parent.appendChild(this.element);    
            }
            
            update(item:NetworkEntry){
                
            }
        }

    //Register the plugin with vorlon core
    Core.RegisterPlugin(new NetworkPanel());
}
