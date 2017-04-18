module VORLON {
    export class Tools {
        
        public static QueryString  () {
            // This function is anonymous, is executed immediately and 
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                    // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            } 
            return query_string;
        }      

        public static QuerySelectorById(root: HTMLElement, id: string): HTMLElement {
            if (root.querySelector) {
                return <HTMLElement>root.querySelector("#" + id);
            }

            return document.getElementById(id);
        }

        public static SetImmediate(func: () => void): void {
            if (window.setImmediate) {
                setImmediate(func);
            } else {
                setTimeout(func, 0);
            }
        }
        public static setLocalStorageValue(key: string, data: string) {
            if (localStorage) {
                try {
                    localStorage.setItem(key, data);
                }
                catch (e) {
                    //local storage is not available (private mode maybe)
                }
            }
        }
        public static getLocalStorageValue(key: string) {
            if (localStorage) {
                try {
                    return localStorage.getItem(key);
                }
                catch (e) {
                    //local storage is not available (private mode maybe) 
                    return "";
                }
            }
        }

        
        // Intercept addEventListener calls by changing the prototype
        public static interceptAddEventListener () {
            var code = function() {
                var current = window.addEventListener;

                var customAddEventListener = function (name, func: () => void, capture) {
                        if (name === "message") {
                            var previousFunction = func;
                            
                            func = (...optionalParams: any[]) => {
                                var event = optionalParams[0];
                                // filtering messages sent by Vorlon code in the context of the page
                                // they should only be intercepted by the code of the content script
                                // otherwise we could break some logic of certain web pages
                                if (!(event && event.data && event.data.isVorlonMessage)) {
                                    previousFunction.apply(window, optionalParams);
                                }
                            }
                        }
                        current.call(this, name, func, capture);
                };
                window.addEventListener = customAddEventListener;
            }
            var script = document.createElement('script');
            var scriptCode = '(' + code + ')()';
            
            script.textContent = scriptCode;
            (document.head||document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        }
        
        public static Hook(rootObject: any, functionToHook: string, hookingFunction: (...optionalParams: any[]) => void): void {
            var previousFunction = rootObject[functionToHook];

            rootObject[functionToHook] = (...optionalParams: any[]) => {
                hookingFunction(optionalParams);
                previousFunction.apply(rootObject, optionalParams);
            }
            return previousFunction;
        }
        
        static _callBackID = 1;
        public static HookProperty(rootObjectName: string, propertyToHook: string, callback: (stackData: any) => void){ 
            var currentCallbackID = this._callBackID++;
            
            window.addEventListener("message", function(event) {
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
                       
            var code = function() {
                var getCallStack;
                
                //We have access to topframe - no longer a contentscript 
                var rootObject = window[rootObjectName];      
                var initialValue = rootObject[propertyToHook];
                Object.defineProperty(rootObject, propertyToHook, {
                    get: function() {
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
            (document.head||document.documentElement).appendChild(script);
            script.parentNode.removeChild(script);
        }
        
        public static getCallStack(skipped){  
            skipped = skipped || 0;
            try {
                //Throw an error to generate a stack trace
                throw new Error();
            }
            catch(e) {
                //Split the stack trace into each line
                var stackLines = e.stack.split('\n');
                var callerIndex = 0;
                
                //Now walk though each line until we find a path reference
                for(var i=2 + skipped, l = stackLines.length; i<l; i++){ 
                    if(!(stackLines[i].indexOf("http://") >= 0) && !(stackLines[i].indexOf("https://") >= 0)) 
                        continue;
                    //We skipped all the lines with out an http so we now have a script reference
                    //This one is the class constructor, the next is the getScriptPath() call
                    //The one after that is the user code requesting the path info (so offset by 2)
                    callerIndex = i;
                    break;
                }
                
                var res = <any>{
                    stack : e.stack,
                    // fullPath : pathParts ? pathParts[1] : null,
                    // path : pathParts ? pathParts[2] : null,
                    // file : pathParts ? pathParts[3] : null
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
                
                if (opening >= 0){
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
        }

        public static CreateCookie(name: string, value: string, days: number): void {
            var expires: string;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            } else {
                expires = "";
            }

            document.cookie = name + "=" + value + expires + "; path=/";
        }

        public static ReadCookie(name: string): string {
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
        }

        // from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
        public static CreateGUID(): string {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,(c) => {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        public static RemoveEmpties(arr: string[]): number {
            var len = arr.length;
            for (var i = len - 1; i >= 0; i--) {
                if (!arr[i]) {
                    arr.splice(i, 1);
                    len--;
                }
            }
            return len;
        }

        public static AddClass(e: HTMLElement, name: string): HTMLElement {
            if (e.classList) {
                if (name.indexOf(" ") < 0) {
                    e.classList.add(name);
                } else {
                    var namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);

                    for (var i = 0, len = namesToAdd.length; i < len; i++) {
                        e.classList.add(namesToAdd[i]);
                    }
                }
                return e;
            } else {
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
                } else {
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
                    } else {
                        e.className = toAdd;
                    }
                }
                return e;
            }
        }

        public static RemoveClass(e: HTMLElement, name: string): HTMLElement {
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
            } else {
                var original = e.className;

                if (name.indexOf(" ") >= 0) {
                    namesToRemove = name.split(" ");
                    Tools.RemoveEmpties(namesToRemove);
                } else {
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
        }

        public static ToggleClass(e: HTMLElement, name: string, callback? : (hasClass:boolean) => void) {
            if (e.className.match(name)) {
                Tools.RemoveClass(e, name);
                if (callback)
                    callback(false);
            } else {
                Tools.AddClass(e, name);
                if (callback)
                    callback(true);
            }
        }

        public static htmlToString(text) {
            return text;
        }
    }

    export class FluentDOM {
        public element: HTMLElement;
        public childs: Array<FluentDOM>;
        public parent: FluentDOM;

        constructor(nodeType: string, className?: string, parentElt?: Element, parent?: FluentDOM) {
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

        public static forElement(element: HTMLElement) {
            var res = new FluentDOM(null);
            res.element = element;
            return res;
        }

        addClass(classname: string) {
            this.element.classList.add(classname);
            return this;
        }

        toggleClass(classname: string) {
            this.element.classList.toggle(classname);
            return this;
        }
        
        hasClass(classname: string): boolean {
            return this.element.classList.contains(classname);
        }

        className(classname: string) {
            this.element.className = classname;
            return this;
        }

        opacity(opacity: string) {
            this.element.style.opacity = opacity;
            return this;
        }

        display(display: string) {
            this.element.style.display = display;
            return this;
        }

        hide() {
            this.element.style.display = 'none';
            return this;
        }

        visibility(visibility: string) {
            this.element.style.visibility = visibility;
            return this;
        }

        text(text: string) {
            this.element.textContent = text;
            return this;
        }

        html(text: string) {
            this.element.innerHTML = text;
            return this;
        }

        attr(name: string, val: string) {
            this.element.setAttribute(name, val);
            return this;
        }

        editable(editable: boolean) {
            this.element.contentEditable = editable ? "true" : "false";
            return this;
        }

        style(name: string, val: string) {
            this.element.style[name] = val;
            return this;
        }

        appendTo(elt: Element) {
            elt.appendChild(this.element);
            return this;
        }

        append(nodeType: string, className?: string, callback?: (fdom: FluentDOM) => void) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            if (callback) {
                callback(child);
            }
            return this;
        }

        createChild(nodeType: string, className?: string) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            return child;
        }

        click(callback: (EventTarget) => void) {
            this.element.addEventListener('click', callback);
            return this;
        }

        blur(callback: (EventTarget) => void) {
            this.element.addEventListener('blur', callback);
            return this;
        }

        keydown(callback: (EventTarget) => void) {
            this.element.addEventListener('keydown', callback);
            return this;
        }
    }
}
