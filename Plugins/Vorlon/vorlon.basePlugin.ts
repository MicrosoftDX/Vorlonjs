module VORLON {
    export class BasePlugin {
        public _ready = true;
        protected _id = "";
        protected _debug: boolean;
        public _type = PluginType.OneOne;
        public trace : (msg) => void;
        protected traceLog = (msg) => { console.log(msg); };
        protected traceNoop = (msg) => { };
        public loadingDirectory = "vorlon/plugins";

        constructor(public name: string) {
            this.debug = Core.debug;
        }

        public get Type(): PluginType {
            return this._type;
        }
        
        public get debug(): boolean {
            return this._debug;
        }
        
        public set debug(val: boolean) {
            this._debug = val;
            if (val){
                this.trace = this.traceLog;
            }else{
                this.trace = this.traceNoop;
            }
        }

        public getID(): string {
            return this._id;
        }

        public isReady() {
            return this._ready;
        }
    }
}
