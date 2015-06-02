module VORLON {
    declare var $: any;
    declare var angular: any;

    interface Scope {
        $id: number;
        $parentId: number;
        $children: Scope[];
        $functions: string[];
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
            this._findScopeTrees();

            Core.Messenger.sendRealtimeMessage(this.getID(), { scopes: this._rootScopes }, RuntimeSide.Client, "message");
        }

        private _rootScopes: Scope[] = [];
        private _allScopes: Scope[] = [];

        private _findScopeTrees(): void {
            this._allScopes = [];
            this._rootScopes = [];
            var appElements = this._getElementsByAttributeName("ng-app");

            for (var i = 0; i < appElements.length; i++) {
                var scope = angular.element(appElements[i]).scope();

                var packagedScope = this._cleanScope(scope);
                packagedScope.$children = this._packageAndFindChildrenScopes(scope.$$childHead);
                this._allScopes[packagedScope.$id] = packagedScope;
                this._rootScopes.push(packagedScope);
            }
        }

        private _packageAndFindChildrenScopes(scope: any): Scope[] {
            var currentLevelScopes: Scope[] = [];
            while (scope) {
                var childrenScopes: Scope[] = this._packageAndFindChildrenScopes(scope.$$childHead);
                var packagedScope = this._cleanScope(scope);
                packagedScope.$children = childrenScopes;
                this._allScopes[packagedScope.$id] = packagedScope;
                currentLevelScopes.push(packagedScope);
                scope = scope.$$nextSibling;
            }

            return currentLevelScopes;
        }

        private _getElementsByAttributeName(...attributes: string[]): HTMLScriptElement[] {
            var matchingElements: HTMLScriptElement[] = [];
            var allElements: HTMLScriptElement[] = <HTMLScriptElement[]><any>document.getElementsByTagName("*");
            for (var i = 0; i < allElements.length; i++) {
                for (var j = 0; j < attributes.length; j++) {
                    if (allElements[i].getAttribute(attributes[j])) {
                        matchingElements.push(allElements[i]);
                        break;
                    }
                }
            }

            return matchingElements;
        }

        private _listenScopeChanges(scope: any) {
            console.log("listen to scope " + scope.$id);

            scope.$watch((newValue, oldValue) => {
                this._markForRefresh();
            });

            scope.$on("$destroy", () => {
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
                $functions: []
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
            this._insertHtmlContentAsync(div, (filledDiv) => {
                $('.ng-inspector-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });

                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            document.getElementById("ngInspectorContainer").innerHTML = this._renderScopes(receivedObject.scopes);
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
            var dom = '<span>scope : ' + scope.$id + '</span>';

            if (scope.$children) {
                dom += this._renderScopes(scope.$children);
            }

            return dom;
        }
    }

    // Register
    Core.RegisterPlugin(new NgInspector());
}