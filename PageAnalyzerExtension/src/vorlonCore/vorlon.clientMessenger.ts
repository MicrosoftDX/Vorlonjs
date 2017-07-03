window.browser = window.msBrowser ||
                 window.browser  ||
                 window.chrome;

module VORLON {
    export interface VorlonMessageMetadata {
        pluginID : string;
        side : RuntimeSide;
        messageType: string;
    }

    export interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string;
        data? : any;
    }

    export class ClientMessenger {
        private _targetTabId: number;
        public onRealtimeMessageReceived: (message: VorlonMessage) => void;
        
        constructor(side: RuntimeSide, targetTabId?: number) {
            this._targetTabId = targetTabId;
            
            switch (side) {
                case RuntimeSide.Client:
                    browser.runtime.onMessage.addListener(
                        (request: VorlonMessage, sender, sendResponse) => {
                            this.onRealtimeMessageReceived(request);
                        });
                    break;
                case RuntimeSide.Dashboard:                  
                   browser.runtime.onMessage.addListener(
                        (request, sender, sendResponse) => {
                            this.onRealtimeMessageReceived(request);
                        });
                    break;
                }
            }

            public sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType = "message", command?:string): void {
                var message: VorlonMessage = {
                    metadata: {
                        pluginID: pluginID,
                        side: side,
                        messageType: messageType
                    },
                    data: objectToSend
                };

                if (command) {
                    message.command = command;
                }

                switch (side) {
                    case RuntimeSide.Client:
                        browser.runtime.sendMessage(message);
                        break;
                    case RuntimeSide.Dashboard:
                        browser.tabs.sendMessage(this._targetTabId, message);
                        break;
            }
        }
    }
}
