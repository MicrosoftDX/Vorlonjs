module VORLON {
    // export class PerformanceItem {
    //     public name: string;
    // }

    export enum EventType {
        BeginDialog, FinalState, EndDialog
    }

    export class BotInfo {
        public dialogDataList: DialogData[];
        public userEntries:UserEntry[];

        /**
         *
         */
        constructor() {
            this.dialogDataList = [];
            this.userEntries = [];      
        }
    }

    export class DialogData {
        public id:string;
        public dialog:any|any[];
    }

    export class UserEntry {
        public dialogStacks:BotDialogSessionInfo[];
        public message: any;

        constructor() {
            this.dialogStacks = [];
        }
    }

    export class BotDialogSessionInfo {
        public eventType: EventType;
        public sessionState: any;
        public dialogData: any;
        public userData: any;
        public conversationData: any;
        public privateConversationData: any;
        public impactedDialogId: any;
    }
} 