module VORLON {
    export class WappalyzerReportDashboard extends DashboardPlugin {
        constructor() {
            super("wappalyzerReport", "control.html", "control.css");
            this._ready = true;
        }

        public getID(): string {
            return "WAPPALYZER";
        }

        private _techListTable: HTMLTableElement;
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._techListTable = <HTMLTableElement>Tools.QuerySelectorById(div, "techList");
            })
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            console.log('from client');
            console.log(receivedObject);

            this._techListTable.innerHTML = '';
            for (var i = 0; i < receivedObject.detected.length; i++) {
                console.log(receivedObject.detected[i]);
                var app = receivedObject.detected[i].app;

                var categories = '';
                for (var j = 0; j < receivedObject.detected[i].categories.length; j++) {
                    categories += '<a target="_blank" href="https://wappalyzer.com/categories/' + receivedObject.detected[i].categories[j] + '">' + receivedObject.detected[i].categories[j] + '</a>';
                }

                var rowCount = this._techListTable.rows.length;
                var row = <HTMLTableRowElement>this._techListTable.insertRow(rowCount);
                row.insertCell(0).innerHTML = '<img src="https://raw.githubusercontent.com/AliasIO/Wappalyzer/master/src/icons/' + app + '.png" width="16" height="16"/> <a target="_blank" href="https://wappalyzer.com/applications/' + app.replace(' ','-') + '">' + app + '</a>';
                row.insertCell(1).innerHTML = categories;

            };
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new WappalyzerReportDashboard());
} 