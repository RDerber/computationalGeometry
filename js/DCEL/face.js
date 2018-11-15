function Face(boundary, attr) {
	this.polygon;
	this.className = "Face";
	this.id = objectId++;
	this.boundary = boundary;
	this.attr = {
		vertices: { visible: false },
		borders: { visible: false }
	};
	Object.assign(this.attr, attr);
	var prevHE = null;
	var halfEdge;
	//assumes HalfEdges are already linked and have points
	if (boundary.constructor.name == 'HalfEdge') {
		this.boundary = boundary;
		boundary.face = this;
		boundary = boundary.next;
		while (boundary != this.boundary) {
			boundary.face = this;
			boundary = boundary.next;
		}
	}

	//makes new HalfEdges, and or edges, and or points
	if (boundary.constructor.name == 'Array') {
		if (boundary[0].constructor.name == 'Point') {
			var point = new Point(boundary[0]);
			this.boundary = new HalfEdge(this, point, null);
			prevHE = this.boundary;
			for (var i = 1; i < boundary.length; ++i) {
				point = new Point(boundary[i]);
				halfEdge = new HalfEdge(this, point, new Edge(prevHE.target, point, { straightFirst: false, straightLast: false }));
				prevHE.next = halfEdge;
				halfEdge.prev = prevHE;
				prevHE = halfEdge;
			}
			halfEdge.next = this.boundary;
			this.boundary.prev = halfEdge;
			this.boundary.edge = new Edge(halfEdge.target, this.boundary.target);
		}

		if (boundary[0].constructor.name == 'Array') {
			this.boundary = new HalfEdge(this, new Point(boundary[0]));
			var prevHE = this.boundary;
			for (var i = 1; i < boundary.length; ++i) {
				var point = new Point(boundary[i]);
				halfEdge = new HalfEdge(this, point, new Edge(point, prevHE.target, {straightFirst: false, straighLast: false}));
				prevHE.next = halfEdge;
				halfEdge.prev = prevHE;
				prevHE = halfEdge;
			}
			halfEdge.next = this.boundary;
			this.boundary.prev = halfEdge;
			this.boundary.edge = new Edge(this.boundary.prev.target, this.boundary.target);
		}
	}

	this.setAttribute = function (attr) {
		Object.assign(this.attr, attr);
		if (this.polygon) {
			this.polygon.setAttribute(this.attr);
		}
	}
}

Face.prototype.clone = function () {
	var attr = {};
	Object.assign(attr, this.attr);
	var newPoints = [];
	var points = this.getPoints();
	for (var i = 0; i < points.length; ++i) {
		var point = points[i];
		newPoints.push(point.clone());
	}
	return new Face(newPoints);
}

Face.prototype.getPoints = function () {
	var points = [this.boundary.target];
	var halfEdge = this.boundary.next;
	while (halfEdge != this.boundary) {
		points.push(halfEdge.target);
		halfEdge = halfEdge.next;
	}
	return points;
}

//split a convex face
//haven't tested
Face.prototype.split = function(line, halfEdge, oppositeHalf){
	var point = new Point(Edge.intersect(line, halfEdge));
	var oppositePoint = new Point(Edge.intersect(line, oppositeHalf));

	var before = halfEdge.prev;
	var after = halfEdge.next;
	var oppositeBefore = oppositeHalf.prev;
	var oppositeAfter = oppositeHalf.next;

	var splitEdge = new Edge(point, oppositePoint);

	var split = new HalfEdge(this, oppositePoint, splitEdge);
	var splitTwin = new HalfEdge(null, point, splitEdge);

	var half1 = new HalfEdge(this, point);
	half1.twin = halfEdge.twin;
	var half2 = halfEdge;
	var opposite1 = oppositeHalf;
	var opposite2 = new HalfEdge(this, oppositePoint);
	opposite2.twin = oppositeHalf.twin;

	before.next = half1;
	half1.prev = before;
	half1.next = split;
	split.prev = half1;
	split.next = opposite1;
	opposite1.prev = split;
	opposite1.next = oppositeAfter;

	oppositeBefore.next = opposite2;
	opposite2.prev = oppositeBefore;
	opposite2.next = splitTwin;
	splitTwin.prev = opposite2;
	splitTwin.next = half2;
	half2.prev = splitTwin;
	half2.next = after;
	after.prev = half2;

	return new Face(splitTwin);
}

