module VORLON {
    export class BasePlugin {
        public _ready = true;
        protected _id = "";
        public _type = PluginType.OneOne;
        public loadingDirectory = "/plugin";

        constructor(public name: string) {
        }

        public get Type(): PluginType {
            return this._type;
        }

        public getID(): string {
            return this._id;
        }

        public isReady() {
            return this._ready;
        }
    }
}
