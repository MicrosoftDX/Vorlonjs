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
            this._findRootScopes(document.body);

            Core.Messenger.sendRealtimeMessage(this.getID(), { scopes: this._rootScopes }, RuntimeSide.Client, "message");
        }

        private _rootScopes: Scope[] = [];

        private _findRootScopes(element: Node) {
            var rootScope = angular.element(element).scope();
            if (!!rootScope) {
                var cleanedRootScope = this._cleanScope(rootScope);
                this._rootScopes.push(cleanedRootScope);

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
                    parentScope.$children.push(cleanedChildScope);

                    this._findChildrenScopes(childNode, cleanedChildScope);
                } else {
                    this._findChildrenScopes(childNode, parentScope);
                }
            }
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

        private _scopePropertiesNamesToExclude: string[] = ["$$applyAsyncQueue", "$$asyncQueue", "$$childHead", "$$ChildScope", "$$childTail", "$$destroyed", "$$isolateBindings", "$$listenerCount", "$$listeners", "$$nextSibling", "$$phase", "$$postDigest", "$$postDigestQueue", "$$prevSibling", "$$transcluded", "$$watchers", "$apply", "$applyAsync", "$broadcast", "$childTail", "$destroy", "$digest", "$emit", "$eval", "$evalAsync", "$even", "$first", "$index", "$last", "$middle", "$new", "$odd", "$on", "$parent", "$root", "$watch", "$watchCollection", "$watchGroup"];

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
            this._insertHtmlContentAsync(div,(filledDiv) => {
                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            document.getElementById("ngInspectorContainer").innerText = JSON.stringify(receivedObject.scopes);
        }
    }

    // Register
    Core.RegisterPlugin(new NgInspector());
}