module VORLON {
    declare var $: any;

    export class DOMExplorerClient extends ClientPlugin {

        private _internalId = 0;
        private _lastElementSelectedClientSide;
        private _globalloadactive = false;
        private _overlay: HTMLElement;
        private _observerMutationObserver;
        private _overlayInspect: HTMLElement;
        constructor() {
            super("domExplorer");
            this._id = "DOM";
            //this.debug = true;
            this._ready = false;
        }

        public static GetAppliedStyles(node: HTMLElement): string[] {
            // Style sheets
            var styleNode = new Array<string>();
            var sheets = <any>document.styleSheets;
            var style: CSSStyleDeclaration;
            var appliedStyles = new Array<string>();
            var index: number;
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

                        for (index = 0; index < matchedElts.length; index++) {
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
            if (!node)
                return;

            var packagedNode = {
                id: node.id,
                type: node.nodeType,
                name: node.localName,
                classes: node.className,
                content: null,
                hasChildNodes: false,
                attributes: node.attributes ? Array.prototype.map.call(node.attributes, (attr) => {
                    return [attr.name, attr.value];
                }) : [],
                //styles: DOMExplorerClient.GetAppliedStyles(node),
                children: [],
                isEmpty: false,
                rootHTML: null,
                internalId: VORLON.Tools.CreateGUID()
            };

            if (node.innerHTML === "") {
                packagedNode.isEmpty = true;
            }
            if (packagedNode.type == "3" || node.nodeName === "#comment") {
                if (node.nodeName === "#comment") {
                    packagedNode.name = "#comment";
                }
                packagedNode.content = node.textContent
            }
            if (node.__vorlon && node.__vorlon.internalId) {
                packagedNode.internalId = node.__vorlon.internalId;
            }
            else {
                if (!node.__vorlon) {
                    node.__vorlon = <any>{};
                }
                node.__vorlon.internalId = packagedNode.internalId;
            }

            return packagedNode;
        }

        private _packageDOM(root: HTMLElement, packagedObject: PackagedNode, withChildsNodes: boolean = false, highlightElementID: string = ""): PackagedNode {
            if (!root.childNodes || root.childNodes.length === 0) {
                return;
            }

            for (var index = 0; index < root.childNodes.length; index++) {
                var node = <HTMLElement>root.childNodes[index];
                var packagedNode = this._packageNode(node);
                var b = false;

                if (node.childNodes && node.childNodes.length > 1 || (node && node.nodeName && (node.nodeName.toLowerCase() === "script" || node.nodeName.toLowerCase() === "style"))) {
                    packagedNode.hasChildNodes = true;
                }
                else if (withChildsNodes || node.childNodes.length == 1) {
                    this._packageDOM(node, packagedNode, withChildsNodes, highlightElementID);
                    b = true;
                }
                if (highlightElementID !== "" && (!b && withChildsNodes)) {
                    this._packageDOM(node, packagedNode, withChildsNodes, highlightElementID);
                }

                if ((<any>node).__vorlon && (<any>node).__vorlon.ignore) {
                    return;
                }

                packagedObject.children.push(packagedNode);
                if (highlightElementID === packagedNode.internalId) {
                    highlightElementID = "";
                }
            }
        }

        private _packageAndSendDOM(element: HTMLElement, highlightElementID: string = "") {
            this._internalId = 0;
            var packagedObject = this._packageNode(element);
            this._packageDOM(element, packagedObject, false, highlightElementID);
            if (highlightElementID)
                packagedObject.highlightElementID = highlightElementID;
            this.sendCommandToDashboard('refreshNode', packagedObject);
        }

        private _markForRefresh() {
            this.refresh();
        }

        public startClientSide(): void {

        }

        private _getElementByInternalId(internalId: string, node: HTMLElement): any {
            if (!node) {
                return null;
            }

            if (node.__vorlon && node.__vorlon.internalId === internalId) {
                return node;
            }
            if (!node.children) {
                return null;
            }

            for (var index = 0; index < node.children.length; index++) {
                var result = this._getElementByInternalId(internalId, <HTMLElement>node.children[index]);
                if (result) {
                    return result;
                }
            }
            return null;
        }

        public getInnerHTML(internalId: string) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element)
                this.sendCommandToDashboard("innerHTML", { internalId: internalId, innerHTML: element.innerHTML });
        }

        public getComputedStyleById(internalId: string) {

            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element) {
                var winObject = document.defaultView || window;
                if (winObject.getComputedStyle) {
                    var styles = winObject.getComputedStyle(element);
                    var l = [];
                    for (var style in styles) {
                        if (isNaN(style) && style !== "parentRule" && style !== "length" && style !== "cssText" && typeof styles[style] !== 'function' && styles[style]) {

                            l.push({ name: style, value: styles[style] });
                        }
                    }

                    this.sendCommandToDashboard("setComputedStyle", l);
                }
            }
        }
        public getStyle(internalId: string) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element) {
                var winObject = document.defaultView || window;
                if (winObject.getComputedStyle) {
                    var styles = winObject.getComputedStyle(element);
                    var layoutStyle = <LayoutStyle>{
                        border: {
                            rightWidth: styles.borderRightWidth,
                            leftWidth: styles.borderLeftWidth,
                            topWidth: styles.borderTopWidth,
                            bottomWidth: styles.borderBottomWidth
                        },
                        margin: {
                            bottom: styles.marginBottom,
                            left: styles.marginLeft,
                            top: styles.marginTop,
                            right: styles.marginRight
                        },
                        padding: {
                            bottom: styles.paddingBottom,
                            left: styles.paddingLeft,
                            top: styles.paddingTop,
                            right: styles.paddingRight
                        },
                        size: {
                            width: styles.width,
                            height: styles.height
                        }
                    };

                    this.sendCommandToDashboard("setLayoutStyle", layoutStyle);
                }
            }
        }

        public saveInnerHTML(internalId: string, innerHTML: string) {
            var element = this._getElementByInternalId(internalId, document.documentElement);
            if (element) {
                element.innerHTML = innerHTML;
            }
            this.refreshbyId(internalId);
        }

        private _offsetFor(element: HTMLElement) {
            var p = element.getBoundingClientRect();
            var w = element.offsetWidth;
            var h = element.offsetHeight;
            //console.log("check offset for highlight " + p.top + "," + p.left);
            return { x: p.top - element.scrollTop, y: p.left - element.scrollLeft, width: w, height: h };
        }

        public setClientHighlightedElement(elementId: string) {
            var element = this._getElementByInternalId(elementId, document.documentElement);

            if (!element) {
                return;
            }
            if (!this._overlay) {
                this._overlay = document.createElement("div");
                this._overlay.id = "vorlonOverlay";
                this._overlay.style.position = "fixed";
                this._overlay.style.backgroundColor = "rgba(255,255,0,0.4)";
                this._overlay.style.pointerEvents = "none";
                (<any>this._overlay).__vorlon = { ignore: true };
                document.body.appendChild(this._overlay);
            }
            this._overlay.style.display = "block";
            var position = this._offsetFor(element);
            this._overlay.style.top = (position.x + document.body.scrollTop) + "px";
            this._overlay.style.left = (position.y + document.body.scrollLeft) + "px";
            this._overlay.style.width = position.width + "px";
            this._overlay.style.height = position.height + "px";
        }

        public unhighlightClientElement(internalId?: string) {
            if (this._overlay)
                this._overlay.style.display = "none";
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {

        }

        refresh(): void {
            //sometimes refresh is called before document was loaded
            if (!document.body) {
                setTimeout(() => {
                    this.refresh();
                }, 200);
                return;
            }

            var packagedObject = this._packageNode(document.documentElement);
            this._packageDOM(document.documentElement, packagedObject, this._globalloadactive, null);
            this.sendCommandToDashboard('init', packagedObject);
        }

        inspect(): void {
            if (document.elementFromPoint) {
                if (this._overlayInspect)
                    return;
                this.trace("INSPECT");
                this._overlayInspect = document.createElement("DIV");
                this._overlayInspect.__vorlon = { ignore: true };
                this._overlayInspect.style.position = "fixed";
                this._overlayInspect.style.left = "0";
                this._overlayInspect.style.right = "0";
                this._overlayInspect.style.top = "0";
                this._overlayInspect.style.bottom = "0";
                this._overlayInspect.style.zIndex = "5000000000000000";
                this._overlayInspect.style.touchAction = "manipulation";
                this._overlayInspect.style.backgroundColor = "rgba(255,0,0,0.3)";
                document.body.appendChild(this._overlayInspect);
                var event = "mousedown";
                if (this._overlayInspect.onpointerdown !== undefined) {
                    event = "pointerdown";
                }
                this._overlayInspect.addEventListener(event, (arg) => {
                    var evt = <any>arg;
                    this.trace("tracking element at " + evt.clientX + "/" + evt.clientY);
                    this._overlayInspect.parentElement.removeChild(this._overlayInspect);
                    var el = <HTMLElement>document.elementFromPoint(evt.clientX, evt.clientY);
                    if (el) {
                        this.trace("element found");
                        this.openElementInDashboard(el);
                    } else {
                        this.trace("element not found");
                    }
                    this._overlayInspect = null;
                });
            } else {
                //TODO : send message back to dashboard and disable button
                this.trace("VORLON, inspection not supported");
            }
        }

        openElementInDashboard(element: Element) {
            if (element) {
                var parentId = this.getFirstParentWithInternalId(element);
                if (parentId) {
                    this.refreshbyId(parentId, this._packageNode(element).internalId);
                }
            }
        }

        setStyle(internaID: string, property: string, newValue: string): void {
            var element = this._getElementByInternalId(internaID, document.documentElement);
            element.style[property] = newValue;
        }

        globalload(value: boolean): void {
            this._globalloadactive = value;
            if (this._globalloadactive) {
                this.refresh();
            }
        }

        getFirstParentWithInternalId(node) {
            if (!node)
                return null;
            if (node.parentNode && node.parentNode.__vorlon && node.parentNode.__vorlon.internalId) {
                return node.parentNode.__vorlon.internalId;
            }
            else return this.getFirstParentWithInternalId(node.parentNode);
        }

        public getMutationObeserverAvailability() {
            var mutationObserver = (<any>window).MutationObserver || (<any>window).WebKitMutationObserver || null;
            if (mutationObserver) {
                this.sendCommandToDashboard('mutationObeserverAvailability', { availability: true });
            }
            else {
                this.sendCommandToDashboard('mutationObeserverAvailability', { availability: false });
            }
        }

        searchDOMBySelector(selector: string, position: number = 0) {
            var length = 0;
            try {
                if (selector) {
                    var elements = document.querySelectorAll(selector);
                    length = elements.length;
                    if (elements.length) {
                        if (!elements[position])
                            position = 0;
                        var parentId = this.getFirstParentWithInternalId(elements[position]);
                        if (parentId) {
                            this.refreshbyId(parentId, this._packageNode(elements[position]).internalId);
                        }
                        if (position < elements.length + 1) {
                            position++;
                        }
                    }
                }
            }
            catch (e) {

            }

            this.sendCommandToDashboard('searchDOMByResults', { length: length, selector: selector, position: position });
        }

        setAttribute(internaID: string, attributeName: string, attributeOldName: string, attributeValue: string): void {
            var element = this._getElementByInternalId(internaID, document.documentElement);
            if (attributeName !== "attributeName") {
                try {
                    element.removeAttribute(attributeOldName);
                }
                catch (e) { }
                if (attributeName)
                    element.setAttribute(attributeName, attributeValue);
                if (attributeName && attributeName.indexOf('on') === 0) {
                    element[attributeName] = function() {
                        try { eval(attributeValue); }
                        catch (e) { console.error(e); }
                    };
                }
            }
        }

        public refreshbyId(internaID: string, internalIdToshow: string = ""): void {
            if (internaID && internalIdToshow) {
                this._packageAndSendDOM(this._getElementByInternalId(internaID, document.documentElement), internalIdToshow);
            }
            else if (internaID) {
                this._packageAndSendDOM(this._getElementByInternalId(internaID, document.documentElement));
            }
        }

        public setElementValue(internaID: string, value: string) {
            var element = this._getElementByInternalId(internaID, document.documentElement);
            element.innerHTML = value;
        }

        public getNodeStyle(internalID: string) {
            var element = this._getElementByInternalId(internalID, document.documentElement);
            if (element) {
                var styles = DOMExplorerClient.GetAppliedStyles(element);
                this.sendCommandToDashboard('nodeStyle', { internalID: internalID, styles: styles });
            }
        }
    }

    DOMExplorerClient.prototype.ClientCommands = {
        getMutationObeserverAvailability() {
            var plugin = <DOMExplorerClient>this;
            plugin.getMutationObeserverAvailability();
        },
        style(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.setStyle(data.order, data.property, data.newValue);
        },

        searchDOMBySelector(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.searchDOMBySelector(data.selector, data.position);
        },

        setSettings(data: any) {
            var plugin = <DOMExplorerClient>this;
            if (data && data.globalload != null)
                plugin.globalload(data.globalload);
        },

        saveinnerHTML(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.saveInnerHTML(data.order, data.innerhtml);
        },

        attribute(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.setAttribute(data.order, data.attributeName, data.attributeOldName, data.attributeValue);
        },

        setElementValue(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.setElementValue(data.order, data.value);
        },

        select(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.unhighlightClientElement();
            plugin.setClientHighlightedElement(data.order);
            plugin.getNodeStyle(data.order);
        },

        unselect(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.unhighlightClientElement(data.order);
        },

        highlight(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.unhighlightClientElement();
            plugin.setClientHighlightedElement(data.order);
        },

        unhighlight(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.unhighlightClientElement(data.order);
        },

        refreshNode(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.refreshbyId(data.order);
        },

        getNodeStyles(data: any) {
            var plugin = <DOMExplorerClient>this;
            console.log("get node style");
            //plugin.refreshbyId(data.order);
        },

        refresh() {
            var plugin = <DOMExplorerClient>this;
            plugin.refresh();
        },

        inspect() {
            var plugin = <DOMExplorerClient>this;
            plugin.inspect();
        },

        getInnerHTML(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.getInnerHTML(data.order);
        },
        getStyle(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.getStyle(data.order);
        },
        getComputedStyleById(data: any) {
            var plugin = <DOMExplorerClient>this;
            plugin.getComputedStyleById(data.order);
        }
    }

    // Register
    Core.RegisterClientPlugin(new DOMExplorerClient());
}
