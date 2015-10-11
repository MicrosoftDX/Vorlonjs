/// <reference path="../Scripts/typings/vorlon/vorlon.core.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.clientMessenger.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.plugin.d.ts" /> 


module VORLON {
    declare var $: any;
    declare var vorlonBaseURL: string;
    
    export class DashboardManager {
        static CatalogUrl: string;
        static ListenClientid: string;
        static ListenClientDisplayid: string;
        static SessionId: string;
        static ClientList: Array<any>;
        
        constructor(sessionid: string, listenClientid: string) {
            //Dashboard session id
            DashboardManager.SessionId = sessionid;
            //Client ID
            DashboardManager.ListenClientid = listenClientid;
            DashboardManager.ClientList = new Array<any>();
            DashboardManager.StartListeningServer()
            DashboardManager.GetClients();
            DashboardManager.CatalogUrl =  vorlonBaseURL + "/config.json";
        }
        
        public static StartListeningServer(){
            var getUrl = window.location;
            var baseUrl = getUrl.protocol + "//" + getUrl.host;
            Core.StartDashboardSide(baseUrl, DashboardManager.SessionId, "", DashboardManager.divMapper);
            Core.Messenger.onAddClient = DashboardManager.addClient;
            Core.Messenger.onRemoveClient = DashboardManager.removeClient;
        }
        
        public static GetClients(): void {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        //Init ClientList Object
                        DashboardManager.ClientList = new Array<any>();
                        document.getElementById('test').style.visibility='hidden';

                        //Loading client list 
                        var clients = JSON.parse(xhr.responseText);

                        //Test if the client to display is in the list
                        var contains = false;
                        if (clients && clients.length) {
                            for (var j = 0; j < clients.length; j++) {
                                if (clients[j].clientid === DashboardManager.ListenClientid) {
                                    contains = true;
                                    break;
                                }
                            }
                        }
                        
                        //Get the client list placeholder
                        var divClientsListPane = <HTMLDivElement> document.getElementById("clientsListPaneContent");
                        
                        //Create the new empty list
                        var clientlist = document.createElement("ul");
                        clientlist.setAttribute("id", "clientsListPaneContentList")
                        divClientsListPane.appendChild(clientlist);
                                               
                        //Show waiting logo 
                        if(!contains || clients.length === 0){
                            var elt = <HTMLElement>document.querySelector('.dashboard-plugins-overlay');
                            VORLON.Tools.RemoveClass(elt, 'hidden');
                        }
                        
                        for (var i = 0; i < clients.length; i++) {
                            var client = clients[i];
                            DashboardManager.AddClientToList(client);
                        }
                        
                        if (contains) {
                             DashboardManager.loadPlugins();
                        }
                    }
                }
            }
            xhr.open("GET", vorlonBaseURL + "/api/getclients/" + DashboardManager.SessionId);
            xhr.send();
        }
        
        public static AddClientToList(client: any){
           var clientlist = <HTMLUListElement> document.getElementById("clientsListPaneContentList");
            
            if (DashboardManager.ListenClientid === "") {
                DashboardManager.ListenClientid = client.clientid;
            }

            var pluginlistelement = document.createElement("li");
            pluginlistelement.classList.add('client');
            pluginlistelement.id = client.clientid;
            if (client.clientid === DashboardManager.ListenClientid) {
                pluginlistelement.classList.add('active');
            }
            clientlist.appendChild(pluginlistelement);

            var pluginlistelementa = document.createElement("a");
            pluginlistelementa.textContent = " " + client.name + " - " + client.displayid;
            pluginlistelementa.setAttribute("href", vorlonBaseURL + "/dashboard/" + DashboardManager.SessionId + "/" + client.clientid);
            pluginlistelement.appendChild(pluginlistelementa);

            DashboardManager.ClientList.push(client);
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

        public static loadPlugins(): void {
            var xhr = new XMLHttpRequest();
            var divPluginsBottom = <HTMLDivElement> document.getElementById("pluginsPaneBottom");
            var divPluginsTop = <HTMLDivElement> document.getElementById("pluginsPaneTop");
            var divPluginBottomTabs = <HTMLDivElement> document.getElementById("pluginsListPaneBottom");
            var divPluginTopTabs = <HTMLDivElement> document.getElementById("pluginsListPaneTop");
            var coreLoaded = false;
              
            //Hide waiting page and let's bounce the logo !
            var elt = <HTMLElement>document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.RemoveClass(elt, 'hidden');
            VORLON.Tools.AddClass(elt, 'bounce');

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var catalog;
                        try {
                            catalog = JSON.parse(xhr.responseText);
                        } catch (ex) {
                            throw new Error("The catalog JSON is not well-formed");
                        }

                        var pluginLoaded = 0;
                        var pluginstoload = 0;
                        
                        //Cleaning unwanted plugins
                        for(var i = 0; i < catalog.plugins.length; i++){
                            if(catalog.plugins[i].enabled){
                                pluginstoload ++;
                            }
                        }

                        for (var i = 0; i < catalog.plugins.length; i++) {
                            var plugin = catalog.plugins[i];
                            
                            if(!plugin.enabled){
                                continue;
                            }
                            
                            var existingLocation = document.querySelector('[data-plugin=' + plugin.id + ']');

                            if (!existingLocation) {
                                var pluginmaindiv = document.createElement('div');
                                pluginmaindiv.classList.add('plugin');
                                pluginmaindiv.classList.add('plugin-' + plugin.id.toLowerCase());
                                pluginmaindiv.setAttribute('data-plugin', plugin.id);

                                var plugintab = document.createElement('div');
                                plugintab.classList.add('tab');
                                plugintab.textContent = plugin.name;
                                plugintab.setAttribute('data-plugin-target', plugin.id);

                                if (plugin.panel === "bottom") {
                                    if (divPluginsBottom.children.length === 1) {
                                        pluginmaindiv.classList.add("active");
                                    }
                                    divPluginsBottom.appendChild(pluginmaindiv);
                                    divPluginBottomTabs.appendChild(plugintab);
                                }
                                else {
                                    if (divPluginsTop.children.length === 1) {
                                        pluginmaindiv.classList.add("active");
                                    }
                                    divPluginsTop.appendChild(pluginmaindiv);
                                    divPluginTopTabs.appendChild(plugintab);
                                }
                            }
                            var pluginscript = document.createElement("script");
                            pluginscript.setAttribute("src", vorlonBaseURL + "/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.min.js");

                            pluginscript.onload = (oError) => {
                                pluginLoaded++;
                                if (pluginLoaded >= pluginstoload) {
                                    var getUrl = window.location;
                                    var baseUrl = getUrl.protocol + "//" + getUrl.host;
                                    Core.StartDashboardSide(baseUrl, DashboardManager.SessionId, DashboardManager.ListenClientid, DashboardManager.divMapper);
                                    if (!coreLoaded && !Core.Messenger.onRefreshClients) {
                                        Core.Messenger.onAddClient = DashboardManager.addClient;
                                        Core.Messenger.onRemoveClient = DashboardManager.removeClient;
                                        coreLoaded = true;
                                    }
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }
                        
                        var addPluginBtn = document.createElement('div');
                        addPluginBtn.className = "tab";
                        addPluginBtn.innerText = "+";
                        divPluginTopTabs.appendChild(addPluginBtn);
                        addPluginBtn.addEventListener('click',() => {
                            window.open("http://www.vorlonjs.io/plugins", "_blank");
                        });
                        
                        var collaspseBtn = document.createElement('div');
                        collaspseBtn.className = "fa fa-expand expandBtn";
                        divPluginBottomTabs.appendChild(collaspseBtn);
                        collaspseBtn.addEventListener('click',() => {
                            divPluginsBottom.style.height = 'calc(100% - 58px)';
                            divPluginsTop.style.height = '50px';
                            $('.hsplitter', divPluginsTop.parentElement).css('top', '50px');
                        });

                        var collaspseTopBtn = document.createElement('div');
                        collaspseTopBtn.className = "fa fa-expand expandBtn";
                        divPluginTopTabs.appendChild(collaspseTopBtn);
                        collaspseTopBtn.addEventListener('click',() => {
                            divPluginsBottom.style.height = '50px';
                            divPluginsTop.style.height = 'calc(100% - 58px)';
                            $('.hsplitter', divPluginsTop.parentElement).css('top', 'calc(100% - 58px)');
                        });
                        DashboardManager.UpdateClientInfo();
                    }
                }
            }

            xhr.open("GET", DashboardManager.CatalogUrl);
            xhr.send();
        }

        public static divMapper(pluginId: string): HTMLDivElement {
            var divId = pluginId + "div";
            return <HTMLDivElement> (document.getElementById(divId) || document.querySelector(`[data-plugin=${pluginId}]`));
        }

        public identify(): void {
            Core.Messenger.sendRealtimeMessage("", { "_sessionid": DashboardManager.SessionId }, VORLON.RuntimeSide.Dashboard, "identify");
        }

        public static ResetDashboard(reload: boolean = true): void {
            var sessionid = DashboardManager.SessionId;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (reload) {
                            location.reload();
                        }
                    }
                }
            }

            xhr.open("GET", vorlonBaseURL + "/api/reset/" + sessionid);
            xhr.send();
        }

        public static ReloadClient(): void {
            Core.Messenger.sendRealtimeMessage("", DashboardManager.ListenClientid, VORLON.RuntimeSide.Dashboard, "reload");
        }

        public static addClient(client: any): void {
            DashboardManager.AddClientToList(client);
        }
        
        public static removeClient(client: any): void {
            var clientInList = <HTMLLIElement> document.getElementById(client.clientid);
            clientInList.remove();   
            
            DashboardManager.removeInClientList(client);
                    
            if (DashboardManager.ClientList.length === 0) {
                 DashboardManager.ResetDashboard(false);
            }
        }
        
        public static removeInClientList(client: any): void{
            for (var j = 0; j < DashboardManager.ClientList.length; j++) {
                if (DashboardManager.ClientList[j].clientid === client.clientid) {
                    DashboardManager.ClientList.splice(j,1);
                }
            }
        }

        public static getSessionId(): void {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var sessionId = xhr.responseText;
                        window.location.assign(vorlonBaseURL + "/dashboard/" + sessionId);
                    }
                }
            }

            xhr.open("GET", vorlonBaseURL + "/api/createsession");
            xhr.send();
        }
    }
}
