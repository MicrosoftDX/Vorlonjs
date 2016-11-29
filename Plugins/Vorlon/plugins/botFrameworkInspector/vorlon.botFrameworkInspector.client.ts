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

        private clone(obj:any):any{
            return (JSON.parse(JSON.stringify(obj || {})));
        }

        private addDialogStack(session:any, eventType:EventType, impactedDialogId:string = undefined){
            var botCallStack = new BotDialogSessionInfo();
            botCallStack.sessionState = this.clone(session.sessionState);
            botCallStack.conversationData = this.clone(session.conversationData);
            botCallStack.dialogData = this.clone(session.dialogData);
            botCallStack.privateConversationData = this.clone(session.privateConversationData);
            botCallStack.userData = this.clone(session.userData);
            botCallStack.eventType = eventType;
            botCallStack.impactedDialogId = impactedDialogId;

            var found = false;
            this._botInfo.userEntries.forEach((entry) =>{
                if(entry.message.address.id === session.message.address.id){
                    entry.dialogStacks.push(botCallStack);
                    found = true;
                }
            });

            if(!found){
                var newEntry = new UserEntry();
                newEntry.message = session.message;
                newEntry.dialogStacks.push(botCallStack);
                this._botInfo.userEntries.push(newEntry);
            }
            
            this.refresh();
        };

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
                            var returned = previousOnSaveFunction.apply(this, arguments);
                            that.addDialogStack(thatSession, EventType.FinalState);                            
                            return returned;
                        });
                        
                        return returned;
                    }

                    //Hooking beginDialog on Session class
                    var previousBeginDialogFunction = result.Session.prototype.beginDialog;

                    result.Session.prototype.beginDialog = function(id: string, args?: any) {
                        that.addDialogStack(this, EventType.BeginDialog, id);
                        return previousBeginDialogFunction.apply(this, arguments);                           
                    }

                    //Hooking endDialog on Session class
                    var previousEndDialogFunction = result.Session.prototype.endDialog;

                    result.Session.prototype.endDialog = function(message?: any, ...args: any[]) {
                        that.addDialogStack(this, EventType.EndDialog);
                        return previousEndDialogFunction.apply(this, arguments);                           
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