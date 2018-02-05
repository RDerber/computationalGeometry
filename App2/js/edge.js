
//creates an edge between 2 points
function Edge(p1, p2, board) {
	var edge = this;
	this.p1 = p1;
	this.p2 = p2;
	this.jxgEdge;

	this.getLeftPoint = function (){
		if (compareX(edge.p1, edge.p2)) return p1;
		else return p2;
	}

	this.getRightPoint = function () {
		if (compareX(edge.p1, edge.p2)) return p2;
		else return p1;
	}

}

Edge.prototype.evaluateLine = function(x) {
	var m, b;
	m = (this.p1.coords.usrCoords[1] - this.p2.coords.usrCoords[1]) / (this.p1.coords.usrCoords[2] - this.p2.coords.usrCoords[2]);
	b = this.p1.coords.usrCoords[2] - m * this.p1.coords.usrCoords[1];

	return m * x + b;
}

Edge.compareYAtX = function (e1, e2, x) {
	return e1.evaluateLine(x) - e2.evaluateLine(x);
}

//returns 
Edge.findIntersection = function (e1, e2) {
	var A1, B1, C1, A2, B2, C2, det, x11, x12, x21, x22, y11, y12, y21, y22, x, y;

	x11 = e1.p1.coords.usrCoords[1] * e1.p1.coords.usrCoords[0];
	x12 = e1.p2.coords.usrCoords[1] * e1.p2.coords.usrCoords[0];
	x21 = e2.p1.coords.usrCoords[1] * e2.p1.coords.usrCoords[0];
	x22 = e2.p2.coords.usrCoords[1] * e2.p2.coords.usrCoords[0];
	y11 = e1.p1.coords.usrCoords[2] * e1.p1.coords.usrCoords[0];
	y12 = e1.p2.coords.usrCoords[2] * e1.p2.coords.usrCoords[0];
	y21 = e2.p1.coords.usrCoords[2] * e2.p1.coords.usrCoords[0];
	y22 = e2.p2.coords.usrCoords[2] * e2.p2.coords.usrCoords[0];

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

	if (min(x11, x12) < x && x < max(x11, x12) &&
		min(x21, x12) < x && x < max(x21, x22)) {
		return [x, y];
	}
	return null;

}