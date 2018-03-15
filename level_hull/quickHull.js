﻿window.onload = function () {
	var view = new quickHull();
	view.displayConvexHull();
}

function quickHull() {
	var quickHull = this;
	var graph;
	var points;
	var jobQueue = [];
	var brNode, trNode, tlNode, blNode;
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
		buttonContainer.style = "display: inline-block; vertical-align: top; text-align: center";
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

		//upLeftRightDownButtons($buttonContainer);
		backNextButtons($buttonContainer);

		tree.node = tree.root;
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function backNextButtons($container) {
		$backButton = $("<div>", { id: "backButton", class: "button-inline" });
		$backButton.css("horizontal-align", "center");
		$backButton.on("click", back);
		$backText = $(document.createElement("div"));
		$backText.addClass("button-content");
		$backText.append(document.createTextNode("Back"))
		$backButton.append($backText);
		$container.append($backButton);

		$nextButton = $("<div>", { id: "nextButton", class: "button-inline" });
		$nextButton.css("horizontal-align", "center");
		$nextButton.on("click", next);
		$nextText = $(document.createElement("div"));
		$nextText.addClass("button-content");
		$nextText.append(document.createTextNode("Next"))
		$nextButton.append($nextText);
		$container.append($nextButton);
	}

	function upLeftRightDownButtons($buttonContainer) {
		$upButton = $("<div>", { id: "upButton", class: "button-inline" });
		$upButton.css("horizontal-align", "center");
		$upButton.on("click", moveUp);
		$upText = $(document.createElement("div"));
		$upText.addClass("button-content");
		$upText.append(document.createTextNode("Up"))
		$upButton.append($upText);
		$buttonContainer.append($upButton);

		$leftRightContainer = $(document.createElement("div"));
		$buttonContainer.append($leftRightContainer);

		$leftButton = $("<div>", { id: "leftButton", class: "button-inline" });
		$leftButton.on("click", moveLeft);
		$leftText = $(document.createElement("div"));
		$leftText.addClass("button-content");
		$leftText.append(document.createTextNode("Left"));
		$leftButton.append($leftText);
		$leftRightContainer.append($leftButton);

		$rightButton = $("<div>", { id: "rightButton", class: "button-inline" });
		$rightButton.on("click", moveRight);
		$rightText = $(document.createElement("div"));
		$rightText.addClass("button-content");
		$rightText.append(document.createTextNode("Right"));
		$rightButton.append($rightText);
		$leftRightContainer.append($rightButton);

		$downButton = $("<div>", { id: "downButton", class: "button-inline" });
		$upButton.css("horizontal-align", "center");
		$downButton.on("click", moveDown);
		$downText = $(document.createElement("div"));
		$downText.addClass("button-content");
		$downText.append(document.createTextNode("Down"));
		$downButton.append($downText);
		$buttonContainer.append($downButton);
	}

	function back(event) {
		tree.moveUp();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function next(event) {
		tree.moveDown();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveBL(event) {
		tree.node = blNode;
		graph.loadData(tree.node.getData());
		updateButtons();
	}
	function moveTL(event) {
		tree.node = tlNode;
		graph.loadData(tree.node.getData());
		updateButtons();
	}
	function moveTR(event) {
		tree.node = trNode;
		graph.loadData(tree.node.getData());
		updateButtons();
	}
	function moveBR(event) {
		tree.node = brNode;
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
		$button = $("#nextButton");
		if (tree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", next);
		}

		$button = $("#backButton");
		if (tree.node.parent == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", back);
		}

	}

	function computeConvexHull() {
		var i;
		root = new TreeNode();
		tree.root = root;
		tree.node = root;

		root.data = cloneData();

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

		var quad = [];

		if (topPoint != leftPoint) {
			edges.push(new Edge(topPoint, leftPoint));
			quad.push((tlNode = new TreeNode()));
		}
		if (leftPoint != botPoint) {
			edges.push(new Edge(leftPoint, botPoint));
			quad.push((blNode = new TreeNode()));
		}
		if (botPoint != rightPoint) {
			edges.push(new Edge(botPoint, rightPoint));
			quad.push((brNode = new TreeNode()));
		}
		if (rightPoint != topPoint) {
			edges.push(new Edge(rightPoint, topPoint));
			quad.push((trNode = new TreeNode()));

		}

		j = 0;
		for (i = edges.length; i > 0; --i) {
			var e = edges[edges.length - i];
			var ps = getPointsCW(e, points);
			var n = quad[j];
			jobQueue.push(wrapper(e, ps, n));
		}
		var node = new TreeNode();
		node.data = cloneData();
		tree.root.adopt(node);
		tree.node = tree.root;
		tree.moveDown();
		while (jobQueue.length > 0) {
			executeLevel();
			node = new TreeNode();
			node.data = cloneData();
			tree.node.adopt(node);
			tree.moveDown();
		}
	}

	function executeLevel() {
		var func;
		var jobs = [];
		while (func = jobQueue.pop()) {
			var ret = func();
			if (ret) {
				jobs.push.apply(jobs, ret);
			}
		}
		jobQueue = jobs;
	}

	function wrapper(edge, pointset, parent) {
		return function () {
			return recurse(edge, pointset, parent);
		}
	}

	function recurse(edge, pointset) {
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

		var func = Edge.findSameAs(edge);
		var index = edges.findIndex(func);
		var e1 = new Edge(edge.p1, distPoint);
		var e2 = new Edge(distPoint, edge.p2)
		edges.splice(index, 1, e1, e2)

		set1 = getPointsCW(e1, pointset);
		set2 = getPointsCW(e2, pointset);

		var ret = [];
		if (set1.length > 0)
			ret.push(wrapper(e1, set1));
		if (set2.length > 0) 
			ret.push(wrapper(e2, set2));
		return ret;
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