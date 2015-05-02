var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ObjectExplorer = (function (_super) {
        __extends(ObjectExplorer, _super);
        function ObjectExplorer() {
            _super.call(this, "objectExplorer", "control.html", "control.css");
            this._ready = false;
        }
        ObjectExplorer.prototype.getID = function () {
            return "OBJEXPLORER";
        };
        ObjectExplorer.prototype._getProperty = function (propertyPath) {
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
        };
        ObjectExplorer.prototype.getObjDescriptor = function (object, pathTokens, scanChild) {
            if (scanChild === void 0) { scanChild = false; }
            pathTokens = pathTokens || [];
            var name = pathTokens[pathTokens.length - 1];
            var fullpath = 'window';
            if (!name) {
                name = 'window';
                fullpath = 'window';
            }
            else {
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
        };
        ObjectExplorer.prototype._packageAndSendObjectProperty = function () {
            var packagedObject = this._getProperty(this._currentPropertyPath);
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), packagedObject, 0 /* Client */);
        };
        ObjectExplorer.prototype._markForRefresh = function () {
            var _this = this;
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }
            this._timeoutId = setTimeout(function () {
                _this.refresh();
            }, 10000);
        };
        ObjectExplorer.prototype.startClientSide = function () {
            var _this = this;
            document.addEventListener("DOMContentLoaded", function () {
                if (VORLON.Core.Messenger.isConnected) {
                    document.addEventListener("DOMNodeInserted", function () {
                        _this._markForRefresh();
                    });
                    document.addEventListener("DOMNodeRemoved", function () {
                        _this._markForRefresh();
                    });
                }
                _this.refresh();
            });
        };
        ObjectExplorer.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            switch (receivedObject.type) {
                case "query":
                    this._currentPropertyPath = receivedObject.path;
                    this._packageAndSendObjectProperty();
                    break;
                default:
                    break;
            }
        };
        ObjectExplorer.prototype.refresh = function () {
            this._packageAndSendObjectProperty();
        };
        ObjectExplorer.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this._searchBoxInput = _this._containerDiv.querySelector("#txtPropertyName");
                _this._searchBtn = _this._containerDiv.querySelector("#btnSearchProp");
                _this._treeDiv = _this._containerDiv.querySelector("#treeViewObj");
                _this._objectContentView = _this._containerDiv.querySelector("#objectContentView");
                $('.obj-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
                _this._searchBtn.onclick = function () {
                    var path = _this._searchBoxInput.value;
                    if (path) {
                        _this._currentPropertyPath = path;
                        _this._queryObjectContent(path);
                    }
                };
                _this._ready = true;
            });
        };
        ObjectExplorer.prototype._queryObjectContent = function (objectPath) {
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "query",
                path: objectPath
            }, 1 /* Dashboard */);
        };
        ObjectExplorer.prototype._makeEditable = function (element) {
            element.contentEditable = "true";
            element.focus();
            VORLON.Tools.AddClass(element, "editable");
            var range = document.createRange();
            range.setStart(element, 0);
            range.setEnd(element, 1);
            window.getSelection().addRange(range);
        };
        ObjectExplorer.prototype._generateClickableValue = function (label, value, internalId) {
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
        ObjectExplorer.prototype._generateSelectedPropertyDescription = function (selectedProperty) {
            while (this._objectContentView.hasChildNodes()) {
                this._objectContentView.removeChild(this._objectContentView.lastChild);
            }
        };
        ObjectExplorer.prototype._appendSpan = function (parent, className, value) {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;
            parent.appendChild(span);
        };
        ObjectExplorer.prototype._generateColorfullLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeName", receivedObject.name);
        };
        ObjectExplorer.prototype._generateColorfullClosingLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeTag", "&lt;/");
            this._appendSpan(link, "nodeName", receivedObject.name);
            this._appendSpan(link, "nodeTag", "&gt;");
        };
        ObjectExplorer.prototype._generateButton = function (parentNode, text, className, onClick) {
            var button = document.createElement("div");
            button.innerHTML = text;
            button.className = className;
            button.addEventListener("click", function () { return onClick(button); });
            parentNode.appendChild(button);
        };
        ObjectExplorer.prototype._generateTreeNode = function (parentNode, receivedObject, first) {
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
                }
                VORLON.Tools.AddClass(linkText, "treeNodeSelected");
                _this._generateSelectedPropertyDescription(receivedObject);
                _this._previousSelectedNode = linkText;
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
        };
        ObjectExplorer.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
            this._generateTreeNode(this._treeDiv, receivedObject, true);
        };
        return ObjectExplorer;
    })(VORLON.Plugin);
    VORLON.ObjectExplorer = ObjectExplorer;
    // Register
    VORLON.Core.RegisterPlugin(new ObjectExplorer());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.objectExplorer.js.map