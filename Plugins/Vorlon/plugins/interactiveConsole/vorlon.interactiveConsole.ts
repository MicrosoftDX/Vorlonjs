module VORLON {

    export interface ObjectPropertyDescriptor {
        name: string;
        val: any;
    }

    export interface ObjectDescriptor {
        proto?: ObjectDescriptor;
        functions: Array<string>;
        properties: Array<ObjectPropertyDescriptor>;
    }

    export interface ConsoleEntry {
        type: any;
        messages: Array<any>;
    }

    export class InteractiveConsole extends Plugin {
        _cache = [];
        _pendingEntries: ConsoleEntry[] = [];
        private _maxBatchSize = 50;
        private _maxBatchTimeout = 200;
        private _pendingEntriesTimeout: any;
        private _clearButton: Element;
        private _objPrototype = Object.getPrototypeOf({});
        private _hooks = {
            clear: null,
            dir: null,
            log: null,
            debug: null,
            error: null,
            warn: null,
            info: null
        };

        constructor() {
            super("interactiveConsole", "control.html", "control.css");
            this._ready = false;
            this._id = "CONSOLE";
            this.traceLog = (msg) => {
                if (this._hooks && this._hooks.log) {
                    this._hooks.log.call(console, msg);
                } else {
                    console.log(msg);
                }
            }
        }

        private inspect(obj: any, context: any, deepness: number): ObjectDescriptor {
            if (!obj)
                return null;

            var objProperties = Object.getOwnPropertyNames(obj);
            var proto = Object.getPrototypeOf(obj);
            var res = <ObjectDescriptor>{
                functions: [],
                properties: []
            };

            if (proto && proto != this._objPrototype)
                res.proto = this.inspect(proto, context, deepness+1);

            for (var i = 0, l = objProperties.length; i < l; i++) {
                var p = objProperties[i];
                var propertyType = "";
                if (p === '__vorlon')
                    continue;

                try {
                    var objValue = context[p];
                    propertyType = typeof objValue;
                    if (propertyType === 'function') {
                        res.functions.push(p);
                    } else if (propertyType === 'undefined') {
                        res.properties.push({ name: p, val: undefined });
                    } else if (propertyType === 'null') {
                        res.properties.push({ name: p, val: null });
                    } else if (propertyType === 'object') {
                        if (deepness > 10) {
                            res.properties.push({ name: p, val: "Vorlon cannot inspect deeper, try inspecting the proper object directly" });
                        } else {
                            res.properties.push({ name: p, val: this.inspect(objValue, objValue, deepness + 1) });
                        }
                    } else {
                        res.properties.push({ name: p, val: objValue.toString() });
                    }
                } catch (exception) {
                    this.trace('error reading property ' + p + ' of type ' + propertyType);
                    this.trace(exception);
                    res.properties.push({ name: p, val: "oups, Vorlon has an error reading this " + propertyType + " property..." });
                }
            }

            res.functions = res.functions.sort(function (a, b) {
                var lowerAName = a.toLowerCase();
                var lowerBName = b.toLowerCase();

                if (lowerAName > lowerBName)
                    return 1;
                if (lowerAName < lowerBName)
                    return -1;
                return 0;
            });

            res.properties = res.properties.sort(function (a, b) {
                var lowerAName = a.name.toLowerCase();
                var lowerBName = b.name.toLowerCase();

                if (lowerAName > lowerBName)
                    return 1;
                if (lowerAName < lowerBName)
                    return -1;
                return 0;
            });

            return res;
        }

        private getMessages(messages: IArguments): Array<any> {
            var resmessages = [];
            for (var i = 0, l = messages.length; i < l; i++) {
                var msg = messages[i];
                if (typeof msg === 'string' || typeof msg === 'number') {
                    resmessages.push(msg);
                } else {
                    resmessages.push(this.inspect(msg, msg, 0));
                }
            }
            return resmessages;
        }

        private addEntry(entry: ConsoleEntry) {
            this._cache.push(entry);
            //non batch send
            //this.sendCommandToDashboard('entries', { entries: [entry] });

            this._pendingEntries.push(entry);
            if (this._pendingEntries.length > this._maxBatchSize) {
                this.sendPendings();
            } else {
                this.checkPendings();
            }
        }

        private checkPendings() {
            if (!this._pendingEntriesTimeout) {
                this._pendingEntriesTimeout = setTimeout(() => {
                    this._pendingEntriesTimeout = null;
                    this.sendPendings();
                }, this._maxBatchTimeout);
            }
        }

        private sendPendings() {
            var currentPendings = this._pendingEntries;
            this._pendingEntries = [];
            this.sendCommandToDashboard('entries', { entries: currentPendings });
        }

        private batchSend(items: InteractiveConsoleEntry[]) {
            var batch = [];
            for (var i = 0, l = items.length; i < l; i++) {
                if (batch.length < this._maxBatchSize) {
                    batch.push(items[i]);
                } else {
                    this.sendCommandToDashboard('entries', { entries: batch });
                    batch = [];
                }
            }
            this.sendCommandToDashboard('entries', { entries: batch });
        }

        public startClientSide(): void {
            // Overrides clear, log, error and warn
            this._hooks.clear = Tools.Hook(window.console, "clear", (): void => {
                this.clearClientConsole();
            });

            this._hooks.dir = Tools.Hook(window.console, "dir", (message: string): void => {
                var messages = arguments;
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "dir"
                };

                this.addEntry(data);
            });

            this._hooks.log = Tools.Hook(window.console, "log", (message: string): void => {
                var messages = arguments;
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "log"
                };

                this.addEntry(data);
            });

            this._hooks.debug = Tools.Hook(window.console, "debug", (message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "debug"
                };

                this.addEntry(data);
            });

            this._hooks.info = Tools.Hook(window.console, "info", (message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "info"
                };

                this.addEntry(data);
            });

            this._hooks.warn = Tools.Hook(window.console, "warn", (message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "warn"
                };

                this.addEntry(data);
            });

            this._hooks.error = Tools.Hook(window.console, "error", (message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "error"
                };

                this.addEntry(data);
            });

            // Override Error constructor
            var previousError = Error;

            Error = <any>((message: string) => {
                var error = new previousError(message);

                var data = {
                    messages: [message],
                    type: "exception"
                };

                this.addEntry(data);

                return error;
            });
        }

        public clearClientConsole() {
            this.sendCommandToDashboard('clear');
            this._cache = [];
        }

        public evalOrderFromDashboard(order: string) {
            try {
                eval(order);
            } catch (e) {
                console.error("Unable to execute order: " + e.message);
            }
        }

        public refresh(): void {
            this.sendCommandToDashboard("clear");
            this.batchSend(this._cache);
        }

        // DASHBOARD
        private _containerDiv: HTMLElement;
        public _textFilter: HTMLInputElement;
        public _interactiveInput: HTMLInputElement;
        private _commandIndex: number;
        private _commandHistory = [];
        private _logEntries: InteractiveConsoleEntry[] = [];

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                // Log container
                this._containerDiv = Tools.QuerySelectorById(filledDiv, "logs");
                this._clearButton = Tools.QuerySelectorById(filledDiv, 'clear');

                this._clearButton.addEventListener('clear', () => {
                    this.sendCommandToClient('clear');
                });


                // Interactive console
                this._interactiveInput = <HTMLInputElement>Tools.QuerySelectorById(div, "input");
                this._interactiveInput.addEventListener("keydown", (evt) => {
                    if (evt.keyCode === 13) { //enter
                        this.sendCommandToClient('order', {
                            order: this._interactiveInput.value
                        });

                        this._commandHistory.push(this._interactiveInput.value);
                        this._commandIndex = null;
                        this._interactiveInput.value = "";
                    } if (evt.keyCode === 38) { // up arrow

                        if (this._commandIndex == null) this._commandIndex = this._commandHistory.length;

                        if (this._commandHistory.length > 0 && this._commandIndex > 0) {
                            this._commandIndex--;

                            this._interactiveInput.value = this._commandHistory[this._commandIndex];
                        }
                    } else if (evt.keyCode === 40) { // down arrow
                        if (this._commandHistory.length > 0 && this._commandIndex != null) {
                            if (this._commandIndex < this._commandHistory.length - 1) {
                                this._commandIndex++;
                                this._interactiveInput.value = this._commandHistory[this._commandIndex];
                            } else {
                                this._interactiveInput.value = "";
                                this._commandIndex = null;
                            }
                        }
                    }
                });

                var filterAllBtn = <HTMLElement>filledDiv.querySelector('#filterall');
                var filterButtons = filledDiv.querySelectorAll('.filter-btn');
                var applyFilters = () => {
                    var filters = [];
                    withFilterButton((btn) => {
                        if (btn.id !== 'filterall' && btn.className.match('selected')) {
                            filters.push(btn.getAttribute('filter'));
                        }
                    });
                    this.applyFilter(filters, this._textFilter.value);
                }
                var filterButtonClick = (arg) => {
                    Tools.RemoveClass(filterAllBtn, 'selected');
                    Tools.ToggleClass(arg.currentTarget, 'selected');
                    applyFilters();
                }
                var withFilterButton = (callback: (HTMLElement) => void) => {
                    for (var i = 0, l = filterButtons.length; i < l; i++) {
                        callback(filterButtons[i]);
                    }
                }

                withFilterButton((btn) => {
                    btn.onclick = filterButtonClick;
                });

                filterAllBtn.onclick = () => {
                    withFilterButton((btn) => {
                        Tools.RemoveClass(btn, 'selected');
                    });
                    Tools.AddClass(filterAllBtn, 'selected');
                    applyFilters();
                }

                this._textFilter = <HTMLInputElement>Tools.QuerySelectorById(div, "filterInput");
                var timeout;
                this._textFilter.addEventListener("keydown", (evt) => {
                    if (timeout)
                        clearTimeout(timeout);
                    setTimeout(() => applyFilters(), 300);
                });

                this._ready = true;
            });
        }

        public addDashboardEntries(entries: ConsoleEntry[]) {
            for (var i = 0, l = entries.length; i < l; i++) {
                this.addDashboardEntry(entries[i]);
            }
        }

        public addDashboardEntry(entry: ConsoleEntry) {
            var ctrl = new InteractiveConsoleEntry(this._containerDiv, entry);
            this._logEntries.push(ctrl);
        }

        public clearDashboard() {
            this._containerDiv.innerHTML = '';
        }

        public applyFilter(filters: string[], text: string) {
            if (text)
                text = text.toLowerCase();
            for (var i = 0; i < this._logEntries.length; i++) {
                if (filters.length) {
                    if (filters.indexOf(this._logEntries[i].entry.type) === -1) {
                        this._logEntries[i].element.classList.add('hide');
                    }
                    else {
                        this._logEntries[i].element.classList.remove('hide');
                    }
                }
                else {
                    this._logEntries[i].element.classList.remove('hide');
                }
                if (text && !this._logEntries[i].element.classList.contains('hide')) {
                    var contains = false;
                    for (var x = 0; x < this._logEntries[i].entry.messages.length; x++) {
                        var message = this._logEntries[i].entry.messages[x];
                        if (typeof message != 'string') {
                            message = JSON.stringify(message).toLowerCase();
                        }
                        if (this._logEntries[i].entry.messages[x] && message.indexOf(text) !== -1) {
                            contains = true;
                            break;
                        }
                    }
                    if (!contains)
                        this._logEntries[i].element.classList.add('hide');
                }
            }
            console.log('apply filters ' + JSON.stringify(filters));
        }
    }

    InteractiveConsole.prototype.ClientCommands = {
        order: function (data: any) {
            var plugin = <InteractiveConsole>this;
            plugin.evalOrderFromDashboard(data.order);
        },
        clear: function (data: any) {
            var plugin = <InteractiveConsole>this;
            console.clear();
        }
    };

    InteractiveConsole.prototype.DashboardCommands = {
        entries: function (data: any) {
            var plugin = <InteractiveConsole>this;
            plugin.addDashboardEntries(<ConsoleEntry[]>data.entries);
        },
        clear: function (data: any) {
            var plugin = <InteractiveConsole>this;
            plugin.clearDashboard();
        },

        setorder: function (data: any) {
            var plugin = <InteractiveConsole>this;
            plugin._interactiveInput.value = "document.getElementById(\"" + data.order + "\")";
        }
    };


    class InteractiveConsoleEntry {
        element: HTMLDivElement;
        entry: ConsoleEntry;
        objects: InteractiveConsoleObject[] = [];

        constructor(parent: HTMLElement, entry: ConsoleEntry) {
            this.entry = entry;
            this.element = document.createElement("div");
            this.element.className = 'log-entry ' + this.getTypeClass();
            parent.insertBefore(this.element, parent.childNodes.length > 0 ? parent.childNodes[0] : null);

            for (var i = 0, l = entry.messages.length; i < l; i++) {
                this.addMessage(entry.messages[i]);
            }
        }

        private addMessage(msg: any) {
            if (typeof msg === 'string' || typeof msg === 'number') {
                var elt = document.createElement('DIV');
                elt.className = 'log-message text-message';
                this.element.appendChild(elt);
                elt.textContent = msg;
            } else {
                var obj = new InteractiveConsoleObject(this.element, <ObjectDescriptor>msg, true);
                this.objects.push(obj);
            }
        }

        private getTypeClass(): string {
            switch (this.entry.type) {
                case "log":
                    return "logMessage";
                    break;
                case "debug":
                    return "logDebug";
                    break;
                case "info":
                    return "logInfo";
                    break;
                case "warn":
                    return "logWarning";
                    break;
                case "error":
                    return "logError";
                    break;
                case "exception":
                    return "logException";
                    break;
                default:
                    return "logMessage";
            }
        }
    }

    class InteractiveConsoleObject {
        obj: ObjectDescriptor;
        element: HTMLElement;
        toggle: HTMLElement;
        content: HTMLElement;
        propertiesElt: HTMLElement;
        functionsElt: HTMLElement;
        protoElt: HTMLElement;
        proto: InteractiveConsoleObject;
        contentRendered: boolean = false;
        constructor(parent: HTMLElement, obj: ObjectDescriptor, addToggle: boolean = false) {
            this.obj = obj;
            this.element = new FluentDOM('DIV', 'object-description collapsed', parent).element;
            if (addToggle) {
                var toggle = new FluentDOM('A', 'object-toggle obj-link', this.element);
                var toggleState = toggle.createChild('SPAN', 'toggle-state').text("+");
                toggle.createChild('SPAN', '').html('[Object]');

                toggle.click(() => {
                    this.toggleView();
                    if (this.expanded()) {
                        toggleState.text('-');
                    } else {
                        toggleState.text('+');
                    }
                });
                this.toggle = toggle.element;
            }

            this.content = new FluentDOM('DIV', 'object-content', this.element).element;
        }

        public expanded() {
            return !this.element.className.match('collapsed');
        }

        public toggleView() {
            this.renderContent();
            Tools.ToggleClass(this.element, 'collapsed');
        }

        public renderContent() {
            if (this.contentRendered)
                return;

            if (this.obj.proto) {
                this.protoElt = new FluentDOM('DIV', 'obj-proto', this.content).append('A', 'label obj-link', (protolabel) => {
                    var toggleState = protolabel.createChild('SPAN', 'toggle-state').text("+");
                    protolabel.createChild('SPAN', '').html('[Prototype]');

                    protolabel.click(() => {
                        if (this.proto) {
                            this.proto.toggleView();
                            if (this.proto.expanded()) {
                                toggleState.text("-");
                            } else {
                                toggleState.text("+");
                            }
                        }
                    });
                }).element;

                this.proto = new InteractiveConsoleObject(this.protoElt, this.obj.proto);
            }

            if (this.obj.functions && this.obj.functions.length) {
                this.functionsElt = new FluentDOM('DIV', 'obj-functions collapsed', this.content).append('A', 'label obj-link', (functionslabel) => {
                    var toggleState = functionslabel.createChild('SPAN', 'toggle-state').text("+");
                    functionslabel.createChild('SPAN', '').html('[Methods]');
                    functionslabel.click(() => {
                        Tools.ToggleClass(this.functionsElt, 'collapsed');
                        if (this.functionsElt.className.match('collapsed')) {
                            toggleState.text("+");
                        } else {
                            toggleState.text("-");
                        }
                    });
                }).append('DIV', 'content collapsed', (functionscontent) => {
                        functionscontent.element;
                        for (var i = 0, l = this.obj.functions.length; i < l; i++) {
                            functionscontent.append('DIV', 'func', (objfunc) => {
                                objfunc.text(this.obj.functions[i]);
                            });
                        }
                    }).element;
            }

            this.propertiesElt = new FluentDOM('DIV', 'obj-properties', this.content).append('DIV', 'content', (propcontent) => {
                for (var i = 0, l = this.obj.properties.length; i < l; i++) {
                    var p = this.obj.properties[i];
                    propcontent.append('DIV', 'prop', (prop) => {
                        if (typeof p.val === 'object' && p.val !== null && p.val !== undefined) {
                            var obj: InteractiveConsoleObject = null;

                            prop.append('A', 'prop-name obj-link', (propname) => {
                                var toggleState = propname.createChild('SPAN', 'toggle-state').text("+");
                                propname.createChild('SPAN', '').html('<span class="prop-title">' + p.name + '</span>: <span>[Object]</span>');

                                propname.click(() => {
                                    if (obj) {
                                        obj.toggleView();
                                        if (obj.expanded()) {
                                            toggleState.text("-");
                                        } else {
                                            toggleState.text("+");
                                        }
                                    }
                                });
                            }).append('DIV', 'prop-obj',(propobj) => {
                                if (!p.val)
                                    console.error("no value !", p);
                                obj = new InteractiveConsoleObject(propobj.element, p.val);
                            });
                        } else {
                            prop.append('DIV', 'prop-name',(prop) => {
                                prop.createChild('SPAN', 'blank-state');
                                prop.createChild('SPAN', 'prop-title').text(p.name);
                                prop.createChild('SPAN').text(": ");
                                prop.createChild('SPAN', 'prop-value').text(p.val);
                            });
                        }
                    });
                }
            }).element;
            this.contentRendered = true;
        }
    }

    // Register
    Core.RegisterPlugin(new InteractiveConsole());
}