/// <reference path="api/mapping-system.d.ts" />
/// <reference path="api/shared-definitions.d.ts" />
var $ : any;

module VORLON {
	
    export class DOMTimelineDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("domtimeline", "control.html", "control.css");
            (<any>this)._ready = true;
            this._messageHandlers = {};
            this._messageId = 0;
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "DOMTIMELINE";
        }

        // This code will run on the dashboard //////////////////////

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard
        private _messageId: number;
        private _messageHandlers: {[s:string]:(receivedObject:any)=>void};
        private _carbonCopyHandlers: Function[] = [];
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (applicationDiv) => {
                //this._outputDiv = <HTMLElement>filledDiv.querySelector('#output');
                //this._toastDiv = <HTMLElement>filledDiv.querySelector('#toast');

				var me = this;
                var dashboard = initDashboard(
                    function(s) { me.sendMessageToClient(s); }
                );

				// Handle toolbar buttons
				var clientCommands = applicationDiv.querySelectorAll("[data-client-command]");
				for(var i = clientCommands.length; i--;) { var clientCommand = <HTMLElement>clientCommands[i];
					clientCommand.onclick = function(event) {
						me.sendMessageToClient(this.getAttribute("data-client-command"), (e)=>me.logMessage(e));
					};
				}

                // Handle the settings pane
                var settingsPane = <HTMLElement>applicationDiv.querySelector('#settings');
                var settingsPaneOpenButton = <HTMLElement>applicationDiv.querySelector("#open-settings-button");
                var settingsPaneCloseButton = <HTMLElement>settingsPane.querySelector("#close-settings-button");
                settingsPaneOpenButton.addEventListener('click', e => {
                    applicationDiv.setAttribute('is-settings-pane-open','true');
                    settingsPane.focus();
                });
                settingsPaneCloseButton.addEventListener('click', e => {
                    applicationDiv.setAttribute('is-settings-pane-open','false');
                    settingsPaneOpenButton.focus();
                });
                settingsPane.addEventListener('keyup', e => {
                    if (e.keyCode == 27) {
                        settingsPaneCloseButton.click();
                    }
                })

                // settings>dombreakpoints
                var breakpointsCheckbox = <HTMLInputElement>settingsPane.querySelector('#are-breakpoints-enabled');
                var breakpointsCodeTextbox = <HTMLTextAreaElement>settingsPane.querySelector('#breakpoints-code');
                var saveBreakpointsCodeForm = <HTMLFormElement>settingsPane.querySelector('#breakpoints-code-form');
                saveBreakpointsCodeForm.addEventListener('submit', e => {
                    var code = (
                        breakpointsCheckbox.checked
                        ? breakpointsCodeTextbox.value
                        : '/* disabled */'
                    )
                    me.sendMessageToClient(`domTimelineOptions.considerDomBreakpoint = function(m) {\n\n${code}\n\n}\n\n//# sourceURL=vorlon.max.dom-breakpoint.js`);
                    e.preventDefault(); return false;
                });
                breakpointsCheckbox.addEventListener('change', e => {
                    var code = (
                        breakpointsCheckbox.checked
                        ? '/* not yet enabled; modify the code, then press save */'
                        : '/* disabled */'
                    )
                    me.sendMessageToClient(`domTimelineOptions.considerDomBreakpoint = function(m) {\n${code}\n}`);
                });
                
                // Refresh the output from time to time
                var clientUrl = "about:blank";
                var domData = new MappingSystem.NodeMappingSystem();
                var alreadyKnownEvents : DashboardDataForEntry[] = [], lastPastEventsCount = 0;
                var isIframeAlreadyCreated = false;
                var updateTimer = setInterval(function() {
                    me.sendMessageToClient(
                        "domHistory.generateDashboardData("+`{history:${alreadyKnownEvents.length},lostFuture:0,domData:${domData.data.length}}`+")", 
                        (e)=>{
                            
                            // refresh metadata
                            clientUrl = e.message.url;
                            document.getElementById("dom-recorder").setAttribute('is-recording-started', e.message.isRecordingNow || e.message.isRecordingEnded);
                            document.getElementById("dom-recorder").setAttribute('is-recording-ended', e.message.isRecordingEnded);

                            // nothing significant changed, don't update
                            if(e.message.history.length == 0 && e.message.pastEventsCount == lastPastEventsCount && !(e.message.isRecordingEnded && !isIframeAlreadyCreated)) {
                                return;
                            }
                            // merge histories
                            if(e.message.pastEventsCount + e.message.futureEventsCount != 0) {
                                var newHistory = e.message.history.slice(alreadyKnownEvents.length - e.message.assumedKnownData.history);
                                alreadyKnownEvents = e.message.history = alreadyKnownEvents.concat(newHistory);
                                if(alreadyKnownEvents.length > e.message.pastEventsCount + e.message.futureEventsCount) {
                                    debugger;
                                }
                            } else {
                                alreadyKnownEvents = e.message.history;
                                lastPastEventsCount = e.message.pastEventsCount;
                            }
                            for(var i = alreadyKnownEvents.length; i--;) {
                                alreadyKnownEvents[i].isCancelled = i >= e.message.pastEventsCount;
                                lastPastEventsCount = e.message.pastEventsCount;
                            }
                            // merge domData
                            if(domData.data.length > e.message.assumedKnownData.domData) {
                                e.message.domData.splice(0, domData.data.length - e.message.assumedKnownData.domData); 
                            }
                            domData.importData(e.message.domData);
                            e.message.domData = domData.data;
                            // refresh content
                            dashboard.setTimeline(alreadyKnownEvents,e.message);
                            // create the preview iframe once the recording is done
                            if(e.message.isRecordingEnded && !isIframeAlreadyCreated) {

                                isIframeAlreadyCreated = true;

                                var popup = window.open("about:blank", "domtimeline-popup", "width=800,height=600,menubar=no,toolbar=no,location=no,resizable=yes,scrollbars=yes,status=no");
                                Helpers.implementDomHistoryInWindow({clientUrl, events:alreadyKnownEvents, domData}, popup);
                                popup.eval(`domHistory.seek(${lastPastEventsCount})`);

                                me._carbonCopyHandlers.push(message => popup.eval(message));

                            }
                        }
                    ); 
                }, 500);
            })
        }

        // When we get a message from the client, just show it        
        public logMessage(receivedObject: any) {
            var message = document.createElement('p');
            message.textContent = receivedObject.message;
            console.log(message);
            //this._toastDiv.appendChild(message);
        }
		
        // sends a message to the client, and enables you to provide a callback for the reply
		public sendMessageToClient(message: string, callback:(receivedObject:any)=>void = undefined) {

            // send the message to the real client
            var messageId = this._messageId++;
            if(callback) this._messageHandlers[messageId] = callback;
			this.sendToClient({message,messageId});

            // send carbon copies if needed
            for(var x = this._carbonCopyHandlers.length; x--;) {
                var ccHandler = this._carbonCopyHandlers[x];
                ccHandler(message);
            }

		}

        // execute the planned callback when we receive a message from the client
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            var callback = this._messageHandlers[receivedObject.messageId];
            if(callback) {
                this._messageHandlers[receivedObject.messageId] = undefined;
                callback(receivedObject);
            }
        }
    }

    export class Helpers {

        static implementDomHistoryInWindow({ clientUrl, events, domData }: DomHistoryData, popup : Window) {

            var pDoc = popup.document;
            var doctypeText = getDoctypeText();
            pDoc.open();
            pDoc.write(doctypeText+"<html></html>");
            pDoc.close();

            var oRE : HTMLHtmlElement = <any>pDoc.documentElement;
            var oHE : HTMLHeadElement = <any>oRE.querySelector("head") || createHeadFor(oRE);
            var oBE : HTMLBaseElement = <any>oHE.querySelector("base") || createBaseFor(oHE);
            oBE.setAttribute('href', clientUrl);
            oBE.href = clientUrl;

            var popupDomData = new MappingSystem.NodeMappingSystem(popup.document);
            popupDomData.importData(domData.data);

            var nRE : HTMLHtmlElement = <any>getNewRootElement();
            var nHE : HTMLHeadElement = <any>nRE.querySelector("head") || createHeadFor(nRE);
            var nBE : HTMLBaseElement = <any>nHE.querySelector("base") || createBaseFor(nHE);
            nBE.setAttribute('href', clientUrl);
            nBE.href = clientUrl;

            disableScripts(nRE);
            popup.document.adoptNode(nRE);
            popup.document.replaceChild(nRE,oRE);
            enableScripts(nRE);
            preparePopupWithShim();

            function getDoctypeText() {
                var docStart = <HTMLElement>domData.p2oMap.get("0:0");
                return ("tagName" in docStart && docStart.tagName.toLowerCase() != 'parsererror') ? '' : domData.data[0].outerHTML;
            }
            function getNewRootElement() {
                var docStart = <HTMLElement>popupDomData.p2oMap.get("0:0");
                if(!("tagName" in docStart && docStart.tagName.toLowerCase() != 'parsererror')) {
                    docStart = <HTMLElement>popupDomData.p2oMap.get("1:0");
                }
                return docStart;
            }
            function createHeadFor(htmlElement) {
                // normal position of the head, 
                // but we are screwed by now I think because doc will likely insert another one soon
                var headElement = htmlElement.ownerDocument.createElement('head');
                htmlElement.insertBefore(headElement, htmlElement.firstChild); 
                return headElement;
            }
            function createBaseFor(headElement) {
                // position least likely to hurt anything, 
                // we should be okay
                var baseElement = headElement.ownerDocument.createElement('base');
                headElement.insertBefore(baseElement, headElement.lastChild); 
                return baseElement;
            }
            function disableScripts(root) {
                var scripts = root.querySelectorAll('script');
                for(var s = scripts.length; s--;) {
                    var script = scripts[s];
                    script.type = "!" + script.type;
                }
            }
            function enableScripts(root) {
                var scripts = root.querySelectorAll('script[type^="!"]');
                for(var s = scripts.length; s--;) {
                    var script = scripts[s];
                    script.type = "!" + script.type;
                }
            }
            function preparePopupWithShim() {

                var currentPastEventsCount = 0;
                popup['domHistory'] = {

                    generateDashboardData(knownData) {
                        return {

                            assumedKnownData: knownData,

                            url: clientUrl,
                            isRecordingNow: false,
                            isRecordingEnded: true,

                            history: events.slice(knownData.history|0),
                            pastEventsCount: currentPastEventsCount,
                            futureEventsCount: events.length - currentPastEventsCount,

                            domData: popupDomData.data.slice(knownData.domData),

                        };
                    },

                    startRecording() {
                        return false;
                    },

                    stopRecording() {
                        return false;
                    },

                    undo() {
                        if(currentPastEventsCount > 0) {
                            undoMutationRecord(convertToMutationRecord(events[--currentPastEventsCount].rawData));
                            return;
                        } else {
                            return false;
                        }
                    },

                    redo() {
                        if(currentPastEventsCount < events.length) {
                            redoMutationRecord(convertToMutationRecord(events[currentPastEventsCount++].rawData));
                            return true;
                        } else {
                            return false;
                        }
                    },

                    seek(newPastEventsCount: number) {
                        if(currentPastEventsCount != newPastEventsCount) {
                            // we should sync our view with the real view now
                            if(currentPastEventsCount < newPastEventsCount) {
                                // we need to redo some changes
                                for(var i = currentPastEventsCount; i != newPastEventsCount; i++) {
                                    redoMutationRecord(convertToMutationRecord(events[i].rawData));
                                }
                            } else {
                                // we need to undo some changes
                                for(var i = currentPastEventsCount; i != newPastEventsCount; i--) {
                                    undoMutationRecord(convertToMutationRecord(events[i-1].rawData));
                                }
                            }
                            // save the fact we synced
                            currentPastEventsCount = newPastEventsCount;
                        }
                    }

                };

                function convertToMutationRecord(d) {
                    var e : any = {};
                    for(var key in d) { e[key] = d[key]; }
                    if(e.target) e.target = popupDomData.getObjectFor(e.target);
                    if(e.nextSibling) e.nextSibling = popupDomData.getObjectFor(e.nextSibling);
                    if(e.addedNodes) e.addedNodes = popupDomData.getObjectListFor(e.addedNodes);
                    if(e.removedNodes) e.removedNodes = popupDomData.getObjectListFor(e.removedNodes);
                    return e; 
                }

                // 
                // execute the action which cancels a mutation record
                // 
                function undoMutationRecord(change) {
                    switch(change.type) {
                        
                        //
                        case "attributes":
                            change.target.setAttribute(change.attributeName, change.oldValue);
                            if(change.attributeName=='value') change.target.value = change.oldValue||'';
                        return;
                        
                        //
                        case "characterData":
                            change.target.nodeValue = change.oldValue;
                        return;
                        
                        //
                        case "childList":
                            if(change.addedNodes) {
                                for(var i = change.addedNodes.length; i--;) {
                                    change.addedNodes[i].remove();
                                }
                            } 
                            if(change.removedNodes) {
                                var lastNode = change.nextSibling;
                                for(var i = change.removedNodes.length; i--;) {
                                    if(change.removedNodes[i].ownerDocument != change.target.ownerDocument) {
                                        change.target.ownerDocument.adoptNode(change.removedNodes[i]);
                                    }
                                    change.target.insertBefore(change.removedNodes[i], lastNode);
                                    lastNode = change.removedNodes[i];
                                }
                            }
                        return;
                        
                    }
                }
                
                // 
                // execute the action which replicates a mutation record
                // 
                function redoMutationRecord(change) {
                    switch(change.type) {
                        
                        //
                        case "attributes":
                            change.target.setAttribute(change.attributeName, change.newValue);
                            if(change.attributeName=='value') change.target.value = change.newValue||'';
                        return;
                        
                        //
                        case "characterData":
                            change.target.nodeValue = change.newValue;
                        return;
                        
                        //
                        case "childList":
                            if(change.addedNodes) {
                                var lastNode = change.nextSibling;
                                for(var i = change.addedNodes.length; i--;) {
                                    if(change.addedNodes[i].ownerDocument != change.target.ownerDocument) {
                                        change.target.ownerDocument.adoptNode(change.addedNodes[i]);
                                    }
                                    change.target.insertBefore(change.addedNodes[i], lastNode);
                                    lastNode = change.addedNodes[i];
                                }
                            } 
                            if(change.removedNodes) {
                                for(var i = change.removedNodes.length; i--;) {
                                    change.removedNodes[i].remove();
                                }
                            }
                        return;
                        
                    }
                }
            }
        }

    }

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new DOMTimelineDashboard());
}


function initDashboard(executeScriptOnClient: (string)=>void) {

    var SCALE = 0.5;
    var START_TIME = 0;
    var FRAMES_PER_SECOND = 5;
    var TIMELINE_SECONDS = 90;
    var appDiv = document.querySelector('.plugin-domtimeline #dom-recorder');
    var timelineBaseHTML = appDiv.querySelector('#timeline-content').innerHTML;

    var latestMessage : any = null;
    var alreadyKnownEvents : DashboardDataForEntry[] = [];

    var setNumberChanges = function (timeline : DashboardDataForEntry[]) {
        document.querySelector('.inline-changes-added span').innerHTML = '' + countByType('added', timeline);
        document.querySelector('.inline-changes-removed span').innerHTML = '' + countByType('removed', timeline);
        document.querySelector('.inline-changes-modified span').innerHTML = '' + countByType('modified', timeline);
    }

    var setChanges = function (changes : DashboardDataForEntry[]) {
        var html = '';

        var scroller = <HTMLElement>document.querySelector(".plugin-domtimeline");
        var scrollTop = scroller.scrollTop;
        if(scrollTop >= scroller.scrollHeight - scroller.offsetHeight - 1) { scrollTop = 9e10; }
        
        var times = {};
        var max = { time: 0, count: 0 };
        for (var i = 0, len = changes.length; i < len; i++) {
            var change = changes[i], changeTime = Math.floor(change.timestamp/1000 * FRAMES_PER_SECOND) / FRAMES_PER_SECOND;
            var details_table = '';
            for (var key in change.details) {
                var value = ''+change.details[key]; var value_lines = value.split('\n');
                var value_line = ((value_lines.length < 3) ? value : fixCode(value_lines[0] + ' [...]'));
                details_table += '<tr><td class="td-name">' + key + ':</td><td class="td-value" title="'+escapeHtml(value)+'">' + escapeHtml2(value_line) + '</td></tr>';
            }
            var details = '<li class="acc" style="display:none;"><table>' + details_table + '</table></li>';
            html += '<li data-id=" ' + i + ' " data-time=" ' + changeTime + ' " data-are-details-visible="' + change.areDetailsVisible + '" is-cancelled="'+change.isCancelled+'" is-outside-selection="'+(selectionBehavior.isEnabled ? change.timestamp < selectionBehavior.selectionStartTimestamp || change.timestamp > selectionBehavior.selectionEndTimestamp : false)+'" class="show-change acc-tr accordion-changes-' + change.type + '">' + escapeHtml(change.description) + ' <span>' + changeTime + 's</span><i class="fa fa-undo"></i></li>' + details;
            if (typeof times[changeTime] === 'undefined') {
                times[changeTime] = { added: 0, removed: 0, modified: 0, count: 0 };
            }
            times[changeTime].count++;
            times[changeTime][change.type]++;
            if (max.count < times[changeTime].count) {
                max.count = times[changeTime].count;
                max.time = changeTime;
            }
        }
        document.querySelector('.accordion-changes').innerHTML = html;

        html = "";
        for (var timeIndex in times) {
            var time = times[timeIndex];
            var minHeight = (time.added?3:0) + (time.added?3:0) + (time.added?3:0);
            var totalHeight = SCALE * 85 * Math.log(1 + time.count / 10) / Math.log(1 + max.count / 10);
            totalHeight = Math.max(totalHeight, minHeight);
            var distributableHeight = totalHeight - minHeight;
            var addedHeight = (time.added?3:0) + distributableHeight * time.added / time.count;
            var removedHeight = (time.removed?3:0) + distributableHeight * time.removed / time.count;
            var modifiedHeight = (time.modified?3:0) + distributableHeight * time.modified / time.count;
            var times_h = '';
            times_h += '<span data-hint="' + time.added + ' added" class="added_h hint--right hint--success" style="' + (((time.modified || time.removed) && time.added) ? 'border-bottom: 1px solid white;' : '') + 'height: ' + addedHeight + 'px;"></span>';
            times_h += '<span data-hint="' + time.modified + ' modified" ' + ((!time.modified) ? 'style="border:none !important;"' : '') + ' class="modified_h hint--right hint--info" style="' + ((time.removed && time.modified) ? 'border-bottom: 1px solid white;' : '') + 'height: ' + modifiedHeight + 'px;"></span>';
            times_h += '<span data-hint="' + time.removed + ' removed" ' + ((!time.removed) ? 'style="border:none !important;"' : '') + ' class="removed_h hint--right hint--error" style="height: ' + removedHeight + 'px;"></span>';
            html += '<div class="time-' + timeIndex.replace('.', 'p') + '" style="left: ' + (SCALE * 61 * parseFloat(timeIndex)) + 'px;">' + times_h + '</div>';
        }
        document.getElementById('wrapper-timeline').style.fontSize = SCALE+'em';
        //document.getElementById('timeline').style.backgroundSize = (SCALE*61)+'px';
        document.getElementById('timeline').style.height = (SCALE*100+10)+'px';
        document.getElementById('timeline-content').innerHTML = timelineBaseHTML + html;
        scroller.scrollTop = scrollTop;

        function fixCode(v0:string) {
            if(v0[0]=='`' && v0.split('').reduce((i,c)=>(i+(c=='`'?1:0)),0)%2==1) {
                return v0+'`';
            } else {
                return v0;
            }
        }
    }

    var setTimelineSeconds = function (s) {
        var v = START_TIME;
        var html = '';
        for (var i = 0; i <= s; i++) {
            var left = SCALE * ((i) ? ((i * 61) - (4 * i.toString().length)) : i);
            html += '<span style="left: ' + left + 'px;">' + v + 's</span>';
            v++;
        }
        document.querySelectorAll('.seconds-list')[0].innerHTML = html;
        document.getElementById('timeline').style.width = SCALE * (61 * (s + 1)) + 'px';
    }

    var setTimeline = function (timeline : DashboardDataForEntry[], message:any) {
        alreadyKnownEvents = timeline;
        latestMessage = message;
        setNumberChanges(timeline);
        setChanges(timeline);
        setTimelineSeconds(TIMELINE_SECONDS);
        seekBehavior && seekBehavior.setSeekTime(undefined, false);
    }

    var filterChanges = function (timeline, type = undefined) {
        setNumberChanges(timeline);
        $('.acc-tr').each(function (i) {
            var time = parseFloat($(this).data('time'));
            if ($('#filter-changes').css('display') == 'none' || (time >= $('#filter-changes').find('.from').val() && time <= $('#filter-changes').find('.to').val())) {
                $(this).removeClass('hide-change').addClass('show-change');
            } else {
                $(this).removeClass('show-change').addClass('hide-change');
            }
        });
        $(".accordion-changes").animate({ scrollTop: $('.show-change').first().data('id') * 44 }, ((type == 'resize' || type == 'draggable') ? 0 : 500));
    }

    var levChanged = function (type = undefined) {
        if (parseInt(document.getElementById('lev').style.width) > 0) {
            $('#lev').css('border-width', '2px');
            $('#filter-changes').show();
            $('#filter-changes').find('.from').val(($('.lev').position().left / (SCALE*61)).toFixed(2));
            $('#filter-changes').find('.to').val((($('.lev').position().left + parseInt(document.getElementById('lev').style.width)) / (SCALE*61)).toFixed(2));
        } else {
            $('#lev').css('border-width', '1px');
            $('#filter-changes').hide();
        }
        filterChanges(timeline, type);
    }

    var escapeHtml = function (str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\//g, "&#x2F;");
    }
    
    var escapeHtml2 = function (str) {
        return escapeHtml(str).replace(/`([^`]*)`/g,'<code>$1</code>');
    }

    var validate = window["validateInputNumber"] = function (evt) {
        var theEvent = evt || window.event;
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
        var regex = /[0-9]|\./;
        if (!regex.test(key)) {
            theEvent.returnValue = false;
            if (theEvent.preventDefault) theEvent.preventDefault();
        }
    }

    var countByType = function (type, timeline) {
        var count = 0;
        for (var i = 0, len = timeline.length; i < len; i++) {
            if (timeline[i].type == type) {
                var isWithinSelection = (
                    timeline[i].timestamp >= selectionBehavior.selectionStartTimestamp 
                    && timeline[i].timestamp <= selectionBehavior.selectionEndTimestamp
                );
                if (!selectionBehavior.isEnabled || isWithinSelection) {
                    count++;
                }
            }
        }
        return count;
    }

    var timeline: DashboardDataForEntry[] = [];
    setTimeline(timeline,null);

    enableActionButtonsForChangeEntries();
    function enableActionButtonsForChangeEntries() {
        var changeList = document.querySelector('.accordion-changes');
        changeList.addEventListener('mousedown', onmousedown, true);

        function onmousedown(e:MouseEvent) {
            e.stopPropagation(); e.preventDefault();

            // disable in case of play animation
            if(playBehavior.isEnabled) return;

            // undo
            var target = <HTMLElement>e.target;
            if(target.className == 'fa fa-undo') {
                executeScriptOnClient(`domHistory.seek(${target.parentElement.dataset['id']})`);
                return;
            }

            // old code, to show/hide changes details
            var li = target; while(li && li != this && li.tagName != 'LI') { li=li.parentElement };
            if ($(li).hasClass('acc')) {
                e.preventDefault();
                return;
            }

            var change = alreadyKnownEvents[<any>li.dataset['id']|0];
            if(change.areDetailsVisible) {
                change.areDetailsVisible = false; 
                li.dataset['areDetailsVisible'] = 'false';
            } else {
                change.areDetailsVisible = true; 
                li.dataset['areDetailsVisible'] = 'true';
            }

        }
    }

    var playBehavior = enablePlayBehavior();
    function enablePlayBehavior() {

        document.querySelector(".plugin-domtimeline #playStopButton").addEventListener('click', e => {
            if(!playBehavior.isEnabled || playBehavior.isPaused) {
                playBehavior.playSelection();
            } else {
                playBehavior.stop()
            }
        });

        function startPlayAnimation() {
            var animationStartTime = performance.now();
            requestAnimationFrame(continuePlayAnimation);

            function continuePlayAnimation() {

                // dont do anything is the animation was stopped
                if(!playBehavior.isEnabled) { return; }

                // save state and exit if it was paused
                if(playBehavior.isPaused) {
                    playBehavior.animationStartTimestamp = seekBehavior.getSeekTime(); 
                    return;
                }

                var currentTimestamp = playBehavior.animationStartTimestamp + (performance.now() - animationStartTime) * playBehavior.speed;
                if(currentTimestamp > playBehavior.animationEndTimestamp) {
                    currentTimestamp = playBehavior.animationEndTimestamp;
                    playBehavior.stop();
                } else {
                    requestAnimationFrame(continuePlayAnimation);
                }

                seekBehavior.setSeekTime(currentTimestamp, true);

            }
        }

        return {
            isEnabled: false,
            isPaused: false,
            speed: 1,
            animationStartTimestamp: 0,
            animationEndTimestamp: 0,
            playSelection() {
                if(this.isPaused) { this.isPaused=false; return true; }
                if(this.isEnabled) { return false; }
                var selectionStart = selectionBehavior.isEnabled ? selectionBehavior.selectionStartTimestamp : 0;
                var selectionEnd = selectionBehavior.isEnabled ? selectionBehavior.selectionEndTimestamp : alreadyKnownEvents[alreadyKnownEvents.length-1].timestamp;
                playBehavior.isEnabled = true; document.querySelector(".plugin-domtimeline #dom-recorder").setAttribute('is-recording-playing', 'true');
                playBehavior.animationStartTimestamp = selectionStart;
                playBehavior.animationEndTimestamp = selectionEnd;
                startPlayAnimation();
                return true;
            },
            pause() {
                if(this.isEnabled) { return this.isPaused = true; }
                return false;
            },
            stop() {
                if(this.isEnabled) { 
                    this.isPaused = this.isEnabled = false;
                    document.querySelector(".plugin-domtimeline #dom-recorder").setAttribute('is-recording-playing', 'false'); 
                    return true;
                }
                return false;
            }
        }

    }

    var saveFileBehavior = enableSaveFileBehavior();
    function enableSaveFileBehavior() {
        appDiv.querySelector("#saveAsFileButton").addEventListener('click', function(e:MouseEvent) {

            if(latestMessage.url.indexOf('http://localhost') == 0) {
               if(!confirm("This recording was captured on a local server. It might not work as expected on another computer. Continue anyway?")) {
                   return;
               } 
            }

            var button = <HTMLButtonElement>e.target;
            button.setAttribute('disabled','true');

            var data = {
                template: '',
                html: '',
                script: '',
                date: `${new Date().toISOString()}`,
                title: `(${latestMessage.title ? latestMessage.title.replace(/</g,'&lt;') : 'Untitled'})`,
                url: JSON.stringify(latestMessage.url).replace(/<\/script>/g,"<\\\/script>"),
                history: JSON.stringify(latestMessage.history).replace(/<\/script>/g,"<\\\/script>"),
                domData: JSON.stringify(latestMessage.domData).replace(/<\/script>/g,"<\\\/script>"),
            }

            var writeContent = function() {
                if(data.html && data.template && data.script) {
                    var content = data.template.replace(/\{\{([a-z]+)\}\}/gi, (s,k) => data[k]);
                    var a = document.createElement('a');
                    a.style.display = "none";  
                    var blob = new Blob([content], {type: "application/octet-stream"});
                    if(window.navigator.msSaveBlob) {
                        window.navigator.msSaveBlob(blob, 'standalone.html');
                    } else {
                        var url = window.URL.createObjectURL(blob);
                        a.href = url;
                        (<any>a).download = 'standalone.html';
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(function() {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                            button.setAttribute('disabled',null);
                        }, 1000);
                    }
                }
            };

            var x = new XMLHttpRequest();
            x.open('GET',window['vorlonBaseURL']+'/vorlon/plugins/domtimeline/vorlon.domtimeline.dashboard.min.js',true);
            x.onload = function() { data.script = this.responseText; writeContent(); }
            x.send(null);

            var x = new XMLHttpRequest();
            x.open('GET',window['vorlonBaseURL']+'/vorlon/plugins/domtimeline/images/standalone.part.html',true);
            x.onload = function() { data.template = this.responseText; writeContent(); }
            x.send(null);

            var x = new XMLHttpRequest();
            x.open('GET',window['vorlonBaseURL']+'/vorlon/plugins/domtimeline/control.html',true);
            x.onload = function() {

                // let's get the content
                var html = this.responseText; 

                // we need to extract all images
                var imageExtractor = /url\('.*?'\)/gi;
                var images = this.responseText.match(imageExtractor) || [];
                var imagecount = images.length;

                images.forEach((s,i) => {
                    var f = s.substring(5,s.length-2);
                    var x = new XMLHttpRequest();
                    x.open('GET', window['vorlonBaseURL']+'/vorlon/plugins/domtimeline/'+f, true);
                    x.responseType = 'arraybuffer';
                    x.onload = function() { images[i] = 'url(data:image/png;base64,'+convertToBase64(this.response)+')'; onload(); };
                    x.send(null);
                });

                // then we can finally finish
                function onload() {
                    if(--imagecount == 0) {
                        data.html = html.replace(imageExtractor, x => images.shift()); 
                        writeContent();
                    }
                }

                function convertToBase64(arrayBuffer) {
                    // Source: https://gist.github.com/jonleighton/958841
                    var base64 = ''
                    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

                    var bytes = new Uint8Array(arrayBuffer)
                    var byteLength = bytes.byteLength
                    var byteRemainder = byteLength % 3
                    var mainLength = byteLength - byteRemainder

                    var a, b, c, d
                    var chunk

                    // Main loop deals with bytes in chunks of 3
                    for (var i = 0; i < mainLength; i = i + 3) {
                        // Combine the three bytes into a single integer
                        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

                        // Use bitmasks to extract 6-bit segments from the triplet
                        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
                        b = (chunk & 258048) >> 12   // 258048   = (2^6 - 1) << 12
                        c = (chunk & 4032) >> 6      // 4032     = (2^6 - 1) << 6
                        d = chunk & 63               // 63       = 2^6 - 1

                        // Convert the raw binary segments to the appropriate ASCII encoding
                        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
                    }

                    // Deal with the remaining bytes and padding
                    if (byteRemainder == 1) {
                        chunk = bytes[mainLength]

                        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

                        // Set the 4 least significant bits to zero
                        b = (chunk & 3) << 4 // 3   = 2^2 - 1

                        base64 += encodings[a] + encodings[b] + '=='
                    } else if (byteRemainder == 2) {
                        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

                        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
                        b = (chunk & 1008) >> 4   // 1008  = (2^6 - 1) << 4

                        // Set the 2 least significant bits to zero
                        c = (chunk & 15) << 2     // 15    = 2^4 - 1

                        base64 += encodings[a] + encodings[b] + encodings[c] + '='
                    }

                    return base64
                }

            }
            x.send(null);

        });
        return {};
    }

    var seekBehavior = enableTimelineSeekBehavior();
    function enableTimelineSeekBehavior() {

        function getSeekElement() {
            return <HTMLElement>document.querySelector("#timeline-seek");
        }

        var lastSeekTime = 0;
        function getSeekTime() {
            var seekTime = 0;
            for(var i = alreadyKnownEvents.length; i--;) {
                if(!alreadyKnownEvents[i].isCancelled) {
                    if(seekTime == 0) {
                        return lastSeekTime = alreadyKnownEvents[i].timestamp;
                    } else if(lastSeekTime > alreadyKnownEvents[i].timestamp && lastSeekTime < seekTime) {
                        return lastSeekTime;
                    } else {
                        return lastSeekTime = 0.5 * (alreadyKnownEvents[i].timestamp + seekTime);
                    }
                } else {
                    seekTime = alreadyKnownEvents[i].timestamp;
                }
            }
            if(lastSeekTime < seekTime) return lastSeekTime;
            return lastSeekTime = 0;
        }

        function setSeekTime(timestamp,syncBack?) { 
            timestamp = typeof(timestamp)=="undefined" ? getSeekTime() : timestamp|0;
            
            var offset = convertTimestampToOffset(timestamp);
            var amountOfPastEvents = 0;
            for(var i = alreadyKnownEvents.length; i--;) {
                if(alreadyKnownEvents[i].timestamp <= timestamp) {
                    amountOfPastEvents = i+1; break;
                }
            }

            lastSeekTime = timestamp;
            getSeekElement().style.transform = `translateX(${offset}px)`;
            if(syncBack == true || (syncBack !== false && latestMessage && latestMessage.isRecordingEnded)) {
                executeScriptOnClient(`domHistory.seek(${amountOfPastEvents})`);
            }
        }

        var timeline = document.querySelector('#timeline');
        timeline.addEventListener('mousedown', (e:MouseEvent) => {

            // disable in case of play animation
            if(playBehavior.isEnabled) return;
            
            var startingOffset = e.clientX - timeline.getBoundingClientRect().left;
            var didSelectionStart = false;
            setSeekTimeBasedOnOffet(e);

            window.addEventListener('mousemove', onmousemove, true);
            window.addEventListener('mouseup', onmouseup, true);
            e.stopPropagation();
            e.stopImmediatePropagation();

            function setSeekTimeBasedOnOffet(e:MouseEvent) {
                var offset = e.clientX - timeline.getBoundingClientRect().left;
                var timestamp = convertOffsetToTimestamp(offset);
                setSeekTime(timestamp,true);
            }

            function setSelectionBasedOnOffset(e:MouseEvent) {
                var offset = e.clientX - timeline.getBoundingClientRect().left;
                if(didSelectionStart || Math.abs(offset - startingOffset) > 2) {
                    didSelectionStart = true;
                    var lev = <HTMLElement>document.querySelector("#lev");
                    var fakeLev = <HTMLElement>document.querySelector("#fake-lev");
                    var smallerOffsetX = Math.min(startingOffset, offset);
                    var biggerOffsetX = Math.max(startingOffset, offset);
                    lev.style.display = `none`;
                    fakeLev.style.display = `block`;
                    fakeLev.style.left = `${smallerOffsetX}px`;
                    fakeLev.style.width = `${biggerOffsetX - smallerOffsetX}px`;
                }
            }

            function onmousemove(e:MouseEvent) {
                e.preventDefault(); e.stopPropagation();
                setSeekTimeBasedOnOffet(e);
                setSelectionBasedOnOffset(e);
            }
            function onmouseup(e:MouseEvent) {
                e.preventDefault(); e.stopPropagation();
                setSeekTimeBasedOnOffet(e);
                setSelectionBasedOnOffset(e);
                var lev = <HTMLElement>document.querySelector("#lev");
                var fakeLev = <HTMLElement>document.querySelector("#fake-lev");
                fakeLev.style.display = `none`;
                if(fakeLev.style.width != '0px') {
                    lev.style.display = `block`;
                    lev.style.left = fakeLev.style.left;
                    lev.style.width = fakeLev.style.width;
                    fakeLev.style.left = `0px`;
                    fakeLev.style.width = `0px`;
                    selectionBehavior.syncFromDOM();
                }
                window.removeEventListener('mousemove', onmousemove, true);
                window.removeEventListener('mouseup', onmouseup, true);
            }

        }, false);

        keepToolbarAndTimelineFixed();
        function keepToolbarAndTimelineFixed() {

            var anchor = <HTMLElement>document.querySelector('#dom-recorder');
            var chromeFix = <HTMLElement>anchor.querySelector('#dom-recorder > #chrome-fix');
            var toolbar = <HTMLElement>anchor.querySelector('#dom-recorder > div[role="toolbar"]');
            var timeline = <HTMLElement>anchor.querySelector('#dom-recorder > nav');
            
            var lastBox = {width:0,top:0,left:0};
            requestAnimationFrame(moveToolbarAndTimeline);
            function moveToolbarAndTimeline() {
                requestAnimationFrame(moveToolbarAndTimeline);
                var box = anchor.getBoundingClientRect();
                var wrapperBox = anchor.parentElement.getBoundingClientRect();
                if(box.left==lastBox.left && box.width==lastBox.width && wrapperBox.top==lastBox.top) {
                    return;
                }
                chromeFix.style.display='block';
                chromeFix.style.zIndex='1';
                chromeFix.style.position='fixed';
                toolbar.style.position = 'fixed';
                timeline.style.position = 'fixed';
                chromeFix.style.top = `${wrapperBox.top-1}px`;
                chromeFix.style.left = `${box.left-1}px`;
                chromeFix.style.width = `${box.width+2}px`;
                chromeFix.style.top = `${wrapperBox.top-1}px`;
                toolbar.style.top = `${wrapperBox.top}px`;
                toolbar.style.left = `${box.left}px`;
                toolbar.style.width = `${box.width}px`;
                timeline.style.top = `${wrapperBox.top+32+10}px`
                timeline.style.left = `${box.left+10}px`;
                timeline.style.width = `${box.width-20}px`;
                lastBox={left:box.left,width:box.width,top:wrapperBox.top};
            }

        }

        document.querySelector("#timeline-seek").addEventListener('mousedown', function() {
            
            // disable in case of play animation
            if(playBehavior.isEnabled) return;

            // reset the selection in case of double-click
            selectionBehavior.reset();

        });

        return {
            getSeekTime() { return getSeekTime(); },
            setSeekTime(v?,syncBack?) { setSeekTime(v,syncBack); }
        };

    }

    var selectionBehavior = enableTimelineHandleBehavior();
    function enableTimelineHandleBehavior() {
        
        var selectionZone = <HTMLElement>document.querySelector('#lev');
        var leftResizer = <HTMLElement>selectionZone.querySelector('.lev1');
        var rightResizer = <HTMLElement>selectionZone.querySelector('.lev2');

        selectionZone.addEventListener('mousedown', (e:MouseEvent) => {
            e.stopPropagation(); e.preventDefault();

            // disable in case of play animation
            if(playBehavior.isEnabled) return;

            var shiftWasEverNonZero = false;
            var startClientX = e.clientX;
            var startOffset = parseFloat(selectionZone.style.left);
            var deltaOffset = parseFloat(selectionZone.style.width);
            var startSeekTime = seekBehavior.getSeekTime();
            var isValidSeekTime = (
                startSeekTime >= convertOffsetToTimestamp(startOffset-1) &&
                startSeekTime <= convertOffsetToTimestamp(startOffset + deltaOffset + 1)
            );
            if(!isValidSeekTime) startSeekTime = convertOffsetToTimestamp(startOffset + deltaOffset);
            window.addEventListener('mousemove', onmousemove, true);
            window.addEventListener('mouseup', onmouseup, true);
            
            function shiftSelectionBasedOnOffset(e:MouseEvent) {
                var shift = (e.clientX - startClientX);
                if(Math.abs(shift) > 1) shiftWasEverNonZero = true;
                var offset = Math.max(0, startOffset + (shift)); 
                var seekTime = Math.max(0, startSeekTime + convertOffsetToTimestamp(e.clientX - startClientX));
                selectionZone.style.left = `${offset}px`;
                seekBehavior.setSeekTime(seekTime, true);
            }

            function onmousemove(e:MouseEvent) {
                e.stopPropagation(); e.preventDefault();
                shiftSelectionBasedOnOffset(e);
            }

            function onmouseup(e:MouseEvent) {
                e.stopPropagation(); e.preventDefault();
                shiftSelectionBasedOnOffset(e);
                if(shiftWasEverNonZero) {
                    selectionBehavior.syncFromDOM();
                } else {
                    seekBehavior.setSeekTime(
                        convertOffsetToTimestamp(e.clientX - selectionZone.parentElement.getBoundingClientRect().left),
                        true
                    );
                }
                window.removeEventListener('mousemove', onmousemove, true);
                window.removeEventListener('mouseup', onmouseup, true);
            }
        });

        leftResizer.addEventListener('mousedown', (e:MouseEvent) => {
            e.stopPropagation();

            var shiftWasEverNonZero = false;
            var startClientX = e.clientX;
            var startOffset1 = parseFloat(selectionZone.style.left);
            var startOffset2 = startOffset1 + parseFloat(selectionZone.style.width);
            var startSeekTime = convertOffsetToTimestamp(startOffset1);
            window.addEventListener('mousemove', onmousemove, true);
            window.addEventListener('mouseup', onmouseup, true);
            
            function shiftSelectionBasedOnOffset(e:MouseEvent) {
                var shift = (e.clientX - startClientX);
                if(Math.abs(shift) > 1) shiftWasEverNonZero = true;
                var offset = Math.max(0, startOffset1 + shift);
                var offset1 = Math.min(offset, startOffset2);
                var offset2 = Math.max(offset, startOffset2);
                var seekTime = convertOffsetToTimestamp(offset);
                selectionZone.style.left = `${offset1}px`;
                selectionZone.style.width = `${offset2-offset1}px`;
                seekBehavior.setSeekTime(seekTime, true);
            }

            function onmousemove(e:MouseEvent) {
                e.stopPropagation(); e.preventDefault();
                shiftSelectionBasedOnOffset(e);
            }

            function onmouseup(e:MouseEvent) {
                e.stopPropagation(); e.preventDefault();
                shiftSelectionBasedOnOffset(e);
                if(shiftWasEverNonZero) {
                    selectionBehavior.syncFromDOM();
                }
                window.removeEventListener('mousemove', onmousemove, true);
                window.removeEventListener('mouseup', onmouseup, true);
            }

        });

        rightResizer.addEventListener('mousedown', (e:MouseEvent) => {
            e.stopPropagation();

            var shiftWasEverNonZero = false;
            var startClientX = e.clientX;
            var startOffset1 = parseFloat(selectionZone.style.left);
            var startOffset2 = startOffset1 + parseFloat(selectionZone.style.width);
            var startSeekTime = convertOffsetToTimestamp(startOffset1);
            window.addEventListener('mousemove', onmousemove, true);
            window.addEventListener('mouseup', onmouseup, true);
            
            function shiftSelectionBasedOnOffset(e:MouseEvent) {
                var shift = (e.clientX - startClientX);
                if(Math.abs(shift) > 1) shiftWasEverNonZero = true;
                var offset = Math.max(0, startOffset2 + shift);
                var offset1 = Math.min(offset, startOffset1);
                var offset2 = Math.max(offset, startOffset1);
                var seekTime = convertOffsetToTimestamp(offset);
                selectionZone.style.left = `${offset1}px`;
                selectionZone.style.width = `${offset2-offset1}px`;
                seekBehavior.setSeekTime(seekTime, true);
            }

            function onmousemove(e:MouseEvent) {
                e.stopPropagation(); e.preventDefault();
                shiftSelectionBasedOnOffset(e);
            }

            function onmouseup(e:MouseEvent) {
                e.stopPropagation(); e.preventDefault();
                shiftSelectionBasedOnOffset(e);
                if(shiftWasEverNonZero) {
                    selectionBehavior.syncFromDOM();
                }
                window.removeEventListener('mousemove', onmousemove, true);
                window.removeEventListener('mouseup', onmouseup, true);
            }
        });

        return {
            isEnabled: false,
            selectionStartTimestamp: 0,
            selectionEndTimestamp: 0,
            reset() {
                this.isEnabled = false;
                this.selectionStartTimestamp = 0;
                this.selectionEndTimestamp = 0;
                selectionZone.style.display = "none";
            },
            set(startTimestamp, endTimestamp) {
                this.isEnabled = true;
                this.selectionStartTimestamp = startTimestamp;
                this.selectionEndTimestamp = endTimestamp;
                var startOffset = convertTimestampToOffset(startTimestamp);
                var endOffset = convertTimestampToOffset(endTimestamp);
                var offset1 = Math.min(startOffset, endOffset);
                var offset2 = Math.max(startOffset, endOffset);
                selectionZone.style.display = "block";
                selectionZone.style.left = `${offset1}px`;
                selectionZone.style.width = `${offset2-offset1}px`;
                setNumberChanges(alreadyKnownEvents);
                setChanges(alreadyKnownEvents);
            },
            syncFromDOM() {
                var offset1 = parseFloat(selectionZone.style.left);
                var offset2 = offset1 + parseFloat(selectionZone.style.width);
                this.set(
                    convertOffsetToTimestamp(offset1),
                    convertOffsetToTimestamp(offset2)
                );
            }
        }

    }

    function convertTimestampToOffset(timestamp) {
        return (timestamp/1000) * (SCALE * 61);
    }

    function convertOffsetToTimestamp(offset) {
        return 1000 * (offset / (SCALE * 61));
    }
    //selectable();

    $('#filter-changes input').on('keypress', function (e) {
        var toVal = $('#filter-changes .to').val();
        var fromVal = $('#filter-changes .from').val();
        if (e.keyCode == 13 && !(toVal < 0 || fromVal < 0 || toVal > TIMELINE_SECONDS || fromVal > TIMELINE_SECONDS)) {
            $('#lev').css({ left: ($('#filter-changes .from').val() * (SCALE*61)), width: ($('#filter-changes .to').val() * (SCALE*61)) - ($('#filter-changes .from').val() * (SCALE*61)) });
            levChanged();
        }
    });

    $('#node-changes input').on('keyup', function () {
        var value = this.value;
        $('.accordion-changes .acc-tr').hide().each(function () {
            if ($(this).text().search(value) > -1) {
                $(this).show();
            }
        });
    });

    enableTimelinePanning();
    function enableTimelinePanning() {
        var x, y, top, left, down;
        $(".seconds-list").mousedown(function (e) {
            e.preventDefault();
            down = true;
            x = e.pageX;
            left = $("#wrapper-timeline").scrollLeft();
            //y = e.pageY;
            //top = $("#wrapper-timeline").scrollTop();
        });
        $("body").mousemove(function (e) {
            if (down) {
                var newX = e.pageX;
                $("#wrapper-timeline").scrollLeft(left - newX + x);
                //var newY = e.pageY;
                //$("#wrapper-timeline").scrollTop(top - newY + y);
            }
        });
        $("body").mouseup(function (e) { down = false; });
    }

    $("#colorblind").change(function () {
        if (!this.checked) {
            $('#dom-recorder').removeClass('colorblind-on').addClass('colorblind-off');
        } else {
            $('#dom-recorder').removeClass('colorblind-off').addClass('colorblind-on');
        }
    });

    $('#filter-changes').find('a').click(function (e) {
        e.preventDefault();
        $('#lev').css('width', '0px');
        levChanged('reset');
    });

    /*var element = document.getElementById('lev');
    
    $(".lev").draggable({
        axis: 'x',
        containment: 'parent',
        handle: '.drag-lev',
        drag: function (e) {
            levChanged('draggable');
        }
    });

    var resizerE = document.getElementsByClassName('lev2')[0];
    resizerE.addEventListener('mousedown', initResizeE, false);

    function initResizeE(e) {
        // FIXME: $("#timeline").selectable('destroy');
        window.addEventListener('mousemove', ResizeE, false);
        window.addEventListener('mouseup', stopResizeE, false);
    }

    function ResizeE(e) {
        levChanged('resize');
        element.style.width = ((e.clientX - $('#timeline').offset().left) - $('.lev').position().left) + 'px';
    }

    function stopResizeE(e) {
        selectable();
        window.removeEventListener('mousemove', ResizeE, false);
        window.removeEventListener('mouseup', stopResizeE, false);
    }

    var baseX;
    var baseW;
    var resizerW = document.getElementsByClassName('lev1')[0];
    resizerW.addEventListener('mousedown', initResizeW, false);

    function initResizeW(e) {
        $("#timeline").selectable('destroy');
        baseX = e.clientX - $('#timeline').offset().left;
        baseW = parseInt(element.style.width);
        window.addEventListener('mousemove', ResizeW, false);
        window.addEventListener('mouseup', stopResizeW, false);
    }

    function ResizeW(e) {
        levChanged('resize');
        if (baseX < (e.clientX - $('#timeline').offset().left)) {
            element.style.width = (baseW - ((e.clientX - $('#timeline').offset().left - baseX))) + 'px';
        } else {
            element.style.width = (baseW + (baseX - (e.clientX - $('#timeline').offset().left))) + 'px';
        }

        if (e.clientX - $('#timeline').offset().left < 0) {
            element.style.left = '0px';
        } else {
            element.style.left = ((e.clientX - $('#timeline').offset().left)) + 'px';
        }
    }

    function stopResizeW(e) {
        selectable();
        window.removeEventListener('mousemove', ResizeW, false);
        window.removeEventListener('mouseup', stopResizeW, false);
    }*/
    
    return {
        setTimeline: setTimeline
    };
    
}