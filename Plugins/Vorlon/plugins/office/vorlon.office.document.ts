///<reference path='vorlon.office.tools.ts' />
///<reference path='vorlon.office.interfaces.ts' />
///<reference path='../../vorlon.dashboardPlugin.ts' />

var $: any;
module VORLON {

    export class OfficeDocument {

        private dashboardPlugin: DashboardPlugin;

        constructor(dashboardPlugin: DashboardPlugin) {
            this.dashboardPlugin = dashboardPlugin;
        }

        public execute() {

            this.apis.forEach(api => {
                api().addTree();
            });
        }

        public apis: { (): OfficeFunction }[] = [
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.requirements", "isSetSupported");
                var apiName = OfficeTools.CreateTextBlock(fn.fullpathName + ".apiName", "Api name");
                var apiVersion = OfficeTools.CreateTextBlock(fn.fullpathName + ".apiVersion", "Api Version");
                fn.elements.push(apiName, apiVersion);
                return fn;
            },
            (): OfficeFunction => {
                return new OfficeFunction(this.dashboardPlugin, "window.Office.context.document", "getAllAsync");

            },
            (): OfficeFunction => {

                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.document", "getSelectedDataAsync");
                var coercionType = OfficeTools.CreateTextBlock(fn.fullpathName + ".coercionType", "Coercion type", "text");
                var filterType = OfficeTools.CreateTextBlock(fn.fullpathName + ".filterType", "Filter type", "all");
                var valueFormat = OfficeTools.CreateTextBlock(fn.fullpathName + ".valueFormat", "Value format", "unformatted");
                fn.elements.push(coercionType, filterType, valueFormat);
                fn.getArgs = (): any => {
                    var args = [coercionType.value, {
                        filterType: filterType.value === "" ? null : filterType.value,
                        valueFormat: valueFormat.value === "" ? null : valueFormat.value
                    }];
                    return args;
                };
                return fn;

            },
            (): OfficeFunction => {

                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.document", "getFileAsync");
                fn.elements.push(OfficeTools.CreateTextBlock(fn.fullpathName + ".fileType", "Type", "text"));
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.document", "setSelectedDataAsync");
                var data = VORLON.OfficeTools.CreateTextArea(fn.fullpathName + ".data", "Data", "Hello World");
                var coercionType = VORLON.OfficeTools.CreateTextBlock(fn.fullpathName + ".coerctionType", "Type", "text");
                fn.elements.push(data, coercionType);
                fn.getArgs = (): any => {
                    var args = [data.value, {
                        coercionType: coercionType.value === "" ? null : coercionType.value
                    }];
                    return args;
                };
                return fn;
            }
        ]
    }

}