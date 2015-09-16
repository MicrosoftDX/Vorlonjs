 module VORLON {
    export class DeviceDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("device", "control.html", "control.css");
            this._ready = true;
        }

        //Return unique id for your plugin
        public getID(): string {
            return "DEVICE";
        }

        // This code will run on the dashboard //////////////////////

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard
        private _table: HTMLTableElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._table = <HTMLTableElement>filledDiv.querySelector('table');
            })
        }

        // called to update the HTML with a complete set of data
        public update(data: any): void {
            // resolution
            var resolution = data.resolution;
            this.setTableValue('dpi', resolution.dpi);
            this.setTableValue('dppx', resolution.dppx);
            this.setTableValue('dpcm', resolution.dpcm);

            // miscellaneous
            this.setTableValue('root-font-size', data.rootFontSize + 'px');
            this.setTableValue('pixel-ratio', data.pixelRatio);
            this.setTableValue('user-agent', data.userAgent);


            this.updateResize(data);
        }

        // called to update the HTML with a set of data stemming from a window resize
        public updateResize(data: any): void {
            // viewport
            var viewport = data.viewport;
            this.setTableValue('aspect-ratio', viewport.aspectRatio);
            this.setTableValue('width', viewport.width + 'px');
            this.setTableValue('width-em', viewport.widthEm + 'em');
            this.setTableValue('meta-viewport-tag', data.metaViewport);

            // screen width
            var screenWidths = data.screenWidths
            this.setTableValue('screen-width', screenWidths.screenWidth + 'px');
            this.setTableValue('screen-available-width', screenWidths.screenAvailWidth + 'px');
            this.setTableValue('window-inner-width', screenWidths.windowInnerWidth + 'px');
            this.setTableValue('body-client-width', screenWidths.bodyClientWidth + 'px');
        }

        public setTableValue(cssClass: string, value: string): void {
            this._table.querySelector('.' + cssClass).textContent = value;
        }

        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            var data = receivedObject.data;
            var udpateType = receivedObject.type;

            switch (udpateType) {
                case 'full':
                    this.update(data);
                    break;
                case 'resize':
                    this.updateResize(data);
                    break;
            }
        }
    }

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new DeviceDashboard());
}
