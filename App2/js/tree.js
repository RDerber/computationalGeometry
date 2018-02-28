function Tree() {
	this.root;
	this.node = this.root;
}

Tree.prototype.getCurrentDepth = function(){
	var node = this.node;
	var depth;
	while (node.parent != null) {
		node = node.parent;
		depth++;
	}
	return depth;
}

Tree.prototype.begin = function () {
	while (this.node.children.length > 0) {
		this.node = this.node.children[0];
	}
}

Tree.prototype.moveRight = function () {
	var depth;
	while (!this.node.rightSibling) {
		if (this.node.parent) {
			this.node = this.node.parent;
			depth++;
		}
		else
			return null;
	}
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

	Tree.prototype.moveLeft = function(){
		var depth;
		if (this.node.parent) {
			this.node = this.node.parent;
			depth++;
		}
		else
			return null;
		return depth;
	}
	while (depth > 0) {
		if (this.node.children) {
			this.node = this.node.children[this.node.children.length];
			depth--;
		}
		else {
			debugger;
			return null;
		}
	}
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