
function Graph(attrs) {
	var graph = this;
	this.points = [];
	this.edges = [];
	this.domEl = document.createElement('div');
	this.domEl.id = "graphDiv";
	this.domEl.classList.add("jxgbox");
	this.domEl.style = "width:400px; height:400px;";
	document.body.appendChild(this.domEl);
	this.board = JXG.JSXGraph.initBoard('graphDiv', { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false });

	var graphListeners = [];

	graphListeners["pointGraph"] = function (event) {
		{
			var coords = getMouseCoords(event);

			var point = graph.createPoint(coords);

		}
	}

	graphListeners["edgeGraph"] = function (event) {
		{
			var coords = getMouseCoords(event);

			var newPoint = graph.createPoint(coords);
			if (newPoint == null) return;
			if (graph.points.length % 2) return;
			else {
				graph.createEdge(graph.points[graph.points.length - 2], newPoint);
			}
		}
	}

	if (attrs.interactionType != null) this.board.on('down', graphListeners[attrs.interactionType]);

	var getMouseCoords = function (event) {
		var cPos = graph.board.getCoordsTopLeftCorner(event),
			absPos = JXG.getPosition(event),
			dx = absPos[0] - cPos[0],
			dy = absPos[1] - cPos[1];
		var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], graph.board);
		return [coords.usrCoords[1], coords.usrCoords[2]];
	}

	//

	//private event listeners


}


Graph.prototype.createEdge = function(p1, p2){
	if (p1 == null || p2 == null) return;
	var newEdge = new Edge(p1, p2);
	newEdge.jxgEdge = this.board.create('line', [p1.jxgPoint, p2.jxgPoint],
		{ straightFirst: false, straightLast: false, strokeWidth: 1 });
	this.edges.push(newEdge);
}

Graph.prototype.createPoint = function (coords) {
	var canCreate;
	var numPoints = this.points.length;

	if (this.pointOverlap(coords)) return null;

	var newPoint = new Point(coords);
	newPoint.jxgPoint = this.board.create('point', [coords[0], coords[1]]);
	this.points.push(newPoint);
	return newPoint;

}

Graph.prototype.pointOverlap = function (coords) {
	var jxgCoords = new JXG.Coords(JXG.COORDS_BY_USER, [1,coords[0],coords[1]], graph.board);
	for (i = 0; i < this.points.length; i++) {
		var point = this.points[i];
		if (point.jxgPoint.hasPoint(jxgCoords.scrCoords[1],jxgCoords.scrCoords[2])) {
			return true;
		}
	}
	return false;
}