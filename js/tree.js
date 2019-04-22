function Tree() {
	this.root = new TreeNode();
	this.node = this.root;
}

Tree.prototype.getCurrentDepth = function(){
	var node = this.node;
	var depth = 0;
	while (node.parent != null) {
		node = node.parent;
		depth++;
	}
	if (node != this.root) debugger;
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
			return null;
		}
	}
	return this.node;
}

Tree.prototype.moveLeft = function(){
	var depth = 0;
	while (this.node.leftSibling == null) {
		if (this.node.parent) {
			this.node = this.node.parent;
		}
		else
			return null;
	}
	this.node = this.node.leftSibling;
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
	return this.node;
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
	return this.node;
}

Tree.prototype.moveDown = function () {
	if (this.node.children.length > 0)
		this.node = this.node.children[0];
	else debugger;
	return this.node;
}

Tree.prototype.moveToDepth = function (d) {
	var depth = this.getCurrentDepth();
	var node = this.node;
	while (depth > d) {
		if (node.parent == null)
			debugger;
		node = node.parent;
		depth--;
	}

	while (depth < d) {
		if (node.children.length == 0)
			debugger;
		node = node.children[node.children.length - 1]
		depth++;
	}

	return node;
}

Tree.prototype.atDepthLeft = function (d) {
	var depth = this.getCurrentDepth();
	var node = this.node;
	while (depth > d) {
		if (node.parent == null)
			debugger;
		node = node.parent;
		depth--;
	}

	while (depth < d) {
		if (! node.children.length > 0)
			debugger;
		node = node.children[0]
		depth++;
	}

	return node;
}

Tree.prototype.flatten = function () {
	var lastNode = new TreeNode();
	var tn = this.root;
	lastNode.data = tn.data;

	var tree = new Tree();
	tree.root = lastNode;
	tree.node = lastNode;

	function flattenHelper(node) {
		var i;
		var n = new TreeNode();
		for (i = 0; i < node.children.length; ++i) {
			var copyNode = new TreeNode();
			var child = node.children[i];
			copyNode.data = child.data;
			lastNode.adopt(copyNode);
			lastNode = copyNode;
			flattenHelper(child);
		}
	}
	flattenHelper(this.root);

	return tree;
}

/*.prototype.moveToDepth = function (depth) {
	var d = 0;
	var node = this.node;
	while (node != this.root) {
		++d;
		node = node.parent;
	}

	while (d < depth) {
		this.moveDown();
		++d;
	}
	while (d > depth) {
		this.moveUp();
		--d;
	}
}*/