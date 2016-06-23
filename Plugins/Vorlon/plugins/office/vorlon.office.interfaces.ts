module VORLON {
    export class OfficeFunction {

        public treeCategory: string;
        public functionName: string;
        public elements: any[];
        public callback: void;
        private dashboardPlugin: DashboardPlugin;
        public fullpathName: string;
        public sendToClient: () => void;
 
        /**
         * function ecosystem
         */
        constructor(dashboardPlugin: DashboardPlugin, treeCategory: string, functionName: string) {
            this.dashboardPlugin = dashboardPlugin;
            this.treeCategory = treeCategory;
            this.functionName = functionName;
            this.fullpathName = treeCategory + "." + functionName;
            this.elements = [];
            this.sendToClient = () => this.dashboardPlugin.sendToClient(
                {
                    type: "function",
                    name: this.fullpathName,
                    args: this.getArgs(),
                    hasAsyncResult: this.isAsync()
                });



        }

        public addTree(): void {

            var func = VORLON.OfficeTools.AddTreeFunction(this.treeCategory, this.functionName);

            func.click(e => {
                VORLON.OfficeTools.ShowFunction(this.fullpathName, this.sendToClient, this.elements);
            });
        }

        public getArgs(): any[] {
            var args = [];
            this.elements.forEach(element => {
                if (element.value !== null && element.value !== undefined && element.value !== "")
                    args.push(element.value);
            });

            return args;
        }

        public isAsync() {
            var isAsync = (this.functionName.toLowerCase().indexOf("async") > 0);
            return isAsync;
        }



    }
} 