module VORLON {
    declare var $: any;
    declare var angular: any;
    class NgExplorerPlugin extends Plugin {

        constructor() {
            super("ngExplorer", "control.html", "control.css");
            this._ready = true;
            console.log('Started ngExplorer');
        }

        public getID(): string {
            return "NGEXPLORER";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        }

        // Client side
        public startClientSide(): void {
            var rootScope = this._findRootScope(<Node>document.body);
            var packagedRootScope = this._packageScope(rootScope);
            Core.Messenger.sendRealtimeMessage(this.getID(), packagedRootScope, RuntimeSide.Client, "message", true);
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            Core.Messenger.sendRealtimeMessage(this.getID(), {}, RuntimeSide.Client, "message", true);
        }

        private _findRootScope(element: Node): any {
            var rootScope = angular.element(element).scope();
            if (rootScope) {
                return rootScope;
            }

            for (var i = 0; i < element.childNodes.length; i++) {
                var childNode = element.childNodes[i];
                rootScope = angular.element(childNode).scope();
                if (!!rootScope) {
                    break;
                }
                else {
                    rootScope = this._findRootScope(childNode);
                }
            }

            return rootScope;
        }

        private _scopePropertiesNames: string[] = ["$$applyAsyncQueue", "$$asyncQueue", "$$childHead", "$$ChildScope", "$$childTail", "$$destroyed", "$$isolateBindings", "$$listenerCount", "$$listeners", "$$nextSibling", "$$phase", "$$postDigest", "$$postDigestQueue", "$$prevSibling", "$$transcluded", "$$watchers", "$apply", "$applyAsync", "$broadcast", "$childTail", "$destroy", "$digest", "$emit", "$eval", "$evalAsync", "$even", "$first", "$index", "$last", "$middle", "$new", "$odd", "$on", "$parent", "$root", "$watch", "$watchCollection", "$watchGroup"];
        private _packageScope(scope: any): any {
            var scopePackaged: any = {};
            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._scopePropertiesNames.indexOf(key) === -1) {
                    scopePackaged[key] = scope[key];
                }
            }

            if (scope.$parent !== null) {
                scopePackaged.$parent = scope.$parent.$id;
            }

            return scopePackaged;
        }

        // Dashboard side
        private _containerDiv: HTMLElement;
        private _scopesView: HTMLElement;
        private _scopeDetailsView: HTMLElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = filledDiv;

                this._scopesView = Tools.QuerySelectorById(filledDiv, "scopes-view");
                this._scopeDetailsView = Tools.QuerySelectorById(filledDiv, "scope-details-view");

                $('.ng-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
            })
        }

        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            console.log(receivedObject);
        }
    }

    Core.RegisterPlugin(new NgExplorerPlugin());
}
