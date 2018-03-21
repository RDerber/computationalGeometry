
function Graph(attrs, parent, id) {
	var graph = this;
	this.points = [];
	this.edges = [];
	this.attrs = { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false }
	Object.assign(this.attrs, attrs);
	this.domEl = document.createElement('div');
	if (!id)
		id = "jxgbox";
	this.domEl.id = id;
	this.domEl.classList.add("jxgbox");
	this.domEl.style = "width:400px; height:400px;";
	if (parent)
		parent.appendChild(this.domEl);
	else
		document.body.appendChild(this.domEl);
	this.board = JXG.JSXGraph.initBoard(id, this.attrs);

	var graphListeners = [];

	graphListeners["pointGraph"] = function (event) {
		{
			var coords = graph.getMouseCoords(event);

			var point = graph.createPoint(coords);

		}
	}

	graphListeners["edgeGraph"] = function (event) {
		{
			var coords = graph.getMouseCoords(event);

			var newPoint = graph.createPoint(coords);
			if (newPoint == null) return;
			if (graph.points.length % 2) return;
			else {
				graph.createEdge(graph.points[graph.points.length - 2], newPoint);
			}
		}
	}

	if (this.attrs.interactionType != null) this.board.on('down', graphListeners[attrs.interactionType]);

	this.getMouseCoords = function (event) {
		var cPos = graph.board.getCoordsTopLeftCorner(event),
			absPos = JXG.getPosition(event),
			dx = absPos[0] - cPos[0],
			dy = absPos[1] - cPos[1];
		var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], graph.board);
		return [coords.usrCoords[1], coords.usrCoords[2]];
	}

}


Graph.prototype.createEdge = function(p1, p2, attrs){
	if (p1 == null || p2 == null) debugger;
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

Graph.prototype.addEdge = function (newEdge) {
	newEdge.jxgEdge = this.board.create('line', [newEdge.p1.jxgPoint, newEdge.p2.jxgPoint], newEdge.attrs);
	this.edges.push(newEdge);
}

Graph.prototype.createPoint = function (coords, attrs, overrideOverlap) {
	if ( !overrideOverlap && this.pointOverlap(coords)) return null;
	var newPoint = new Point(coords);
	this.addPoint(newPoint, 1);
	return newPoint;
}

Graph.prototype.addPoint = function (point, overrideOverlap) {

	if (!overrideOverlap && this.pointOverlap(point.coords)) return null;

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

Graph.prototype.freeze = function(){
	this.attrs["registerEvents"] = false;
	if (this.board) {
		this.board.removeEventHandlers();
	}
}

Graph.prototype.pointOverlap = function (coords) {
	var jxgCoords = new JXG.Coords(JXG.COORDS_BY_USER, [1,coords[0],coords[1]], this.board);
	for (el in this.board.objects) {
		if (this.board.objects[el].hasPoint(jxgCoords.scrCoords[1], jxgCoords.scrCoords[2]))
			return true;
	}
	return false;
}

Graph.prototype.reset = function (data) {
	this.points = [];
	this.edges = [];
	JXG.JSXGraph.freeBoard(this.board);
	this.board = JXG.JSXGraph.initBoard('jxgbox', this.attrs)
}
Graph.prototype.loadData = function (data) {
	this.reset();
	this.addObjects(data);
}

Graph.prototype.addObjects = function (objects) {
	var i;
	if (objects.points) {
		for (i = 0; i < objects.points.length; i++) {
			this.addPoint(objects.points[i]);
		}
	}

	if (objects.edges) {
		for (i = 0; i < objects.edges.length; i++) {
			this.addEdge(objects.edges[i]);
		}
	}
	
}

Graph.prototype.cloneData = function () {
	var i, data = {};
	data.points = [];
	for (i = 0; i < this.points.length; i++) {
		data.points.push(this.points[i].clone());
	}

	data.edges = [];
	for (i = 0; i < this.edges.length; i++) {
		var p1Clone = data.points[Array.indexof(this.edges[i].getLeftPoint())];
		var p2Clone = data.points[Array.indexof(this.edges[i].getRightPoint())];
		data.edges.push(this.edges[i].clone(p1Clone, p2Clone));
	}
	return data;

}

Graph.prototype.addRandomPoints = function (numPoints) {
	var i;
	var bb = this.board.attr.boundingbox;
	var dx = [bb[0], bb[2]];
	var dy = [bb[1], bb[3]];
	for (i = 0; i < numPoints; ++i) {
		var x = Math.random() * (dx[1] - dx[0]) + dx[0];
		var y = Math.random() * (dy[1] - dy[0]) + dy[0];
		this.createPoint([x, y]);
	}
}

Graph.prototype.setAttribute = function(newAttrs){
	this.attrs.assign(this.attrs, newAttrs);
	if (this.board)
		this.board.setAttribute(this.attrs);
}