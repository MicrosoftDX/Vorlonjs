module VORLON {
    export class PerformanceItem {
        public name: string;
        public duration: string;
        public type: string;
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
            console.log('startDashboardSide');
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = Tools.QuerySelectorById(div, "networkLogList");
            })
        }
        public sendClientData(): void {
            var entries = window.performance.getEntries();
            console.log(entries);

            for (var i = 0; i < entries.length; i++) {
                this.performanceItems.push({
                    "name": entries[i].name,
                    "duration": entries[i].duration,
                    "type": entries[i].entryType
                });
            }

            console.log(this.performanceItems);
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
            console.log(receivedObject.entries);
            for (var i = 0; i < receivedObject.entries.length; i++) {
                var tr = document.createElement("tr");
                var tdResourceName = document.createElement("td");
                var tdResourceType = document.createElement("td");
                var tdResourceDuration = document.createElement("td");

                console.log(receivedObject.entries[i]);
                tdResourceName.innerHTML = receivedObject.entries[i].name;
                tdResourceType.innerHTML = receivedObject.entries[i].type;
                tdResourceDuration.innerHTML = receivedObject.entries[i].duration;
                tdResourceDuration.className = "network-log-list-right";

                tr.appendChild(tdResourceName);
                tr.appendChild(tdResourceType);
                tr.appendChild(tdResourceDuration);
                this._containerDiv.appendChild(tr);
            }
        }

        public refresh(): void {
            this.sendClientData();
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterPlugin(new NetworkMonitor());
} 