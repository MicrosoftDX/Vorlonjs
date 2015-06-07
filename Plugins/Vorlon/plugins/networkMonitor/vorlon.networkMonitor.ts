module VORLON {
    export class PerformanceItem {
        public name: string;
        public type: string;
        public startTime: number;
        public duration: number;
        public redirectStart: number;
        public redirectDuration: number;
        public appCacheStart: number;
        public appCacheDuration: number;
        public dnsStart: number;
        public dnsDuration: number;
        public tcpStart: number;
        public tcpDuration: number;
        public sslStart: number;
        public sslDuration: number;
        public requestStart: number;
        public requestDuration: number;
        public responseStart: number;
        public responseDuration: number;
    }

    export class NetworkMonitor extends Plugin {

        public performanceItems: PerformanceItem[] = [];

        constructor() {
            super("networkMonitor", "control.html", "control.css");
            this._ready = true;
        }

        public getID(): string {
            return "NETWORK";
        }

        private _containerDiv: HTMLElement;
        public startDashboardSide(div: HTMLDivElement = null): void {
            //console.log('startDashboardSide');
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = Tools.QuerySelectorById(div, "networkLogList");
            })
        }
        public sendClientData(): void {
            var entries = window.performance.getEntries();
            //console.log(entries);

            this.performanceItems = new Array<PerformanceItem>();
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
                    responseDuration: entries[i].responseStart == 0 ? 0 : entries[i].responseEnd - entries[i].responseStart
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

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            var barColors = {
                blocked: "rgb(204, 204, 204)",
                thirdParty: "rgb(0, 0, 0)",
                redirect: "rgb(255, 221, 0)",
                appCache: "rgb(161, 103, 38)",
                dns: "rgb(48, 150, 158)",
                tcp: "rgb(255, 157, 66)",
                ssl: "rgb(213,102, 223)",
                request: "rgb(64, 255, 64)",
                response: "rgb(52, 150, 255)"
            }
            var maxTime = 0;
            for (var n = 0; n < receivedObject.entries.length; n++) {
                maxTime = Math.max(maxTime, receivedObject.entries[n].startTime + receivedObject.entries[n].duration);
            }
            var scaleFactor = maxTime / 100;

            //console.log(receivedObject.entries);
            for (var i = 0; i < receivedObject.entries.length; i++) {
                var entry = receivedObject.entries[i];
                var tr = document.createElement("tr");
                var tdResourceName = document.createElement("td");
                var tdResourceDomain = document.createElement("td");
                var tdResourceType = document.createElement("td");
                var tdResourceDuration = document.createElement("td");
                var tdResourceTimeline = document.createElement("td");

                //console.log(entry);
                var url = entry.name.substring(entry.name.lastIndexOf('/') + 1);
                if (url.length > 48) {
                    url = url.substring(0, 48) + '...';
                }
                tdResourceName.innerHTML = url;
                tdResourceName.title = entry.name;
                tdResourceDomain.innerHTML = entry.name.split("/")[2];
                tdResourceType.innerHTML = entry.type;
                tdResourceDuration.innerHTML = Math.round(entry.duration).toString();
                tdResourceDuration.className = "network-log-list-right";
                tdResourceTimeline.style.width = "400px";
                tdResourceTimeline.style.position = 'relative';

                if (entry.redirectDuration > 0) {
                    tdResourceTimeline.appendChild(this.createBar(entry.redirectStart / scaleFactor, entry.redirectDuration / scaleFactor, barColors.redirect));
                }

                if (entry.dnsDuration > 0) {
                    tdResourceTimeline.appendChild(this.createBar(entry.dnsStart / scaleFactor, entry.dnsDuration / scaleFactor, barColors.dns));
                }

                if (entry.tcpDuration > 0) {
                    tdResourceTimeline.appendChild(this.createBar(entry.tcpStart / scaleFactor, entry.tcpDuration / scaleFactor, barColors.tcp));
                }

                if (entry.requestDuration > 0) {
                    tdResourceTimeline.appendChild(this.createBar(entry.requestStart / scaleFactor, entry.requestDuration / scaleFactor, barColors.request));
                }

                if (entry.responseDuration > 0) {
                    tdResourceTimeline.appendChild(this.createBar(entry.responseStart / scaleFactor, entry.responseDuration / scaleFactor, barColors.response));
                }

                tr.appendChild(tdResourceName);
                tr.appendChild(tdResourceDomain);
                tr.appendChild(tdResourceType);
                tr.appendChild(tdResourceDuration);
                tr.appendChild(tdResourceTimeline);

                this._containerDiv.appendChild(tr);
            }
        }

        public createBar(x, width, color): HTMLElement {
            var bar = document.createElement('div');

            bar.className = 'chart-bar';
            //bar.style.position = 'absolute';
            //bar.style.height = '10px';
            bar.style.marginLeft = x + '%';
            bar.style.width = width + '%';
            bar.style.backgroundColor = color;

            return bar
        }

        public refresh(): void {
            this.sendClientData();
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterPlugin(new NetworkMonitor());
} 