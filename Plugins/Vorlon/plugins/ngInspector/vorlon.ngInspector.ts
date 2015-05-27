module VORLON {
    declare var $: any;
    declare var angular: any;

    interface Scope {
        $id: number;
        $parentId: number;
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
                this._packageAndSendScopes();
            });
        }

        private _packageAndSendScopes(): void {
            this._findScopes();

            Core.Messenger.sendRealtimeMessage(this.getID(), { scopes: this._scopes }, RuntimeSide.Client, "message");
        }

        private _scopes: any = [];

        private _findScopes(): void {
            this._scopes = [];
            var scopedElements = document.getElementsByClassName("ng-scope");

            for (var i = 0; i < scopedElements.length; i++) {
                var scope = angular.element(scopedElements[i]).scope();

                var packagedScope = this._packageScope(scope);
                this._scopes[packagedScope.$id] = packagedScope;
            }
        }

        private _scopePropertiesNames: string[] = ["$$applyAsyncQueue", "$$asyncQueue", "$$childHead", "$$ChildScope", "$$childTail", "$$destroyed", "$$isolateBindings", "$$listenerCount", "$$listeners", "$$nextSibling", "$$phase", "$$postDigest", "$$postDigestQueue", "$$prevSibling", "$$transcluded", "$$watchers", "$apply", "$applyAsync", "$broadcast", "$childTail", "$destroy", "$digest", "$emit", "$eval", "$evalAsync", "$even", "$first", "$index", "$last", "$middle", "$new", "$odd", "$on", "$parent", "$root", "$watch", "$watchCollection", "$watchGroup"];
        private _packageScope(scope: any): Scope {
            var scopePackaged: Scope = {
                $id: null,
                $parentId: null
            };
            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._scopePropertiesNames.indexOf(key) === -1) {
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