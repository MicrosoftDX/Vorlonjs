module VORLON {
    export class ResourcesExplorerDashboard extends DashboardPlugin {
        constructor() {
            super("resourcesExplorer", "control.html", "control.css");
            this._ready = false;
            this._id = "RESOURCES";
            //this.debug = true;
        }

        private _containerLocalStorage: HTMLElement;
        private _containerSessionStorage: HTMLElement;
        private _containerCookies: HTMLElement;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerLocalStorage = Tools.QuerySelectorById(div, "localStorageList");
                this._containerSessionStorage = Tools.QuerySelectorById(div, "sessionStorageList");
                this._containerCookies = Tools.QuerySelectorById(div, "cookiesList");
                this._ready = true;
            })
        }

        public processEntries(receivedObject: any): void {
            if (!this._containerLocalStorage){
                console.warn("ResourcesExplorer dashboard receive client message but is not ready");
                return;
            }     
            
            this._containerLocalStorage.innerHTML = "";
            this._containerSessionStorage.innerHTML = "";
            this._containerCookies.innerHTML = "";
            
            if (!receivedObject)
                return;

            if (receivedObject.localStorageList) {
                for (var i = 0; i < receivedObject.localStorageList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');

                    tdKey.innerHTML = receivedObject.localStorageList[i].key;
                    tdValue.innerHTML = receivedObject.localStorageList[i].value;

                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerLocalStorage.appendChild(tr);
                }
            }

            if (receivedObject.sessionStorageList) {
                for (var i = 0; i < receivedObject.sessionStorageList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');

                    tdKey.innerHTML = receivedObject.sessionStorageList[i].key;
                    tdValue.innerHTML = receivedObject.sessionStorageList[i].value;

                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerSessionStorage.appendChild(tr);
                }
            }

            if (receivedObject.cookiesList) {
                for (var i = 0; i < receivedObject.cookiesList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');

                    tdKey.innerHTML = receivedObject.cookiesList[i].key;
                    tdValue.innerHTML = receivedObject.cookiesList[i].value;

                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerCookies.appendChild(tr);
                }
            }
        }
    }

    ResourcesExplorerDashboard.prototype.DashboardCommands = {
        resourceitems: function(data: any) {
            var plugin = <ResourcesExplorerDashboard>this;
            plugin.processEntries(data);
        }
    };
    
    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new ResourcesExplorerDashboard());
} 