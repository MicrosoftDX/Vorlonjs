var m : ExtendedMutationRecord;

//if(true) { debugger; };

function closest(selector: string, node: Node, converter: Function) {
    while(node && !matches(selector, node)) {
        node = node.parentNode;
    }
    return node ? converter(node) : node;
}

function matches(selector: string, node: any) {
    var matches = node.matches || node.webkitMatchesSelector || node.mozMatchesSelector || node.msMatchesSelector || function() { return false };
    return matches.call(node, selector);
}

function anyNodeInList(nodes: NodeList, match: Function, options) {
    if(!nodes || nodes.length == 0) return false;
    if(!options) options = { deep: true };
    for(var i = nodes.length; i--;) {
        if(match(nodes[i])) return true;
        if(options.deep != false) {
            if(anyNodeInList(nodes[i].childNodes, match, options)) {
                return true;
            }
        }
    }
}

function anyNode(match: Function | string, options) {
	if (match instanceof Function) {
		return match(m.target) || anyAddedNode(match, options) || anyRemovedNode(match, options);
	} else {
		return anyNode(function(node) { return matches(match, node); }, options);
	}
}

function anyAddedNode(match: Function | string, options) {
	if (match instanceof Function) {
		return anyNodeInList(m.addedNodes, match, options);
	} else {
		return anyNodeInList(m.addedNodes, function(node) { return matches(match, node); }, options);
	}
}

function anyRemovedNode(match: Function | string, options) {
	if (match instanceof Function) {
		return anyNodeInList(m.removedNodes, match, options);
	} else {
		return anyNodeInList(m.removedNodes, function(node) { return matches(match, node); }, options);
	}
}

function attributeAdded(name: string) {
    return m.type == 'attributes' && m.newValue != null && m.oldValue == null;
}

function attributeRemoved(name: string) {
    return m.type == 'attributes' && m.newValue == null && m.oldValue != null;
}

function attributeChanged(name: string, options) {
    var matches = m.type == 'attributes';
    matches = matches && (name===undefined || (m.attributeName === name));
    matches = matches && (options.newValue===undefined || (m.newValue === options.newValue));
    matches = matches && (options.newValueContains===undefined || (m.newValue && m.newValue.indexOf(options.newValueContains) >= 0));
    matches = matches && (options.oldValue===undefined || (m.oldValue === options.oldValue));
    matches = matches && (options.oldValueContains===undefined || (m.oldValue && m.oldValue.indexOf(options.oldValueContains) >= 0));
    matches = matches && (options.newlyContains===undefined || (
        (!m.oldValue || m.oldValue.indexOf(options.newlyContains) == -1) 
        && (m.newValue && m.newValue.indexOf(options.newlyContains) >= 0)
    ));
    matches = matches && (options.previouslyContained===undefined || (
        (!m.newValue || m.newValue.indexOf(options.previouslyContained) == -1) 
        && (m.oldValue && m.oldValue.indexOf(options.previouslyContained) >= 0)
    ));
    return matches;
}
    