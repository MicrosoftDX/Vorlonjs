// ==================================================
// DOM Timeline core (MIT Licensed)
// https://github.com/FremyCompany/dom-timeline-core
// ==================================================

// 
// if you didn't specify domTimelineOptions before this line, 
// those options will be use as the default options
// 
var domTimelineOptions = domTimelineOptions || {
	
	// ------------------------------------------------------------------------------------------------------------------
	// if true, the script will try to attribute changes to javascript stack traces
	// ------------------------------------------------------------------------------------------------------------------
	// note: this incurs an important dom performance impact on the page
	// ------------------------------------------------------------------------------------------------------------------
	// note: when this script is not run first on the page, this feature may not work completely
	//       to make sure it is run first, put a breakpoint before the first script of the page, 
	//       and execute it in the console before continuing the page execution
	// ------------------------------------------------------------------------------------------------------------------
	enableCallstackTracking: true,
	
	// ------------------------------------------------------------------------------------------------------------------
	// when false, the script won't start recording changes until you press F9 or call domHistory.startRecording()
	// ------------------------------------------------------------------------------------------------------------------
	startRecordingImmediately: false,
	
	
	// ------------------------------------------------------------------------------------------------------------------
	// this function is called whenever (claimed or unclaimed) change records are being added to the dom history
	// its primary purpose is to allow you to log these events (in whole or after applying some filter)
	// ------------------------------------------------------------------------------------------------------------------
	considerLoggingRecords(claim,records,stack) {
		//console.groupCollapsed(claim+" ["+records.length+"]");{
		//	for(let record of records) { console.log(record); }
		//	console.log(stack||"(no known stack)");
		//	console.groupEnd();
		//};
	},
	
	// ------------------------------------------------------------------------------------------------------------------
	// this function is being called inline when a change record is being discovered
	// its primary usage is to allow you to break into the debugger in the context of the change
	// ------------------------------------------------------------------------------------------------------------------
	// note: this feature requires 'enableCallstackTracking' being on and working (otherwise some changes will be unclaimed)
	// ------------------------------------------------------------------------------------------------------------------
	considerDomBreakpoint(m) {
		//if(m.attributeName=='style' && m.target.id=='configStackPage_1' && m.newValue && m.newValue.indexOf('block')>=0) {
		//	debugger;
		//}
	},
	
	// ------------------------------------------------------------------------------------------------------------------
	// this function is being called inline when a change record is being discovered (before it is added to history)
	// its primary usage is to allow you to return "true" and avoid the change to clutter the history
	// ------------------------------------------------------------------------------------------------------------------
	// note: not including a change in the history means it cannot be undone/redone! 
	// note: this feature may be easier to use if 'enableCallstackTracking' is on and working
	// ------------------------------------------------------------------------------------------------------------------
	considerIgnoringRecord(m) {
		
		var e = m.target;
		var shouldIgnore = false;
		
		// ignore vorlon overlays
		shouldIgnore = shouldIgnore || !!(e.id && e.id.indexOf("vorlon") == 0);
		shouldIgnore = shouldIgnore || !!(closest(e,"[id^='vorlon']"));
		shouldIgnore = shouldIgnore || !!(m.addedNodes[0] && m.addedNodes[0].id && m.addedNodes[0].id.indexOf("vorlon") == 0);
		shouldIgnore = shouldIgnore || !!(m.addedNodes[1] && m.addedNodes[1].id && m.addedNodes[1].id.indexOf("vorlon") == 0);
		shouldIgnore = shouldIgnore || !!(m.removedNodes[0] && m.removedNodes[0].id && m.removedNodes[0].id.indexOf("vorlon") == 0);
		shouldIgnore = shouldIgnore || !!(m.removedNodes[1] && m.removedNodes[1].id && m.removedNodes[1].id.indexOf("vorlon") == 0);
		
		// ignore vorlon modernizer
		shouldIgnore = shouldIgnore || !!(m.stack && m.stack.indexOf("vorlon/plugins/modernizrReport/modernizr.js") >= 0);
		
		// ignore vorlon's inspect overlays
		shouldIgnore = shouldIgnore || !!(m.stack && m.stack.indexOf("vorlon.max.js") >= 0 && m.stack.indexOf("DOMExplorerClient.inspect") >= 0);
		
		// ignore vorlon scripts and styles
		shouldIgnore = shouldIgnore || !!(e.tagName == "LINK" && e.href && e.href.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(e.tagName == "STYLE" && e.src && e.src.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(e.tagName == "SCRIPT" && e.src && e.src.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.addedNodes[0] && m.addedNodes[0].href && m.addedNodes[0].href.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.addedNodes[1] && m.addedNodes[1].href && m.addedNodes[1].href.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.removedNodes[0] && m.removedNodes[0].href && m.removedNodes[0].href.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.removedNodes[1] && m.removedNodes[1].href && m.removedNodes[1].href.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.addedNodes[0] && m.addedNodes[0].src && m.addedNodes[0].src.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.addedNodes[1] && m.addedNodes[1].src && m.addedNodes[1].src.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.removedNodes[0] && m.removedNodes[0].src && m.removedNodes[0].src.indexOf("vorlon") >= 0);
		shouldIgnore = shouldIgnore || !!(m.removedNodes[1] && m.removedNodes[1].src && m.removedNodes[1].src.indexOf("vorlon") >= 0);
		return shouldIgnore;
		
		function closest(e,s) {
			if(e.closest) {
				return e.closest(s);
			} else {
				while((e = e.parentNode) && (!matches(e,s))) {}
				return e;
			}
			function matches(e,s) {
				return (
					e.matches ? e.matches(s) :
					e.matchesSelector ? e.matchesSelector(s) : 
					e.webkitMatchesSelector ? e.webkitMatchesSelector(s) :
					e.mozMatchesSelector ? e.mozMatchesSelector(s) :
					e.msMatchesSelector ? e.msMatchesSelector(s) :
					false
				);
			}
		}
	},

	// ------------------------------------------------------------------------------------------------------------------
	// this function is being called inline when recording starts
	// ------------------------------------------------------------------------------------------------------------------
	onRecordingStart() {},

	// ------------------------------------------------------------------------------------------------------------------
	// this function is being called inline when recording restarts
	// ------------------------------------------------------------------------------------------------------------------
	onRecordingRestart() {},

	// ------------------------------------------------------------------------------------------------------------------
	// this function is being called inline when recording stops
	// ------------------------------------------------------------------------------------------------------------------
	onRecordingStop() {}
	
};

// 
// from there, you can find the actual dom-timeline-core code
// 
void function() {
	"use strict";
	
	// prepare to store the mutations
	let recordingStartDate = (window.performance ? window.performance.now() : Date.now());
	var domHistoryPast = [];
	var domHistoryFuture = [];
	var domHistory = window.domHistory = {
		
		// ------------------------------------------------------------------------------------------------------------------
		// this MutationRecord array contains past dom changes of the page, ready to undo
		// ------------------------------------------------------------------------------------------------------------------
		past: domHistoryPast,
		
		// ------------------------------------------------------------------------------------------------------------------
		// this MutationRecord array contains undoed dom changes of the page, ready to redo
		// ------------------------------------------------------------------------------------------------------------------
		// note: if this array is not empty, the page will be frozen to avoid rewriting the history
		// ------------------------------------------------------------------------------------------------------------------
		future: domHistoryFuture,
		
		// ------------------------------------------------------------------------------------------------------------------
		// this MutationRecord array contains dom changes that were canceled just after execution, due to a future already existing
		// ------------------------------------------------------------------------------------------------------------------
		lostFuture: [],
		
		// ------------------------------------------------------------------------------------------------------------------
		// takes the last dom change added to the past history, undoes it, and add it to the future history
		// ------------------------------------------------------------------------------------------------------------------
		// note: this will lock the page in past history, potentially breaking page scripts
		// ------------------------------------------------------------------------------------------------------------------
		undo() {
			
			// clean records
			logUnclaimedMutations(o.takeRecords());
			
			// get mutation to undo
			var mutation = domHistoryPast.pop();
			if(!mutation) return false;
			
			// undo it
			try {
				isDoingOffRecordsMutations++;
				domHistoryFuture.push(mutation);
				undoMutationRecord(mutation);
			} finally {
				isDoingOffRecordsMutations--;
				o.takeRecords();
			}
			
			return true;
			
		},
		
		// ------------------------------------------------------------------------------------------------------------------
		// takes the last dom change added to the future history, redoes it, and add it to the past history
		// ------------------------------------------------------------------------------------------------------------------
		// note: this could unlock the page future history, if this was the last future change to apply
		// ------------------------------------------------------------------------------------------------------------------
		redo() {
			
			// clean records
			logUnclaimedMutations(o.takeRecords());
			
			// get mutation to undo
			var mutation = domHistoryFuture.pop();
			if(!mutation) return false;
			
			// undo it
			try {
				isDoingOffRecordsMutations++;
				domHistoryPast.push(mutation);
				redoMutationRecord(mutation);
			} finally {
				isDoingOffRecordsMutations--;
				o.takeRecords();
			}
			
			return true;
			
		},

		// ------------------------------------------------------------------------------------------------------------------
		// takes the last dom change added to the future history, redoes it, and add it to the past history
		// ------------------------------------------------------------------------------------------------------------------
		// note: this could either lock or unlock the page future history, depending on the value sent
		// ------------------------------------------------------------------------------------------------------------------
		seek(amountOfPastEvents) {

			var couldUndo = domHistoryPast.length > 0;
			while(domHistoryPast.length > amountOfPastEvents && couldUndo) {
				couldUndo = this.undo();
			}

			var couldRedo = domHistoryFuture.length > 0
			while(domHistoryPast.length < amountOfPastEvents && couldRedo) {
				couldRedo = this.redo();
			}

			return domHistoryPast.length == amountOfPastEvents;

		},
		
		startRecording() {
			if(isRecordingStopped) {
				isRecordingStopped = false;
				onRecordingRestart();
				return true;
			}
			if(isDoingOffRecordsMutations >= 1e9) {
				o.takeRecords();
				isDoingOffRecordsMutations -= 1e9;
				recordingStartDate = (window.performance ? window.performance.now() : Date.now());
				onRecordingStart();
				return true;
			}
			return false;

			function onRecordingStart() {
				try { 
					isDoingOffRecordsMutations++;
					if(domTimelineOptions.onRecordingStart) { 
						domTimelineOptions.onRecordingStart();
					}
				} catch (ex) {
					console.error(ex);
				} finally {
					isDoingOffRecordsMutations--;
				}
			}
			function onRecordingRestart() {
				try { 
					if(domTimelineOptions.onRecordingRestart) { 
						domTimelineOptions.onRecordingRestart(); 
					}
				} catch (ex) {
					console.error(ex);
				}
			}
		},
		
		stopRecording() {
			if(isDoingOffRecordsMutations >= 1e9) {
				return false;
			}
			if(!isRecordingStopped) {
				isRecordingStopped = true;
				onRecordingStop();
				return true;
			}
			return false;

			function onRecordingStop() {
				try { 
					if(domTimelineOptions.onRecordingStop) { 
						domTimelineOptions.onRecordingStop(); 
					}
				} catch (ex) {
					console.error(ex);
				}
			}
		},
		
		get isRecording() {
			return !(isRecordingStopped || isDoingOffRecordsMutations >= 1e9);
		},
		
		get isRecordingStopped() {
			return isRecordingStopped;
		}
		
	};
	
	// create an observer
	let o = new MutationObserver(logUnclaimedMutations);
	
	// allow things to be off-records
	let isRecordingStopped = false;
	let isDoingOffRecordsMutations = +false;
	function getAttribute(target, attributeName) {
		try {
			isDoingOffRecordsMutations++;
			return target.getAttribute(attributeName);
		} finally {
			isDoingOffRecordsMutations--;
		}
	}

	// hook the observer
	o.observe(
		document.documentElement, 
		{ 
			childList: true, 
			attributes: true, 
			characterData: true, 
			subtree: true, 
			attributeOldValue: true, 
			characterDataOldValue: true 
		}
	);
	
	// disable recording if asked to do some
	if(!domTimelineOptions.startRecordingImmediately) {
		isDoingOffRecordsMutations += 1e9;
		window.addEventListener('keydown', e=>{ if(e.keyCode==120) domHistory.startRecording(); }, true);
	}
	
	// enable callstack tracking
	if(domTimelineOptions.enableCallstackTracking) {
		console.groupCollapsed("domTimelineOptions.enableCallstackTracking==true");
		try {
			enableCallstackTracking();
		} finally {
			console.groupEnd();
		}
	}
	
	// notify everything went fine
	console.log("setup completed without error"); return;
	//-----------------------------------------------------------------------------------------------------
	
	//
	// save the newValue attribute on records to enable redo, and add them to history
	//
	function postProcessRecords(records,stack,claim) {
		
		// we cancel immediately any mutation which would be added to the past history when there is already a future
		if(domHistoryFuture.length > 0 || isRecordingStopped) {
			
			if(domHistory.lostFuture.length == 0) {
				console.warn("DOM Mutations were canceled because we are reviewing the past and there is already a future (see domHistory.lostFuture)");
				domHistory.lostFuture.push.apply(domHistory.lostFuture, records);
			} else {
				domHistory.lostFuture.push.apply(domHistory.lostFuture, records);
			}
			
			try {
				isDoingOffRecordsMutations++;
				for(var i = records.length; i--;) {
					undoMutationRecord(records[i])
				}
			} finally {
				isDoingOffRecordsMutations--;
				records.length = 0;
				o.takeRecords();
			}
			return;
			
		}
		
		// otherwise, we post process the records
		if(records.length == 1) {
			
			var record = records[0];
			if(record.type == 'attributes') {
				
				var target = record.target;
				var attrName = record.attributeName;
				record.newValue = getAttribute(target,attrName);
				
			} else if(record.type == 'characterData') {
				
				var target = record.target;
				record.newValue = target.nodeValue;
				
			}
			
			record.claim = claim;
			record.stack = ''+stack;
			record.timestamp = (window.performance ? window.performance.now() : Date.now())-recordingStartDate;
			
			// give the owner an opportunity to hide the record
			if(domTimelineOptions.considerIgnoringRecord(record)) {
				records.length = 0;
			} else {
				domHistoryPast.push(record);
			}
			
			// give the owner an opportunity to break into javascript
			domTimelineOptions.considerDomBreakpoint(record);
			
		} else {
			
			var containsAnyNull = false;
			var latestAttributeValues = new Map();
			var latestCharacterDataValues = new Map();
			for(var i = records.length; i--;) {
				
				var record = records[i];
				if(record.type == 'attributes') {
					
					var target = record.target;
					var attrName = record.attributeName;
					var attrValues = latestAttributeValues.get(target);
					if(!attrValues) latestAttributeValues.set(target, attrValues={});
					record.newValue = attrValues[attrName] || getAttribute(target,attrName);
					attrValues[attrName] = record.oldValue;
					
				} else if(record.type == 'characterData') {
					
					var target = record.target;
					var newValue = latestCharacterDataValues.get(target);
					record.newValue = (newValue != undefined) ? (newValue) : (target.nodeValue);
					latestCharacterDataValues.set(target, record.oldValue);
					
				}
				
				record.stack = ''+stack;
				
				// give the owner an opportunity to hide the record
				if(domTimelineOptions.considerIgnoringRecord(record)) {
					records[i] = null; containsAnyNull = true;
				}
				
				// give the owner an opportunity to break into javascript
				domTimelineOptions.considerDomBreakpoint(record);
				
			}
			
			// remove from the records anything that has been ignored
			if(containsAnyNull) {
				for(var i=0, j=0; i--;) {
					if(records[i] !== null) {
						records[j++] = newRecords[i];
					}
				}
				records.length = j;
			}
			
			domHistoryPast.push.apply(domHistoryPast, records);
		}
	}
	
	// 
	// log mutations which are not claimed by a monitored function call
	// 
	function logUnclaimedMutations(inputRecords) {
		var stack = undefined, claim = "unclaimed";
		var records = inputRecords || o.takeRecords(); 
		if(records && records.length && isDoingOffRecordsMutations<1e9) {
			
			postProcessRecords(records,stack,claim);
			if(records.length) {
				domTimelineOptions.considerLoggingRecords(claim,records,stack);
			}
			
		}
	}
	
	// 
	// log mutations which are claimed by a monitored function call
	// 
	function logClaimedMutations(claim, stack) {
		var records = o.takeRecords();
		if(records && records.length) {
			
			postProcessRecords(records,stack,claim);
			if(records.length) {
				domTimelineOptions.considerLoggingRecords(claim,records,stack);
			}
			
		}
	}

	// 
	// enable callstack support
	// 
	function enableCallstackTracking() {
		
		// before hooking anything, get an instance of important classes
		var classListInstance = document.documentElement.classList;
		var styleInstance = document.documentElement.style;
		
		// the style object is special in some browsers, we need special attention to it
		if(window.Element.prototype.hasOwnProperty('style')) wrapStyleInProxy(window.Element);
		if(window.SVGElement.prototype.hasOwnProperty('style')) wrapStyleInProxy(window.SVGElement);
		if(window.HTMLElement.prototype.hasOwnProperty('style')) wrapStyleInProxy(window.HTMLElement);
		
		// the classList object does require some more attention too
		if(window.Element.prototype.hasOwnProperty('classList')) wrapClassListInProxy(window.Element);
		if(window.SVGElement.prototype.hasOwnProperty('classList')) wrapClassListInProxy(window.SVGElement);
		if(window.HTMLElement.prototype.hasOwnProperty('classList')) wrapClassListInProxy(window.HTMLElement);
		
		// otherwhise, we can hook most properties and functions from those classes
		var protoNames = ['SVGElement','HTMLElement','Element','Node','Range','Selection','HTMLImageElement','Image',classListInstance,styleInstance];
		var candidateNames = Object.getOwnPropertyNames(window);
		for(var i = 0; i<candidateNames.length; i++) {
			var candidateName = candidateNames[i];
			if(/^(HTML|SVG).*Element$/.test(candidateName)) {
				if(protoNames.indexOf(candidateName) == -1) {
					protoNames.push(candidateName);
				}
			}
		}
		for(let _protoName of protoNames) { let protoName = _protoName;
			try{
				let proto = (typeof(protoName) == 'string') ? (window[protoName].prototype) : Object.getPrototypeOf(protoName);
				protoName = (typeof(protoName) == 'string') ? protoName : Object.prototype.toString.call(protoName).replace(/\[object (.*)\]/,'$1');
				
				// for each property, we might want to setup a hook
				for(let _propName of Object.getOwnPropertyNames(proto)) { let propName = _propName;
					if(/^on/.test(propName)) { continue/* and don't mess with events */; }
					
					let prop = Object.getOwnPropertyDescriptor(proto, propName);
					if("value" in prop) { 
						if(typeof(prop.value) == 'function' && propName != "constructor") {
							
							console.log(`patching ${protoName}.prototype.${propName} as a function`);
							try {
							
								proto[propName] = function() {
									isDoingOffRecordsMutations || logUnclaimedMutations();
									let result = prop.value.apply(this.__this||this, arguments);
									isDoingOffRecordsMutations || logClaimedMutations("call "+propName, new Error().stack.replace(/^Error *\r?\n/i,''));
									return result;
								};
								
							} catch (ex) {
								console.log(ex);
							}
							
						} else {
							console.log(`skipping ${protoName}..${propName} as a constant`);
						}
					} else { 
					
						console.log(`patching ${protoName}..${propName} as a property`);
						try {
							
							if(!prop.get || !/native code/.test(prop.get)) { continue; }
							Object.defineProperty(proto, propName, { 
								get() {
									try {
										let result = prop.get.apply(this.__this||this,arguments);
										return result;
									} catch (ex) {
										if(ex.stack.indexOf("Illegal invocation")==-1) {
											throw ex;
										} else {
											console.log(ex);
										}
									}
								},
								set() {
									isDoingOffRecordsMutations || logUnclaimedMutations();
									let result = prop.set ? prop.set.apply(this.__this||this,arguments) : undefined;
									isDoingOffRecordsMutations || logClaimedMutations("set "+propName, new Error().stack.replace(/^Error *\r?\n/i,''));
									return result;
								}
							});
							
						} catch (ex) {
							console.log(ex);
						}
						
					}
				}
			} catch (ex) {
				console.error("Gave up hooking into ", ""+protoName, ex.message);
			}
		}
		
		function wrapStyleInProxy(HTMLElement) {
			var propName = 'style';
			var prop = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
			Object.defineProperty(HTMLElement.prototype, 'style', { 
				get() {
					try {
						let result = prop.get.apply(this,arguments);
						Object.defineProperty(result,'__this',{enumerable:false,value:result});
						return wrapInProxy(
							result,
							propName,
							(claim)=>(isDoingOffRecordsMutations || logUnclaimedMutations()),
							(claim)=>(isDoingOffRecordsMutations || logClaimedMutations(claim, new Error().stack.replace(/^Error *\r?\n/i,'')))
						);
					} catch (ex) {
						if(ex.stack.indexOf("Illegal invocation")==-1) {
							throw ex;
						} else {
							console.log(ex);
						}
					}
				},
				set() {
					isDoingOffRecordsMutations || logUnclaimedMutations();
					let result = prop.set.apply(this,arguments);
					isDoingOffRecordsMutations || logClaimedMutations("set "+propName, new Error().stack.replace(/^Error *\r?\n/i,''));
					return result;
				}
			});
		}
		
		function wrapClassListInProxy(HTMLElement) {
			var propName = 'classList';
			var prop = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'classList');
			Object.defineProperty(HTMLElement.prototype, 'classList', { 
				get() {
					try {
						let result = prop.get.apply(this,arguments);
						Object.defineProperty(result,'__this',{enumerable:false,value:result});
						return wrapInProxy(
							result,
							propName,
							(claim)=>(isDoingOffRecordsMutations || logUnclaimedMutations()),
							(claim)=>(isDoingOffRecordsMutations || logClaimedMutations(claim, new Error().stack.replace(/^Error *\r?\n/i,'')))
						);
					} catch (ex) {
						if(ex.stack.indexOf("Illegal invocation")==-1) {
							throw ex;
						} else {
							console.log(ex);
						}
					}
				},
				set() {
					isDoingOffRecordsMutations || logUnclaimedMutations();
					let result = prop.set.apply(this,arguments);
					isDoingOffRecordsMutations || logClaimedMutations("set "+propName, new Error().stack.replace(/^Error *\r?\n/i,''));
					return result;
				}
			});
		}
		
		// some objects need special wrapping, which we try to get using a proxy
		function wrapInProxy(obj,objName,onbeforechange,onafterchange) {
			
			if(window.Proxy) {
				
				// wrap using proxy
				return new Proxy(obj, {
				  "get": function (oTarget, sKey) {
					var value = oTarget[sKey];
					if(typeof(value) == 'function') {
						return function() {
							onbeforechange("call " + objName + "." + sKey);
							var result = value.apply(this, arguments);
							onafterchange("call " + objName + "." + sKey);
							return result;
						}
					}
					return value;
				  },
				  "set": function (oTarget, sKey, vValue) {
					onbeforechange("set " + objName + "." + sKey);
					var result = oTarget[sKey] = vValue;
					onafterchange("set " + objName + "." + sKey);
					return true;
				  }
				});
				
			} else {
				
				// wrap using exhaustive property forwarding
				var shapeSource = getComputedStyle(document.documentElement);
				var o = {__proto__:document.documentElement.style.__proto__};
				Object.keys(shapeSource).forEach(function(key) {
					var lowerKey = key.replace(/./,c=>c.toLowerCase());
					var upperKey = key.replace(/./,c=>c.toUpperCase());
					var cssKey = key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
					var cssPrefixKey = '-'+cssKey;
					// create a getter for that key
					if(lowerKey in obj) {
						Object.defineProperty(o, lowerKey, {
							get: function() { 
								return obj[lowerKey]; 
							},
							set: function(value) { 
								onbeforechange("set " + objName + "." + key);
								var result = obj[lowerKey]=value;
								onafterchange("set " + objName + "." + key);
								return result;
							}
						});
					}
					// create a getter for a possible hidden key
					if(upperKey in obj) {
						Object.defineProperty(o, upperKey, {
							get: function() { 
								return obj[upperKey]; 
							},
							set: function(value) { 
								onbeforechange("set " + objName + "." + key);
								var result = obj[upperKey]=value;
								onafterchange("set " + objName + "." + key);
								return result;
							}
						});
					}
					// create a getter for a possible hidden css key
					if(cssKey in obj) {
						Object.defineProperty(o, cssKey, {
							get: function() { 
								return obj[cssKey]; 
							},
							set: function(value) { 
								onbeforechange("set " + objName + "." + key);
								var result = obj[cssKey]=value;
								onafterchange("set " + objName + "." + key);
								return result;
							}
						});
					}
					// create a getter for a possible hidden prefixed css key
					if(cssPrefixKey in obj) {
						Object.defineProperty(o, cssPrefixKey, {
							get: function() { 
								return obj[cssPrefixKey]; 
							},
							set: function(value) { 
								onbeforechange("set " + objName + "." + key);
								var result = obj[cssPrefixKey]=value;
								onafterchange("set " + objName + "." + key);
								return result;
							}
						});
					}
				});
				
			}
			
		}
		
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
	
}();

//
// this is where we enable to "dom timeline animation" demo on pressing down F10
//
void function() {
	
	// enable shortcut for animation
	window.addEventListener('keydown', e=>{ if(e.keyCode==121) animateDOMHistory(); }, true);

	function animateDOMHistory() {
		
		if(animateDOMHistory.timer) { 
			console.log("stopping animation (we may be locked in the past)");
			window.clearInterval(animateDOMHistory.timer); 
			animateDOMHistory.timer = 0;
			return;
		}
		
		var historyLength = (domHistory.past.length + domHistory.future.length);
		
		var wait = 0;
		var wait3s = 3000/(10000/historyLength);
		
		console.log("starting animation");
		while(domHistory.past.length > 0) {
			domHistory.undo();
		}
		
		animateDOMHistory.timer = window.setInterval(function() { 
			if(domHistory.future.length == 0) {
				if(wait == 0) console.log('start waiting');
				if(wait++ >= wait3s) {
					console.log('rewinding all events');
					while(domHistory.past.length > 0) {
						domHistory.undo();
					}
					wait = 0;
				}
			} else {
				domHistory.redo();
			}
		},10000/historyLength);
		
	}
}();

//
// we are done :-)
//
"setup completed without error";