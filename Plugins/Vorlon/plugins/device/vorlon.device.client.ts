module VORLON {
    declare var $: any;
    declare var res: any;
    declare var verge: any;

    export class DeviceClient extends ClientPlugin {
        constructor() {
            super("device");
            this._ready = true;
        }

        //Return unique id for your plugin
        public getID(): string {
            return "DEVICE";
        }

        public refresh(): void {
            // override this method with cleanup work that needs to happen
            // as the user switches between clients on the dashboard


            if (typeof verge === 'undefined' || typeof res === 'undefined') {
                return;
            }

            // user agent string
            var userAgent = this.getUserAgent();
            // console.info('User agent:', userAgent);

            // meta viewport tag
            var metaViewport = this.getMetaViewport();
            // console.info('Meta viewport:', metaViewport);

            // screen widths
            var screenWidths = this.getScreenWidths();
            // console.info('Screen widths', screenWidths);

            // screen resolution
            var resolution = this.getResolution();
            // console.info('Resolution', resolution);

            // root font size
            var rootFontSize:any = this.getRootFontSize();
            // console.info('Root font size:', rootFontSize);

            // viewport
            var viewport = this.getViewport();
            // console.info('Viewport', viewport);

            // pixel ratio
            var pixelRatio = this.getPixelRatio();
            // console.info('Pixel ratio:', pixelRatio);

            var data = {
                userAgent: userAgent,
                metaViewport: metaViewport,
                screenWidths: screenWidths,
                resolution: resolution,
                rootFontSize: rootFontSize,
                viewport: viewport,
                pixelRatio: pixelRatio
            }

            var message = {
                type: 'full', // 'full' specifies that this message contains all device information
                data: data
            }

            this.sendToDashboard(message);
        }

        public refreshResize(): void {
            if (typeof verge === 'undefined') {
                return;
            }
            
            var data = {
                screenWidths: this.getScreenWidths(),
                viewport: this.getViewport(),
            }

            var message = {
                type: 'resize', // 'resize' specifies that this message only contains data that changed due to a window resize
                data: data
            };

            this.sendToDashboard(message);

            // console.log('Device information refreshed for resize.');
        }

        public getUserAgent(): string {
            return navigator.userAgent;
        }

        public getMetaViewport(): string {
            var metaViewportTag: any = document.querySelector('meta[name="viewport"]');
            var metaViewport;
            if (metaViewport !== null || metaViewport === []) {
                metaViewport = metaViewportTag.outerHTML;
            } else {
                console.log('No meta viewport tag found.');
                metaViewport = 'No meta viewport tag found.';
            }

            return metaViewport;
        }

        public getScreenWidths(): any {
            return {
                screenWidth: screen.width,
                screenAvailWidth: screen.availWidth,
                windowInnerWidth: window.innerWidth,
                bodyClientWidth: document.body.clientWidth,
            }
        }

        public getResolution(): any {
            return {
                dpi: res.dpi(),
                dppx: res.dppx(),
                dpcm: res.dpcm()
            }
        }

        public getRootFontSize(): number {
            // returns the root font size in pixels
            var htmlRoot = document.getElementsByTagName('html')[0];
            return parseInt(window.getComputedStyle(htmlRoot, null).getPropertyValue('font-size'));
        }

        public getViewport(): any {
            var rootFontSize: number = this.getRootFontSize();
            return {
                aspectRatio: verge.aspect(screen),
                width: verge.viewportW(),
                widthEm: (verge.viewportW() / rootFontSize).toFixed(0),
            }
        }

        public getPixelRatio(): any {
            // pixel ratio refers to ratio between physical pixels and logical pixels
            // see http://stackoverflow.com/a/8785677 for more information
            var pixelRatio: any = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
            pixelRatio = pixelRatio.toFixed(2);
            return pixelRatio;
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {
            // load the "res" and "verge" libraries

            this._loadNewScriptAsync("res.min.js",() => {
                if (res) {
                    this.refresh();
                }
            });
            this._loadNewScriptAsync("verge.min.js",() => {
                if (verge) {
                    this.refresh();
                }
            });

            // update certain information when the page is resized
            window.addEventListener('resize', this.refreshResize.bind(this));
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            // the dashboard shouldn't be sending anything
        }
    }

    // Register the plugin with vorlon core
    Core.RegisterClientPlugin(new DeviceClient());
}
