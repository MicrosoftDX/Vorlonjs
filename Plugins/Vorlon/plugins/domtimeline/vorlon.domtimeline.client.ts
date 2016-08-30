/// <reference path="api/vorlon.core.d.ts" />
/// <reference path="api/vorlon.clientPlugin.d.ts" />
/// <reference path="api/mapping-system.d.ts" />
/// <reference path="api/shared-definitions.d.ts" />


// ===============================================================
// 
// ===============================================================
var domTimelineOptions: any;
interface ExtendedMutationRecord extends MutationRecord {
    claim: string
    stack: string
    timestamp: number
    newValue: string
}
var domHistory: {
    
    past: Array<ExtendedMutationRecord>
    future: Array<ExtendedMutationRecord>
    lostFuture: Array<ExtendedMutationRecord>
    
    undo:()=>boolean
    redo:()=>boolean
    
    startRecording:()=>boolean
    stopRecording:()=>boolean
    
    isRecording:boolean
    isRecordingStopped:boolean
    
    generateDashboardData:(knownData:{history:number,lostFuture:number,domData:number})=>any
		
};

// ===============================================================
// 
// ===============================================================
module VORLON {
	export class DOMTimelineClient extends ClientPlugin {
		
		constructor() {
            super("domtimeline"); // Name
            (<any>this)._ready = true; // No need to wait
            //console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "DOMTIMELINE";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard

            //we don't really need to do anything in this sample
        }

        // This code will run on the client //////////////////////

        // Start the clientside code
        public startClientSide(): void {
            var domData : NodeMappingSystem = null;
            //window.addEventListener('DOMContentLoaded', x => console.warn('DOMContentLoaded'));
            //window.addEventListener('load', x => console.warn('load'));
            domTimelineOptions.onRecordingStart = function() {
                domData = MappingSystem.NodeMappingSystem.initFromDocument();
                window["domData"] = domData;
            }
            domTimelineOptions.considerLoggingRecords = function(c,entries,s) {
                if(!domData) return console.warn("domData not yet initalized; entries ignored: ", entries);
                for(var i = entries.length; i--;) {
                    var e = entries[i];
                    // TODO: we should undo then redo all changes
                    ensureDomDataIsUpToDate(e); 
                    e.__dashboardData = generateDashboardDataForEntry(e);
                }
                function ensureDomDataIsUpToDate(e: ExtendedMutationRecord) {
                    if(e.addedNodes && e.addedNodes.length) {
                        for(var i = 0; i < e.addedNodes.length; i++) {
                            var addedNode = e.addedNodes[i];
                            domData.addNodeAndChildren(addedNode);
                        }
                    }
                }
            }
            domHistory.generateDashboardData = function(knownData:{history:number,lostFuture:number,domData:number}) {
                var data:any = {};

                // basic data
                data.url = location.href;
                data.title = document.title;
                data.isRecordingNow = domHistory.isRecording;
                data.isRecordingEnded = domHistory.isRecordingStopped;
                data.isPageFrozen = domHistory.future.length>0;
                data.pastEventsCount = domHistory.past.length;
                data.futureEventsCount = domHistory.future.length;
                data.assumedKnownData = knownData;
                
                // history
                data.history = (
                    []
                    .concat(domHistory.past.map(getDashboardDataForEntry))
                    .concat(domHistory.future.map(getDashboardDataForEntry))
                );
                data.history.splice(0,knownData.history|0);

                // lostFuture
                data.lostFuture = (
                    domHistory.lostFuture.map(getDashboardDataForEntry)
                );
                data.lostFuture.splice(0,knownData.lostFuture|0);

                // domData
                data.domData = domData ? domData.data.slice(knownData.domData|0) : [];

                return data;
            }

            if(!!sessionStorage['domTimelineOptions_startRecordingImmediately']) {
                sessionStorage['domTimelineOptions_startRecordingImmediately'] = false;
                domHistory.startRecording();
            }

            function getDashboardDataForEntry(e) {
                return e.__dashboardData;
            }
            function generateDashboardDataForEntry(e:ExtendedMutationRecord):ClientDataForEntry {
                var targetDescription = descriptionOf(e.target);
                if(e.addedNodes.length > 0) {
                    var nodeDescription = (
                        (e.addedNodes.length == 1) 
                        ? (descriptionOf(e.addedNodes[0])) 
                        : e.addedNodes.length + " nodes"
                    );
                    return {
                        type:"added",
                        description: "Inserted " + nodeDescription + " into " + targetDescription,
                        timestamp: e.timestamp,
                        details: {
                            "Added nodes": descriptionOfNodeList(e.addedNodes),
                            "Target": targetDescription,
                            "Timestamp": Math.round(10*e.timestamp)/10000+"s",
                            "Claim": e.claim,
                            "Stack": "`"+e.stack.split('\n').filter(l => l.indexOf("vorlon.max")==-1).join('\n')+"`"
                        },
                        rawData: {
                            type: "childList",
                            addedNodes: domData.getPointerListFor(e.addedNodes),
                            nextSibling: domData.getPointerFor(e.nextSibling),
                            target: domData.getPointerFor(e.target),
                        }
                    }
                } else if(e.removedNodes.length > 0) {
                    var nodeDescription = (
                        (e.removedNodes.length == 1) 
                        ? (descriptionOf(e.removedNodes[0])) 
                        : e.removedNodes.length + " nodes"
                    );
                    return {
                        type:"removed",
                        description: "Removed " + nodeDescription + " from " + targetDescription,
                        timestamp: e.timestamp,
                        details: {
                            "Removed nodes": descriptionOfNodeList(e.addedNodes),
                            "Target": targetDescription,
                            "Timestamp": Math.round(10*e.timestamp)/10000+"s",
                            "Claim": e.claim,
                            "Stack": "`"+e.stack.split('\n').filter(l => l.indexOf("vorlon.max")==-1).join('\n')+"`"
                        },
                        rawData: {
                            type: "childList",
                            removedNodes: domData.getPointerListFor(e.removedNodes),
                            nextSibling: domData.getPointerFor(e.nextSibling),
                            target: domData.getPointerFor(e.target),
                        }
                    }
                } else if(e.attributeName) {
                    if(e.newValue === null || e.newValue === undefined) {
                        return {
                            type:"modified",
                            description: "Removed attribute `"+e.attributeName+"` from " + targetDescription,
                            timestamp: e.timestamp,
                            details: {
                                "Attribute name": e.attributeName,
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Target": targetDescription,
                                "Timestamp": Math.round(10*e.timestamp)/10000+"s",
                                "Claim": e.claim,
                                "Stack": "`"+e.stack.split('\n').filter(l => l.indexOf("vorlon.max")==-1).join('\n')+"`"
                            },
                            rawData: {
                                type: "attributes",
                                attributeName: e.attributeName,
                                oldValue: e.oldValue,
                                newValue: e.newValue,
                                target: domData.getPointerFor(e.target)
                            }
                        }
                    } else if(e.oldValue === null || e.oldValue === undefined) {
                        return {
                            type:"modified",
                            description: "Added attribute `"+e.attributeName+"` to " + targetDescription,
                            timestamp: e.timestamp,
                            details: {
                                "Attribute name": e.attributeName,
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Target": targetDescription,
                                "Timestamp": Math.round(10*e.timestamp)/10000+"s",
                                "Claim": e.claim,
                                "Stack": "`"+e.stack.split('\n').filter(l => l.indexOf("vorlon.max")==-1).join('\n')+"`"
                            },
                            rawData: {
                                type: "attributes",
                                attributeName: e.attributeName,
                                oldValue: e.oldValue,
                                newValue: e.newValue,
                                target: domData.getPointerFor(e.target)
                            }
                        }
                    } else {
                        return {
                            type:"modified",
                            description: "Updated attribute `"+e.attributeName+"` of " + targetDescription,
                            timestamp: e.timestamp,
                            details: {
                                "Attribute name": e.attributeName,
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Target": targetDescription,
                                "Timestamp": Math.round(10*e.timestamp)/10000+"s",
                                "Claim": e.claim,
                                "Stack": "`"+e.stack.split('\n').filter(l => l.indexOf("vorlon.max")==-1).join('\n')+"`"
                            },
                            rawData: {
                                type: "attributes",
                                attributeName: e.attributeName,
                                oldValue: e.oldValue,
                                newValue: e.newValue,
                                target: domData.getPointerFor(e.target)
                            }
                        }
                    }
                } else {
                    var nodeDescription = descriptionOf(e.target.parentNode)
                    return {
                            type:"modified",
                            description: "Updated text content of " + nodeDescription,
                            timestamp: e.timestamp,
                            details: {
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Timestamp": Math.round(10*e.timestamp)/10000+"s",
                                "Claim": e.claim,
                                "Stack": "`"+e.stack.split('\n').filter(l => l.indexOf("vorlon.max")==-1).join('\n')+"`"
                            },
                            rawData: {
                                type: "characterData",
                                oldValue: e.oldValue,
                                newValue: e.newValue,
                                target: domData.getPointerFor(e.target)
                            }
                        }
                }
            }
            function descriptionOf(e:Node) {
                if(e instanceof HTMLElement) {
                    if(e.firstChild) {
                        e = e.cloneNode(false); 
                        e.appendChild(document.createTextNode("…"));
                        return "`"+(<any>e).outerHTML+"`"
                    } else {
                        return "`"+(<any>e).outerHTML+"`"
                    }
                }
                if(e instanceof SVGElement) { return "`<"+e.tagName+"…>`" }
                if(e.nodeName[0] != "#") { return "`attribute "+e.nodeName+"`" }
                if(e.nodeValue.length < 15) { return "`"+e.nodeValue+"`" }
                return "`"+e.nodeValue.substr(0,15)+"…`"
            }
            function descriptionOfNodeList(elements:NodeList) {
                if(elements.length == 0) { return "`empty node list`" }
                if(elements.length == 1) { return "`1 node: "+descriptionOf(elements[0]).replace(/^`|`$/g,'')+"`"}
                var desc = "`"+elements.length + " nodes:";
                for(var i = 0; i < elements.length; i++) { 
                    desc += '\n'+descriptionOf(elements[i]).replace(/^`|`$/g,'');
                }
                return desc+"`";
            }
        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
			var result; try {
				result = window.eval(receivedObject.message); 
			} catch (ex) {
				result = ex.stack;
			}
            this.sendToDashboard({ message: result, messageId: receivedObject.messageId });
        }
		
    }

    //Register the plugin with vorlon core
    Core.RegisterClientPlugin(new DOMTimelineClient());
}
