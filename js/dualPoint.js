function DualPoint(coords, attr) {
	this.className = "DualPoint";
	this.attr = {};
	Object.assign(this.attr, attr);
	this.point = new Point(coords, attr);
	var p1 = new Point([0, -this.point.coords[1]], Object.assign({ visible: false }, this.attr));
	var coords = [1, this.point.coords[0] - this.point.coords[1]];
	if (coords[1] > 5 || coords[1] < -5)
		coords = [-1, this.point.coords[0] + this.point.coords[1]];
	var p2 = new Point(coords, Object.assign({ visible: false }, this.attr));
	this.line = new Edge(p1, p2, Object.assign({ straightFirst: true, straightLast:true }, this.attr));
}

DualPoint.prototype.setAttribute = function(attr){
	Object.assign(this.attr, attr);
	this.point.setAttribute(this.attr);
	this.edge.setAttribute(this.attr);
}