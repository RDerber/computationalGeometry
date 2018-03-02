window.onload = function () {
	var view = new quickHull();
	view.displayConvexHull();
}

function quickHull() {
	var quickHull = this;
	var graph;
	var points;
	var edges = [];
	var tree = new Tree();
	var root;
	var preComputedLowerHull;
	var preComputedUpperHull;
	var lowerHull = [];
	var upperHull = [];
	var curHull, curIndex, orientation, finished;

	this.displayConvexHull = function (event) {
		var $graphRow = $(document.createElement("div"));
		$graphRow.css("white-space", "nowrap");

		$(document.body).append($graphRow);

		var attrs = { interactionType: "pointGraph" };
		var graphDiv = document.createElement('div');
		graphDiv.style = "display: inline-block;";
		$graphRow.append(graphDiv);

		graph = new Graph(attrs, graphDiv);

		var buttonContainer = document.createElement('div');
		buttonContainer.id = "buttonContainer";
		buttonContainer.style = "display: inline-block; vertical-align: top";
		$graphRow.append(buttonContainer);

		var button = document.createElement('div');
		button.id = "computeHullButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Compute Convex Hull"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);
	}

	function transition() {
		if (graph.points.length < 3) return;

		graph.freeze();

		points = graph.cloneData().points;

		computeConvexHull();

		var $buttonContainer = $("#buttonContainer");
		$("#computeHullButton").remove();


		var $hullContainer = $("<div>");

		$upButton = $(document.createElement("div"));
		$upButton.addClass("button");
		$upButton.css("horizontal-align", "center");
		$upButton.on("click", moveUp);

		tree.node = tree.root;
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveUp(event) {
		tree.moveUp();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveDown(event) {
		tree.moveDown();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveRight(event) {
		tree.moveRight();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveLeft(event) {
		tree.moveLeft();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function updateButtons() {
		var $button;
		$button = $("#upButton");
		if (tree.node.parent == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveUp);
		}

		$button = $("#downButton");
		if (tree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveDown);
		}

		$button = $("#rightButton");
		if (tree.node.rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveRight);
		}

		$button = $("#leftButton");
		if (tree.node.leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveLeft);
		}

	}

	function computeConvexHull() {
		var i;
		root = new Node();
		tree.root = root;
		tree.node = root;

		var topPoint = points[0];
		var botPoint = points[0]
		var leftPoint = points[0];
		var rightPoint = points[0];
		for (i = 1; i < points.length; ++i) {
			if (points[i].y > topPoint.y) topPoint = points[i];
			if (points[i].y < botPoint.y) botPoint = points[i];
			if (points[i].x < leftPoint.x) leftPoint = points[i];
			if(points[i].x > rightPoint.x) rightPoint = points[i]
		}
		 if (botPoint != rightPoint)
			edges.push(new Edge(botPoint, rightPoint));
		if (rightPoint != topPoint) 
			edges.push(new Edge(rightPoint, topPoint));
		if (topPoint != leftPoint)
			edges.push(new Edge(topPoint, leftPoint));
		if (leftPoint != botPoint)
			edges.push(new Edge(leftPoint, botPoint));

		tree.root.data = cloneData();

		pointsets = [];
		for (j = 0; j < edges.length; ++j) {
			pointsets.push(getPointsCW(edges[j], points));
		}

		var len = edges.length;
		for (i = 0; i < len; ++i) {
			recurse(edges[len - i - 1], pointsets[i], root, len - i -1);
		}

	}

	function recurse(edge, pointset, parent, index) {
		var i, dist, maxDist, distPoint, set1, set2;
		if (edge == null) debugger;
		if (pointset.length == 0)
			return;
		distPoint = pointset[0];
		maxDist = edge.perpendicularDist(pointset[0]);
		for (i = 1; i < pointset.length; ++i) {
			dist = edge.perpendicularDist(pointset[i])
			if (dist > maxDist) {
				maxDist = dist;
				distPoint = pointset[i];
			}
		}
		edges.splice(index, 1, new Edge(edge.p1, distPoint), new Edge(distPoint, edge.p1))

		set1 = getPointsCW(edges[index], pointset);
		set2 = getPointsCW(edges[index + 1], pointset);

		var node = new Node();
		node.data = cloneData();
		parent.adopt(node);

		recurse(edges[index], set1, node, index);
		recurse(edges[index + 1], set2, node, index + 1);
	}


	getPointsCW = function(edge, p) {
		var pointset = [];
		for (i = 0; i < p.length; ++i) {
			if (p[i] != edge.p1 && p[i] != edge.p2 && Point.orient(edge.p1, edge.p2, p[i]) < 0)
				pointset.push(p[i]);
		}
		return pointset;
	}
	cloneData = function () {
		var i;
		var data = { edges: [], points: [] };
		for (i = 0; i < points.length; i++) {
			data.points.push(points[i].clone());
		}
		for (i = 0; i < edges.length; i++) {
			var j = points.indexOf(edges[i].p1)
			var p1Clone = data.points[j];
			j = points.indexOf(edges[i].p2)
			var p2Clone = data.points[j];
			data.edges.push(edges[i].clone(p1Clone, p2Clone));
		}
		return data;
	}

}