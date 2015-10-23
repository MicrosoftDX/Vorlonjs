module VORLON {
    export class ResourcesExplorerClient extends ClientPlugin {
        public localStorageList: KeyValue[] = [];
        public sessionStorageList: KeyValue[] = [];
        public cookiesList: KeyValue[] = [];

        constructor() {
            super("resourcesExplorer");
            this._ready = true;
            this._id = "RESOURCES";
            //this.debug = true;
            
            window.addEventListener("load", () => {
                this.sendClientData();
            });
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
            this.sendCommandToDashboard("resourceitems", message);
        }

        public refresh(): void {
            this.sendClientData();
        }
    }
    
    ResourcesExplorerClient.prototype.ClientCommands = {
        refresh: function (data: any) {
            var plugin = <ResourcesExplorerClient>this;
            plugin.refresh();
        }
    };

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new ResourcesExplorerClient());
} 