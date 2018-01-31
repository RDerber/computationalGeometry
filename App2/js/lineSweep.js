var graph;
var p1 = null;

var eventType= {
	leftPoint: 1,
	rightPoint: 2,
	intersection: 3,
};

function Event(point, type) {

}

function displayLineSweep () {
	var button, p2;
	graph = new Graph();
	button = document.createElement('div');
	button.id = "computeLineSweepButton";
	button.classList.add("button-computeLineSweep");
	button.addEventListener('click', computeLineSweep);
	document.body.appendChild(button);
	graph.board.on('down', function (event) {
		if (p1 == null) {
			p1 = addPoint(event, graph);
		}
		else {
			p2 = addPoint(event, graph);
			graph.points.push(p1);
			graph.points.push(p2);
			graph.edges.push(new Edge(p1, p2, graph.board));
			p1 = null;
		}
	});
}

function computeLineSweep (event) {
	var eventQueue, edgeQueue, sweepStatus, i;

	for (i = 0; i < graph.points.length; i++) {

	}
}