module VORLON {
    export class FeatureSupported {
        public featureName: string;
        public isSupported: boolean;
        public type: string; 
    }

    declare var Modernizr;

    export class ModernizrReport extends Plugin {
        public supportedFeatures: FeatureSupported[] = [];

        constructor() {
            super("modernizrReport", "control.html", "control.css");
            this._ready = false;
        }

        public getID(): string {
            return "MODERNIZR";
        }

        public startClientSide(): void {
            this._loadNewScriptAsync("modernizr.js", () => {
                if (Modernizr) {
                    this.supportedFeatures.push({ featureName: "Application cache", isSupported: Modernizr.applicationcache, type: "html" });
                    this.supportedFeatures.push({ featureName: "Audio tag", isSupported: Modernizr.audio, type: "html" });
                    this.supportedFeatures.push({ featureName: "background-size", isSupported: Modernizr.backgroundsize, type: "css" });
                    this.supportedFeatures.push({ featureName: "border-image", isSupported: Modernizr.borderimage, type: "css" });
                    this.supportedFeatures.push({ featureName: "border-radius", isSupported: Modernizr.borderradius, type: "css" });
                    this.supportedFeatures.push({ featureName: "box-shadow", isSupported: Modernizr.boxshadow, type: "css" });
                    this.supportedFeatures.push({ featureName: "canvas", isSupported: Modernizr.canvas, type: "html" });
                    this.supportedFeatures.push({ featureName: "canvas text", isSupported: Modernizr.canvastext, type: "html" });
                    this.supportedFeatures.push({ featureName: "CSS Animations", isSupported: Modernizr.cssanimations, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Columns", isSupported: Modernizr.csscolumns, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Gradients", isSupported: Modernizr.cssgradients, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Reflections", isSupported: Modernizr.cssreflections, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Transforms", isSupported: Modernizr.csstransforms, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Transforms 3d", isSupported: Modernizr.csstransforms3d, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Transitions", isSupported: Modernizr.csstransitions, type: "css" });
                    this.supportedFeatures.push({ featureName: "Drag'n'drop", isSupported: Modernizr.draganddrop, type: "html" });
                    this.supportedFeatures.push({ featureName: "Flexbox", isSupported: Modernizr.flexbox, type: "css" });
                    this.supportedFeatures.push({ featureName: "@font-face", isSupported: Modernizr.fontface, type: "css" });
                    this.supportedFeatures.push({ featureName: "CSS Generated Content (:before/:after)", isSupported: Modernizr.generatedcontent, type: "css" });
                    this.supportedFeatures.push({ featureName: "Geolocation API", isSupported: Modernizr.geolocation, type: "misc" });
                    this.supportedFeatures.push({ featureName: "hashchange Event", isSupported: Modernizr.hashchange, type: "html" });
                    this.supportedFeatures.push({ featureName: "History Management", isSupported: Modernizr.history, type: "html" });
                    this.supportedFeatures.push({ featureName: "Color Values hsla()", isSupported: Modernizr.hsla, type: "css" });
                    this.supportedFeatures.push({ featureName: "IndexedDB", isSupported: Modernizr.indexeddb, type: "html" });
                    this.supportedFeatures.push({ featureName: "Inline SVG in HTML5", isSupported: Modernizr.inlinesvg, type: "misc" });
                    this.supportedFeatures.push({ featureName: "Input Attribute autocomplete", isSupported: Modernizr.input.autocomplete, type: "html" });
                    /* TO DO: Inputs... */
                    this.supportedFeatures.push({ featureName: "localStorage", isSupported: Modernizr.localstorage, type: "html" });
                    this.supportedFeatures.push({ featureName: "Multiple backgrounds", isSupported: Modernizr.multiplebgs, type: "css" });
                    this.supportedFeatures.push({ featureName: "opacity", isSupported: Modernizr.opacity, type: "css" });
                    this.supportedFeatures.push({ featureName: "Cross-window Messaging", isSupported: Modernizr.postmessage, type: "html" });
                    this.supportedFeatures.push({ featureName: "Color Values rgba()", isSupported: Modernizr.rgba, type: "css" });
                    this.supportedFeatures.push({ featureName: "sessionStorage", isSupported: Modernizr.sessionstorage, type: "html" });
                    this.supportedFeatures.push({ featureName: "SVG SMIL animation", isSupported: Modernizr.smil, type: "misc" });
                    this.supportedFeatures.push({ featureName: "SVG", isSupported: Modernizr.svg, type: "misc" });
                    this.supportedFeatures.push({ featureName: "SVG Clipping Paths", isSupported: Modernizr.svgclippaths, type: "misc" });
                    this.supportedFeatures.push({ featureName: "text-shadow", isSupported: Modernizr.textshadow, type: "css" });
                    this.supportedFeatures.push({ featureName: "Touch Events", isSupported: Modernizr.touch, type: "misc" });
                    this.supportedFeatures.push({ featureName: "Video", isSupported: Modernizr.video, type: "html" });
                    this.supportedFeatures.push({ featureName: "WebGL", isSupported: Modernizr.webgl, type: "misc" });
                    this.supportedFeatures.push({ featureName: "Web Sockets", isSupported: Modernizr.websockets, type: "html" });
                    this.supportedFeatures.push({ featureName: "Web SQL Database", isSupported: Modernizr.websqldatabase, type: "html" });
                    this.supportedFeatures.push({ featureName: "Web Workers", isSupported: Modernizr.webworkers, type: "html" });
                    this.supportedFeatures.push({ featureName: "A [download] attribute", isSupported: Modernizr.adownload, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Mozilla Audio Data API", isSupported: Modernizr.audiodata, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "HTML5 Web Audio API", isSupported: Modernizr.webaudio, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Battery Status API", isSupported: Modernizr.battery, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Low Battery Level", isSupported: Modernizr.lowbattery, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Blob Constructor", isSupported: Modernizr.blobconstructor, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Canvas toDataURL image/jpeg", isSupported: Modernizr.todataurljpeg, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Canvas toDataURL image/png", isSupported: Modernizr.todataurlpng, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Canvas toDataURL image/webp", isSupported: Modernizr.todataurlwebp, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "HTML5 Content Editable Attribute", isSupported: Modernizr.contenteditable, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Content Security Policy", isSupported: Modernizr.contentsecuritypolicy, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "HTML5 Context Menu", isSupported: Modernizr.contextmenu, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Cookie", isSupported: Modernizr.cookies, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "Cross-Origin Resource Sharing", isSupported: Modernizr.cors, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS background-position Shorthand", isSupported: Modernizr.bgpositionshorthand, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS background-position-x/y", isSupported: Modernizr.bgpositionxy, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS background-repeat: space", isSupported: Modernizr.bgrepeatspace, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS background-repeat: round", isSupported: Modernizr.bgrepeatround, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS background-size: cover", isSupported: Modernizr.bgsizecover, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS Box Sizing", isSupported: Modernizr.boxsizing, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS Calc", isSupported: Modernizr.csscalc, type: "noncore" });
                    this.supportedFeatures.push({ featureName: "CSS Cubic Bezier Range", isSupported: Modernizr.cubicbezierrange, type: "noncore" });
                    //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-runin, type: "noncore" });
                    //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-table, type: "noncore" });

                    var message: any = {};
                    message.features = this.supportedFeatures;

                    Core.Messenger.sendRealtimeMessage(this.getID(), message, RuntimeSide.Client, "message");
                }
            });
        }

        public refresh(): void {
            var message: any = {};
            message.features = this.supportedFeatures;

            Core.Messenger.sendRealtimeMessage(this.getID(), message, RuntimeSide.Client, "message");
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {

        }

        // DASHBOARD
        private _cssFeaturesListTable: HTMLTableElement;
        private _htmlFeaturesListTable: HTMLTableElement;
        private _miscFeaturesListTable: HTMLTableElement;
        private _nonCoreFeaturesListTable: HTMLTableElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div,(filledDiv) => {
                this._cssFeaturesListTable = <HTMLTableElement>document.getElementById("cssFeaturesList");
                this._htmlFeaturesListTable = <HTMLTableElement>document.getElementById("htmlFeaturesList");
                this._miscFeaturesListTable = <HTMLTableElement>document.getElementById("miscFeaturesList");
                this._nonCoreFeaturesListTable = <HTMLTableElement>document.getElementById("nonCoreFeaturesList");
                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            var targettedTable;
            var supportedFeatures: FeatureSupported[] = receivedObject.features;
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
        }
    }

    // Register
    Core.RegisterPlugin(new ModernizrReport());
}