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
                for (var r = 0; r < rules.length; r++) {
                    var rule = rules[r];
                    var selectorText = rule.selectorText;
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
            node.__internalId = this._internalId;
            var packagedNode = {
                id: node.id,
                name: node.localName,
                classes: node.className,
                styles: this._getAppliedStyles(node),
                internalId: this._internalId++
            };
            return packagedNode;
        };
        DOMExplorer.prototype._packageDOM = function (root, packagedObject) {
            if (!root.children || root.children.length === 0) {
                return;
            }
            for (var index = 0; index < root.children.length; index++) {
                var node = root.children[index];
                var packagedNode = this._packageNode(node);
                this._packageDOM(node, packagedNode);
                if (!packagedObject.children) {
                    packagedObject.children = [];
                }
                packagedObject.children.push(packagedNode);
            }
        };
        DOMExplorer.prototype._packageAndSendDOM = function () {
            this._internalId = 0;
            var packagedObject = this._packageNode(document.body);
            this._packageDOM(document.body, packagedObject);
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), packagedObject, 0 /* Client */);
        };
        DOMExplorer.prototype.startClientSide = function () {
            var _this = this;
            document.addEventListener("DOMContentLoaded", function () {
                if (VORLON.Core.Messenger.isConnected) {
                    document.addEventListener("DOMNodeInserted", function () {
                        _this.refresh();
                    });
                    document.addEventListener("DOMNodeRemoved", function () {
                        _this.refresh();
                    });
                }
                _this.refresh();
            });
        };
        DOMExplorer.prototype._getElementByInternalId = function (internalId, node) {
            if (node.__internalId === internalId) {
                return node;
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
            var element = this._getElementByInternalId(receivedObject.order, document.body);
            if (!element) {
                return;
            }
            switch (receivedObject.type) {
                case "select":
                    element.__savedBorder = element.style.border;
                    element.style.border = "2px solid red";
                    break;
                case "unselect":
                    element.style.border = element.__savedBorder;
                    break;
                case "ruleEdit":
                    element.style[receivedObject.property] = receivedObject.newValue;
                    break;
            }
        };
        DOMExplorer.prototype.refresh = function () {
            var _this = this;
            VORLON.Tools.SetImmediate(function () {
                _this._packageAndSendDOM();
            }); // Give some time for the DOM to rebuild
        };
        DOMExplorer.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this._treeDiv = document.getElementById("treeView");
                _this._styleView = document.getElementById("styleView");
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
                    VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                        type: "ruleEdit",
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    }, 1 /* Dashboard */);
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
            var label = document.createElement("div");
            label.innerHTML = property;
            label.className = "styleLabel";
            label.contentEditable = "false";
            this._styleView.appendChild(label);
            var valueElement = this._generateClickableValue(label, value, internalId);
            this._styleView.appendChild(valueElement);
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
            // Append add style button
            this._generateButton(this._styleView, "+", "styleButton", function (button) {
                _this._styleView.removeChild(button);
                _this._generateStyle("property", "value", internalId, true);
                _this._styleView.appendChild(button);
            });
        };
        DOMExplorer.prototype._appendSpan = function (parent, className, value) {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;
            parent.appendChild(span);
        };
        DOMExplorer.prototype._generateColorfullLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeTag", "&lt;");
            this._appendSpan(link, "nodeName", receivedObject.name);
            if (receivedObject.id) {
                this._appendSpan(link, "nodeAttribute", " id");
                this._appendSpan(link, "nodeTag", "=\"");
                this._appendSpan(link, "nodeValue", receivedObject.id);
                this._appendSpan(link, "nodeTag", "\"");
            }
            if (receivedObject.classes) {
                this._appendSpan(link, "nodeAttribute", " class");
                this._appendSpan(link, "nodeTag", "=\"");
                this._appendSpan(link, "nodeValue", receivedObject.classes);
                this._appendSpan(link, "nodeTag", "\"");
            }
            this._appendSpan(link, "nodeTag", "&gt;");
        };
        DOMExplorer.prototype._generateColorfullClosingLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeTag", "&lt;/");
            this._appendSpan(link, "nodeName", receivedObject.name);
            this._appendSpan(link, "nodeTag", "&gt;");
        };
        DOMExplorer.prototype._generateButton = function (parentNode, text, className, onClick) {
            var button = document.createElement("div");
            button.innerHTML = text;
            button.className = className;
            button.addEventListener("click", function () { return onClick(button); });
            parentNode.appendChild(button);
        };
        DOMExplorer.prototype._generateTreeNode = function (parentNode, receivedObject, first) {
            var _this = this;
            if (first === void 0) { first = false; }
            var root = document.createElement("div");
            parentNode.appendChild(root);
            var container = document.createElement("div");
            this._generateButton(root, "-", "treeNodeButton", function (button) {
                if (container.style.display === "none") {
                    container.style.display = "";
                    button.innerHTML = "-";
                }
                else {
                    container.style.display = "none";
                    button.innerHTML = "+";
                }
            });
            // Main node
            var linkText = document.createElement("a");
            linkText.__targetInternalId = receivedObject.internalId;
            this._generateColorfullLink(linkText, receivedObject);
            linkText.addEventListener("click", function () {
                if (_this._previousSelectedNode) {
                    VORLON.Tools.RemoveClass(_this._previousSelectedNode, "treeNodeSelected");
                    VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                        type: "unselect",
                        order: _this._previousSelectedNode.__targetInternalId
                    }, 1 /* Dashboard */);
                }
                VORLON.Tools.AddClass(linkText, "treeNodeSelected");
                VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                    type: "select",
                    order: receivedObject.internalId
                }, 1 /* Dashboard */);
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
                    }, 0 /* Client */, "protocol");
                });
                root.appendChild(toolsLink);
            }
            // Children
            if (receivedObject.children) {
                for (var index = 0; index < receivedObject.children.length; index++) {
                    var childObject = receivedObject.children[index];
                    this._generateTreeNode(container, childObject);
                }
            }
            if (receivedObject.name) {
                var closingLink = document.createElement("div");
                closingLink.className = "treeNodeClosingText";
                this._generateColorfullClosingLink(closingLink, receivedObject);
                container.appendChild(closingLink);
            }
            root.appendChild(container);
        };
        DOMExplorer.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
            this._generateTreeNode(this._treeDiv, receivedObject, true);
        };
        return DOMExplorer;
    })(VORLON.Plugin);
    VORLON.DOMExplorer = DOMExplorer;
    // Register
    VORLON.Core.RegisterPlugin(new DOMExplorer());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.domExplorer.js.map