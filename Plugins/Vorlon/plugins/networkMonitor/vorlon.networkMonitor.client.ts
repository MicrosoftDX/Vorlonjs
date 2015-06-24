module VORLON {
    export class NetworkMonitorClient extends ClientPlugin {
        public performanceItems: PerformanceItem[] = [];

        constructor() {
            super("networkMonitor");
            this._ready = true;
        }

        public getID(): string {
            return "NETWORK";
        }

        public sendClientData(): void {
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
            Core.Messenger.sendRealtimeMessage(this.getID(), message, RuntimeSide.Client, "message");
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
    Core.RegisterClientPlugin(new NetworkMonitorClient());
} 