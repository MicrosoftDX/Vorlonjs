var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var NetworkPanel = (function (_super) {
        __extends(NetworkPanel, _super);
        function NetworkPanel() {
            //     name   ,  html for dash   css for dash
            _super.call(this, "networkpanel", "control.html", "control.css");
            this._id = "NETWORKPANEL";
            this._ready = false;
        }
        NetworkPanel.prototype.refresh = function () {
        };
        // This code will run on the client //////////////////////
        NetworkPanel.prototype.startClientSide = function () {
            this.setupXMLHttpRequestHook(true);
        };
        NetworkPanel.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            abcd;
        };
        NetworkPanel.prototype.setupXMLHttpRequestHook = function (debug) {
            var plugin = this;
            var w = window;
            w.___XMLHttpRequest = w.XMLHttpRequest;
            var XmlHttpRequestProxy = function () {
                var xhr = new w.___XMLHttpRequest();
                var data = {
                    id: VORLON.Tools.CreateGUID(),
                    url: null,
                    status: null,
                    statusText: null,
                    method: null,
                    responseType: null,
                    readyState: 0
                };
                xhr.__open = xhr.open;
                xhr.open = function () {
                    data.method = arguments[0];
                    data.url = arguments[1];
                    plugin.trace('request for ' + data.url);
                    plugin.sendToDashboard({ type: 'xhr', message: data });
                    return xhr.__open.apply(xhr, arguments);
                };
                xhr.addEventListener('readystatechange', function () {
                    data.readyState = xhr.readyState;
                    plugin.trace('STATE CHANGED ' + data.readyState);
                    if (data.readyState === 4) {
                        data.responseType = xhr.responseType;
                        data.status = xhr.status;
                        data.statusText = xhr.statusText;
                        plugin.trace('LOADED !!!');
                    }
                    plugin.sendToDashboard({ type: 'xhr', message: data });
                });
                return xhr;
            };
            w.XMLHttpRequest = XmlHttpRequestProxy;
        };
        NetworkPanel.prototype._render = function (tagname, parentNode, classname, value) {
            var elt = document.createElement(tagname);
            elt.className = classname || '';
            if (value)
                elt.innerHTML = value;
            parentNode.appendChild(elt);
            return elt;
        };
        NetworkPanel.prototype._mapAction = function (selector, onClick) {
            var button = this._dashboardDiv.querySelector(selector);
            button.addEventListener("click", function () { return onClick(button); });
            return button;
        };
        NetworkPanel.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._items = {};
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._itemsContainer = filledDiv.querySelector('.network-items');
                _this._clearButton = filledDiv.querySelector('x-action[event="clear"]');
                _this._clearButton.addEventListener('click', function (arg) {
                    _this.sendToClient({ type: 'clear' });
                    _this._itemsContainer.innerHTML = '';
                    _this._items = {};
                });
                _this._ready = true;
            });
        };
        NetworkPanel.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.type === 'xhr') {
                var item = receivedObject.message;
                this.processNetworkItem(item);
            }
            this.trace(receivedObject.message);
        };
        NetworkPanel.prototype.processNetworkItem = function (item) {
            var storedItem = this._items[item.id];
            if (!storedItem) {
                storedItem = new NetworkItemCtrl(this._itemsContainer, item);
                this._items[item.id] = storedItem;
            }
            storedItem.update(item);
        };
        return NetworkPanel;
    })(Plugin);
    VORLON.NetworkPanel = NetworkPanel;
    var NetworkItemCtrl = (function () {
        function NetworkItemCtrl(parent, item) {
            var _this = this;
            this.item = item;
            this.element = new VORLON.FluentDOM('DIV', 'network-item')
                .append('DIV', 'description', function (fdDesc) {
                fdDesc.append('DIV', 'status item smallitem', function (fdStatus) {
                    _this.statusElt = fdStatus.element;
                    fdStatus.html('<i class="fa fa-spin fa-spinner"></i>');
                })
                    .append('DIV', 'method item smallitem', function (fdMethod) {
                    fdMethod.text(item.method.toUpperCase());
                })
                    .append('DIV', 'url item', function (fdUrl) {
                    fdUrl.text(item.url);
                });
            })
                .append('DIV', 'details', function (fdDesc) {
                fdDesc.append('DIV', 'responsetype', function (fdResponseType) {
                    _this.responseTypeElt = fdResponseType.element;
                    fdResponseType.html('&nbsp;');
                });
            })
                .element;
            parent.appendChild(this.element);
        }
        NetworkItemCtrl.prototype.update = function (item) {
            this.item = item;
            if (item.readyState === 4) {
                if (item.status !== 200) {
                    this.element.classList.add('error');
                }
                this.statusElt.innerText = item.status.toString();
                this.responseTypeElt.innerText = 'response type : ' + (item.responseType || 'text');
            }
        };
        return NetworkItemCtrl;
    })();
    //Register the plugin with vorlon core
    Core.RegisterPlugin(new NetworkPanel());
})(VORLON || (VORLON = {}));
