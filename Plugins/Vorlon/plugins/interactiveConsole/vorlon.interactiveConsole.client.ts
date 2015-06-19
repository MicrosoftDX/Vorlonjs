module VORLON {

    export class InteractiveConsoleClient extends ClientPlugin {
        _cache = [];
        _pendingEntries: ConsoleEntry[] = [];
        private _maxBatchSize = 50;
        private _maxBatchTimeout = 200;
        private _pendingEntriesTimeout: any;
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
            super("interactiveConsole");
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
                res.proto = this.inspect(proto, context, deepness + 1);

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
                        if (deepness > 5) {
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
                    if (msg == window || msg == document) {
                        resmessages.push('VORLON : object cannot be inspected, too big...');
                    } else {
                        resmessages.push(this.inspect(msg, msg, 0));
                    }
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

        private batchSend(items: any[]) {
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
            this._hooks.clear = Tools.Hook(window.console, "clear",(): void => {
                this.clearClientConsole();
            });

            this._hooks.dir = Tools.Hook(window.console, "dir",(message: string): void => {
                var messages = arguments;
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "dir"
                };

                this.addEntry(data);
            });

            this._hooks.log = Tools.Hook(window.console, "log",(message: string): void => {
                var messages = arguments;
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "log"
                };

                this.addEntry(data);
            });

            this._hooks.debug = Tools.Hook(window.console, "debug",(message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "debug"
                };

                this.addEntry(data);
            });

            this._hooks.info = Tools.Hook(window.console, "info",(message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "info"
                };

                this.addEntry(data);
            });

            this._hooks.warn = Tools.Hook(window.console, "warn",(message: string): void => {
                var data = {
                    messages: this.getMessages(arguments[0]),
                    type: "warn"
                };

                this.addEntry(data);
            });

            this._hooks.error = Tools.Hook(window.console, "error",(message: string): void => {
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

            window.addEventListener('error', () => {
                var err = arguments[0];
                
                if (err.error) {
                    //this.addEntry({ messages: [err.error.message], type: "exception" });
                    this.addEntry({ messages: [err.error.stack], type: "exception" });
                }
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

            //delay sending cache to dashboard to let other plugins load...
            setTimeout(() => {
                this.batchSend(this._cache);
            }, 300);
        }
    }

    InteractiveConsoleClient.prototype.ClientCommands = {
        order: function (data: any) {
            var plugin = <InteractiveConsoleClient>this;
            plugin.evalOrderFromDashboard(data.order);
        },
        clear: function (data: any) {
            var plugin = <InteractiveConsoleClient>this;
            console.clear();
        }
    };


    // Register
    Core.RegisterClientPlugin(new InteractiveConsoleClient());
}