module VORLON {
    export interface NetworkEntry{
        id: string;
        url: string;
        status : number;
        statusText : string;
        method: string;
        responseType: string;
        responseHeaders : any;
        requestHeaders: any[];
        readyState: number;
    }
    
    export class XHRPanel extends Plugin {
        public hooked: boolean = false;
        public cache: Array<NetworkEntry> = [];
        constructor() {
            super("xhrPanel", "control.html", "control.css");
            this.debug = true;
            this._id = "XHRPANEL";
            this._ready = false;        
        }
            
        public refresh(): void {
            this.sendStateToDashboard();
        }

        public sendStateToDashboard() {
            this.sendCommandToDashboard('state', { hooked: this.hooked });
        }

        // This code will run on the client //////////////////////

        public startClientSide(): void {
            //this.setupXMLHttpRequestHook();
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {            
        }

        public setupXMLHttpRequestHook(){
            var plugin = this;
            if (plugin.hooked)
                return;

            plugin.trace('xhrPanel setup hook');
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
                plugin.cache.push(data);
                xhr.__open = xhr.open;
                xhr.__send = xhr.send;
                xhr.__setRequestHeader = xhr.setRequestHeader;
                
                //todo catch send to get posted data
                //see https://msdn.microsoft.com/en-us/library/hh772834(v=vs.85).aspx
                
                xhr.open = function(){
                    data.method = arguments[0];
                    data.url = arguments[1];
                    plugin.trace('request for ' + data.url);

                    plugin.sendCommandToDashboard('xhr', data);
                    
                     xhr.__open.apply(xhr, arguments);
                }
                
                xhr.setRequestHeader = function(){
                    var header = {
                        name : arguments[0],
                        value : arguments[1]
                    }
                    data.requestHeaders.push(header);
                    return xhr.__setRequestHeader.apply(xhr, arguments);
                }

                xhr.addEventListener('readystatechange', function(){
                    data.readyState = xhr.readyState;
                    plugin.trace('STATE CHANGED ' + data.readyState);

                    if (data.readyState === 4){
                        data.responseType = xhr.responseType;
                        data.status = xhr.status;    
                        data.statusText = xhr.statusText;
                        
                        if (xhr.getAllResponseHeaders)    
                            data.responseHeaders = xhr.getAllResponseHeaders();
                        
                        plugin.trace('LOADED !!!');
                    }
                    plugin.sendCommandToDashboard('xhr', data);
                });

                return xhr;
            }
            w.XMLHttpRequest = XmlHttpRequestProxy;
            plugin.hooked = true;
            plugin.sendStateToDashboard();
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
        
        private _mapAction(selector: string, onClick: (button: HTMLElement) => void) {
            var button = <HTMLElement>this._dashboardDiv.querySelector(selector);
            button.addEventListener("click", () => onClick(button));
            return button;
        }

        // This code will run on the dashboard //////////////////////
        
        public _itemsContainer: HTMLElement
        public _dashboardDiv: HTMLDivElement;
        public _clearButton: HTMLButtonElement;
        public _startStopButton: HTMLButtonElement;
        public _startStopButtonState: HTMLElement;
        public _dashboardItems: any;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;
            this._dashboardItems = {};
            this._insertHtmlContentAsync(div, (filledDiv) => {                
                this._itemsContainer = <HTMLElement>filledDiv.querySelector('.network-items');
                this._clearButton = <HTMLButtonElement>filledDiv.querySelector('x-action[event="clear"]');
                this._startStopButton = <HTMLButtonElement>filledDiv.querySelector('x-action[event="toggleState"]');
                this._startStopButtonState = <HTMLElement>filledDiv.querySelector('x-action[event="toggleState"]>i');
                this._clearButton.addEventListener('click',(arg) => {
                    this.sendCommandToClient('clear');
                    this._itemsContainer.innerHTML = '';
                    this._dashboardItems = {};
                });

                this._startStopButton.addEventListener('click',(arg) => {
                    if (!this._startStopButtonState.classList.contains('fa-spin')) {
                        this._startStopButtonState.classList.remove('fa-play');
                        this._startStopButtonState.classList.remove('fa-stop');
                        this._startStopButtonState.classList.remove('no-anim');

                        this._startStopButtonState.classList.add('fa-spin');
                        this._startStopButtonState.classList.add('fa-spinner');
                        if (this.hooked) {
                            this.sendCommandToClient('stop');
                        } else {
                            this.sendCommandToClient('start');
                        }
                    }
                });
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
        
        public processNetworkItem(item: NetworkEntry){
            var storedItem = <NetworkItemCtrl>this._dashboardItems[item.id];
            if (!storedItem){
                storedItem = new NetworkItemCtrl(this._itemsContainer, item);
                this._dashboardItems[item.id] = storedItem;
            }
            storedItem.update(item);
        } 
    }

    XHRPanel.prototype.ClientCommands = {
        start: function (data: any) {
            var plugin = <XHRPanel>this;
            plugin.setupXMLHttpRequestHook();
        },
        stop: function (data: any) {
            var plugin = <XHRPanel>this;
            plugin.removeXMLHttpRequestHook();
        },
        getState: function (data: any) {
            var plugin = <XHRPanel>this;
            plugin.sendCommandToDashboard('state', { hooked: plugin.hooked });
        },
        clear: function (data: any) {
            var plugin = <XHRPanel>this;
            plugin.cache = [];
        }
    };

    XHRPanel.prototype.DashboardCommands = {
        state: function (data: any) {
            var plugin = <XHRPanel>this;
            plugin.hooked = data.hooked;
            plugin._startStopButtonState.classList.remove('fa-spin');
            plugin._startStopButtonState.classList.remove('fa-spinner');
            if (plugin.hooked) {
                plugin._startStopButtonState.classList.remove('fa-play');
                plugin._startStopButtonState.classList.add('fa-stop'); 
                plugin._startStopButtonState.classList.add('no-anim');
            } else {
                plugin._startStopButtonState.classList.remove('fa-stop');
                plugin._startStopButtonState.classList.add('fa-play');
                plugin._startStopButtonState.classList.add('no-anim');
            }
        },
        xhr: function (data: any) {
            var plugin = <XHRPanel>this;
            plugin.processNetworkItem(<NetworkEntry>data);
        }
    };
    
    class NetworkItemCtrl {
            element : HTMLElement;
            statusElt : HTMLElement;
            responseTypeElt : HTMLElement;
            item: NetworkEntry;
            
            constructor(parent: HTMLElement, item: NetworkEntry){
                this.item = item;
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
                this.item = item;
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
    Core.RegisterPlugin(new XHRPanel());
}
