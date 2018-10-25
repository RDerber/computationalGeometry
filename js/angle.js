//creates an edge between 2 points
function Angle(p1, p2, p3, attr) {
	var angle = this;
	if (!p1 || !p2)
		debugger;
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3
	this.attr = {
		strokeColor: "gray",
		fillColor: "gray",
		radius: 1
	};

	Object.assign(this.attr, attr);

	this.jxgAngle;

	this.setAttribute = function (attr) {
		Object.assign(this.attr, attr);
		if (this.jxgAngle) {
			this.jxgAngle.setAttribute(this.attr);
		}
	}
}
//make a copy of this edge for 2 new points, probably copies of this edge's points
Angle.prototype.clone = function (p1, p2, p3) {
	var attr = {};
	if (p1 == null || p2 == null) debugger;
	Object.assign(attr, this.attr);
	return new Angle(p1, p2, attr);
}