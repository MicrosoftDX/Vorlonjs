module VORLON {
    export class ResourcesExplorerDashboard extends DashboardPlugin {
        constructor() {
            super("resourcesExplorer", "control.html", "control.css");
            this._ready = true;
        }

        public getID(): string {
            return "RESOURCES";
        }

        private _containerLocalStorage: HTMLElement;
        private _containerSessionStorage: HTMLElement;
        private _containerCookies: HTMLElement;
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div,(filledDiv) => {
                this._containerLocalStorage = Tools.QuerySelectorById(div, "localStorageList");
                this._containerSessionStorage = Tools.QuerySelectorById(div, "sessionStorageList");
                this._containerCookies = Tools.QuerySelectorById(div, "cookiesList");
            })
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
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

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new ResourcesExplorerDashboard());
} 