﻿module VORLON {
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
            this._id = "OBJEXPLORER";
            this._ready = false;
            this._contentCallbacks = {};
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
            this.sendToDashboard({ type: type, path: packagedObject.fullpath, property: packagedObject });
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
        private _filterInput: HTMLInputElement;
        private _searchBtn: HTMLButtonElement;
        private _searchUpBtn: HTMLButtonElement;
        private _treeDiv: HTMLElement;
        private _dashboardDiv: HTMLDivElement;
        private _contentCallbacks;

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

        private _addLoader(){
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
        
        private filter(){
            var path = this._filterInput.value.toLowerCase();
            var items = this._treeDiv.children;
            for (var index=0, l=items.length ; index < l ; index++){
                var node = <HTMLElement>items[index];
                var propname = node.getAttribute('data-propname');
                if (!propname || !path){
                    node.style.display = '';
                }else{
                    if (propname.indexOf(path) >= 0){
                        node.style.display = '';
                    }else{
                        node.style.display = 'none';
                    }
                }
            }
        }

        private _queryObjectContent(objectPath: string) {
            this.sendToClient({ type: "query", path: objectPath });
        }
    
        private _appendSpan(parent: HTMLElement, className: string, value: string): void {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;

            parent.appendChild(span);
        }

        private _generateColorfullLink(link: HTMLAnchorElement, receivedObject: any): void {
            this._appendSpan(link, "nodeName", receivedObject.name);     
            
            if (receivedObject.type !== 'object') {
                this._appendSpan(link, "nodeType", '(' + receivedObject.type + ')');
            }

            if (receivedObject.value) {
                this._appendSpan(link, "nodeValue", receivedObject.value);
            }
        }        

        private _generateButton(parentNode: HTMLElement, text: string, className: string, onClick: (button: HTMLElement) => void) {
            var button = this._render("div", parentNode, className, text);
            button.addEventListener("click", () => onClick(button));
            return button;
        }

        private _sortedList(list : ObjPropertyDescriptor[]){
            if (list && list.length){
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
        
        private _render(tagname: string, parentNode:HTMLElement, classname?:string, value?: string): HTMLElement {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        }
        
        private _generateTreeNode(parentNode: HTMLElement, receivedObject: ObjPropertyDescriptor, first = false): void {
            var root = this._render("div", parentNode);
            root.setAttribute('data-propname', receivedObject.name.toLowerCase());
            var nodeButton = null;
            var fetchingNode = false;
            var label = this._render("div", root, 'labels');            
            var container = this._render("div", root, 'childNodes');
            container.style.display = 'none';
            
            var renderChilds = () => {
                if (receivedObject.contentFetched && receivedObject.content && receivedObject.content.length) {
                    var nodes = this._sortedList(receivedObject.content);

                    for (var index = 0, l=nodes.length; index < l; index++) {
                        this._generateTreeNode(container, nodes[index]);
                    }
                    container.style.display = '';                    
                }
            }            
            
            var toggleNode = (button) => {
                if (!fetchingNode && !receivedObject.contentFetched) {
                    fetchingNode = true;
                    var spinner = this._render("span", label, "loader", '&nbsp;<span class="fa fa-spinner fa-spin"></span>');
                    this._contentCallbacks[receivedObject.fullpath] = (propertyData) => {
                        label.removeChild(spinner);
                        this._contentCallbacks[receivedObject.fullpath] = null;
                        receivedObject.contentFetched = true;
                        receivedObject.content = propertyData.content;
                        renderChilds();
                    }

                    this.sendToClient({
                        type: "queryContent",
                        path: receivedObject.fullpath
                    });
                }

                if (container.style.display === "none") {
                    container.style.display = "";
                    button.innerHTML = "-";
                } else {
                    container.style.display = "none";
                    button.innerHTML = "+";
                }
            };

            if (receivedObject.type === 'object') {
                nodeButton = this._generateButton(label, "+", "treeNodeButton",(button) => {
                    toggleNode(nodeButton);
                });
            }

            // Main node
            var linkText = null;
                        
            if (receivedObject.type === 'object') {
                linkText = this._render("a", label, "treeNodeHeader");
                linkText.addEventListener("click",() => {
                    toggleNode(nodeButton);
                });
                linkText.href = "#";
            } else {
                linkText = this._render("span", label);
            }

            this._generateColorfullLink(linkText, receivedObject);
            label.appendChild(linkText);

            if (receivedObject.type === 'object') {
                this._generateButton(label, "", "attachNode fa fa-reply",(button) => {
                    this.setCurrent(receivedObject.fullpath);
                });
            }

            root.className = first ? "firstTreeNodeText" : "treeNodeText";

            renderChilds();
        }

        private _empty(){
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
        }
        
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === 'query' || receivedObject.type === 'refresh') {
                this._empty();
                this._searchBoxInput.value = receivedObject.path;
                this._currentPropertyPath = receivedObject.path;
                if (receivedObject.property.content && receivedObject.property.content.length){
                    var nodes = this._sortedList(receivedObject.property.content);
                    for (var index=0, length=nodes.length; index<length ; index++){
                        this._generateTreeNode(this._treeDiv, nodes[index], true);    
                    }                    
                } else {
                    this._generateTreeNode(this._treeDiv, receivedObject.property, true);    
                }
                this.filter();
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
