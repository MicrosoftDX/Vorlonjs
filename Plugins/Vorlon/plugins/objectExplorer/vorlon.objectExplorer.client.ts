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
            if (obj === undefined)
                return null;

            var res = <ObjExplorerObjDescriptor>{
                proto: null,
                fullpath: path.join('.'),
                name: path[path.length - 1],
                functions: [],
                properties: [],
                contentFetched: true,
                type: typeof obj
            };

            this.trace("inspecting " + res.fullpath + " as " + res.type);
            if (res.type === "function") {                
                return res;
            } else if (obj === null) {
                res.type = "null";
                res.value = null;
                return res;
            }
            else if (res.type !== "object") {
                res.value = obj.toString();
                return res;
            }            

            var objProperties = Object.getOwnPropertyNames(obj);
            var proto = Object.getPrototypeOf(obj);

            if (proto && proto != this._objPrototype)
                res.proto = this.inspect(path, proto, context);

            for (var i = 0, l = objProperties.length; i < l; i++) {
                var p = objProperties[i];
                
                var propertyType = "";
                if (p === '__vorlon')
                    continue;
                var propPath = JSON.parse(JSON.stringify(path));
                propPath.push(p);

                try {
                    var objValue = context[p];
                    propertyType = typeof objValue;
                    if (propertyType === 'function') {
                        res.functions.push(<ObjExplorerFunctionDescriptor>{
                            name: p,
                            fullpath: propPath.join('.'),
                            args: this.getFunctionArgumentNames(objValue)
                        });
                    } else if (propertyType === 'undefined') {
                        res.properties.push(<ObjExplorerPropertyDescriptor>{
                            name: p,
                            type: propertyType,
                            fullpath: propPath.join('.'),
                            value: undefined
                        });
                    } else if (propertyType === 'null') {
                        res.properties.push(<ObjExplorerPropertyDescriptor>{
                            name: p,
                            type: propertyType,
                            fullpath: propPath.join('.'),
                            value: null
                        });
                    } else if (propertyType === 'object') {
                        
                        var desc = <ObjExplorerObjDescriptor>{
                            name: p,
                            type: propertyType,
                            fullpath: propPath.join('.'),
                            contentFetched: false
                        };
                        if (objValue === null) {
                            desc.type = "null";
                            desc.contentFetched = true;
                        }
                        res.properties.push(desc);
                    } else {
                        res.properties.push(<ObjExplorerPropertyDescriptor>{
                            name: p,
                            fullpath: propPath.join('.'),
                            type: propertyType,
                            value: objValue.toString()
                        });
                    }
                } catch (exception) {
                    this.trace('error reading property ' + p + ' of type ' + propertyType);
                    this.trace(exception);
                    res.properties.push({
                        name: p,
                        type: propertyType,
                        fullpath: propPath.join('.'),
                        val: "oups, Vorlon has an error reading this " + propertyType + " property..."
                    });
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

            this.trace("getting obj at " + propertyPath);

            if (propertyPath && propertyPath !== this.rootProperty) {
                tokens = propertyPath.split('.');
                if (tokens && tokens.length) {
                    for (var i = 0, l = tokens.length; i < l; i++) {
                        selectedObj = selectedObj[tokens[i]];
                        if (selectedObj === undefined) {
                            this.trace(tokens[i] + " not found");
                            break;
                        }
                    }
                }
            }

            if (selectedObj === undefined) {
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

        public startClientSide(): void {
            
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
