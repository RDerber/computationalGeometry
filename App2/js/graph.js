
function Graph(attrs, parent) {
	var graph = this;
	this.points = [];
	this.edges = [];
	this.domEl = document.createElement('div');
	this.domEl.id = "jxgbox";
	this.domEl.classList.add("jxgbox");
	this.domEl.style = "width:400px; height:400px;";
	if (parent)
		parent.appendChild(this.domEl);
	else
		document.body.appendChild(this.domEl);
	this.board = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false });

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


Graph.prototype.createEdge = function(p1, p2, attrs){
	if (p1 == null || p2 == null) return;
	var newEdge = new Edge(p1, p2, attrs);

	newEdge.jxgEdge = this.board.create('line', [p1.jxgPoint, p2.jxgPoint], newEdge.attrs);

	this.edges.push(newEdge);
}

Graph.prototype.removeEdge = function (edge) {
	var index = this.edges.indexOf(edge);
	if (index == -1) return;
	this.board.removeObject(edge.jxgEdge);
	this.edges.splice(index, 1);
}

Graph.prototype.addEdge = function (edge) {
	newEdge.jxgEdge = this.board.create('line', [p1.jxgPoint, p2.jxgPoint], newEdge.attrs);
	this.edges.push(newEdge);
}

Graph.prototype.createPoint = function (coords, attrs, overrideOverlap) {
	if ( !overrideOverlap && this.pointOverlap(coords)) return null;
	var newPoint = new Point(coords);
	this.addPoint(newPoint);
	return newPoint;
}

Graph.prototype.addPoint = function (point) {

	if (this.pointOverlap(point.coords)) return null;

	point.jxgPoint = this.board.create('point', point.coords, point.attrs);
	point.jxgPoint.setLabel("");
	this.points.push(point);
}

Graph.prototype.removePoint = function(point){
	var index = graph.points.indexOf(point);
	if (index == -1) return;
	graph.board.removeObject(point.jxgPoint);
	graph.points.splice(index, 1);
}



Graph.prototype.pointOverlap = function (coords) {
	var jxgCoords = new JXG.Coords(JXG.COORDS_BY_USER, [1,coords[0],coords[1]], this.board);
	for (i = 0; i < this.points.length; i++) {
		var point = this.points[i];
		if (point.jxgPoint && point.jxgPoint.hasPoint(jxgCoords.scrCoords[1],jxgCoords.scrCoords[2])) {
			return true;
		}
	}
	return false;
}

Graph.prototype.reset = function (data) {
	this.points = [];
	this.edges = [];
	JXG.JSXGraph.freeboard(this.board);
	this.board = JXG.JSXGraph.initBoard('jxgbox', { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false });
}
Graph.prototype.loadData = function (data) {
	this.reset();
	this.addObjects(data);
}

Graph.prototype.addObjects = function (objects) {
	for (var obj in objects) {
		switch (obj.constructor) {

			case Point:
				addPoint(obj);
				break;

			case Edge:
				addEdge(obj);
				break;
		}
	}
}

