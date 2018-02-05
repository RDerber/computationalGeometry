var pointId = 0;

var PointDisplayEnum = Object.freeze({"default":".point-default"})

function Point(coords) {
	this.coords = coords;
	this.jxgPoint;
	this.class = PointDisplayEnum.default;
}

Point.compareX = function(p1, p2) {
	return p1.coords[0] - p2.coords[0];
}

Point.compareY = function(p1, p2) {
	return p1.coords[1] - p2.coords[1];
}

Point.orient = function(a, b, c) {
	return (b.coords[0] - a.coords[0]) * (c.coords[1] - a.coords[1]) -
		(c.coords[0] - a.coords[0]) * (b.coords[1] - a.coords[1]);
}