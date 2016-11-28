///<reference path="../../typings/botbuilder/botbuilder.d.ts" />
var path = require("path");
var requireHook = require("require-hook");

module VORLON {
    export class BotFrameworkInspectorClient extends ClientPlugin {
        private _hooked:boolean;
        private _botInfo:BotInfo;

        constructor() {
            super("botFrameworkInspector");
            //this.debug = true;
            this._ready = true;
            this._hooked = false;
            this._botInfo = new BotInfo();
        }

        public startClientSide(): void {
            requireHook.attach(path.resolve());
            this.hookBotFrameworkFunctions();
        }

        public hookBotFrameworkFunctions(){
            var that = this;
            requireHook.setEvent(function(result, e){
                if (!that._hooked && e.require === "botbuilder") {
                    //Hooking onSave on Session class
                    var previousSendBatchFunction = result.Session.prototype.sendBatch;
                    
                    result.Session.prototype.sendBatch = function(callback:any) {
                        var returned = previousSendBatchFunction.apply(this, arguments);
                        var previousOnSaveFunction = this.options.onSave;
                        
                        var thatSession = this;
                        this.options.onSave(function(err:any){

                            var botCallStack = new BotDialogSessionInfo();
                            botCallStack.sessionState = thatSession.sessionState;
                            botCallStack.conversationData = thatSession.conversationData;
                            botCallStack.dialogData = thatSession.dialogData;
                            botCallStack.privateConversationData = thatSession.privateConversationData;
                            botCallStack.userData = thatSession.userData;

                            var found = false;
                            that._botInfo.userEntries.forEach((entry) =>{
                                if(entry.message.address.id === thatSession.message.address.id){
                                    entry.dialogStacks.push(botCallStack);
                                    found = true;
                                }
                            });

                            if(!found){
                                var newEntry = new UserEntry();
                                newEntry.message = thatSession.message;
                                newEntry.dialogStacks.push(botCallStack);
                                that._botInfo.userEntries.push(newEntry);
                            }
                            
                            that.refresh();
                            return previousOnSaveFunction.apply(this, arguments);
                        });
                        
                        return returned;
                    }

                    // Hooking Dialog on Library class
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

                    that._hooked = true;
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