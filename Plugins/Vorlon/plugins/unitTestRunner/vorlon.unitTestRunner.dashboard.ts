module VORLON {
    export class UnitTestRunnerDashboard extends DashboardPlugin {
        constructor() {
            super("unitTestRunner", "control.html", "control.css");
            this._ready = true;
        }

        public getID(): string {
            return "UNITTEST";
        }

        private _btnRunTest: HTMLElement;
        private _inputFile: HTMLElement;
        private _dropPanel: HTMLElement;
        private _txtRunTest: HTMLTextAreaElement;
        private _containerList: HTMLElement;
        private _containerSummary: HTMLElement;

        public handleFileSelect(files: FileList): void {
            this._txtRunTest.innerHTML = "";
            var reader = [];
            for (var i = 0, f; f = files[i]; i++) {
                reader.push(new FileReader());
                reader[i].onload = (e) => {
                    this._txtRunTest.innerHTML += e.target.result;
                };
                reader[i].readAsText(f);
            }
        }
        public startDashboardSide(div: HTMLDivElement = null): void {
            var self = this;

            this._insertHtmlContentAsync(div,(filledDiv) => {
                this._btnRunTest = Tools.QuerySelectorById(div, "runTest");
                this._inputFile = Tools.QuerySelectorById(div, "files");
                this._inputFile.onchange = (evt) => {
                    this.handleFileSelect((<HTMLInputElement>evt.target).files);
                };
                this._dropPanel = Tools.QuerySelectorById(div, "dropPanel");
                this._dropPanel.ondrop = (evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    this.handleFileSelect(evt.dataTransfer.files);
                };
                this._dropPanel.ondragover = (evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    evt.dataTransfer.dropEffect = 'copy';
                };
                this._dropPanel.ondragenter = (evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    self._dropPanel.classList.add("droppable");
                };
                this._dropPanel.ondragleave= (evt) => {
                    evt.stopPropagation();
                    evt.preventDefault();
                    self._dropPanel.classList.remove("droppable");
                };
                this._txtRunTest = <HTMLTextAreaElement>Tools.QuerySelectorById(div, "txtRunTest");
                this._btnRunTest.addEventListener("run",() => {
                    var message: any = {};
                    message.commandType = "runTest";
                    message.testContent = this._txtRunTest.value;
                    //console.log("runTest");
                    //console.log(message);
                    this.sendCommandToClient(message);
                });

                this._containerList = Tools.QuerySelectorById(div, "testResultsList");
                this._containerSummary = Tools.QuerySelectorById(div, "testResultsSummary");
            })
        }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            //console.log(receivedObject);
            switch (receivedObject.commandType) {
                case "testDone":
                    var tr = document.createElement('tr');
                    var tdName = document.createElement('td');
                    var tdModule = document.createElement('td');
                    var tdPassed = document.createElement('td');
                    var tdFailed = document.createElement('td');
                    var tdTime = document.createElement('td');
                    var tdTotal = document.createElement('td');

                    tdName.innerHTML = receivedObject.name;
                    tdModule.innerHTML = receivedObject.module;
                    tdPassed.innerHTML = receivedObject.passed;
                    tdFailed.innerHTML = receivedObject.failed;
                    tdTime.innerHTML = receivedObject.runtime;
                    tdTotal.innerHTML = receivedObject.total;

                    tr.appendChild(tdName);
                    tr.appendChild(tdModule);
                    tr.appendChild(tdPassed);
                    tr.appendChild(tdFailed);
                    tr.appendChild(tdTime);
                    tr.appendChild(tdTotal);

                    this._containerList.appendChild(tr);
                    break;
                case "done":
                    var tdName = document.createElement('th');
                    var tdModule = document.createElement('th');
                    var tdPassed = document.createElement('th');
                    var tdFailed = document.createElement('th');
                    var tdTime = document.createElement('th');
                    var tdTotal = document.createElement('th');

                    tdPassed.innerHTML = receivedObject.passed;
                    tdFailed.innerHTML = receivedObject.failed;
                    //** Need to fix because receivedObject.runtime return a wrong value
                    //   it's a Qunit problem
                    tdTime.innerHTML = "";// receivedObject.runtime;
                    //**
                    tdTotal.innerHTML = receivedObject.total;

                    this._containerSummary.innerHTML = "";
                    this._containerSummary.appendChild(tdName);
                    this._containerSummary.appendChild(tdModule);
                    this._containerSummary.appendChild(tdPassed);
                    this._containerSummary.appendChild(tdFailed);
                    this._containerSummary.appendChild(tdTime);
                    this._containerSummary.appendChild(tdTotal);
                    break;
            }
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new UnitTestRunnerDashboard());
} 