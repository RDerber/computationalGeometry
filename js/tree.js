function Tree() {
	this.root;
	this.node = this.root;
}

Tree.prototype.getCurrentDepth = function(){
	var node = this.node;
	var depth = 0;
	while (node.parent != null) {
		node = node.parent;
		depth++;
	}
	return depth;
}

Tree.prototype.moveRight = function () {
	var depth = 0;
	while (this.node.rightSibling == null) {
		if (this.node.parent) {
			this.node = this.node.parent;
		}
		else
			return null;
	}
	this.node = this.node.rightSibling;
	while (depth > 0) {
		if (this.node.children) {
			this.node = this.node.children[0];
			depth--;
		}
		else {
			debugger;
			return null;
		}
	}

}

Tree.prototype.moveLeft = function(){
	var depth = 0;
	var node = this.node
	while (node.leftSibling == null) {
		if (node.parent) {
			 node = node.parent;
			depth++;
		}
		else
			debugger;
		return;
	}

	node = node.leftSibling;
	while (depth > 0) {
		if (node.children) {
			node = node.children[node.children.length];
			depth--;
		}
		else {
			debugger;
			return;
		}
	}
	this.node = node;
}

Tree.prototype.atEnd = function(){
	var node = this.node;
	while (node.rightSibling == null) {
		if (node.parent != null) {
			node = node.parent;
		}
		else {
			return true;
		}
	}
	return false;

}

Tree.prototype.atBegin = function () {
	var node = this.node;
	while (node.leftSibling == null) {
		if (node.parent != null) {
			node = node.parent;
		}
		else {
			return true;
		}
	}
	return false;
}

Tree.prototype.moveUp = function () {
	if (this.node.parent != null)
		this.node = this.node.parent;
	else debugger;
}

Tree.prototype.moveDown = function () {
	if (this.node.children.length > 0)
		this.node = this.node.children[0];
	else debugger;
}

Tree.prototype.atDepth = function (d) {
	var depth = this.getCurrentDepth();
	var node = this.node;
	while (depth > d) {
		node = node.parent;
		depth--;
	}

	while (depth < d) {
		node = node.children[node.children.length - 1]
		depth++;
	}

	return node;
}