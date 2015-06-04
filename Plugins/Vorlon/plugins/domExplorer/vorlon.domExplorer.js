var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var DOMExplorer = (function (_super) {
        __extends(DOMExplorer, _super);
        function DOMExplorer() {
            _super.call(this, "domExplorer", "control.html", "control.css");
            this._internalId = 0;
            this._newAppliedStyles = {};
            this._lastContentState = '';
            this._lastReceivedObject = null;
            this._clikedNodeID = null;
            this._spaceCheck = /[^\t\n\r ]/;
            this._ready = false;
        }
        DOMExplorer.prototype.getID = function () {
            return "DOM";
        };
        DOMExplorer.prototype._getAppliedStyles = function (node) {
            // Style sheets
            var styleNode = new Array();
            var sheets = document.styleSheets;
            var style;
            var appliedStyles = new Array();
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
        };
        DOMExplorer.prototype._packageNode = function (node) {
            var packagedNode = {
                id: node.id,
                type: node.nodeType,
                name: node.localName,
                classes: node.className,
                content: node.textContent,
                attributes: node.attributes ? Array.prototype.map.call(node.attributes, function (attr) {
                    return [attr.name, attr.value];
                }) : [],
                styles: this._getAppliedStyles(node),
                internalId: VORLON.Tools.CreateGUID()
            };
            if (node.__vorlon) {
                packagedNode.internalId = node.__vorlon.internalId;
            }
            else {
                node.__vorlon = {
                    internalId: packagedNode.internalId
                };
            }
            return packagedNode;
        };
        DOMExplorer.prototype._packageDOM = function (root, packagedObject, withChildsNodes) {
            if (withChildsNodes === void 0) { withChildsNodes = false; }
            if (!root.childNodes || root.childNodes.length === 0) {
                return;
            }
            for (var index = 0; index < root.childNodes.length; index++) {
                var node = root.childNodes[index];
                var packagedNode = this._packageNode(node);
                if (withChildsNodes) {
                    this._packageDOM(node, packagedNode);
                }
                if (node.childNodes && node.childNodes.length >= 0) {
                    packagedNode.hasChildnodes = true;
                }
                //this._packageDOM(node, packagedNode);
                if (!packagedObject.children) {
                    packagedObject.children = [];
                }
                packagedObject.children.push(packagedNode);
            }
        };
        DOMExplorer.prototype._packageAndSendDOM = function (element) {
            this._internalId = 0;
            this._newAppliedStyles = {};
            if (!element) {
                var packagedObject = this._packageNode(document.body);
                packagedObject.rootHTML = document.body.innerHTML;
                this._packageDOM(document.body, packagedObject, false);
            }
            else {
                var packagedObject = this._packageNode(element);
                packagedObject.rootHTML = element.innerHTML;
                this._packageDOM(element, packagedObject, false);
                packagedObject.refreshbyId = true;
            }
            this.sendToDashboard(packagedObject);
        };
        DOMExplorer.prototype._markForRefresh = function () {
            this.refresh();
        };
        DOMExplorer.prototype.startClientSide = function () {
        };
        DOMExplorer.prototype._getElementByInternalId = function (internalId, node) {
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
        };
        DOMExplorer.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            if (!receivedObject.order) {
                switch (receivedObject.type) {
                    case "unselect":
                        if (this._lastElementSelectedClientSide) {
                            this._lastElementSelectedClientSide.style.outline = this._lastElementSelectedClientSide.__savedOutline;
                        }
                        break;
                    case "dirtycheck":
                        this.sendToDashboard({
                            action: 'dirtycheck',
                            rootHTML: document.body.innerHTML
                        });
                        break;
                    case "refresh":
                        this.refresh();
                        this._lastContentState = document.body.innerHTML;
                        break;
                    case "refreshbyid":
                        this.refreshbyId(receivedObject.internalID);
                        this._lastContentState = document.body.innerHTML;
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
        };
        DOMExplorer.prototype.refresh = function () {
            this._packageAndSendDOM();
        };
        DOMExplorer.prototype.refreshbyId = function (internaID) {
            if (internaID)
                this._packageAndSendDOM(this._getElementByInternalId(internaID, document.body));
        };
        DOMExplorer.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this._treeDiv = VORLON.Tools.QuerySelectorById(filledDiv, "treeView");
                _this._styleView = VORLON.Tools.QuerySelectorById(filledDiv, "styleView");
                _this._refreshButton = _this._containerDiv.querySelector('x-action[event="refresh"]');
                _this._containerDiv.addEventListener('refresh', function () {
                    _this.sendToClient({
                        type: 'refresh',
                        order: null
                    });
                });
                _this._treeDiv.addEventListener('click', function (e) {
                    var button = e.target;
                    if (button.className.match('treeNodeButton')) {
                        button.hasAttribute('data-collapsed') ? button.removeAttribute('data-collapsed') : button.setAttribute('data-collapsed', '');
                    }
                });
                _this._treeDiv.addEventListener('mouseenter', function (e) {
                    var node = e.target;
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
                _this._treeDiv.addEventListener('mouseleave', function (e) {
                    var node = e.target;
                    if (node.className.match('treeNodeHeader') || node.parentElement.className.match('treeNodeClosingText')) {
                        var hovered = _this._treeDiv.querySelector('[data-hovered-tag]');
                        if (hovered)
                            hovered.removeAttribute('data-hovered-tag');
                    }
                }, true);
                $('.dom-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
                _this._ready = true;
            });
        };
        DOMExplorer.prototype._makeEditable = function (element) {
            element.contentEditable = "true";
            element.focus();
            VORLON.Tools.AddClass(element, "editable");
            var range = document.createRange();
            range.setStart(element, 0);
            range.setEnd(element, 1);
            window.getSelection().addRange(range);
        };
        DOMExplorer.prototype._generateClickableValue = function (label, value, internalId) {
            var _this = this;
            // Value
            var valueElement = document.createElement("div");
            valueElement.contentEditable = "false";
            valueElement.innerHTML = value || "&nbsp;";
            valueElement.className = "styleValue";
            valueElement.addEventListener("keydown", function (evt) {
                if (evt.keyCode === 13 || evt.keyCode === 9) {
                    //Create the properties object of elements.
                    var propertyObject = {};
                    propertyObject.property = label.innerHTML;
                    propertyObject.newValue = valueElement.innerHTML;
                    if (_this._newAppliedStyles[internalId] !== undefined) {
                        var propsArr = _this._newAppliedStyles[internalId];
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
                    }
                    else {
                        var proArr = [];
                        proArr.push(propertyObject);
                        _this._newAppliedStyles[internalId] = proArr;
                    }
                    _this.sendToClient({
                        type: "ruleEdit",
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    });
                    evt.preventDefault();
                    valueElement.contentEditable = "false";
                    VORLON.Tools.RemoveClass(valueElement, "editable");
                }
            });
            valueElement.addEventListener("blur", function () {
                valueElement.contentEditable = "false";
                VORLON.Tools.RemoveClass(valueElement, "editable");
            });
            valueElement.addEventListener("click", function () { return _this._makeEditable(valueElement); });
            return valueElement;
        };
        // Generate styles for a selected node
        DOMExplorer.prototype._generateStyle = function (property, value, internalId, editableLabel) {
            var _this = this;
            if (editableLabel === void 0) { editableLabel = false; }
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
                label.addEventListener("blur", function () {
                    label.contentEditable = "false";
                    VORLON.Tools.RemoveClass(label, "editable");
                });
                label.addEventListener("click", function () {
                    _this._makeEditable(label);
                });
                label.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13 || evt.keyCode === 9) {
                        _this._makeEditable(valueElement);
                        evt.preventDefault();
                    }
                });
            }
        };
        DOMExplorer.prototype._generateStyles = function (styles, internalId) {
            var _this = this;
            while (this._styleView.hasChildNodes()) {
                this._styleView.removeChild(this._styleView.lastChild);
            }
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
            this._generateButton(this._styleView, "+", "styleButton").addEventListener('click', function (e) {
                _this._generateStyle("property", "value", internalId, true);
                _this._styleView.appendChild(e.target);
            });
        };
        DOMExplorer.prototype._appendSpan = function (parent, className, value) {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;
            parent.appendChild(span);
        };
        DOMExplorer.prototype._generateColorfullLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeName", receivedObject.name);
            receivedObject.attributes.forEach(function (attr) {
                var node = document.createElement('span');
                node.className = 'nodeAttribute';
                node.innerHTML = '<span>' + attr[0] + '</span><span>' + attr[1] + '</span>';
                link.appendChild(node);
            });
        };
        DOMExplorer.prototype._generateColorfullClosingLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeName", receivedObject.name);
        };
        DOMExplorer.prototype._generateButton = function (parentNode, text, className, attribute) {
            var button = document.createElement("button");
            button.innerHTML = text;
            button.className = className;
            if (attribute)
                button.setAttribute(attribute.name, attribute.value);
            button.setAttribute('button-block', '');
            return parentNode.appendChild(button);
        };
        DOMExplorer.prototype._generateTreeNode = function (parentNode, receivedObject, first) {
            var _this = this;
            if (first === void 0) { first = false; }
            if (receivedObject.type == 3) {
                if (this._spaceCheck.test(receivedObject.content)) {
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
                var btnAttribute = null;
                if (receivedObject.hasChildnodes) {
                    btnAttribute = { name: "data-collapsed", value: "" };
                    container.id = "vorlon-" + receivedObject.nodeId;
                }
                this._generateButton(root, "", "treeNodeButton", btnAttribute).addEventListener("click", function () {
                    if (receivedObject.hasChildnodes) {
                        _this._clikedNodeID = receivedObject.internalId;
                        _this.sendToClient({
                            type: "refreshbyid",
                            internalID: receivedObject.internalId
                        });
                    }
                });
                // Main node
                var linkText = document.createElement("a");
                linkText.__targetInternalId = receivedObject.internalId;
                this._generateColorfullLink(linkText, receivedObject);
                linkText.addEventListener("click", function () {
                    if (_this._previousSelectedNode) {
                        VORLON.Tools.RemoveClass(_this._previousSelectedNode, "treeNodeSelected");
                        _this.sendToClient({
                            type: "unselect",
                            order: _this._previousSelectedNode.__targetInternalId
                        });
                    }
                    else {
                        _this.sendToClient({
                            type: "unselect",
                            order: null
                        });
                    }
                    VORLON.Tools.AddClass(linkText, "treeNodeSelected");
                    _this.sendToClient({
                        type: "select",
                        order: receivedObject.internalId
                    });
                    _this._generateStyles(receivedObject.styles, receivedObject.internalId);
                    _this._previousSelectedNode = linkText;
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
                    toolsLink.addEventListener("click", function () {
                        VORLON.Core.Messenger.sendRealtimeMessage("CONSOLE", {
                            type: "order",
                            order: receivedObject.id
                        }, VORLON.RuntimeSide.Client, "protocol");
                    });
                    root.appendChild(toolsLink);
                }
                // Children
                var nodes = receivedObject.children;
                if (nodes && nodes.length) {
                    for (var index = 0; index < nodes.length; index++) {
                        var child = nodes[index];
                        if (child.nodeType != 3)
                            this._generateTreeNode(container, child);
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
        };
        DOMExplorer.prototype._insertReceivedObject = function (receivedObject, root) {
            if (root.internalId === this._clikedNodeID) {
                this._clikedNodeID = null;
                console.log('object inered root', root);
                console.log('object inered receivedObject', receivedObject);
                root = receivedObject;
                root.hasChildnodes = false;
                return root;
            }
            else {
                if (root.children && root.children.length) {
                    for (var index = 0; index < root.children.length; index++) {
                        console.log(index);
                        var res = this._insertReceivedObject(receivedObject, root.children[index]);
                        if (res) {
                            root.children[index] = res;
                            return root;
                        }
                    }
                }
            }
        };
        DOMExplorer.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.action) {
                switch (receivedObject.action) {
                    case "dirtycheck":
                        if (this._lastContentState != receivedObject.rootHTML) {
                            this._refreshButton.setAttribute('changed', '');
                        }
                        else
                            this._refreshButton.removeAttribute('changed');
                        break;
                }
            }
            else if (receivedObject.refreshbyId) {
                this._refreshButton.removeAttribute('changed');
                console.log("coucou");
                var b = this._insertReceivedObject(receivedObject, this._lastReceivedObject);
                console.log("coucou2", this._lastReceivedObject);
                while (this._treeDiv.hasChildNodes()) {
                    this._treeDiv.removeChild(this._treeDiv.lastChild);
                }
                this._generateTreeNode(this._treeDiv, this._lastReceivedObject, true);
            }
            else {
                this._refreshButton.removeAttribute('changed');
                this._lastContentState = receivedObject.rootHTML;
                this._lastReceivedObject = receivedObject;
                while (this._treeDiv.hasChildNodes()) {
                    this._treeDiv.removeChild(this._treeDiv.lastChild);
                }
                this._generateTreeNode(this._treeDiv, receivedObject, true);
            }
        };
        return DOMExplorer;
    })(VORLON.Plugin);
    VORLON.DOMExplorer = DOMExplorer;
    // Register
    VORLON.Core.RegisterPlugin(new DOMExplorer());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.domExplorer.js.map