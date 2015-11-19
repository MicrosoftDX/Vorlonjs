module VORLON {
	export class Production{
		public isActivated : boolean;
		
		constructor(public vorlonServerUrl: string, public vorlonSessionId : string, public useLocalStorage?: boolean){
			var storage = useLocalStorage ? localStorage : sessionStorage;
			var mustActivate = storage["vorlonActivation"] === "true";
			
			if (this.vorlonServerUrl && this.vorlonServerUrl[this.vorlonServerUrl.length-1] !== '/'){
				this.vorlonServerUrl = this.vorlonServerUrl + "/";
			}
			
			if (mustActivate){
				this.addVorlonScript();
			}
		}
		
		addVorlonScript(){
			var storage = this.useLocalStorage ? localStorage : sessionStorage;
			storage["vorlonActivation"] = "true";
			this.isActivated = true;
			
			var scriptElt = <HTMLScriptElement>document.createElement("SCRIPT");
			scriptElt.src = this.vorlonServerUrl + "vorlon.js" + (this.vorlonSessionId ? "/" + this.vorlonSessionId : "");
			document.head.insertBefore(scriptElt, document.head.firstChild);
		}
		
		setIdentity(identity){
			var storage = this.useLocalStorage ? localStorage : sessionStorage;
			storage["vorlonClientIdentity"] = identity;
			var v = <any>VORLON;
			if (v && v.Core){
				v.Core.sendHelo();
			}
		}
		
		getIdentity(){
			var storage = this.useLocalStorage ? localStorage : sessionStorage;
			return storage["vorlonClientIdentity"];
		}
		
		activate(reload : boolean){
			if (this.isActivated)
				return;
			
			if (reload){
				var storage = this.useLocalStorage ? localStorage : sessionStorage;
				storage["vorlonActivation"] = "true";
				this.isActivated = true;
				window.location.reload();
			}else{
				this.addVorlonScript();
			}
		}
		
		deactivate(reload : boolean){
			var storage = this.useLocalStorage ? localStorage : sessionStorage;
			storage["vorlonActivation"] = "false";
			this.isActivated = false;
			if (reload){
				window.location.reload();
			}
		}
	}
}