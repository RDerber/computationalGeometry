var graph;

function displayConvexHull(event) {
	var attrs = { interactionType: "pointGraph" };
	graph = new Graph(attrs);
	button = document.createElement('div');
	button.id = "computeHullButton";
	button.classList.add("button");
	button.addEventListener('click', convexHull);
	document.body.appendChild(button);
}

function convexHull(event) {
	var hull, i;
	hull = getHullPoints(graph.points);

	for (i = 1; i < hull.length; i++) {
		graph.createEdge(hull[i - 1], hull[i]);
	}
	graph.createEdge(hull[hull.length - 1], hull[0]);
}

function getHullPoints(points) {
	var i, leftPoint, rightPoint, lowerHull, upperHull, hull;
	points.sort(Point.compareX);

	lowerHull = [points[0], points[1]];
	for (i = 2; i < points.length; i++) {
		while (lowerHull.length > 1 && Point.orient(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], points[i]) < 0) {
			lowerHull.pop();
		}
		lowerHull.push(points[i]);
	}

	upperHull = [points[points.length - 1], points[points.length-2]];
	for (i = points.length - 3; i > -1; i--) {
		while (upperHull.length > 1 && Point.orient(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], points[i]) < 0) {
			upperHull.pop();
		}
		upperHull.push(points[i]);
	}
	upperHull.pop();
	upperHull.shift();

	hull = lowerHull.concat(upperHull);

	return hull;
}