module VORLON {
    declare var $: any;
    declare var angular: any;

    interface Scope {
        $id: number;
        $parentId: number;
        $children: Scope[];
        $functions: string[];
        $isNgRepeat: boolean;
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
                var cleanedRootScope = this._cleanScope(rootScope);
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
                        cleanedChildScope.$isNgRepeat = true;
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
        private _ngInspectorScopeProperties: string[] = ["$id", "$parentId", "$children", "$functions"];

        private _cleanScope(scope: any): Scope {
            var scopePackaged: Scope = {
                $id: null,
                $parentId: null,
                $children: [],
                $functions: [],
                $isNgRepeat: false
            };
            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._scopePropertiesNamesToExclude.indexOf(key) === -1) {
                    scopePackaged[key] = scope[key];
                }
            }

            if (scope.$parent !== null) {
                scopePackaged.$parentId = scope.$parent.$id;
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
                    position: '70%'
                });

                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            this._rootScopes = receivedObject.scopes;
            document.getElementById("scopes-tree-wrapper").innerHTML = this._renderScopes(receivedObject.scopes);

            var nodes = document.getElementById("scopes-tree-wrapper").addEventListener("click",(e) => {
                var target = <HTMLElement>e.target;
                if (target.classList.contains("ng-scope")) {
                    var scopeId = parseInt(target.attributes["data-scope-id"].value);
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
            if (scope.$isNgRepeat) {
                var dom = '<a class="ng-repeat ng-scope" data-scope-id="' + scope.$id + '">scope : ' + scope.$id + '</a>';
            } else {
                var dom = '<a class="ng-scope" data-scope-id="' + scope.$id + '">scope : ' + scope.$id + '</a>';
            }

            if (scope.$children) {
                dom += this._renderScopes(scope.$children);
            }

            return dom;
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

        private _renderScopeDetail(scope: Scope): string {
            return "<p>" + scope.$id.toString() + "</p>";
        }
    }

    // Register
    Core.RegisterPlugin(new NgInspector());
}