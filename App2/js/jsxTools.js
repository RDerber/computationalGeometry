
//return jxg coords for board event
function getMouseCoords (event, board) {
	var cPos = board.getCoordsTopLeftCorner(event),
		absPos = JXG.getPosition(event),
		dx = absPos[0] - cPos[0],
		dy = absPos[1] - cPos[1];
	return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}

//create point object which displays on board and return it
function addPoint (event, graph) {
	var coords, pointRadius, numPoints, i, canCreate = true;
	var pointRadius = .5;

	coords = getMouseCoords(event, graph.board);

	var numPoints = graph.points.length;
	for (i = 0; i < numPoints; i++) {
		if (graph.points[i].jxgPoint.hasPoint(coords.scrCoords[1],
			coords.scrCoords[2])) {
			canCreate = false;
			break;
		}
	}

	if (canCreate) {
		var newPoint = new Point(coords, graph.board);
		return newPoint;
	}
	return null;
}