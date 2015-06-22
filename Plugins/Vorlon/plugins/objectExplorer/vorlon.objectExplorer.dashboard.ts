module VORLON {
    declare var $: any;

    export class ObjectExplorerDashboard extends DashboardPlugin {
        private _containerDiv: HTMLElement;
        private _searchBoxInput: HTMLInputElement;
        private _filterInput: HTMLInputElement;
        private _searchBtn: HTMLButtonElement;
        private _searchUpBtn: HTMLButtonElement;
        private _treeDiv: HTMLElement;
        private _dashboardDiv: HTMLDivElement;
        private _contentCallbacks;
        private _currentPropertyPath: string;
        private root: ObjDescriptorControl;

        constructor() {
            super("objectExplorer", "control.html", "control.css");
            this._id = "OBJEXPLORER";
            this._ready = false;
            this.debug = true;
            this._contentCallbacks = {};
        }

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;

            this._insertHtmlContentAsync(this._dashboardDiv,(filledDiv) => {
                this._containerDiv = filledDiv;
                this._filterInput = <HTMLInputElement>this._containerDiv.querySelector("#txtFilter");
                this._searchBoxInput = <HTMLInputElement>this._containerDiv.querySelector("#txtPropertyName");
                this._searchBtn = <HTMLButtonElement>this._containerDiv.querySelector("#btnSearchProp");
                this._searchUpBtn = <HTMLButtonElement>this._containerDiv.querySelector("#btnSearchUp");
                this._treeDiv = <HTMLElement>this._containerDiv.querySelector("#treeViewObj");
                this._addLoader();

                this._searchBtn.onclick = () => {
                    var path = this._searchBoxInput.value;
                    if (path) {
                        this.setCurrent(path);
                    }
                }

                this._searchUpBtn.onclick = () => {
                    var path = this._searchBoxInput.value;
                    if (path) {
                        var tokens = path.split('.');
                        if (tokens.length > 1) {
                            tokens.splice(tokens.length - 1, 1);
                            this.setCurrent(tokens.join('.'));
                        }
                    }
                }

                this._searchBoxInput.addEventListener("keydown",(evt) => {
                    if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                        var path = this._searchBoxInput.value;
                        if (path) {
                            this.setCurrent(path);
                        }
                    }
                });

                this._filterInput.addEventListener("input",(evt) => {
                    //setTimeout(function(){});
                    this.filter();
                });

                this._ready = true;
            });
        }

        private _addLoader() {
            var loader = document.createElement("div");
            loader.className = "loader";
            loader.innerHTML = '<span class="fa fa-spinner fa-spin"></span> loading...';

            this._treeDiv.appendChild(loader);
        }

        private setCurrent(path) {
            if (path !== this._currentPropertyPath)
                this._filterInput.value = '';

            this._searchBoxInput.value = path;
            this._currentPropertyPath = path;
            this._queryObjectContent(this._currentPropertyPath);
            this._empty();
            this._treeDiv.scrollTop = 0;
            this._addLoader();
        }

        private filter() {
            var path = this._filterInput.value.toLowerCase();
            var items = this._treeDiv.querySelectorAll("[data-propname]");
            for (var index = 0, l = items.length; index < l; index++) {
                var node = <HTMLElement>items[index];
                var propname = node.getAttribute('data-propname');
                if (!propname || !path) {
                    node.style.display = '';
                } else {
                    if (propname.indexOf(path) >= 0) {
                        node.style.display = '';
                    } else {
                        node.style.display = 'none';
                    }
                }
            }
        }

        private _queryObjectContent(objectPath: string) {
            this.sendCommandToClient("query", {path: objectPath });
        }        

        private _sortedList(list: ObjExplorerObjDescriptor[]) {
            if (list && list.length) {
                return list.sort(function (a, b) {
                    var lowerAName = a.name.toLowerCase();
                    var lowerBName = b.name.toLowerCase();

                    if (lowerAName > lowerBName)
                        return 1;
                    if (lowerAName < lowerBName)
                        return -1;
                    return 0;
                });
            }

            return [];
        }

        private _render(tagname: string, parentNode: HTMLElement, classname?: string, value?: string): HTMLElement {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        }

        private _empty() {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            
        }

        public setRoot(obj: ObjExplorerObjDescriptor) {
            this._searchBoxInput.value = obj.fullpath;
            this._currentPropertyPath = obj.fullpath;
            if (this.root) {
                this.root.dispose();
                this.root = null;
            }
            this._empty();

            this.root = new ObjDescriptorControl(this, this._treeDiv, obj, true);
        }

        public setContent(obj: ObjExplorerObjDescriptor) {
            if (this.root) {
                this.root.setContent(obj);
            }
        }
    }

    class ObjDescriptorControl {
        element: HTMLElement;
        proto: ObjDescriptorControl;
        item: ObjExplorerObjDescriptor;
        plugin: ObjectExplorerDashboard;
        childs: Array<ObjDescriptorControl>;
        isRoot: boolean;

        constructor(plugin: ObjectExplorerDashboard, parent: HTMLElement, item: ObjExplorerObjDescriptor, isRoot: boolean = false) {
            var elt = new FluentDOM('DIV', 'objdescriptor', parent);
            this.element = elt.element;
            this.isRoot = isRoot;
            this.element.__vorlon = this;
            this.item = item;
            this.plugin = plugin;
            this.childs = [];
            this.render(elt);            
        }

        private clear() {
            if (this.childs) {
                this.childs.forEach(function (c) {
                    c.dispose();
                });
                this.childs = [];
            }
            if (this.proto)
                this.proto.dispose();
            this.element.innerHTML = "";
        }

        public dispose() {
            this.clear();
            this.element.__vorlon = null;
            this.plugin = null;
            this.element = null;
            this.item = null;
        }

        public setContent(item: ObjExplorerObjDescriptor) {
            if (!item.fullpath)
                return false;

            console.log("checking " + item.fullpath + "/" + this.item.fullpath + " (" + this.childs.length + ")");

            if (item.fullpath == this.item.fullpath) {
                this.item = item;
                this.render();
                return true;
            } else {
                if (item.fullpath.indexOf(this.item.fullpath) === 0) {
                    for (var i = 0, l = this.childs.length; i < l; i++) {
                        if (this.childs[i].setContent(item)) {
                            return true;
                        }
                    }
                }                
            }

            if (this.proto && this.proto.setContent(item)) {
                return true;
            }

            return false;
        }

        public render(elt?: FluentDOM) {
            if (!elt)
                elt = FluentDOM.for(this.element);

            this.clear();
            
            if (!this.item) {
                return;
            }

            if (this.item.proto) {
                elt.append('DIV', 'objdescriptor-prototype expandable',(protoContainer) => {
                    var btn: FluentDOM;
                    protoContainer.append("DIV", "expand",(expandContainer) => {
                        btn = expandContainer.createChild("SPAN", "expand-btn").text("+");
                        expandContainer.createChild("SPAN", "expand-label").text("[Prototype]");
                    }).click((arg) => {
                        arg.stopPropagation();
                        Tools.ToggleClass(protoContainer.element, "expanded",(expanded) => {
                            expanded ? btn.text("-") : btn.text("+");
                        });
                    });

                    protoContainer.append("DIV", "expand-content",(itemsContainer) => {
                        this.proto = new ObjDescriptorControl(this.plugin, itemsContainer.element, this.item.proto);
                    });
                });
            }

            if (this.item.functions && this.item.functions.length) {
                elt.append('DIV', 'objdescriptor-methods expandable',(methodsContainer) => {
                    var btn: FluentDOM;
                    methodsContainer.append("DIV", "expand",(expandContainer) => {
                        btn = expandContainer.createChild("SPAN", "expand-btn").text("+")
                        expandContainer.createChild("SPAN", "expand-label").text("[Methods]");
                    }).click((arg) => {
                        arg.stopPropagation();
                        Tools.ToggleClass(methodsContainer.element, "expanded", (expanded) => {
                            expanded? btn.text("-") : btn.text("+");
                        });
                    });

                    methodsContainer.append("DIV", "expand-content",(itemsContainer) => {
                        this.item.functions.forEach((p) => {
                            itemsContainer.append("DIV", "obj-method",(methodItem) => {
                                if (this.isRoot)
                                    methodItem.attr("data-propname",(this.item.fullpath + "." + p.name).toLowerCase());
                    
                                methodItem.createChild("SPAN", "method-name").text(p.name);
                            });
                        });
                    });
                });
            }

            if (this.item.properties && this.item.properties.length) {
                elt.append('DIV', 'objdescriptor-properties',(propertiesContainer) => {
                    this.item.properties.forEach((p) => {
                        this.renderProperty(propertiesContainer, p);
                        
                    });
                });
            }
        }

        public renderProperty(container: FluentDOM, prop: ObjExplorerPropertyDescriptor) {
            if (prop.type !== "object") {
                container.append("DIV", "property", (propContainer) => {
                    if (this.isRoot)
                        propContainer.attr("data-propname",(this.item.fullpath + "." + prop.name).toLowerCase());
                    propContainer.createChild("SPAN", "prop-name").text(prop.name);
                    propContainer.createChild("SPAN", "prop-value").text(prop.value);
                });
                return;
            }

            container.append('DIV', 'prop-object expandable', (propContainer) => {
                var btn: FluentDOM;

                if (this.isRoot)
                    propContainer.attr("data-propname",(this.item.fullpath + "." + prop.name).toLowerCase());

                propContainer.append("DIV", "expand",(expandContainer) => {
                    btn = expandContainer.createChild("SPAN", "expand-btn").text("+");
                    expandContainer.createChild("SPAN", "expand-label").text(prop.name);
                }).click((arg) => {
                    arg.stopPropagation();
                    Tools.ToggleClass(propContainer.element, "expanded", (expanded) => {
                        if (!expanded) {
                            btn.text("+");
                            return;
                        }

                        btn.text("-");
                        var elt = propContainer.element.querySelector(".expand-content > .objdescriptor");
                        if (elt) {
                            var ctrl = <ObjDescriptorControl>elt.__vorlon;
                            if (ctrl) {
                                ctrl.getContent();
                            }
                        }
                    });
                });

                propContainer.append("DIV", "expand-content",(itemsContainer) => {
                    var child = new ObjDescriptorControl(this.plugin, itemsContainer.element, <ObjExplorerObjDescriptor>prop);
                    this.childs.push(child);
                });
            });
        }

        public getContent() {
            this.plugin.sendCommandToClient("queryContent", { path: this.item.fullpath });
        }
    }

    class ObjFunctionControl {
    }

    class ObjPropertyControl {
    }

    ObjectExplorerDashboard.prototype.DashboardCommands = {
        root: function (data: ObjExplorerObjDescriptor) {
            var plugin = <ObjectExplorerDashboard>this;
            plugin.setRoot(data);
        },

        content: function (data: ObjExplorerObjDescriptor) {
            var plugin = <ObjectExplorerDashboard>this;
            plugin.setContent(data);
        }
    }
    // Register
    Core.RegisterDashboardPlugin(new ObjectExplorerDashboard());
}
