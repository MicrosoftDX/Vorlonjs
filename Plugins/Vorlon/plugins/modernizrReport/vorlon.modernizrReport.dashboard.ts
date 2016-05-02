module VORLON {

    declare var Modernizr;

    export class ModernizrReportDashboard extends DashboardPlugin {
        constructor() {
            super("modernizrReport", "control.html", "control.css");
            this._ready = false;
            this._id = "MODERNIZR";
            //this.debug = true;
        }

        private _filterList: any = {};
        private _cssFeaturesListTable: HTMLTableElement;
        private _htmlFeaturesListTable: HTMLTableElement;
        private _miscFeaturesListTable: HTMLTableElement;
        private _nonCoreFeaturesListTable: HTMLTableElement;

        public startDashboardSide(div: HTMLDivElement = null): void {            
            this._insertHtmlContentAsync(div,(filledDiv) => {

                this._cssFeaturesListTable = <HTMLTableElement>Tools.QuerySelectorById(div, "cssFeaturesList");
                this._htmlFeaturesListTable = <HTMLTableElement>Tools.QuerySelectorById(div, "htmlFeaturesList");
                this._miscFeaturesListTable = <HTMLTableElement>Tools.QuerySelectorById(div, "miscFeaturesList");
                this._nonCoreFeaturesListTable = <HTMLTableElement>Tools.QuerySelectorById(div, "nonCoreFeaturesList");

                var list = this._filterList;
                var filter = <HTMLInputElement>document.getElementById('css_feature_filter');
                filter.setAttribute('aria-label', 'Search CSS features')
                filter.addEventListener('input',() => {
                    var value = filter.value;
                    for (var z in list) {
                        list[z].setAttribute('data-feature-visibility', z.indexOf(value) > -1 ? '' : 'hidden');
                    }
                });

                this._ready = true;
            });
        }

        public displayClientFeatures(receivedObject: any): void {
            if (!receivedObject || !receivedObject.features)
                return;
                
            var targettedTable;
            var supportedFeatures: FeatureSupported[] = receivedObject.features;
            if (supportedFeatures && supportedFeatures.length)
                for (var i = 0; i < supportedFeatures.length; i++) {
                    switch (supportedFeatures[i].type) {
                        case "css":
                            targettedTable = this._cssFeaturesListTable;
                            break;
                        case "misc":
                            targettedTable = this._miscFeaturesListTable;
                            break;
                        case "noncore":
                            targettedTable = this._nonCoreFeaturesListTable;
                            break;
                        default:
                            targettedTable = this._htmlFeaturesListTable;
                            break;
                    }

                    var rowCount = targettedTable.rows.length;
                    var row = <HTMLTableRowElement>targettedTable.insertRow(rowCount);
                    row.insertCell(0).innerHTML = supportedFeatures[i].featureName;
                    var cellSupported = <HTMLTableCellElement>row.insertCell(1);
                    cellSupported.align = "center";
                    if (supportedFeatures[i].isSupported) {
                        cellSupported.className = "modernizrFeatureSupported";
                        cellSupported.innerHTML = "✔";
                    }
                    else {
                        cellSupported.className = "modernizrFeatureUnsupported";
                        cellSupported.innerHTML = "×";
                    }
                }
            Array.prototype.slice.call(document.querySelectorAll('.modernizr-features-list td:first-child'), 0).forEach((node) => {
                this._filterList[node.textContent.toLowerCase()] = node.parentNode;
            });
        }
    }

    ModernizrReportDashboard.prototype.DashboardCommands = {
        clientfeatures: function(data: any) {
            var plugin = <ModernizrReportDashboard>this;
            plugin.displayClientFeatures(data);
        }
    };
    
    // Register
    Core.RegisterDashboardPlugin(new ModernizrReportDashboard());
}