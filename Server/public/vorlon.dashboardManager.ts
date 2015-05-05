/// <reference path="../Scripts/typings/vorlon/vorlon.core.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.clientMessenger.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.plugin.d.ts" /> 
module VORLON {
    export class DashboardManager {
        private _catalogUrl: string = "/catalog.json";
        static ListenClientid: string;
        static ListenClientDisplayid: string;
        static SessionId: string;
        static ClientList: Array<any>;

        constructor(sessionid: string, listenClientid: string) {
            DashboardManager.SessionId = sessionid;
            DashboardManager.ListenClientid = listenClientid;
            DashboardManager.ClientList = new Array<any>();
            DashboardManager.RefreshClients();
            this.loadPlugins();
        }

        static UpdateClientInfo() {
            document.querySelector('[data-hook~=session-id]').textContent = DashboardManager.SessionId;
            for (var i = 0; i < DashboardManager.ClientList.length; i++) {
                if (DashboardManager.ClientList[i].clientid === DashboardManager.ListenClientid) {
                    DashboardManager.ListenClientDisplayid = DashboardManager.ClientList[i].displayid;
                }
            }
            document.querySelector('[data-hook~=client-id]').textContent = DashboardManager.ListenClientDisplayid;
        }

        public loadPlugins(): void {
            var xhr = new XMLHttpRequest();
            var divPlugins = <HTMLDivElement> document.getElementById("pluginsPane");
            var divPluginTabs = <HTMLDivElement> document.getElementById("pluginsListPaneContent");
            var coreLoaded = false;

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var catalog = JSON.parse(xhr.responseText);
                        var pluginLoaded = 0;

                        for (var i = 0; i < catalog.plugins.length; i++) {
                            var plugin = catalog.plugins[i];

                            var existingLocation = document.querySelector('[data-plugin='+plugin.id+']');

                            if (!existingLocation) {
                              var pluginmaindiv = document.createElement('div');
                              pluginmaindiv.classList.add('plugin');
                              pluginmaindiv.classList.add('plugin-' + plugin.id.toLowerCase());
                              pluginmaindiv.setAttribute('data-plugin', plugin.id);
                              divPlugins.appendChild(pluginmaindiv);

                              var plugintab = document.createElement('div');
                              plugintab.classList.add('tab');
                              plugintab.textContent = plugin.name;
                              plugintab.setAttribute('data-plugin-target', plugin.id);
                              divPluginTabs.appendChild(plugintab);
                            }

                            var pluginscript = document.createElement("script");
                            pluginscript.setAttribute("src", plugin.path);

                            pluginscript.onload = (oError) => {
                                pluginLoaded++;
                                if (pluginLoaded >= catalog.plugins.length) {
                                    var getUrl = window.location;
                                    var baseUrl = getUrl.protocol + "//" + getUrl.host;
                                    Core.Start(baseUrl, DashboardManager.SessionId, DashboardManager.ListenClientid, this.divMapper);
                                    if (!coreLoaded && !Core.Messenger.onWaitingEventsReceived) {
                                        Core.Messenger.onWaitingEventsReceived = this._onClientUpdateWaitingEvents;
                                        Core.Messenger.onRefreshClients = this._onRefreshClients;
                                        coreLoaded = true;
                                    }
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }

                        DashboardManager.UpdateClientInfo();
                    }
                }
            }

            xhr.open("GET", this._catalogUrl);
            xhr.send();
        }

        public divMapper(pluginId: string): HTMLDivElement {
            var divId = pluginId + "div";
            return <HTMLDivElement> (document.getElementById(divId) || document.querySelector(`[data-plugin=${pluginId}]`));
        }

        public static RefreshClients(): void {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        DashboardManager.ClientList = new Array<any>();
                        
                        var clients = JSON.parse(xhr.responseText);

                        var divClientsListPane = <HTMLDivElement> document.getElementById("clientsListPaneContent");

                        while (divClientsListPane.hasChildNodes()) {
                            divClientsListPane.removeChild(divClientsListPane.lastChild);
                        }

                        var clientlist = document.createElement("ul");
                        divClientsListPane.appendChild(clientlist);

                        for (var i = 0; i < clients.length; i++) {
                            var client = clients[i];
                            if (DashboardManager.ListenClientid === "") {
                                DashboardManager.ListenClientid = client.clientid;
                            }

                            var pluginlistelement = document.createElement("li");
                            pluginlistelement.classList.add('client');
                            if(client.clientid === DashboardManager.ListenClientid) {
                                pluginlistelement.classList.add('active');
                            }
                            clientlist.appendChild(pluginlistelement);

                            var pluginlistelementa = document.createElement("a");
                            pluginlistelementa.textContent = " " + client.name + " - " + client.displayid;
                            pluginlistelementa.setAttribute("href", "/dashboard/" + DashboardManager.SessionId + "/" + client.clientid);
                            pluginlistelementa.id = client.clientid;
                            pluginlistelement.appendChild(pluginlistelementa);

                            DashboardManager.ClientList.push(client);

                            DashboardManager.UpdateClientWaitingInfo(client.clientid, client.waitingevents);
                        }
                    }
                }
            }

            xhr.open("GET", "/api/getclients/" + DashboardManager.SessionId);
            xhr.send();
        }

        public identify(): void {
            Core.Messenger.sendRealtimeMessage("", { "_sessionid": DashboardManager.SessionId }, VORLON.RuntimeSide.Dashboard, "identify");
        }

        public resetDashboard(): void {
            var sessionid = DashboardManager.SessionId;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        location.reload();
                    }
                }
            }

            xhr.open("GET", "/api/reset/" + sessionid);
            xhr.send();
        }

        private _onRefreshClients(): void {
            DashboardManager.RefreshClients();
        }

        private _onClientUpdateWaitingEvents(clientid: string, waitingevents: number): void {
            DashboardManager.UpdateClientWaitingInfo(clientid, waitingevents);
        }

        public static UpdateClientWaitingInfo(clientid: string, waitingevents: number): void{
            var clientLink = document.getElementById(clientid);
            for (var id in DashboardManager.ClientList) {
                var client = DashboardManager.ClientList[id];
                if (client.clientid === clientid) {
                    clientLink.textContent = " " + client.name + " - " + client.displayid + " (" + waitingevents + ")";
                }
            }
        }

        public static getSessionId(): void {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var sessionId = xhr.responseText;
                        window.location.assign("/dashboard/" + sessionId);
                    }
                }
            }

            xhr.open("GET", "/api/createsession");
            xhr.send();
        }
    }
}
