
var graph;
var p1 = null;
var eventQueue = [];
var sweepStatus = [];

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

	while (eventQueue.length) {
		performEvent(eventQueue.shift());
	}
}

function performEvent(event) {
	switch (event.type) {
		case eventType.leftPoint:
			leftEvent(event);
			break;

		case eventType.rightPoint:
			rightEvent(event);
			break;

		case eventType.intersection:
			intersectEvent(event);
	}
}

function intersectEvent(event) {
	var index = toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX(event.point.coords[0]));
	if (event.edge != sweepStatus[index]) index = index - 2;
	var temp = sweepStatus[index];
	sweepStatus[index] = sweepStatus[index + 1]
	sweepStatus[index + 1] = temp;

	if (sweepStatus[index - 1] && (intersectCoords = Edge.findIntersection(sweepStatus[index], sweepStatus[index - 1]))) {
		if (intersectCoords[0] > event.point.coords[0]) {
			var point = graph.createPoint(intersectCoords, 1);
			insertEvent(new Event(sweepStatus[index - 1], point, eventType.intersection));
		}
	}
	if (sweepStatus[index + 2] && (intersectCoords = Edge.findIntersection(sweepStatus[index + 1], sweepStatus[index + 2]))) {
		if (intersectCoords[0] > event.point.coords[0]) {
			var point = graph.createPoint(intersectCoords, 1);
			insertEvent(new Event(sweepStatus[index + 1], point, eventType.intersection));
		}
	}
}

function rightEvent(event) {
	var index = toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX(event.point.coords[0]));
	sweepStatus.splice(index, 1);
}

function leftEvent(event) {
	var intersectCoords;
	var point;
	var index = toolbox.binarySearch(event.edge, sweepStatus, 0, sweepStatus.length, Edge.compareYAtX(event.edge.getLeftPoint().coords[0]));
	sweepStatus.splice(index, 0, event.edge);
	if (sweepStatus[index - 1] && (intersectCoords = Edge.findIntersection(sweepStatus[index - 1], event.edge))) {
		point = graph.createPoint(intersectCoords, 1);
		insertEvent(new Event(sweepStatus[index - 1], point, eventType.intersection));
	}
	if (sweepStatus[index+1] && (intersectCoords = Edge.findIntersection(sweepStatus[index+1], event.edge))) {
		point = graph.createPoint(intersectCoords, 1);
		insertEvent(new Event(event.edge, point, eventType.intersection));
	}
}

function insertEvent(event) {
	var index = toolbox.binarySearch(event, eventQueue, 0, eventQueue.length, compareEventX);
	if (eventQueue[index].point == event.point.coords[0]) return;
	eventQueue.splice(index, 0, event);
}

function compareEventX(event1, event2) {
	return Point.compareX(event1.point, event2.point);
}