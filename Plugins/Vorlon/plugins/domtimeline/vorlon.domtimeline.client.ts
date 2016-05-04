/// <reference path="api/vorlon.core.d.ts" />
/// <reference path="api/vorlon.clientPlugin.d.ts" />
var domTimelineOptions: any;
interface ExtentedMutationRecord extends MutationRecord {
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
    
    generateDashboardData:()=>any
		
};
interface Window {
	eval: (string) => (any)
}
interface DataForEntry {
    type:string,
    description: string,
    isCancelled: boolean,
    timestamp: number,
    details: any
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
            domHistory.generateDashboardData = function() {
                var data:any = {};
                data.isRecordingNow = domHistory.isRecording;
                data.isRecordingEnded = domHistory.isRecordingStopped;
                data.isPageFrozen = domHistory.future.length>0;
                data.history = (
                    []
                    .concat(domHistory.past.map(generateDashboardDataForPastEntry))
                    .concat(domHistory.future.map(generateDashboardDataForFutureEntry))
                );
                data.lostFuture = (
                    domHistory.lostFuture.map(generateDashboardDataForFutureEntry)
                );
                return data;
            }
            function generateDashboardDataForEntry(e:ExtentedMutationRecord, isCancelled:boolean):DataForEntry {
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
                        isCancelled: isCancelled,
                        timestamp: e.timestamp,
                        details: {
                            "Added nodes": descriptionOfNodeList(e.addedNodes),
                            "Target": targetDescription,
                            "Timestamp": e.timestamp/1000+"s",
                            "Stack": "`"+e.stack+"`"
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
                        isCancelled: isCancelled,
                        timestamp: e.timestamp,
                        details: {
                            "Removed nodes": descriptionOfNodeList(e.addedNodes),
                            "Target": targetDescription,
                            "Timestamp": e.timestamp/1000+"s",
                            "Stack": "`"+e.stack+"`"
                        }
                    }
                } else if(e.attributeName) {
                    if(e.newValue === null || e.newValue === undefined) {
                        return {
                            type:"updated",
                            description: "Removed attribute `"+e.attributeName+"` from " + targetDescription,
                            isCancelled: isCancelled,
                            timestamp: e.timestamp,
                            details: {
                                "Attribute name": e.attributeName,
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Target": targetDescription,
                                "Timestamp": e.timestamp/1000+"s",
                                "Stack": "`"+e.stack+"`"
                            }
                        }
                    } else if(e.oldValue === null || e.oldValue === undefined) {
                        return {
                            type:"updated",
                            description: "Added attribute `"+e.attributeName+"` to " + targetDescription,
                            isCancelled: isCancelled,
                            timestamp: e.timestamp,
                            details: {
                                "Attribute name": e.attributeName,
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Target": targetDescription,
                                "Timestamp": e.timestamp/1000+"s",
                                "Stack": "`"+e.stack+"`"
                            }
                        }
                    } else {
                        return {
                            type:"updated",
                            description: "Updated attribute `"+e.attributeName+"` of " + targetDescription,
                            isCancelled: isCancelled,
                            timestamp: e.timestamp,
                            details: {
                                "Attribute name": e.attributeName,
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Target": targetDescription,
                                "Timestamp": e.timestamp/1000+"s",
                                "Stack": "`"+e.stack+"`"
                            }
                        }
                    }
                } else {
                    var nodeDescription = descriptionOf(e.target.parentNode)
                    return {
                            type:"updated",
                            description: "Updated text content of " + nodeDescription,
                            isCancelled: isCancelled,
                            timestamp: e.timestamp,
                            details: {
                                "Old value": e.oldValue,
                                "New value": e.newValue,
                                "Timestamp": e.timestamp/1000+"s",
                                "Stack": "`"+e.stack+"`"
                            }
                        }
                }
            }
            function generateDashboardDataForPastEntry(e:ExtentedMutationRecord) {
                return generateDashboardDataForEntry(e,false);
            }
            function generateDashboardDataForFutureEntry(e:ExtentedMutationRecord) {
                return generateDashboardDataForEntry(e,true);
            }
            function descriptionOf(e:Node) {
                if(e instanceof HTMLElement) {
                    if(e.firstChild) {
                        e = e.cloneNode(false); 
                        e.appendChild(document.createTextNode("…"));
                        return "`"+e.outerHTML+"`"
                    } else {
                        return "`"+e.outerHTML+"`"
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
