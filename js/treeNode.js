function TreeNode() {
	this.parent;
	this.children = [];
	this.leftSibling;
	this.rightSibling;
	this.data;
}

TreeNode.prototype.adopt = function (child) {
	if (this.children[this.children.length - 1]) {
		child.leftSibling = this.children[this.children.length - 1];
		child.leftSibling.rightSibling = child; 
	}
	this.children.push(child);
	child.parent = this;
}

TreeNode.prototype.insertChild = function(child, index){
	if (index > children.length - 1 || children < 1) {
		debugger;
		return;
	}
	if (index == children.length)
		this.adopt(child);

	this.children.splice(index, 0, child);
	child.leftSibling = children[index - 1];
	child.rightSibling = children[index + 1];
}

TreeNode.prototype.getData = function(){
	if (this.data != null) return this.data;
	else if (this.children.length > 0) return this.children[this.children.length - 1].getData();
	debugger;
	return;
}