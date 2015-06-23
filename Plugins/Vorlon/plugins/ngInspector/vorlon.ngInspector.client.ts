module VORLON {
    declare var angular: any;

    export class NgInspectorClient extends ClientPlugin {

        private _rootScopes: Scope[] = [];
        private _currentShownScopeId: number = null;
        
        constructor() {
            super("ngInspector");
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

            this.sendToDashboard({ scopes: this._rootScopes }); 
        }

        private _findRootScopes(element: Node) {
            if(typeof angular == 'undefined')
                return;
                
            var rootScope = angular.element(element).scope();
            if (!!rootScope) {
                var cleanedRootScope = this._cleanScope(rootScope);
                cleanedRootScope.$type = ScopeType.RootScope;
                cleanedRootScope.$name = "$rootScope";
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
            if(typeof angular == 'undefined')
                return;
                
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
                        cleanedChildScope.$name = "ng-repeat";
                    }
                    else if (angular.element(childNode).data("$ngControllerController")) {
                        var constructor: string = angular.element(childNode).data("$ngControllerController").constructor;

                        // Workaround for IE, name property of constructor return undefined :/
                        // Get the name from the constructor function as string
                        var name: string = constructor.toString().match(/function (\w+)\(/)[1];

                        cleanedChildScope.$type = ScopeType.Controller;
                        cleanedChildScope.$name = name;
                    }

                    parentScope.$children.push(cleanedChildScope);

                    this._findChildrenScopes(childNode, cleanedChildScope);
                } else {
                    this._findChildrenScopes(childNode, parentScope);
                }
            }
        }

        private _listenScopeChanges(scope: any) {
            scope.$watch((newValue, oldValue) => {
                this._markForRefresh();
            });
        }

        private _scopePropertiesNamesToExclude: string[] = ["$$applyAsyncQueue", "$$asyncQueue", "$$childHead", "$$ChildScope", "$$childTail", "$$destroyed", "$$isolateBindings", "$$listenerCount", "$$listeners", "$$nextSibling", "$$phase", "$$postDigest", "$$postDigestQueue", "$$prevSibling", "$$transcluded", "$$watchers", "$$watchersCount", "$apply", "$applyAsync", "$broadcast", "$childTail", "$destroy", "$digest", "$emit", "$eval", "$evalAsync", "$even", "$first", "$index", "$last", "$middle", "$new", "$odd", "$on", "$parent", "$root", "$watch", "$watchCollection", "$watchGroup"];

        private _cleanScope(scope: any): Scope {
            var scopePackaged: Scope = {
                $id: null,
                $parentId: null,
                $children: [],
                $functions: [],
                $type: ScopeType.Controller,
                $name: ""
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
            if(typeof angular == 'undefined')
                return;
                
            if (receivedObject.type === MessageType.ReloadWithDebugInfo) {
                angular.reloadWithDebugInfo();
            }
        }
    }

    // Register
    Core.RegisterClientPlugin(new NgInspectorClient());
}