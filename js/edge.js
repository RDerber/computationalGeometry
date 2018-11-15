//creates an edge between 2 points
function Edge(p1, p2, attr) {
	var edge = this;
	if (!p1 || !p2)
		debugger;
	this.p1 = p1;
	this.p2 = p2;
	this.attr = {
		strokeColor: "black",
		straightFirst: false,
		straightLast: false,
		strokeWidth: 2
	};

	this.id = objectId++;

	Object.assign(this.attr, attr);

	this.jxgEdge;

	this.getLeftPoint = function (){
		if (Point.compareX(edge.p1, edge.p2) > 0) return p2;
		else return p1;
	}

	this.getRightPoint = function () {
		if (Point.compareX(edge.p1, edge.p2) > 0) return p1;
		else return p2;
	}

	this.setAttribute = function(attr){
		Object.assign(this.attr, attr);
		if (this.jxgEdge) {
			this.jxgEdge.setAttribute(this.attr);
		}
	}

};
//make a copy of this edge for 2 new points, probably copies of this edge's points
Edge.prototype.clone = function (p1, p2) {
	var attr = {};
	if (p1 == null || p2 == null) debugger;
	Object.assign(attr, this.attr);
	return new Edge(p1, p2, attr);
};

//returns the y coordinate corresponding ot the input x value of the line defined by the edge's points
Edge.prototype.evaluateLine = function (x) {
	var p = (x - this.p1.coords[0]) / (this.p2.coords[0] - this.p1.coords[0]);
	var y = p * (this.p2.coords[1]) + (1 - p) * (this.p1.coords[1]);
	return y;
};

//returns a function that compares two edges' lines' y values at a given x value, used for sorting
Edge.compareYAtX = function (x) {
	if (x == null) throw exception;
	return function (e1, e2) {
		var ret = e1.evaluateLine(x) - e2.evaluateLine(x);
		return ret;
	};
};

//determines whether a point is above or below the line defined by the edge's points
Edge.prototype.pointAbove = function (p) {
	return p.coords[1] - this.evaluateLine(p.coords[0]);
};

//returns the point that is the intersection of the two lines corresponding to the edges
Edge.edgeIntersection = function (e1, e2) {
	var coords = Edge.intersection(e1, e2);
	var x11, x12, x21, x22, y11, y12, y21, y22;
	x11 = e1.p1.coords[0];
	x12 = e1.p2.coords[0];
	x21 = e2.p1.coords[0];
	x22 = e2.p2.coords[0];
	y11 = e1.p1.coords[1];
	y12 = e1.p2.coords[1];
	y21 = e2.p1.coords[1];
	y22 = e2.p2.coords[1];

	if (Math.min(x11, x12) < coords[0] && coords[0] < Math.max(x11, x12) &&
		Math.min(x21, x22) < coords[0] && coords[0] < Math.max(x21, x22)) {
		return coords;
	}
	return null;

};

Edge.intersection = function (e1, e2) {
	var A1, B1, C1, A2, B2, C2, det, x11, x12, x21, x22, y11, y12, y21, y22, x, y;

	x11 = e1.p1.coords[0];
	x12 = e1.p2.coords[0];
	x21 = e2.p1.coords[0];
	x22 = e2.p2.coords[0];
	y11 = e1.p1.coords[1];
	y12 = e1.p2.coords[1];
	y21 = e2.p1.coords[1];
	y22 = e2.p2.coords[1];

	A1 = y12 - y11;
	B1 = x11 - x12;
	C1 = A1 * x11 + B1 * y11;

	A2 = y22 - y21;
	B2 = x21 - x22;
	C2 = A2 * x21 + B2 * y21;

	det = A1 * B2 - A2 * B1;

	if (det == 0) return null;

	x = (B2 * C1 - B1 * C2) / det;
	y = (A1 * C2 - A2 * C1) / det;
	return [x, y];
};

Edge.lineEdgeIntersect = function (line, edge) {
	var coords = Edge.intersection(line, edge);
	if (coords[0] < Math.max(edge.p1.coords[0], edge.p2.coords[0]) && coords[0] > Math.min(edge.p1.coords[0], edge.p2.coords[0]))
		return coords;
	else
		return null;
};

Edge.prototype.getLength = function () {
	return Math.sqrt(Math.pow((this.p2.y - this.p1.y), 2) + Math.pow((this.p2.x - this.p1.x), 2));
};

Edge.prototype.perpendicularDist = function (p) {
	return Math.abs((this.p2.y - this.p1.y) * p.x - (this.p2.x - this.p1.x) * p.y + this.p2.x * this.p1.y - this.p2.y * this.p1.x) / this.getLength();
};

Edge.sameEdges = function (e1, e2) {
	return Point.samePoint(e1.p1, e2.p1) && Point.samePoint(e1.p2, e2.p2);
};

Edge.findSameAs = function (e1) {
	return function (e2) {
		return Edge.sameEdges(e1, e2);
	}
};