module VORLON {

    export class InteractiveConsoleDashboard extends DashboardPlugin {
        constructor() {
            super("interactiveConsole", "control.html", "control.css");
            this._ready = false;
            this._id = "CONSOLE";
            this.traceLog = (msg) => {
                console.log(msg);
            }
        }

        // DASHBOARD        
        private _clearButton: Element;
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
                            order: this.isLoggable(this._interactiveInput.value) ? "console.log(" + this._interactiveInput.value + ")" 
                                                                            : this._interactiveInput.value
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
        
        private isLoggable(input:string) : boolean{
            // "val" && 'val
            if(input[0] == '"' &&  input[input.length - 1] == '"' || (input[0] == '\'' &&  input[input.length - 1] == '\''))
                return true;
                
             if(input.indexOf('.') > 0){
                 // .command, c.command(), c.command
                 return (input.indexOf("(") > -1  && input.indexOf(")") > -1 ) ? false : true;
             }  
             
             // funct("") => return something or not
             // Other case, will return a console error from the client
             return false;
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
            this._logEntries.splice(0, this._logEntries.length);
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

    InteractiveConsoleDashboard.prototype.DashboardCommands = {
        entries: function (data: any) {
            var plugin = <InteractiveConsoleDashboard>this;
            plugin.addDashboardEntries(<ConsoleEntry[]>data.entries);
        },
        clear: function (data: any) {
            var plugin = <InteractiveConsoleDashboard>this;
            plugin.clearDashboard();
        },

        setorder: function (data: any) {
            var plugin = <InteractiveConsoleDashboard>this;
            plugin._interactiveInput.value = "document.getElementById(\"" + data.order + "\")";
        }
    };
        
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
            if (!this.obj || this.contentRendered)
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

    class InteractiveConsoleEntry {
        element: HTMLDivElement;
        entry: ConsoleEntry;
        objects: InteractiveConsoleObject[] = [];

        constructor(parent: HTMLElement, entry: ConsoleEntry) {
            this.entry = entry;
            this.element = document.createElement("div");
            this.element.className = 'log-entry ' + this.getTypeClass();
            this.element.title = "Message received at " + new Date().toLocaleTimeString();
            parent.appendChild(this.element);

            for (var i = 0, l = entry.messages.length; i < l; i++) {
                this.addMessage(entry.messages[i]);
            }
        }
        

        private addMessage(msg: any) {
            if (typeof msg === 'string' || typeof msg === 'number') {
                var elt = document.createElement('DIV');
                elt.className = 'log-message text-message';
                this.element.appendChild(elt);
                elt.textContent = msg + '';
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

    // Register
    Core.RegisterDashboardPlugin(new InteractiveConsoleDashboard());
}