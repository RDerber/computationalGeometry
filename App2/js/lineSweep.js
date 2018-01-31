
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
	};

	function computeLineSweep(event) {
		var i;

		eventQueue = [];
		for (i = 0; i < graph.edges.length; i++) {
			eventQueue.push(new Event(graph.edge[i], graph.edge[i].getLeftPoint(), eventType.leftPoint));
			eventQueue.push(new Event(graph.edge[i], graph.edge[i].getRightPoint(), eventType.rightPoint));
		}

		eventQueue.sort(compareEventX);

		for (i = 0; i < eventQueue.length; i++) {

		}
	}

	function performEvent(event) {
		switch (event.eventType) {
			case eventType.leftPoint:
				insertEvent(event);
				break;

			case eventType.rightPoint:
				removeEvent(event);
				break;

			case eventType.intersection:
				addIntersection(event);
		}
	}

	function insertEvent() { }

	function searchEventQueue(event) {
		var mid;
		mid = Math.floor(eventQueue.length / 2);
	}

	function compareEventX(event1, event2) {
		return compareX(event1.point, event2.point);
	}