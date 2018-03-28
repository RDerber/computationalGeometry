function DualGraph(attr, parent) {
	var dualgraph = this;
	this.graphs = [];
	this.attr = { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false }
	Object.assign(this.attr, attr);
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
		var color = randomColor({ luminosity: 'dark' });
		var dp = dualgraph.createDualPoint(coords, pointGraph, edgeGraph, { fillColor: color, strokeColor: color });
		if (!dp)
			return;
		var point = dp.point.jxgPoint;
		var edge = dp.line.jxgEdge;
		edge.on('drag', function () {
			point.moveTo([edge.getSlope(), -edge.getRise()]);
		});
		edge.point1.on('drag', function () {
			edge.point1.moveTo([0, edge.point1.coords.usrCoords[2]]);
			point.moveTo([edge.getSlope(), -edge.getRise()]);
		});
		edge.point2.on('drag', function () {
			var slope = (edge.point2.coords.usrCoords[2] - edge.point1.coords.usrCoords[2]) / (edge.point2.coords.usrCoords[1] - edge.point1.coords.usrCoords[1]);
			var rise = edge.point1.coords.usrCoords[2];
			if (slope < -5) {
				if (rise > 0)
					edge.point2.moveTo([1, edge.point1.coords.usrCoords[2] - 5]);
				else
					edge.point2.moveTo([-1, edge.point1.coords.usrCoords[2] + 5]);
			}
			else if (slope > 5) {
				if (edge.point1.coords.usrCoords[2] < 0)
					edge.point2.moveTo([1, edge.point1.coords.usrCoords[2] + 5]);
				else
					edge.point2.moveTo([-1, edge.point1.coords.usrCoords[2] - 5]);
			}

			slope = (edge.point2.coords.usrCoords[2] - edge.point1.coords.usrCoords[2]) / (edge.point2.coords.usrCoords[1] - edge.point1.coords.usrCoords[1]);
			rise = edge.point1.coords.usrCoords[2];
			point.moveTo([slope, -rise]);
		});
		edge.on('mouseover', function () {
			dp.line.p1.setAttribute({ visible: true });
			dp.line.p2.setAttribute({ visible: true }); 
		});
		edge.on('mouseout', function () {
			dp.line.p1.setAttribute({ visible: false });
			dp.line.p2.setAttribute({ visible: false });
		});
		point.on('drag', function () {
			edge.point1.moveTo([0, -point.coords.usrCoords[2]]);
			if (point.coords.usrCoords[1] - point.coords.usrCoords[2] > -5 && point.coords.usrCoords[1] - point.coords.usrCoords[2] < 5) {
				edge.point2.moveTo([1, point.coords.usrCoords[1] - point.coords.usrCoords[2]])
			}
			else
				edge.point2.moveTo([-1, -point.coords.usrCoords[1] - point.coords.usrCoords[2]]);

		});
	}
}


DualGraph.prototype.createDualPoint = function (coords, pointGraph, edgeGraph, attr, overrideOverlap) {
	if (!overrideOverlap && pointGraph.pointOverlap(coords))
		return null;
	var dp = new DualPoint(coords, attr);
	return this.addDualPoint(dp, pointGraph, edgeGraph, true);
}

DualGraph.prototype.addDualPoint = function (dualpoint, pointGraph, edgeGraph, overrideOverlap) {
	if (!overrideOverlap && pointGraph.pointOverlap(dualpoint.point.coords))
		return null;
	pointGraph.addPoint(dualpoint.point, true);
	edgeGraph.addPoint(dualpoint.line.p1, true);
	edgeGraph.addPoint(dualpoint.line.p2, true);
	edgeGraph.addEdge(dualpoint.line);
	return dualpoint;
}

DualGraph.prototype.freeze = function () {

}

DualGraph.prototype.reset = function (data) {
}

DualGraph.prototype.loadData = function (data) {
}

DualGraph.prototype.cloneData = function () {
}