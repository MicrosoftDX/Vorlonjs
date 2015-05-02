module VORLON {
    declare var $: any;

    interface ObjPropertyDescriptor {
        type: string;
        name: string;
        fullpath: string;
        content: Array<ObjPropertyDescriptor>;
    }

    export class ObjectExplorer extends Plugin {

        private _selectedObjProperty;
        private _previousSelectedNode;
        private _currentPropertyPath: string;
        private _timeoutId;

        constructor() {
            super("objectExplorer", "control.html", "control.css");
            this._ready = false;
        }

        public getID(): string {
            return "OBJEXPLORER";
        }

        private _getProperty(propertyPath: string): ObjPropertyDescriptor {
            var selectedObj = window;
            var roottokens = ['window'];
            var tokens = roottokens;
            console.log('get property for ' + propertyPath);

            if (propertyPath && propertyPath !== 'window') {
                tokens = propertyPath.split('.');
                if (tokens && tokens.length) {
                    for (var i = 0, l = tokens.length; i < l; i++) {
                        selectedObj = selectedObj[tokens[i]];
                        if (!selectedObj)
                            break;
                    }
                }
            }

            if (!selectedObj)
                return { type: 'notfound', name: '', fullpath: propertyPath, content: [] };

            var res = this.getObjDescriptor(selectedObj, tokens, true);
            return res;
        }

        private getObjDescriptor(object: any, pathTokens: Array<string>, scanChild: boolean = false): ObjPropertyDescriptor {
            pathTokens = pathTokens || [];
            var name = pathTokens[pathTokens.length - 1];
            var fullpath = 'window';
            if (!name) {
                name = 'window';
                fullpath = 'window';
            } else {
                fullpath = fullpath + '.' + pathTokens.join('.');
            }
            var res = { type: typeof object, name: name, fullpath: fullpath, content: [] };
            if (object && scanChild) {                
                for (var e in object) {
                    var itemTokens = pathTokens.concat([e]);
                    res.content.push(this.getObjDescriptor(object[e], itemTokens, false));
                }
            }
            return res;
        }
        
        private _packageAndSendObjectProperty() {
            var packagedObject = this._getProperty(this._currentPropertyPath);
            Core.Messenger.sendRealtimeMessage(this.getID(), packagedObject, RuntimeSide.Client);
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
                    this._packageAndSendObjectProperty();
                    break;
                default:
                    break;
            }
        }

        public refresh(): void {
            this._packageAndSendObjectProperty();
        }

        // DASHBOARD
        private _containerDiv: HTMLElement;
        private _searchBoxInput: HTMLInputElement;
        private _searchBtn: HTMLButtonElement;
        private _treeDiv: HTMLElement;
        private _objectContentView: HTMLElement;
        private _dashboardDiv: HTMLDivElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;

            this._insertHtmlContentAsync(this._dashboardDiv,(filledDiv) => {
                this._containerDiv = filledDiv;
                this._searchBoxInput = <HTMLInputElement>this._containerDiv.querySelector("#txtPropertyName");
                this._searchBtn = <HTMLButtonElement>this._containerDiv.querySelector("#btnSearchProp");
                this._treeDiv = <HTMLElement>this._containerDiv.querySelector("#treeViewObj");
                this._objectContentView = <HTMLElement>this._containerDiv.querySelector("#objectContentView");

                $('.obj-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });

                this._searchBtn.onclick = () => {
                    var path = this._searchBoxInput.value;
                    if (path) {
                        this._currentPropertyPath = path;
                        this._queryObjectContent(path);
                    }
                }

                this._ready = true;
            });
        }

        private _queryObjectContent(objectPath: string) {
            Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "query",
                path: objectPath }, RuntimeSide.Dashboard);
        }

        private _makeEditable(element: HTMLElement): void {
            element.contentEditable = "true";
            element.focus();
            Tools.AddClass(element, "editable");

            var range = document.createRange();
            range.setStart(element, 0);
            range.setEnd(element, 1);
            window.getSelection().addRange(range);
        }

        private _generateClickableValue(label: HTMLElement, value: string, internalId: string): HTMLElement {
            // Value
            var valueElement = document.createElement("div");
            valueElement.contentEditable = "false";
            valueElement.innerHTML = value || "&nbsp;";
            valueElement.className = "styleValue";

            valueElement.addEventListener("keydown",(evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    Core.Messenger.sendRealtimeMessage(this.getID(), {
                        type: "ruleEdit",
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    }, RuntimeSide.Dashboard);
                    evt.preventDefault();
                    valueElement.contentEditable = "false";
                    Tools.RemoveClass(valueElement, "editable");
                }
            });

            valueElement.addEventListener("blur",() => {
                valueElement.contentEditable = "false";
                Tools.RemoveClass(valueElement, "editable");
            });

            valueElement.addEventListener("click",() => this._makeEditable(valueElement));

            return valueElement;
        }

        private _generateSelectedPropertyDescription(selectedProperty): void {
            while (this._objectContentView.hasChildNodes()) {
                this._objectContentView.removeChild(this._objectContentView.lastChild);
            }
        }

        private _appendSpan(parent: HTMLElement, className: string, value: string): void {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;

            parent.appendChild(span);
        }

        private _generateColorfullLink(link: HTMLAnchorElement, receivedObject: any): void {
            this._appendSpan(link, "nodeName", receivedObject.name);            
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

        private _generateTreeNode(parentNode: HTMLElement, receivedObject: any, first = false): void {
            var root = document.createElement("div");
            parentNode.appendChild(root);

            var container = document.createElement("div");

            this._generateButton(root, "-", "treeNodeButton", (button) => {
                if (container.style.display === "none") {
                    container.style.display = "";
                    button.innerHTML = "-";
                } else {
                    container.style.display = "none";
                    button.innerHTML = "+";
                }
            });

            // Main node
            var linkText = document.createElement("a");
            (<any>linkText).__targetInternalId = receivedObject.internalId;

            this._generateColorfullLink(linkText, receivedObject);

            linkText.addEventListener("click",() => {
                if (this._previousSelectedNode) {
                    Tools.RemoveClass(this._previousSelectedNode, "treeNodeSelected");
                }

                Tools.AddClass(linkText, "treeNodeSelected");

                this._generateSelectedPropertyDescription(receivedObject);

                this._previousSelectedNode = linkText;
            });

            linkText.href = "#";

            linkText.className = "treeNodeHeader";

            root.appendChild(linkText);
            root.className = first ? "firstTreeNodeText" : "treeNodeText";

            // Children
            if (receivedObject.content) {
                for (var index = 0; index < receivedObject.content.length; index++) {
                    var childObject = receivedObject.content[index];

                    this._generateTreeNode(container, childObject);
                }
            }

            //if (receivedObject.name) {
            //    var closingLink = document.createElement("div");
            //    closingLink.className = "treeNodeClosingText";
            //    this._generateColorfullClosingLink(closingLink, receivedObject);

            //    container.appendChild(closingLink);
            //}

            root.appendChild(container);
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }

            this._generateTreeNode(this._treeDiv, receivedObject, true);
        }
    }

    // Register
    Core.RegisterPlugin(new ObjectExplorer());
}
