module VORLON {
    // export class PerformanceItem {
    //     public name: string;
    // }

    export class BotInfo {
        public dialogDataList: DialogData[];
        public dialogStackHistory:BotDialogstack[];

        /**
         *
         */
        constructor() {
            this.dialogDataList = [];
            this.dialogStackHistory = [];      
        }
    }

    export class DialogData {
        public id:string;
        public dialog:any|any[];
    }

    export class BotDialogstack {
        public sessionState: any;
        public dialogData: any;
        public userData: any;
        public conversationData: any;
        public privateConversationData: any;
        public message: any;
    }
} 