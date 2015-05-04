var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ObjectExplorerPlugin = (function (_super) {
        __extends(ObjectExplorerPlugin, _super);
        function ObjectExplorerPlugin() {
            _super.call(this, "objectExplorer", "control.html", "control.css");
            this.STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            this.ARGUMENT_NAMES = /([^\s,]+)/g;
            this.rootProperty = 'window';
            this._ready = false;
            this._contentCallbacks = {};
        }
        ObjectExplorerPlugin.prototype.getID = function () {
            return "OBJEXPLORER";
        };
        ObjectExplorerPlugin.prototype.getFunctionArgumentNames = function (func) {
            var result = [];
            try {
                var fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
                result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
                if (result === null)
                    result = [];
            }
            catch (exception) {
                console.error(exception);
            }
            return result;
        };
        ObjectExplorerPlugin.prototype._getProperty = function (propertyPath) {
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
        };
        ObjectExplorerPlugin.prototype.getObjDescriptor = function (object, pathTokens, scanChild) {
            if (scanChild === void 0) { scanChild = false; }
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
            }
            else {
                if (fullpath.indexOf(this.rootProperty + ".") !== 0 && pathTokens[0] !== this.rootProperty) {
                    fullpath = this.rootProperty + '.' + pathTokens.join('.');
                }
                else {
                    fullpath = pathTokens.join('.');
                }
            }
            //console.log('check ' + name + ' ' + type);
            var res = { type: type, name: name, fullpath: fullpath, contentFetched: false, content: [], value: null };
            if (type === 'string' || type === 'number' || type === 'boolean') {
                res.value = object.toString();
            }
            else if (type === 'function') {
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
        };
        ObjectExplorerPlugin.prototype._packageAndSendObjectProperty = function (type, path) {
            path = path || this._currentPropertyPath;
            var packagedObject = this._getProperty(path);
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), { type: type, path: packagedObject.fullpath, property: packagedObject }, VORLON.RuntimeSide.Client);
        };
        ObjectExplorerPlugin.prototype._markForRefresh = function () {
            var _this = this;
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }
            this._timeoutId = setTimeout(function () {
                _this.refresh();
            }, 10000);
        };
        ObjectExplorerPlugin.prototype.startClientSide = function () {
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
        ObjectExplorerPlugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
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
        };
        ObjectExplorerPlugin.prototype.refresh = function () {
            this._packageAndSendObjectProperty('refresh');
        };
        ObjectExplorerPlugin.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this._searchBoxInput = _this._containerDiv.querySelector("#txtPropertyName");
                _this._searchBtn = _this._containerDiv.querySelector("#btnSearchProp");
                _this._treeDiv = _this._containerDiv.querySelector("#treeViewObj");
                _this._searchBtn.onclick = function () {
                    var path = _this._searchBoxInput.value;
                    if (path) {
                        _this._currentPropertyPath = path;
                        _this._queryObjectContent(path);
                    }
                };
                _this._searchBoxInput.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13 || evt.keyCode === 9) {
                        var path = _this._searchBoxInput.value;
                        if (path) {
                            _this._currentPropertyPath = path;
                            _this._queryObjectContent(path);
                        }
                    }
                });
                _this._ready = true;
            });
        };
        ObjectExplorerPlugin.prototype._queryObjectContent = function (objectPath) {
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "query",
                path: objectPath
            }, VORLON.RuntimeSide.Dashboard);
        };
        ObjectExplorerPlugin.prototype._makeEditable = function (element) {
            element.contentEditable = "true";
            element.focus();
            VORLON.Tools.AddClass(element, "editable");
            var range = document.createRange();
            range.setStart(element, 0);
            range.setEnd(element, 1);
            window.getSelection().addRange(range);
        };
        ObjectExplorerPlugin.prototype._appendSpan = function (parent, className, value) {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;
            parent.appendChild(span);
        };
        ObjectExplorerPlugin.prototype._generateColorfullLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeName", receivedObject.name);
            this._appendSpan(link, "nodeType", '(' + receivedObject.type + ')');
            if (receivedObject.value) {
                this._appendSpan(link, "nodeValue", receivedObject.value);
            }
        };
        ObjectExplorerPlugin.prototype._generateColorfullClosingLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeTag", "&lt;/");
            this._appendSpan(link, "nodeName", receivedObject.name);
            this._appendSpan(link, "nodeTag", "&gt;");
        };
        ObjectExplorerPlugin.prototype._generateButton = function (parentNode, text, className, onClick) {
            var button = document.createElement("div");
            button.innerHTML = text;
            button.className = className;
            button.addEventListener("click", function () { return onClick(button); });
            parentNode.appendChild(button);
        };
        ObjectExplorerPlugin.prototype._generateTreeNode = function (parentNode, receivedObject, first) {
            var _this = this;
            if (first === void 0) { first = false; }
            var root = document.createElement("div");
            parentNode.appendChild(root);
            var container = document.createElement("div");
            container.style.display = 'none';
            var treeChilds = [];
            var renderChilds = function () {
                // Children
                if (receivedObject.contentFetched && receivedObject.content && receivedObject.content.length) {
                    container.style.display = '';
                    for (var index = 0; index < receivedObject.content.length; index++) {
                        var childObject = receivedObject.content[index];
                        _this._generateTreeNode(container, childObject);
                    }
                }
            };
            var getTreeChilds = function () {
                if (receivedObject.content && receivedObject.content.length) {
                    return receivedObject.content.filter(function (item) {
                        return item.type === 'object';
                    });
                }
                return [];
            };
            treeChilds = getTreeChilds();
            if (receivedObject.type === 'object') {
                this._generateButton(root, "+", "treeNodeButton", function (button) {
                    if (!receivedObject.contentFetched) {
                        _this._contentCallbacks[receivedObject.fullpath] = function (propertyData) {
                            _this._contentCallbacks[receivedObject.fullpath] = null;
                            receivedObject.contentFetched = true;
                            receivedObject.content = propertyData.content;
                            treeChilds = getTreeChilds();
                            renderChilds();
                        };
                        VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                            type: "queryContent",
                            path: receivedObject.fullpath
                        }, VORLON.RuntimeSide.Dashboard);
                    }
                    if (container.style.display === "none") {
                        container.style.display = "";
                        button.innerHTML = "-";
                    }
                    else {
                        container.style.display = "none";
                        button.innerHTML = "+";
                    }
                });
            }
            // Main node
            var linkText = document.createElement("a");
            this._generateColorfullLink(linkText, receivedObject);
            linkText.addEventListener("click", function () {
                _this._searchBoxInput.value = receivedObject.fullpath;
                _this._queryObjectContent(receivedObject.fullpath);
            });
            linkText.href = "#";
            linkText.className = "treeNodeHeader";
            root.appendChild(linkText);
            root.className = first ? "firstTreeNodeText" : "treeNodeText";
            renderChilds();
            root.appendChild(container);
        };
        ObjectExplorerPlugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.type === 'query' || receivedObject.type === 'refresh') {
                while (this._treeDiv.hasChildNodes()) {
                    this._treeDiv.removeChild(this._treeDiv.lastChild);
                }
                this._searchBoxInput.value = receivedObject.path;
                this._generateTreeNode(this._treeDiv, receivedObject.property, true);
            }
            else if (receivedObject.type === 'queryContent') {
                var callback = this._contentCallbacks[receivedObject.path];
                if (callback) {
                    callback(receivedObject.property);
                }
            }
        };
        return ObjectExplorerPlugin;
    })(VORLON.Plugin);
    VORLON.ObjectExplorerPlugin = ObjectExplorerPlugin;
    // Register
    VORLON.Core.RegisterPlugin(new ObjectExplorerPlugin());
})(VORLON || (VORLON = {}));
//# sourceMappingURL=vorlon.objectExplorer.js.map