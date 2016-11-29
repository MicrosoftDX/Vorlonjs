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
                QUnit.testDone((details) => {
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
                    this.sendToDashboard(message); 
                });
                QUnit.done((details) => {
                    //console.log("QUnit.done");
                    //console.log(details);
                    var message: any = {};
                    message.commandType = "done";
                    message.failed = details.failed;
                    message.passed = details.passed;
                    message.total = details.total;
                    message.runtime = details.runtime;
                    this.sendToDashboard(message);
                });
            });
        }

        public refresh(): void {
            
        }
        
        public runTest(testContent: any): void {
             eval(testContent);
        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            
        }
    }
            
    UnitTestRunnerClient.prototype.ClientCommands = {
        runTest: function (data) {
            var plugin = <UnitTestRunnerClient>this;
            plugin.runTest(data);
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new UnitTestRunnerClient());
} 