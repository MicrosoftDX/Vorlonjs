module VORLON {
    export class ObjectExplorerClient extends ClientPlugin {
        private _selectedObjProperty;
        private _previousSelectedNode;
        private _currentPropertyPath: string;
        private _timeoutId;
        private _objPrototype = Object.getPrototypeOf({});

        constructor() {
            super("objectExplorer");
            this._id = "OBJEXPLORER";
            this._ready = false;
            this.debug = true;
        }

        private STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        private ARGUMENT_NAMES = /([^\s,]+)/g;
        private rootProperty = 'window';

        private getFunctionArgumentNames(func) {
            var result = [];
            try {
                var fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
                result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
                if (result === null)
                    result = [];
            } catch (exception) {
                console.error(exception);
            }

            return result;
        }

        private inspect(path: Array<string>, obj: any, context: any): ObjExplorerObjDescriptor {
            if (!obj)
                return null;



            var objProperties = Object.getOwnPropertyNames(obj);
            var proto = Object.getPrototypeOf(obj);
            var res = <ObjExplorerObjDescriptor>{
                proto: null,
                fullpath: path.join('.'),
                name: path[path.length - 1],
                functions: [],
                properties: [],
                contentFetched: false,
                type: "object"
            };

            if (proto && proto != this._objPrototype)
                res.proto = this.inspect(path, proto, context);

            for (var i = 0, l = objProperties.length; i < l; i++) {
                var p = objProperties[i];
                var propertyType = "";
                if (p === '__vorlon')
                    continue;

                try {
                    var objValue = context[p];
                    propertyType = typeof objValue;
                    if (propertyType === 'function') {
                        res.functions.push(<ObjExplorerFunctionDescriptor>{
                            name: p,
                            args: this.getFunctionArgumentNames(objValue)
                        });
                    } else if (propertyType === 'undefined') {
                        res.properties.push(<ObjExplorerPropertyDescriptor>{
                            name: p,
                            type: propertyType,
                            value: undefined
                        });
                    } else if (propertyType === 'null') {
                        res.properties.push(<ObjExplorerPropertyDescriptor>{
                            name: p,
                            type: propertyType,
                            value: null
                        });
                    } else if (propertyType === 'object') {
                        var propPath = JSON.parse(JSON.stringify(path));
                        propPath.push(p);
                        res.properties.push(<ObjExplorerObjDescriptor>{
                            name: p,
                            type: propertyType,
                            fullpath: propPath.join('.'),
                            contentFetched: false
                        });
                    } else {
                        res.properties.push(<ObjExplorerPropertyDescriptor>{
                            name: p,
                            type: propertyType,
                            value: objValue.toString()
                        });
                    }
                } catch (exception) {
                    this.trace('error reading property ' + p + ' of type ' + propertyType);
                    this.trace(exception);
                    res.properties.push({ name: p, type: propertyType, val: "oups, Vorlon has an error reading this " + propertyType + " property..." });
                }
            }

            res.functions = res.functions.sort(function (a, b) {
                var lowerAName = a.name.toLowerCase();
                var lowerBName = b.name.toLowerCase();

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


        private _getProperty(propertyPath: string): ObjExplorerObjDescriptor {
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
                return { type: 'notfound', name: 'not found', val: null, functions: [], properties: [], contentFetched: false, fullpath: null };
            }
            var res = this.inspect(tokens, selectedObj, selectedObj);
            return res;
        }

        private _packageAndSendObjectProperty(path?: string) {
            path = path || this._currentPropertyPath;
            var packagedObject = this._getProperty(path);
            this.sendCommandToDashboard('update', packagedObject);
            //this.sendToDashboard({ type: type, path: packagedObject.fullpath, property: packagedObject });
        }

        private _markForRefresh() {
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }

            this._timeoutId = setTimeout(() => {
                this.refresh();
            }, 10000);
        }

        public startClientSide(): void {
            document.addEventListener("DOMContentLoaded",() => {
                if (Core.Messenger.isConnected) {
                    document.addEventListener("DOMNodeInserted",() => {
                        this._markForRefresh();
                    });

                    document.addEventListener("DOMNodeRemoved",() => {
                        this._markForRefresh();
                    });
                }

                this.refresh();
            });
        }


        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            //switch (receivedObject.type) {
            //    case "query":
            //        this._currentPropertyPath = receivedObject.path;
            //        this._packageAndSendObjectProperty(receivedObject.type);
            //        break;
            //    case "queryContent":
            //        this._packageAndSendObjectProperty(receivedObject.type, receivedObject.path);
            //        break;
            //    default:
            //        break;
            //}
        }

        public query(path: string) {
            this._currentPropertyPath = path;
            var packagedObject = this._getProperty(path);
            this.sendCommandToDashboard('root', packagedObject);
        }

        public queryContent(path: string) {
            var packagedObject = this._getProperty(path);
            this.sendCommandToDashboard('content', packagedObject);
        }

        public refresh(): void {
            this.query(this._currentPropertyPath);
        }
    }

    ObjectExplorerClient.prototype.ClientCommands = {
        query: function (data) {
            var plugin = <ObjectExplorerClient>this;
            plugin.query(data.path);
        },
        queryContent: function (data) {
            var plugin = <ObjectExplorerClient>this;
            plugin.queryContent(data.path);
        }
    }

    // Register
    Core.RegisterClientPlugin(new ObjectExplorerClient());
}
