///<reference path="../../typings/botbuilder/botbuilder.d.ts" />

module VORLON {
    export class BotFrameworkInspectorClient extends ClientPlugin {
        private _libraryHooked:boolean;
        private _botInfo:BotInfo;

        constructor() {
            super("botFrameworkInspector");
            //this.debug = true;
            this._ready = true;
            this._libraryHooked = false;
            this._botInfo = new BotInfo();
        }

        public startClientSide(): void {
            this.hookLibraryDialogFunction()
        }

        public hookLibraryDialogFunction(){
            var path = require("path");
            var requireHook = require("require-hook");
            requireHook.attach(path.resolve());

            var that = this;
            requireHook.setEvent(function(result, e){
                if (!that._libraryHooked && e.require === "botbuilder") {
                    var previousDialogFunction = result.Library.prototype.dialog;
                    
                    result.Library.prototype.dialog = function(id: string, dialog?: any | any[] | any) {
                        if(dialog){
                            var dialogData = new DialogData();
                            dialogData.id = id;
                            dialogData.dialog = dialog;
                            that._botInfo.dialogDataList.push(dialogData);
                            that.refresh();
                        }                        
                        return previousDialogFunction.apply(this, arguments);
                    }

                    that._libraryHooked = true;
                }
                return result;                        
            });  
        }

        public getID(): string {
            return "BOTFRAMEWORKINSPECTOR";
        }

        public refresh(): void {
            this.sendToDashboard(this._botInfo);
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new BotFrameworkInspectorClient());
} 