

interface Window { Office: any; }
declare var $: any;

module VORLON {




    export class OfficeClient extends ClientPlugin {


        private objectPrototype = Object.getPrototypeOf({});

        constructor() {
            super("office"); // Name
            this._ready = true; // No need to wait
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "OFFICE";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard

            //sometimes refresh is called before document was loaded
            if (!document.body) {
                setTimeout(() => {
                    this.refresh();
                }, 200);
                return;
            }

            var office = window["Office"];

        }


        private STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        private ARGUMENT_NAMES = /([^\s,]+)/g;

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

        private inspectOfficeObject(path: Array<string>, obj: any, rootObject: any): Object {

            var res = {
                proto: null,
                fullpath: path.join('.'),
                name: path[path.length - 1],
                functions: [],
                properties: [],
                contentFetched: true,
                type: typeof obj,
                value: undefined
            };
            
            // Check if can inspect something
            if (res.type === "function") {
                return res;
            }
            if (obj === null) {
                res.type = "null";
                res.value = null;
                return res;
            }
            if (res.type !== "object") {
                res.value = obj.toString();
                return res;
            }
            
            // get all properties
            var objProperties = Object.getOwnPropertyNames(obj);
            
            // Gets prototype
            var proto = Object.getPrototypeOf(obj);

            // Get the prototype.
            if (proto && proto != this.objectPrototype)
                res.proto = this.inspectOfficeObject(path, proto, rootObject);

            // Recurse the properties
            for (var i = 0, l = objProperties.length; i < l; i++) {
                var p = objProperties[i];

                var propertyType = "";
                
                // if it's a vorlon property, we pass
                if (p === '__vorlon')
                    continue;
                    
                // a office internal prop
                if (p.substr(0, 1) == '$')
                    continue;
               
                // Strange to stringify then parse.
                // whatever...     
                var propPath = JSON.parse(JSON.stringify(path));
                propPath.push(p);


                try {
                    // get the property value
                    var objValue = rootObject[p];
                    
                    // get the type of this propertyType
                    propertyType = typeof objValue;

                    if (propertyType === 'function') {
                        res.functions.push({
                            name: p,
                            fullpath: propPath.join('.'),
                            args: this.getFunctionArgumentNames(objValue)
                        });
                    } else if (propertyType === 'undefined') {
                        res.properties.push({
                            name: p,
                            type: propertyType,
                            fullpath: propPath.join('.'),
                            value: undefined
                        });
                    } else if (propertyType === 'null') {
                        res.properties.push({
                            name: p,
                            type: propertyType,
                            fullpath: propPath.join('.'),
                            value: null
                        });
                    } else if (propertyType === 'object') {

                        if (objValue === null) {
                            var desc = {
                                name: p,
                                type: "null",
                                fullpath: propPath.join('.'),
                                contentFetched: true
                            };
                            res.properties.push(desc);
                        } else {
                            if (propPath.indexOf(p.toString()) == -1 || propPath.indexOf(p.toString()) == (propPath.length - 1)) {
                                var r = <any>this.inspectOfficeObject(propPath, objValue, objValue);
                                if (r.properties.length > 0)
                                    res.properties.push(r);
                            }
                        }
                    } else {
                        if (objValue !== undefined && objValue !== null) {

                            res.properties.push({
                                name: p,
                                fullpath: propPath.join('.'),
                                type: propertyType,
                                value: objValue.toString()
                            });
                        }
                    }

                }
                catch (exception) {
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
            return res;
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {
            //don't actually need to do anything at startup
            

        }



        public query(name: string) {

            var tokens = ["window", name];

            if (window[name] === null || window[name] === undefined) {
                return this.sendToDashboard(
                    {
                        type: 'empty',
                        name: name,
                        value: undefined
                    });
            }

            var packagedObject = this.inspectOfficeObject(tokens, window[name], window[name]);

            if (!window.Office || window.Office === undefined || window.Office === null) {
                return this.sendToDashboard(
                    {
                        type: 'error',
                        name: name,
                        value: "Office not defined"
                    });
            }

            return this.sendToDashboard(
                {
                    type: 'object',
                    name: name,
                    value: packagedObject
                });

        }

        public stringify(o: any): any {
            var cache = [];
            return JSON.stringify(o, function(key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
            cache = null;
        }

        public getAsyncResult(deferred: any): Object {
            return (asyncResult) => {
                if (asyncResult.status == window.Office.AsyncResultStatus.Failed) {
                    return deferred.reject(asyncResult.error);
                } else {
                    return deferred.resolve(asyncResult.value);
                }
            }
        }

        public executeFunction(receivedObject: any): any {
            var deferred = $.Deferred();

            try {


                var result = this.getFunctionOrProperty(receivedObject.name);

                if (result === null || result === undefined || result.fn === null || result.fn === undefined) {
                    deferred.reject("this function is not allowed in this mode.");
                }

                var args = receivedObject.args;

                if (args === undefined || args === null)
                    args = [];

                if (typeof args === 'string')
                    args = [args];

                var parsedArgs = [];
                for (var i = 0; i < args.length; i++) {
                    var arg = args[i];

                    if (typeof arg === 'string') {
                        parsedArgs.push(arg);
                    } else if ($.isPlainObject(arg) && arg.type) {
                        switch (arg.type) {
                            case "Datetime":
                                parsedArgs.push(new Date(Date.parse(arg.value)));
                                break;
                            case "Json":
                                parsedArgs.push(JSON.parse(arg.value));
                                break;
                            default:
                                parsedArgs.push(arg.value);
                        }
                    } else if ($.isPlainObject(arg)) {
                        parsedArgs.push(arg);
                    }
                }

                if (receivedObject.hasAsyncResult) {
                    parsedArgs.push(this.getAsyncResult(deferred));
                    result.fn.apply(result.obj, parsedArgs);
                } else {
                    var response = result.fn.apply(result.obj, parsedArgs);
                    deferred.resolve(response);
                }
            } catch (error) {
                deferred.reject(error);
            }
            return deferred.promise();
        }

        public getOfficeType(): any {
            if (!window.Office || !window.Office.context) {
                return undefined;
            }

            if (window.Office.context.mailbox) {
                return {
                    officeType: "Outlook"
                };
            }


            if (window.Office.context.requirements && window.Office.context.requirements._setMap && window.Office.context.requirements._setMap._sets) {
                return {
                    officeType: window.Office.context.requirements._setMap._sets
                }
            }

            return {
                officeType: "Office"
            };

        }

        public getFunctionOrProperty(clsClass: string): any {

            if (clsClass === undefined || clsClass === null || clsClass.trim() === "")
                return undefined;

            var clsClassT = clsClass.split(".");

            if (clsClassT.length === 0)
                return undefined;

            if (clsClassT[0] == "window") {
                clsClassT = clsClassT.slice(1, clsClassT.length);
            }

            var finalResult = {
                obj: undefined,
                fn: undefined
            }

            var obj = window;
            while (clsClassT.length > 0) {
                var currentProperty = clsClassT[0];

                if (clsClassT.length == 2) {
                    finalResult.obj = obj[currentProperty];
                }
                clsClassT = clsClassT.slice(1, clsClassT.length);

                obj = obj[currentProperty];
            }

            finalResult.fn = obj;

            return finalResult;
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            switch (receivedObject.type) {
                case "query":
                    this.query(receivedObject.name);
                    break;
                case "officetype":
                    var t = this.getOfficeType();
                    this.sendToDashboard(
                        {
                            type: 'officetype',
                            value: t
                        });
                    break;
                case "property":
                    var property = this.getFunctionOrProperty(receivedObject.name);
                    this.sendToDashboard(
                        {
                            type: 'property',
                            name: receivedObject.name,
                            value: property
                        });
                    break;
                case "function":

                    this.executeFunction(receivedObject)
                        .then((content) => {
                            var c = this.stringify(content);
                            this.sendToDashboard(
                                {
                                    type: 'function',
                                    name: receivedObject.name,
                                    value: c
                                });
                        }).fail(error => {
                            var c = this.stringify(error);
                            this.sendToDashboard(
                                {
                                    type: 'error',
                                    name: receivedObject.name,
                                    value: c
                                });
                        });
                    break;

                default:
                    break;
            }

        }

    }

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new OfficeClient());
}
