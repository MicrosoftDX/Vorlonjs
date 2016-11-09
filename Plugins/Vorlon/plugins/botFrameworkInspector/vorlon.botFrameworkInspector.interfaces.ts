module VORLON {
    // export class PerformanceItem {
    //     public name: string;
    // }

    export class BotInfo {
        public dialogDataList: DialogData[];
        public callStackHistory:BotCallstack[];

        /**
         *
         */
        constructor() {
            this.dialogDataList = [];
            this.callStackHistory = [];      
        }
    }

    export class DialogData {
        public id:string;
        public dialog:any|any[];
    }

    export class BotCallstack {
        public callstack:any[];
    }
} 