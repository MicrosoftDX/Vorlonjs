///<reference path='vorlon.office.tools.ts' />
///<reference path='vorlon.office.document.ts' />
///<reference path='vorlon.office.outlook.ts' />
///<reference path='../../vorlon.dashboardPlugin.ts' />
var $: any;

module VORLON {

    export class OfficeDashboard extends DashboardPlugin {

        private _treeDiv: HTMLDivElement;
        private _filledDiv: HTMLDivElement;
        private mailFunctions: OfficeOutlook;
        private documentFunctions: OfficeDocument;
        public refreshButton: Element;
        private treeviewwrapper: HTMLDivElement;
        private officetypeapp: HTMLSpanElement
          
        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("office", "control.html", "control.css");
            this._ready = true;
            this.mailFunctions = new OfficeOutlook(this);
            this.documentFunctions = new OfficeDocument(this);
        }

        //Return unique id for your plugin
        public getID(): string {
            return "OFFICE";
        }

        // This code will run on the dashboard //////////////////////

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._filledDiv = filledDiv;
                this._treeDiv = <HTMLDivElement>filledDiv.querySelector('#treeViewObj');
                this.refreshButton = this._filledDiv.querySelector('x-action[event="refresh"]');
                this.treeviewwrapper = <HTMLDivElement>this._filledDiv.querySelector('.tree-view-wrapper');
                this.officetypeapp = <HTMLSpanElement>this._filledDiv.querySelector('#office-type-app');
                this.clearTreeview();

                this._filledDiv.addEventListener('refresh', () => {
                    this.clearTreeview();
                    this.sendToClient({ type: "query", name: "Office" });
                    this.sendToClient({ type: 'officetype' })
                });


                var _pluginContainer = $(filledDiv).parent();
                _pluginContainer.on("vorlon.plugins.active", () => {
                    var container = $('.office-container');
                    container.split({
                        orientation: 'vertical',
                        limit: 50,
                        position: '70%'
                    });
                });


                $("#accordion h3", this._filledDiv).click((elt) => {
                    $('.visible', elt.target.parentElement).removeClass('visible');

                    $('#' + elt.target.className, elt.target.parentElement).addClass('visible');

                    elt.target.classList.add('visible');
                });

                this.sendToClient({ type: "query", name: "Office" });
                this.sendToClient({ type: 'officetype' })
            })
        }

        public update(remoteOffice: any) {

            this.constructTree(remoteOffice.value, this._treeDiv);

            if (remoteOffice.name === "Office") {
                this.sendToClient({ type: "query", name: "OfficeExt" });

                if (OfficeTools.IsOutlook()) {
                    this.mailFunctions.execute();
                } else {
                    this.sendToClient({ type: "query", name: "OfficeExtension" });
                    this.sendToClient({ type: "query", name: "Excel" });
                    this.sendToClient({ type: "query", name: "Word" });


                    this.documentFunctions.execute();
                }


            }


        }



        private clearTreeview() {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
        }



        public constructTree(currentObj: any, parent: any) {

            if (currentObj.properties === undefined || currentObj.properties.length === 0)
                return;

            // root of all
            var elt = new FluentDOM('DIV', 'objdescriptor', parent);

            // Create the div for the current path
            elt.append('DIV', 'expandable expanded', (zone) => {
                var btn: FluentDOM;
                zone.attr("id", currentObj.fullpath);
                
                // create the div containing both sigle (+ or -) and the label
                zone.append('DIV', 'expand', container => {
                    btn = container.createChild("SPAN", "expand-btn").text("-")
                    btn.click((arg) => {
                        arg.stopPropagation();
                        Tools.ToggleClass(zone.element, "expanded", (expanded) => {
                            expanded ? btn.text("-") : btn.text("+");
                        });
                    });
                    container.createChild("SPAN", "expand-label").text(currentObj.name);

                    if (currentObj.value !== undefined) {
                        container.createChild("SPAN", "prop-value").text(currentObj.value);
                    }


                });
                    
                // add the childs
                if (currentObj.properties !== undefined) {
                    zone.append("DIV", "expand-content", (itemsContainer) => {
                        for (var i in currentObj.properties) {
                            var p = currentObj.properties[i];

                            if (p.properties !== undefined) {
                                this.constructTree(p, itemsContainer.element);
                            } else {
                                itemsContainer.append("DIV", "obj-method", (methodItem: any) => {
                                    methodItem.createChild("SPAN", "prop-name").text(p.name);
                                    methodItem.createChild("SPAN", "prop-value").text(p.value);
                                    methodItem.element.tag = p;
                                    methodItem.click(arg => {
                                        arg.stopPropagation();
                                        OfficeTools.ShowProperty(arg.target.parentElement.tag);
                                    })
                                });

                            }

                        }
                    });

                }

            });
        }



        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(r: any): void {

            if (r.type === 'object') {
                this.update(r);
            } else if (r.type === 'function') {
                OfficeTools.ShowFunctionResult(r)
            } else if (r.type === 'officetype') {
                var officeType = OfficeTools.GetOfficeType(r.value.officeType)
                this.treeviewwrapper.style.background = officeType.background;
                this.officetypeapp.innerHTML = officeType.officeType + " " + officeType.version;
            } else if (r.type === 'error') {
                OfficeTools.ShowFunctionResult(r)
            }
        }

    }
    
    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new OfficeDashboard());
}
