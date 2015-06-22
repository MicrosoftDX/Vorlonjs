module VORLON {

    export class XHRPanelDashboard extends DashboardPlugin {
        public hooked: boolean = false;
        public cache: Array<NetworkEntry> = [];
        public _itemsContainer: HTMLElement
        public _dashboardDiv: HTMLDivElement;
        public _clearButton: HTMLButtonElement;
        public _startStopButton: HTMLButtonElement;
        public _startStopButtonState: HTMLElement;
        public _dashboardItems: any;

        constructor() {
            super("xhrPanel", "control.html", "control.css");
            this._id = "XHRPANEL";
            this._ready = false;        
        }
            
        private _mapAction(selector: string, onClick: (button: HTMLElement) => void) {
            var button = <HTMLElement>this._dashboardDiv.querySelector(selector);
            button.addEventListener("click", () => onClick(button));
            return button;
        }
        
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

    XHRPanelDashboard.prototype.DashboardCommands = {
        state: function (data: any) {
            var plugin = <XHRPanelDashboard>this;
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
            var plugin = <XHRPanelDashboard>this;
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
    Core.RegisterDashboardPlugin(new XHRPanelDashboard());
}
