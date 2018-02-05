
var graph;
var p1 = null;
var eventQueue;
var sweepStatus;

var eventType = {
	leftPoint: 1,
	rightPoint: 2,
	intersection: 3,
};

function Event(edge, point, type) {
	this.type = type;
	this.edge = edge;
	this.point = point;
}

var displayLineSweep = function () {
	var button, p2;
	var attrs = { interactionType: "edgeGraph" };
	graph = new Graph(attrs);
	button = document.createElement('div');
	button.id = "computeLineSweepButton";
	button.classList.add("button-computeLineSweep");
	button.addEventListener('click', computeLineSweep);
	document.body.appendChild(button);
};

function computeLineSweep(event) {
	var i;

	eventQueue = [];
	for (i = 0; i < graph.edges.length; i++) {
		eventQueue.push(new Event(graph.edges[i], graph.edges[i].getLeftPoint(), eventType.leftPoint));
		eventQueue.push(new Event(graph.edges[i], graph.edges[i].getRightPoint(), eventType.rightPoint));
	}

	eventQueue.sort(compareEventX);

	for (i = 0; i < eventQueue.length; i++) {
		performEvent(eventQueue[i]);
	}
}

function performEvent(event) {
	switch (event.type) {
		case eventType.leftPoint:
			(event);
			break;

		case eventType.rightPoint:
			removeEvent(event);
			break;

		case eventType.intersection:
			(event);
	}
}

function removeEvent(event) { }



function leftEvent(event) {
	var intersectCoords;
	var index = toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX);
	if (graph.edges[index - 1] && (intersectCoords = Edge.findIntersection(graph.edges[index - 1], event.edge))) {
		graph.create
	}
}



function insertEvent(event) {
	var index = toolbox.binarySearch(event, eventQueue, 0, eventQueue.length, compareEventX);
	eventQueue.splice(index, 0, event);
}

function compareEventX(event1, event2) {
	return compareX(event1.point, event2.point);
}