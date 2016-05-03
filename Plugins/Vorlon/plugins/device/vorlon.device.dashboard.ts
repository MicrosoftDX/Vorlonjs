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
        private _resolutionTable: HTMLTableElement;
        private _miscTable: HTMLTableElement;
        private _viewportTable: HTMLTableElement;
        private _screensizeTable: HTMLTableElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._resolutionTable = <HTMLTableElement>filledDiv.querySelector('#resolution');
                this._miscTable = <HTMLTableElement>filledDiv.querySelector('#misc');
                this._viewportTable = <HTMLTableElement>filledDiv.querySelector('#viewport');
                this._screensizeTable = <HTMLTableElement>filledDiv.querySelector('#screensize');
            })
        }

        // called to update the HTML with a complete set of data
        public update(data: any): void {
            // resolution
            var resolution = data.resolution;
            this.setTableValue(this._resolutionTable, 'dpi', this.round2decimals(resolution.dpi).toString());
            this.setTableValue(this._resolutionTable,'dppx', this.round2decimals(resolution.dppx).toString());
            this.setTableValue(this._resolutionTable,'dpcm', this.round2decimals(resolution.dpcm).toString());

            // miscellaneous
            this.setTableValue(this._miscTable, 'root-font-size', data.rootFontSize + 'px');
            this.setTableValue(this._miscTable,'pixel-ratio', this.round2decimals(data.pixelRatio).toString());
            this.setTableValue(this._miscTable,'user-agent', data.userAgent);


            this.updateResize(data);
        }

        // called to update the HTML with a set of data stemming from a window resize
        public updateResize(data: any): void {
            // viewport
            var viewport = data.viewport;
            this.setTableValue(this._viewportTable, 'aspect-ratio', this.round2decimals(viewport.aspectRatio).toString());
            this.setTableValue(this._viewportTable, 'width', viewport.width + 'px');
            this.setTableValue(this._viewportTable, 'width-em', viewport.widthEm + 'em');
            if(data.metaViewport){
                this.setTableValue(this._viewportTable, 'meta-viewport-tag', data.metaViewport);
            }

            // screen width
            var screenWidths = data.screenWidths
            this.setTableValue(this._screensizeTable, 'screen-width', screenWidths.screenWidth + 'px');
            this.setTableValue(this._screensizeTable, 'screen-available-width', screenWidths.screenAvailWidth + 'px');
            this.setTableValue(this._screensizeTable, 'window-inner-width', screenWidths.windowInnerWidth + 'px');
            this.setTableValue(this._screensizeTable, 'body-client-width', screenWidths.bodyClientWidth + 'px');
        }

        public setTableValue(table: HTMLTableElement, cssClass: string, value: string): void {
            if (table)
                table.querySelector('.' + cssClass).textContent = value;
        }
        
        private round2decimals(value: any):number{
            return (Math.round(value * 100) / 100);
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
