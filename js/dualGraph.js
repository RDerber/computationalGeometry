function DualGraph(attrs, parent) {
	var dualgraph = this;
	this.graphs = [];
	this.attrs = { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false }
	Object.assign(this.attrs, attrs);
	this.domEl = document.createElement('div');
	this.domEl.style = "width:800px; height:400px; display:inline;";
	if (parent)
		parent.appendChild(this.domEl);
	else
		document.body.appendChild(this.domEl);
	var leftDiv = document.createElement('div');
	leftDiv.style = "display:inline-block";
	var rightDiv = document.createElement('div');
	rightDiv.style = "display:inline-block";
	this.domEl.appendChild(leftDiv);
	this.domEl.appendChild(rightDiv);
	this.graphs.push(new Graph({}, leftDiv, "graph1"));
	this.graphs.push(new Graph({}, rightDiv, "graph2"));

	this.graphs[0].board.on('down', function (event) {
		var coords = dualgraph.graphs[0].getMouseCoords(event);
		createPointEvent(coords, dualgraph.graphs[0], dualgraph.graphs[1]);
	});
	this.graphs[1].board.on('down', function (event) {
		var coords = dualgraph.graphs[1].getMouseCoords(event);
		createPointEvent(coords, dualgraph.graphs[1], dualgraph.graphs[0]);
	});

	function createPointEvent(coords, pointGraph, edgeGraph) {
		var point = pointGraph.createPoint(coords, {});
		if (point)
			point = point.jxgPoint;
		else
			return;
		var edge = edgeGraph.board.create('line', [[0, -coords[1]], [1, coords[0] - coords[1]]]);
		point.on('drag', function () {
			edge.point1.moveTo([0, -point.coords.usrCoords[2]]);
			edge.point2.moveTo([1, point.coords.usrCoords[1] - point.coords.usrCoords[2]]);
		});
		edge.on('drag', function () {
			point.moveTo([edge.getSlope(), -edge.getRise()]);
		});
	}
}


DualGraph.prototype.createDualPoint = function (coords, attrs, overrideOverlap) {
}

DualGraph.prototype.freeze = function () {

}

DualGraph.prototype.reset = function (data) {
}

DualGraph.prototype.loadData = function (data) {
}

DualGraph.prototype.cloneData = function () {
}