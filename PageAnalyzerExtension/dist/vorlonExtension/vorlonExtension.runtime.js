var VORLON;
(function (VORLON) {
    var Tools = (function () {
        function Tools() {
        }
        Tools.QueryString = function () {
            // This function is anonymous, is executed immediately and 
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                }
                else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                    query_string[pair[0]] = arr;
                }
                else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        };
        Tools.QuerySelectorById = function (root, id) {
            if (root.querySelector) {
                return root.querySelector("#" + id);
            }
            return document.getElementById(id);
        };
        Tools.SetImmediate = function (func) {
            if (window.setImmediate) {
                setImmediate(func);
            }
            else {
                setTimeout(func, 0);
            }
        };
        Tools.setLocalStorageValue = function (key, data) {
            if (localStorage) {
                try {
                    localStorage.setItem(key, data);
                }
                catch (e) {
                }
            }
        };
        Tools.getLocalStorageValue = function (key) {
            if (localStorage) {
                try {
                    return localStorage.getItem(key);
                }
                catch (e) {
                    //local storage is not available (private mode maybe) 
                    return "";
                }
            }
        };
        // Intercept addEventListener calls by changing the prototype
        Tools.interceptAddEventListener = function () {
            var code = function () {
                var current = window.addEventListener;
                var customAddEventListener = function (name, func, capture) {
                    if (name === "message") {
                        var previousFunction = func;
                        func = function () {
                            var optionalParams = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                optionalParams[_i - 0] = arguments[_i];
                            }
                            var event = optionalParams[0];
                            // filtering messages sent by Vorlon code in the context of the page
                            // they should only be intercepted by the code of the content script
                            // otherwise we could break some logic of certain web pages
                            if (!(event && event.data && event.data.isVorlonMessage)) {
                                previousFunction.apply(window, optionalParams);
                            }
                        };
                    }
                    current.call(this, name, func, capture);
                };
                window.addEventListener = customAddEventListener;
            };
            var script = document.createElement('script');
            var scriptCode = '(' + code + ')()';
            script.textContent = scriptCode;
            (document.head || document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        };
        Tools.Hook = function (rootObject, functionToHook, hookingFunction) {
            var previousFunction = rootObject[functionToHook];
            rootObject[functionToHook] = function () {
                var optionalParams = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    optionalParams[_i - 0] = arguments[_i];
                }
                hookingFunction(optionalParams);
                previousFunction.apply(rootObject, optionalParams);
            };
            return previousFunction;
        };
        Tools.HookProperty = function (rootObjectName, propertyToHook, callback) {
            var currentCallbackID = this._callBackID++;
            window.addEventListener("message", function (event) {
                var isVorlonMessage = true;
                // We only accept messages from ourselves
                if (event.source != window)
                    return;
                if (event.data.id && (event.data.id === currentCallbackID)) {
                    var result = JSON.parse(event.data.value);
                    result.property = propertyToHook;
                    callback(result);
                }
            }, false);
            var code = function () {
                var getCallStack;
                //We have access to topframe - no longer a contentscript 
                var rootObject = window[rootObjectName];
                var initialValue = rootObject[propertyToHook];
                Object.defineProperty(rootObject, propertyToHook, {
                    get: function () {
                        var callStackObject = getCallStack(1);
                        window.postMessage({ id: currentCallbackID, value: JSON.stringify(callStackObject), isVorlonMessage: true }, "*");
                        return initialValue;
                    }
                });
            };
            var script = document.createElement('script');
            var scriptCode = '(' + code + ')()';
            scriptCode = scriptCode.replace("currentCallbackID", currentCallbackID.toString());
            scriptCode = scriptCode.replace("rootObjectName", "\"" + rootObjectName + "\"");
            scriptCode = scriptCode.replace(/propertyToHook/g, "\"" + propertyToHook + "\"");
            scriptCode = scriptCode.replace("var getCallStack;", "var getCallStack = " + Tools.getCallStack);
            script.textContent = scriptCode;
            (document.head || document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        };
        Tools.getCallStack = function (skipped) {
            skipped = skipped || 0;
            try {
                //Throw an error to generate a stack trace
                throw new Error();
            }
            catch (e) {
                //Split the stack trace into each line
                var stackLines = e.stack.split('\n');
                var callerIndex = 0;
                //Now walk though each line until we find a path reference
                for (var i = 2 + skipped, l = stackLines.length; i < l; i++) {
                    if (!(stackLines[i].indexOf("http://") >= 0) && !(stackLines[i].indexOf("https://") >= 0))
                        continue;
                    //We skipped all the lines with out an http so we now have a script reference
                    //This one is the class constructor, the next is the getScriptPath() call
                    //The one after that is the user code requesting the path info (so offset by 2)
                    callerIndex = i;
                    break;
                }
                var res = {
                    stack: e.stack,
                };
                var linetext = stackLines[callerIndex];
                //Now parse the string for each section we want to return
                //var pathParts = linetext.match(/((http[s]?:\/\/.+\/)([^\/]+\.js))([\/]):/);
                // if (pathParts){
                //     
                // }
                var opening = linetext.indexOf("http://");
                if (opening < 0) {
                    opening = linetext.indexOf("https://");
                }
                if (opening >= 0) {
                    var closing = linetext.indexOf(")", opening);
                    if (closing < 0)
                        closing = linetext.length - 1;
                    var filename = linetext.substr(opening, closing - opening);
                    var linestart = filename.indexOf(":", filename.lastIndexOf("/"));
                    res.file = filename.substr(0, linestart);
                    res.line = filename.substr(linestart + 1);
                }
                return res;
            }
        };
        Tools.CreateCookie = function (name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        };
        Tools.ReadCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return "";
        };
        // from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
        Tools.CreateGUID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        Tools.RemoveEmpties = function (arr) {
            var len = arr.length;
            for (var i = len - 1; i >= 0; i--) {
                if (!arr[i]) {
                    arr.splice(i, 1);
                    len--;
                }
            }
            return len;
        };
        Tools.AddClass = function (e, name) {
            if (e.classList) {
                if (name.indexOf(" ") < 0) {
                    e.classList.add(name);
                }
                else {
                    var namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (var i = 0, len = namesToAdd.length; i < len; i++) {
                        e.classList.add(namesToAdd[i]);
                    }
                }
                return e;
            }
            else {
                var className = e.className;
                var names = className.split(" ");
                var l = Tools.RemoveEmpties(names);
                var toAdd;
                if (name.indexOf(" ") >= 0) {
                    namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (i = 0; i < l; i++) {
                        var found = namesToAdd.indexOf(names[i]);
                        if (found >= 0) {
                            namesToAdd.splice(found, 1);
                        }
                    }
                    if (namesToAdd.length > 0) {
                        toAdd = namesToAdd.join(" ");
                    }
                }
                else {
                    var saw = false;
                    for (i = 0; i < l; i++) {
                        if (names[i] === name) {
                            saw = true;
                            break;
                        }
                    }
                    if (!saw) {
                        toAdd = name;
                    }
                }
                if (toAdd) {
                    if (l > 0 && names[0].length > 0) {
                        e.className = className + " " + toAdd;
                    }
                    else {
                        e.className = toAdd;
                    }
                }
                return e;
            }
        };
        Tools.RemoveClass = function (e, name) {
            if (e.classList) {
                if (e.classList.length === 0) {
                    return e;
                }
                var namesToRemove = name.split(" ");
                Tools.RemoveEmpties(namesToRemove);
                for (var i = 0, len = namesToRemove.length; i < len; i++) {
                    e.classList.remove(namesToRemove[i]);
                }
                return e;
            }
            else {
                var original = e.className;
                if (name.indexOf(" ") >= 0) {
                    namesToRemove = name.split(" ");
                    Tools.RemoveEmpties(namesToRemove);
                }
                else {
                    if (original.indexOf(name) < 0) {
                        return e;
                    }
                    namesToRemove = [name];
                }
                var removed;
                var names = original.split(" ");
                var namesLen = Tools.RemoveEmpties(names);
                for (i = namesLen - 1; i >= 0; i--) {
                    if (namesToRemove.indexOf(names[i]) >= 0) {
                        names.splice(i, 1);
                        removed = true;
                    }
                }
                if (removed) {
                    e.className = names.join(" ");
                }
                return e;
            }
        };
        Tools.ToggleClass = function (e, name, callback) {
            if (e.className.match(name)) {
                Tools.RemoveClass(e, name);
                if (callback)
                    callback(false);
            }
            else {
                Tools.AddClass(e, name);
                if (callback)
                    callback(true);
            }
        };
        Tools.htmlToString = function (text) {
            return text;
        };
        Tools._callBackID = 1;
        return Tools;
    })();
    VORLON.Tools = Tools;
    var FluentDOM = (function () {
        function FluentDOM(nodeType, className, parentElt, parent) {
            this.childs = [];
            if (nodeType) {
                this.element = document.createElement(nodeType);
                if (className)
                    this.element.className = className;
                if (parentElt)
                    parentElt.appendChild(this.element);
                this.parent = parent;
                if (parent) {
                    parent.childs.push(this);
                }
            }
        }
        FluentDOM.forElement = function (element) {
            var res = new FluentDOM(null);
            res.element = element;
            return res;
        };
        FluentDOM.prototype.addClass = function (classname) {
            this.element.classList.add(classname);
            return this;
        };
        FluentDOM.prototype.toggleClass = function (classname) {
            this.element.classList.toggle(classname);
            return this;
        };
        FluentDOM.prototype.hasClass = function (classname) {
            return this.element.classList.contains(classname);
        };
        FluentDOM.prototype.className = function (classname) {
            this.element.className = classname;
            return this;
        };
        FluentDOM.prototype.opacity = function (opacity) {
            this.element.style.opacity = opacity;
            return this;
        };
        FluentDOM.prototype.display = function (display) {
            this.element.style.display = display;
            return this;
        };
        FluentDOM.prototype.hide = function () {
            this.element.style.display = 'none';
            return this;
        };
        FluentDOM.prototype.visibility = function (visibility) {
            this.element.style.visibility = visibility;
            return this;
        };
        FluentDOM.prototype.text = function (text) {
            this.element.textContent = text;
            return this;
        };
        FluentDOM.prototype.html = function (text) {
            this.element.innerHTML = text;
            return this;
        };
        FluentDOM.prototype.attr = function (name, val) {
            this.element.setAttribute(name, val);
            return this;
        };
        FluentDOM.prototype.editable = function (editable) {
            this.element.contentEditable = editable ? "true" : "false";
            return this;
        };
        FluentDOM.prototype.style = function (name, val) {
            this.element.style[name] = val;
            return this;
        };
        FluentDOM.prototype.appendTo = function (elt) {
            elt.appendChild(this.element);
            return this;
        };
        FluentDOM.prototype.append = function (nodeType, className, callback) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            if (callback) {
                callback(child);
            }
            return this;
        };
        FluentDOM.prototype.createChild = function (nodeType, className) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            return child;
        };
        FluentDOM.prototype.click = function (callback) {
            this.element.addEventListener('click', callback);
            return this;
        };
        FluentDOM.prototype.blur = function (callback) {
            this.element.addEventListener('blur', callback);
            return this;
        };
        FluentDOM.prototype.keydown = function (callback) {
            this.element.addEventListener('keydown', callback);
            return this;
        };
        return FluentDOM;
    })();
    VORLON.FluentDOM = FluentDOM;
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    (function (RuntimeSide) {
        RuntimeSide[RuntimeSide["Client"] = 0] = "Client";
        RuntimeSide[RuntimeSide["Dashboard"] = 1] = "Dashboard";
        RuntimeSide[RuntimeSide["Both"] = 2] = "Both";
    })(VORLON.RuntimeSide || (VORLON.RuntimeSide = {}));
    var RuntimeSide = VORLON.RuntimeSide;
    (function (PluginType) {
        PluginType[PluginType["OneOne"] = 0] = "OneOne";
        PluginType[PluginType["MulticastReceiveOnly"] = 1] = "MulticastReceiveOnly";
        PluginType[PluginType["Multicast"] = 2] = "Multicast";
    })(VORLON.PluginType || (VORLON.PluginType = {}));
    var PluginType = VORLON.PluginType;
})(VORLON || (VORLON = {}));

window.browser = window.msBrowser ||
    window.browser ||
    window.chrome;
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, targetTabId) {
            var _this = this;
            this._targetTabId = targetTabId;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        _this.onRealtimeMessageReceived(request);
                    });
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        _this.onRealtimeMessageReceived(request);
                    });
                    break;
            }
        }
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, command) {
            if (messageType === void 0) { messageType = "message"; }
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    messageType: messageType
                },
                data: objectToSend
            };
            if (command) {
                message.command = command;
            }
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    browser.runtime.sendMessage(message);
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.tabs.sendMessage(this._targetTabId, message);
                    break;
            }
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var _Core = (function () {
        function _Core() {
            this._clientPlugins = new Array();
            this._dashboardPlugins = new Array();
        }
        Object.defineProperty(_Core.prototype, "Messenger", {
            get: function () {
                return VORLON.Core._messenger;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "ClientPlugins", {
            get: function () {
                return VORLON.Core._clientPlugins;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "DashboardPlugins", {
            get: function () {
                return VORLON.Core._dashboardPlugins;
            },
            enumerable: true,
            configurable: true
        });
        _Core.prototype.RegisterClientPlugin = function (plugin) {
            VORLON.Core._clientPlugins.push(plugin);
        };
        _Core.prototype.RegisterDashboardPlugin = function (plugin) {
            VORLON.Core._dashboardPlugins.push(plugin);
        };
        _Core.prototype.StartClientSide = function () {
            VORLON.Core._side = VORLON.RuntimeSide.Client;
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            // Launch plugins
            for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                var plugin = VORLON.Core._clientPlugins[index];
                plugin.startClientSide();
            }
        };
        _Core.prototype.StartDashboardSide = function (tabid, divMapper) {
            VORLON.Core._side = VORLON.RuntimeSide.Dashboard;
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, tabid);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            // Launch plugins
            for (var index = 0; index < VORLON.Core._dashboardPlugins.length; index++) {
                var plugin = VORLON.Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
            VORLON.Core.Messenger.sendRealtimeMessage("ALL_PLUGINS", {}, VORLON.RuntimeSide.Dashboard, "refresh");
        };
        _Core.prototype._Dispatch = function (message) {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }
            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        };
        _Core.prototype._DispatchPluginMessage = function (plugin, message) {
            if (message.metadata.side === VORLON.RuntimeSide.Client) {
                VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
            }
            else {
                if (message.metadata.messageType === "refresh") {
                    plugin.refresh();
                }
                else {
                    VORLON.Core._DispatchFromDashboardPluginMessage(plugin, message);
                }
            }
        };
        _Core.prototype._DispatchFromClientPluginMessage = function (plugin, message) {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        };
        _Core.prototype._DispatchFromDashboardPluginMessage = function (plugin, message) {
            if (message.command && plugin.ClientCommands) {
                var command = plugin.ClientCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromDashboardSide(message.data);
        };
        return _Core;
    })();
    VORLON._Core = _Core;
    VORLON.Core = new _Core();
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var BasePlugin = (function () {
        function BasePlugin(name) {
            this.name = name;
            this._ready = true;
            this._id = "";
            this._type = VORLON.PluginType.OneOne;
            this.loadingDirectory = "/plugin";
        }
        Object.defineProperty(BasePlugin.prototype, "Type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        BasePlugin.prototype.getID = function () {
            return this._id;
        };
        BasePlugin.prototype.isReady = function () {
            return this._ready;
        };
        return BasePlugin;
    })();
    VORLON.BasePlugin = BasePlugin;
})(VORLON || (VORLON = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ClientPlugin = (function (_super) {
        __extends(ClientPlugin, _super);
        function ClientPlugin(name) {
            _super.call(this, name);
        }
        ClientPlugin.prototype.startClientSide = function () { };
        ClientPlugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) { };
        ClientPlugin.prototype.sendToDashboard = function (data) {
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message");
        };
        ClientPlugin.prototype.sendCommandToDashboard = function (command, data) {
            if (data === void 0) { data = null; }
            if (VORLON.Core.Messenger) {
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message", command);
            }
        };
        ClientPlugin.prototype.trace = function (message) {
            console.log(message);
        };
        ClientPlugin.prototype.refresh = function () {
            console.error("Please override plugin.refresh()");
        };
        ClientPlugin.prototype._loadNewScriptAsync = function (scriptName, callback, waitForDOMContentLoaded) {
            callback();
            // NOTHING ELSE NEEDED IN EXTENSION VERSION
        };
        return ClientPlugin;
    })(VORLON.BasePlugin);
    VORLON.ClientPlugin = ClientPlugin;
})(VORLON || (VORLON = {}));

/*! aXe v1.1.1
 * Copyright (c) 2015 Deque Systems, Inc.
 *
 * Your use of this Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This entire copyright notice must appear in every copy of this file you
 * distribute or in any file that contains substantial portions of this source
 * code.
 */
(function(window, document) {
  function clone(obj) {
    "use strict";
    var index, length, out = obj;
    if (obj !== null && typeof obj === "object") {
      if (Array.isArray(obj)) {
        out = [];
        for (index = 0, length = obj.length; index < length; index++) {
          out[index] = clone(obj[index]);
        }
      } else {
        out = {};
        for (index in obj) {
          out[index] = clone(obj[index]);
        }
      }
    }
    return out;
  }
  var matchesSelector = function() {
    "use strict";
    var method;
    function getMethod(win) {
      var elProto = win.Element; // MS EDGE
      
      if (!elProto) {
          elProto = window.Element;
      }
      
      elProto = elProto.prototype;
      
      var index, candidate, candidates = [ "matches", "matchesSelector", "mozMatchesSelector", "webkitMatchesSelector", "msMatchesSelector" ], length = candidates.length;
      for (index = 0; index < length; index++) {
        candidate = candidates[index];
        if (elProto[candidate]) {
          return candidate;
        }
      }
    }
    return function(node, selector) {
      if (!method || !node[method]) {
        method = getMethod(node.ownerDocument.defaultView);
      }
      return node[method](selector);
    };
  }();
  var escapeSelector = function(value) {
    "use strict";
    var string = String(value);
    var length = string.length;
    var index = -1;
    var codeUnit;
    var result = "";
    var firstCodeUnit = string.charCodeAt(0);
    while (++index < length) {
      codeUnit = string.charCodeAt(index);
      if (codeUnit == 0) {
        throw new Error("INVALID_CHARACTER_ERR");
      }
      if (codeUnit >= 1 && codeUnit <= 31 || codeUnit >= 127 && codeUnit <= 159 || index == 0 && codeUnit >= 48 && codeUnit <= 57 || index == 1 && codeUnit >= 48 && codeUnit <= 57 && firstCodeUnit == 45) {
        result += "\\" + codeUnit.toString(16) + " ";
        continue;
      }
      if (index == 1 && codeUnit == 45 && firstCodeUnit == 45) {
        result += "\\" + string.charAt(index);
        continue;
      }
      if (codeUnit >= 128 || codeUnit == 45 || codeUnit == 95 || codeUnit >= 48 && codeUnit <= 57 || codeUnit >= 65 && codeUnit <= 90 || codeUnit >= 97 && codeUnit <= 122) {
        result += string.charAt(index);
        continue;
      }
      result += "\\" + string.charAt(index);
    }
    return result;
  };
  var uuid;
  (function(_global) {
    var _rng;
    var _crypto = null;//_global.crypto || _global.msCrypto; MS EDGE
    if (!_rng && _crypto && _crypto.getRandomValues) {
      var _rnds8 = new Uint8Array(16);
      _rng = function whatwgRNG() {
        _crypto.getRandomValues(_rnds8);
        return _rnds8;
      };
    }
    if (!_rng) {
      var _rnds = new Array(16);
      _rng = function() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 3) === 0) {
            r = Math.random() * 4294967296;
          }
          _rnds[i] = r >>> ((i & 3) << 3) & 255;
        }
        return _rnds;
      };
    }
    var BufferClass = typeof _global.Buffer == "function" ? _global.Buffer : Array;
    var _byteToHex = [];
    var _hexToByte = {};
    for (var i = 0; i < 256; i++) {
      _byteToHex[i] = (i + 256).toString(16).substr(1);
      _hexToByte[_byteToHex[i]] = i;
    }
    function parse(s, buf, offset) {
      var i = buf && offset || 0, ii = 0;
      buf = buf || [];
      s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
        if (ii < 16) {
          buf[i + ii++] = _hexToByte[oct];
        }
      });
      while (ii < 16) {
        buf[i + ii++] = 0;
      }
      return buf;
    }
    function unparse(buf, offset) {
      var i = offset || 0, bth = _byteToHex;
      return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + "-" + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
    }
    var _seedBytes = _rng();
    var _nodeId = [ _seedBytes[0] | 1, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5] ];
    var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 16383;
    var _lastMSecs = 0, _lastNSecs = 0;
    function v1(options, buf, offset) {
      var i = buf && offset || 0;
      var b = buf || [];
      options = options || {};
      var clockseq = options.clockseq != null ? options.clockseq : _clockseq;
      var msecs = options.msecs != null ? options.msecs : new Date().getTime();
      var nsecs = options.nsecs != null ? options.nsecs : _lastNSecs + 1;
      var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      if (dt < 0 && options.clockseq == null) {
        clockseq = clockseq + 1 & 16383;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
        nsecs = 0;
      }
      if (nsecs >= 1e4) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      b[i++] = tl >>> 24 & 255;
      b[i++] = tl >>> 16 & 255;
      b[i++] = tl >>> 8 & 255;
      b[i++] = tl & 255;
      var tmh = msecs / 4294967296 * 1e4 & 268435455;
      b[i++] = tmh >>> 8 & 255;
      b[i++] = tmh & 255;
      b[i++] = tmh >>> 24 & 15 | 16;
      b[i++] = tmh >>> 16 & 255;
      b[i++] = clockseq >>> 8 | 128;
      b[i++] = clockseq & 255;
      var node = options.node || _nodeId;
      for (var n = 0; n < 6; n++) {
        b[i + n] = node[n];
      }
      return buf ? buf : unparse(b);
    }
    function v4(options, buf, offset) {
      var i = buf && offset || 0;
      if (typeof options == "string") {
        buf = options == "binary" ? new BufferClass(16) : null;
        options = null;
      }
      options = options || {};
      var rnds = options.random || (options.rng || _rng)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        for (var ii = 0; ii < 16; ii++) {
          buf[i + ii] = rnds[ii];
        }
      }
      return buf || unparse(rnds);
    }
    uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    uuid.parse = parse;
    uuid.unparse = unparse;
    uuid.BufferClass = BufferClass;
  })(window);
  var axe = {};
  var commons;
  var require, define;
  var utils = axe.utils = {};
  utils.matchesSelector = matchesSelector;
  utils.escapeSelector = escapeSelector;
  utils.clone = clone;
  var helpers = {};
  function setDefaultConfiguration(audit) {
    "use strict";
    var config = audit || {};
    config.rules = config.rules || [];
    config.tools = config.tools || [];
    config.checks = config.checks || [];
    config.data = config.data || {
      checks: {},
      rules: {}
    };
    return config;
  }
  function unpackToObject(collection, audit, method) {
    "use strict";
    var i, l;
    for (i = 0, l = collection.length; i < l; i++) {
      audit[method](collection[i]);
    }
  }
  function Audit(audit) {
    "use strict";
    audit = setDefaultConfiguration(audit);
    axe.commons = commons = audit.commons;
    this.reporter = audit.reporter;
    this.rules = [];
    this.tools = {};
    this.checks = {};
    unpackToObject(audit.rules, this, "addRule");
    unpackToObject(audit.tools, this, "addTool");
    unpackToObject(audit.checks, this, "addCheck");
    this.data = audit.data || {
      checks: {},
      rules: {}
    };
    injectStyle(audit.style);
  }
  Audit.prototype.addRule = function(spec) {
    "use strict";
    if (spec.metadata) {
      this.data.rules[spec.id] = spec.metadata;
    }
    var candidate;
    for (var i = 0, l = this.rules.length; i < l; i++) {
      candidate = this.rules[i];
      if (candidate.id === spec.id) {
        this.rules[i] = new Rule(spec, this);
        return;
      }
    }
    this.rules.push(new Rule(spec, this));
  };
  Audit.prototype.addTool = function(spec) {
    "use strict";
    this.tools[spec.id] = new Tool(spec);
  };
  Audit.prototype.addCheck = function(spec) {
    "use strict";
    if (spec.metadata) {
      this.data.checks[spec.id] = spec.metadata;
    }
    this.checks[spec.id] = new Check(spec);
  };
  Audit.prototype.run = function(context, options, fn) {
    "use strict";
    var q = utils.queue();
    this.rules.forEach(function(rule) {
      if (utils.ruleShouldRun(rule, context, options)) {
        q.defer(function(cb) {
          rule.run(context, options, cb);
        });
      }
    });
    q.then(fn);
  };
  Audit.prototype.after = function(results, options) {
    "use strict";
    var rules = this.rules;
    return results.map(function(ruleResult) {
      var rule = utils.findBy(rules, "id", ruleResult.id);
      return rule.after(ruleResult, options);
    });
  };
  function CheckResult(check) {
    "use strict";
    this.id = check.id;
    this.data = null;
    this.relatedNodes = [];
    this.result = null;
  }
  function Check(spec) {
    "use strict";
    this.id = spec.id;
    this.options = spec.options;
    this.selector = spec.selector;
    this.evaluate = spec.evaluate;
    if (spec.after) {
      this.after = spec.after;
    }
    if (spec.matches) {
      this.matches = spec.matches;
    }
    this.enabled = spec.hasOwnProperty("enabled") ? spec.enabled : true;
  }
  Check.prototype.matches = function(node) {
    "use strict";
    if (!this.selector || utils.matchesSelector(node, this.selector)) {
      return true;
    }
    return false;
  };
  Check.prototype.run = function(node, options, callback) {
    "use strict";
    options = options || {};
    var enabled = options.hasOwnProperty("enabled") ? options.enabled : this.enabled, checkOptions = options.options || this.options;
    if (enabled && this.matches(node)) {
      var checkResult = new CheckResult(this);
      var checkHelper = utils.checkHelper(checkResult, callback);
      var result;
      try {
        result = this.evaluate.call(checkHelper, node, checkOptions);
      } catch (e) {
        axe.log(e.message, e.stack);
        callback(null);
        return;
      }
      if (!checkHelper.isAsync) {
        checkResult.result = result;
        setTimeout(function() {
          callback(checkResult);
        }, 0);
      }
    } else {
      callback(null);
    }
  };
  function pushUniqueFrame(collection, frame) {
    "use strict";
    if (utils.isHidden(frame)) {
      return;
    }
    var fr = utils.findBy(collection, "node", frame);
    if (!fr) {
      collection.push({
        node: frame,
        include: [],
        exclude: []
      });
    }
  }
  function pushUniqueFrameSelector(context, type, selectorArray) {
    "use strict";
    context.frames = context.frames || [];
    var result, frame;
    var frames = document.querySelectorAll(selectorArray.shift());
    frameloop: for (var i = 0, l = frames.length; i < l; i++) {
      frame = frames[i];
      for (var j = 0, l2 = context.frames.length; j < l2; j++) {
        if (context.frames[j].node === frame) {
          context.frames[j][type].push(selectorArray);
          break frameloop;
        }
      }
      result = {
        node: frame,
        include: [],
        exclude: []
      };
      if (selectorArray) {
        result[type].push(selectorArray);
      }
      context.frames.push(result);
    }
  }
  function normalizeContext(context) {
    "use strict";
    if (context && typeof context === "object" || context instanceof NodeList) {
      if (context instanceof Node) {
        return {
          include: [ context ],
          exclude: []
        };
      }
      if (context.hasOwnProperty("include") || context.hasOwnProperty("exclude")) {
        return {
          include: context.include || [ document ],
          exclude: context.exclude || []
        };
      }
      if (context.length === +context.length) {
        return {
          include: context,
          exclude: []
        };
      }
    }
    if (typeof context === "string") {
      return {
        include: [ context ],
        exclude: []
      };
    }
    return {
      include: [ document ],
      exclude: []
    };
  }
  function parseSelectorArray(context, type) {
    "use strict";
    var item, result = [];
    for (var i = 0, l = context[type].length; i < l; i++) {
      item = context[type][i];
      if (typeof item === "string") {
        result = result.concat(utils.toArray(document.querySelectorAll(item)));
        break;
      } else {
        if (item && item.length) {
          if (item.length > 1) {
            pushUniqueFrameSelector(context, type, item);
          } else {
            result = result.concat(utils.toArray(document.querySelectorAll(item[0])));
          }
        } else {
          result.push(item);
        }
      }
    }
    return result.filter(function(r) {
      return r;
    });
  }
  function Context(spec) {
    "use strict";
    var self = this;
    this.frames = [];
    this.initiator = spec && typeof spec.initiator === "boolean" ? spec.initiator : true;
    this.page = false;
    spec = normalizeContext(spec);
    this.exclude = spec.exclude;
    this.include = spec.include;
    this.include = parseSelectorArray(this, "include");
    this.exclude = parseSelectorArray(this, "exclude");
    utils.select("frame, iframe", this).forEach(function(frame) {
      if (isNodeInContext(frame, self)) {
        pushUniqueFrame(self.frames, frame);
      }
    });
    if (this.include.length === 1 && this.include[0] === document) {
      this.page = true;
    }
  }
  function RuleResult(rule) {
    "use strict";
    this.id = rule.id;
    this.result = axe.constants.result.NA;
    this.pageLevel = rule.pageLevel;
    this.impact = null;
    this.nodes = [];
  }
  function Rule(spec, parentAudit) {
    "use strict";
    this._audit = parentAudit;
    this.id = spec.id;
    this.selector = spec.selector || "*";
    this.excludeHidden = typeof spec.excludeHidden === "boolean" ? spec.excludeHidden : true;
    this.enabled = typeof spec.enabled === "boolean" ? spec.enabled : true;
    this.pageLevel = typeof spec.pageLevel === "boolean" ? spec.pageLevel : false;
    this.any = spec.any || [];
    this.all = spec.all || [];
    this.none = spec.none || [];
    this.tags = spec.tags || [];
    if (spec.matches) {
      this.matches = spec.matches;
    }
  }
  Rule.prototype.matches = function() {
    "use strict";
    return true;
  };
  Rule.prototype.gather = function(context) {
    "use strict";
    var elements = utils.select(this.selector, context);
    if (this.excludeHidden) {
      return elements.filter(function(element) {
        return !utils.isHidden(element);
      });
    }
    return elements;
  };
  Rule.prototype.runChecks = function(type, node, options, callback) {
    "use strict";
    var self = this;
    var checkQueue = utils.queue();
    this[type].forEach(function(c) {
      var check = self._audit.checks[c.id || c];
      var option = utils.getCheckOption(check, self.id, options);
      checkQueue.defer(function(done) {
        check.run(node, option, done);
      });
    });
    checkQueue.then(function(results) {
      results = results.filter(function(check) {
        return check;
      });
      callback({
        type: type,
        results: results
      });
    });
  };
  Rule.prototype.run = function(context, options, callback) {
    "use strict";
    var nodes = this.gather(context);
    var q = utils.queue();
    var self = this;
    var ruleResult;
    ruleResult = new RuleResult(this);
    nodes.forEach(function(node) {
      if (self.matches(node)) {
        q.defer(function(nodeQueue) {
          var checkQueue = utils.queue();
          checkQueue.defer(function(done) {
            self.runChecks("any", node, options, done);
          });
          checkQueue.defer(function(done) {
            self.runChecks("all", node, options, done);
          });
          checkQueue.defer(function(done) {
            self.runChecks("none", node, options, done);
          });
          checkQueue.then(function(results) {
            if (results.length) {
              var hasResults = false, result = {
                node: new utils.DqElement(node)
              };
              results.forEach(function(r) {
                var res = r.results.filter(function(result) {
                  return result;
                });
                result[r.type] = res;
                if (res.length) {
                  hasResults = true;
                }
              });
              if (hasResults) {
                ruleResult.nodes.push(result);
              }
            }
            nodeQueue();
          });
        });
      }
    });
    q.then(function() {
      callback(ruleResult);
    });
  };
  function findAfterChecks(rule) {
    "use strict";
    return utils.getAllChecks(rule).map(function(c) {
      var check = rule._audit.checks[c.id || c];
      return typeof check.after === "function" ? check : null;
    }).filter(Boolean);
  }
  function findCheckResults(nodes, checkID) {
    "use strict";
    var checkResults = [];
    nodes.forEach(function(nodeResult) {
      var checks = utils.getAllChecks(nodeResult);
      checks.forEach(function(checkResult) {
        if (checkResult.id === checkID) {
          checkResults.push(checkResult);
        }
      });
    });
    return checkResults;
  }
  function filterChecks(checks) {
    "use strict";
    return checks.filter(function(check) {
      return check.filtered !== true;
    });
  }
  function sanitizeNodes(result) {
    "use strict";
    var checkTypes = [ "any", "all", "none" ];
    var nodes = result.nodes.filter(function(detail) {
      var length = 0;
      checkTypes.forEach(function(type) {
        detail[type] = filterChecks(detail[type]);
        length += detail[type].length;
      });
      return length > 0;
    });
    if (result.pageLevel && nodes.length) {
      nodes = [ nodes.reduce(function(a, b) {
        if (a) {
          checkTypes.forEach(function(type) {
            a[type].push.apply(a[type], b[type]);
          });
          return a;
        }
      }) ];
    }
    return nodes;
  }
  Rule.prototype.after = function(result, options) {
    "use strict";
    var afterChecks = findAfterChecks(this);
    var ruleID = this.id;
    afterChecks.forEach(function(check) {
      var beforeResults = findCheckResults(result.nodes, check.id);
      var option = utils.getCheckOption(check, ruleID, options);
      var afterResults = check.after(beforeResults, option);
      beforeResults.forEach(function(item) {
        if (afterResults.indexOf(item) === -1) {
          item.filtered = true;
        }
      });
    });
    result.nodes = sanitizeNodes(result);
    return result;
  };
  function Tool(spec) {
    "use strict";
    spec.source = spec.source || {};
    this.id = spec.id;
    this.options = spec.options;
    this._run = spec.source.run;
    this._cleanup = spec.source.cleanup;
    this.active = false;
  }
  Tool.prototype.run = function(element, options, callback) {
    "use strict";
    options = typeof options === "undefined" ? this.options : options;
    this.active = true;
    this._run(element, options, callback);
  };
  Tool.prototype.cleanup = function(callback) {
    "use strict";
    this.active = false;
    this._cleanup(callback);
  };
  axe.constants = {};
  axe.constants.result = {
    PASS: "PASS",
    FAIL: "FAIL",
    NA: "NA"
  };
  axe.constants.raisedMetadata = {
    impact: [ "minor", "moderate", "serious", "critical" ]
  };
  axe.version = "dev";
  window.axe = axe;
  axe.log = function() {
    "use strict";
    if (typeof console === "object" && console.log) {
      Function.prototype.apply.call(console.log, console, arguments);
    }
  };
  function cleanupTools(callback) {
    "use strict";
    if (!axe._audit) {
      throw new Error("No audit configured");
    }
    var q = utils.queue();
    Object.keys(axe._audit.tools).forEach(function(key) {
      var tool = axe._audit.tools[key];
      if (tool.active) {
        q.defer(function(done) {
          tool.cleanup(done);
        });
      }
    });
    utils.toArray(document.querySelectorAll("frame, iframe")).forEach(function(frame) {
      q.defer(function(done) {
        return utils.sendCommandToFrame(frame, {
          command: "cleanup-tool"
        }, done);
      });
    });
    q.then(callback);
  }
  axe.cleanup = cleanupTools;
  axe.configure = function(spec) {
    "use strict";
    var audit = axe._audit;
    if (!audit) {
      throw new Error("No audit configured");
    }
    if (spec.reporter && (typeof spec.reporter === "function" || reporters[spec.reporter])) {
      audit.reporter = spec.reporter;
    }
    if (spec.checks) {
      spec.checks.forEach(function(check) {
        audit.addCheck(check);
      });
    }
    if (spec.rules) {
      spec.rules.forEach(function(rule) {
        audit.addRule(rule);
      });
    }
    if (spec.tools) {
      spec.tools.forEach(function(tool) {
        audit.addTool(tool);
      });
    }
  };
  axe.getRules = function(tags) {
    "use strict";
    tags = tags || [];
    var matchingRules = !tags.length ? axe._audit.rules : axe._audit.rules.filter(function(item) {
      return !!tags.filter(function(tag) {
        return item.tags.indexOf(tag) !== -1;
      }).length;
    });
    var ruleData = axe._audit.data.rules || {};
    return matchingRules.map(function(matchingRule) {
      var rd = ruleData[matchingRule.id] || {};
      return {
        ruleId: matchingRule.id,
        description: rd.description,
        help: rd.help,
        helpUrl: rd.helpUrl,
        tags: matchingRule.tags
      };
    });
  };
  function runCommand(data, callback) {
    "use strict";
    var context = data && data.context || {};
    if (context.include && !context.include.length) {
      context.include = [ document ];
    }
    var options = data && data.options || {};
    switch (data.command) {
     case "rules":
      return runRules(context, options, callback);

     case "run-tool":
      return runTool(data.parameter, data.selectorArray, options, callback);

     case "cleanup-tool":
      return cleanupTools(callback);
    }
  }
  axe._load = function(audit) {
    "use strict";
    utils.respondable.subscribe("axe.ping", function(data, respond) {
      respond({
        axe: true
      });
    });
    utils.respondable.subscribe("axe.start", runCommand);
    axe._audit = new Audit(audit);
  };
  var reporters = {};
  var defaultReporter;
  function getReporter(reporter) {
    "use strict";
    if (typeof reporter === "string" && reporters[reporter]) {
      return reporters[reporter];
    }
    if (typeof reporter === "function") {
      return reporter;
    }
    return defaultReporter;
  }
  axe.reporter = function registerReporter(name, cb, isDefault) {
    "use strict";
    reporters[name] = cb;
    if (isDefault) {
      defaultReporter = cb;
    }
  };
  function runRules(context, options, callback) {
    "use strict";
    context = new Context(context);
    var q = utils.queue();
    var audit = axe._audit;
    if (context.frames.length) {
      q.defer(function(done) {
        utils.collectResultsFromFrames(context, options, "rules", null, done);
      });
    }
    q.defer(function(cb) {
      audit.run(context, options, cb);
    });
    q.then(function(data) {
      var results = utils.mergeResults(data.map(function(d) {
        return {
          results: d
        };
      }));
      if (context.initiator) {
        results = audit.after(results, options);
        results = results.map(utils.finalizeRuleResult);
      }
      callback(results);
    });
  }
  axe.a11yCheck = function(context, options, callback) {
    "use strict";
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    if (!options || typeof options !== "object") {
      options = {};
    }
    var audit = axe._audit;
    if (!audit) {
      throw new Error("No audit configured");
    }
    var reporter = getReporter(options.reporter || audit.reporter);
    runRules(context, options, function(results) {
      reporter(results, callback);
    });
  };
  function runTool(toolId, selectorArray, options, callback) {
    "use strict";
    if (!axe._audit) {
      throw new Error("No audit configured");
    }
    if (selectorArray.length > 1) {
      var frame = document.querySelector(selectorArray.shift());
      return utils.sendCommandToFrame(frame, {
        options: options,
        command: "run-tool",
        parameter: toolId,
        selectorArray: selectorArray
      }, callback);
    }
    var node = document.querySelector(selectorArray.shift());
    axe._audit.tools[toolId].run(node, options, callback);
  }
  axe.tool = runTool;
  helpers.failureSummary = function failureSummary(nodeData) {
    "use strict";
    var failingChecks = {};
    failingChecks.none = nodeData.none.concat(nodeData.all);
    failingChecks.any = nodeData.any;
    return Object.keys(failingChecks).map(function(key) {
      if (!failingChecks[key].length) {
        return;
      }
      return axe._audit.data.failureSummaries[key].failureMessage(failingChecks[key].map(function(check) {
        return check.message || "";
      }));
    }).filter(function(i) {
      return i !== undefined;
    }).join("\n\n");
  };
  helpers.formatCheck = function(check) {
    "use strict";
    return {
      id: check.id,
      impact: check.impact,
      message: check.message,
      data: check.data,
      relatedNodes: check.relatedNodes.map(helpers.formatNode)
    };
  };
  helpers.formatChecks = function(nodeResult, data) {
    "use strict";
    nodeResult.any = data.any.map(helpers.formatCheck);
    nodeResult.all = data.all.map(helpers.formatCheck);
    nodeResult.none = data.none.map(helpers.formatCheck);
    return nodeResult;
  };
  helpers.formatNode = function(node) {
    "use strict";
    return {
      target: node ? node.selector : null,
      html: node ? node.source : null
    };
  };
  helpers.formatRuleResult = function(ruleResult) {
    "use strict";
    return {
      id: ruleResult.id,
      description: ruleResult.description,
      help: ruleResult.help,
      helpUrl: ruleResult.helpUrl || null,
      impact: null,
      tags: ruleResult.tags,
      nodes: []
    };
  };
  helpers.splitResultsWithChecks = function(results) {
    "use strict";
    return helpers.splitResults(results, helpers.formatChecks);
  };
  helpers.splitResults = function(results, nodeDataMapper) {
    "use strict";
    var violations = [], passes = [];
    results.forEach(function(rr) {
      function mapNode(nodeData) {
        var result = nodeData.result || rr.result;
        var node = helpers.formatNode(nodeData.node);
        node.impact = nodeData.impact || null;
        return nodeDataMapper(node, nodeData, result);
      }
      var failResult, passResult = helpers.formatRuleResult(rr);
      failResult = utils.clone(passResult);
      failResult.impact = rr.impact || null;
      failResult.nodes = rr.violations.map(mapNode);
      passResult.nodes = rr.passes.map(mapNode);
      if (failResult.nodes.length) {
        violations.push(failResult);
      }
      if (passResult.nodes.length) {
        passes.push(passResult);
      }
    });
    return {
      violations: violations,
      passes: passes,
      url: window.location.href,
      timestamp: new Date()
    };
  };
  axe.reporter("na", function(results, callback) {
    "use strict";
    var na = results.filter(function(rr) {
      return rr.violations.length === 0 && rr.passes.length === 0;
    }).map(helpers.formatRuleResult);
    var formattedResults = helpers.splitResultsWithChecks(results);
    callback({
      violations: formattedResults.violations,
      passes: formattedResults.passes,
      notApplicable: na,
      timestamp: formattedResults.timestamp,
      url: formattedResults.url
    });
  });
  axe.reporter("no-passes", function(results, callback) {
    "use strict";
    var formattedResults = helpers.splitResultsWithChecks(results);
    callback({
      violations: formattedResults.violations,
      timestamp: formattedResults.timestamp,
      url: formattedResults.url
    });
  });
  axe.reporter("raw", function(results, callback) {
    "use strict";
    callback(results);
  });
  axe.reporter("v1", function(results, callback) {
    "use strict";
    var formattedResults = helpers.splitResults(results, function(nodeResult, data, result) {
      if (result === axe.constants.result.FAIL) {
        nodeResult.failureSummary = helpers.failureSummary(data);
      }
      return nodeResult;
    });
    callback({
      violations: formattedResults.violations,
      passes: formattedResults.passes,
      timestamp: formattedResults.timestamp,
      url: formattedResults.url
    });
  });
  axe.reporter("v2", function(results, callback) {
    "use strict";
    var formattedResults = helpers.splitResultsWithChecks(results);
    callback({
      violations: formattedResults.violations,
      passes: formattedResults.passes,
      timestamp: formattedResults.timestamp,
      url: formattedResults.url
    });
  }, true);
  utils.checkHelper = function checkHelper(checkResult, callback) {
    "use strict";
    return {
      isAsync: false,
      async: function() {
        this.isAsync = true;
        return function(result) {
          checkResult.value = result;
          callback(checkResult);
        };
      },
      data: function(data) {
        checkResult.data = data;
      },
      relatedNodes: function(nodes) {
        nodes = nodes instanceof Node ? [ nodes ] : utils.toArray(nodes);
        checkResult.relatedNodes = nodes.map(function(element) {
          return new utils.DqElement(element);
        });
      }
    };
  };
  utils.sendCommandToFrame = function(node, parameters, callback) {
    "use strict";
    var win = node.contentWindow;
    if (!win) {
      axe.log("Frame does not have a content window", node);
      return callback({});
    }
    var timeout = setTimeout(function() {
      timeout = setTimeout(function() {
        axe.log("No response from frame: ", node);
        callback(null);
      }, 0);
    }, 500);
    utils.respondable(win, "axe.ping", null, function() {
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        axe.log("Error returning results from frame: ", node);
        callback({});
        callback = null;
      }, 3e4);
      utils.respondable(win, "axe.start", parameters, function(data) {
        if (callback) {
          clearTimeout(timeout);
          callback(data);
        }
      });
    });
  };
  utils.collectResultsFromFrames = function collectResultsFromFrames(context, options, command, parameter, callback) {
    "use strict";
    var q = utils.queue();
    var frames = context.frames;
    function defer(frame) {
      var params = {
        options: options,
        command: command,
        parameter: parameter,
        context: {
          initiator: false,
          page: context.page,
          include: frame.include || [],
          exclude: frame.exclude || []
        }
      };
      q.defer(function(done) {
        var node = frame.node;
        utils.sendCommandToFrame(node, params, function(data) {
          if (data) {
            return done({
              results: data,
              frameElement: node,
              frame: utils.getSelector(node)
            });
          }
          done(null);
        });
      });
    }
    for (var i = 0, l = frames.length; i < l; i++) {
      defer(frames[i]);
    }
    q.then(function(data) {
      callback(utils.mergeResults(data));
    });
  };
  utils.contains = function(node, otherNode) {
    "use strict";
    if (typeof node.contains === "function") {
      return node.contains(otherNode);
    }
    return !!(node.compareDocumentPosition(otherNode) & 16);
  };
  function truncate(str, maxLength) {
    "use strict";
    maxLength = maxLength || 300;
    if (str.length > maxLength) {
      var index = str.indexOf(">");
      str = str.substring(0, index + 1);
    }
    return str;
  }
  function getSource(element) {
    "use strict";
    var source = element.outerHTML;
    if (!source && typeof XMLSerializer === "function") {
      source = new XMLSerializer().serializeToString(element);
    }
    return truncate(source || "");
  }
  function DqElement(element, spec) {
    "use strict";
    spec = spec || {};
    this.selector = spec.selector || [ utils.getSelector(element) ];
    this.source = spec.source !== undefined ? spec.source : getSource(element);
    this.element = element;
  }
  DqElement.prototype.toJSON = function() {
    "use strict";
    return {
      selector: this.selector,
      source: this.source
    };
  };
  utils.DqElement = DqElement;
  utils.extendBlacklist = function(to, from, blacklist) {
    "use strict";
    blacklist = blacklist || [];
    for (var i in from) {
      if (from.hasOwnProperty(i) && blacklist.indexOf(i) === -1) {
        to[i] = from[i];
      }
    }
    return to;
  };
  utils.extendMetaData = function(to, from) {
    "use strict";
    for (var i in from) {
      if (from.hasOwnProperty(i)) {
        if (typeof from[i] === "function") {
          try {
            to[i] = from[i](to);
          } catch (e) {
            to[i] = null;
          }
        } else {
          to[i] = from[i];
        }
      }
    }
  };
  function raiseMetadata(obj, checks) {
    "use strict";
    Object.keys(axe.constants.raisedMetadata).forEach(function(key) {
      var collection = axe.constants.raisedMetadata[key];
      var highestIndex = checks.reduce(function(prevIndex, current) {
        var currentIndex = collection.indexOf(current[key]);
        return currentIndex > prevIndex ? currentIndex : prevIndex;
      }, -1);
      if (collection[highestIndex]) {
        obj[key] = collection[highestIndex];
      }
    });
  }
  function calculateCheckResult(failingChecks) {
    "use strict";
    var isFailing = failingChecks.any.length || failingChecks.all.length || failingChecks.none.length;
    return isFailing ? axe.constants.result.FAIL : axe.constants.result.PASS;
  }
  function calculateRuleResult(ruleResult) {
    "use strict";
    function checkMap(check) {
      return utils.extendBlacklist({}, check, [ "result" ]);
    }
    var newRuleResult = utils.extendBlacklist({
      violations: [],
      passes: []
    }, ruleResult, [ "nodes" ]);
    ruleResult.nodes.forEach(function(detail) {
      var failingChecks = utils.getFailingChecks(detail);
      var result = calculateCheckResult(failingChecks);
      if (result === axe.constants.result.FAIL) {
        raiseMetadata(detail, utils.getAllChecks(failingChecks));
        detail.any = failingChecks.any.map(checkMap);
        detail.all = failingChecks.all.map(checkMap);
        detail.none = failingChecks.none.map(checkMap);
        newRuleResult.violations.push(detail);
        return;
      }
      detail.any = detail.any.filter(function(check) {
        return check.result;
      }).map(checkMap);
      detail.all = detail.all.map(checkMap);
      detail.none = detail.none.map(checkMap);
      newRuleResult.passes.push(detail);
    });
    raiseMetadata(newRuleResult, newRuleResult.violations);
    newRuleResult.result = newRuleResult.violations.length ? axe.constants.result.FAIL : newRuleResult.passes.length ? axe.constants.result.PASS : newRuleResult.result;
    return newRuleResult;
  }
  utils.getFailingChecks = function(detail) {
    "use strict";
    var any = detail.any.filter(function(check) {
      return !check.result;
    });
    return {
      all: detail.all.filter(function(check) {
        return !check.result;
      }),
      any: any.length === detail.any.length ? any : [],
      none: detail.none.filter(function(check) {
        return !!check.result;
      })
    };
  };
  utils.finalizeRuleResult = function(ruleResult) {
    "use strict";
    utils.publishMetaData(ruleResult);
    return calculateRuleResult(ruleResult);
  };
  utils.findBy = function(array, key, value) {
    "use strict";
    array = array || [];
    var index, length;
    for (index = 0, length = array.length; index < length; index++) {
      if (array[index][key] === value) {
        return array[index];
      }
    }
  };
  utils.getAllChecks = function getAllChecks(object) {
    "use strict";
    var result = [];
    return result.concat(object.any || []).concat(object.all || []).concat(object.none || []);
  };
  utils.getCheckOption = function(check, ruleID, options) {
    "use strict";
    var ruleCheckOption = ((options.rules && options.rules[ruleID] || {}).checks || {})[check.id];
    var checkOption = (options.checks || {})[check.id];
    var enabled = check.enabled;
    var opts = check.options;
    if (checkOption) {
      if (checkOption.hasOwnProperty("enabled")) {
        enabled = checkOption.enabled;
      }
      if (checkOption.hasOwnProperty("options")) {
        opts = checkOption.options;
      }
    }
    if (ruleCheckOption) {
      if (ruleCheckOption.hasOwnProperty("enabled")) {
        enabled = ruleCheckOption.enabled;
      }
      if (ruleCheckOption.hasOwnProperty("options")) {
        opts = ruleCheckOption.options;
      }
    }
    return {
      enabled: enabled,
      options: opts
    };
  };
  function nthOfType(element) {
    "use strict";
    var index = 1, type = element.nodeName;
    while (element = element.previousElementSibling) {
      if (element.nodeName === type) {
        index++;
      }
    }
    return index;
  }
  function siblingsHaveSameSelector(node, selector) {
    "use strict";
    var index, sibling, siblings = node.parentNode.children;
    if (!siblings) {
      return false;
    }
    var length = siblings.length;
    for (index = 0; index < length; index++) {
      sibling = siblings[index];
      if (sibling !== node && utils.matchesSelector(sibling, selector)) {
        return true;
      }
    }
    return false;
  }
  utils.getSelector = function getSelector(node) {
    "use strict";
    function escape(p) {
      return utils.escapeSelector(p);
    }
    var parts = [], part;
    while (node.parentNode) {
      part = "";
      if (node.id && document.querySelectorAll("#" + utils.escapeSelector(node.id)).length === 1) {
        parts.unshift("#" + utils.escapeSelector(node.id));
        break;
      }
      if (node.className && typeof node.className === "string") {
        part = "." + node.className.trim().split(/\s+/).map(escape).join(".");
        if (part === "." || siblingsHaveSameSelector(node, part)) {
          part = "";
        }
      }
      if (!part) {
        part = utils.escapeSelector(node.nodeName).toLowerCase();
        if (part === "html" || part === "body") {
          parts.unshift(part);
          break;
        }
        if (siblingsHaveSameSelector(node, part)) {
          part += ":nth-of-type(" + nthOfType(node) + ")";
        }
      }
      parts.unshift(part);
      node = node.parentNode;
    }
    return parts.join(" > ");
  };
  var styleSheet;
  function injectStyle(style) {
    "use strict";
    if (styleSheet && styleSheet.parentNode) {
      styleSheet.parentNode.removeChild(styleSheet);
      styleSheet = null;
    }
    if (!style) {
      return;
    }
    var head = document.head || document.getElementsByTagName("head")[0];
    styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    if (styleSheet.styleSheet === undefined) {
      styleSheet.appendChild(document.createTextNode(style));
    } else {
      styleSheet.styleSheet.cssText = style;
    }
    head.appendChild(styleSheet);
    return styleSheet;
  }
  utils.isHidden = function isHidden(el, recursed) {
    "use strict";
    if (el.nodeType === 9) {
      return false;
    }
    var style = window.getComputedStyle(el, null);
    if (!style || (!el.parentNode || (style.getPropertyValue("display") === "none" || !recursed && style.getPropertyValue("visibility") === "hidden" || el.getAttribute("aria-hidden") === "true"))) {
      return true;
    }
    return utils.isHidden(el.parentNode, true);
  };
  function pushFrame(resultSet, frameElement, frameSelector) {
    "use strict";
    resultSet.forEach(function(res) {
      res.node.selector.unshift(frameSelector);
      res.node = new utils.DqElement(frameElement, res.node);
      var checks = utils.getAllChecks(res);
      if (checks.length) {
        checks.forEach(function(check) {
          check.relatedNodes.forEach(function(node) {
            node.selector.unshift(frameSelector);
            node = new utils.DqElement(frameElement, node);
          });
        });
      }
    });
  }
  function spliceNodes(target, to) {
    "use strict";
    var firstFromFrame = to[0].node, sorterResult, t;
    for (var i = 0, l = target.length; i < l; i++) {
      t = target[i].node;
      sorterResult = utils.nodeSorter(t.element, firstFromFrame.element);
      if (sorterResult > 0 || sorterResult === 0 && firstFromFrame.selector.length < t.selector.length) {
        target.splice.apply(target, [ i, 0 ].concat(to));
        return;
      }
    }
    target.push.apply(target, to);
  }
  function normalizeResult(result) {
    "use strict";
    if (!result || !result.results) {
      return null;
    }
    if (!Array.isArray(result.results)) {
      return [ result.results ];
    }
    if (!result.results.length) {
      return null;
    }
    return result.results;
  }
  utils.mergeResults = function mergeResults(frameResults) {
    "use strict";
    var result = [];
    frameResults.forEach(function(frameResult) {
      var results = normalizeResult(frameResult);
      if (!results || !results.length) {
        return;
      }
      results.forEach(function(ruleResult) {
        if (ruleResult.nodes && frameResult.frame) {
          pushFrame(ruleResult.nodes, frameResult.frameElement, frameResult.frame);
        }
        var res = utils.findBy(result, "id", ruleResult.id);
        if (!res) {
          result.push(ruleResult);
        } else {
          if (ruleResult.nodes.length) {
            spliceNodes(res.nodes, ruleResult.nodes);
          }
        }
      });
    });
    return result;
  };
  utils.nodeSorter = function nodeSorter(a, b) {
    "use strict";
    if (a === b) {
      return 0;
    }
    if (a.compareDocumentPosition(b) & 4) {
      return -1;
    }
    return 1;
  };
  utils.publishMetaData = function(ruleResult) {
    "use strict";
    function extender(shouldBeTrue) {
      return function(check) {
        var sourceData = checksData[check.id] || {};
        var messages = sourceData.messages || {};
        var data = utils.extendBlacklist({}, sourceData, [ "messages" ]);
        data.message = check.result === shouldBeTrue ? messages.pass : messages.fail;
        utils.extendMetaData(check, data);
      };
    }
    var checksData = axe._audit.data.checks || {};
    var rulesData = axe._audit.data.rules || {};
    var rule = utils.findBy(axe._audit.rules, "id", ruleResult.id) || {};
    ruleResult.tags = utils.clone(rule.tags || []);
    var shouldBeTrue = extender(true);
    var shouldBeFalse = extender(false);
    ruleResult.nodes.forEach(function(detail) {
      detail.any.forEach(shouldBeTrue);
      detail.all.forEach(shouldBeTrue);
      detail.none.forEach(shouldBeFalse);
    });
    utils.extendMetaData(ruleResult, utils.clone(rulesData[ruleResult.id] || {}));
  };
  (function() {
    "use strict";
    function noop() {}
    function queue() {
      var tasks = [], started = 0, remaining = 0, awt = noop;
      function pop() {
        var length = tasks.length;
        for (;started < length; started++) {
          var task = tasks[started], fn = task.shift();
          task.push(callback(started));
          fn.apply(null, task);
        }
      }
      function callback(i) {
        return function(r) {
          tasks[i] = r;
          if (!--remaining) {
            notify();
          }
        };
      }
      function notify() {
        awt(tasks);
      }
      return {
        defer: function(fn) {
          tasks.push([ fn ]);
          ++remaining;
          pop();
        },
        then: function(f) {
          awt = f;
          if (!remaining) {
            notify();
          }
        },
        abort: function(fn) {
          awt = noop;
          fn(tasks);
        }
      };
    }
    utils.queue = queue;
  })();
  (function(exports) {
    "use strict";
    var messages = {}, subscribers = {};
    function verify(postedMessage) {
      return typeof postedMessage === "object" && typeof postedMessage.uuid === "string" && postedMessage._respondable === true;
    }
    function post(win, topic, message, uuid, callback) {
      var data = {
        uuid: uuid,
        topic: topic,
        message: message,
        _respondable: true
      };
      messages[uuid] = callback;
      win.postMessage(JSON.stringify(data), "*");
    }
    function respondable(win, topic, message, callback) {
      var id = uuid.v1();
      post(win, topic, message, id, callback);
    }
    respondable.subscribe = function(topic, callback) {
      subscribers[topic] = callback;
    };
    function publish(event, data) {
      var topic = data.topic, message = data.message, subscriber = subscribers[topic];
      if (subscriber) {
        subscriber(message, createResponder(event.source, null, data.uuid));
      }
    }
    function createResponder(source, topic, uuid) {
      return function(message, callback) {
        post(source, topic, message, uuid, callback);
      };
    }
    window.addEventListener("message", function(e) {
      if (typeof e.data !== "string") {
        return;
      }
      var data;
      try {
        data = JSON.parse(e.data);
      } catch (ex) {}
      if (!verify(data)) {
        return;
      }
      var uuid = data.uuid;
      if (messages[uuid]) {
        messages[uuid](data.message, createResponder(e.source, data.topic, uuid));
        messages[uuid] = null;
      }
      publish(e, data);
    }, false);
    exports.respondable = respondable;
  })(utils);
  utils.ruleShouldRun = function(rule, context, options) {
    "use strict";
    if (rule.pageLevel && !context.page) {
      return false;
    }
    var runOnly = options.runOnly, ruleOptions = (options.rules || {})[rule.id];
    if (runOnly) {
      if (runOnly.type === "rule") {
        return runOnly.values.indexOf(rule.id) !== -1;
      }
      return !!(runOnly.values || []).filter(function(item) {
        return rule.tags.indexOf(item) !== -1;
      }).length;
    }
    if (ruleOptions && ruleOptions.hasOwnProperty("enabled") ? !ruleOptions.enabled : !rule.enabled) {
      return false;
    }
    return true;
  };
  function getDeepest(collection) {
    "use strict";
    return collection.sort(function(a, b) {
      if (utils.contains(a, b)) {
        return 1;
      }
      return -1;
    })[0];
  }
  function isNodeInContext(node, context) {
    "use strict";
    var include = context.include && getDeepest(context.include.filter(function(candidate) {
      return utils.contains(candidate, node);
    }));
    var exclude = context.exclude && getDeepest(context.exclude.filter(function(candidate) {
      return utils.contains(candidate, node);
    }));
    if (!exclude && include || exclude && utils.contains(exclude, include)) {
      return true;
    }
    return false;
  }
  function pushNode(result, nodes, context) {
    "use strict";
    for (var i = 0, l = nodes.length; i < l; i++) {
      if (result.indexOf(nodes[i]) === -1 && isNodeInContext(nodes[i], context)) {
        result.push(nodes[i]);
      }
    }
  }
  utils.select = function select(selector, context) {
    "use strict";
    var result = [], candidate;
    for (var i = 0, l = context.include.length; i < l; i++) {
      candidate = context.include[i];
      if (candidate.nodeType === candidate.ELEMENT_NODE && utils.matchesSelector(candidate, selector)) {
        pushNode(result, [ candidate ], context);
      }
      pushNode(result, candidate.querySelectorAll(selector), context);
    }
    return result.sort(utils.nodeSorter);
  };
  utils.toArray = function(thing) {
    "use strict";
    return Array.prototype.slice.call(thing);
  };
  axe._load({
    data: {
      rules: {
        accesskeys: {
          description: "Ensures every accesskey attribute value is unique",
          help: "accesskey attribute value must be unique",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/accesskeys"
        },
        "area-alt": {
          description: "Ensures <area> elements of image maps have alternate text",
          help: "Active <area> elements must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/area-alt"
        },
        "aria-allowed-attr": {
          description: "Ensures ARIA attributes are allowed for an element's role",
          help: "Elements must only use allowed ARIA attributes",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-allowed-attr"
        },
        "aria-required-attr": {
          description: "Ensures elements with ARIA roles have all required ARIA attributes",
          help: "Required ARIA attributes must be provided",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-required-attr"
        },
        "aria-required-children": {
          description: "Ensures elements with an ARIA role that require child roles contain them",
          help: "Certain ARIA roles must contain particular children",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-required-children"
        },
        "aria-required-parent": {
          description: "Ensures elements with an ARIA role that require parent roles are contained by them",
          help: "Certain ARIA roles must be contained by particular parents",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-required-parent"
        },
        "aria-roles": {
          description: "Ensures all elements with a role attribute use a valid value",
          help: "ARIA roles used must conform to valid values",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-roles"
        },
        "aria-valid-attr-value": {
          description: "Ensures all ARIA attributes have valid values",
          help: "ARIA attributes must conform to valid values",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-valid-attr-value"
        },
        "aria-valid-attr": {
          description: "Ensures attributes that begin with aria- are valid ARIA attributes",
          help: "ARIA attributes must conform to valid names",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/aria-valid-attr"
        },
        "audio-caption": {
          description: "Ensures <audio> elements have captions",
          help: "<audio> elements must have a captions track",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/audio-caption"
        },
        blink: {
          description: "Ensures <blink> elements are not used",
          help: "<blink> elements are deprecated and must not be used",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/blink"
        },
        "button-name": {
          description: "Ensures buttons have discernible text",
          help: "Buttons must have discernible text",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/button-name"
        },
        bypass: {
          description: "Ensures each page has at least one mechanism for a user to bypass navigation and jump straight to the content",
          help: "Page must have means to bypass repeated blocks",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/bypass"
        },
        checkboxgroup: {
          description: 'Ensures related <input type="checkbox"> elements have a group and that that group designation is consistent',
          help: "Checkbox inputs with the same name attribute value must be part of a group",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/checkboxgroup"
        },
        "color-contrast": {
          description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
          help: "Elements must have sufficient color contrast",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/color-contrast"
        },
        "data-table": {
          description: "Ensures data tables are marked up semantically and have the correct header structure",
          help: "Data tables should be marked up properly",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/data-table"
        },
        "definition-list": {
          description: "Ensures <dl> elements are structured correctly",
          help: "<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script> or <template> elements",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/definition-list"
        },
        dlitem: {
          description: "Ensures <dt> and <dd> elements are contained by a <dl>",
          help: "<dt> and <dd> elements must be contained by a <dl>",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/dlitem"
        },
        "document-title": {
          description: "Ensures each HTML document contains a non-empty <title> element",
          help: "Documents must have <title> element to aid in navigation",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/document-title"
        },
        "duplicate-id": {
          description: "Ensures every id attribute value is unique",
          help: "id attribute value must be unique",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/duplicate-id"
        },
        "empty-heading": {
          description: "Ensures headings have discernible text",
          help: "Headings must not be empty",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/empty-heading"
        },
        "frame-title": {
          description: "Ensures <iframe> and <frame> elements contain a unique and non-empty title attribute",
          help: "Frames must have unique title attribute",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/frame-title"
        },
        "heading-order": {
          description: "Ensures the order of headings is semantically correct",
          help: "Heading levels should only increase by one",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/heading-order"
        },
        "html-lang": {
          description: "Ensures every HTML document has a lang attribute and its value is valid",
          help: "<html> element must have a valid lang attribute",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/html-lang"
        },
        "image-alt": {
          description: "Ensures <img> elements have alternate text or a role of none or presentation",
          help: "Images must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/image-alt"
        },
        "input-image-alt": {
          description: 'Ensures <input type="image"> elements have alternate text',
          help: "Image buttons must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/input-image-alt"
        },
        "label-title-only": {
          description: "Ensures that every form element is not solely labeled using the title or aria-describedby attributes",
          help: "Form elements should have a visible label",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/label-title-only"
        },
        label: {
          description: "Ensures every form element has a label",
          help: "Form elements must have labels",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/label"
        },
        "layout-table": {
          description: "Ensures presentational <table> elements do not use <th>, <caption> elements or the summary attribute",
          help: "Layout tables must not use data table elements",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/layout-table"
        },
        "link-name": {
          description: "Ensures links have discernible text",
          help: "Links must have discernible text",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/link-name"
        },
        list: {
          description: "Ensures that lists are structured correctly",
          help: "<ul> and <ol> must only directly contain <li>, <script> or <template> elements",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/list"
        },
        listitem: {
          description: "Ensures <li> elements are used semantically",
          help: "<li> elements must be contained in a <ul> or <ol>",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/listitem"
        },
        marquee: {
          description: "Ensures <marquee> elements are not used",
          help: "<marquee> elements are deprecated and must not be used",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/marquee"
        },
        "meta-refresh": {
          description: 'Ensures <meta http-equiv="refresh"> is not used',
          help: "Timed refresh must not exist",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/meta-refresh"
        },
        "meta-viewport": {
          description: 'Ensures <meta name="viewport"> does not disable text scaling and zooming',
          help: "Zooming and scaling must not be disabled",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/meta-viewport"
        },
        "object-alt": {
          description: "Ensures <object> elements have alternate text",
          help: "<object> elements must have alternate text",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/object-alt"
        },
        radiogroup: {
          description: 'Ensures related <input type="radio"> elements have a group and that the group designation is consistent',
          help: "Radio inputs with the same name attribute value must be part of a group",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/radiogroup"
        },
        region: {
          description: "Ensures all content is contained within a landmark region",
          help: "Content should be contained in a landmark region",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/region"
        },
        scope: {
          description: "Ensures the scope attribute is used correctly on tables",
          help: "scope attribute should be used correctly",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/scope"
        },
        "server-side-image-map": {
          description: "Ensures that server-side image maps are not used",
          help: "Server-side image maps must not be used",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/server-side-image-map"
        },
        "skip-link": {
          description: "Ensures the first link on the page is a skip link",
          help: "The page should have a skip link as its first link",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/skip-link"
        },
        tabindex: {
          description: "Ensures tabindex attribute values are not greater than 0",
          help: "Elements should not have tabindex greater than zero",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/tabindex"
        },
        "valid-lang": {
          description: "Ensures lang attributes have valid values",
          help: "lang attribute must have a valid value",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/valid-lang"
        },
        "video-caption": {
          description: "Ensures <video> elements have captions",
          help: "<video> elements must have captions",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/video-caption"
        },
        "video-description": {
          description: "Ensures <video> elements have audio descriptions",
          help: "<video> elements must have an audio description track",
          helpUrl: "https://dequeuniversity.com/rules/axe/1.1/video-description"
        }
      },
      checks: {
        accesskeys: {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Accesskey attribute value is unique";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Document has multiple elements with the same accesskey";
              return out;
            }
          }
        },
        "non-empty-alt": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element has a non-empty alt attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has no alt attribute or the alt attribute is empty";
              return out;
            }
          }
        },
        "aria-label": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "aria-label attribute exists and is not empty";
              return out;
            },
            fail: function anonymous(it) {
              var out = "aria-label attribute does not exist or is empty";
              return out;
            }
          }
        },
        "aria-labelledby": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "aria-labelledby attribute exists and references elements that are visible to screen readers";
              return out;
            },
            fail: function anonymous(it) {
              var out = "aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty or not visible";
              return out;
            }
          }
        },
        "aria-allowed-attr": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "ARIA attributes are used correctly for the defined role";
              return out;
            },
            fail: function anonymous(it) {
              var out = "ARIA attribute" + (it.data && it.data.length > 1 ? "s are" : " is") + " not allowed:";
              var arr1 = it.data;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += " " + value;
                }
              }
              return out;
            }
          }
        },
        "aria-required-attr": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "All required ARIA attributes are present";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Required ARIA attribute" + (it.data && it.data.length > 1 ? "s" : "") + " not present:";
              var arr1 = it.data;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += " " + value;
                }
              }
              return out;
            }
          }
        },
        "aria-required-children": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Required ARIA children are present";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Required ARIA " + (it.data && it.data.length > 1 ? "children" : "child") + " role not present:";
              var arr1 = it.data;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += " " + value;
                }
              }
              return out;
            }
          }
        },
        "aria-required-parent": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Required ARIA parent role present";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Required ARIA parent" + (it.data && it.data.length > 1 ? "s" : "") + " role not present:";
              var arr1 = it.data;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += " " + value;
                }
              }
              return out;
            }
          }
        },
        invalidrole: {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "ARIA role is valid";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Role must be one of the valid ARIA roles";
              return out;
            }
          }
        },
        abstractrole: {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Abstract roles are not used";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Abstract roles cannot be directly used";
              return out;
            }
          }
        },
        "aria-valid-attr-value": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "ARIA attribute values are valid";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Invalid ARIA attribute value" + (it.data && it.data.length > 1 ? "s" : "") + ":";
              var arr1 = it.data;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += " " + value;
                }
              }
              return out;
            }
          }
        },
        "aria-valid-attr": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "ARIA attribute name" + (it.data && it.data.length > 1 ? "s" : "") + " are valid";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Invalid ARIA attribute name" + (it.data && it.data.length > 1 ? "s" : "") + ":";
              var arr1 = it.data;
              if (arr1) {
                var value, i1 = -1, l1 = arr1.length - 1;
                while (i1 < l1) {
                  value = arr1[i1 += 1];
                  out += " " + value;
                }
              }
              return out;
            }
          }
        },
        caption: {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "The multimedia element has a captions track";
              return out;
            },
            fail: function anonymous(it) {
              var out = "The multimedia element does not have a captions track";
              return out;
            }
          }
        },
        exists: {
          impact: "minor",
          messages: {
            pass: function anonymous(it) {
              var out = "Element does not exist";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element exists";
              return out;
            }
          }
        },
        "non-empty-if-present": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element ";
              if (it.data) {
                out += "has a non-empty value attribute";
              } else {
                out += "does not have a value attribute";
              }
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has a value attribute and the value attribute is empty";
              return out;
            }
          }
        },
        "non-empty-value": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element has a non-empty value attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has no value attribute or the value attribute is empty";
              return out;
            }
          }
        },
        "button-has-visible-text": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element has inner text that is visible to screen readers";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element does not have inner text that is visible to screen readers";
              return out;
            }
          }
        },
        "role-presentation": {
          impact: "moderate",
          messages: {
            pass: function anonymous(it) {
              var out = 'Element\'s default semantics were overriden with role="presentation"';
              return out;
            },
            fail: function anonymous(it) {
              var out = 'Element\'s default semantics were not overridden with role="presentation"';
              return out;
            }
          }
        },
        "role-none": {
          impact: "moderate",
          messages: {
            pass: function anonymous(it) {
              var out = 'Element\'s default semantics were overriden with role="none"';
              return out;
            },
            fail: function anonymous(it) {
              var out = 'Element\'s default semantics were not overridden with role="none"';
              return out;
            }
          }
        },
        "duplicate-img-label": {
          impact: "minor",
          messages: {
            pass: function anonymous(it) {
              var out = "Element does not duplicate existing text in <img> alt text";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element contains <img> element with alt text that duplicates existing text";
              return out;
            }
          }
        },
        "focusable-no-name": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Element is not in tab order or has accessible text";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element is in tab order and does not have accessible text";
              return out;
            }
          }
        },
        "internal-link-present": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Valid skip link found";
              return out;
            },
            fail: function anonymous(it) {
              var out = "No valid skip link found";
              return out;
            }
          }
        },
        "header-present": {
          impact: "moderate",
          messages: {
            pass: function anonymous(it) {
              var out = "Page has a header";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Page does not have a header";
              return out;
            }
          }
        },
        landmark: {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Page has a landmark region";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Page does not have a landmark region";
              return out;
            }
          }
        },
        "group-labelledby": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = 'All elements with the name "' + it.data.name + '" reference the same element with aria-labelledby';
              return out;
            },
            fail: function anonymous(it) {
              var out = 'All elements with the name "' + it.data.name + '" do not reference the same element with aria-labelledby';
              return out;
            }
          }
        },
        fieldset: {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element is contained in a fieldset";
              return out;
            },
            fail: function anonymous(it) {
              var out = "";
              var code = it.data && it.data.failureCode;
              if (code === "no-legend") {
                out += "Fieldset does not have a legend as its first child";
              } else {
                if (code === "empty-legend") {
                  out += "Legend does not have text that is visible to screen readers";
                } else {
                  if (code === "mixed-inputs") {
                    out += "Fieldset contains unrelated inputs";
                  } else {
                    if (code === "no-group-label") {
                      out += "ARIA group does not have aria-label or aria-labelledby";
                    } else {
                      if (code === "group-mixed-inputs") {
                        out += "ARIA group contains unrelated inputs";
                      } else {
                        out += "Element does not have a containing fieldset or ARIA group";
                      }
                    }
                  }
                }
              }
              return out;
            }
          }
        },
        "color-contrast": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "";
              if (it.data && it.data.contrastRatio) {
                out += "Element has sufficient color contrast of " + it.data.contrastRatio;
              } else {
                out += "Unable to determine contrast ratio";
              }
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has insufficient color contrast of " + it.data.contrastRatio + " (foreground color: " + it.data.fgColor + ", background color: " + it.data.bgColor + ", font size: " + it.data.fontSize + ", font weight: " + it.data.fontWeight + ")";
              return out;
            }
          }
        },
        "consistent-columns": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Table has consistent column widths";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Table does not have the same number of columns in every row";
              return out;
            }
          }
        },
        "cell-no-header": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "All data cells have table headers";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Some data cells do not have table headers";
              return out;
            }
          }
        },
        "headers-visible-text": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Header cell has visible text";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Header cell does not have visible text";
              return out;
            }
          }
        },
        "headers-attr-reference": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "headers attribute references elements that are visible to screen readers";
              return out;
            },
            fail: function anonymous(it) {
              var out = "headers attribute references element that is not visible to screen readers";
              return out;
            }
          }
        },
        "th-scope": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "<th> elements use scope attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "<th> elements must use scope attribute";
              return out;
            }
          }
        },
        "no-caption": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Table has a <caption>";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Table does not have a <caption>";
              return out;
            }
          }
        },
        "th-headers-attr": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "<th> elements do not use headers attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "<th> elements should not use headers attribute";
              return out;
            }
          }
        },
        "th-single-row-column": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "<th> elements are used when there is only a single row and single column of headers";
              return out;
            },
            fail: function anonymous(it) {
              var out = "<th> elements should only be used when there is a single row and single column of headers";
              return out;
            }
          }
        },
        "same-caption-summary": {
          impact: "moderate",
          messages: {
            pass: function anonymous(it) {
              var out = "Content of summary attribute and <caption> are not duplicated";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Content of summary attribute and <caption> element are indentical";
              return out;
            }
          }
        },
        rowspan: {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Table does not have cells with rowspan attribute greater than 1";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Table has cells whose rowspan attribute is not equal to 1";
              return out;
            }
          }
        },
        "structured-dlitems": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "When not empty, element has both <dt> and <dd> elements";
              return out;
            },
            fail: function anonymous(it) {
              var out = "When not empty, element does not have at least one <dt> element followed by at least one <dd> element";
              return out;
            }
          }
        },
        "only-dlitems": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Element only has children that are <dt> or <dd> elements";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has children that are not <dt> or <dd> elements";
              return out;
            }
          }
        },
        dlitem: {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Description list item has a <dl> parent element";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Description list item does not have a <dl> parent element";
              return out;
            }
          }
        },
        "doc-has-title": {
          impact: "moderate",
          messages: {
            pass: function anonymous(it) {
              var out = "Document has a non-empty <title> element";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Document does not have a non-empty <title> element";
              return out;
            }
          }
        },
        "duplicate-id": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Document has no elements that share the same id attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Document has multiple elements with the same id attribute: " + it.data;
              return out;
            }
          }
        },
        "has-visible-text": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element has text that is visible to screen readers";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element does not have text that is visible to screen readers";
              return out;
            }
          }
        },
        "non-empty-title": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element has a title attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has no title attribute or the title attribute is empty";
              return out;
            }
          }
        },
        "unique-frame-title": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Element's title attribute is unique";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element's title attribute is not unique";
              return out;
            }
          }
        },
        "heading-order": {
          impact: "minor",
          messages: {
            pass: function anonymous(it) {
              var out = "Heading order valid";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Heading order invalid";
              return out;
            }
          }
        },
        "has-lang": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "The <html> element has a lang attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "The <html> element does not have a lang attribute";
              return out;
            }
          }
        },
        "valid-lang": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Value of lang attribute is included in the list of valid languages";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Value of lang attribute not included in the list of valid languages";
              return out;
            }
          }
        },
        "has-alt": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Element has an alt attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element does not have an alt attribute";
              return out;
            }
          }
        },
        "title-only": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Form element does not solely use title attribute for its label";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Only title used to generate label for form element";
              return out;
            }
          }
        },
        "implicit-label": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Form element has an implicit (wrapped) <label>";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Form element does not have an implicit (wrapped) <label>";
              return out;
            }
          }
        },
        "explicit-label": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Form element has an explicit <label>";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Form element does not have an explicit <label>";
              return out;
            }
          }
        },
        "help-same-as-label": {
          impact: "minor",
          messages: {
            pass: function anonymous(it) {
              var out = "Help text (title or aria-describedby) does not duplicate label text";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Help text (title or aria-describedby) text is the same as the label text";
              return out;
            }
          }
        },
        "multiple-label": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Form element does not have multiple <label> elements";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Form element has multiple <label> elements";
              return out;
            }
          }
        },
        "has-th": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Layout table does not use <th> elements";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Layout table uses <th> elements";
              return out;
            }
          }
        },
        "has-caption": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Layout table does not use <caption> element";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Layout table uses <caption> element";
              return out;
            }
          }
        },
        "has-summary": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Layout table does not use summary attribute";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Layout table uses summary attribute";
              return out;
            }
          }
        },
        "only-listitems": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "List element only has children that are <li>, <script> or <template> elements";
              return out;
            },
            fail: function anonymous(it) {
              var out = "List element has children that are not <li>, <script> or <template> elements";
              return out;
            }
          }
        },
        listitem: {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "List item has a <ul> or <ol> parent element";
              return out;
            },
            fail: function anonymous(it) {
              var out = "List item does not have a <ul> or <ol> parent element";
              return out;
            }
          }
        },
        "meta-refresh": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "<meta> tag does not immediately refresh the page";
              return out;
            },
            fail: function anonymous(it) {
              var out = "<meta> tag forces timed refresh of page";
              return out;
            }
          }
        },
        "meta-viewport": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "<meta> tag does not disable zooming";
              return out;
            },
            fail: function anonymous(it) {
              var out = "<meta> tag disables zooming";
              return out;
            }
          }
        },
        region: {
          impact: "moderate",
          messages: {
            pass: function anonymous(it) {
              var out = "Content contained by ARIA landmark";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Content not contained by an ARIA landmark";
              return out;
            }
          }
        },
        "html5-scope": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Scope attribute is only used on table header elements (<th>)";
              return out;
            },
            fail: function anonymous(it) {
              var out = "In HTML 5, scope attributes may only be used on table header elements (<th>)";
              return out;
            }
          }
        },
        "html4-scope": {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Scope attribute is only used on table cell elements (<th> and <td>)";
              return out;
            },
            fail: function anonymous(it) {
              var out = "In HTML 4, the scope attribute may only be used on table cell elements (<th> and <td>)";
              return out;
            }
          }
        },
        "scope-value": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Scope attribute is used correctly";
              return out;
            },
            fail: function anonymous(it) {
              var out = "The value of the scope attribute may only be 'row' or 'col'";
              return out;
            }
          }
        },
        "skip-link": {
          impact: "critical",
          messages: {
            pass: function anonymous(it) {
              var out = "Valid skip link found";
              return out;
            },
            fail: function anonymous(it) {
              var out = "No valid skip link found";
              return out;
            }
          }
        },
        tabindex: {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "Element does not have a tabindex greater than 0";
              return out;
            },
            fail: function anonymous(it) {
              var out = "Element has a tabindex greater than 0";
              return out;
            }
          }
        },
        description: {
          impact: "serious",
          messages: {
            pass: function anonymous(it) {
              var out = "The multimedia element has an audio description track";
              return out;
            },
            fail: function anonymous(it) {
              var out = "The multimedia element does not have an audio description track";
              return out;
            }
          }
        }
      },
      failureSummaries: {
        any: {
          failureMessage: function anonymous(it) {
            var out = "Fix any of the following:";
            var arr1 = it;
            if (arr1) {
              var value, i1 = -1, l1 = arr1.length - 1;
              while (i1 < l1) {
                value = arr1[i1 += 1];
                out += "\n  " + value.split("\n").join("\n  ");
              }
            }
            return out;
          }
        },
        none: {
          failureMessage: function anonymous(it) {
            var out = "Fix all of the following:";
            var arr1 = it;
            if (arr1) {
              var value, i1 = -1, l1 = arr1.length - 1;
              while (i1 < l1) {
                value = arr1[i1 += 1];
                out += "\n  " + value.split("\n").join("\n  ");
              }
            }
            return out;
          }
        }
      }
    },
    rules: [ {
      id: "accesskeys",
      selector: "[accesskey]",
      tags: [ "wcag2a", "wcag211" ],
      all: [],
      any: [],
      none: [ "accesskeys" ]
    }, {
      id: "area-alt",
      selector: "map area[href]",
      excludeHidden: false,
      tags: [ "wcag2a", "wcag111", "section508", "section508a" ],
      all: [],
      any: [ "non-empty-alt", "aria-label", "aria-labelledby" ],
      none: []
    }, {
      id: "aria-allowed-attr",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ "aria-allowed-attr" ],
      none: []
    }, {
      id: "aria-required-attr",
      selector: "[role]",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ "aria-required-attr" ],
      none: []
    }, {
      id: "aria-required-children",
      selector: "[role]",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ "aria-required-children" ],
      none: []
    }, {
      id: "aria-required-parent",
      selector: "[role]",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ "aria-required-parent" ],
      none: []
    }, {
      id: "aria-roles",
      selector: "[role]",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [],
      none: [ "invalidrole", "abstractrole" ]
    }, {
      id: "aria-valid-attr-value",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ {
        options: [],
        id: "aria-valid-attr-value"
      } ],
      none: []
    }, {
      id: "aria-valid-attr",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ {
        options: [],
        id: "aria-valid-attr"
      } ],
      none: []
    }, {
      id: "audio-caption",
      selector: "audio",
      excludeHidden: false,
      tags: [ "wcag2a", "wcag122", "section508", "section508a" ],
      all: [],
      any: [],
      none: [ "caption" ]
    }, {
      id: "blink",
      selector: "blink",
      tags: [ "wcag2a", "wcag222" ],
      all: [],
      any: [],
      none: [ "exists" ]
    }, {
      id: "button-name",
      selector: 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',
      tags: [ "wcag2a", "wcag412", "section508", "section508a" ],
      all: [],
      any: [ "non-empty-if-present", "non-empty-value", "button-has-visible-text", "aria-label", "aria-labelledby", "role-presentation", "role-none" ],
      none: [ "duplicate-img-label", "focusable-no-name" ]
    }, {
      id: "bypass",
      selector: "html",
      pageLevel: true,
      matches: function(node) {
        return !!node.querySelector("a[href]");
      },
      tags: [ "wcag2a", "wcag241", "section508", "section508o" ],
      all: [],
      any: [ "internal-link-present", "header-present", "landmark" ],
      none: []
    }, {
      id: "checkboxgroup",
      selector: "input[type=checkbox][name]",
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [ "group-labelledby", "fieldset" ],
      none: []
    }, {
      id: "color-contrast",
      selector: "*",
      tags: [ "wcag2aa", "wcag143" ],
      all: [],
      any: [ "color-contrast" ],
      none: []
    }, {
      id: "data-table",
      selector: "table",
      matches: function(node) {
        return commons.table.isDataTable(node);
      },
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [ "consistent-columns" ],
      none: [ "cell-no-header", "headers-visible-text", "headers-attr-reference", "th-scope", "no-caption", "th-headers-attr", "th-single-row-column", "same-caption-summary", "rowspan" ]
    }, {
      id: "definition-list",
      selector: "dl",
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [],
      none: [ "structured-dlitems", "only-dlitems" ]
    }, {
      id: "dlitem",
      selector: "dd, dt",
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [ "dlitem" ],
      none: []
    }, {
      id: "document-title",
      selector: "html",
      tags: [ "wcag2a", "wcag242" ],
      all: [],
      any: [ "doc-has-title" ],
      none: []
    }, {
      id: "duplicate-id",
      selector: "[id]",
      tags: [ "wcag2a", "wcag411" ],
      all: [],
      any: [ "duplicate-id" ],
      none: []
    }, {
      id: "empty-heading",
      selector: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [ "has-visible-text", "role-presentation", "role-none" ],
      none: []
    }, {
      id: "frame-title",
      selector: "frame, iframe",
      tags: [ "wcag2a", "wcag241" ],
      all: [],
      any: [ "non-empty-title" ],
      none: [ "unique-frame-title" ]
    }, {
      id: "heading-order",
      selector: "h1,h2,h3,h4,h5,h6,[role=heading]",
      enabled: false,
      tags: [ "best-practice" ],
      all: [],
      any: [ "heading-order" ],
      none: []
    }, {
      id: "html-lang",
      selector: "html",
      tags: [ "wcag2a", "wcag311" ],
      all: [],
      any: [ "has-lang" ],
      none: [ {
        options: [ "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "in", "io", "is", "it", "iu", "iw", "ja", "ji", "jv", "jw", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu" ],
        id: "valid-lang"
      } ]
    }, {
      id: "image-alt",
      selector: "img",
      tags: [ "wcag2a", "wcag111", "section508", "section508a" ],
      all: [],
      any: [ "has-alt", "aria-label", "aria-labelledby", "non-empty-title", "role-presentation", "role-none" ],
      none: []
    }, {
      id: "input-image-alt",
      selector: 'input[type="image"]',
      tags: [ "wcag2a", "wcag111", "section508", "section508a" ],
      all: [],
      any: [ "non-empty-alt", "aria-label", "aria-labelledby" ],
      none: []
    }, {
      id: "label-title-only",
      selector: "input:not([type='hidden']):not([type='image']):not([type='button']):not([type='submit']):not([type='reset']), select, textarea",
      enabled: false,
      tags: [ "best-practice" ],
      all: [],
      any: [],
      none: [ "title-only" ]
    }, {
      id: "label",
      selector: "input:not([type='hidden']):not([type='image']):not([type='button']):not([type='submit']):not([type='reset']), select, textarea",
      tags: [ "wcag2a", "wcag332", "wcag131", "section508", "section508n" ],
      all: [],
      any: [ "aria-label", "aria-labelledby", "implicit-label", "explicit-label", "non-empty-title" ],
      none: [ "help-same-as-label", "multiple-label" ]
    }, {
      id: "layout-table",
      selector: "table",
      matches: function(node) {
        return !commons.table.isDataTable(node);
      },
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [],
      none: [ "has-th", "has-caption", "has-summary" ]
    }, {
      id: "link-name",
      selector: 'a[href]:not([role="button"]), [role=link][href]',
      tags: [ "wcag2a", "wcag111", "wcag412", "section508", "section508a" ],
      all: [],
      any: [ "has-visible-text", "aria-label", "aria-labelledby", "role-presentation", "role-none" ],
      none: [ "duplicate-img-label", "focusable-no-name" ]
    }, {
      id: "list",
      selector: "ul, ol",
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [],
      none: [ "only-listitems" ]
    }, {
      id: "listitem",
      selector: "li",
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [ "listitem" ],
      none: []
    }, {
      id: "marquee",
      selector: "marquee",
      tags: [ "wcag2a", "wcag222", "section508", "section508j" ],
      all: [],
      any: [],
      none: [ "exists" ]
    }, {
      id: "meta-refresh",
      selector: 'meta[http-equiv="refresh"]',
      excludeHidden: false,
      tags: [ "wcag2a", "wcag2aaa", "wcag221", "wcag224", "wcag325" ],
      all: [],
      any: [ "meta-refresh" ],
      none: []
    }, {
      id: "meta-viewport",
      selector: 'meta[name="viewport"]',
      excludeHidden: false,
      tags: [ "wcag2aa", "wcag144" ],
      all: [],
      any: [ "meta-viewport" ],
      none: []
    }, {
      id: "object-alt",
      selector: "object",
      tags: [ "wcag2a", "wcag111" ],
      all: [],
      any: [ "has-visible-text" ],
      none: []
    }, {
      id: "radiogroup",
      selector: "input[type=radio][name]",
      tags: [ "wcag2a", "wcag131" ],
      all: [],
      any: [ "group-labelledby", "fieldset" ],
      none: []
    }, {
      id: "region",
      selector: "html",
      pageLevel: true,
      enabled: false,
      tags: [ "best-practice" ],
      all: [],
      any: [ "region" ],
      none: []
    }, {
      id: "scope",
      selector: "[scope]",
      enabled: false,
      tags: [ "best-practice" ],
      all: [],
      any: [ "html5-scope", "html4-scope" ],
      none: [ "scope-value" ]
    }, {
      id: "server-side-image-map",
      selector: "img[ismap]",
      tags: [ "wcag2a", "wcag211", "section508", "section508f" ],
      all: [],
      any: [],
      none: [ "exists" ]
    }, {
      id: "skip-link",
      selector: "a[href]",
      pageLevel: true,
      enabled: false,
      tags: [ "best-practice" ],
      all: [],
      any: [ "skip-link" ],
      none: []
    }, {
      id: "tabindex",
      selector: "[tabindex]",
      tags: [ "best-practice" ],
      all: [],
      any: [ "tabindex" ],
      none: []
    }, {
      id: "valid-lang",
      selector: "[lang]:not(html), [xml\\:lang]:not(html)",
      tags: [ "wcag2aa", "wcag312" ],
      all: [],
      any: [],
      none: [ {
        options: [ "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "in", "io", "is", "it", "iu", "iw", "ja", "ji", "jv", "jw", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu" ],
        id: "valid-lang"
      } ]
    }, {
      id: "video-caption",
      selector: "video",
      tags: [ "wcag2a", "wcag122", "wcag123", "section508", "section508a" ],
      all: [],
      any: [],
      none: [ "caption" ]
    }, {
      id: "video-description",
      selector: "video",
      tags: [ "wcag2aa", "wcag125", "section508", "section508a" ],
      all: [],
      any: [],
      none: [ "description" ]
    } ],
    checks: [ {
      id: "abstractrole",
      evaluate: function(node, options) {
        return commons.aria.getRoleType(node.getAttribute("role")) === "abstract";
      }
    }, {
      id: "aria-allowed-attr",
      matches: function(node) {
        var role = node.getAttribute("role");
        if (!role) {
          role = commons.aria.implicitRole(node);
        }
        var allowed = commons.aria.allowedAttr(role);
        if (role && allowed) {
          var aria = /^aria-/;
          if (node.hasAttributes()) {
            var attrs = node.attributes;
            for (var i = 0, l = attrs.length; i < l; i++) {
              if (aria.test(attrs[i].nodeName)) {
                return true;
              }
            }
          }
        }
        return false;
      },
      evaluate: function(node, options) {
        var invalid = [];
        var attr, attrName, allowed, role = node.getAttribute("role"), attrs = node.attributes;
        if (!role) {
          role = commons.aria.implicitRole(node);
        }
        allowed = commons.aria.allowedAttr(role);
        if (role && allowed) {
          for (var i = 0, l = attrs.length; i < l; i++) {
            attr = attrs[i];
            attrName = attr.nodeName;
            if (commons.aria.validateAttr(attrName) && allowed.indexOf(attrName) === -1) {
              invalid.push(attrName + '="' + attr.nodeValue + '"');
            }
          }
        }
        if (invalid.length) {
          this.data(invalid);
          return false;
        }
        return true;
      }
    }, {
      id: "invalidrole",
      evaluate: function(node, options) {
        return !commons.aria.isValidRole(node.getAttribute("role"));
      }
    }, {
      id: "aria-required-attr",
      evaluate: function(node, options) {
        var missing = [];
        if (node.hasAttributes()) {
          var attr, role = node.getAttribute("role"), required = commons.aria.requiredAttr(role);
          if (role && required) {
            for (var i = 0, l = required.length; i < l; i++) {
              attr = required[i];
              if (!node.getAttribute(attr)) {
                missing.push(attr);
              }
            }
          }
        }
        if (missing.length) {
          this.data(missing);
          return false;
        }
        return true;
      }
    }, {
      id: "aria-required-children",
      evaluate: function(node, options) {
        var requiredOwned = commons.aria.requiredOwned, implicitNodes = commons.aria.implicitNodes, matchesSelector = commons.utils.matchesSelector, idrefs = commons.dom.idrefs;
        function owns(node, role, ariaOwned) {
          if (node === null) {
            return false;
          }
          var implicit = implicitNodes(role), selector = [ '[role="' + role + '"]' ];
          if (implicit) {
            selector = selector.concat(implicit);
          }
          selector = selector.join(",");
          return ariaOwned ? matchesSelector(node, selector) || !!node.querySelector(selector) : !!node.querySelector(selector);
        }
        function ariaOwns(nodes, role) {
          var index, length;
          for (index = 0, length = nodes.length; index < length; index++) {
            if (nodes[index] === null) {
              continue;
            }
            if (owns(nodes[index], role, true)) {
              return true;
            }
          }
          return false;
        }
        function missingRequiredChildren(node, childRoles, all) {
          var i, l = childRoles.length, missing = [], ownedElements = idrefs(node, "aria-owns");
          for (i = 0; i < l; i++) {
            var r = childRoles[i];
            if (owns(node, r) || ariaOwns(ownedElements, r)) {
              if (!all) {
                return null;
              }
            } else {
              if (all) {
                missing.push(r);
              }
            }
          }
          if (missing.length) {
            return missing;
          }
          if (!all && childRoles.length) {
            return childRoles;
          }
          return null;
        }
        var role = node.getAttribute("role");
        var required = requiredOwned(role);
        if (!required) {
          return true;
        }
        var all = false;
        var childRoles = required.one;
        if (!childRoles) {
          var all = true;
          childRoles = required.all;
        }
        var missing = missingRequiredChildren(node, childRoles, all);
        if (!missing) {
          return true;
        }
        this.data(missing);
        return false;
      }
    }, {
      id: "aria-required-parent",
      evaluate: function(node, options) {
        function getSelector(role) {
          var impliedNative = commons.aria.implicitNodes(role) || [];
          return impliedNative.concat('[role="' + role + '"]').join(",");
        }
        function getMissingContext(element, requiredContext, includeElement) {
          var index, length, role = element.getAttribute("role"), missing = [];
          if (!requiredContext) {
            requiredContext = commons.aria.requiredContext(role);
          }
          if (!requiredContext) {
            return null;
          }
          for (index = 0, length = requiredContext.length; index < length; index++) {
            if (includeElement && commons.utils.matchesSelector(element, getSelector(requiredContext[index]))) {
              return null;
            }
            if (commons.dom.findUp(element, getSelector(requiredContext[index]))) {
              return null;
            } else {
              missing.push(requiredContext[index]);
            }
          }
          return missing;
        }
        function getAriaOwners(element) {
          var owners = [], o = null;
          while (element) {
            if (element.id) {
              o = document.querySelector("[aria-owns~=" + commons.utils.escapeSelector(element.id) + "]");
              if (o) {
                owners.push(o);
              }
            }
            element = element.parentNode;
          }
          return owners.length ? owners : null;
        }
        var missingParents = getMissingContext(node);
        if (!missingParents) {
          return true;
        }
        var owners = getAriaOwners(node);
        if (owners) {
          for (var i = 0, l = owners.length; i < l; i++) {
            missingParents = getMissingContext(owners[i], missingParents, true);
            if (!missingParents) {
              return true;
            }
          }
        }
        this.data(missingParents);
        return false;
      }
    }, {
      id: "aria-valid-attr-value",
      matches: function(node) {
        var aria = /^aria-/;
        if (node.hasAttributes()) {
          var attrs = node.attributes;
          for (var i = 0, l = attrs.length; i < l; i++) {
            if (aria.test(attrs[i].nodeName)) {
              return true;
            }
          }
        }
        return false;
      },
      evaluate: function(node, options) {
        options = Array.isArray(options) ? options : [];
        var invalid = [], aria = /^aria-/;
        var attr, attrName, attrs = node.attributes;
        for (var i = 0, l = attrs.length; i < l; i++) {
          attr = attrs[i];
          attrName = attr.nodeName;
          if (options.indexOf(attrName) === -1 && aria.test(attrName) && !commons.aria.validateAttrValue(node, attrName)) {
            invalid.push(attrName + '="' + attr.nodeValue + '"');
          }
        }
        if (invalid.length) {
          this.data(invalid);
          return false;
        }
        return true;
      },
      options: []
    }, {
      id: "aria-valid-attr",
      matches: function(node) {
        var aria = /^aria-/;
        if (node.hasAttributes()) {
          var attrs = node.attributes;
          for (var i = 0, l = attrs.length; i < l; i++) {
            if (aria.test(attrs[i].nodeName)) {
              return true;
            }
          }
        }
        return false;
      },
      evaluate: function(node, options) {
        options = Array.isArray(options) ? options : [];
        var invalid = [], aria = /^aria-/;
        var attr, attrs = node.attributes;
        for (var i = 0, l = attrs.length; i < l; i++) {
          attr = attrs[i].nodeName;
          if (options.indexOf(attr) === -1 && aria.test(attr) && !commons.aria.validateAttr(attr)) {
            invalid.push(attr);
          }
        }
        if (invalid.length) {
          this.data(invalid);
          return false;
        }
        return true;
      },
      options: []
    }, {
      id: "color-contrast",
      matches: function(node) {
        var nodeName = node.nodeName, nodeType = node.type, doc = document;
        if (nodeName === "INPUT") {
          return [ "hidden", "range", "color", "checkbox", "radio", "image" ].indexOf(nodeType) === -1 && !node.disabled;
        }
        if (nodeName === "SELECT") {
          return !!node.options.length && !node.disabled;
        }
        if (nodeName === "TEXTAREA") {
          return !node.disabled;
        }
        if (nodeName === "OPTION") {
          return false;
        }
        if (nodeName === "BUTTON" && node.disabled) {
          return false;
        }
        if (nodeName === "LABEL") {
          var candidate = node.htmlFor && doc.getElementById(node.htmlFor);
          if (candidate && candidate.disabled) {
            return false;
          }
          var candidate = node.querySelector('input:not([type="hidden"]):not([type="image"])' + ':not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea');
          if (candidate && candidate.disabled) {
            return false;
          }
        }
        if (node.id) {
          var candidate = doc.querySelector("[aria-labelledby~=" + commons.utils.escapeSelector(node.id) + "]");
          if (candidate && candidate.disabled) {
            return false;
          }
        }
        if (commons.text.visible(node, false, true) === "") {
          return false;
        }
        var range = document.createRange(), childNodes = node.childNodes, length = childNodes.length, child, index;
        for (index = 0; index < length; index++) {
          child = childNodes[index];
          if (child.nodeType === 3 && commons.text.sanitize(child.nodeValue) !== "") {
            range.selectNodeContents(child);
          }
        }
        var rects = range.getClientRects();
        length = rects.length;
        for (index = 0; index < length; index++) {
          if (commons.dom.visuallyOverlaps(rects[index], node)) {
            return true;
          }
        }
        return false;
      },
      evaluate: function(node, options) {
        var bgNodes = [], bgColor = commons.color.getBackgroundColor(node, bgNodes), fgColor = commons.color.getForegroundColor(node);
        if (fgColor === null || bgColor === null) {
          return true;
        }
        var nodeStyle = window.getComputedStyle(node);
        var fontSize = parseFloat(nodeStyle.getPropertyValue("font-size"));
        var fontWeight = nodeStyle.getPropertyValue("font-weight");
        var bold = [ "bold", "bolder", "600", "700", "800", "900" ].indexOf(fontWeight) !== -1;
        var cr = commons.color.hasValidContrastRatio(bgColor, fgColor, fontSize, bold);
        this.data({
          fgColor: fgColor.toHexString(),
          bgColor: bgColor.toHexString(),
          contrastRatio: cr.contrastRatio.toFixed(2),
          fontSize: (fontSize * 72 / 96).toFixed(1) + "pt",
          fontWeight: bold ? "bold" : "normal"
        });
        if (!cr.isValid) {
          this.relatedNodes(bgNodes);
        }
        return cr.isValid;
      }
    }, {
      id: "fieldset",
      evaluate: function(node, options) {
        var failureCode, self = this;
        function getUnrelatedElements(parent, name) {
          return commons.utils.toArray(parent.querySelectorAll('select,textarea,button,input:not([name="' + name + '"]):not([type="hidden"])'));
        }
        function checkFieldset(group, name) {
          var firstNode = group.firstElementChild;
          if (!firstNode || firstNode.nodeName !== "LEGEND") {
            self.relatedNodes([ group ]);
            failureCode = "no-legend";
            return false;
          }
          if (!commons.text.accessibleText(firstNode)) {
            self.relatedNodes([ firstNode ]);
            failureCode = "empty-legend";
            return false;
          }
          var otherElements = getUnrelatedElements(group, name);
          if (otherElements.length) {
            self.relatedNodes(otherElements);
            failureCode = "mixed-inputs";
            return false;
          }
          return true;
        }
        function checkARIAGroup(group, name) {
          var hasLabelledByText = commons.dom.idrefs(group, "aria-labelledby").some(function(element) {
            return element && commons.text.accessibleText(element);
          });
          var ariaLabel = group.getAttribute("aria-label");
          if (!hasLabelledByText && !(ariaLabel && commons.text.sanitize(ariaLabel))) {
            self.relatedNodes(group);
            failureCode = "no-group-label";
            return false;
          }
          var otherElements = getUnrelatedElements(group, name);
          if (otherElements.length) {
            self.relatedNodes(otherElements);
            failureCode = "group-mixed-inputs";
            return false;
          }
          return true;
        }
        function spliceCurrentNode(nodes, current) {
          return commons.utils.toArray(nodes).filter(function(candidate) {
            return candidate !== current;
          });
        }
        function runCheck(element) {
          var name = commons.utils.escapeSelector(node.name);
          var matchingNodes = document.querySelectorAll('input[type="' + commons.utils.escapeSelector(node.type) + '"][name="' + name + '"]');
          if (matchingNodes.length < 2) {
            return true;
          }
          var fieldset = commons.dom.findUp(element, "fieldset");
          var group = commons.dom.findUp(element, '[role="group"]' + (node.type === "radio" ? ',[role="radiogroup"]' : ""));
          if (!group && !fieldset) {
            failureCode = "no-group";
            self.relatedNodes(spliceCurrentNode(matchingNodes, element));
            return false;
          }
          return fieldset ? checkFieldset(fieldset, name) : checkARIAGroup(group, name);
        }
        var data = {
          name: node.getAttribute("name"),
          type: node.getAttribute("type")
        };
        var result = runCheck(node);
        if (!result) {
          data.failureCode = failureCode;
        }
        this.data(data);
        return result;
      },
      after: function(results, options) {
        var seen = {};
        return results.filter(function(result) {
          if (result.result) {
            return true;
          }
          var data = result.data;
          if (data) {
            seen[data.type] = seen[data.type] || {};
            if (!seen[data.type][data.name]) {
              seen[data.type][data.name] = [ data ];
              return true;
            }
            var hasBeenSeen = seen[data.type][data.name].some(function(candidate) {
              return candidate.failureCode === data.failureCode;
            });
            if (!hasBeenSeen) {
              seen[data.type][data.name].push(data);
            }
            return !hasBeenSeen;
          }
          return false;
        });
      }
    }, {
      id: "group-labelledby",
      evaluate: function(node, options) {
        this.data({
          name: node.getAttribute("name"),
          type: node.getAttribute("type")
        });
        var matchingNodes = document.querySelectorAll('input[type="' + commons.utils.escapeSelector(node.type) + '"][name="' + commons.utils.escapeSelector(node.name) + '"]');
        if (matchingNodes.length <= 1) {
          return true;
        }
        return [].map.call(matchingNodes, function(m) {
          var l = m.getAttribute("aria-labelledby");
          return l ? l.split(/\s+/) : [];
        }).reduce(function(prev, curr) {
          return prev.filter(function(n) {
            return curr.indexOf(n) !== -1;
          });
        }).filter(function(n) {
          var labelNode = document.getElementById(n);
          return labelNode && commons.text.accessibleText(labelNode);
        }).length !== 0;
      },
      after: function(results, options) {
        var seen = {};
        return results.filter(function(result) {
          var data = result.data;
          if (data) {
            seen[data.type] = seen[data.type] || {};
            if (!seen[data.type][data.name]) {
              seen[data.type][data.name] = true;
              return true;
            }
          }
          return false;
        });
      }
    }, {
      id: "accesskeys",
      evaluate: function(node, options) {
        this.data(node.getAttribute("accesskey"));
        this.relatedNodes([ node ]);
        return true;
      },
      after: function(results, options) {
        var seen = {};
        return results.filter(function(r) {
          if (!seen[r.data]) {
            seen[r.data] = r;
            r.relatedNodes = [];
            return true;
          }
          seen[r.data].relatedNodes.push(r.relatedNodes[0]);
          return false;
        }).map(function(r) {
          r.result = !!r.relatedNodes.length;
          return r;
        });
      }
    }, {
      id: "focusable-no-name",
      evaluate: function(node, options) {
        var tabIndex = node.getAttribute("tabindex"), isFocusable = commons.dom.isFocusable(node) && tabIndex > -1;
        if (!isFocusable) {
          return false;
        }
        return !commons.text.accessibleText(node);
      }
    }, {
      id: "tabindex",
      evaluate: function(node, options) {
        return node.tabIndex <= 0;
      }
    }, {
      id: "duplicate-img-label",
      evaluate: function(node, options) {
        var imgs = node.querySelectorAll("img");
        var text = commons.text.visible(node, true);
        for (var i = 0, len = imgs.length; i < len; i++) {
          var imgAlt = commons.text.accessibleText(imgs[i]);
          if (imgAlt === text && text !== "") {
            return true;
          }
        }
        return false;
      },
      enabled: false
    }, {
      id: "explicit-label",
      evaluate: function(node, options) {
        var label = document.querySelector('label[for="' + commons.utils.escapeSelector(node.id) + '"]');
        if (label) {
          return !!commons.text.accessibleText(label);
        }
        return false;
      },
      selector: "[id]"
    }, {
      id: "help-same-as-label",
      evaluate: function(node, options) {
        var labelText = commons.text.label(node), check = node.getAttribute("title");
        if (!labelText) {
          return false;
        }
        if (!check) {
          check = "";
          if (node.getAttribute("aria-describedby")) {
            var ref = commons.dom.idrefs(node, "aria-describedby");
            check = ref.map(function(thing) {
              return thing ? commons.text.accessibleText(thing) : "";
            }).join("");
          }
        }
        return commons.text.sanitize(check) === commons.text.sanitize(labelText);
      },
      enabled: false
    }, {
      id: "implicit-label",
      evaluate: function(node, options) {
        var label = commons.dom.findUp(node, "label");
        if (label) {
          return !!commons.text.accessibleText(label);
        }
        return false;
      }
    }, {
      id: "multiple-label",
      evaluate: function(node, options) {
        var labels = [].slice.call(document.querySelectorAll('label[for="' + commons.utils.escapeSelector(node.id) + '"]')), parent = node.parentNode;
        while (parent) {
          if (parent.tagName === "LABEL" && labels.indexOf(parent) === -1) {
            labels.push(parent);
          }
          parent = parent.parentNode;
        }
        this.relatedNodes(labels);
        return labels.length > 1;
      }
    }, {
      id: "title-only",
      evaluate: function(node, options) {
        var labelText = commons.text.label(node);
        return !labelText && !!(node.getAttribute("title") || node.getAttribute("aria-describedby"));
      }
    }, {
      id: "has-lang",
      evaluate: function(node, options) {
        return node.hasAttribute("lang") || node.hasAttribute("xml:lang");
      }
    }, {
      id: "valid-lang",
      options: [ "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bh", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "in", "io", "is", "it", "iu", "iw", "ja", "ji", "jv", "jw", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mo", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu" ],
      evaluate: function(node, options) {
        var lang = (node.getAttribute("lang") || "").trim().toLowerCase();
        var xmlLang = (node.getAttribute("xml:lang") || "").trim().toLowerCase();
        var invalid = [];
        (options || []).forEach(function(cc) {
          cc = cc.toLowerCase();
          if (lang && (lang === cc || lang.indexOf(cc.toLowerCase() + "-") === 0)) {
            lang = null;
          }
          if (xmlLang && (xmlLang === cc || xmlLang.indexOf(cc.toLowerCase() + "-") === 0)) {
            xmlLang = null;
          }
        });
        if (xmlLang) {
          invalid.push('xml:lang="' + xmlLang + '"');
        }
        if (lang) {
          invalid.push('lang="' + lang + '"');
        }
        if (invalid.length) {
          this.data(invalid);
          return true;
        }
        return false;
      }
    }, {
      id: "dlitem",
      evaluate: function(node, options) {
        return node.parentNode.tagName === "DL";
      }
    }, {
      id: "has-listitem",
      evaluate: function(node, options) {
        var children = node.children;
        if (children.length === 0) {
          return true;
        }
        for (var i = 0; i < children.length; i++) {
          if (children[i].nodeName === "LI") {
            return false;
          }
        }
        return true;
      }
    }, {
      id: "listitem",
      evaluate: function(node, options) {
        return [ "UL", "OL" ].indexOf(node.parentNode.tagName) !== -1;
      }
    }, {
      id: "only-dlitems",
      evaluate: function(node, options) {
        var child, bad = [], children = node.childNodes, hasNonEmptyTextNode = false;
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          if (child.nodeType === 1 && (child.nodeName !== "DT" && child.nodeName !== "DD" && child.nodeName !== "SCRIPT" && child.nodeName !== "TEMPLATE")) {
            bad.push(child);
          } else {
            if (child.nodeType === 3 && child.nodeValue.trim() !== "") {
              hasNonEmptyTextNode = true;
            }
          }
        }
        if (bad.length) {
          this.relatedNodes(bad);
        }
        var retVal = !!bad.length || hasNonEmptyTextNode;
        return retVal;
      }
    }, {
      id: "only-listitems",
      evaluate: function(node, options) {
        var child, bad = [], children = node.childNodes, hasNonEmptyTextNode = false;
        for (var i = 0; i < children.length; i++) {
          child = children[i];
          if (child.nodeType === 1 && child.nodeName !== "LI" && child.nodeName !== "SCRIPT" && child.nodeName !== "TEMPLATE") {
            bad.push(child);
          } else {
            if (child.nodeType === 3 && child.nodeValue.trim() !== "") {
              hasNonEmptyTextNode = true;
            }
          }
        }
        if (bad.length) {
          this.relatedNodes(bad);
        }
        return !!bad.length || hasNonEmptyTextNode;
      }
    }, {
      id: "structured-dlitems",
      evaluate: function(node, options) {
        var children = node.children;
        if (!children || !children.length) {
          return false;
        }
        var hasDt = false, hasDd = false;
        for (var i = 0; i < children.length; i++) {
          if (children[i].nodeName === "DT") {
            hasDt = true;
          }
          if (hasDt && children[i].nodeName === "DD") {
            return false;
          }
          if (children[i].nodeName === "DD") {
            hasDd = true;
          }
        }
        return hasDt || hasDd;
      }
    }, {
      id: "caption",
      evaluate: function(node, options) {
        return !node.querySelector("track[kind=captions]");
      }
    }, {
      id: "description",
      evaluate: function(node, options) {
        return !node.querySelector("track[kind=descriptions]");
      }
    }, {
      id: "meta-viewport",
      evaluate: function(node, options) {
        var params, content = node.getAttribute("content") || "", parsedParams = content.split(/[;,]/), result = {};
        for (var i = 0, l = parsedParams.length; i < l; i++) {
          params = parsedParams[i].split("=");
          var key = params.shift();
          if (key && params.length) {
            result[key.trim()] = params.join("=").trim();
          }
        }
        if (result["maximum-scale"] && parseFloat(result["maximum-scale"]) < 5) {
          return false;
        }
        if (result["user-scalable"] === "no") {
          return false;
        }
        return true;
      }
    }, {
      id: "header-present",
      selector: "html",
      evaluate: function(node, options) {
        return !!node.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
      }
    }, {
      id: "heading-order",
      evaluate: function(node, options) {
        var ariaHeadingLevel = node.getAttribute("aria-level");
        if (ariaHeadingLevel !== null) {
          this.data(parseInt(ariaHeadingLevel, 10));
          return true;
        }
        var headingLevel = node.tagName.match(/H(\d)/);
        if (headingLevel) {
          this.data(parseInt(headingLevel[1], 10));
          return true;
        }
        return true;
      },
      after: function(results, options) {
        if (results.length < 2) {
          return results;
        }
        var prevLevel = results[0].data;
        for (var i = 1; i < results.length; i++) {
          if (results[i].result && results[i].data > prevLevel + 1) {
            results[i].result = false;
          }
          prevLevel = results[i].data;
        }
        return results;
      }
    }, {
      id: "internal-link-present",
      selector: "html",
      evaluate: function(node, options) {
        return !!node.querySelector('a[href^="#"]');
      }
    }, {
      id: "landmark",
      selector: "html",
      evaluate: function(node, options) {
        return !!node.querySelector('[role="main"]');
      }
    }, {
      id: "meta-refresh",
      evaluate: function(node, options) {
        var content = node.getAttribute("content") || "", parsedParams = content.split(/[;,]/);
        return content === "" || parsedParams[0] === "0";
      }
    }, {
      id: "region",
      evaluate: function(node, options) {
        var landmarkRoles = commons.aria.getRolesByType("landmark"), firstLink = node.querySelector("a[href]");
        function isSkipLink(n) {
          return firstLink && commons.dom.isFocusable(commons.dom.getElementByReference(firstLink, "href")) && firstLink === n;
        }
        function isLandmark(n) {
          var role = n.getAttribute("role");
          return role && landmarkRoles.indexOf(role) !== -1;
        }
        function checkRegion(n) {
          if (isLandmark(n)) {
            return null;
          }
          if (isSkipLink(n)) {
            return getViolatingChildren(n);
          }
          if (commons.dom.isVisible(n, true) && (commons.text.visible(n, true, true) || commons.dom.isVisualContent(n))) {
            return n;
          }
          return getViolatingChildren(n);
        }
        function getViolatingChildren(n) {
          var children = commons.utils.toArray(n.children);
          if (children.length === 0) {
            return [];
          }
          return children.map(checkRegion).filter(function(c) {
            return c !== null;
          }).reduce(function(a, b) {
            return a.concat(b);
          }, []);
        }
        var v = getViolatingChildren(node);
        this.relatedNodes(v);
        return !v.length;
      },
      after: function(results, options) {
        return [ results[0] ];
      }
    }, {
      id: "skip-link",
      selector: "a[href]",
      evaluate: function(node, options) {
        return commons.dom.isFocusable(commons.dom.getElementByReference(node, "href"));
      },
      after: function(results, options) {
        return [ results[0] ];
      }
    }, {
      id: "unique-frame-title",
      evaluate: function(node, options) {
        this.data(node.title);
        return true;
      },
      after: function(results, options) {
        var titles = {};
        results.forEach(function(r) {
          titles[r.data] = titles[r.data] !== undefined ? ++titles[r.data] : 0;
        });
        return results.filter(function(r) {
          return !!titles[r.data];
        });
      }
    }, {
      id: "aria-label",
      evaluate: function(node, options) {
        var label = node.getAttribute("aria-label");
        return !!(label ? commons.text.sanitize(label).trim() : "");
      }
    }, {
      id: "aria-labelledby",
      evaluate: function(node, options) {
        var results = commons.dom.idrefs(node, "aria-labelledby");
        var element, i, l = results.length;
        for (i = 0; i < l; i++) {
          element = results[i];
          if (element && commons.text.accessibleText(element).trim()) {
            return true;
          }
        }
        return false;
      }
    }, {
      id: "button-has-visible-text",
      evaluate: function(node, options) {
        return commons.text.accessibleText(node).length > 0;
      },
      selector: 'button, [role="button"]:not(input)'
    }, {
      id: "doc-has-title",
      evaluate: function(node, options) {
        var title = document.title;
        return !!(title ? commons.text.sanitize(title).trim() : "");
      }
    }, {
      id: "duplicate-id",
      evaluate: function(node, options) {
        var matchingNodes = document.querySelectorAll('[id="' + commons.utils.escapeSelector(node.id) + '"]');
        var related = [];
        for (var i = 0; i < matchingNodes.length; i++) {
          if (matchingNodes[i] !== node) {
            related.push(matchingNodes[i]);
          }
        }
        if (related.length) {
          this.relatedNodes(related);
        }
        this.data(node.getAttribute("id"));
        return matchingNodes.length <= 1;
      },
      after: function(results, options) {
        var uniqueIds = [];
        return results.filter(function(r) {
          if (uniqueIds.indexOf(r.data) === -1) {
            uniqueIds.push(r.data);
            return true;
          }
          return false;
        });
      }
    }, {
      id: "exists",
      evaluate: function(node, options) {
        return true;
      }
    }, {
      id: "has-alt",
      evaluate: function(node, options) {
        return node.hasAttribute("alt");
      }
    }, {
      id: "has-visible-text",
      evaluate: function(node, options) {
        return commons.text.accessibleText(node).length > 0;
      }
    }, {
      id: "non-empty-alt",
      evaluate: function(node, options) {
        var label = node.getAttribute("alt");
        return !!(label ? commons.text.sanitize(label).trim() : "");
      }
    }, {
      id: "non-empty-if-present",
      evaluate: function(node, options) {
        var label = node.getAttribute("value");
        this.data(label);
        return label === null || commons.text.sanitize(label).trim() !== "";
      },
      selector: '[type="submit"], [type="reset"]'
    }, {
      id: "non-empty-title",
      evaluate: function(node, options) {
        var title = node.getAttribute("title");
        return !!(title ? commons.text.sanitize(title).trim() : "");
      }
    }, {
      id: "non-empty-value",
      evaluate: function(node, options) {
        var label = node.getAttribute("value");
        return !!(label ? commons.text.sanitize(label).trim() : "");
      },
      selector: '[type="button"]'
    }, {
      id: "role-none",
      evaluate: function(node, options) {
        return node.getAttribute("role") === "none";
      }
    }, {
      id: "role-presentation",
      evaluate: function(node, options) {
        return node.getAttribute("role") === "presentation";
      }
    }, {
      id: "cell-no-header",
      evaluate: function(node, options) {
        var row, cell, badCells = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (commons.table.isDataCell(cell) && (!commons.aria.label(cell) && !commons.table.getHeaders(cell).length)) {
              badCells.push(cell);
            }
          }
        }
        if (badCells.length) {
          this.relatedNodes(badCells);
          return true;
        }
        return false;
      }
    }, {
      id: "consistent-columns",
      evaluate: function(node, options) {
        var table = commons.table.toArray(node);
        var relatedNodes = [];
        var expectedWidth;
        for (var i = 0, length = table.length; i < length; i++) {
          if (i === 0) {
            expectedWidth = table[i].length;
          } else {
            if (expectedWidth !== table[i].length) {
              relatedNodes.push(node.rows[i]);
            }
          }
        }
        return !relatedNodes.length;
      }
    }, {
      id: "has-caption",
      evaluate: function(node, options) {
        return !!node.caption;
      }
    }, {
      id: "has-summary",
      evaluate: function(node, options) {
        return !!node.summary;
      }
    }, {
      id: "has-th",
      evaluate: function(node, options) {
        var row, cell, badCells = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (cell.nodeName === "TH") {
              badCells.push(cell);
            }
          }
        }
        if (badCells.length) {
          this.relatedNodes(badCells);
          return true;
        }
        return false;
      }
    }, {
      id: "headers-attr-reference",
      evaluate: function(node, options) {
        var row, cell, headerCells, badHeaders = [];
        function checkHeader(header) {
          if (!header || !commons.text.accessibleText(header)) {
            badHeaders.push(cell);
          }
        }
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            headerCells = commons.dom.idrefs(cell, "headers");
            if (headerCells.length) {
              headerCells.forEach(checkHeader);
            }
          }
        }
        if (badHeaders.length) {
          this.relatedNodes(badHeaders);
          return true;
        }
        return false;
      }
    }, {
      id: "headers-visible-text",
      evaluate: function(node, options) {
        var row, cell, badHeaders = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (commons.table.isHeader(cell) && !commons.text.accessibleText(cell)) {
              badHeaders.push(cell);
            }
          }
        }
        if (badHeaders.length) {
          this.relatedNodes(badHeaders);
          return true;
        }
        return false;
      }
    }, {
      id: "html4-scope",
      evaluate: function(node, options) {
        if (commons.dom.isHTML5(document)) {
          return false;
        }
        return node.nodeName === "TH" || node.nodeName === "TD";
      }
    }, {
      id: "html5-scope",
      evaluate: function(node, options) {
        if (!commons.dom.isHTML5(document)) {
          return false;
        }
        return node.nodeName === "TH";
      }
    }, {
      id: "no-caption",
      evaluate: function(node, options) {
        return !(node.caption || {}).textContent;
      },
      enabled: false
    }, {
      id: "rowspan",
      evaluate: function(node, options) {
        var row, cell, badCells = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (cell.rowSpan !== 1) {
              badCells.push(cell);
            }
          }
        }
        if (badCells.length) {
          this.relatedNodes(badCells);
          return true;
        }
        return false;
      }
    }, {
      id: "same-caption-summary",
      selector: "table",
      evaluate: function(node, options) {
        return !!(node.summary && node.caption) && node.summary === commons.text.accessibleText(node.caption);
      }
    }, {
      id: "scope-value",
      evaluate: function(node, options) {
        var value = node.getAttribute("scope");
        return value !== "row" && value !== "col";
      }
    }, {
      id: "th-headers-attr",
      evaluate: function(node, options) {
        var row, cell, headersTH = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (cell.nodeName === "TH" && cell.getAttribute("headers")) {
              headersTH.push(cell);
            }
          }
        }
        if (headersTH.length) {
          this.relatedNodes(headersTH);
          return true;
        }
        return false;
      }
    }, {
      id: "th-scope",
      evaluate: function(node, options) {
        var row, cell, noScopeTH = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (cell.nodeName === "TH" && !cell.getAttribute("scope")) {
              noScopeTH.push(cell);
            }
          }
        }
        if (noScopeTH.length) {
          this.relatedNodes(noScopeTH);
          return true;
        }
        return false;
      }
    }, {
      id: "th-single-row-column",
      evaluate: function(node, options) {
        var row, cell, position, rowHeaders = [], columnHeaders = [];
        for (var rowIndex = 0, rowLength = node.rows.length; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (cell.nodeName) {
              if (commons.table.isColumnHeader(cell) && columnHeaders.indexOf(rowIndex) === -1) {
                columnHeaders.push(rowIndex);
              } else {
                if (commons.table.isRowHeader(cell)) {
                  position = commons.table.getCellPosition(cell);
                  if (rowHeaders.indexOf(position.x) === -1) {
                    rowHeaders.push(position.x);
                  }
                }
              }
            }
          }
        }
        if (columnHeaders.length > 1 || rowHeaders.length > 1) {
          return true;
        }
        return false;
      }
    } ],
    commons: function() {
      var commons = {};
      var aria = commons.aria = {}, lookupTables = aria._lut = {};
      lookupTables.attributes = {
        "aria-activedescendant": {
          type: "idref"
        },
        "aria-atomic": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-autocomplete": {
          type: "nmtoken",
          values: [ "inline", "list", "both", "none" ]
        },
        "aria-busy": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-checked": {
          type: "nmtoken",
          values: [ "true", "false", "mixed", "undefined" ]
        },
        "aria-colcount": {
          type: "int"
        },
        "aria-colindex": {
          type: "int"
        },
        "aria-colspan": {
          type: "int"
        },
        "aria-controls": {
          type: "idrefs"
        },
        "aria-describedby": {
          type: "idrefs"
        },
        "aria-disabled": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-dropeffect": {
          type: "nmtokens",
          values: [ "copy", "move", "reference", "execute", "popup", "none" ]
        },
        "aria-expanded": {
          type: "nmtoken",
          values: [ "true", "false", "undefined" ]
        },
        "aria-flowto": {
          type: "idrefs"
        },
        "aria-grabbed": {
          type: "nmtoken",
          values: [ "true", "false", "undefined" ]
        },
        "aria-haspopup": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-hidden": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-invalid": {
          type: "nmtoken",
          values: [ "true", "false", "spelling", "grammar" ]
        },
        "aria-label": {
          type: "string"
        },
        "aria-labelledby": {
          type: "idrefs"
        },
        "aria-level": {
          type: "int"
        },
        "aria-live": {
          type: "nmtoken",
          values: [ "off", "polite", "assertive" ]
        },
        "aria-multiline": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-multiselectable": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-orientation": {
          type: "nmtoken",
          values: [ "horizontal", "vertical" ]
        },
        "aria-owns": {
          type: "idrefs"
        },
        "aria-posinset": {
          type: "int"
        },
        "aria-pressed": {
          type: "nmtoken",
          values: [ "true", "false", "mixed", "undefined" ]
        },
        "aria-readonly": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-relevant": {
          type: "nmtokens",
          values: [ "additions", "removals", "text", "all" ]
        },
        "aria-required": {
          type: "boolean",
          values: [ "true", "false" ]
        },
        "aria-rowcount": {
          type: "int"
        },
        "aria-rowindex": {
          type: "int"
        },
        "aria-rowspan": {
          type: "int"
        },
        "aria-selected": {
          type: "nmtoken",
          values: [ "true", "false", "undefined" ]
        },
        "aria-setsize": {
          type: "int"
        },
        "aria-sort": {
          type: "nmtoken",
          values: [ "ascending", "descending", "other", "none" ]
        },
        "aria-valuemax": {
          type: "decimal"
        },
        "aria-valuemin": {
          type: "decimal"
        },
        "aria-valuenow": {
          type: "decimal"
        },
        "aria-valuetext": {
          type: "string"
        }
      };
      lookupTables.globalAttributes = [ "aria-atomic", "aria-busy", "aria-controls", "aria-describedby", "aria-disabled", "aria-dropeffect", "aria-flowto", "aria-grabbed", "aria-haspopup", "aria-hidden", "aria-invalid", "aria-label", "aria-labelledby", "aria-live", "aria-owns", "aria-relevant" ];
      lookupTables.role = {
        alert: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        alertdialog: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        application: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        article: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "article" ]
        },
        banner: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        button: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded", "aria-pressed" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null,
          implicit: [ "button", 'input[type="button"]', 'input[type="image"]' ]
        },
        cell: {
          type: "structure",
          attributes: {
            allowed: [ "aria-colindex", "aria-colspan", "aria-rowindex", "aria-rowspan" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "row" ]
        },
        checkbox: {
          type: "widget",
          attributes: {
            required: [ "aria-checked" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null,
          implicit: [ 'input[type="checkbox"]' ]
        },
        columnheader: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded", "aria-sort", "aria-readonly", "aria-selected", "aria-required" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "row" ]
        },
        combobox: {
          type: "composite",
          attributes: {
            required: [ "aria-expanded" ],
            allowed: [ "aria-autocomplete", "aria-required", "aria-activedescendant" ]
          },
          owned: {
            all: [ "listbox", "textbox" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        command: {
          nameFrom: [ "author" ],
          type: "abstract"
        },
        complementary: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "aside" ]
        },
        composite: {
          nameFrom: [ "author" ],
          type: "abstract"
        },
        contentinfo: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        definition: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        dialog: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "dialog" ]
        },
        directory: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null
        },
        document: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "body" ]
        },
        form: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        grid: {
          type: "composite",
          attributes: {
            allowed: [ "aria-level", "aria-multiselectable", "aria-readonly", "aria-activedescendant", "aria-expanded" ]
          },
          owned: {
            one: [ "rowgroup", "row" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        gridcell: {
          type: "widget",
          attributes: {
            allowed: [ "aria-selected", "aria-readonly", "aria-expanded", "aria-required" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "row" ]
        },
        group: {
          type: "structure",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "details" ]
        },
        heading: {
          type: "structure",
          attributes: {
            allowed: [ "aria-level", "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null,
          implicit: [ "h1", "h2", "h3", "h4", "h5", "h6" ]
        },
        img: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "img" ]
        },
        input: {
          nameFrom: [ "author" ],
          type: "abstract"
        },
        landmark: {
          nameFrom: [ "author" ],
          type: "abstract"
        },
        link: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null,
          implicit: [ "a[href]" ]
        },
        list: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: {
            all: [ "listitem" ]
          },
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "ol", "ul" ]
        },
        listbox: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-multiselectable", "aria-required", "aria-expanded" ]
          },
          owned: {
            all: [ "option" ]
          },
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "select" ]
        },
        listitem: {
          type: "structure",
          attributes: {
            allowed: [ "aria-level", "aria-posinset", "aria-setsize", "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "list" ],
          implicit: [ "li" ]
        },
        log: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        main: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        marquee: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        math: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        menu: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded" ]
          },
          owned: {
            one: [ "menuitem", "menuitemradio", "menuitemcheckbox" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        menubar: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        menuitem: {
          type: "widget",
          attributes: null,
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "menu", "menubar" ]
        },
        menuitemcheckbox: {
          type: "widget",
          attributes: {
            required: [ "aria-checked" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "menu", "menubar" ]
        },
        menuitemradio: {
          type: "widget",
          attributes: {
            allowed: [ "aria-selected", "aria-posinset", "aria-setsize" ],
            required: [ "aria-checked" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "menu", "menubar" ]
        },
        navigation: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        none: {
          type: "structure",
          attributes: null,
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        note: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        option: {
          type: "widget",
          attributes: {
            allowed: [ "aria-selected", "aria-posinset", "aria-setsize", "aria-checked" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "listbox" ]
        },
        presentation: {
          type: "structure",
          attributes: null,
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        progressbar: {
          type: "widget",
          attributes: {
            allowed: [ "aria-valuetext", "aria-valuenow", "aria-valuemax", "aria-valuemin" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        radio: {
          type: "widget",
          attributes: {
            allowed: [ "aria-selected", "aria-posinset", "aria-setsize" ],
            required: [ "aria-checked" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null,
          implicit: [ 'input[type="radio"]' ]
        },
        radiogroup: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-required", "aria-expanded" ]
          },
          owned: {
            all: [ "radio" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        range: {
          nameFrom: [ "author" ],
          type: "abstract"
        },
        region: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "section" ]
        },
        roletype: {
          type: "abstract"
        },
        row: {
          type: "structure",
          attributes: {
            allowed: [ "aria-level", "aria-selected", "aria-activedescendant", "aria-expanded" ]
          },
          owned: {
            one: [ "cell", "columnheader", "rowheader", "gridcell" ]
          },
          nameFrom: [ "author", "contents" ],
          context: [ "rowgroup", "grid", "treegrid", "table" ]
        },
        rowgroup: {
          type: "structure",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded" ]
          },
          owned: {
            all: [ "row" ]
          },
          nameFrom: [ "author", "contents" ],
          context: [ "grid", "table" ]
        },
        rowheader: {
          type: "structure",
          attributes: {
            allowed: [ "aria-sort", "aria-required", "aria-readonly", "aria-expanded", "aria-selected" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "row" ]
        },
        scrollbar: {
          type: "widget",
          attributes: {
            required: [ "aria-controls", "aria-orientation", "aria-valuenow", "aria-valuemax", "aria-valuemin" ],
            allowed: [ "aria-valuetext" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        search: {
          type: "landmark",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        searchbox: {
          type: "widget",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-readonly", "aria-required" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ 'input[type="search"]' ]
        },
        section: {
          nameFrom: [ "author", "contents" ],
          type: "abstract"
        },
        sectionhead: {
          nameFrom: [ "author", "contents" ],
          type: "abstract"
        },
        select: {
          nameFrom: [ "author" ],
          type: "abstract"
        },
        separator: {
          type: "structure",
          attributes: {
            allowed: [ "aria-expanded", "aria-orientation" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        slider: {
          type: "widget",
          attributes: {
            allowed: [ "aria-valuetext", "aria-orientation" ],
            required: [ "aria-valuenow", "aria-valuemax", "aria-valuemin" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        spinbutton: {
          type: "widget",
          attributes: {
            allowed: [ "aria-valuetext", "aria-required" ],
            required: [ "aria-valuenow", "aria-valuemax", "aria-valuemin" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        status: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "output" ]
        },
        structure: {
          type: "abstract"
        },
        "switch": {
          type: "widget",
          attributes: {
            required: [ "aria-checked" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null
        },
        tab: {
          type: "widget",
          attributes: {
            allowed: [ "aria-selected", "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "tablist" ]
        },
        table: {
          type: "structure",
          attributes: {
            allowed: [ "aria-colcount", "aria-rowcount" ]
          },
          owned: {
            one: [ "rowgroup", "row" ]
          },
          nameFrom: [ "author" ],
          context: null,
          implicit: [ "table" ]
        },
        tablist: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded", "aria-level", "aria-multiselectable" ]
          },
          owned: {
            all: [ "tab" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        tabpanel: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        text: {
          type: "structure",
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null
        },
        textbox: {
          type: "widget",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-autocomplete", "aria-multiline", "aria-readonly", "aria-required" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ 'input[type="text"]', "input:not([type])" ]
        },
        timer: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null
        },
        toolbar: {
          type: "structure",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author" ],
          context: null,
          implicit: [ 'menu[type="toolbar"]' ]
        },
        tooltip: {
          type: "widget",
          attributes: {
            allowed: [ "aria-expanded" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: null
        },
        tree: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-multiselectable", "aria-required", "aria-expanded" ]
          },
          owned: {
            all: [ "treeitem" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        treegrid: {
          type: "composite",
          attributes: {
            allowed: [ "aria-activedescendant", "aria-expanded", "aria-level", "aria-multiselectable", "aria-readonly", "aria-required" ]
          },
          owned: {
            all: [ "treeitem" ]
          },
          nameFrom: [ "author" ],
          context: null
        },
        treeitem: {
          type: "widget",
          attributes: {
            allowed: [ "aria-checked", "aria-selected", "aria-expanded", "aria-level", "aria-posinset", "aria-setsize" ]
          },
          owned: null,
          nameFrom: [ "author", "contents" ],
          context: [ "treegrid", "tree" ]
        },
        widget: {
          type: "abstract"
        },
        window: {
          nameFrom: [ "author" ],
          type: "abstract"
        }
      };
      var color = {};
      commons.color = color;
      var dom = commons.dom = {};
      var table = commons.table = {};
      var text = commons.text = {};
      var utils = commons.utils = {};
      utils.escapeSelector = axe.utils.escapeSelector;
      utils.matchesSelector = axe.utils.matchesSelector;
      utils.clone = axe.utils.clone;
      aria.requiredAttr = function(role) {
        "use strict";
        var roles = lookupTables.role[role], attr = roles && roles.attributes && roles.attributes.required;
        return attr || [];
      };
      aria.allowedAttr = function(role) {
        "use strict";
        var roles = lookupTables.role[role], attr = roles && roles.attributes && roles.attributes.allowed || [], requiredAttr = roles && roles.attributes && roles.attributes.required || [];
        return attr.concat(lookupTables.globalAttributes).concat(requiredAttr);
      };
      aria.validateAttr = function(att) {
        "use strict";
        return !!lookupTables.attributes[att];
      };
      aria.validateAttrValue = function(node, attr) {
        "use strict";
        var ids, index, length, matches, doc = document, value = node.getAttribute(attr), attrInfo = lookupTables.attributes[attr];
        if (!attrInfo) {
          return true;
        } else {
          if (attrInfo.values) {
            if (typeof value === "string" && attrInfo.values.indexOf(value.toLowerCase()) !== -1) {
              return true;
            }
            return false;
          }
        }
        switch (attrInfo.type) {
         case "idref":
          return !!(value && doc.getElementById(value));

         case "idrefs":
          ids = utils.tokenList(value);
          for (index = 0, length = ids.length; index < length; index++) {
            if (ids[index] && !doc.getElementById(ids[index])) {
              return false;
            }
          }
          return !!ids.length;

         case "string":
          return true;

         case "decimal":
          matches = value.match(/^[-+]?([0-9]*)\.?([0-9]*)$/);
          return !!(matches && (matches[1] || matches[2]));

         case "int":
          return /^[-+]?[0-9]+$/.test(value);
        }
      };
      aria.label = function(node) {
        var ref, candidate;
        if (node.getAttribute("aria-labelledby")) {
          ref = dom.idrefs(node, "aria-labelledby");
          candidate = ref.map(function(thing) {
            return thing ? text.visible(thing, true) : "";
          }).join(" ").trim();
          if (candidate) {
            return candidate;
          }
        }
        candidate = node.getAttribute("aria-label");
        if (candidate) {
          candidate = text.sanitize(candidate).trim();
          if (candidate) {
            return candidate;
          }
        }
        return null;
      };
      aria.isValidRole = function(role) {
        "use strict";
        if (lookupTables.role[role]) {
          return true;
        }
        return false;
      };
      aria.getRolesWithNameFromContents = function() {
        return Object.keys(lookupTables.role).filter(function(r) {
          return lookupTables.role[r].nameFrom && lookupTables.role[r].nameFrom.indexOf("contents") !== -1;
        });
      };
      aria.getRolesByType = function(roleType) {
        return Object.keys(lookupTables.role).filter(function(r) {
          return lookupTables.role[r].type === roleType;
        });
      };
      aria.getRoleType = function(role) {
        var r = lookupTables.role[role];
        return r && r.type || null;
      };
      aria.requiredOwned = function(role) {
        "use strict";
        var owned = null, roles = lookupTables.role[role];
        if (roles) {
          owned = utils.clone(roles.owned);
        }
        return owned;
      };
      aria.requiredContext = function(role) {
        "use strict";
        var context = null, roles = lookupTables.role[role];
        if (roles) {
          context = utils.clone(roles.context);
        }
        return context;
      };
      aria.implicitNodes = function(role) {
        "use strict";
        var implicit = null, roles = lookupTables.role[role];
        if (roles && roles.implicit) {
          implicit = utils.clone(roles.implicit);
        }
        return implicit;
      };
      aria.implicitRole = function(node) {
        "use strict";
        var role, r, candidate, roles = lookupTables.role;
        for (role in roles) {
          if (roles.hasOwnProperty(role)) {
            r = roles[role];
            if (r.implicit) {
              for (var index = 0, length = r.implicit.length; index < length; index++) {
                candidate = r.implicit[index];
                if (utils.matchesSelector(node, candidate)) {
                  return role;
                }
              }
            }
          }
        }
        return null;
      };
      color.Color = function(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
        this.toHexString = function() {
          var redString = Math.round(this.red).toString(16);
          var greenString = Math.round(this.green).toString(16);
          var blueString = Math.round(this.blue).toString(16);
          return "#" + (this.red > 15.5 ? redString : "0" + redString) + (this.green > 15.5 ? greenString : "0" + greenString) + (this.blue > 15.5 ? blueString : "0" + blueString);
        };
        var rgbRegex = /^rgb\((\d+), (\d+), (\d+)\)$/;
        var rgbaRegex = /^rgba\((\d+), (\d+), (\d+), (\d*(\.\d+)?)\)/;
        this.parseRgbString = function(colorString) {
          var match = colorString.match(rgbRegex);
          if (match) {
            this.red = parseInt(match[1], 10);
            this.green = parseInt(match[2], 10);
            this.blue = parseInt(match[3], 10);
            this.alpha = 1;
            return;
          }
          match = colorString.match(rgbaRegex);
          if (match) {
            this.red = parseInt(match[1], 10);
            this.green = parseInt(match[2], 10);
            this.blue = parseInt(match[3], 10);
            this.alpha = parseFloat(match[4]);
            return;
          }
        };
        this.getRelativeLuminance = function() {
          var rSRGB = this.red / 255;
          var gSRGB = this.green / 255;
          var bSRGB = this.blue / 255;
          var r = rSRGB <= .03928 ? rSRGB / 12.92 : Math.pow((rSRGB + .055) / 1.055, 2.4);
          var g = gSRGB <= .03928 ? gSRGB / 12.92 : Math.pow((gSRGB + .055) / 1.055, 2.4);
          var b = bSRGB <= .03928 ? bSRGB / 12.92 : Math.pow((bSRGB + .055) / 1.055, 2.4);
          return .2126 * r + .7152 * g + .0722 * b;
        };
      };
      color.flattenColors = function(fgColor, bgColor) {
        var alpha = fgColor.alpha;
        var r = (1 - alpha) * bgColor.red + alpha * fgColor.red;
        var g = (1 - alpha) * bgColor.green + alpha * fgColor.green;
        var b = (1 - alpha) * bgColor.blue + alpha * fgColor.blue;
        var a = fgColor.alpha + bgColor.alpha * (1 - fgColor.alpha);
        return new color.Color(r, g, b, a);
      };
      color.getContrast = function(bgColor, fgColor) {
        if (!fgColor || !bgColor) {
          return null;
        }
        if (fgColor.alpha < 1) {
          fgColor = color.flattenColors(fgColor, bgColor);
        }
        var bL = bgColor.getRelativeLuminance();
        var fL = fgColor.getRelativeLuminance();
        return (Math.max(fL, bL) + .05) / (Math.min(fL, bL) + .05);
      };
      color.hasValidContrastRatio = function(bg, fg, fontSize, isBold) {
        var contrast = color.getContrast(bg, fg);
        var isSmallFont = isBold && Math.ceil(fontSize * 72) / 96 < 14 || !isBold && Math.ceil(fontSize * 72) / 96 < 18;
        return {
          isValid: isSmallFont && contrast >= 4.5 || !isSmallFont && contrast >= 3,
          contrastRatio: contrast
        };
      };
      function getBackgroundForSingleNode(node) {
        var bgColor, nodeStyle = window.getComputedStyle(node);
        if (nodeStyle.getPropertyValue("background-image") !== "none") {
          return null;
        }
        var bgColorString = nodeStyle.getPropertyValue("background-color");
        if (bgColorString === "transparent") {
          bgColor = new color.Color(0, 0, 0, 0);
        } else {
          bgColor = new color.Color();
          bgColor.parseRgbString(bgColorString);
        }
        var opacity = nodeStyle.getPropertyValue("opacity");
        bgColor.alpha = bgColor.alpha * opacity;
        return bgColor;
      }
      dom.isOpaque = function(node) {
        var bgColor = getBackgroundForSingleNode(node);
        if (bgColor === null || bgColor.alpha === 1) {
          return true;
        }
        return false;
      };
      var getVisualParents = function(node, rect) {
        var visualParents, thisIndex, parents = [], fallbackToVisual = false, currentNode = node, nodeStyle = window.getComputedStyle(currentNode), posVal, topVal, bottomVal, leftVal, rightVal;
        while (currentNode !== null && (!dom.isOpaque(currentNode) || parseInt(nodeStyle.getPropertyValue("height"), 10) === 0)) {
          posVal = nodeStyle.getPropertyValue("position");
          topVal = nodeStyle.getPropertyValue("top");
          bottomVal = nodeStyle.getPropertyValue("bottom");
          leftVal = nodeStyle.getPropertyValue("left");
          rightVal = nodeStyle.getPropertyValue("right");
          if (posVal !== "static" && posVal !== "relative" || posVal === "relative" && (leftVal !== "auto" || rightVal !== "auto" || topVal !== "auto" || bottomVal !== "auto")) {
            fallbackToVisual = true;
          }
          currentNode = currentNode.parentElement;
          if (currentNode !== null) {
            nodeStyle = window.getComputedStyle(currentNode);
            if (parseInt(nodeStyle.getPropertyValue("height"), 10) !== 0) {
              parents.push(currentNode);
            }
          }
        }
        if (fallbackToVisual && dom.supportsElementsFromPoint(document)) {
          visualParents = dom.elementsFromPoint(document, Math.ceil(rect.left + 1), Math.ceil(rect.top + 1));
          thisIndex = visualParents.indexOf(node);
          if (thisIndex === -1) {
            return null;
          }
          if (visualParents && thisIndex < visualParents.length - 1) {
            parents = visualParents.slice(thisIndex + 1);
          }
        }
        return parents;
      };
      color.getBackgroundColor = function(node, bgNodes) {
        var parent, parentColor;
        var bgColor = getBackgroundForSingleNode(node);
        if (bgNodes && (bgColor === null || bgColor.alpha !== 0)) {
          bgNodes.push(node);
        }
        if (bgColor === null || bgColor.alpha === 1) {
          return bgColor;
        }
        node.scrollIntoView();
        var rect = node.getBoundingClientRect(), currentNode = node, colorStack = [ {
          color: bgColor,
          node: node
        } ], parents = getVisualParents(currentNode, rect);
        if (!parents) {
          return null;
        }
        while (bgColor.alpha !== 1) {
          parent = parents.shift();
          if (!parent && currentNode.tagName !== "HTML") {
            return null;
          }
          if (!parent && currentNode.tagName === "HTML") {
            parentColor = new color.Color(255, 255, 255, 1);
          } else {
            if (!dom.visuallyContains(node, parent)) {
              return null;
            }
            parentColor = getBackgroundForSingleNode(parent);
            if (bgNodes && (parentColor === null || parentColor.alpha !== 0)) {
              bgNodes.push(parent);
            }
            if (parentColor === null) {
              return null;
            }
          }
          currentNode = parent;
          bgColor = parentColor;
          colorStack.push({
            color: bgColor,
            node: currentNode
          });
        }
        var currColorNode = colorStack.pop();
        var flattenedColor = currColorNode.color;
        while ((currColorNode = colorStack.pop()) !== undefined) {
          flattenedColor = color.flattenColors(currColorNode.color, flattenedColor);
        }
        return flattenedColor;
      };
      color.getForegroundColor = function(node) {
        var nodeStyle = window.getComputedStyle(node);
        var fgColor = new color.Color();
        fgColor.parseRgbString(nodeStyle.getPropertyValue("color"));
        var opacity = nodeStyle.getPropertyValue("opacity");
        fgColor.alpha = fgColor.alpha * opacity;
        if (fgColor.alpha === 1) {
          return fgColor;
        }
        var bgColor = color.getBackgroundColor(node);
        if (bgColor === null) {
          return null;
        }
        return color.flattenColors(fgColor, bgColor);
      };
      dom.supportsElementsFromPoint = function(doc) {
        var element = doc.createElement("x");
        element.style.cssText = "pointer-events:auto";
        return element.style.pointerEvents === "auto" || !!doc.msElementsFromPoint;
      };
      dom.elementsFromPoint = function(doc, x, y) {
        var elements = [], previousPointerEvents = [], current, i, d;
        if (doc.msElementsFromPoint) {
          var nl = doc.msElementsFromPoint(x, y);
          return nl ? Array.prototype.slice.call(nl) : null;
        }
        while ((current = doc.elementFromPoint(x, y)) && elements.indexOf(current) === -1 && current !== null) {
          elements.push(current);
          previousPointerEvents.push({
            value: current.style.getPropertyValue("pointer-events"),
            priority: current.style.getPropertyPriority("pointer-events")
          });
          current.style.setProperty("pointer-events", "none", "important");
          if (dom.isOpaque(current)) {
            break;
          }
        }
        for (i = previousPointerEvents.length; !!(d = previousPointerEvents[--i]); ) {
          elements[i].style.setProperty("pointer-events", d.value ? d.value : "", d.priority);
        }
        return elements;
      };
      dom.findUp = function(element, target) {
        "use strict";
        var parent, matches = document.querySelectorAll(target), length = matches.length;
        if (!length) {
          return null;
        }
        matches = utils.toArray(matches);
        parent = element.parentNode;
        while (parent && matches.indexOf(parent) === -1) {
          parent = parent.parentNode;
        }
        return parent;
      };
      dom.getElementByReference = function(node, attr) {
        "use strict";
        var candidate, fragment = node.getAttribute(attr), doc = document;
        if (fragment && fragment.charAt(0) === "#") {
          fragment = fragment.substring(1);
          candidate = doc.getElementById(fragment);
          if (candidate) {
            return candidate;
          }
          candidate = doc.getElementsByName(fragment);
          if (candidate.length) {
            return candidate[0];
          }
        }
        return null;
      };
      dom.getElementCoordinates = function(element) {
        "use strict";
        var scrollOffset = dom.getScrollOffset(document), xOffset = scrollOffset.left, yOffset = scrollOffset.top, coords = element.getBoundingClientRect();
        return {
          top: coords.top + yOffset,
          right: coords.right + xOffset,
          bottom: coords.bottom + yOffset,
          left: coords.left + xOffset,
          width: coords.right - coords.left,
          height: coords.bottom - coords.top
        };
      };
      dom.getScrollOffset = function(element) {
        "use strict";
        if (!element.nodeType && element.document) {
          element = element.document;
        }
        if (element.nodeType === 9) {
          var docElement = element.documentElement, body = element.body;
          return {
            left: docElement && docElement.scrollLeft || body && body.scrollLeft || 0,
            top: docElement && docElement.scrollTop || body && body.scrollTop || 0
          };
        }
        return {
          left: element.scrollLeft,
          top: element.scrollTop
        };
      };
      dom.getViewportSize = function(win) {
        "use strict";
        var body, doc = win.document, docElement = doc.documentElement;
        if (win.innerWidth) {
          return {
            width: win.innerWidth,
            height: win.innerHeight
          };
        }
        if (docElement) {
          return {
            width: docElement.clientWidth,
            height: docElement.clientHeight
          };
        }
        body = doc.body;
        return {
          width: body.clientWidth,
          height: body.clientHeight
        };
      };
      dom.idrefs = function(node, attr) {
        "use strict";
        var index, length, doc = document, result = [], idrefs = node.getAttribute(attr);
        if (idrefs) {
          idrefs = utils.tokenList(idrefs);
          for (index = 0, length = idrefs.length; index < length; index++) {
            result.push(doc.getElementById(idrefs[index]));
          }
        }
        return result;
      };
      dom.isFocusable = function(el) {
        "use strict";
        if (!el || el.disabled || !dom.isVisible(el) && el.nodeName !== "AREA") {
          return false;
        }
        switch (el.nodeName) {
         case "A":
         case "AREA":
          if (el.href) {
            return true;
          }
          break;

         case "INPUT":
          return el.type !== "hidden";

         case "TEXTAREA":
         case "SELECT":
         case "DETAILS":
         case "BUTTON":
          return true;
        }
        var tabindex = el.getAttribute("tabindex");
        if (tabindex && !isNaN(parseInt(tabindex, 10))) {
          return true;
        }
        return false;
      };
      dom.isHTML5 = function(doc) {
        var node = doc.doctype;
        if (node === null) {
          return false;
        }
        return node.name === "html" && !node.publicId && !node.systemId;
      };
      dom.isNode = function(candidate) {
        "use strict";
        return candidate instanceof Node;
      };
      dom.isOffscreen = function(element) {
        "use strict";
        var leftBoundary, docElement = document.documentElement, dir = window.getComputedStyle(document.body || docElement).getPropertyValue("direction"), coords = dom.getElementCoordinates(element);
        if (coords.bottom < 0) {
          return true;
        }
        if (dir === "ltr") {
          if (coords.right < 0) {
            return true;
          }
        } else {
          leftBoundary = Math.max(docElement.scrollWidth, dom.getViewportSize(window).width);
          if (coords.left > leftBoundary) {
            return true;
          }
        }
        return false;
      };
      function isClipped(clip) {
        "use strict";
        var matches = clip.match(/rect\s*\(([0-9]+)px,?\s*([0-9]+)px,?\s*([0-9]+)px,?\s*([0-9]+)px\s*\)/);
        if (matches && matches.length === 5) {
          return matches[3] - matches[1] <= 0 && matches[2] - matches[4] <= 0;
        }
        return false;
      }
      dom.isVisible = function(el, screenReader, recursed) {
        "use strict";
        var style, nodeName = el.nodeName, parent = el.parentNode;
        if (el.nodeType === 9) {
          return true;
        }
        style = window.getComputedStyle(el, null);
        if (style === null) {
          return false;
        }
        if (style.getPropertyValue("display") === "none" || nodeName === "STYLE" || nodeName === "SCRIPT" || !screenReader && isClipped(style.getPropertyValue("clip")) || !recursed && (style.getPropertyValue("visibility") === "hidden" || !screenReader && dom.isOffscreen(el)) || screenReader && el.getAttribute("aria-hidden") === "true") {
          return false;
        }
        if (parent) {
          return dom.isVisible(parent, screenReader, true);
        }
        return false;
      };
      dom.isVisualContent = function(candidate) {
        "use strict";
        switch (candidate.tagName.toUpperCase()) {
         case "IMG":
         case "IFRAME":
         case "OBJECT":
         case "VIDEO":
         case "AUDIO":
         case "CANVAS":
         case "SVG":
         case "MATH":
         case "BUTTON":
         case "SELECT":
         case "TEXTAREA":
         case "KEYGEN":
         case "PROGRESS":
         case "METER":
          return true;

         case "INPUT":
          return candidate.type !== "hidden";

         default:
          return false;
        }
      };
      dom.visuallyContains = function(node, parent) {
        var rect = node.getBoundingClientRect();
        var parentRect = parent.getBoundingClientRect();
        var parentTop = parentRect.top;
        var parentLeft = parentRect.left;
        var parentScrollArea = {
          top: parentTop - parent.scrollTop,
          bottom: parentTop - parent.scrollTop + parent.scrollHeight,
          left: parentLeft - parent.scrollLeft,
          right: parentLeft - parent.scrollLeft + parent.scrollWidth
        };
        if (rect.left < parentScrollArea.left && rect.left < parentRect.left || rect.top < parentScrollArea.top && rect.top < parentRect.top || rect.right > parentScrollArea.right && rect.right > parentRect.right || rect.bottom > parentScrollArea.bottom && rect.bottom > parentRect.bottom) {
          return false;
        }
        var style = window.getComputedStyle(parent);
        if (rect.right > parentRect.right || rect.bottom > parentRect.bottom) {
          return style.overflow === "scroll" || style.overflow === "auto" || style.overflow === "hidden" || parent instanceof HTMLBodyElement || parent instanceof HTMLHtmlElement;
        }
        return true;
      };
      dom.visuallyOverlaps = function(rect, parent) {
        var parentRect = parent.getBoundingClientRect();
        var parentTop = parentRect.top;
        var parentLeft = parentRect.left;
        var parentScrollArea = {
          top: parentTop - parent.scrollTop,
          bottom: parentTop - parent.scrollTop + parent.scrollHeight,
          left: parentLeft - parent.scrollLeft,
          right: parentLeft - parent.scrollLeft + parent.scrollWidth
        };
        if (rect.left > parentScrollArea.right && rect.left > parentRect.right || rect.top > parentScrollArea.bottom && rect.top > parentRect.bottom || rect.right < parentScrollArea.left && rect.right < parentRect.left || rect.bottom < parentScrollArea.top && rect.bottom < parentRect.top) {
          return false;
        }
        var style = window.getComputedStyle(parent);
        if (rect.left > parentRect.right || rect.top > parentRect.bottom) {
          return style.overflow === "scroll" || style.overflow === "auto" || parent instanceof HTMLBodyElement || parent instanceof HTMLHtmlElement;
        }
        return true;
      };
      table.getCellPosition = function(cell) {
        var tbl = table.toArray(dom.findUp(cell, "table")), index;
        for (var rowIndex = 0; rowIndex < tbl.length; rowIndex++) {
          if (tbl[rowIndex]) {
            index = tbl[rowIndex].indexOf(cell);
            if (index !== -1) {
              return {
                x: index,
                y: rowIndex
              };
            }
          }
        }
      };
      table.getHeaders = function(cell) {
        if (cell.getAttribute("headers")) {
          return commons.dom.idrefs(cell, "headers");
        }
        var headers = [], currentCell, tbl = commons.table.toArray(commons.dom.findUp(cell, "table")), position = commons.table.getCellPosition(cell);
        for (var x = position.x - 1; x >= 0; x--) {
          currentCell = tbl[position.y][x];
          if (commons.table.isRowHeader(currentCell)) {
            headers.unshift(currentCell);
          }
        }
        for (var y = position.y - 1; y >= 0; y--) {
          currentCell = tbl[y][position.x];
          if (currentCell && commons.table.isColumnHeader(currentCell)) {
            headers.unshift(currentCell);
          }
        }
        return headers;
      };
      table.isColumnHeader = function(node) {
        var scope = node.getAttribute("scope");
        if (scope === "col") {
          return true;
        } else {
          if (scope || node.nodeName !== "TH") {
            return false;
          }
        }
        var currentCell, position = table.getCellPosition(node), tbl = table.toArray(dom.findUp(node, "table")), cells = tbl[position.y];
        for (var cellIndex = 0, cellLength = cells.length; cellIndex < cellLength; cellIndex++) {
          currentCell = cells[cellIndex];
          if (currentCell !== node) {
            if (table.isDataCell(currentCell)) {
              return false;
            }
          }
        }
        return true;
      };
      table.isDataCell = function(cell) {
        if (!cell.children.length && !cell.textContent.trim()) {
          return false;
        }
        return cell.nodeName === "TD";
      };
      table.isDataTable = function(node) {
        var role = node.getAttribute("role");
        if ((role === "presentation" || role === "none") && !dom.isFocusable(node)) {
          return false;
        }
        if (node.getAttribute("contenteditable") === "true" || dom.findUp(node, '[contenteditable="true"]')) {
          return true;
        }
        if (role === "grid" || role === "treegrid" || role === "table") {
          return true;
        }
        if (commons.aria.getRoleType(role) === "landmark") {
          return true;
        }
        if (node.getAttribute("datatable") === "0") {
          return false;
        }
        if (node.getAttribute("summary")) {
          return true;
        }
        if (node.tHead || node.tFoot || node.caption) {
          return true;
        }
        for (var childIndex = 0, childLength = node.children.length; childIndex < childLength; childIndex++) {
          if (node.children[childIndex].nodeName === "COLGROUP") {
            return true;
          }
        }
        var cells = 0;
        var rowLength = node.rows.length;
        var row, cell;
        var hasBorder = false;
        for (var rowIndex = 0; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          for (var cellIndex = 0, cellLength = row.cells.length; cellIndex < cellLength; cellIndex++) {
            cell = row.cells[cellIndex];
            if (!hasBorder && (cell.offsetWidth !== cell.clientWidth || cell.offsetHeight !== cell.clientHeight)) {
              hasBorder = true;
            }
            if (cell.getAttribute("scope") || cell.getAttribute("headers") || cell.getAttribute("abbr")) {
              return true;
            }
            if (cell.nodeName === "TH") {
              return true;
            }
            if (cell.children.length === 1 && cell.children[0].nodeName === "ABBR") {
              return true;
            }
            cells++;
          }
        }
        if (node.getElementsByTagName("table").length) {
          return false;
        }
        if (rowLength < 2) {
          return false;
        }
        var sampleRow = node.rows[Math.ceil(rowLength / 2)];
        if (sampleRow.cells.length === 1 && sampleRow.cells[0].colSpan === 1) {
          return false;
        }
        if (sampleRow.cells.length >= 5) {
          return true;
        }
        if (hasBorder) {
          return true;
        }
        var bgColor, bgImage;
        for (rowIndex = 0; rowIndex < rowLength; rowIndex++) {
          row = node.rows[rowIndex];
          if (bgColor && bgColor !== window.getComputedStyle(row).getPropertyValue("background-color")) {
            return true;
          } else {
            bgColor = window.getComputedStyle(row).getPropertyValue("background-color");
          }
          if (bgImage && bgImage !== window.getComputedStyle(row).getPropertyValue("background-image")) {
            return true;
          } else {
            bgImage = window.getComputedStyle(row).getPropertyValue("background-image");
          }
        }
        if (rowLength >= 20) {
          return true;
        }
        if (dom.getElementCoordinates(node).width > dom.getViewportSize(window).width * .95) {
          return false;
        }
        if (cells < 10) {
          return false;
        }
        if (node.querySelector("object, embed, iframe, applet")) {
          return false;
        }
        return true;
      };
      table.isHeader = function(cell) {
        if (table.isColumnHeader(cell) || table.isRowHeader(cell)) {
          return true;
        }
        if (cell.id) {
          return !!document.querySelector('[headers~="' + utils.escapeSelector(cell.id) + '"]');
        }
        return false;
      };
      table.isRowHeader = function(node) {
        var scope = node.getAttribute("scope");
        if (scope === "row") {
          return true;
        } else {
          if (scope || node.nodeName !== "TH") {
            return false;
          }
        }
        if (table.isColumnHeader(node)) {
          return false;
        }
        var currentCell, position = table.getCellPosition(node), tbl = table.toArray(dom.findUp(node, "table"));
        for (var rowIndex = 0, rowLength = tbl.length; rowIndex < rowLength; rowIndex++) {
          currentCell = tbl[rowIndex][position.x];
          if (currentCell !== node) {
            if (table.isDataCell(currentCell)) {
              return false;
            }
          }
        }
        return true;
      };
      table.toArray = function(node) {
        var table = [];
        var rows = node.rows;
        for (var i = 0, rowLength = rows.length; i < rowLength; i++) {
          var cells = rows[i].cells;
          table[i] = table[i] || [];
          var columnIndex = 0;
          for (var j = 0, cellLength = cells.length; j < cellLength; j++) {
            for (var colSpan = 0; colSpan < cells[j].colSpan; colSpan++) {
              for (var rowSpan = 0; rowSpan < cells[j].rowSpan; rowSpan++) {
                table[i + rowSpan] = table[i + rowSpan] || [];
                while (table[i + rowSpan][columnIndex]) {
                  columnIndex++;
                }
                table[i + rowSpan][columnIndex] = cells[j];
              }
              columnIndex++;
            }
          }
        }
        return table;
      };
      var defaultButtonValues = {
        submit: "Submit",
        reset: "Reset"
      };
      var inputTypes = [ "text", "search", "tel", "url", "email", "date", "time", "number", "range", "color" ];
      var phrasingElements = [ "a", "em", "strong", "small", "mark", "abbr", "dfn", "i", "b", "s", "u", "code", "var", "samp", "kbd", "sup", "sub", "q", "cite", "span", "bdo", "bdi", "br", "wbr", "ins", "del", "img", "embed", "object", "iframe", "map", "area", "script", "noscript", "ruby", "video", "audio", "input", "textarea", "select", "button", "label", "output", "datalist", "keygen", "progress", "command", "canvas", "time", "meter" ];
      function findLabel(element) {
        var ref = null;
        if (element.id) {
          ref = document.querySelector('label[for="' + utils.escapeSelector(element.id) + '"]');
          if (ref) {
            return ref;
          }
        }
        ref = dom.findUp(element, "label");
        return ref;
      }
      function isButton(element) {
        return [ "button", "reset", "submit" ].indexOf(element.type) !== -1;
      }
      function isInput(element) {
        return element.nodeName === "TEXTAREA" || element.nodeName === "SELECT" || element.nodeName === "INPUT" && element.type !== "hidden";
      }
      function shouldCheckSubtree(element) {
        return [ "BUTTON", "SUMMARY", "A" ].indexOf(element.nodeName) !== -1;
      }
      function shouldNeverCheckSubtree(element) {
        return [ "TABLE", "FIGURE" ].indexOf(element.nodeName) !== -1;
      }
      function formValueText(element) {
        if (element.nodeName === "INPUT") {
          if (!element.hasAttribute("type") || inputTypes.indexOf(element.getAttribute("type")) !== -1 && element.value) {
            return element.value;
          }
          return "";
        }
        if (element.nodeName === "SELECT") {
          var opts = element.options;
          if (opts && opts.length) {
            var returnText = "";
            for (var i = 0; i < opts.length; i++) {
              if (opts[i].selected) {
                returnText += " " + opts[i].text;
              }
            }
            return text.sanitize(returnText);
          }
          return "";
        }
        if (element.nodeName === "TEXTAREA" && element.value) {
          return element.value;
        }
        return "";
      }
      function checkDescendant(element, nodeName) {
        var candidate = element.querySelector(nodeName);
        if (candidate) {
          return text.accessibleText(candidate);
        }
        return "";
      }
      function isEmbeddedControl(e) {
        if (!e) {
          return false;
        }
        switch (e.nodeName) {
         case "SELECT":
         case "TEXTAREA":
          return true;

         case "INPUT":
          return !e.hasAttribute("type") || inputTypes.indexOf(e.getAttribute("type")) !== -1;

         default:
          return false;
        }
      }
      function shouldCheckAlt(element) {
        return element.nodeName === "INPUT" && element.type === "image" || [ "IMG", "APPLET", "AREA" ].indexOf(element.nodeName) !== -1;
      }
      function nonEmptyText(t) {
        return !!text.sanitize(t);
      }
      text.accessibleText = function(element) {
        function checkNative(element, inLabelledByContext, inControlContext) {
          var returnText = "";
          if (shouldCheckSubtree(element)) {
            returnText = getInnerText(element, false, false) || "";
            if (nonEmptyText(returnText)) {
              return returnText;
            }
          }
          if (element.nodeName === "FIGURE") {
            returnText = checkDescendant(element, "figcaption");
            if (nonEmptyText(returnText)) {
              return returnText;
            }
          }
          if (element.nodeName === "TABLE") {
            returnText = checkDescendant(element, "caption");
            if (nonEmptyText(returnText)) {
              return returnText;
            }
            returnText = element.getAttribute("title") || element.getAttribute("summary") || "";
            if (nonEmptyText(returnText)) {
              return returnText;
            }
          }
          if (shouldCheckAlt(element)) {
            return element.getAttribute("alt") || "";
          }
          if (isInput(element) && !inControlContext) {
            if (isButton(element)) {
              return element.value || element.title || defaultButtonValues[element.type] || "";
            }
            var labelElement = findLabel(element);
            if (labelElement) {
              return accessibleNameComputation(labelElement, inLabelledByContext, true);
            }
          }
          return "";
        }
        function checkARIA(element, inLabelledByContext, inControlContext) {
          if (!inLabelledByContext && element.hasAttribute("aria-labelledby")) {
            return text.sanitize(dom.idrefs(element, "aria-labelledby").map(function(l) {
              if (element === l) {
                encounteredNodes.pop();
              }
              return accessibleNameComputation(l, true, element !== l);
            }).join(" "));
          }
          if (!(inControlContext && isEmbeddedControl(element)) && element.hasAttribute("aria-label")) {
            return text.sanitize(element.getAttribute("aria-label"));
          }
          return "";
        }
        function getInnerText(element, inLabelledByContext, inControlContext) {
          var nodes = element.childNodes;
          var returnText = "";
          var node;
          for (var i = 0; i < nodes.length; i++) {
            node = nodes[i];
            if (node.nodeType === 3) {
              returnText += node.textContent;
            } else {
              if (node.nodeType === 1) {
                if (phrasingElements.indexOf(node.nodeName.toLowerCase()) === -1) {
                  returnText += " ";
                }
                returnText += accessibleNameComputation(nodes[i], inLabelledByContext, inControlContext);
              }
            }
          }
          return returnText;
        }
        var encounteredNodes = [];
        function accessibleNameComputation(element, inLabelledByContext, inControlContext) {
          "use strict";
          var returnText = "";
          if (element === null || !dom.isVisible(element, true) || encounteredNodes.indexOf(element) !== -1) {
            return "";
          }
          encounteredNodes.push(element);
          var role = element.getAttribute("role");
          returnText += checkARIA(element, inLabelledByContext, inControlContext);
          if (nonEmptyText(returnText)) {
            return returnText;
          }
          returnText = checkNative(element, inLabelledByContext, inControlContext);
          if (nonEmptyText(returnText)) {
            return returnText;
          }
          if (inControlContext) {
            returnText += formValueText(element);
            if (nonEmptyText(returnText)) {
              return returnText;
            }
          }
          if (!shouldNeverCheckSubtree(element) && (!role || aria.getRolesWithNameFromContents().indexOf(role) !== -1)) {
            returnText = getInnerText(element, inLabelledByContext, inControlContext);
            if (nonEmptyText(returnText)) {
              return returnText;
            }
          }
          if (element.hasAttribute("title")) {
            return element.getAttribute("title");
          }
          return "";
        }
        return text.sanitize(accessibleNameComputation(element));
      };
      text.label = function(node) {
        var ref, candidate;
        candidate = aria.label(node);
        if (candidate) {
          return candidate;
        }
        if (node.id) {
          ref = document.querySelector('label[for="' + utils.escapeSelector(node.id) + '"]');
          candidate = ref && text.visible(ref, true);
          if (candidate) {
            return candidate;
          }
        }
        ref = dom.findUp(node, "label");
        candidate = ref && text.visible(ref, true);
        if (candidate) {
          return candidate;
        }
        return null;
      };
      text.sanitize = function(str) {
        "use strict";
        return str.replace(/\r\n/g, "\n").replace(/\u00A0/g, " ").replace(/[\s]{2,}/g, " ").trim();
      };
      text.visible = function(element, screenReader, noRecursing) {
        "use strict";
        var index, child, nodeValue, childNodes = element.childNodes, length = childNodes.length, result = "";
        for (index = 0; index < length; index++) {
          child = childNodes[index];
          if (child.nodeType === 3) {
            nodeValue = child.nodeValue;
            if (nodeValue && dom.isVisible(element, screenReader)) {
              result += child.nodeValue;
            }
          } else {
            if (!noRecursing) {
              result += text.visible(child, screenReader);
            }
          }
        }
        return text.sanitize(result);
      };
      utils.toArray = function(thing) {
        "use strict";
        return Array.prototype.slice.call(thing);
      };
      utils.tokenList = function(str) {
        "use strict";
        return str.trim().replace(/\s{2,}/g, " ").split(" ");
      };
      return commons;
    }()
  });
  axe.version = "1.1.1";
})(window, window.document);
/* jshint unused:false */
/* global base64_decode, CSSWizardView, window, console, jQuery */
(function(global) {
  'use strict';
  var fi = function() {

    this.cssImportStatements = [];
    this.cssKeyframeStatements = [];

    this.cssRegex = new RegExp('([\\s\\S]*?){([\\s\\S]*?)}', 'gi');
    this.cssMediaQueryRegex = '((@media [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
    this.cssKeyframeRegex = '((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
    this.combinedCSSRegex = '((\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})'; //to match css & media queries together
    this.cssCommentsRegex = '(\\/\\*[\\s\\S]*?\\*\\/)';
    this.cssImportStatementRegex = new RegExp('@import .*?;', 'gi');
  };

  /*
    Strip outs css comments and returns cleaned css string

    @param css, the original css string to be stipped out of comments

    @return cleanedCSS contains no css comments
  */
  fi.prototype.stripComments = function(cssString) {
    var regex = new RegExp(this.cssCommentsRegex, 'gi');

    return cssString.replace(regex, '');
  };

  /*
    Parses given css string, and returns css object
    keys as selectors and values are css rules
    eliminates all css comments before parsing

    @param source css string to be parsed

    @return object css
  */
  fi.prototype.parseCSS = function(source) {

    if (source === undefined) {
      return [];
    }

    var css = [];
    //strip out comments
    //source = this.stripComments(source);

    //get import statements

    while (true) {
      var imports = this.cssImportStatementRegex.exec(source);
      if (imports !== null) {
        this.cssImportStatements.push(imports[0]);
        css.push({
          selector: '@imports',
          type: 'imports',
          styles: imports[0]
        });
      } else {
        break;
      }
    }
    source = source.replace(this.cssImportStatementRegex, '');
    //get keyframe statements
    var keyframesRegex = new RegExp(this.cssKeyframeRegex, 'gi');
    var arr;
    while (true) {
      arr = keyframesRegex.exec(source);
      if (arr === null) {
        break;
      }
      css.push({
        selector: '@keyframes',
        type: 'keyframes',
        styles: arr[0]
      });
    }
    source = source.replace(keyframesRegex, '');

    //unified regex
    var unified = new RegExp(this.combinedCSSRegex, 'gi');

    while (true) {
      arr = unified.exec(source);
      if (arr === null) {
        break;
      }
      var selector = '';
      if (arr[2] === undefined) {
        selector = arr[5].split('\r\n').join('\n').trim();
      } else {
        selector = arr[2].split('\r\n').join('\n').trim();
      }

      /*
        fetch comments and associate it with current selector
      */
      var commentsRegex = new RegExp(this.cssCommentsRegex, 'gi');
      var comments = commentsRegex.exec(selector);
      if (comments !== null) {
        selector = selector.replace(commentsRegex, '').trim();
      }

      //determine the type
      if (selector.indexOf('@media') !== -1) {
        //we have a media query
        var cssObject = {
          selector: selector,
          type: 'media',
          subStyles: this.parseCSS(arr[3] + '\n}') //recursively parse media query inner css
        };
        if (comments !== null) {
          cssObject.comments = comments[0];
        }
        css.push(cssObject);
      } else {
        //we have standart css
        var rules = this.parseRules(arr[6]);
        var style = {
          selector: selector,
          rules: rules
        };
        if (selector === '@font-face') {
          style.type = 'font-face';
        }
        if (comments !== null) {
          style.comments = comments[0];
        }
        css.push(style);
      }
    }

    return css;
  };

  /*
    parses given string containing css directives
    and returns an array of objects containing ruleName:ruleValue pairs

    @param rules, css directive string example
        \n\ncolor:white;\n    font-size:18px;\n
  */
  fi.prototype.parseRules = function(rules) {
    //convert all windows style line endings to unix style line endings
    rules = rules.split('\r\n').join('\n');
    var ret = [];

    rules = rules.split(';');

    //proccess rules line by line
    for (var i = 0; i < rules.length; i++) {
      var line = rules[i];

      //determine if line is a valid css directive, ie color:white;
      line = line.trim();
      if (line.indexOf(':') !== -1) {
        //line contains :
        line = line.split(':');
        var cssDirective = line[0].trim();
        var cssValue = line.slice(1).join(':').trim();

        //more checks
        if (cssDirective.length < 1 || cssValue.length < 1) {
          continue; //there is no css directive or value that is of length 1 or 0
          // PLAIN WRONG WHAT ABOUT margin:0; ?
        }

        //push rule
        ret.push({
          directive: cssDirective,
          value: cssValue
        });
      } else {
        //if there is no ':', but what if it was mis splitted value which starts with base64
        if (line.trim().substr(0, 7) == 'base64,') { //hack :)
          ret[ret.length - 1].value += line.trim();
        } else {
          //add rule, even if it is defective
          if (line.length > 0) {
            ret.push({
              directive: '',
              value: line,
              defective: true
            });
          }
        }
      }
    }

    return ret; //we are done!
  };
  /*
    just returns the rule having given directive
    if not found returns false;
  */
  fi.prototype.findCorrespondingRule = function(rules, directive, value) {
    if (value === undefined) {
      value = false;
    }
    var ret = false;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].directive == directive) {
        ret = rules[i];
        if (value === rules[i].value) {
          break;
        }
      }
    }
    return ret;
  };

  /*
      Finds styles that have given selector, compress them,
      and returns them
  */
  fi.prototype.findBySelector = function(cssObjectArray, selector, contains) {
    if (contains === undefined) {
      contains = false;
    }

    var found = [];
    for (var i = 0; i < cssObjectArray.length; i++) {
      if (contains === false) {
        if (cssObjectArray[i].selector === selector) {
          found.push(cssObjectArray[i]);
        }
      } else {
        if (cssObjectArray[i].selector.indexOf(selector) !== -1) {
          found.push(cssObjectArray[i]);
        }
      }

    }
    if (found.length < 2) {
      return found;
    } else {
      var base = found[0];
      for (i = 1; i < found.length; i++) {
        this.intelligentCSSPush([base], found[i]);
      }
      return [base]; //we are done!! all properties merged into base!
    }
  };

  /*
    deletes cssObjects having given selector, and returns new array
  */
  fi.prototype.deleteBySelector = function(cssObjectArray, selector) {
    var ret = [];
    for (var i = 0; i < cssObjectArray.length; i++) {
      if (cssObjectArray[i].selector !== selector) {
        ret.push(cssObjectArray[i]);
      }
    }
    return ret;
  };

  /*
      Compresses given cssObjectArray and tries to minimize
      selector redundence.
  */
  fi.prototype.compressCSS = function(cssObjectArray) {
    var compressed = [];
    var done = {};
    for (var i = 0; i < cssObjectArray.length; i++) {
      var obj = cssObjectArray[i];
      if (done[obj.selector] === true) {
        continue;
      }

      var found = this.findBySelector(cssObjectArray, obj.selector); //found compressed
      if (found.length !== 0) {
        compressed.push(found[0]);
        done[obj.selector] = true;
      }
    }
    return compressed;
  };

  /*
    Received 2 css objects with following structure
      {
        rules : [{directive:"", value:""}, {directive:"", value:""}, ...]
        selector : "SOMESELECTOR"
      }

    returns the changed(new,removed,updated) values on css1 parameter, on same structure

    if two css objects are the same, then returns false
      
      if a css directive exists in css1 and     css2, and its value is different, it is included in diff
      if a css directive exists in css1 and not css2, it is then included in diff
      if a css directive exists in css2 but not css1, then it is deleted in css1, it would be included in diff but will be marked as type='DELETED'

      @object css1 css object
      @object css2 css object

      @return diff css object contains changed values in css1 in regards to css2 see test input output in /test/data/css.js
  */
  fi.prototype.cssDiff = function(css1, css2) {
    if (css1.selector !== css2.selector) {
      return false;
    }

    //if one of them is media query return false, because diff function can not operate on media queries
    if ((css1.type === 'media' || css2.type === 'media')) {
      return false;
    }

    var diff = {
      selector: css1.selector,
      rules: []
    };
    var rule1, rule2;
    for (var i = 0; i < css1.rules.length; i++) {
      rule1 = css1.rules[i];
      //find rule2 which has the same directive as rule1
      rule2 = this.findCorrespondingRule(css2.rules, rule1.directive, rule1.value);
      if (rule2 === false) {
        //rule1 is a new rule in css1
        diff.rules.push(rule1);
      } else {
        //rule2 was found only push if its value is different too
        if (rule1.value !== rule2.value) {
          diff.rules.push(rule1);
        }
      }
    }

    //now for rules exists in css2 but not in css1, which means deleted rules
    for (var ii = 0; ii < css2.rules.length; ii++) {
      rule2 = css2.rules[ii];
      //find rule2 which has the same directive as rule1
      rule1 = this.findCorrespondingRule(css1.rules, rule2.directive);
      if (rule1 === false) {
        //rule1 is a new rule
        rule2.type = 'DELETED'; //mark it as a deleted rule, so that other merge operations could be true
        diff.rules.push(rule2);
      }
    }


    if (diff.rules.length === 0) {
      return false;
    }
    return diff;
  };

  /*
      Merges 2 different css objects together
      using intelligentCSSPush,

      @param cssObjectArray, target css object array
      @param newArray, source array that will be pushed into cssObjectArray parameter
      @param reverse, [optional], if given true, first parameter will be traversed on reversed order
              effectively giving priority to the styles in newArray
  */
  fi.prototype.intelligentMerge = function(cssObjectArray, newArray, reverse) {
    if (reverse === undefined) {
      reverse = false;
    }


    for (var i = 0; i < newArray.length; i++) {
      this.intelligentCSSPush(cssObjectArray, newArray[i], reverse);
    }
    for (i = 0; i < cssObjectArray.length; i++) {
      var cobj = cssObjectArray[i];
      if (cobj.type === 'media' ||  (cobj.type === 'keyframes')) {
        continue;
      }
      cobj.rules = this.compactRules(cobj.rules);
    }
  };

  /*
    inserts new css objects into a bigger css object
    with same selectors groupped together

    @param cssObjectArray, array of bigger css object to be pushed into
    @param minimalObject, single css object
    @param reverse [optional] default is false, if given, cssObjectArray will be reversly traversed
            resulting more priority in minimalObject's styles
  */
  fi.prototype.intelligentCSSPush = function(cssObjectArray, minimalObject, reverse) {
    var pushSelector = minimalObject.selector;
    //find correct selector if not found just push minimalObject into cssObject
    var cssObject = false;

    if (reverse === undefined) {
      reverse = false;
    }

    if (reverse === false) {
      for (var i = 0; i < cssObjectArray.length; i++) {
        if (cssObjectArray[i].selector === minimalObject.selector) {
          cssObject = cssObjectArray[i];
          break;
        }
      }
    } else {
      for (var j = cssObjectArray.length - 1; j > -1; j--) {
        if (cssObjectArray[j].selector === minimalObject.selector) {
          cssObject = cssObjectArray[j];
          break;
        }
      }
    }

    if (cssObject === false) {
      cssObjectArray.push(minimalObject); //just push, because cssSelector is new
    } else {
      if (minimalObject.type !== 'media') {
        for (var ii = 0; ii < minimalObject.rules.length; ii++) {
          var rule = minimalObject.rules[ii];
          //find rule inside cssObject
          var oldRule = this.findCorrespondingRule(cssObject.rules, rule.directive);
          if (oldRule === false) {
            cssObject.rules.push(rule);
          } else if (rule.type == 'DELETED') {
            oldRule.type = 'DELETED';
          } else {
            //rule found just update value

            oldRule.value = rule.value;
          }
        }
      } else {
        cssObject.subStyles = minimalObject.subStyles; //TODO, make this intelligent too
      }

    }
  };

  /*
    filter outs rule objects whose type param equal to DELETED

    @param rules, array of rules

    @returns rules array, compacted by deleting all unneccessary rules
  */
  fi.prototype.compactRules = function(rules) {
    var newRules = [];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].type !== 'DELETED') {
        newRules.push(rules[i]);
      }
    }
    return newRules;
  };
  /*
    computes string for ace editor using this.css or given cssBase optional parameter

    @param [optional] cssBase, if given computes cssString from cssObject array
  */
  fi.prototype.getCSSForEditor = function(cssBase, depth) {
    if (depth === undefined) {
      depth = 0;
    }
    var ret = '';
    if (cssBase === undefined) {
      cssBase = this.css;
    }
    //append imports
    for (var i = 0; i < cssBase.length; i++) {
      if (cssBase[i].type == 'imports') {
        ret += cssBase[i].styles + '\n\n';
      }
    }
    for (i = 0; i < cssBase.length; i++) {
      var tmp = cssBase[i];
      if (tmp.selector === undefined) { //temporarily omit media queries
        continue;
      }
      var comments = "";
      if (tmp.comments !== undefined) {
        comments = tmp.comments + '\n';
      }

      if (tmp.type == 'media') { //also put media queries to output
        ret += comments + tmp.selector + '{\n';
        ret += this.getCSSForEditor(tmp.subStyles, depth + 1);
        ret += '}\n\n';
      } else if (tmp.type !== 'keyframes' && tmp.type !== 'imports') {
        ret += this.getSpaces(depth) + comments + tmp.selector + ' {\n';
        ret += this.getCSSOfRules(tmp.rules, depth + 1);
        ret += this.getSpaces(depth) + '}\n\n';
      }
    }

    //append keyFrames
    for (i = 0; i < cssBase.length; i++) {
      if (cssBase[i].type == 'keyframes') {
        ret += cssBase[i].styles + '\n\n';
      }
    }

    return ret;
  };

  fi.prototype.getImports = function(cssObjectArray) {
    var imps = [];
    for (var i = 0; i < cssObjectArray.length; i++) {
      if (cssObjectArray[i].type == 'imports') {
        imps.push(cssObjectArray[i].styles);
      }
    }
    return imps;
  };
  /*
    given rules array, returns visually formatted css string
    to be used inside editor
  */
  fi.prototype.getCSSOfRules = function(rules, depth) {
    var ret = '';
    for (var i = 0; i < rules.length; i++) {
      if (rules[i] === undefined) {
        continue;
      }
      if (rules[i].defective === undefined) {
        ret += this.getSpaces(depth) + rules[i].directive + ' : ' + rules[i].value + ';\n';
      } else {
        ret += this.getSpaces(depth) + rules[i].value + ';\n';
      }

    }
    return ret || '\n';
  };

  /*
      A very simple helper function returns number of spaces appended in a single string,
      the number depends input parameter, namely input*2
  */
  fi.prototype.getSpaces = function(num) {
    var ret = '';
    for (var i = 0; i < num * 4; i++) {
      ret += ' ';
    }
    return ret;
  };

  /*
    Given css string or objectArray, parses it and then for every selector,
    prepends this.cssPreviewNamespace to prevent css collision issues

    @returns css string in which this.cssPreviewNamespace prepended
  */
  fi.prototype.applyNamespacing = function(css, forcedNamespace) {
    var cssObjectArray = css;
    var namespaceClass = '.' + this.cssPreviewNamespace;
    if(forcedNamespace !== undefined){
      namespaceClass = forcedNamespace;
    }

    if (typeof css === 'string') {
      cssObjectArray = this.parseCSS(css);
    }

    for (var i = 0; i < cssObjectArray.length; i++) {
      var obj = cssObjectArray[i];

      //bypass namespacing for @font-face @keyframes @import
      if(obj.selector.indexOf('@font-face') > -1 || obj.selector.indexOf('keyframes') > -1 || obj.selector.indexOf('@import') > -1 || obj.selector.indexOf('.form-all') > -1 || obj.selector.indexOf('#stage') > -1){
        continue;
      }

      if (obj.type !== 'media') {
        var selector = obj.selector.split(',');
        var newSelector = [];
        for (var j = 0; j < selector.length; j++) {
          if (selector[j].indexOf('.supernova') === -1) { //do not apply namespacing to selectors including supernova
            newSelector.push(namespaceClass + ' ' + selector[j]);
          } else {
            newSelector.push(selector[j]);
          }
        }
        obj.selector = newSelector.join(',');
      } else {
        obj.subStyles = this.applyNamespacing(obj.subStyles, forcedNamespace); //handle media queries as well
      }
    }

    return cssObjectArray;
  };

  /*
    given css string or object array, clears possible namespacing from
    all of the selectors inside the css
  */
  fi.prototype.clearNamespacing = function(css, returnObj) {
    if (returnObj === undefined) {
      returnObj = false;
    }
    var cssObjectArray = css;
    var namespaceClass = '.' + this.cssPreviewNamespace;
    if (typeof css === 'string') {
      cssObjectArray = this.parseCSS(css);
    }

    for (var i = 0; i < cssObjectArray.length; i++) {
      var obj = cssObjectArray[i];

      if (obj.type !== 'media') {
        var selector = obj.selector.split(',');
        var newSelector = [];
        for (var j = 0; j < selector.length; j++) {
          newSelector.push(selector[j].split(namespaceClass + ' ').join(''));
        }
        obj.selector = newSelector.join(',');
      } else {
        obj.subStyles = this.clearNamespacing(obj.subStyles, true); //handle media queries as well
      }
    }
    if (returnObj === false) {
      return this.getCSSForEditor(cssObjectArray);
    } else {
      return cssObjectArray;
    }

  };

  /*
    creates a new style tag (also destroys the previous one)
    and injects given css string into that css tag
  */
  fi.prototype.createStyleElement = function(id, css, format) {
    if (format === undefined) {
      format = false;
    }

    if (this.testMode === false && format!=='nonamespace') {
      //apply namespacing classes
      css = this.applyNamespacing(css);
    }

    if (typeof css != 'string') {
      css = this.getCSSForEditor(css);
    }
    //apply formatting for css
    if (format === true) {
      css = this.getCSSForEditor(this.parseCSS(css));
    }

    if (this.testMode !== false) {
      return this.testMode('create style #' + id, css); //if test mode, just pass result to callback
    }

    var __el = document.getElementById( id );
    if(__el){
      __el.parentNode.removeChild( __el );  
    }

    var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

    style.id = id;
    style.type = 'text/css';

    head.appendChild(style);

    if (style.styleSheet && !style.sheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  };

  global.cssjs = fi;

})(this);

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Accessibility;
            (function (Accessibility) {
                Accessibility.aXeCheck = {
                    id: "accessibility.aXeCheck",
                    title: "Check for accessibility issues",
                    description: "Use the aXe testing library to catch common accessibility issues.",
                    prepare: function (rulecheck, analyzeSummary) {
                        analyzeSummary.pendingLoad++;
                        // Using aXe
                        axe.a11yCheck(document, function (results) {
                            rulecheck.items = [];
                            rulecheck.failed = (results.violations.length > 0);
                            rulecheck.skipRootLevel = rulecheck.failed;
                            for (var index = 0; index < results.violations.length; index++) {
                                var check = results.violations[index];
                                var item = {
                                    description: check.description,
                                    failed: true,
                                    id: check.id,
                                    title: check.help,
                                    type: "blockitems",
                                    items: []
                                };
                                rulecheck.items.push(item);
                                for (var nodeIndex = 0; nodeIndex < check.nodes.length; nodeIndex++) {
                                    var node = check.nodes[nodeIndex];
                                    var nodeEntry = {
                                        title: node.html,
                                        items: []
                                    };
                                    item.items.push(nodeEntry);
                                    for (var anyIndex = 0; anyIndex < node.any.length; anyIndex++) {
                                        nodeEntry.items.push({ title: node.any[anyIndex].message });
                                    }
                                }
                            }
                            analyzeSummary.pendingLoad--;
                        });
                    }
                };
            })(Accessibility = Rules.Accessibility || (Rules.Accessibility = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.deviceIcons = {
                    id: "mobileweb.deviceIcons",
                    title: "Define platform icons",
                    description: "Add platform-specific icons for users who pin your site to the home screen of their mobile device.",
                    nodeTypes: ["meta", "link"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        rulecheck.data = {
                            hasWindowsIcons: false,
                            hasWindowsNotification: false,
                            hasIOSIcons: false
                        };
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        if (node.nodeName == "LINK") {
                            var rel = node.getAttribute("rel");
                            if (rel && rel == "apple-touch-icon-precomposed") {
                                rulecheck.data.hasIOSIcons = true;
                            }
                        }
                        else if (node.nodeName == "META") {
                            var name = node.getAttribute("name");
                            if (name) {
                                if (name.toLowerCase() == "msapplication-notification") {
                                    rulecheck.data.hasWindowsNotification = true;
                                }
                                else if (name.toLowerCase().indexOf("msapplication-") == 0) {
                                    rulecheck.data.hasWindowsIcons = true;
                                }
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        if (!rulecheck.data.hasIOSIcons) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: 'Provide iOS icons by adding link tags, like <link rel="apple-touch-icon" href="youricon" sizes="57x57"" />'
                            });
                        }
                        if (!rulecheck.data.hasWindowsIcons) {
                            rulecheck.failed = true;
                            //https://msdn.microsoft.com/en-us/library/dn255024(v=vs.85).aspx
                            rulecheck.items.push({
                                title: 'Provide Universal Windows Platform (UWP) tiles by adding meta tags, like <link name="msapplication-square150x150logo" content="yourimage" />'
                            });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                CSS.mobileMediaqueries = {
                    id: "mobileweb.usemediaqueries",
                    title: "Use responsive design",
                    description: "Use CSS media queries to tailor your site to a specific range of screen sizes while still supporting less common display ratios.",
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        if (!rulecheck.data) {
                            rulecheck.data = {
                                cssnbqueries: 0,
                                domnbqueries: 0
                            };
                        }
                    },
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        //console.log("check css prefixes");
                        this.checkNodes(url, rulecheck, ast);
                    },
                    checkNodes: function (url, rulecheck, ast) {
                        if (!ast)
                            return;
                        ast.forEach(function (node, i) {
                            var nodeitem = null;
                            //scan content for media queries
                            if (node.type === "media") {
                                var media = node.selector;
                                if (media) {
                                    media = media.toLowerCase();
                                    if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0) {
                                        rulecheck.data.cssnbqueries++;
                                    }
                                }
                            }
                        });
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                    }
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.mobileMediaqueries = {
                    id: "mobileweb.usemediaqueries",
                    title: "Use responsive approaches",
                    description: "Use CSS media queries to tailor your site to a specific range of screen sizes while still supporting less common display ratios.",
                    nodeTypes: ["link"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        if (!rulecheck.data) {
                            rulecheck.data = {
                                cssnbqueries: 0,
                                domnbqueries: 0
                            };
                        }
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlstring) {
                        if (!node.getAttribute)
                            return;
                        var rel = node.getAttribute("rel");
                        if (rel && rel.toLocaleLowerCase() == "stylesheet") {
                            var media = node.getAttribute("media");
                            if (media) {
                                media = media.toLowerCase();
                                if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0) {
                                    rulecheck.data.domnbqueries++;
                                }
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("media queries css:" + rulecheck.cssnbqueries + ", dom:" + rulecheck.domnbqueries);
                        if (rulecheck.data.cssnbqueries == 0 && rulecheck.data.domnbqueries == 0) {
                            if (rulecheck.data.cssnbqueries == 0) {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: 'your css (either files or inline) does not use any media queries'
                                });
                            }
                            if (rulecheck.data.domnbqueries == 0) {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: 'your link tags does not use any media queries'
                                });
                            }
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.useViewport = {
                    id: "mobileweb.use-viewport",
                    title: "Use meta viewport",
                    description: "Use the meta viewport tag to scale down your site on smaller devices. A good default is <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
                    nodeTypes: ["meta"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.failed = true;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var viewportattr = node.getAttribute("name");
                        if (viewportattr && viewportattr.toLowerCase() == "viewport") {
                            rulecheck.failed = false;
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Files;
            (function (Files) {
                Files.contentEncoding = {
                    id: "performances.contentencoding",
                    title: "Encode static content",
                    description: "Compress CSS and JavaScript files using content encoding (such as gzip) to reduce your site's network bandwidth requirements, especially on mobile.",
                    check: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        for (var n in analyzeSummary.files.stylesheets) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection && analyzeSummary.files.stylesheets[n].encoding && analyzeSummary.files.stylesheets[n].encoding == "none") {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: "Use content encoding for " + n
                                });
                            }
                        }
                        for (var n in analyzeSummary.files.scripts) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection && analyzeSummary.files.scripts[n].encoding && analyzeSummary.files.scripts[n].encoding == "none") {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: "Use content encoding for " + n
                                });
                            }
                        }
                    }
                };
            })(Files = Rules.Files || (Rules.Files = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Files;
            (function (Files) {
                Files.filesMinification = {
                    id: "performances.minification",
                    title: "Minify static files",
                    description: "Minify CSS and JavaScript files to reduce your site's network bandwidth requirements, especially on mobile.",
                    check: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        for (var n in analyzeSummary.files.stylesheets) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection) {
                                var charPerLines = this.getAverageCharacterPerLine(analyzeSummary.files.stylesheets[n].content);
                                if (charPerLines < 50) {
                                    rulecheck.failed = true;
                                    rulecheck.items.push({
                                        title: "minify " + n
                                    });
                                }
                            }
                        }
                        for (var n in analyzeSummary.files.scripts) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection) {
                                var charPerLines = this.getAverageCharacterPerLine(analyzeSummary.files.scripts[n].content);
                                if (charPerLines < 50) {
                                    rulecheck.failed = true;
                                    rulecheck.items.push({
                                        title: "minify " + n
                                    });
                                }
                            }
                        }
                    },
                    getAverageCharacterPerLine: function (content) {
                        if (!content)
                            return 1000;
                        var lines = content.split('\n');
                        if (lines.length == 0)
                            return 1000;
                        var total = 0;
                        lines.forEach(function (l) {
                            total += l.length;
                        });
                        return total / lines.length;
                    }
                };
            })(Files = Rules.Files || (Rules.Files = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.dontUsePlugins = {
                    id: "webstandards.dont-use-plugins",
                    title: "Use HTML5",
                    description: "Use HTML5 features instead of native plugins. Many browsers no longer support them.",
                    nodeTypes: ["EMBED", "OBJECT"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        //console.log("check for plugins");
                        var source = null, data = null, type = null;
                        var source = node.getAttribute("src");
                        if (source)
                            source = source.toLowerCase();
                        else
                            source = "";
                        var data = node.getAttribute("data");
                        if (data)
                            data = data.toLowerCase();
                        else
                            data = "";
                        var type = node.getAttribute("type");
                        if (type)
                            type = type.toLowerCase();
                        else
                            type = "";
                        if (source.indexOf(".swf") > 0 || data.indexOf("swf") > 0) {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "Consider using HTML5 instead of Flash", content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                        else if (type.indexOf("silverlight") > 0) {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "Consider using HTML5 instead of Silverlight", content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                        else if (source.indexOf(".svg") > 0 || data.indexOf("svg") > 0) {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "Avoid using SVG with " + node.nodeType, content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                        else {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "Use HTML5 features (such as canvas, video and audio elements) instead of hosting plugins with embed and object elements", content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.browserdetection = {
                    id: "webstandards.avoid-browser-detection",
                    exceptions: [
                        "ajax.googleapis.com",
                        "ajax.aspnetcdn.com",
                        "ajax.microsoft.com",
                        "jquery",
                        "mootools",
                        "prototype",
                        "protoaculous",
                        "google-analytics.com",
                        "partner.googleadservices.com",
                        "vorlon"
                    ],
                    title: "Detect features, not browsers",
                    description: "Use feature detection and avoid hardcoding for specific browsers. Browser detection leads to brittle code and isn't effective on modern browsers, which share similar user agent strings.",
                    nodeTypes: ["#comment"],
                    violations: [],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    init: function () {
                        var pageWindow = document.parentNode;
                        this.hook("navigator", "userAgent");
                        // this.hook("navigator", "appVersion");
                        // this.hook("navigator", "appName");
                        // this.hook("navigator", "product");
                        // this.hook("navigator", "vendor");
                    },
                    hook: function (root, prop) {
                        var _this = this;
                        VORLON.Tools.HookProperty(root, prop, function (stack) {
                            //this.trace("browser detection " + stack.file);
                            //this.trace(stack.stack);
                            if (stack.file) {
                                if (_this.isException(stack.file)) {
                                    //this.trace("skip browser detection access " + stack.file)
                                    return;
                                }
                            }
                            var check = {
                                title: "Access to window.navigator." + stack.property,
                                content: "From " + stack.file + " at " + stack.line
                            };
                            _this.violations.push(check);
                        });
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                    },
                    isException: function (file) {
                        if (!file)
                            return false;
                        return this.exceptions.some(function (e) {
                            return file.indexOf(e) >= 0;
                        });
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        if (this.violations.length > 0) {
                            rulecheck.failed = true;
                            for (var index = 0; index < this.violations.length; index++) {
                                rulecheck.items.push(this.violations[index]);
                            }
                        }
                    },
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.dontUseBrowserConditionalComment = {
                    id: "webstandards.avoid-browser-specific-css",
                    title: "Avoid conditional comments",
                    description: "Avoid targeting older IE versions with conditional comments. Write for modern browsers and use real CSS solutions whenever possible.",
                    nodeTypes: ["#comment"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        //console.log("checking comment " + node.nodeValue);
                        var commentContent = node.nodeValue.toLowerCase();
                        var hasConditionalComment = commentContent.indexOf("[if ie ") >= 0 ||
                            commentContent.indexOf("[if !ie]") >= 0 ||
                            commentContent.indexOf("[if gt ie ") >= 0 ||
                            commentContent.indexOf("[if gte ie ") >= 0 ||
                            commentContent.indexOf("[if lt ie ") >= 0 ||
                            commentContent.indexOf("[if lte ie ") >= 0;
                        if (hasConditionalComment) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: VORLON.Tools.htmlToString(node.nodeValue)
                            });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                CSS.cssfallback = {
                    id: "webstandards.cssfallback",
                    title: "Use CSS fallbacks",
                    description: "Provide proper fallback styles for unsupported CSS prefixes and properties.",
                    prepare: function (rulecheck, analyzeSummary) {
                        this.fallBackErrorList = [];
                    },
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        var parsed = ast;
                        for (var i = 0; i < parsed.length; i++) {
                            var selector = parsed[i].selector;
                            var rules = parsed[i].rules;
                            var resultsList = this.checkPrefix(rules);
                            if (resultsList.length > 0) {
                                // if (!results[url])
                                //     results[url] = {}
                                // if (!results[url][selector])
                                //     results[url][selector] = [];
                                //     
                                // for (var x = 0; x < resultsList.length; x++) {
                                //     results[url][selector].push(resultsList[x]);
                                // }
                                this.fallBackErrorList.push(resultsList);
                            }
                        }
                    },
                    capitalizeFirstLetter: function (string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    },
                    checkPrefix: function (rules) {
                        var errorList = [];
                        if (rules && rules.length)
                            for (var i = 0; i < rules.length; i++) {
                                if (rules[i].directive.indexOf('-webkit') === 0) {
                                    var _unprefixedPropertyName = this.unprefixedPropertyName(rules[i].directive);
                                    var good = this.checkIfNoPrefix(rules, _unprefixedPropertyName);
                                    if (!good) {
                                        var divTest = document.createElement('div');
                                        divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] = rules[i].value;
                                        if (divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] !== undefined) {
                                            good = true;
                                        }
                                    }
                                    if (!good) {
                                        errorList.push(rules[i].directive);
                                    }
                                }
                            }
                        return errorList;
                    },
                    checkIfNoPrefix: function (rules, prefix) {
                        var present = false;
                        if (rules && rules.length)
                            for (var i = 0; i < rules.length; i++) {
                                if (rules[i].directive.indexOf(prefix) === 0) {
                                    present = true;
                                    break;
                                }
                            }
                        if (!present) {
                            present = this.checkIfMsPrefix(rules, prefix);
                        }
                        return present;
                    },
                    checkIfMsPrefix: function (rules, prefix) {
                        var present = false;
                        if (rules && rules.length)
                            for (var i = 0; i < rules.length; i++) {
                                if (rules[i].directive.indexOf('-ms-' + prefix) === 0) {
                                    present = true;
                                    break;
                                }
                            }
                        return present;
                    },
                    unprefixedPropertyName: function (property) {
                        return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("check css css fallback");
                        var nodes = [];
                        rulecheck.items = [];
                        var failed = false;
                        if (!this.fallBackErrorList) {
                            rulecheck.title = "DISABLED: CSS fallback test";
                            failed = true;
                            var np = {
                                title: "The CSS fallback test is disabled",
                                type: "blockitems",
                                failed: true,
                                items: []
                            };
                            rulecheck.items.push(np);
                        }
                        else {
                            for (var ii = 0; ii < this.fallBackErrorList.length; ii++) {
                                for (var fallErrorFile in this.fallBackErrorList[ii]) {
                                    failed = true;
                                    var fallError = this.fallBackErrorList[ii][fallErrorFile];
                                    var proprules = {
                                        title: fallErrorFile,
                                        type: "itemslist",
                                        items: []
                                    };
                                    for (var errorFile in fallError) {
                                        var peroor = {
                                            failed: true,
                                            id: "." + fallError[errorFile][ind],
                                            items: [],
                                            title: errorFile
                                        };
                                        proprules.items.push(peroor);
                                        for (var ind = 0; ind < fallError[errorFile].length; ind++) {
                                            peroor.items.push({
                                                failed: true, id: "." + fallError[errorFile][ind], items: [],
                                                title: "from " + fallError[errorFile][ind] + " to " + fallError[errorFile][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""), type: "error"
                                            });
                                        }
                                        if (proprules.items.length) {
                                            rulecheck.items.push(proprules);
                                        }
                                    }
                                }
                            }
                        }
                        rulecheck.failed = failed;
                    },
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                var compatiblePrefixes = {
                    'animation': 'webkit',
                    'animation-delay': 'webkit',
                    'animation-direction': 'webkit',
                    'animation-duration': 'webkit',
                    'animation-fill-mode': 'webkit',
                    'animation-iteration-count': 'webkit',
                    'animation-name': 'webkit',
                    'animation-play-state': 'webkit',
                    'animation-timing-function': 'webkit',
                    'appearance': 'webkit moz',
                    'border-end': 'webkit moz',
                    'border-end-color': 'webkit moz',
                    'border-end-style': 'webkit moz',
                    'border-end-width': 'webkit moz',
                    'border-image': 'webkit o',
                    'border-start': 'webkit moz',
                    'border-start-color': 'webkit moz',
                    'border-start-style': 'webkit moz',
                    'border-start-width': 'webkit moz',
                    'box-sizing': 'webkit',
                    'column-count': 'webkit moz',
                    'column-gap': 'webkit moz',
                    'column-rule': 'webkit moz',
                    'column-rule-color': 'webkit moz',
                    'column-rule-style': 'webkit moz',
                    'column-rule-width': 'webkit moz',
                    'column-width': 'webkit moz',
                    'hyphens': 'webkit moz ms',
                    'margin-end': 'webkit moz',
                    'margin-start': 'webkit moz',
                    'padding-end': 'webkit moz',
                    'padding-start': 'webkit moz',
                    'tab-size': 'webkit moz o',
                    'text-size-adjust': 'webkit moz ms',
                    'transform': 'webkit ms',
                    'transform-origin': 'webkit ms',
                    'transition': 'webkit moz o',
                    'transition-delay': 'webkit moz o',
                    'transition-duration': 'webkit',
                    'transition-property': 'webkit',
                    'transition-timing-function': 'webkit',
                    'user-select': 'webkit moz ms'
                };
                var variations, prefixed, arrayPush = Array.prototype.push, applyTo = new Array();
                for (var prop in compatiblePrefixes) {
                    if (compatiblePrefixes.hasOwnProperty(prop)) {
                        variations = [];
                        prefixed = compatiblePrefixes[prop].split(' ');
                        for (var i = 0, len = prefixed.length; i < len; i++) {
                            variations.push('-' + prefixed[i] + '-' + prop);
                        }
                        compatiblePrefixes[prop] = variations;
                        variations.forEach(function (obj, i) {
                            applyTo[obj] = i;
                        });
                    }
                }
                CSS.cssprefixes = {
                    id: "webstandards.prefixes",
                    title: "Incorrect use of prefixes",
                    description: "Include all vendor prefixes with the unprefixed versions when using CSS3 properties.",
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        //console.log("check css prefixes");
                        var nodes = [];
                        var filerules = {
                            title: url,
                            type: "itemslist",
                            items: []
                        };
                        rulecheck.items = rulecheck.items || [];
                        this.checkNodes(url, compatiblePrefixes, filerules, ast, nodes);
                        if (filerules.items.length) {
                            rulecheck.items.push(filerules);
                            rulecheck.failed = true;
                        }
                    },
                    unprefixedPropertyName: function (property) {
                        return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
                    },
                    getMissingPrefixes: function (compatiblePrefixes, node, property) {
                        var allProperty = compatiblePrefixes[property];
                        var prefixes = [];
                        allProperty.forEach(function (prop, y) {
                            var hasPrefix = node.rules.some(function (r) { return r.directive == prop; });
                            if (!hasPrefix) {
                                prefixes.push(prop);
                            }
                        });
                        return prefixes;
                    },
                    checkNodes: function (url, compatiblePrefixes, rulecheck, ast, nodes) {
                        var _this = this;
                        if (!ast)
                            return;
                        ast.forEach(function (node, i) {
                            var nodeitem = null;
                            if (node.rules && node.rules.length > 0) {
                                var checked = {};
                                for (var x = 0, len = node.rules.length; x < len; x++) {
                                    var property = node.rules[x].directive;
                                    var unprefixed = _this.unprefixedPropertyName(property);
                                    if (!checked[unprefixed] && compatiblePrefixes.hasOwnProperty(unprefixed)) {
                                        if (compatiblePrefixes[unprefixed].indexOf(unprefixed) == -1)
                                            compatiblePrefixes[unprefixed].push(unprefixed);
                                        var missings = _this.getMissingPrefixes(compatiblePrefixes, node, unprefixed);
                                        if (missings.length) {
                                            if (!nodeitem) {
                                                rulecheck.failed = true;
                                                rulecheck.items = rulecheck.items || [];
                                                nodeitem = {
                                                    title: node.selector,
                                                    items: []
                                                };
                                                rulecheck.items.push(nodeitem);
                                            }
                                            nodeitem.items.push({
                                                title: "<strong>" + unprefixed + "</strong> : missing " + missings,
                                            });
                                        }
                                    }
                                    checked[unprefixed] = true;
                                }
                            }
                            //scan content of media queries
                            if (node.type === "media") {
                                _this.checkNodes(url, compatiblePrefixes, rulecheck, node.subStyles, nodes);
                            }
                        });
                    }
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.modernDocType = {
                    id: "webstandards.documentmode",
                    title: "Use a modern doctype",
                    description: "Use <!DOCTYPE html> to enable HTML5 features and interoperability across modern browsers.",
                    nodeTypes: ["META"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var httpequiv = node.getAttribute("http-equiv");
                        if (httpequiv && httpequiv.toLowerCase() == "x-ua-compatible") {
                            var content = node.getAttribute("content");
                            if (!(content.toLowerCase().indexOf("edge") >= 0)) {
                                rulecheck.failed = true;
                                //current.content = doctype.html;
                                rulecheck.items.push({
                                    title: "Avoid hardcoded docmode compatibility tags (http-equiv='X-UA-Compatible') for older versions of IE.",
                                    content: node.outerHTML
                                });
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("checking comment " + node.nodeValue);
                        var doctype = analyzeSummary.doctype || {};
                        var current = {
                            title: "Page doctype: " + doctype.html
                        };
                        if (doctype.publicId || doctype.systemId) {
                            rulecheck.failed = true;
                            //current.content = doctype.html;
                            rulecheck.items.push(current);
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var JavaScript;
            (function (JavaScript) {
                var libraries = [
                    {
                        name: 'Prototype',
                        minVersions: [
                            { major: '1.7.', minor: '2' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/Prototype JavaScript framework, version (\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'Dojo',
                        minVersions: [
                            { major: '1.5.', minor: '3' },
                            { major: '1.6.', minor: '2' },
                            { major: '1.7.', minor: '5' },
                            { major: '1.8.', minor: '5' },
                            { major: '1.9.', minor: '2' },
                            { major: '1.10.', minor: '0' }
                        ],
                        check: function (checkVersion, scriptText) {
                            if (scriptText.indexOf('dojo') === -1) {
                                return false;
                            }
                            var version = scriptText.match(/\.version\s*=\s*\{\s*major:\s*(\d+)\D+(\d+)\D+(\d+)/m);
                            if (version) {
                                return checkVersion(this, version[1] + '.' + version[2] + '.' + version[3]);
                            }
                            version = scriptText.match(/\s*major:\s*(\d+),\s*minor:\s*(\d+),\s*patch:\s*(\d+),/mi);
                            return version && checkVersion(this, version[1] + '.' + version[2] + '.' + version[3]);
                        }
                    },
                    {
                        name: 'Mootools',
                        minVersions: [
                            { major: '1.2.', minor: '6' },
                            { major: '1.4.', minor: '5' },
                            { major: '1.5.', minor: '' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/this.MooTools\s*=\s*\{version:\s*'(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'SWFObject',
                        minVersions: [
                            { major: '2.', minor: '2' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s+SWFObject v(\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery Form Plugin',
                        minVersions: [
                            { major: '3.', minor: '22' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/Form Plugin\s+\*\s+version: (\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'Modernizr',
                        minVersions: [
                            { major: '2.5.', minor: '2' },
                            { major: '2.6.', minor: '2' },
                            { major: '2.7.', minor: '1' },
                            { major: '2.8.', minor: '3' }
                        ],
                        check: function (checkVersion, scriptText) {
                            // Static analysis. :(  The version is set as a local variable, far from
                            // where Modernizr._version is set. Just see if we have a comment header.
                            // ALT: look for /VAR="1.2.3"/ then for /._version=VAR/ ... ugh.
                            var version = scriptText.match(/\*\s*Modernizr\s+(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery cookie',
                        minVersions: [
                            { major: '1.3.', minor: '1' },
                            { major: '1.4.', minor: '1' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s*jQuery Cookie Plugin v(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'hoverIntent',
                        minVersions: [
                            { major: '1.8.', minor: '1' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s*hoverIntent v(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery Easing',
                        minVersions: [
                            { major: '1.3.', minor: '0' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s*jQuery Easing v(\d+\.\d+)\s*/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'underscore',
                        minVersions: [
                            { major: '1.8.', minor: '3' },
                            { major: '1.7.', minor: '0' },
                            { major: '1.6.', minor: '0' },
                            { major: '1.5.', minor: '2' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/exports._(?:.*)?.VERSION="(\d+.\d+.\d+)"/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'hammer js',
                        minVersions: [
                            { major: '2.0.', minor: '4' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            if (scriptText.indexOf('hammer.input') !== -1) {
                                var version = scriptText.match(/.VERSION\s*=\s*['|"](\d+.\d+.\d+)['|"]/m);
                                return version && checkVersion(this, version[1]);
                            }
                            return false;
                        }
                    },
                    {
                        name: 'jQuery Superfish',
                        minVersions: [
                            { major: '1.7.', minor: '4' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/jQuery Superfish Menu Plugin - v(\d+.\d+.\d+)"/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery mousewheel',
                        minVersions: [
                            { major: '3.1.', minor: '12' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/.mousewheel={version:"(\d+.\d+.\d+)/);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery mobile',
                        minVersions: [
                            { major: '1.4.', minor: '5' },
                            { major: '1.3.', minor: '2' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/.mobile,{version:"(\d+.\d+.\d+)/);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery UI',
                        minVersions: [
                            { major: '1.8.', minor: '24' },
                            { major: '1.9.', minor: '2' },
                            { major: '1.10.', minor: '4' },
                            { major: '1.11.', minor: '4' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\.ui,[\s\r\n]*\{[\s\r\n]*version:\s*"(\d+.\d+.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery',
                        minVersions: [
                            { major: '1.6.', minor: '4' },
                            { major: '1.7.', minor: '2' },
                            { major: '1.8.', minor: '2' },
                            { major: '1.9.', minor: '1' },
                            { major: '1.10.', minor: '2' },
                            { major: '1.11.', minor: '3' },
                            { major: '2.0.', minor: '3' },
                            { major: '2.1.', minor: '4' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            //We search the version in the header
                            //Explanation: Some libraries have things like: Requires: jQuery v1.7.1 (cycle, for example)
                            //We are matching regex that contain jQuery vx.y.z but do not have : right before jQuery
                            var regex = /(?:jQuery\s*v)(\d+.\d+.\d+)\s/g;
                            var regversion = regex.exec(scriptText);
                            if (regversion) {
                                var isPluginRegExp = new RegExp('(?::\\s*)' + regversion[0], 'g');
                                if (!isPluginRegExp.exec(scriptText)) {
                                    return checkVersion(this, regversion[1]);
                                }
                            }
                            var matchversion = scriptText.match(/jquery:\s*"([^"]+)/);
                            if (matchversion) {
                                return checkVersion(this, matchversion[1]);
                            }
                            //If header fails, we look with another pattern
                            var regex = /(?:jquery[,\)].{0,200}=")(\d+\.\d+)(\..*?)"/gi;
                            var results = regex.exec(scriptText);
                            var version = results ? (results[1] + (results[2] || '')) : null;
                            return version && checkVersion(this, version);
                        }
                    }
                ];
                JavaScript.librariesVersions = {
                    id: "webstandards.javascript-libraries-versions",
                    title: "Keep your javascript libraries current",
                    description: "Use the latest versions of JavaScript libraries whenever possible to optimize performance and browser compatibility.",
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (url, javascriptContent, rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        var filecheck = null;
                        if (!javascriptContent || url == "inline")
                            return;
                        for (var i = 0; i < libraries.length; i++) {
                            var lib = libraries[i], result;
                            result = lib.check.call(lib, this.checkVersion, javascriptContent);
                            if (result && result.needsUpdate) {
                                if (!filecheck) {
                                    filecheck = {
                                        title: url,
                                        items: []
                                    };
                                    rulecheck.items.push(filecheck);
                                }
                                filecheck.items.push({
                                    title: "detected " + result.name + " version " + result.version,
                                });
                                rulecheck.failed = true;
                                break;
                            }
                        }
                    },
                    checkVersion: function (library, version) {
                        var vinfo = {
                            name: library.name,
                            needsUpdate: true,
                            minVersion: library.minVersions[0].major + library.minVersions[0].minor,
                            version: version,
                            bannedVersion: null
                        };
                        if (library.patchOptional) {
                            // If lib can have an implied ".0", add it when needed
                            // match 1.17, 1.17b2, 1.17-beta2; not 1.17.0, 1.17.2, 1.17b2
                            var parts = version.match(/^(\d+\.\d+)(.*)$/);
                            if (parts && !/^\.\d+/.test(parts[2])) {
                                version = parts[1] + '.0' + parts[2];
                            }
                        }
                        for (var i = 0; i < library.minVersions.length; i++) {
                            var gv = library.minVersions[i];
                            if (version.indexOf(gv.major) === 0) {
                                vinfo.minVersion = gv.major + gv.minor;
                                vinfo.needsUpdate = +version.slice(gv.major.length) < +gv.minor;
                                break;
                            }
                        }
                        if (library.bannedVersions) {
                            if (library.bannedVersions.indexOf(version) >= 0) {
                                vinfo.bannedVersion = version;
                                vinfo.needsUpdate = true;
                            }
                        }
                        return vinfo;
                    }
                };
            })(JavaScript = Rules.JavaScript || (Rules.JavaScript = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var WebStandardsClient = (function (_super) {
        __extends(WebStandardsClient, _super);
        function WebStandardsClient() {
            var _this = this;
            _super.call(this, "webstandards");
            this._currentAnalyze = {};
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            VORLON.Tools.interceptAddEventListener();
            this._loadNewScriptAsync("css.js", function () {
                _this._loadNewScriptAsync("axe.min.js", function () {
                    _this._ready = true;
                }, true);
            }, true);
        }
        WebStandardsClient.prototype.refresh = function () {
        };
        // Start the clientside code
        WebStandardsClient.prototype.startClientSide = function () {
            for (var generalRuleName in VORLON.WebStandards.Rules) {
                for (var ruleName in VORLON.WebStandards.Rules[generalRuleName]) {
                    var rule = VORLON.WebStandards.Rules[generalRuleName][ruleName];
                    if (rule.init) {
                        rule.init();
                    }
                }
            }
        };
        WebStandardsClient.prototype.startNewAnalyze = function (data) {
            var _this = this;
            this.trace("start webstandards analyzis " + data.id);
            this._currentAnalyze = {
                id: data.id,
                results: {},
                processing: true,
                canceled: false,
                location: window.location.href,
                html: document.documentElement.outerHTML,
                doctype: {
                    html: null,
                    name: null,
                    publicId: null,
                    systemId: null
                },
                files: {
                    scripts: {},
                    stylesheets: {}
                },
                pendingLoad: 0,
                lastActivity: new Date()
            };
            this.prepareAnalyze(this._currentAnalyze);
            var node = document.doctype;
            if (node) {
                var doctypeHtml = "<!DOCTYPE "
                    + node.name
                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                    + '>';
                this._currentAnalyze.doctype = {
                    html: doctypeHtml,
                    name: node.name,
                    publicId: node.publicId,
                    systemId: node.systemId
                };
            }
            var stylesheets = document.querySelectorAll("link[rel=stylesheet]");
            var nbStylesheets = stylesheets.length;
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    var file = { url: href.value, loaded: false, content: null };
                    this._currentAnalyze.files.stylesheets[href.value] = file;
                    this.getDocumentContent({ analyzeid: data.id, url: href.value }, file, function (url, file) {
                        _this.analyzeCssDocument(url, file.content, _this._currentAnalyze);
                    });
                }
            }
            var scripts = document.querySelectorAll("script");
            var nbScripts = scripts.length;
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src && src.value) {
                    var isVorlon = src.value.indexOf('vorlon.js') > 0 || src.value.indexOf('vorlon.min.js') > 0 || src.value.indexOf('vorlon.max.js') > 0;
                    if (!isVorlon) {
                        var file = { url: src.value, loaded: false, content: null };
                        this._currentAnalyze.files.scripts[src.value] = file;
                        this.getDocumentContent({ analyzeid: data.id, url: src.value }, file, function (url, file) {
                            _this.analyzeJsDocument(url, file.content, _this._currentAnalyze);
                        });
                    }
                }
            }
            this.analyzeDOM(document, this._currentAnalyze.html, this._currentAnalyze);
            this._refreshLoop = setInterval(function () {
                _this.checkLoadingState();
            }, 1000);
        };
        WebStandardsClient.prototype.checkLoadingState = function () {
            if (this._currentAnalyze && this._currentAnalyze.pendingLoad <= 0) {
                this.trace("resource load completed");
                this._currentAnalyze.processing = false;
            }
            if (!this._currentAnalyze || this._currentAnalyze.ended || this._currentAnalyze.canceled) {
                return;
            }
            if (this._currentAnalyze.processing) {
                return;
            }
            else {
                this._currentAnalyze.ended = true;
                this.endAnalyze(this._currentAnalyze);
            }
        };
        WebStandardsClient.prototype.initialiseRuleSummary = function (rule, analyze) {
            var tokens = rule.id.split('.');
            var current = analyze.results;
            var id = "";
            current.rules = current.rules || {};
            tokens.forEach(function (t) {
                id = (id.length > 0) ? "." + t : t;
                if (!current.rules) {
                    current.rules = {};
                }
                if (!current.rules[t])
                    current.rules[t] = { id: id };
                current = current.rules[t];
            });
            if (current.failed === undefined) {
                current.failed = false;
                current.title = rule.title;
                current.description = rule.description;
            }
            return current;
        };
        WebStandardsClient.prototype.prepareAnalyze = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.prepare)
                        cssrule.prepare(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.prepare)
                        scriptrule.prepare(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.Accessibility) {
                var accessibilityRule = VORLON.WebStandards.Rules.Accessibility[n];
                if (accessibilityRule) {
                    var current = this.initialiseRuleSummary(accessibilityRule, analyze);
                    if (accessibilityRule.prepare)
                        accessibilityRule.prepare(current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.endAnalyze = function (analyze) {
            clearInterval(this._refreshLoop);
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = VORLON.WebStandards.Rules.DOM[n];
                if (rule && !rule.generalRule && rule.endcheck) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.endcheck(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.endcheck)
                        cssrule.endcheck(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.endcheck)
                        scriptrule.endcheck(current, analyze);
                }
            }
            this.analyzeFiles(this._currentAnalyze);
            this.trace("sending result to dashboard");
            this.sendCommandToDashboard("analyseResult", { result: this._currentAnalyze });
        };
        WebStandardsClient.prototype.cancelAnalyse = function (id) {
            clearInterval(this._refreshLoop);
            this.trace("canceling analyze " + id);
            if (this._currentAnalyze && this._currentAnalyze.id == id) {
                this.trace("analyze " + id + " canceled");
                this._currentAnalyze.canceled = true;
                this._currentAnalyze.processing = false;
                this.sendCommandToDashboard("analyseCanceled", { id: this._currentAnalyze.id });
            }
        };
        WebStandardsClient.prototype.analyzeDOM = function (document, htmlContent, analyze) {
            var _this = this;
            var generalRules = [];
            var commonRules = [];
            var rules = {
                domRulesIndex: {},
                domRulesForAllNodes: []
            };
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = VORLON.WebStandards.Rules.DOM[n];
                if (rule) {
                    var rulecheck = this.initialiseRuleSummary(rule, analyze);
                    if (rule.prepare) {
                        rule.prepare(rulecheck, analyze);
                    }
                    if (rule.generalRule) {
                        generalRules.push(rule);
                    }
                    else {
                        commonRules.push(rule);
                        if (rule.nodeTypes.length) {
                            rule.nodeTypes.forEach(function (n) {
                                n = n.toUpperCase();
                                if (!rules.domRulesIndex[n])
                                    rules.domRulesIndex[n] = [];
                                rules.domRulesIndex[n].push(rule);
                            });
                        }
                        else {
                            rules.domRulesForAllNodes.push(rule);
                        }
                    }
                }
            }
            this.analyzeDOMNode(document, rules, analyze, htmlContent);
            generalRules.forEach(function (rule) {
                _this.applyDOMNodeRule(document, rule, analyze, htmlContent);
            });
        };
        WebStandardsClient.prototype.analyzeDOMNode = function (node, rules, analyze, htmlContent) {
            var _this = this;
            if (node.nodeName === "STYLE") {
                this.analyzeCssDocument("inline", node.innerHTML, analyze);
            }
            if (node.nodeName === "SCRIPT") {
                var domnode = node;
                var scriptType = domnode.getAttribute("type");
                var hasContent = domnode.innerHTML.trim().length > 0;
                if (!scriptType || scriptType == "text/javascript" && hasContent) {
                    this.analyzeJsDocument("inline", domnode.innerHTML, analyze);
                }
            }
            var specificRules = rules.domRulesIndex[node.nodeName.toUpperCase()];
            if (specificRules && specificRules.length) {
                specificRules.forEach(function (r) {
                    _this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }
            if (rules.domRulesForAllNodes && rules.domRulesForAllNodes.length) {
                rules.domRulesForAllNodes.forEach(function (r) {
                    _this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }
            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                this.analyzeDOMNode(node.childNodes[i], rules, analyze, htmlContent);
            }
        };
        WebStandardsClient.prototype.applyDOMNodeRule = function (node, rule, analyze, htmlContent) {
            var current = this.initialiseRuleSummary(rule, analyze);
            rule.check(node, current, analyze, htmlContent);
        };
        WebStandardsClient.prototype.analyzeCssDocument = function (url, content, analyze) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            this.trace("processing css " + url);
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var rule = VORLON.WebStandards.Rules.CSS[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, parsed, current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.analyzeFiles = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.Files) {
                var rule = VORLON.WebStandards.Rules.Files[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.analyzeJsDocument = function (url, content, analyze) {
            this.trace("processing script " + url);
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var rule = VORLON.WebStandards.Rules.JavaScript[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, content, current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.getDocumentContent = function (data, file, resultcallback) {
            var _this = this;
            this._currentAnalyze.pendingLoad++;
            this.trace("request file " + data.url + " " + this._currentAnalyze.pendingLoad);
            this.xhrDocumentContent(data, function (url, content, status, contentlength, encoding, error) {
                file.content = content;
                file.loaded = (error == null || error == undefined);
                file.encoding = encoding;
                file.contentLength = contentlength;
                file.error = error;
                file.status = status;
                _this._currentAnalyze.lastActivity = new Date();
                _this._currentAnalyze.pendingLoad--;
                _this.checkLoadingState();
                if (file.loaded && !_this._currentAnalyze.canceled) {
                    resultcallback(data.url, file);
                }
            });
        };
        WebStandardsClient.prototype.xhrDocumentContent = function (data, resultcallback) {
            var _this = this;
            var xhr = null;
            var completed = false;
            var timeoutRef = null;
            if (!data || !data.url) {
                this.trace("invalid fetch request");
                return;
            }
            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0) {
                documentUrl = window.location.protocol + documentUrl;
            }
            documentUrl = this.getAbsolutePath(documentUrl);
            this.trace("fetching " + documentUrl);
            try {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            completed = true;
                            clearTimeout(timeoutRef);
                            var encoding = xhr.getResponseHeader("X-VorlonProxyEncoding") || xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            _this.trace("encoding for " + data.url + " is " + encoding);
                            resultcallback(data.url, xhr.responseText, xhr.status, contentLength, encoding, null);
                        }
                        else {
                            completed = true;
                            clearTimeout(timeoutRef);
                            resultcallback(data.url, null, xhr.status, null, null, xhr.responseText);
                        }
                    }
                };
                xhr.open("GET", documentUrl, true);
                xhr.send(null);
                timeoutRef = setTimeout(function () {
                    if (!completed) {
                        completed = true;
                        _this.trace("fetch timeout for " + data.url);
                        xhr.abort();
                        resultcallback(data.url, null, null, null, null, "timeout");
                    }
                }, 20 * 1000);
            }
            catch (e) {
                console.error(e);
                completed = true;
                clearTimeout(timeoutRef);
                resultcallback(data.url, null, null, null, null, e.message);
            }
        };
        WebStandardsClient.prototype.getAbsolutePath = function (url) {
            var a = document.createElement('a');
            a.href = url;
            return a.href;
        };
        return WebStandardsClient;
    })(VORLON.ClientPlugin);
    VORLON.WebStandardsClient = WebStandardsClient;
    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyze: function (data) {
            var plugin = this;
            plugin.startNewAnalyze(data);
        },
        cancelAnalyze: function (data) {
            var plugin = this;
            plugin.cancelAnalyse(data.id);
        }
    };
    //Register the plugin with vorlon core
    VORLON.Core.RegisterClientPlugin(new WebStandardsClient());
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    //Start the core
    VORLON.Core.StartClientSide();
})(VORLON || (VORLON = {}));
