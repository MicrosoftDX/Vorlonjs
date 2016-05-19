/// <reference path="api/vorlon.core.d.ts" />
/// <reference path="api/vorlon.clientPlugin.d.ts" />
var domTimelineOptions: any;
interface ExtentedMutationRecord extends MutationRecord {
    claim: string
    stack: string
    timestamp: number
    newValue: string
}
var domHistory: {
    
    past: Array<ExtentedMutationRecord>
    future: Array<ExtentedMutationRecord>
    lostFuture: Array<ExtentedMutationRecord>
    
    undo:()=>boolean
    redo:()=>boolean
    
    startRecording:()=>boolean
    stopRecording:()=>boolean
    
    isRecording:boolean
    isRecordingStopped:boolean
    
    generateDashboardData:(knownEvents:number)=>any
		
};
interface Window {
	eval: (string) => (any)
}
interface DataForEntry {
    type:string,
    description: string,
    timestamp: number,
    details: any,
}
module VORLON {
	export class DOMTimelineClient extends ClientPlugin {
		
		constructor() {
            super("domtimeline"); // Name
            (<any>this)._ready = true; // No need to wait
            console.log('Started');
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
            domTimelineOptions.considerLoggingRecords = function(c,entries,s) {
                for(var i = entries.length; i--;) {
                    var e = entries[i];
                    e.__dashboardData = generateDashboardDataForEntry(e);
                }
            }
            domHistory.generateDashboardData = function(knownEvents) {
                var data:any = {};
                data.isRecordingNow = domHistory.isRecording;
                data.isRecordingEnded = domHistory.isRecordingStopped;
                data.isPageFrozen = domHistory.future.length>0;
                data.pastEventsCount = domHistory.past.length;
                data.futureEventsCounts = domHistory.future.length;
                data.history = (
                    []
                    .concat(domHistory.past.map(getDashboardDataForEntry))
                    .concat(domHistory.future.map(getDashboardDataForEntry))
                );
                data.history.splice(0,knownEvents);
                data.lostFuture = (
                    domHistory.lostFuture.map(getDashboardDataForEntry)
                );
                return data;
            }
            function getDashboardDataForEntry(e) {
                return (<any>e).__dashboardData;
            }
            function generateDashboardDataForEntry(e:ExtentedMutationRecord):DataForEntry {
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
                if(elements.length == 1) { return "`empty node list`" }
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
