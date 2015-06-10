module VORLON {
    declare var $: any;
    export class DOMExplorer extends Plugin {

        private _internalId = 0;
        private _lastElementSelectedClientSide;
        private _newAppliedStyles = {};
        private _newAppliedAttributes = {};
        private _lastContentState = '';
        private _lastReceivedObject = null;

        constructor() {
            super("domExplorer", "control.html", "control.css");
            this._id = "DOM";
            this._ready = false;
            this._debug = true;
        }

        public static getAppliedStyles(node: HTMLElement): string[] {
            // Style sheets
            var styleNode = new Array<string>();
            var sheets = <any>document.styleSheets;
            var style: CSSStyleDeclaration;
            var appliedStyles = new Array<string>();

            for (var c = 0; c < sheets.length; c++) {

                var rules = sheets[c].rules || sheets[c].cssRules;

                if (!rules) {
                    continue;
                }

                for (var r = 0; r < rules.length; r++) {
                    var rule = rules[r];
                    var selectorText = rule.selectorText;

                    try {
                        var matchedElts = document.querySelectorAll(selectorText);

                        for (var index = 0; index < matchedElts.length; index++) {
                            var element = matchedElts[index];
                            style = rule.style;
                            if (element === node) {
                                for (var i = 0; i < style.length; i++) {
                                    if (appliedStyles.indexOf(style[i]) === -1) {
                                        appliedStyles.push(style[i]);
                                    }
                                }
                            }
                        }
                    }
                    catch (e) {
                        // Ignoring this rule - Angular.js, etc..
                    }
                }
            }

            // Local style
            style = node.style;
            if (style) {
                for (index = 0; index < style.length; index++) {
                    if (appliedStyles.indexOf(style[index]) === -1) {
                        appliedStyles.push(style[index]);
                    }
                }
            }

            // Get effective styles
            var winObject = document.defaultView || window;
            for (index = 0; index < appliedStyles.length; index++) {
                var appliedStyle = appliedStyles[index];
                if (winObject.getComputedStyle) {
                    styleNode.push(appliedStyle + ":" + winObject.getComputedStyle(node, "").getPropertyValue(appliedStyle));
                }
            }

            return styleNode;
        }

        private _packageNode(node: any): PackagedNode {
            var packagedNode = {
                id: node.id,
                type: node.nodeType,
                name: node.localName,
                classes: node.className,
                content: node.textContent,
                hasChildNodes: false,
                attributes: node.attributes ? Array.prototype.map.call(node.attributes, (attr) => {
                    return [attr.name, attr.value];
                }) : [],
                styles: DOMExplorer.getAppliedStyles(node),
                children: [],
                rootHTML: null,
                internalId: VORLON.Tools.CreateGUID()
            };
            if (node.__vorlon) {
                packagedNode.internalId = node.__vorlon.internalId;
            }
            else {
                node.__vorlon = <any>{
                    internalId: packagedNode.internalId
                };
            }
            return packagedNode;
        }

        private _packageDOM(root: HTMLElement, packagedObject: PackagedNode, withChildsNodes: boolean = false): void {
            if (!root.childNodes || root.childNodes.length === 0) {
                return;
            }

            for (var index = 0; index < root.childNodes.length; index++) {
                var node = <HTMLElement>root.childNodes[index];

                var packagedNode = this._packageNode(node);
                if (node.childNodes && node.childNodes.length > 1) {
                    packagedNode.hasChildNodes = true;
                }
                else if (withChildsNodes || node.childNodes.length == 1) {
                    this._packageDOM(node, packagedNode, withChildsNodes);
                }
                packagedObject.children.push(packagedNode);
            }
        }

        private _packageAndSendDOM(element: HTMLElement) {
            this._internalId = 0;
            this._newAppliedStyles = {};
            this._newAppliedAttributes = {};

            var packagedObject = this._packageNode(element);
            packagedObject.rootHTML = element.innerHTML;
            this._packageDOM(element, packagedObject, false);

            this.sendCommandToDashboard('refreshNode', packagedObject);
        }

        private _markForRefresh() {
            this.refresh();
        }

        public startClientSide(): void {
        }

        private _getElementByInternalId(internalId: string, node: any): any {
            if (node.__vorlon && node.__vorlon.internalId === internalId) {
                return node;
            }
            if (!node.children) {
                return null;
            }

            for (var index = 0; index < node.children.length; index++) {
                var result = this._getElementByInternalId(internalId, node.children[index]);
                if (result) {
                    return result;
                }
            }
            return null;
        }

        public setClientSelectedElement(elementId: string) {
            var element = this._getElementByInternalId(elementId, document.body);

            if (!element) {
                return;
            }
            element.__savedOutline = element.style.outline;
            element.style.outline = "2px solid red";
            this._lastElementSelectedClientSide = element;
        }
        public unselectClientElement() {
            if (this._lastElementSelectedClientSide)
                this._lastElementSelectedClientSide.style.outline = this._lastElementSelectedClientSide.__savedOutline;
        }
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            //var obj = <ReceivedObjectClientSide>receivedObject;
            //if (!obj.order) {
            //    switch (obj.type) {
            //        case ReceivedObjectClientSideType.unselect:
            //            if (this._lastElementSelectedClientSide) {
            //                this._lastElementSelectedClientSide.style.outline = this._lastElementSelectedClientSide.__savedOutline;
            //            }
            //            break;
            //        case ReceivedObjectClientSideType.refresh:
            //            if (this._lastElementSelectedClientSide) {
            //                this._lastElementSelectedClientSide.style.outline = this._lastElementSelectedClientSide.__savedOutline;
            //            }

            //            this.refresh();
            //            this._lastContentState = document.body.innerHTML;
            //            break;
            //        case ReceivedObjectClientSideType.refreshbyid:
            //            this.refreshbyId(obj.internalID);
            //            this._lastContentState = document.body.innerHTML;
            //            break;
            //    }
            //    return;
            //}

            //else {
            //    var element = this._getElementByInternalId(obj.order, document.body);

            //    if (!element) {
            //        return;
            //    }
            //}
            //switch (obj.type) {
            //    //case ReceivedObjectClientSideType.select:
            //    //    element.__savedOutline = element.style.outline;
            //    //    element.style.outline = "2px solid red";
            //    //    this._lastElementSelectedClientSide = element;
            //    //    break;
            //    //case ReceivedObjectClientSideType.unselect:
            //    //    element.style.outline = element.__savedOutline;
            //    //    break;
            //    //case ReceivedObjectClientSideType.ruleEdit:
            //    //    element.style[obj.property] = obj.newValue;
            //    //    break;
            //    //case ReceivedObjectClientSideType.attributeEdit:
            //    //    if (obj.attributeName !== "attributeName") {
            //    //        try {
            //    //            element.removeAttribute(obj.attributeOldName);
            //    //        }
            //    //        catch (e) { }
            //    //        if (obj.attributeName)
            //    //            element.setAttribute(obj.attributeName, obj.attributeValue);
            //    //        if (obj.attributeName && obj.attributeName.indexOf('on') === 0) {
            //    //            element[obj.attributeName] = function () {
            //    //                try { eval(obj.attributeValue); }
            //    //                catch (e) { console.error(e); }
            //    //            };
            //    //        }
            //    //    }
            //    //    break;
            //    //case ReceivedObjectClientSideType.valueEdit:
            //    //    element.innerHTML = obj.newValue;
            //    //    break;
            //}
        }

        public refresh(): void {
            var packagedObject = this._packageNode(document.body);
            packagedObject.rootHTML = document.body.innerHTML;
            this._packageDOM(document.body, packagedObject, false);

            this.sendCommandToDashboard('init', packagedObject);
        }
        public setStyle(internaID: string, property: string, newValue: string): void {
            var element = this._getElementByInternalId(internaID, document.body);
            element.style[property] = newValue;
        }
        public setAttribute(internaID: string, attributeName: string, attributeOldName: string, attributeValue: string): void {
            var element = this._getElementByInternalId(internaID, document.body);
            if (attributeName !== "attributeName") {
                try {
                    element.removeAttribute(attributeOldName);
                }
                catch (e) { }
                if (attributeName)
                    element.setAttribute(attributeName, attributeValue);
                if (attributeName && attributeName.indexOf('on') === 0) {
                    element[attributeName] = function () {
                        try { eval(attributeValue); }
                        catch (e) { console.error(e); }
                    };
                }
            }
        }
        public refreshbyId(internaID: any): void {
            if (internaID)
                this._packageAndSendDOM(this._getElementByInternalId(internaID, document.body));
        }
        public setElementValue(internaID: string, value: string) {
            var element = this._getElementByInternalId(internaID, document.body);
            element.innerHTML = value;
        }
        // DASHBOARD
        private _containerDiv: HTMLElement;
        private _treeDiv: HTMLElement;
        private _styleView: HTMLElement;
        private _dashboardDiv: HTMLDivElement;
        public _refreshButton: Element;
        public _clikedNodeID = null;
        public _selectedNode: DomExplorerNode;
        public _rootNode: DomExplorerNode;


        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;

            this._insertHtmlContentAsync(this._dashboardDiv, (filledDiv: HTMLElement) => {
                this._containerDiv = filledDiv;
                this._treeDiv = Tools.QuerySelectorById(filledDiv, "treeView");
                this._styleView = Tools.QuerySelectorById(filledDiv, "styleView");
                this._refreshButton = this._containerDiv.querySelector('x-action[event="refresh"]');

                setInterval(() => {
                    this.sendCommandToClient('dirtycheck');
                }, 4000);

                this._containerDiv.addEventListener('refresh', () => {
                    this.sendToClient({
                        type: ReceivedObjectClientSideType.refresh,
                        order: null
                    });
                });

                this._treeDiv.addEventListener('click', (e: Event) => {
                    var button = <HTMLElement>e.target;
                    if (button.className.match('treeNodeButton')) {
                        button.hasAttribute('data-collapsed') ? button.removeAttribute('data-collapsed') : button.setAttribute('data-collapsed', '');
                    }
                });

                this._treeDiv.addEventListener('mouseenter', (e: Event) => {
                    var node = <HTMLElement>e.target;
                    var parent = node.parentElement;
                    var isHeader = node.className.match('treeNodeHeader');
                    if (isHeader || parent.className.match('treeNodeClosingText')) {
                        if (isHeader) {
                            parent.setAttribute('data-hovered-tag', '');
                        }
                        else {
                            parent.parentElement.parentElement.setAttribute('data-hovered-tag', '');
                        }
                    }
                }, true);

                this._treeDiv.addEventListener('mouseleave', (e: Event) => {
                    var node = <HTMLElement>e.target;
                    if (node.className.match('treeNodeHeader') || node.parentElement.className.match('treeNodeClosingText')) {
                        var hovered = this._treeDiv.querySelector('[data-hovered-tag]')
                        if (hovered) hovered.removeAttribute('data-hovered-tag');
                    }
                }, true);

                $('.dom-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
                $('#accordion').accordion({
                    heightStyle: "content"
                });

                this._ready = true;
            });
        }
        private _makeEditable(element: HTMLElement): void {
            element.contentEditable = "true";
            Tools.AddClass(element, "editable");
            //var range = document.createRange();
            //range.setStart(element, 0);
            ////range.collapse(true);
            //window.getSelection().removeAllRanges();
            //window.getSelection().addRange(range);
            //element.focus();
        }
        private _generateClickableValue(label: HTMLElement, value: string, internalId: string): HTMLElement {
            // Value
            var valueElement = document.createElement("div");
            valueElement.contentEditable = "false";
            valueElement.innerHTML = value || "&nbsp;";
            valueElement.className = "styleValue";
            valueElement.addEventListener("keydown", (evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    //Create the properties object of elements.
                    var propertyObject: any = {};
                    propertyObject.property = label.innerHTML;
                    propertyObject.newValue = valueElement.innerHTML;
                    if (this._newAppliedStyles[internalId] !== undefined) {
                        var propsArr = this._newAppliedStyles[internalId];
                        //check if property exists in array
                        for (var index = 0; index < propsArr.length; index++) {
                            var propObj = propsArr[index];
                            if (propObj.property === propertyObject.property) {
                                propObj.newValue = propertyObject.newValue;
                                propertyObject = propObj;
                                propsArr.splice(index, 1);
                                break;
                            }
                        }
                        propsArr.push(propertyObject);
                    } else {
                        var proArr = [];
                        proArr.push(propertyObject);
                        this._newAppliedStyles[internalId] = proArr;
                    }
                    this.sendCommandToClient('style', {
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    });

                    evt.preventDefault();
                    valueElement.contentEditable = "false";
                    Tools.RemoveClass(valueElement, "editable");
                }
            });

            valueElement.addEventListener("blur", () => {
                valueElement.contentEditable = "false";
                Tools.RemoveClass(valueElement, "editable");
            });


            valueElement.addEventListener("click", () => this._makeEditable(valueElement));

            return valueElement;
        }
        // Generate styles for a selected node
        private _generateStyle(property: string, value: string, internalId: string, editableLabel = false): void {
            var wrap = document.createElement("div");
            wrap.className = 'styleWrap';
            var label = document.createElement("div");
            label.innerHTML = property;
            label.className = "styleLabel";
            label.contentEditable = "false";
            var valueElement = this._generateClickableValue(label, value, internalId);
            wrap.appendChild(label);
            wrap.appendChild(valueElement);
            this._styleView.appendChild(wrap);

            if (editableLabel) {
                label.addEventListener("blur", () => {
                    label.contentEditable = "false";
                    Tools.RemoveClass(label, "editable");
                });

                label.addEventListener("click", () => {
                    this._makeEditable(label);
                });

                label.addEventListener("keydown", (evt) => {
                    if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                        this._makeEditable(valueElement);
                        evt.preventDefault();
                    }
                });
            }
        }
        private _generateStyles(styles: string[], internalId: string): void {
            while (this._styleView.hasChildNodes()) {
                this._styleView.removeChild(this._styleView.lastChild);
            }

            // Current styles
            for (var index = 0; index < styles.length; index++) {
                var style = styles[index];
                var splits = style.split(":");

                this._generateStyle(splits[0], splits[1], internalId);
            }
            if (this._newAppliedStyles[internalId]) {
                var newProps = this._newAppliedStyles[internalId];
                for (var index = 0; index < newProps.length; index++) {
                    var currentObj = newProps[index];
                    this._generateStyle(currentObj.property, currentObj.newValue, internalId);
                }
            }
            // Append add style button
            this._generateButton(this._styleView, "+", "styleButton").addEventListener('click', (e) => {
                this._generateStyle("property", "value", internalId, true);
                this._styleView.appendChild(<HTMLElement>e.target);
            });
        }

        private _appendSpan(parent: HTMLElement, className: string, value: string): void {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;

            parent.appendChild(span);
        }

        private _generateButton(parentNode: HTMLElement, text: string, className: string, attribute?: any) {
            var button = document.createElement("button");
            button.innerHTML = text;
            button.className = className;
            if (attribute)
                button.setAttribute(attribute.name, attribute.value);
            button.setAttribute('button-block', '');
            return parentNode.appendChild(button);
        }
        //private _spaceCheck = /[^\t\n\r ]/;
        //private _generateTreeNode(parentNode: HTMLElement, receivedObject: any, first = false, parentReceivedObject?: any): void {
        //    if (receivedObject.type == 3) {
        //        if (this._spaceCheck.test(receivedObject.content)) {
        //            var textNode = document.createElement('span');
        //            textNode.className = 'nodeTextContent';
        //            textNode.textContent = receivedObject.content.trim();
        //            parentNode.appendChild(textNode);
        //            textNode.contentEditable = "false";
        //            textNode.addEventListener("click",() => this._makeEditable(textNode));
        //            var sendTextToClient = () => {
        //                this.sendToClient({
        //                    type: ReceivedObjectClientSideType.valueEdit,
        //                    newValue: textNode.innerHTML,
        //                    order: parentReceivedObject.internalId
        //                });
        //                textNode.contentEditable = "false";
        //                Tools.RemoveClass(textNode, "editable");
        //            }

        //            textNode.addEventListener("blur",() => {
        //                sendTextToClient.bind(this)();
        //            });

        //            textNode.addEventListener("keydown",(evt) => {
        //                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
        //                    sendTextToClient.bind(this)();
        //                }
        //            });
        //            textNode.addEventListener("click",() => {
        //                this._makeEditable(textNode);
        //            });
        //        }
        //    }
        //    else {
        //        parentNode.setAttribute('data-has-children', '');

        //        var root = document.createElement("div");
        //        parentNode.appendChild(root);

        //        var container = document.createElement("div");
        //        container.className = 'nodeContentContainer';
        //        var btnAttribute = null;
        //        if (receivedObject.hasChildnodes) {
        //            btnAttribute = { name: "data-collapsed", value: "" };
        //            container.id = "vorlon-" + receivedObject.nodeId;
        //        }
        //        this._generateButton(root, "", "treeNodeButton", btnAttribute).addEventListener("click",() => {
        //            if (receivedObject.hasChildnodes) {
        //                this._clikedNodeID = receivedObject.internalId;
        //                this.sendToClient({
        //                    type: ReceivedObjectClientSideType.refreshbyid,
        //                    internalID: receivedObject.internalId
        //                });
        //            }
        //        });

        //        // Main node
        //        var linkText = document.createElement("span");
        //        (<any>linkText).__targetInternalId = receivedObject.internalId;

        //        this._generateColorfullLink(linkText, receivedObject);

        //        linkText.addEventListener("click",() => {
        //            if (this._previousSelectedNode) {
        //                Tools.RemoveClass(this._previousSelectedNode, "treeNodeSelected");
        //                this.sendToClient({
        //                    type: ReceivedObjectClientSideType.unselect,
        //                    order: (<any>this._previousSelectedNode).__targetInternalId
        //                });
        //            }
        //            else {
        //                this.sendToClient({
        //                    type: ReceivedObjectClientSideType.unselect,
        //                    order: null
        //                });
        //            }

        //            Tools.AddClass(linkText, "treeNodeSelected");
        //            this.sendToClient({
        //                type: ReceivedObjectClientSideType.select,
        //                order: receivedObject.internalId
        //            });
        //            this._generateStyles(receivedObject.styles, receivedObject.internalId);

        //            this._previousSelectedNode = linkText;
        //        });

        //        linkText.className = "treeNodeHeader";

        //        root.appendChild(linkText);
        //        root.className = first ? "firstTreeNodeText" : "treeNodeText";

        //        // Tools
        //        if (receivedObject.id) {
        //            var toolsLink = document.createElement("span");
        //            toolsLink.innerHTML = "";
        //            toolsLink.className = "treeNodeTools fa fa-terminal";

        //            toolsLink.addEventListener("click",() => {
        //                this.sendCommandToPluginDashboard("CONSOLE", "setorder", {
        //                    order: receivedObject.id
        //                });
        //            });

        //            root.appendChild(toolsLink);
        //        }

        //        // Children
        //        var nodes = receivedObject.children;
        //        if (nodes && nodes.length) {
        //            for (var index = 0; index < nodes.length; index++) {
        //                var child = nodes[index];
        //                if (child.nodeType != 3) this._generateTreeNode(container, child, false, receivedObject);
        //            }
        //        }
        //        if (receivedObject.name) {
        //            var closingLink = document.createElement("div");
        //            closingLink.className = "treeNodeClosingText";
        //            this._generateColorfullClosingLink(closingLink, receivedObject);
        //            container.appendChild(closingLink);
        //        }

        //        root.appendChild(container);
        //    }
        //}

        public _insertReceivedObject(receivedObject: any, root: any) {
            if (root.internalId === this._clikedNodeID) {
                this._clikedNodeID = null;
                root = receivedObject;
                root.hasChildnodes = false;
                return root;
            }
            else {
                if (root.children && root.children.length) {
                    for (var index = 0; index < root.children.length; index++) {
                        var res = this._insertReceivedObject(receivedObject, root.children[index])
                        if (res) {
                            root.children[index] = res;
                            return root;
                        }
                    }
                }
            }

        }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.action) {
                switch (receivedObject.action) {
                    case "dirtycheck":
                        if (this._lastContentState != receivedObject.rootHTML) {
                            this._refreshButton.setAttribute('changed', '');
                        }
                        else this._refreshButton.removeAttribute('changed');
                        break;
                }
            }
            else if (receivedObject.refreshbyId) {
                //this._refreshButton.removeAttribute('changed');
                //var b = this._insertReceivedObject(receivedObject, this._lastReceivedObject);
                //while (this._treeDiv.hasChildNodes()) {
                //    this._treeDiv.removeChild(this._treeDiv.lastChild);
                //}

                //this._generateTreeNode(this._treeDiv, this._lastReceivedObject, true);
            }
            else {

                //this._generateTreeNode(this._treeDiv, receivedObject, true);
            }
        }

        public initDashboard(root: PackagedNode) {
            this._refreshButton.removeAttribute('changed');
            this._lastContentState = root.rootHTML;
            this._lastReceivedObject = root;
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
            if (this._rootNode)
                this._rootNode.dispose();

            this._rootNode = new DomExplorerNode(this, null, this._treeDiv, root);
        }

        public updateDashboard(node: PackagedNode) {
            if (this._rootNode) {
                this._rootNode.update(node);
            }
        }

        public dirtyCheck(receivedObject: any) {
            if (this._lastContentState != receivedObject.rootHTML) {
                this._refreshButton.setAttribute('changed', '');
            }
            else this._refreshButton.removeAttribute('changed');
        }

        select(selected: DomExplorerNode) {
            if (this._selectedNode) {
                this._selectedNode.selected(false);
                this.sendCommandToClient('unselect', {
                    order: this._selectedNode.node.internalId
                });
            } else {
                this.sendCommandToClient('unselect', {
                    order: null
                });
            }

            if (selected) {
                this._selectedNode = selected;
                this._selectedNode.selected(true);
                this.sendCommandToClient('select', {
                    order: this._selectedNode.node.internalId
                });
                this._generateStyles(selected.node.styles, selected.node.internalId);
            } else {
                this._selectedNode = null;
            }
        }
    }

    DOMExplorer.prototype.ClientCommands = {
        select: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.setClientSelectedElement(data.order);
        },
        style: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.setStyle(data.order, data.property, data.newValue);
        },
        attribute: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.setAttribute(data.order, data.attributeName, data.attributeOldName, data.attributeValue);
        },

        setElementValue: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.setElementValue(data.order, data.value);
        },
        unselect: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.unselectClientElement();
        },

        refreshNode: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.refreshbyId(data.order);
        },

        dirtycheck: function () {
            this.sendCommandToDashboard('dirtycheck', { rootHTML: document.body.innerHTML });
        }
    }

    DOMExplorer.prototype.DashboardCommands = {
        init: function (root: PackagedNode) {
            var plugin = <DOMExplorer>this;
            plugin.initDashboard(root);
        },

        refreshNode: function (node: PackagedNode) {
            var plugin = <DOMExplorer>this;
            plugin.updateDashboard(node);
        },

        dirtyCheck: function (data: any) {
            var plugin = <DOMExplorer>this;
            plugin.dirtyCheck(data);
        }
    }

    enum ReceivedObjectClientSideType {
        unselect,
        select,
        dirtycheck,
        refresh,
        refreshbyid,
        valueEdit,
        ruleEdit,
        attributeEdit
    }

    class ReceivedObjectClientSide {
        public order: string;
        public type: ReceivedObjectClientSideType;
        public newValue: string;
        public attributeValue: string;
        public attributeName: string;
        public attributeOldName: string;
        public internalID: string;
        public property: string;
        constructor() { }
    }

    export class DomExplorerNode {
        private static _spaceCheck = /[^\t\n\r ]/;
        public element: HTMLElement;
        public header: HTMLElement;
        public node: PackagedNode;
        public contentContainer: HTMLElement;
        public attributes: DomExplorerNodeAttribute[] = [];
        public childs: DomExplorerNode[] = [];
        plugin: DOMExplorer;
        parent: DomExplorerNode;

        constructor(plugin: DOMExplorer, parent: DomExplorerNode, parentElt: HTMLElement, node: PackagedNode) {
            this.parent = parent;
            this.node = node;
            this.plugin = plugin;
            this.render(parentElt);
        }

        public dispose() {
            //TODO cleanup references & childs
        }

        public update(node: PackagedNode) {
            this.plugin._refreshButton.removeAttribute('changed');
            var b = this.plugin._insertReceivedObject(node, this.plugin._rootNode.node);

            //this._generateTreeNode(this._treeDiv, this._lastReceivedObject, true);
            this.plugin.initDashboard(this.plugin._rootNode.node);
            //var newNode = new DomExplorerNode(this.plugin, this.parent, this.contentContainer, node);
            //this.childs.push(newNode);
        }

        selected(selected: boolean) {
            if (selected) {
                Tools.AddClass(this.element, 'treeNodeSelected');
            } else {
                Tools.RemoveClass(this.element, 'treeNodeSelected');
            }
        }

        render(parent: HTMLElement) {
            if (this.node.type == "3") {
                this.renderTextNode(parent);
            } else {
                this.renderDOMNode(parent);
            }
        }

        sendTextToClient() {
            this.plugin.sendCommandToClient('setElementValue', {
                value: this.element.innerHTML,
                order: this.parent.node.internalId
            });
            this.element.contentEditable = "false";
            Tools.RemoveClass(this.element, "editable");
        }

        renderTextNode(parentElt: HTMLElement) {
            if (DomExplorerNode._spaceCheck.test(this.node.content)) {
                var textNode = new FluentDOM('span', 'nodeTextContent', parentElt);
                this.element = textNode.element;
                textNode.text(this.node.content.trim())
                    .editable(false)
                    .blur(() => this.sendTextToClient())
                    .keydown((evt) => {
                        if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                            this.sendTextToClient();
                        }
                    })
                    .click(() => DomExplorerNode._makeEditable(this.element));

            }
        }

        renderDOMNode(parentElt: HTMLElement) {
            parentElt.setAttribute('data-has-children', '');
            var root = new FluentDOM('DIV', '', parentElt);
            this.element = root.element;
            root.append('BUTTON', 'treeNodeButton', (nodeButton) => {
                if (this.node.hasChildNodes) {
                    nodeButton.attr("data-collapsed", "");
                }
                nodeButton.attr('button-block', '');
                nodeButton.click(() => {
                    if (this.node.hasChildNodes) {
                        this.plugin._clikedNodeID = this.node.internalId;
                        this.plugin.sendCommandToClient('refreshNode', {
                            order: this.node.internalId
                        });
                    }
                });
            });

            root.append("SPAN", "treeNodeHeader", (header) => {
                this.header = header.element;
                header.click(() => this.plugin.select(this));
                header.createChild("SPAN", "nodeName").text(this.node.name);
                header.createChild("SPAN", "fa fa-plus-circle").click(() => {
                    this.addAttribute("name", "value");
                });
                this.node.attributes.forEach((attr) => {
                    this.addAttribute(attr[0], attr[1]);
                });
            });

            root.append('DIV', 'nodeContentContainer', (container) => {
                this.contentContainer = container.element;
                if (this.node.hasChildNodes) {
                    this.contentContainer.id = "vorlon-" + this.node.internalId;
                }

                var nodes = this.node.children;
                if (nodes && nodes.length) {
                    for (var index = 0; index < nodes.length; index++) {
                        var child = nodes[index];
                        if (child.nodeType != 3) {
                            var node = new DomExplorerNode(this.plugin, this, this.contentContainer, child);
                            this.childs.push(node);
                            //this._generateTreeNode(container, child, false, receivedObject);
                        }
                    }
                }
            });
            if (this.node.name) {
                root.append("DIV", "treeNodeClosingText", (footer) => {
                    footer.createChild("SPAN", "nodeName").text(this.node.name);
                });
            }
            // Main node

            //this._generateColorfullLink(linkText, receivedObject);

            //root.className = first ? "firstTreeNodeText" : "treeNodeText";

            // Tools
            if (this.node.id) {
                root.createChild("span", "treeNodeTools fa fa-terminal").click(() => {
                    this.plugin.sendCommandToPluginDashboard("CONSOLE", "setorder", {
                        order: this.node.id
                    });
                });
            }
        }

        addAttribute(name: string, value: string) {
            var attr = new DomExplorerNodeAttribute(this, name, value);
            this.attributes.push(attr);
        }

        static _makeEditable(element: HTMLElement): void {
            element.contentEditable = "true";
            Tools.AddClass(element, "editable");
        }
    }

    export class DomExplorerNodeAttribute {
        public parent: DomExplorerNode;
        public element: HTMLElement;
        public name: string;
        public value: string;

        constructor(parent: DomExplorerNode, name: string, value: string) {
            this.parent = parent;
            this.name = name;
            this.value = value;
            this.render();
        }

        eventNode(nodeName, nodeValue) {
            var oldNodeName = nodeName.innerHTML;
            var sendTextToClient = function (attributeName, attributeValue, nodeEditable) {
                if (sendedValue)
                    return;
                sendedValue = true;
                this.parent.plugin.sendCommandToClient('attribute', {
                    attributeName: nodeName.innerHTML,
                    attributeOldName: oldNodeName,
                    attributeValue: nodeValue.innerHTML,
                    order: this.parent.node.internalId
                });

                oldNodeName = nodeName.innerHTML;
                if (!oldNodeName) { // delete attribute 
                    nodeName.parentElement.removeChild(nodeName);
                    nodeValue.parentElement.removeChild(nodeValue);
                }
                nodeEditable.contentEditable = "false";
                Tools.RemoveClass(nodeEditable, "editable");
            }
                var sendedValue = false;
            nodeValue.addEventListener("click", () => {
                DomExplorerNode._makeEditable(nodeValue);
                sendedValue = false;
            });
            nodeName.addEventListener("click", () => {
                DomExplorerNode._makeEditable(nodeName);
                sendedValue = false;
            });
            nodeValue.addEventListener("blur", () => {
                sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeValue);
            });
            nodeName.addEventListener("blur", () => {
                sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeName);
            });
            nodeName.addEventListener("keydown", (evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    evt.preventDefault();
                    sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeName);
                }
            });
            nodeValue.addEventListener("keydown", (evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    evt.preventDefault();
                    sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeValue);
                }
            });
        }
        render() {
            var node = new FluentDOM("SPAN", "nodeAttribute", this.parent.header);
            this.element = node.element;
            var nodename = node.createChild("SPAN").html(this.name);
            var nodevalue = node.createChild("SPAN").html(this.value);
            this.eventNode(nodename.element, nodevalue.element);
        }
    }

    //TODO move code for style editor here
    class DomExplorerPropertyEditor {
        public items: DomExplorerPropertyEditorItem[] = [];

        constructor(parent: HTMLElement, styles: any) {
        }
    }

    //TODO move code for style editor item here
    class DomExplorerPropertyEditorItem {
        constructor(parent: DomExplorerPropertyEditor, name: string, value: string) {
        }
    }

    export interface PackagedNode {
        id: string;
        type: string;
        name: string;
        classes: string;
        content: string;
        attributes: Array<any>;
        styles: any;
        internalId: string;
        hasChildNodes: boolean;
        rootHTML: any;
        children: Array<any>;
    }
    // Register
    Core.RegisterPlugin(new DOMExplorer());
}
