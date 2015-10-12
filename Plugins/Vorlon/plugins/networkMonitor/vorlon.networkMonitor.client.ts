module VORLON {
    export class NetworkMonitorClient extends ClientPlugin {
        public performanceItems: PerformanceItem[] = [];

        constructor() {
            super("networkMonitor");
            //this.debug = true;
            this._ready = true;
        }

        public getID(): string {
            return "NETWORK";
        }

        public sendClientData(): void {
            this.trace("network monitor sending data ")
            var entries = window.performance.getEntries();
            //console.log(entries);

            this.performanceItems = [];
            for (var i = 0; i < entries.length; i++) {
                this.performanceItems.push({
                    name: entries[i].name,
                    type: entries[i].initiatorType,
                    startTime: entries[i].startTime,
                    duration: entries[i].duration,
                    redirectStart: entries[i].redirectStart,
                    redirectDuration: entries[i].redirectEnd - entries[i].redirectStart,
                    dnsStart: entries[i].domainLookupStart,
                    dnsDuration: entries[i].domainLookupEnd - entries[i].domainLookupStart,
                    tcpStart: entries[i].connectStart,
                    tcpDuration: entries[i].connectEnd - entries[i].connectStart, 	// TODO
                    requestStart: entries[i].requestStart,
                    requestDuration: entries[i].responseStart - entries[i].requestStart,
                    responseStart: entries[i].responseStart,
                    responseDuration: (entries[i].responseStart == 0 ? 0 : entries[i].responseEnd - entries[i].responseStart)
                });
            }

            //console.log(this.performanceItems);
            var message: any = {};
            message.entries = this.performanceItems;
            this.sendCommandToDashboard("performanceItems", message);            
        }

        public whenDOMReady(): void {
            var that = this;
            that.sendClientData();
        }

        public refresh(): void {
            this.sendClientData();
        }
    }

    NetworkMonitorClient.prototype.ClientCommands = {
        refresh: function (data: any) {
            var plugin = <NetworkMonitorClient>this;
            plugin.sendClientData();
        }
    };
    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new NetworkMonitorClient());
} 