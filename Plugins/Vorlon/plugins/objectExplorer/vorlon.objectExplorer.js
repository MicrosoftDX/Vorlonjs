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
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), { type: type, path: packagedObject.fullpath, property: packagedObject }, 0 /* Client */);
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
                _this._filterInput = _this._containerDiv.querySelector("#txtFilter");
                _this._searchBoxInput = _this._containerDiv.querySelector("#txtPropertyName");
                _this._searchBtn = _this._containerDiv.querySelector("#btnSearchProp");
                _this._searchUpBtn = _this._containerDiv.querySelector("#btnSearchUp");
                _this._treeDiv = _this._containerDiv.querySelector("#treeViewObj");
                _this._addLoader();
                _this._searchBtn.onclick = function () {
                    var path = _this._searchBoxInput.value;
                    if (path) {
                        _this.setCurrent(path);
                    }
                };
                _this._searchUpBtn.onclick = function () {
                    var path = _this._searchBoxInput.value;
                    if (path) {
                        var tokens = path.split('.');
                        if (tokens.length > 1) {
                            tokens.splice(tokens.length - 1, 1);
                            _this.setCurrent(tokens.join('.'));
                        }
                    }
                };
                _this._searchBoxInput.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13 || evt.keyCode === 9) {
                        var path = _this._searchBoxInput.value;
                        if (path) {
                            _this.setCurrent(path);
                        }
                    }
                });
                _this._filterInput.addEventListener("input", function (evt) {
                    //setTimeout(function(){});
                    _this.filter();
                });
                _this._ready = true;
            });
        };
        ObjectExplorerPlugin.prototype._addLoader = function () {
            var loader = document.createElement("div");
            loader.className = "loader";
            loader.innerHTML = '<span class="fa fa-spinner fa-spin"></span> loading...';
            this._treeDiv.appendChild(loader);
        };
        ObjectExplorerPlugin.prototype.setCurrent = function (path) {
            if (path !== this._currentPropertyPath)
                this._filterInput.value = '';
            this._searchBoxInput.value = path;
            this._currentPropertyPath = path;
            this._queryObjectContent(this._currentPropertyPath);
            this._empty();
            this._treeDiv.scrollTop = 0;
            this._addLoader();
        };
        ObjectExplorerPlugin.prototype.filter = function () {
            var path = this._filterInput.value.toLowerCase();
            var items = this._treeDiv.children;
            for (var index = 0, l = items.length; index < l; index++) {
                var node = items[index];
                var propname = node.getAttribute('data-propname');
                if (!propname || !path) {
                    node.style.display = '';
                }
                else {
                    if (propname.indexOf(path) >= 0) {
                        node.style.display = '';
                    }
                    else {
                        node.style.display = 'none';
                    }
                }
            }
        };
        ObjectExplorerPlugin.prototype._queryObjectContent = function (objectPath) {
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), {
                type: "query",
                path: objectPath
            }, 1 /* Dashboard */);
        };
        ObjectExplorerPlugin.prototype._appendSpan = function (parent, className, value) {
            var span = document.createElement("span");
            span.className = className;
            span.innerHTML = value;
            parent.appendChild(span);
        };
        ObjectExplorerPlugin.prototype._generateColorfullLink = function (link, receivedObject) {
            this._appendSpan(link, "nodeName", receivedObject.name);
            if (receivedObject.type !== 'object') {
                this._appendSpan(link, "nodeType", '(' + receivedObject.type + ')');
            }
            if (receivedObject.value) {
                this._appendSpan(link, "nodeValue", receivedObject.value);
            }
        };
        ObjectExplorerPlugin.prototype._generateButton = function (parentNode, text, className, onClick) {
            var button = this._render("div", parentNode, className, text);
            button.addEventListener("click", function () { return onClick(button); });
            return button;
        };
        ObjectExplorerPlugin.prototype._sortedList = function (list) {
            if (list && list.length) {
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
        };
        ObjectExplorerPlugin.prototype._render = function (tagname, parentNode, classname, value) {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        };
        ObjectExplorerPlugin.prototype._generateTreeNode = function (parentNode, receivedObject, first) {
            var _this = this;
            if (first === void 0) { first = false; }
            var root = this._render("div", parentNode);
            root.setAttribute('data-propname', receivedObject.name.toLowerCase());
            var nodeButton = null;
            var fetchingNode = false;
            var label = this._render("div", root, 'labels');
            var container = this._render("div", root, 'childNodes');
            container.style.display = 'none';
            var renderChilds = function () {
                if (receivedObject.contentFetched && receivedObject.content && receivedObject.content.length) {
                    var nodes = _this._sortedList(receivedObject.content);
                    for (var index = 0, l = nodes.length; index < l; index++) {
                        _this._generateTreeNode(container, nodes[index]);
                    }
                    container.style.display = '';
                }
            };
            var toggleNode = function (button) {
                if (!fetchingNode && !receivedObject.contentFetched) {
                    fetchingNode = true;
                    var spinner = _this._render("span", label, "loader", '&nbsp;<span class="fa fa-spinner fa-spin"></span>');
                    _this._contentCallbacks[receivedObject.fullpath] = function (propertyData) {
                        label.removeChild(spinner);
                        _this._contentCallbacks[receivedObject.fullpath] = null;
                        receivedObject.contentFetched = true;
                        receivedObject.content = propertyData.content;
                        renderChilds();
                    };
                    VORLON.Core.Messenger.sendRealtimeMessage(_this.getID(), {
                        type: "queryContent",
                        path: receivedObject.fullpath
                    }, 1 /* Dashboard */);
                }
                if (container.style.display === "none") {
                    container.style.display = "";
                    button.innerHTML = "-";
                }
                else {
                    container.style.display = "none";
                    button.innerHTML = "+";
                }
            };
            if (receivedObject.type === 'object') {
                nodeButton = this._generateButton(label, "+", "treeNodeButton", function (button) {
                    toggleNode(nodeButton);
                });
            }
            // Main node
            var linkText = null;
            if (receivedObject.type === 'object') {
                linkText = this._render("a", label, "treeNodeHeader");
                linkText.addEventListener("click", function () {
                    toggleNode(nodeButton);
                });
                linkText.href = "#";
            }
            else {
                linkText = this._render("span", label);
            }
            this._generateColorfullLink(linkText, receivedObject);
            label.appendChild(linkText);
            if (receivedObject.type === 'object') {
                this._generateButton(label, "", "attachNode fa fa-reply", function (button) {
                    _this.setCurrent(receivedObject.fullpath);
                });
            }
            root.className = first ? "firstTreeNodeText" : "treeNodeText";
            renderChilds();
        };
        ObjectExplorerPlugin.prototype._empty = function () {
            while (this._treeDiv.hasChildNodes()) {
                this._treeDiv.removeChild(this._treeDiv.lastChild);
            }
        };
        ObjectExplorerPlugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.type === 'query' || receivedObject.type === 'refresh') {
                this._empty();
                this._searchBoxInput.value = receivedObject.path;
                this._currentPropertyPath = receivedObject.path;
                if (receivedObject.property.content && receivedObject.property.content.length) {
                    var nodes = this._sortedList(receivedObject.property.content);
                    for (var index = 0, length = nodes.length; index < length; index++) {
                        this._generateTreeNode(this._treeDiv, nodes[index], true);
                    }
                }
                else {
                    this._generateTreeNode(this._treeDiv, receivedObject.property, true);
                }
                this.filter();
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
