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
            this.performanceItems = [];

            if (typeof window.performance.getEntries !== 'undefined' && window.performance) {
                var entries = window.performance.getEntries();

                for (var i = 0; i < entries.length; i++) {
                    var perfEntry = entries[i];

                    //TODO:- (gakeshre) Temporary code commit to silence errors
                    /*
                    if (perfEntry instanceof PerformanceEventTiming) {
                        this.performanceItems.push({
                            name: perfEntry.name,
                            type: perfEntry.initiatorType,
                            startTime: perfEntry.startTime,
                            duration: perfEntry.duration,
                            redirectStart: perfEntry.redirectStart,
                            redirectDuration: perfEntry.redirectEnd - perfEntry.redirectStart,
                            dnsStart: perfEntry.domainLookupStart,
                            dnsDuration: perfEntry.domainLookupEnd - perfEntry.domainLookupStart,
                            tcpStart: perfEntry.connectStart,
                            tcpDuration: perfEntry.connectEnd - perfEntry.connectStart, 	// TODO
                            requestStart: perfEntry.requestStart,
                            requestDuration: perfEntry.responseStart - perfEntry.requestStart,
                            responseStart: perfEntry.responseStart,
                            responseDuration: (perfEntry.responseStart == 0 ? 0 : perfEntry.responseEnd - perfEntry.responseStart)
                        });
                    }
                    */
                }
            }

            var message: any = {};
            message.entries = this.performanceItems;
            this.sendCommandToDashboard("performanceItems", message);            
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