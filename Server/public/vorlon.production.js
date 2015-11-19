var VORLON;
(function (VORLON) {
    var Production = (function () {
        function Production(vorlonServerUrl, vorlonSessionId, useLocalStorage) {
            this.vorlonServerUrl = vorlonServerUrl;
            this.vorlonSessionId = vorlonSessionId;
            this.useLocalStorage = useLocalStorage;
            var storage = useLocalStorage ? localStorage : sessionStorage;
            var mustActivate = storage["vorlonActivation"] === "true";
            if (this.vorlonServerUrl && this.vorlonServerUrl[this.vorlonServerUrl.length - 1] !== '/') {
                this.vorlonServerUrl = this.vorlonServerUrl + "/";
            }
            if (mustActivate) {
                this.addVorlonScript();
            }
        }
        Production.prototype.addVorlonScript = function () {
            var storage = this.useLocalStorage ? localStorage : sessionStorage;
            storage["vorlonActivation"] = "true";
            this.isActivated = true;
            var scriptElt = document.createElement("SCRIPT");
            scriptElt.src = this.vorlonServerUrl + "vorlon.js" + (this.vorlonSessionId ? "/" + this.vorlonSessionId : "");
            document.head.insertBefore(scriptElt, document.head.firstChild);
        };
        Production.prototype.setIdentity = function (identity) {
            var storage = this.useLocalStorage ? localStorage : sessionStorage;
            storage["vorlonClientIdentity"] = identity;
            var v = VORLON;
            if (v && v.Core) {
                v.Core.sendHelo();
            }
        };
        Production.prototype.getIdentity = function () {
            var storage = this.useLocalStorage ? localStorage : sessionStorage;
            return storage["vorlonClientIdentity"];
        };
        Production.prototype.activate = function (reload) {
            if (this.isActivated)
                return;
            if (reload) {
                var storage = this.useLocalStorage ? localStorage : sessionStorage;
                storage["vorlonActivation"] = "true";
                this.isActivated = true;
                window.location.reload();
            }
            else {
                this.addVorlonScript();
            }
        };
        Production.prototype.deactivate = function (reload) {
            var storage = this.useLocalStorage ? localStorage : sessionStorage;
            storage["vorlonActivation"] = "false";
            this.isActivated = false;
            if (reload) {
                window.location.reload();
            }
        };
        return Production;
    })();
    VORLON.Production = Production;
})(VORLON || (VORLON = {}));
