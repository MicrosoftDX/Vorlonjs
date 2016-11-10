module VORLON {
    export class BotFrameworkInspectorDashboard extends DashboardPlugin {
        private _blocksDefinition = `callstack0=>condition: 0|timeline`;
        private _callstacksGraphDefinition = [];
        private _chart;
        private _dialogsList: HTMLUListElement;

        constructor() {
            super("botFrameworkInspector", "control.html", "control.css");
            this._ready = false;
            this._id = "BOTFRAMEWORKINSPECTOR";
        }

        private _lastReceivedBotInfo: BotInfo;
        private _containerDiv: HTMLElement;

        private _newCallStack(sessionState) {
            var csIndex = this._callstacksGraphDefinition.length + 1;
            var csBlock = `callstack${csIndex}=>condition: ${csIndex}|timeline`;
            this._blocksDefinition += '\n' + csBlock;

            if (sessionState.callstack.length > 0) {
                sessionState.callstack.forEach((element, i) => {
                    let block = `block${i}callstack${csIndex - 1}=>inputoutput: ${element.id}`;
                    if (element.state["BotBuilder.Data.WaterfallStep"] != undefined){
                        block += " - step:" + element.state["BotBuilder.Data.WaterfallStep"]
                    }
                    this._blocksDefinition += '\n' + block;
                });
            }
            else {
                let block = `block0callstack${csIndex - 1}=>inputoutput: Empty callstack`;
                this._blocksDefinition += '\n' + block;
            }

            var csGraphDefinition = [];

            let graphDef = `callstack${csIndex - 1}(yes, right)->callstack${csIndex}\ncallstack${csIndex - 1}(no)->block0callstack${csIndex - 1}->`;

            for (let i = 1; i < sessionState.callstack.length; i++) {
                graphDef += `block${i}callstack${csIndex - 1}->`;
            }

            csGraphDefinition.push(graphDef);

            this._callstacksGraphDefinition.push(csGraphDefinition);
        }

        private _updateSVGGraph() {
            var code = this._generateCompleteGraphCode();
            if (this._chart) {
                this._chart.clean();
            }
            this._chart = window.flowchart.parse(code);

            this._chart.drawSVG('canvas', {
                // 'x': 30,
                // 'y': 50,
                'line-width': 3,
                'maxWidth': 3,//ensures the flowcharts fits within a certian width
                'line-length': 50,
                'text-margin': 10,
                'font-size': 14,
                'font': 'normal',
                'font-family': 'Helvetica',
                'font-weight': 'normal',
                'font-color': 'black',
                'line-color': 'black',
                'element-color': 'black',
                'fill': 'white',
                'yes-text': 'yes',
                'no-text': 'no',
                'arrow-end': 'block',
                'scale': 1,
                'symbols': {
                    'start': {
                        'font-color': 'red',
                        'element-color': 'green',
                        'fill': 'yellow'
                    },
                    'end': {
                        'class': 'end-element'
                    }
                },
                'flowstate': {
                    'past': { 'fill': '#CCCCCC', 'font-size': 12 },
                    'current': { 'fill': 'yellow', 'font-color': 'red', 'font-weight': 'bold' },
                    'future': { 'fill': '#FFFF99' },
                    'request': { 'fill': 'blue' },
                    'invalid': { 'fill': '#444444' },
                    'timeline': { 'fill': '#58C4A3', 'font-size': 12, 'yes-text': ' ', 'no-text': ' ' },
                    'rejected': { 'fill': '#C45879', 'font-size': 12, 'yes-text': 'n/a', 'no-text': 'REJECTED' }
                }
            });
        }

        private _generateCompleteGraphCode() {
            var graphCode = this._blocksDefinition + '\n';

            this._callstacksGraphDefinition.forEach((csGraphCode) => {
                csGraphCode.forEach((blockCode) => {
                    graphCode += blockCode + '\n';
                });
            });

            return graphCode;
        }

        private _loadScript(url, callback) {
            var script = document.createElement("script")
            script.type = "text/javascript";

            script.onload = function () {
                callback();
            };

            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._loadScript("http://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.0/raphael-min.js", () => {
                this._loadScript("http://flowchart.js.org/flowchart-latest.js", () => {
                    this._insertHtmlContentAsync(div, (filledDiv) => {
                        this._dialogsList = <HTMLUListElement>document.getElementById("dialogsList");
                        //this._containerDiv = Tools.QuerySelectorById(div, "botFrameworkInspector");
                        this._ready = true;
                        this.display();
                    })
                })
            })
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            this._lastReceivedBotInfo = receivedObject;
            this.display();
        }

        public display() {
            if (this._lastReceivedBotInfo) {
                this._callstacksGraphDefinition = [];
                this._dialogsList.innerHTML = "";

                this._lastReceivedBotInfo.dialogDataList.forEach((dataList) => {
                    let waterFallStep = 0;
                    if (dataList.dialog && dataList.dialog.length) {
                        waterFallStep = dataList.dialog.length;
                    }

                    let newLi = `<li>${dataList.id} (${waterFallStep} step(s))</li>`;
                    this._dialogsList.innerHTML += newLi;
                });

                this._lastReceivedBotInfo.callStackHistory.forEach((botCallStack) => {
                    console.log(botCallStack.sessionState);
                    this._newCallStack(botCallStack.sessionState);
                });
                this._updateSVGGraph();
            }
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new BotFrameworkInspectorDashboard());
}

interface Window {
    flowchart: FlowChart;
}

interface FlowChart {
    parse(code: string): any;
};