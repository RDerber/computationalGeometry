window.onload = function () {
	var view = new quickHull();
	view.displayConvexHull();
}

function quickHull() {
	var quickHull = this;
	var graphContainer;
	var graph;
	var points;
	var brNode, trNode, tlNode, blNode;
	var edges = [];
	var tree = new Tree();
	var root;
	var preComputedLowerHull;
	var preComputedUpperHull;
	var lowerHull = [];
	var upperHull = [];
	var curHull, curIndex, orientation, finished;
	var tableLines = [];

	this.displayConvexHull = function (event) {
		var desc = document.createElement("div");
		desc.style.whiteSpace = "pre";

		var table = document.createElement("table");
		table.style.tableLayout = "fixed";
		table.style.borderCollapse = "collapse";
		table.style.padding = 0;
		table.style.margin = 0;
		table.style.fontSize = "small";
		desc.appendChild(table);

		var lines =
		["QuickHull",
			"setup():",
			"	find top, left, right, and bottom points, create diamond",
			"	for each diamond edge:",
			"		recursiveHelper(edge, points)",
			" ",
				"recursiveHelper(edge, points):",
			"	if no points outside edge, return",
			"	get distPoint from points outside edge",
			"	remove edge, add new Edge(edge.p1,distPoint) and new Edge(edge.p2,distPoint)",
			"	recursiveHelper(newEdge1)",
			"	recursiveHelper(newEdge2)"]

		var line = lines[0];
		var row = table.insertRow();

		var l = row.insertCell();
		var r = row.insertCell();
		var text = row.insertCell();
		text.style.padding = 0;
		text.style.margin = 0;
		text.style.textDecoration= "underline";
		tableLines.push(text);
		text.appendChild(document.createTextNode(line));

		for (var i = 1; i < lines.length; ++i) {
			var line = lines[i];
			var row = table.insertRow();

			var l = row.insertCell();
			var r = row.insertCell();
			var text = row.insertCell();
			text.style.padding = 0;
			text.style.margin = 0;
			tableLines.push(text);
			text.appendChild(document.createTextNode(line));
		};

		graphContainer = new GraphContainer("Quick Hull", [{ color: "red", text: "distant point" }, {color: "blue", text: "possible hull points"}], desc);

		var attr = { interactionType: "pointGraph" };

		graph = new Graph(attr, graphContainer.graphDiv);

		var buttonDiv = graphContainer.buttonContainer;
		var buttonContainer = document.createElement("div");
		buttonContainer.id = "buttonContainer";
		buttonContainer.style = "display: inline-block; vertical-align: top; text-align: center";
		buttonDiv.appendChild(buttonContainer);

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

		$quadContainer = $(document.createElement("div"));
		$buttonContainer.append($quadContainer);

		var $upperContainer = $(document.createElement("div"));
		var $lowerContainer = $(document.createElement("div"));

		if (tlNode != null) {
			$tlButton = $("<div>", { id: "tlButton", class: "button-inline" });
			$tlButton.css("horizontal-align", "center");
			$tlButton.on("click", moveTL);
			$tlText = $(document.createElement("div"));
			$tlText.addClass("button-content");
			$tlText.append(document.createTextNode("Top Left"))
			$tlButton.append($tlText);
			$upperContainer.append($tlButton);
		}

		if (trNode != null) {
			$trButton = $("<div>", { id: "trButton", class: "button-inline" });
			$trButton.css("horizontal-align", "center");
			$trButton.on("click", moveTR);
			$trText = $(document.createElement("div"));
			$trText.addClass("button-content");
			$trText.append(document.createTextNode("Top Right"))
			$trButton.append($trText);
			$upperContainer.append($trButton);
		}

		if (blNode != null) {
			$blButton = $("<div>", { id: "blButton", class: "button-inline" });
			$blButton.css("horizontal-align", "center");
			$blButton.on("click", moveBL);
			$blText = $(document.createElement("div"));
			$blText.addClass("button-content");
			$blText.append(document.createTextNode("Bottom Left"))
			$blButton.append($blText);
			$lowerContainer.append($blButton);
		}

		if (brNode != null) {
			$brButton = $("<div>", { id: "brButton", class: "button-inline" });
			$brButton.css("horizontal-align", "center");
			$brButton.on("click", moveBR);
			$brText = $(document.createElement("div"));
			$brText.addClass("button-content");
			$brText.append(document.createTextNode("Bottom Right"))
			$brButton.append($brText);
			$lowerContainer.append($brButton);
		}

		$quadContainer.append($upperContainer);
		$quadContainer.append($lowerContainer);

		backNextButtons($buttonContainer);
		tree.node = tree.root.children[0];
		var n = tree.root;
		while (n.hasChildren()) {
			if (tlNode && tlNode.data == n.data)
				tlNode = n;
			if (blNode && blNode.data == n.data)
				blNode = n;
			if (trNode && trNode.data == n.data)
				trNode = n;
			if (brNode && brNode.data == n.data)
				brNode = n;
			n = n.children[0];
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function backNextButtons($container) {
		$backButton = $("<div>", { id: "backButton", class: "button-inline" });
		$backButton.css("horizontal-align", "center");
		$backButton.on("click", back);
		$backButton.on("mouseover", () => (tableLines[7].style.backgroundColor = "tan"));
		$backButton.on("mouseout", () => { tableLines[7].style.backgroundColor = "" });
		$backButton.on("click", back);
		$backText = $(document.createElement("div"));
		$backText.addClass("button-content");
		$backText.append(document.createTextNode("Undo Recurse"))
		$backButton.append($backText);
		$container.append($backButton);

		$recurseDiv = $("<div>", { id: "recurseDiv" });
		$container.append($recurseDiv);

		$recurseRightButton = $("<div>", { id: "recurseRight", class: "button-inline" });
		$recurseRightButton.css("horizontal-align", "center");
		$recurseRightButton.on("click", recurseRight);
		$recurseRightButton.on("mouseover", () => (tableLines[11].style.backgroundColor = "tan"));
		$recurseRightButton.on("mouseout", () => (tableLines[11].style.backgroundColor = ""));
		$recurseRightText = $(document.createElement("div"));
		$recurseRightText.addClass("button-content");
		$recurseRightText.append(document.createTextNode("Recurse Right"))
		$recurseRightButton.append($recurseRightText);
		$recurseDiv.append($recurseRightButton);

		$recurseLeftButton = $("<div>", { id: "recurseLeft", class: "button-inline" });
		$recurseLeftButton.css("horizontal-align", "center");
		$recurseLeftButton.on("click", recurseLeft);
		$recurseLeftButton.on("mouseover", () => (tableLines[4].style.backgroundColor = "tan"));
		$recurseLeftButton.on("mouseout", () => (tableLines[4].style.backgroundColor = ""));
		$recurseLeftText = $(document.createElement("div"));
		$recurseLeftText.addClass("button-content");
		$recurseLeftText.append(document.createTextNode("Recurse Left"))
		$recurseLeftButton.append($recurseLeftText);
		$recurseDiv.append($recurseLeftButton);

		$finishRecurseButton = $("<div>", { id: "finishRecurse", class: "button-inline" });
		$finishRecurseButton.css("horizontal-align", "center");
		$finishRecurseButton.on("click", finishRecurse);
		$finishRecurseButton.on("mouseover", () => (tableLines[4].style.backgroundColor = "tan"));
		$finishRecurseButton.on("mouseout", () => (tableLines[4].style.backgroundColor = ""));
		$finishRecurseText = $(document.createElement("div"));
		$finishRecurseText.addClass("button-content");
		$finishRecurseText.append(document.createTextNode("Finish Recursion"))
		$finishRecurseButton.append($finishRecurseText);
		$container.append($finishRecurseButton);

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

	function recurseLeft(event) {
		tree.node = tree.node.children[1];
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function recurseRight(event) {
		tree.node = tree.node.children[0];
		graph.loadData(tree.node.getData());
		updateButtons();
	}
	function finishRecurse(event) {
		var tempnode = tree.node;
		while (tempnode != tempnode.parent.children[0] && tree.getCurrentDepth() != 2) {
			tree.moveUp();
		}
		tree.node = tree.node.rightSibling;
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

	function updateButtons() {
		var $button;
		$button = $("#recurseRight");
		if (tree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "gray");
			$button.off("click");
			$button.on("click", recurseRight);
		}

		$button = $("#recurseLeft");
		if (tree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "gray");
			$button.off("click");
			$button.on("click", recurseLeft);
		}

		$button = $("#finishRecurse");
		if (tree.getCurrentDepth() == 1 && tree.node.rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "gray");
			$button.off("click");
			$button.on("click", finishRecurse);
		}

		$button = $("#backButton");
		if (tree.getCurrentDepth() == 1) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "gray");
			$button.off("click");
			$button.on("click", back);
		}

	}

	function computeConvexHull() {
		var i;
		root = new TreeNode();
		tree.root = root;
		tree.node = root.children[0];

		root.data = cloneData();

		var topPoint = points[0];
		var botPoint = points[0]
		var leftPoint = points[0];
		var rightPoint = points[0];
		for (i = 1; i < points.length; ++i) {
			if (points[i].y > topPoint.y) topPoint = points[i];
			if (points[i].y < botPoint.y) botPoint = points[i];
			if (points[i].x < leftPoint.x) leftPoint = points[i];
			if (points[i].x > rightPoint.x) rightPoint = points[i]
		}

		var quad = [];
		var psarr = []
		if (topPoint != leftPoint) {
			var e = new Edge(topPoint, leftPoint, { strokeColor: "blue" });
			edges.push(e);
			quad.push((tlNode = new TreeNode()));
			psarr.push(getPointsCW(e, points));
		}
		if (leftPoint != botPoint) {
			var e = new Edge(leftPoint, botPoint, { strokeColor: "blue" })
			edges.push(e);
			quad.push((blNode = new TreeNode()));
			psarr.push(getPointsCW(e, points));
		}
		if (botPoint != rightPoint) {
			var e = new Edge(botPoint, rightPoint, { strokeColor: "blue" });
			edges.push(e);
			quad.push((brNode = new TreeNode()));
			psarr.push(getPointsCW(e, points));
		}
		if (rightPoint != topPoint) {
			var e = new Edge(rightPoint, topPoint, { strokeColor: "blue" });
			edges.push(e);
			quad.push((trNode = new TreeNode()));
			psarr.push(getPointsCW(e, points));
		}

		for (i = 0; i < psarr.length; i++) {
			for (j = 0; j < psarr[i].length; ++j) {
				psarr[i][j].setAttribute({ fillColor: "blue", strokeColor: "blue" });
			}
		}

		j = 0;
		for (i = edges.length; i > 0; --i) {
			var e = edges[edges.length - i];
			var ps = getPointsCW(e, points);
			var n = quad[j];
			e.setAttribute({ strokeColor: "yellow" });
			var k;
			for (k = 0; k < ps.length; ++k) {
				ps[k].setAttribute({ strokeColor: 'yellow', fillColor: 'yellow' });
			}
			var distPoint;
			if (ps.length > 0) {
				distPoint = getDistPoint(ps, e)
				distPoint.setAttribute({ strokeColor: 'red', fillColor: 'red' });
				edges.push(new Edge(distPoint, e.p1, { dash: 2 }));
				edges.push(new Edge(distPoint, e.p2, { dash: 2 }));
			}
			n.data = cloneData();
			if (ps.length > 0) {
				edges.pop();
				edges.pop();
			}
			e.setAttribute({ strokeColor: "blue" });
			root.adopt(n);
			recurse(e, ps, n, i);
			j++;
		}
		var n = new TreeNode();
		n.data = cloneData();
		root.adopt(n);
	}

	function recurse(edge, pointset, parent, negativeOffset) {
		var i, j, k, dist, maxDist, distPoint, set1, set2;
		if (edge == null) debugger;
		if (pointset.length == 0) {
			edge.setAttribute({ strokeColor: 'black' });
			return;
		}
		distPoint = getDistPoint(pointset, edge);

		var index = edges.length - negativeOffset;
		var e1 = new Edge(edge.p1, distPoint, { strokeColor: "blue" });
		var e2 = new Edge(distPoint, edge.p2, { strokeColor: "blue" });
		edges.splice(index, 1, e1, e2);

		set1 = getPointsCW(e1, pointset);
		set2 = getPointsCW(e2, pointset);

		e1.setAttribute({ strokeColor: "yellow" });
		j = 0;
		k = 0;
		for (i = 0; i < pointset.length; ++i) {
			if (pointset[i] == set1[j])
				++j;
			else if (pointset[i] == set2[k])
				++k;
			else
				pointset[i].setAttribute({ fillColor: 'black', strokeColor: 'black' });
		}
		for (i = 0; i < set1.length; ++i) {
			set1[i].setAttribute({ strokeColor: 'yellow', fillColor: 'yellow' });
		}
		for (i = 0; i < set2.length; ++i) {
			set2[i].setAttribute({ strokeColor: 'blue', fillColor: 'blue' });
		}

		if (set1.length > 0) {
			var distPoint = getDistPoint(set1, e1);
			distPoint.setAttribute({ strokeColor: 'red', fillColor: 'red' });
			edges.push(new Edge(e1.p1, distPoint, { dash: 2 }));
			edges.push(new Edge(e1.p2, distPoint, { dash: 2 }));
		}

		var node = new TreeNode();
		node.data = cloneData();
		if (set1.length > 0) {
			edges.pop();
			edges.pop();
		}
		parent.adopt(node);

		recurse(e1, set1, node, negativeOffset + 1);
		e2.setAttribute({ strokeColor: "yellow" });
		for (i = 0; i < set2.length; ++i) {
			set2[i].setAttribute({ strokeColor: 'yellow', fillColor: 'yellow' });
		}

		if (set2.length > 0) {
			var distPoint = getDistPoint(set2, e2);
			distPoint.setAttribute({ strokeColor: 'red', fillColor: 'red' });
			edges.push(new Edge(e2.p1, distPoint, { dash: 2 }));
			edges.push(new Edge(e2.p2, distPoint, { dash: 2 }));
		}

		node = new TreeNode();
		node.data = cloneData();
		if (set2.length > 0) {
			edges.pop();
			edges.pop();
		}
		parent.adopt(node);

		recurse(e2, set2, node, negativeOffset);
		e2.setAttribute({ strokeColor: "black" });
	}

	function getDistPoint(pointset, edge) {
		if (pointset.length == 0) {
			debugger;
			return;
		}

		var distPoint = pointset[0];
		var maxDist = edge.perpendicularDist(pointset[0]);
		for (i = 1; i < pointset.length; ++i) {
			dist = edge.perpendicularDist(pointset[i])
			if (dist > maxDist) {
				maxDist = dist;
				distPoint = pointset[i];
			}
		}
		return distPoint;
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