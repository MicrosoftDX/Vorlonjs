module VORLON {

    declare var QUnit;

    export class UnitTestRunnerClient extends ClientPlugin {
        //public localStorageList: KeyValue[] = [];

        constructor() {
            super("unitTestRunner");
            this._ready = false;
        }

        public getID(): string {
            return "UNITTEST";
        }

        public startClientSide(): void {
            this._loadNewScriptAsync("qunit.js",() => {
                var self = this;
                this._ready = true;
                QUnit.testDone(function (details) {
                    //console.log("QUnit.testDone");
                    //console.log(details);
                    var message: any = {};
                    message.commandType = "testDone";
                    message.name = details.name;
                    message.module = details.module;
                    message.failed = details.failed;
                    message.passed = details.passed;
                    message.total = details.total;
                    message.runtime = details.runtime;
                    Core.Messenger.sendRealtimeMessage(self.getID(), message, RuntimeSide.Client, "message");
                });
                QUnit.done(function (details) {
                    //console.log("QUnit.done");
                    //console.log(details);
                    var message: any = {};
                    message.commandType = "done";
                    message.failed = details.failed;
                    message.passed = details.passed;
                    message.total = details.total;
                    message.runtime = details.runtime;
                    Core.Messenger.sendRealtimeMessage(self.getID(), message, RuntimeSide.Client, "message", false, "done");
                });
            });
        }

        public refresh(): void {
            
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            //console.log("onRealtimeMessageReceivedFromDashboardSide");
            //console.log(receivedObject);
            switch (receivedObject.commandType) {
                case "runTest":
                    eval(receivedObject.testContent);
                    break;
            }
        }

    }

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new UnitTestRunnerClient());
} 