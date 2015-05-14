module VORLON {
    declare var $: any;
    export class DOMExplorer extends Plugin {

        private _previousSelectedNode: HTMLElement;
        private _internalId = 0;
        private _lastElementSelectedClientSide;
        private _timeoutId;
	private _newAppliedStyles = {};
        constructor() {
            super("domExplorer", "control.html", "control.css");
            this._ready = false;
        }

        public getID(): string {
            return "DOM";
        }

        private _getAppliedStyles(node: HTMLElement): string[] {
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

                    try{
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
                    catch(e) {
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

        private _packageNode(node: any): any {
            node.__internalId = this._internalId;
            
            var packagedNode = {
                id: node.id,
                type: node.nodeType,
                name: node.localName,
                classes: node.className,
                content: node.textContent,
                attributes: node.attributes ? Array.prototype.map.call(node.attributes, function(attr){
                   return [attr.name, attr.value];
                }) : [],
                styles: this._getAppliedStyles(node),
                internalId: this._internalId++
            };

            return packagedNode;
        }

        private _packageDOM(root: HTMLElement, packagedObject: any): void {
            if (!root.childNodes || root.childNodes.length === 0) {
                return;
            }

            for (var index = 0; index < root.childNodes.length; index++) {
                var node = <HTMLElement>root.childNodes[index];

                var packagedNode = this._packageNode(node);

                this._packageDOM(node, packagedNode);

                if (!packagedObject.children) {
                    packagedObject.children = [];
                }

                packagedObject.children.push(packagedNode);
            }
        }

        private _packageAndSendDOM() {
            this._internalId = 0;
	    this._newAppliedStyles = {};
            var packagedObject = this._packageNode(document.body);
            this._packageDOM(document.body, packagedObject);

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

        private _getElementByInternalId(internalId: string, node: any): any {
            if (node.__internalId === internalId) {
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

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            if(!receivedObject.order) {
                switch (receivedObject.type) {
                    case "unselect":
                        if(this._lastElementSelectedClientSide){
                            this._lastElementSelectedClientSide.style.outline = this._lastElementSelectedClientSide.__savedOutline;
                        }
                        break;
                }
                return;
            }

            var element = this._getElementByInternalId(receivedObject.order, document.body);

            if (!element) {
                return;
            }

            switch (receivedObject.type) {
                case "select":
                    element.__savedOutline = element.style.outline;
                    element.style.outline = "2px solid red";
                    this._lastElementSelectedClientSide = element;
                    break;
                case "unselect":
                    element.style.outline = element.__savedOutline;
                    break;
                case "ruleEdit":
                    element.style[receivedObject.property] = receivedObject.newValue;
                    break;
            }
        }

        public refresh(): void {
            this._packageAndSendDOM();
        }

        // DASHBOARD
        private _containerDiv: HTMLElement;
        private _treeDiv: HTMLElement;
        private _styleView: HTMLElement;
        private _dashboardDiv: HTMLDivElement;
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;

            this._insertHtmlContentAsync(this._dashboardDiv,(filledDiv) => {
                this._containerDiv = filledDiv;
                this._treeDiv = Tools.QuerySelectorById(filledDiv, "treeView");
                this._styleView = Tools.QuerySelectorById(filledDiv, "styleView");
                
                this._treeDiv.addEventListener('click', function(e){
                    var button = <HTMLElement>e.target;
                    if (button.className.match('treeNodeButton')) {
                        button.hasAttribute('data-collapsed') ? button.removeAttribute('data-collapsed') : button.setAttribute('data-collapsed', '');
                    }
                });
                
                this._treeDiv.addEventListener('mouseenter', (e) => {
                    var node = <HTMLElement>e.target;
                    var isHeader = node.className.match('treeNodeHeader');
                    if (isHeader || node.parentNode.className.match('treeNodeClosingText')) {
                        var parent = <HTMLElement>node.parentNode;
                        if (isHeader) parent.setAttribute('data-hovered-tag', '');
                        else parent.parentNode.parentNode.setAttribute('data-hovered-tag', '');
                    }
                }, true);
                
                this._treeDiv.addEventListener('mouseleave', (e) => {
                    var node = <HTMLElement>e.target;
                    if (node.className.match('treeNodeHeader') || node.parentNode.className.match('treeNodeClosingText')) {
                        var hovered = this._treeDiv.querySelector('[data-hovered-tag]')
                        if (hovered) hovered.removeAttribute('data-hovered-tag');
                    }
                }, true);
                
                $('.dom-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });

                this._ready = true;
            });
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
	          //Create the properties object of elements.
    			var propertyObject:any = {};
    			propertyObject.property = label.innerHTML;
    			propertyObject.newValue = valueElement.innerHTML;
    			if(this._newAppliedStyles[internalId] !== undefined) {
    				var propsArr = this._newAppliedStyles[internalId];
    				//check if property exists in array
    				for(var index = 0; index < propsArr.length; index++) {
    					var propObj = propsArr[index];
    					if(propObj.property === propertyObject.property) {
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

        // Generate styles for a selected node
        private _generateStyle(property: string, value:string, internalId: string, editableLabel = false): void {
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
			if(this._newAppliedStyles[internalId]){
				var newProps = this._newAppliedStyles[internalId];
				for(var index = 0;index<newProps.length;index++){
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

        private _generateColorfullLink(link: HTMLAnchorElement, receivedObject: any): void {
            this._appendSpan(link, "nodeName", receivedObject.name);
            
            receivedObject.attributes.forEach(function(attr){
                var node = document.createElement('span');
                node.className = 'nodeAttribute';
                node.innerHTML = '<span>' + attr[0] + '</span><span>' + attr[1] + '</span>'; 
                link.appendChild(node);
            });
        }
          
        private _generateColorfullClosingLink(link: HTMLElement, receivedObject: any): void {
            this._appendSpan(link, "nodeName", receivedObject.name);
        }

        private _generateButton(parentNode: HTMLElement, text: string, className: string) {
            var button = document.createElement("button");
            button.innerHTML = text;
            button.className = className;
            button.setAttribute('button-block', '');
            return parentNode.appendChild(button);
        }
        
        private _spaceCheck = /[^\t\n\r ]/;
        private _generateTreeNode(parentNode: HTMLElement, receivedObject: any, first = false): void {
            if (receivedObject.type == 3) {
                if (this._spaceCheck.test(receivedObject.content)){
                    var textNode = document.createElement('span');
                    textNode.className = 'nodeTextContent';
                    textNode.textContent = receivedObject.content.trim();
                    parentNode.appendChild(textNode);
                }
            }
            else {
                parentNode.setAttribute('data-has-children', '');
                
                var root = document.createElement("div");
                parentNode.appendChild(root);
    
                var container = document.createElement("div");
                container.className = 'nodeContentContainer';
                this._generateButton(root, "", "treeNodeButton");
    
                // Main node
                var linkText = document.createElement("a");
                (<any>linkText).__targetInternalId = receivedObject.internalId;
    
                this._generateColorfullLink(linkText, receivedObject);
    
                linkText.addEventListener("click",() => {
                    if (this._previousSelectedNode) {
                        Tools.RemoveClass(this._previousSelectedNode, "treeNodeSelected");
                        Core.Messenger.sendRealtimeMessage(this.getID(), {
                            type: "unselect",
                            order: (<any>this._previousSelectedNode).__targetInternalId
                        }, RuntimeSide.Dashboard);
                    }
                    else {
                         Core.Messenger.sendRealtimeMessage(this.getID(), {
                            type: "unselect",
                            order: null
                        }, RuntimeSide.Dashboard);
                    }
    
                    Tools.AddClass(linkText, "treeNodeSelected");
                    Core.Messenger.sendRealtimeMessage(this.getID(), {
                        type: "select",
                        order: receivedObject.internalId
                    }, RuntimeSide.Dashboard);
    
                    this._generateStyles(receivedObject.styles, receivedObject.internalId);
    
                    this._previousSelectedNode = linkText;
                });
    
                linkText.href = "#";
    
                linkText.className = "treeNodeHeader";
    
                root.appendChild(linkText);
                root.className = first ? "firstTreeNodeText" : "treeNodeText";
    
                // Tools
                if (receivedObject.id) {
                    var toolsLink = document.createElement("a");
                    toolsLink.innerHTML = "#";
                    toolsLink.className = "treeNodeTools";
                    toolsLink.href = "#";
    
                    toolsLink.addEventListener("click",() => {
                        Core.Messenger.sendRealtimeMessage("CONSOLE", {
                            type: "order",
                            order: receivedObject.id
                        }, RuntimeSide.Client, "protocol");
                    });
    
                    root.appendChild(toolsLink);
                }
    
                // Children
                var nodes = receivedObject.children;
                if (nodes && nodes.length) {
                    for (var index = 0; index < nodes.length; index++) {
                        var child = nodes[index];
                        if (child.nodeType != 3) this._generateTreeNode(container, child);
                    }
                }
                if (receivedObject.name) {               
                    var closingLink = document.createElement("div");
                    closingLink.className = "treeNodeClosingText";
                    this._generateColorfullClosingLink(closingLink, receivedObject);
                    container.appendChild(closingLink);
                }
                
                root.appendChild(container);
            }
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }

            this._generateTreeNode(this._treeDiv, receivedObject, true);
        }
    }

    // Register
    Core.RegisterPlugin(new DOMExplorer());
}
