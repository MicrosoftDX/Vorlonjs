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
        private _currentShownScopeId: number = null;

        private _findRootScopes(element: Node) {
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
        private _ngInspectorScopeProperties: string[] = ["$id", "$parentId", "$children", "$functions", "$type", "$name"];

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
            if (receivedObject.type === MessageType.ReloadWithDebugInfo) {
                angular.reloadWithDebugInfo();
            }
        }

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div,(filledDiv) => {
                var $pluginContainer = $(filledDiv).parent();
                $pluginContainer.on("vorlon.plugins.active", function () {
                    $('.ng-inspector-container').split({
                        orientation: 'vertical',
                        limit: 50,
                        position: '35%'
                    });
                });

                document.getElementsByClassName("scopes-tree-wrapper")[0].addEventListener("click",(e) => {
                    var target = <HTMLElement>e.target;
                    if (target.classList.contains("ng-scope") ||
                        target.parentElement.classList.contains("ng-scope")) {
                        var dataAttribute = target.attributes["data-scope-id"] ||
                            target.parentElement.attributes["data-scope-id"];
                        var scopeId = parseInt(dataAttribute.value);
                        this.showScopeDetail(scopeId);
                    }
                    else if (target.classList.contains("ng-property") ||
                        target.parentElement.classList.contains("ng-property")) {
                        // Finir click
                    }
                });

                document.getElementById("reloadAppWithDebugInfo").addEventListener("click",(e) => {
                    Core.Messenger.sendRealtimeMessage(this.getID(), { type: MessageType.ReloadWithDebugInfo }, RuntimeSide.Dashboard, "message");
                    (<HTMLElement>document.getElementsByClassName("no-scope-found")[0]).style.display = "none";
                });

                this._ready = true;
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === "contentchanged") {
                return;
            }

            this._rootScopes = receivedObject.scopes;

            if (!this._rootScopes || this._rootScopes.length === 0) {
                (<HTMLElement>document.getElementsByClassName("scopes-tree-wrapper")[0]).innerHTML = "";
                (<HTMLElement>document.getElementsByClassName("scope-details-wrapper")[0]).innerHTML = "";
                (<HTMLElement>document.getElementsByClassName("no-scope-found")[0]).style.display = "block";
            } else {
                (<HTMLElement>document.getElementsByClassName("scopes-tree-wrapper")[0]).innerHTML = this._formatScopesTree(receivedObject.scopes);
                (<HTMLElement>document.getElementsByClassName("no-scope-found")[0]).style.display = "none";

                if (this._currentShownScopeId) {
                    this.showScopeDetail(this._currentShownScopeId);
                }
            }
        }

        private _formatScopesTree(scopes: Scope[]): string {
            var dom = '<ul class="scopes-tree">';
            for (var i = 0; i < scopes.length; i++) {
                dom += "<li>" + this._formatScopeNode(scopes[i]) + "</li>";
            }

            dom += "</ul>";

            return dom;
        }

        private _scopeNodeTemplate: string =
        '<a class="ng-scope SCOPECLASSTOREPLACE" data-scope-id="SCOPEIDTOREPLACE">' +
        '   SCOPEICONTOREPLACE' +
        '   <span class="scope-name">SCOPENAMETOREPLACE</span> ' +
        '   <span class="scope-id">(SCOPEIDTOREPLACE)</span>' +
        '</a>SCOPECHILDRENTOREPLACE';
        private _formatScopeNode(scope: Scope): string {
            var scopeClass: string = "",
                scopeId: number = scope.$id,
                scopeName: string = scope.$name,
                iconName: string = "";
            switch (scope.$type) {
                case ScopeType.NgRepeat:
                    scopeClass = "ng-repeat-scope";
                    iconName = "fa-repeat";
                    break;
                case ScopeType.RootScope:
                    scopeClass = "root-scope";
                    iconName = "fa-arrows-alt";
                    break;
                case ScopeType.Controller:
                    scopeClass = "controller-scope";
                    iconName = "fa-crosshairs";
                    break;
                case ScopeType.Directive:
                    scopeClass = "directive-scope";
                    iconName = "caret-square-o-down";
                    break;
            }

            return this._scopeNodeTemplate
                .replace("SCOPECLASSTOREPLACE", scopeClass)
                .replace(/SCOPEIDTOREPLACE/g, scopeId.toString())
                .replace("SCOPENAMETOREPLACE", scopeName)
                .replace("SCOPEICONTOREPLACE", this._formatScopePropertyIconTemplate(iconName))
                .replace("SCOPECHILDRENTOREPLACE", this._formatScopesTree(scope.$children));
        }

        private _scopePropertyIconTemplate: string =
        '<span class="fa-stack fa">' +
        '   <i class="fa fa-square-o fa-stack-2x"></i>' +
        '   <i class="fa ICONNAMETOREPLACE fa-stack-1x">TEXTTOREPLACE</i>' +
        ' </span>';
        private _formatScopePropertyIconTemplate(iconName: string, text: string = ""): string {
            return this._scopePropertyIconTemplate
                .replace("ICONNAMETOREPLACE", iconName)
                .replace("TEXTTOREPLACE", text);
        }

        private _scopePropertyTemplate: string =
        '<li>' +
        '   <a class="ng-property PROPERTYTYPECLASSTOREPLACE">' +
        '       ICONTOREPLACE' +
        '       <span class="ng-property-name">' +
        '           PROPERTYTYPETOREPLACE : ' +
        '       </span>' +
        '       <span class="ng-property-value">' +
        '           PROPERTYVALUETOREPLACE' +
        '       </span>' +
        '       <span class="ng-sub-properties-length">' +
        '           (SUBLENGTHOREPLACE)' +
        '       </span>' +
        '   </a>SUBPROPERTIESTOREPLACE' +
        '</li>';

        private _formatScopePropertyTemplate(
            icon: string,
            propertyName: string,
            propertyValue: any,
            subProperties: string,
            propertyTypeClass: string,
            subPropertiesLength: number = null): string {
            return this._scopePropertyTemplate
                .replace("ICONTOREPLACE", icon)
                .replace("PROPERTYTYPECLASSTOREPLACE", propertyTypeClass)
                .replace("PROPERTYTYPETOREPLACE", propertyName)
                .replace("PROPERTYVALUETOREPLACE", propertyValue)
                .replace("SUBPROPERTIESTOREPLACE", subProperties)
                .replace("SUBLENGTHOREPLACE", subPropertiesLength === null ? "" : subPropertiesLength.toString());
        }

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
            var propertyType: PropertyType = this._getPropertyType(prop),
                subProperties: string = "",
                value = prop,
                name = key,
                iconName: string = "",
                iconText: string = "",
                subPropertiesLength: number = null,
                propertyTypeClass: string = "";

            switch (propertyType) {
                case PropertyType.Array:
                    subProperties = this._renderScopeSubLevelDetails(prop);
                    subPropertiesLength = prop.length;
                    value = "[...]";
                    iconText = "[ ]";
                    propertyTypeClass = "ng-property-array";
                    break;
                case PropertyType.Object:
                    subProperties = this._renderScopeSubLevelDetails(prop);
                    subPropertiesLength = 0;
                    var keys = Object.keys(prop);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (this._ngInspectorScopeProperties.indexOf(key) === -1) {
                            subPropertiesLength++;
                        }
                    }

                    value = "{...}";
                    iconText = "{ }";
                    propertyTypeClass = "ng-property-object";
                    break;
                case PropertyType.Null:
                    value = "null";
                    iconName = "fa-ban";
                    propertyTypeClass = "ng-property-null";
                    break;
                case PropertyType.Number:
                    iconText = "#";
                    propertyTypeClass = "ng-property-number";
                    break;
                case PropertyType.String:
                    iconName = "fa-font";
                    propertyTypeClass = "ng-property-string";
                    break;
                case PropertyType.Boolean:
                    iconName = "fa-check";
                    propertyTypeClass = "ng-property-boolean";
                    break;
            }

            return this._formatScopePropertyTemplate(
                this._formatScopePropertyIconTemplate(iconName, iconText),
                name,
                value,
                subProperties,
                propertyTypeClass,
                subPropertiesLength);
        }

        private _renderScopeSubLevelDetails(prop: any): string {
            var elem = '<ul class="scope-properties">';
            if (prop instanceof Array) {
                for (var i = 0; i < prop.length; i++) {
                    elem += this._renderScopeProperty(prop[i], i.toString());
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

            return this._scopePropertyIconTemplate
                .replace("ICONNAME", iconName)
                .replace("TEXTTOREPLACE", text);
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

        private _getPropertyType(property: any): PropertyType {
            var propertyType: string = typeof (property);
            switch (propertyType) {
                case "object":
                    if (property == null) {
                        return PropertyType.Null;
                    }
                    else if (property instanceof Array) {
                        return PropertyType.Array;
                    } else {
                        return PropertyType.Object;
                    }
                case "number":
                    return PropertyType.Number;
                case "string":
                    return PropertyType.String;
                case "boolean":
                    return PropertyType.Boolean;
            }
        }

        public showScopeDetail(scopeId: number) {
            this._currentShownScopeId = scopeId;
            var scope = this._findScopeById(this._rootScopes, scopeId);
            var scopeDetailsWrapper = (<HTMLElement>document.getElementsByClassName("scope-details-wrapper")[0]);
            if (scope) {
                scopeDetailsWrapper.innerHTML = this._renderScopeDetail(scope);
            } else {
                scopeDetailsWrapper.innerHTML = "";
            }
        }
    }

    enum ScopeType { NgRepeat, RootScope, Controller, Directive };
    enum PropertyType { Array, Object, Number, String, Boolean, Null };

    enum MessageType { ReloadWithDebugInfo };

    // Register
    Core.RegisterPlugin(new NgInspector());
}