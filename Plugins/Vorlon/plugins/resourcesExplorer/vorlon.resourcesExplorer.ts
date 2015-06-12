module VORLON {
    export class KeyValue {
        public key: string;
        public value: string;
    }

    export class ResourcesExplorer extends Plugin {

        public localStorageList: KeyValue[] = [];
        public sessionStorageList: KeyValue[] = [];
        public cookiesList: KeyValue[] = [];

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
        public sendClientData(): void {
            // LOCAL STORAGE
            this.localStorageList = [];
            for (var i = 0; i < localStorage.length; i++) {
                this.localStorageList.push({ "key": localStorage.key(i), "value": localStorage.getItem(localStorage.key(i)) });
            }
            // SESSION STORAGE
            this.sessionStorageList = [];
            for (var i = 0; i < sessionStorage.length; i++) {
                this.sessionStorageList.push({ "key": sessionStorage.key(i), "value": sessionStorage.getItem(sessionStorage.key(i)) });
            }
            // COOKIES
            this.cookiesList = [];
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var keyValue = cookies[i].split('=');
                this.cookiesList.push({ "key": keyValue[0], "value": keyValue[1] });
            }

            var message: any = {};
            message.localStorageList = this.localStorageList;
            message.sessionStorageList = this.sessionStorageList;
            message.cookiesList = this.cookiesList;
            Core.Messenger.sendRealtimeMessage(this.getID(), message, RuntimeSide.Client, "message");
        }

        public startClientSide(): void {
            var that = this;
            window.onload = (event) => {
                that.sendClientData();
            };
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

        public refresh(): void {
            this.sendClientData();
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterPlugin(new ResourcesExplorer());
} 