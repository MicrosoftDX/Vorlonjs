module VORLON {
    declare var $: any;
    declare var angular: any;

    interface Scope {
        $id: number;
        $parentId: number;
        $children: Scope[];
        $functions: string[];
        $type: ScopeType;
        $name: string;
    }

    export class NgInspector extends Plugin {
        constructor() {
            super("ngInspector", "control.html", "control.css");
            this._ready = false;
        }

        public getID(): string {
            return "NGINSPECTOR";
        }

        public refresh(): void {
            this._packageAndSendScopes();
        }

        public startClientSide(): void {
            document.addEventListener("DOMContentLoaded",() => {
                this.refresh();
            });
        }

        private _timeoutId: NodeJS.Timer;
        private _markForRefresh() {
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }

            this._timeoutId = setTimeout(() => {
                this.refresh();
            }, 2000);
        }

        private _packageAndSendScopes(): void {
            this._rootScopes = [];
            this._findRootScopes(document.body);

            Core.Messenger.sendRealtimeMessage(this.getID(), { scopes: this._rootScopes }, RuntimeSide.Client, "message");
        }

        private _rootScopes: Scope[] = [];

        private _findRootScopes(element: Node) {
            var rootScope = angular.element(element).scope();
            if (!!rootScope) {
                var cleanedRootScope = this._cleanScope(rootScope, true);
                this._rootScopes.push(cleanedRootScope);

                //cleanedRootScope.$element = element;
                this._findChildrenScopes(element, cleanedRootScope);

                this._listenScopeChanges(rootScope);
            } else {
                for (var i = 0; i < element.childNodes.length; i++) {
                    this._findRootScopes(element.childNodes[i]);
                }
            }
        }

        private _findChildrenScopes(element: Node, parentScope: Scope) {
            for (var i = 0; i < element.childNodes.length; i++) {
                var childNode = element.childNodes[i];
                var childScope = angular.element(childNode).scope();

                if (!!childScope && childScope.$id !== parentScope.$id) {
                    var cleanedChildScope = this._cleanScope(childScope);

                    if (childNode.attributes["ng-repeat"] ||
                        childNode.attributes["data-ng-repeat"] ||
                        childNode.attributes["x-ng-repeat"] ||
                        childNode.attributes["ng_repeat"] ||
                        childNode.attributes["ng:repeat"]) {
                        cleanedChildScope.$type = ScopeType.NgRepeat;
                    }

                    //cleanedChildScope.$element = childNode;
                    parentScope.$children.push(cleanedChildScope);

                    this._findChildrenScopes(childNode, cleanedChildScope);
                } else {
                    this._findChildrenScopes(childNode, parentScope);
                }
            }
        }

        private _updateScopeValue(value: any, property: string) {
            //TODO: remplacer le null
            var scope = angular.element(null).scope();

            scope.$apply(() => {
                scope[property] = value;
            });
        }

        //private _packageAndFindChildrenScopes(scope: any): Scope[] {
        //    var currentLevelScopes: Scope[] = [];
        //    while (scope) {
        //        var childrenScopes: Scope[] = this._packageAndFindChildrenScopes(scope.$$childHead);
        //        var packagedScope = this._cleanScope(scope);
        //        packagedScope.$children = childrenScopes;
        //        this._allScopes[packagedScope.$id] = packagedScope;
        //        currentLevelScopes.push(packagedScope);
        //        scope = scope.$$nextSibling;
        //    }

        //    return currentLevelScopes;
        //}

        private _listenScopeChanges(scope: any) {
            console.log("listen to scope " + scope.$id);

            scope.$watch((newValue, oldValue) => {
                this._markForRefresh();
            });

            scope.$on("$destroy",() => {
                console.log(scope.$id + " has been destroyed");
            });
        }

        private _scopePropertiesNamesToExclude: string[] = ["$$applyAsyncQueue", "$$asyncQueue", "$$childHead", "$$ChildScope", "$$childTail", "$$destroyed", "$$isolateBindings", "$$listenerCount", "$$listeners", "$$nextSibling", "$$phase", "$$postDigest", "$$postDigestQueue", "$$prevSibling", "$$transcluded", "$$watchers", "$$watchersCount", "$apply", "$applyAsync", "$broadcast", "$childTail", "$destroy", "$digest", "$emit", "$eval", "$evalAsync", "$even", "$first", "$index", "$last", "$middle", "$new", "$odd", "$on", "$parent", "$root", "$watch", "$watchCollection", "$watchGroup"];
        private _ngInspectorScopeProperties: string[] = ["$id", "$parentId", "$children", "$functions", "$type", "$name"];

        private _cleanScope(scope: any, isRoot: boolean = false): Scope {
            var scopePackaged: Scope = {
                $id: null,
                $parentId: null,
                $children: [],
                $functions: [],
                $type: ScopeType.Controller,
                $name: ""
            };
            if (isRoot) {
                scope = scope.$root;
            }

            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._scopePropertiesNamesToExclude.indexOf(key) === -1) {
                    scopePackaged[key] = scope[key];
                }
            }

            if (scope.$parent !== null) {
                scopePackaged.$parentId = scope.$parent.$id;
            } else {
                scopePackaged.$type = ScopeType.RootScope;
            }

            return scopePackaged;
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            console.log(receivedObject);
        }

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div,(filledDiv) => {
                $('.ng-inspector-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '35%'
                });

                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            this._rootScopes = receivedObject.scopes;
            document.getElementById("scopes-tree-wrapper").innerHTML = this._renderScopes(receivedObject.scopes);

            var nodes = document.getElementById("scopes-tree-wrapper").addEventListener("click",(e) => {
                var target = <HTMLElement>e.target;
                if (target.classList.contains("ng-scope") ||
                    target.parentElement.classList.contains("ng-scope")) {
                    var dataAttribute = target.attributes["data-scope-id"] ||
                        target.parentElement.attributes["data-scope-id"];
                    var scopeId = parseInt(dataAttribute.value);
                    this.showScopeDetail(scopeId);
                }
            });
        }

        private _renderScopes(scopes: Scope[]): string {
            var dom = '<ul class="scopes-tree">';
            for (var i = 0; i < scopes.length; i++) {
                dom += "<li>" + this._renderScope(scopes[i]) + "</li>";
            }

            dom += "</ul>";
            return dom;
        }

        private _renderScope(scope: Scope): string {
            var dom = "";
            if (scope.$type === ScopeType.NgRepeat) {
                dom = '<a class="ng-repeat ng-scope" data-scope-id="'
                + scope.$id + '">'
                + this._getScopeTreeIcon(scope)
                + '<span class="scope-name">ng-repeat</span> <span class="scope-id">('
                + scope.$id + ')</span></a>';
            } else if (scope.$type === ScopeType.RootScope) {
                dom = '<a class="ng-scope root-scope" data-scope-id="' + scope.$id + '">'
                + this._getScopeTreeIcon(scope)
                + '<span class="scope-name">$rootScope</span> <span class="scope-id">('
                + scope.$id
                + ')</span></a>';
            } else {
                dom = '<a class="ng-scope controller-scope" data-scope-id="'
                + scope.$id + '">'
                + this._getScopeTreeIcon(scope)
                + '<span class="scope-name">'
                + scope.$name + '</span> <span class="scope-id">('
                + scope.$id + ')</span></a>';
            }

            if (scope.$children) {
                dom += this._renderScopes(scope.$children);
            }

            return dom;
        }

        private _iconTemplate: string = '<span class="fa-stack fa"><i class="fa fa-square-o fa-stack-2x"></i><i class="fa ICONNAME fa-stack-1x">TEXTTOREPLACE</i></span>';

        private _renderScopeDetail(scope: Scope): string {
            var elem = '<div class="scope-details"><ul class="scope-properties">';
            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._ngInspectorScopeProperties.indexOf(key) === -1) {
                    elem += this._renderScopeProperty(scope[key], key);
                }
            }

            elem += '</ul></div>';
            return elem;
        }

        private _renderScopeProperty(prop: any, key: string): string {
            var elem
                = '<li><a class="ng-property">'
                + this._getScopePropertyIcon(prop)
                + '<span class="ng-property-name">'
                + key
                + ' : </span>'
                + '<span class="ng-property-value">PROPVALUE</span></a>';


            if (typeof (prop) === "object") {
                if (prop !== null) {
                    elem += this._renderScopeSubLevelDetail(prop);
                }

                if (prop === null) {
                    prop = "null";
                }
                else if (prop instanceof Array) {
                    prop = "[...]";
                } else {
                    prop = "{...}";
                }
            }

            elem += '</li>';
            return elem.replace("PROPVALUE", prop);
        }

        private _renderScopeSubLevelDetail(prop: any): string {
            var elem = '<ul class="scope-properties">';
            if (prop instanceof Array) {
                for (var i = 0; i < prop.length; i++) {
                    elem += this._renderScopeProperty(prop[i], key);
                }
            }
            else {
                var keys = Object.keys(prop);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (this._ngInspectorScopeProperties.indexOf(key) === -1) {
                        elem += this._renderScopeProperty(prop[key], key);
                    }
                }
            }

            elem += '</ul>';
            return elem;
        }

        private _getScopeTreeIcon(scope: Scope): string {
            var iconName: string = "";
            var text: string = "";

            switch (scope.$type) {
                case ScopeType.RootScope:
                    iconName = "fa-arrows-alt";
                    break;
                case ScopeType.NgRepeat:
                    iconName = "fa-repeat";
                    break;
                case ScopeType.Directive:
                    iconName = "caret-square-o-down";
                    break;
                case ScopeType.Controller:
                    iconName = "fa-crosshairs";
                    break;
            }

            return this._iconTemplate.replace("ICONNAME", iconName).replace("TEXTTOREPLACE", text);
        }

        private _getScopePropertyIcon(prop: any): string {
            var iconName: string = "";
            var text: string = "";

            switch (typeof (prop)) {
                case "object":
                    if (prop == null) {
                        iconName = "fa-ban";
                    }
                    else if (prop instanceof Array) {
                        text = "[ ]";
                    } else {
                        text = "{ }";
                    }
                    break;
                case "number":
                    text = "#";
                    break;
                case "string":
                    iconName = "fa-font";
                    break;
                case "boolean":
                    iconName = "fa-check";
                    break;
            }

            return this._iconTemplate.replace("ICONNAME", iconName).replace("TEXTTOREPLACE", text);
        }

        private _findScopeById(scopes: Scope[], scopeId: number): Scope {
            for (var i = 0; i < scopes.length; i++) {
                if (scopes[i].$id === scopeId) {
                    return scopes[i];
                }

                if (scopes[i].$children.length > 0) {
                    return this._findScopeById(scopes[i].$children, scopeId);
                }
            }

            return null;
        }

        public showScopeDetail(scopeId: number) {
            var scope = this._findScopeById(this._rootScopes, scopeId);

            document.getElementById("scope-details-wrapper").innerHTML = this._renderScopeDetail(scope);
        }
    }

    enum ScopeType { NgRepeat, RootScope, Controller, Directive };

    // Register
    Core.RegisterPlugin(new NgInspector());
}