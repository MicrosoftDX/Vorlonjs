module VORLON {
    declare var $: any;

    export interface ObjPropertyDescriptor {
        type: string;
        name: string;
        fullpath: string;
        contentFetched: boolean;
        value?: any;
        content: Array<ObjPropertyDescriptor>;
    }

    export class ObjectExplorerPlugin extends Plugin {

        private _selectedObjProperty;
        private _previousSelectedNode;
        private _currentPropertyPath: string;
        private _timeoutId;

        constructor() {
            super("objectExplorer", "control.html", "control.css");
            this._ready = false;
            this._contentCallbacks = {};
        }

        public getID(): string {
            return "OBJEXPLORER";
        }
        private STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        private ARGUMENT_NAMES = /([^\s,]+)/g;
        private rootProperty = 'window';

        private getFunctionArgumentNames(func) {
            var result = [];
            try {
                var fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
                result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
                if (result === null)
                    result = [];
            } catch (exception) {
                console.error(exception);
            }

            return result;
        }

        private _getProperty(propertyPath: string): ObjPropertyDescriptor {
            var selectedObj = window;
            var tokens = [this.rootProperty];
            console.log('get property for ' + (propertyPath || this.rootProperty));

            if (propertyPath && propertyPath !== this.rootProperty) {
                tokens = propertyPath.split('.');
                if (tokens && tokens.length) {                                
                    for (var i = 0, l = tokens.length; i < l; i++) {
                        selectedObj = selectedObj[tokens[i]];
                        if (!selectedObj)
                            break;
                    }
                }
            }

            if (!selectedObj) {
                console.log('not found');
                return { type: 'notfound', name: 'not found', fullpath: propertyPath, contentFetched: true, content: [] };
            }
            var res = this.getObjDescriptor(selectedObj, tokens, true);
            return res;
        }

        private getObjDescriptor(object: any, pathTokens: Array<string>, scanChild: boolean = false): ObjPropertyDescriptor {
            pathTokens = pathTokens || [];
            var name = pathTokens[pathTokens.length - 1];
            var type = typeof object;
            if (object === null) {
                type = 'null';
            }
            if (object === undefined) {
                type = 'undefined';
            }

            var fullpath = this.rootProperty;
            if (!name) {
                name = this.rootProperty;
                fullpath = this.rootProperty;
            } else {
                if (fullpath.indexOf(this.rootProperty + ".") !== 0 && pathTokens[0] !== this.rootProperty) {
                    fullpath = this.rootProperty + '.' + pathTokens.join('.');
                } else {
                    fullpath = pathTokens.join('.');
                }
            }

            //console.log('check ' + name + ' ' + type);
            var res = { type: type, name: name, fullpath: fullpath, contentFetched: false, content: [], value: null };

            if (type === 'string' || type === 'number' || type === 'boolean') {
                res.value = object.toString();
            } else if (type === 'function') {
                res.value = this.getFunctionArgumentNames(object).join(',');
            }

            if (object && scanChild) {                
                for (var e in object) {
                    var itemTokens = pathTokens.concat([e]);
                    res.content.push(this.getObjDescriptor(object[e], itemTokens, false));
                }
                res.contentFetched = true;
            }
            return res;
        }
        
        private _packageAndSendObjectProperty(type: string, path?: string) {
            path = path || this._currentPropertyPath;
            var packagedObject = this._getProperty(path);
            Core.Messenger.sendRealtimeMessage(this.getID(), { type: type, path: packagedObject.fullpath, property: packagedObject }, RuntimeSide.Client);
        }

        private _markForRefresh() {
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }

            this._timeoutId = setTimeout(() => {
                this.refresh();
            }, 10000);
        }

        public startClientSide(): void {
            document.addEventListener("DOMContentLoaded",() => {
                if (Core.Messenger.isConnected) {
                    document.addEventListener("DOMNodeInserted",() => {
                        this._markForRefresh();
                    });

                    document.addEventListener("DOMNodeRemoved",() => {
                        this._markForRefresh();
                    });
                }

                this.refresh();
            });
        }

        
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            switch (receivedObject.type) {
                case "query":
                    this._currentPropertyPath = receivedObject.path;
                    this._packageAndSendObjectProperty(receivedObject.type);
                    break;
                case "queryContent":
                    this._packageAndSendObjectProperty(receivedObject.type, receivedObject.path);
                    break;
                default:
                    break;
            }
        }

        public refresh(): void {
            this._packageAndSendObjectProperty('refresh');
        }

        // DASHBOARD
        private _containerDiv: HTMLElement;
        private _searchBoxInput: HTMLInputElement;
        private _searchBtn: HTMLButtonElement;
        private _treeDiv: HTMLElement;
        private _dashboardDiv: HTMLDivElement;
        private _contentCallbacks;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;

            this._insertHtmlContentAsync(this._dashboardDiv,(filledDiv) => {
                this._containerDiv = filledDiv;
                this._searchBoxInput = <HTMLInputElement>this._containerDiv.querySelector("#txtPropertyName");
                this._searchBtn = <HTMLButtonElement>this._containerDiv.querySelector("#btnSearchProp");
                this._treeDiv = <HTMLElement>this._containerDiv.querySelector("#treeViewObj");                

                this._searchBtn.onclick = () => {
                    var path = this._searchBoxInput.value;
                    if (path) {
                        this._currentPropertyPath = path;
                        this._queryObjectContent(path);
                    }
                }
                this._searchBoxInput.addEventListener("keydown",(evt) => {
                    if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                        var path = this._searchBoxInput.value;
                        if (path) {
                            this._currentPropertyPath = path;
                            this._queryObjectContent(path);
                        }
                    }
                });
                this._ready = true;
            });
        }

        private _queryObjectContent(objectPath: string) {
            Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "query",
                path: objectPath }, RuntimeSide.Dashboard);
        }
    
        private _appendSpan(parent: HTMLElement, className: string, value: string): void {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;

            parent.appendChild(span);
        }

        private _generateColorfullLink(link: HTMLAnchorElement, receivedObject: any): void {
            this._appendSpan(link, "nodeName", receivedObject.name);            
            this._appendSpan(link, "nodeType", '(' + receivedObject.type + ')');

            if (receivedObject.value) {
                this._appendSpan(link, "nodeValue", receivedObject.value);
            }
        }

        private _generateColorfullClosingLink(link: HTMLElement, receivedObject: any): void {
            this._appendSpan(link, "nodeTag", "&lt;/");
            this._appendSpan(link, "nodeName", receivedObject.name);
            this._appendSpan(link, "nodeTag", "&gt;");
        }

        private _generateButton(parentNode: HTMLElement, text: string, className: string, onClick: (button: HTMLElement) => void) {
            var button = document.createElement("div");
            button.innerHTML = text;
            button.className = className;
            button.addEventListener("click", () => onClick(button));
            parentNode.appendChild(button);
        }

        private _generateTreeNode(parentNode: HTMLElement, receivedObject: ObjPropertyDescriptor, first = false): void {
            var root = document.createElement("div");
            parentNode.appendChild(root);

            var container = document.createElement("div");
            container.style.display = 'none';
            var treeChilds = [];
            var renderChilds = () => {
                // Children
                if (receivedObject.contentFetched && receivedObject.content && receivedObject.content.length) {
                    container.style.display = '';
                    for (var index = 0; index < receivedObject.content.length; index++) {
                        var childObject = receivedObject.content[index];

                        this._generateTreeNode(container, childObject);
                    }
                }
            }

            var getTreeChilds = () => {
                if (receivedObject.content && receivedObject.content.length) {
                    return receivedObject.content.filter(function (item) {
                        return item.type === 'object';
                    });
                }

                return [];
            }

            treeChilds = getTreeChilds();

            if (receivedObject.type === 'object') {
                this._generateButton(root, "+", "treeNodeButton",(button) => {
                    if (!receivedObject.contentFetched) {
                        this._contentCallbacks[receivedObject.fullpath] = (propertyData) => {
                            this._contentCallbacks[receivedObject.fullpath] = null;
                            receivedObject.contentFetched = true;
                            receivedObject.content = propertyData.content;
                            treeChilds = getTreeChilds();
                            renderChilds();
                        }

                        Core.Messenger.sendRealtimeMessage(this.getID(), {
                            type: "queryContent",
                            path: receivedObject.fullpath
                        }, RuntimeSide.Dashboard);
                    }

                    if (container.style.display === "none") {
                        container.style.display = "";
                        button.innerHTML = "-";
                    } else {
                        container.style.display = "none";
                        button.innerHTML = "+";
                    }
                });
            }

            // Main node
            var linkText = document.createElement("a");
            
            this._generateColorfullLink(linkText, receivedObject);

            linkText.addEventListener("click",() => {
                this._searchBoxInput.value = receivedObject.fullpath;
                this._queryObjectContent(receivedObject.fullpath);
            });

            linkText.href = "#";

            linkText.className = "treeNodeHeader";

            root.appendChild(linkText);
            root.className = first ? "firstTreeNodeText" : "treeNodeText";

            renderChilds();

            root.appendChild(container);
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === 'query' || receivedObject.type === 'refresh') {
                while (this._treeDiv.hasChildNodes()) {
                    this._treeDiv.removeChild(this._treeDiv.lastChild);
                }
                this._searchBoxInput.value = receivedObject.path;
                this._generateTreeNode(this._treeDiv, receivedObject.property, true);
            } else if (receivedObject.type === 'queryContent') {
                var callback = this._contentCallbacks[receivedObject.path];
                if (callback) {
                    callback(receivedObject.property);
                }
            }
        }
    }

    // Register
    Core.RegisterPlugin(new ObjectExplorerPlugin());
}
