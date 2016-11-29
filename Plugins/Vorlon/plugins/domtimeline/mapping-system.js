var MappingSystem = function() {
	
	//
	// This object transforms any object into a reference
	// to a serialized form of this object stored in the data
	//
	function MappingSystem() {
		this.data = [];
		this.o2pMap = new Map();
		this.p2oMap = new Map();
	}
	
	MappingSystem.prototype.addToMaps = function(obj, index, meta) {
		var nodePointer = new MappingSystemPointer(index,meta);
		this.o2pMap.set(obj, nodePointer);
		this.p2oMap.set(index, obj);
	}
	
	//
	// Here is how a pointer is defined for a mapping system
	//
	function MappingSystemPointer(index, meta) {
		this.index = index;
		this.meta = meta;
	}
	
	MappingSystemPointer.prototype.valueOf = function() { 
		return this.index + '<' + JSON.stringify(this.meta) + '>';
	};
	
	MappingSystemPointer.prototype.toString = (
		MappingSystemPointer.prototype.valueOf
	);

	MappingSystem.Pointer = MappingSystem;
	
	//
	// This mapping system is specialized for nodes
	//
	function NodeMappingSystem(baseDocument) {
		MappingSystem.call(this);
		this.document = baseDocument || document;
	}
	
	NodeMappingSystem.prototype = Object.create(MappingSystem.prototype);
	NodeMappingSystem.prototype.addNodeAndChildren = function(node) {
		var data = { nodeName:node.nodeName, nodeValue:node.nodeValue, outerHTML: new XMLSerializer().serializeToString(node) };
		var dataIndex = this.data.push(data)-1;

		// iterate the inserted new nodes to find interesting ones
		// FIXME: actually, we could optimize this further and only add data for subtree we have to insert, not root or nothing		
		var localIndex = 0, wereNoNewNodeFound = true; 
		var treewalker = this.document.createTreeWalker(node); do {
		
			//FIXME:what if someone removes a node from the DOM, changes it, then reinsert it? create an observer for nodes that exit the dom?
			if(!this.o2pMap.get(node)) { 
				this.addToMaps(
					node,
					dataIndex+':'+(localIndex++), 
					describeNode(node)
				);
				wereNoNewNodeFound = false;
			}
			
		} while (node = treewalker.nextNode());

		// don't keep data that will not be used
		if(wereNoNewNodeFound) {
			this.data.pop(); 
		}
	};
	NodeMappingSystem.prototype.importData = function(data) {
		var baseDataIndex = this.data.length;
		for(var dataIndex = 0; dataIndex<data.length; dataIndex++) { var d = data[dataIndex];
			
			this.data.push(d);
			
			switch(d.nodeName) {
			
				case "#text":
					var node = this.document.createTextNode(d.nodeValue);
					
					this.addToMaps(
						node,
						(baseDataIndex+dataIndex)+':0', 
						describeNode(node)
					);
				break;
				
				case "#comment":
					var node = this.document.createComment(d.nodeValue);
					
					this.addToMaps(
						node,
						(baseDataIndex+dataIndex)+':0', 
						describeNode(node)
					);
				break;

				default:
					var dp = new this.document.defaultView.DOMParser();
					try { var fragment = dp.parseFromString(d.nodeName[0]!='#' ? d.outerHTML : '<script type=unknown>'+d.nodeValue+'<\/script>','text/xml') } 
					catch (ex) { var fragment = dp.parseFromString('<error></error>','text/xml'); (fragement.firstChild||fragment).textContent = ex; debugger; }

					fragment = convertXMLNodeToHTMLNode(fragment, this.document);
					
					var localIndex = 0; 
					var treewalker = this.document.createTreeWalker(fragment); 
					var node; while(node = treewalker.nextNode()) {
					
						this.addToMaps(
							node,
							(baseDataIndex+dataIndex)+':'+(localIndex++), 
							describeNode(node)
						);
						
					}
				break;
				
			}
			
		}
	};

	NodeMappingSystem.prototype.getPointerListFor = function(nodes) {
		var pointers = [];
		for(var i = 0; i<nodes.length; i++) {
			pointers.push(this.getPointerFor(nodes[i]));
		}
		return pointers;
	}

	NodeMappingSystem.prototype.getPointerFor = function(node) {
		return this.o2pMap.get(node);
	}

	NodeMappingSystem.prototype.getObjectListFor = function(pointers) {
		var nodes = [];
		for(var i = 0; i<pointers.length; i++) {
			nodes.push(this.getObjectFor(pointers[i]));
		}
		return nodes;
	}

	NodeMappingSystem.prototype.getObjectFor = function(pointer) {
		return this.p2oMap.get(
			typeof(pointer) == 'string' 
			? (pointer) : (''+pointer.index)
		);
	}
	
	NodeMappingSystem.initFromData = initMappingSystemFromData;
	NodeMappingSystem.initFromDocument = initMappingSystemFromDocument;
	
	MappingSystem.NodeMappingSystem = NodeMappingSystem;
	
	//
	// HELPERS
	//
	
	// add a node and its children as both data and pointer references in a mapping
	function addNodesToMappingSystem(ms, node) {
		ms.addNodeAndChildren(node);		
	}

	function convertXMLNodeToHTMLNode(xmlDoc, document) {
		var oldRoot = xmlDoc;
		var newRoot = document.createDocumentFragment();

		var oldNode = oldRoot.firstChild;
		var lastNewNode = newRoot;
		while(oldNode) {

			// clone the node
			if("tagName" in oldNode) {
				var newNode = document.createElement(oldNode.tagName);
				copyAttributes(oldNode, newNode);
			} else if (oldNode.nodeName == "#text") {
				var newNode = document.createTextNode(oldNode.nodeValue);
			} else {
				var newNode = document.createComment(oldNode.nodeValue);
				//FIXME: other types
			}

			// insert it
			lastNewNode.appendChild(newNode);
			
			// move to the next node in dom order
			if(oldNode.firstChild) {
				lastNewNode = newNode;
				oldNode = oldNode.firstChild;
			} else if (oldNode.nextSibling) {
				oldNode = oldNode.nextSibling;
			} else {
				while(!oldNode.nextSibling && oldNode.parentNode != oldRoot) {
					oldNode = oldNode.parentNode;
					lastNewNode = lastNewNode.parentNode;
				}
				oldNode = oldNode.nextSibling;
			}
		}

		return newRoot;
	}
	
	function copyAttributes(oldNode, newNode) {
		for(var i = 0; i<oldNode.attributes.length; i++) {
			var attribute = oldNode.attributes[i];
			newNode.setAttribute(attribute.nodeName, attribute.nodeValue);
		}
	}

	// add the root node of a document (and children) as both data and pointers references in a mapping
	function initMappingSystemFromDocument(document) {
		document = document || window.document;
		
		var ms = new NodeMappingSystem();
		if(document.doctype) {
			addNodesToMappingSystem(ms, document.doctype);	
		}
		addNodesToMappingSystem(ms, document.documentElement);
		
		return ms;
		
	}

	function describeNode(node) {
		if(node.childNodes.length) {
			node = node.cloneNode(false);
			node.textContent = '…';
		}
		return node.outerHTML || (node.tagName ? '<'+node.tagName+'>' : node.nodeName + "["+shortenIfNeeded(node.nodeValue||'',35)+"]");
	}
	
	function shortenIfNeeded(text, length) {
		if(text.length > length) {
			text = text.substr(0, length-1) + '…';
		}
		return text;
	}
	
	// recreate a mapping system from the serialized data
	function initMappingSystemFromData(data) {
		var ms = new NodeMappingSystem();
		ms.importData(data);
		return ms;
	}
	
	return MappingSystem;

}();