
function Graph(attr, parent, id) {
	var graph = this;
	this.points = [];
	this.edges = [];
	this.faces = [];
	this.attr = {
        boundingbox: [-5, 5, 5, -5],
        keepAspectRatio: false,
		axis: false,
		grid: false,
		showNavigation: false,
		showCopyright: false,
		showZoom: true,
		showNavigation: true,
		zoom: {
			factorX: 1.25,
			factorY: 1.25,
			wheel: true,
			needshift: false,
			pinchHorizontal: true,
			pinchVertical: true
		},
		pan: {
			enabled: true,
			needshift: false
		}
	};
	Object.assign(this.attr, attr);
	this.domEl = document.createElement('div');
	if (!id)
		id = "jxgbox";
	this.domEl.id = id;
	this.domEl.classList.add("jxgbox");
	this.domEl.style.flex = 1;
	this.domEl.style.height = "100%";
	this.domEl.style.width = "100%";
	this.domEl.style.display = "flex";
	if (parent)
		parent.appendChild(this.domEl);
    else
		document.body.appendChild(this.domEl);
	this.board = JXG.JSXGraph.initBoard(id, this.attr);

    var svg = this.board.containerObj.children[0];
    svg.style.flex = 1;
    svg.style.width = "100%";
    svg.setAttribute("width", "100%");
    svg.style.height = "100%";
    svg.setAttribute("height", "100%");

    window.onresize = function(event) {
        graph.board.resizeContainer(graph.domEl.parentNode.offsetWidth, graph.domEl.offsetHeight - 2, false, false);
        svg.style.width = "100%";
        svg.setAttribute("width", "100%");
        svg.style.height = "100%";
        svg.setAttribute("height", "100%");
    }

	var moveFlag = 0;
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

	graphListeners["lineGraph"] = function (event) {
		{
			var coords = graph.getMouseCoords(event);

			var newPoint = graph.createPoint(coords);
			if (newPoint == null) return;
			if (graph.points.length % 2) return;
			else {
				graph.createEdge(graph.points[graph.points.length - 2], newPoint, { straightFirst: true, straightLast: true });
			}
		}
	}
	checkClick = function(func)
	{
		if (!moveFlag) {
			func();
		}
	}
	this.board.on('move', () => { moveFlag = 1 });
	this.board.on('down', () => { moveFlag = 0 } );
	if (this.attr.interactionType != null) this.board.on('up', ()=>checkClick(graphListeners[attr.interactionType]));

	this.getMouseCoords = function (event) {
		var cPos = graph.board.getCoordsTopLeftCorner(event),
			absPos = JXG.getPosition(event),
			dx = absPos[0] - cPos[0],
			dy = absPos[1] - cPos[1];
		var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], graph.board);
		return [coords.usrCoords[1], coords.usrCoords[2]];
	}

}


Graph.prototype.createEdge = function(p1, p2, attr){
	if (p1 == null || p2 == null) debugger;
	var newEdge = new Edge(p1, p2, attr);

	newEdge.jxgEdge = this.board.create('line', [p1.jxgPoint, p2.jxgPoint], newEdge.attr);

	this.edges.push(newEdge);
}

Graph.prototype.removeEdge = function (edge) {
	var index = this.edges.indexOf(edge);
	if (index == -1) return;
	this.board.removeObject(edge.jxgEdge);
	this.edges.splice(index, 1);
}

Graph.prototype.addEdge = function (newEdge) {
	newEdge.jxgEdge = this.board.create('line', [newEdge.p1.jxgPoint, newEdge.p2.jxgPoint], newEdge.attr);
	this.edges.push(newEdge);
}

Graph.prototype.createPoint = function (coords, attr, overrideOverlap) {
	if ( !overrideOverlap && this.pointOverlap(coords)) return null;
	var newPoint = new Point(coords);
	this.addPoint(newPoint, 1);
	return newPoint;
}

Graph.prototype.addPoint = function (point, overrideOverlap) {

	if (!overrideOverlap && this.pointOverlap(point.coords)) return null;

	point.jxgPoint = this.board.create('point', point.coords, point.attr);
	point.jxgPoint.setLabel("");
	this.points.push(point);
}

Graph.prototype.addFace = function (face) {
	var coords = [];
	var halfEdge = face.boundary;
	coords.push(halfEdge.target.coords);
	this.addHalfEdge(halfEdge);
	halfEdge = halfEdge.next;
	while (halfEdge != face.boundary) {
		coords.push(halfEdge.target.coords);
		this.addHalfEdge(halfEdge);
		halfEdge = halfEdge.next;
	}

	face.polygon = this.board.create('polygon', coords, face.attr);
	this.faces.push(face);
	return face;
}

Graph.prototype.addHalfEdge = function (halfEdge) {
	if (halfEdge.target.jxgPoint == null)
		this.addPoint(halfEdge.target, true);
	if (halfEdge.prev.target.jxgPoint == null)
		this.addPoint(halfEdge.prev.target, true);
	if (halfEdge.edge.jxgEdge == null)
		this.addEdge(halfEdge.edge);

	return halfEdge;
}

Graph.prototype.removePoint = function(point){
	var index = graph.points.indexOf(point);
	if (index == -1) return;
	graph.board.removeObject(point.jxgPoint);
	graph.points.splice(index, 1);
}

Graph.prototype.freeze = function(){
	this.attr["registerEvents"] = false;
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
    for (var i = 0; i < this.points.length; ++i) {
        this.board.removeObject(this.points[i].jxgPoint);
		this.points[i].jxgPoint = null;
	}
	this.points = [];

    for (var i = 0; i < this.edges.length; ++i) {
        this.board.removeObject(this.edges[i].jxgEdge);
		this.edges[i].jxgEdge = null;
	}
	this.edges = [];

    for (var i = 0; i < this.faces.length; ++i) {
        this.board.removeObject(this.faces[i].jxgEdge);
		this.faces[i].polygon = null;
	}
	this.faces = [];
	this.attr.boundingbox = this.board.getBoundingBox();
//	JXG.JSXGraph.freeBoard(this.board);
//	this.board = JXG.JSXGraph.initBoard(this.domEl.id, this.attr)
}
Graph.prototype.loadData = function (data) {
	this.reset();
	this.addObjects(data);
}

Graph.prototype.addObjects = function (objects) {
	var i;
	if (objects.points) {
		for (i = 0; i < objects.points.length; i++) {
			this.addPoint(objects.points[i], true);
		}
	}

	if (objects.edges) {
		for (i = 0; i < objects.edges.length; i++) {
			this.addEdge(objects.edges[i]);
		}
	}

	if (objects.faces) {
		for (i = 0; i < objects.faces.length; ++i) {
			this.addFace(objects.faces[i]);
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
		var p1Clone = data.points[this.points.indexOf(this.edges[i].getLeftPoint())];
		var p2Clone = data.points[this.points.indexOf(this.edges[i].getRightPoint())];
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
		this.createPoint([x, y], {}, true);
	}
}

Graph.prototype.setAttribute = function(newAttrs){
	this.attr.assign(this.attr, newAttrs);
	if (this.board)
		this.board.setAttribute(this.attr);
}