module VORLON {
    export class ResourcesExplorerClient extends ClientPlugin {
        public localStorageList: KeyValue[] = [];
        public sessionStorageList: KeyValue[] = [];
        public cookiesList: KeyValue[] = [];

        constructor() {
            super("resourcesExplorer");
            this._ready = true;
        }

        public getID(): string {
            return "RESOURCES";
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
            this.sendCommandToDashboard(message);
        }

        public startClientSide(): void {
            var that = this;
            window.onload = (event) => {
                that.sendClientData();
            };
        }

        public refresh(): void {
            this.sendClientData();
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new ResourcesExplorerClient());
} 