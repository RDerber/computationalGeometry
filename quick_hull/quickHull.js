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
		// Create the pseudocode description of the algorithm
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
			"	for Top Left, Bottom Left, Bottom Right, Top Right:",
			"		recursiveHelper(edge, points)",
			" ",
			"recursiveHelper(edge, points):",
			"	if no points outside edge, return",
			"	remove edge, find distant point, add new edges",
			"	recursiveHelper(newEdge1, points outside newEdge1)",
			"	recursiveHelper(newEdge2, points outside newEdge2)"]

		var line = lines[0];
		var row = table.insertRow();

//		var l = row.insertCell();
//		var r = row.insertCell();
		var text = row.insertCell();
		text.style.padding = 0;
		text.style.margin = 0;
		text.style.textDecoration= "underline";
		tableLines.push(text);
		text.appendChild(document.createTextNode(line));

		for (var i = 1; i < lines.length; ++i) {
			var line = lines[i];
			var row = table.insertRow();
			var text = row.insertCell();
			text.style.padding = 0;
			text.style.margin = 0;
			tableLines.push(text);
			if (i == 3) {
				var textArr = ["	for "];
				textArr.push("Top Left");
				textArr.push(", ");
				textArr.push("Bottom Left");
				textArr.push(", ");
				textArr.push("Bottom Right");
				textArr.push(", ");
				textArr.push("Top Right");
				textArr.push(":");
				textArr.forEach((str) => {
					var tempDiv = document.createElement("div");
					tempDiv.style.display = "inline-block";
					tempDiv.appendChild(document.createTextNode(str));
					text.appendChild(tempDiv);
				});

			}
			else {
				text.appendChild(document.createTextNode(line));
			}
		};

		// Representation of the key for the graph
		//var keys = [{ type: "point", color: "red", text: "distant point" }, { type: "point", color: "blue", text: "possible hull points" }, { type: "point", color: "yellow", text: "points outside edge" }, { type: "line", color: "yellow", text: "current edge" }];
		
		//Creates the DOM elements that make up the general GUI layout for the algorithms
		graphContainer = new GraphContainer("Quick Hull", [], desc);

		var attr = { interactionType: "pointGraph" };

		// Generates a graph of the given interaction type and adds it to its place in the graph container
		graph = new Graph(attr, graphContainer.graphDiv);

		// Adds something allowing a user to add points in a circle
		
		var circleDiv = document.createElement("div");
		circleDiv.style.flex = "1";

		var circleText = document.createElement('div');
		circleText.style.display = "inline-block";
		circleText.appendChild(document.createTextNode("Points on Ellipse:"));
		circleDiv.appendChild(circleText);

		var input = document.createElement('input');
		input.id = "circleInput";
		input.style.display = "inline-block";
		input.style.type = "number";
		circleDiv.appendChild(input);

		var circleButton = document.createElement('button');
		circleButton.style.display = "inline-block";
		circleButton.appendChild(document.createTextNode("Add"));
		circleButton.addEventListener("click", () => { graph.createEllipsePoints(input.value) });
		circleDiv.appendChild(circleButton);

		graph.bottomRow.insertBefore(circleDiv,graph.bottomRow.children[1]);
		
		var buttonDiv = graphContainer.buttonContainer;
		var buttonContainer = document.createElement("div");
		buttonContainer.id = "buttonContainer";
		buttonContainer.style = "display: inline-block; vertical-align: top; text-align: center";
		buttonDiv.appendChild(buttonContainer);

		var button = document.createElement('button');
		button.id = "computeHullButton";
		button.classList.add("button");

		button.appendChild(document.createTextNode("Compute Convex Hull"));
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		var tutorial = document.createElement('div');
		tutorial.id = "tutorial";
		tutorial.classList.add("tutorial");
		var text1 = document.createElement('div');
		text1.classList.add('subtutorial');
		text1.appendChild(document.createTextNode('1. Click in the left panel to place new points, or use the Random Points button.'));
		tutorial.appendChild(text1);
		var text2 = document.createElement('div');
		text2.classList.add('subtutorial');
		text2.appendChild(document.createTextNode('2. Click Compute Convex Hull button.'));
		tutorial.appendChild(text2);
		buttonContainer.appendChild(tutorial);
		
	}

	// Transitions from allowing the client to add points to stepping through the algorithm
	function transition() {
		if (graph.points.length < 3) return;

		// Prevents the user from further adding points
		graph.freeze();

		points = graph.cloneData().points;

		//Creates the tree representation of the algorithm
		computeConvexHull();

		var $buttonContainer = $("#buttonContainer");
		$("#computeHullButton").remove();
		$("#tutorial").remove();

		// Add buttons that move the user through the algorithm using the tree representation
		
		$quadContainer = $(document.createElement("div"));
		$buttonContainer.append($quadContainer);

		var $upperContainer = $(document.createElement("div"));
		//$upperContainer.css();
		var $lowerContainer = $(document.createElement("div"));

		if (tlNode != null) {
			$tlButton = $("<button>", { id: "tlButton", class: "button" });
			$tlButton.css("horizontal-align", "center");
			$tlButton.on("click", moveTL);
			$tlButton.append(document.createTextNode("Top Left"))
			$tlButton.on("mouseover", () => (tableLines[3].children[1].style.backgroundColor = "tan"));
			$tlButton.on("mouseout", () => (tableLines[3].children[1].style.backgroundColor = ""));
			$upperContainer.append($tlButton);
		}

		if (trNode != null) {
			$trButton = $("<button>", { id: "trButton", class: "button" });
			$trButton.css("horizontal-align", "center");
			$trButton.on("click", moveTR);
			$trButton.on("mouseover", () => (tableLines[3].children[7].style.backgroundColor = "tan"));
			$trButton.on("mouseout", () => (tableLines[3].children[7].style.backgroundColor = ""));
			$trButton.append(document.createTextNode("Top Right"));
			$upperContainer.append($trButton);
		}

		if (blNode != null) {
			$blButton = $("<button>", { id: "blButton", class: "button" });
			$blButton.css("horizontal-align", "center");
			$blButton.on("click", moveBL);
			$blButton.on("mouseover", () => (tableLines[3].children[3].style.backgroundColor = "tan"));
			$blButton.on("mouseout", () => (tableLines[3].children[3].style.backgroundColor = ""));
			$blButton.append(document.createTextNode("Bottom Left"));
			//$blButton.append(document.createElement("br"));
			//$blButton.append(document.createTextNode("Left"));
			$lowerContainer.append($blButton);
		}

		if (brNode != null) {
			$brButton = $("<button>", { id: "brButton", class: "button" });
			$brButton.css("horizontal-align", "center");
			$brButton.on("click", moveBR);
			$brButton.on("mouseover", () => (tableLines[3].children[5].style.backgroundColor = "tan"));
			$brButton.on("mouseout", () => (tableLines[3].children[5].style.backgroundColor = ""));
			$brButton.append(document.createTextNode("Bottom Right"))
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

		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var redpoint = new desContainer("redpoint.jpeg","On one side of the base edge with maximum distance from base edge.",DesContainer);
		var blackpoint = new desContainer("blackpoint.jpeg","Lying inside of the quick hull.",DesContainer);
		var yellowpoint =new desContainer("yellowpoint.jpeg","Lying outside of the quick hull and on one side of the base edge.",DesContainer);
		var bluepoint = new desContainer("bluepoint.jpeg","Lying outside of the quick hull and on one side of the blue edge.",DesContainer);
		var yellowedge = new desContainer("yellowedge.jpeg","Base edge of current visiting triangle.",DesContainer);
		var blueedge = new desContainer("blueedge.jpeg","Base of triangle which is not visited yet.",DesContainer);
		var blackedge = new desContainer("blackedge.jpeg","Edge of quick hull.",DesContainer);
		var yellowdashedge = new desContainer("yellowdashedge.jpeg","Forms current visiting triangle with base edge.",DesContainer);

		$buttonContainer.append($(DesContainer));
	}

	function backNextButtons($container) {
		$backButton = $("<button>", { id: "backButton", class: "button" });
		$backButton.css("horizontal-align", "center");
		$backButton.on("click", back);
		$backButton.on("click", back);
		$backButton.append(document.createTextNode("Undo Recurse"))
		$container.append($backButton);

		$recurseDiv = $("<div>", { id: "recurseDiv" });
		$container.append($recurseDiv);

		$recurseRightButton = $("<button>", { id: "recurseRight", class: "button" });
		$recurseRightButton.css("horizontal-align", "center");
		$recurseRightButton.on("click", recurseRight);
		$recurseRightButton.on("mouseover", () => (tableLines[9].style.backgroundColor = "tan"));
		$recurseRightButton.on("mouseout", () => (tableLines[9].style.backgroundColor = ""));
		$recurseRightButton.append(document.createTextNode("Recurse CCW"))
		$recurseDiv.append($recurseRightButton);

		$recurseLeftButton = $("<button>", { id: "recurseLeft", class: "button" });
		$recurseLeftButton.css("horizontal-align", "center");
		$recurseLeftButton.on("click", recurseLeft);
		$recurseLeftButton.on("mouseover", () => (tableLines[10].style.backgroundColor = "tan"));
		$recurseLeftButton.on("mouseout", () => (tableLines[10].style.backgroundColor = ""));
		$recurseLeftButton.append(document.createTextNode("Recurse CW"));
		//$recurseLeftButton.append(document.createElement("br"));
		//$recurseLeftButton.append(document.createTextNode("CW"));
		$recurseDiv.append($recurseLeftButton);

		$finishRecurseButton = $("<button>", { id: "finishRecurse", class: "button" });
		$finishRecurseButton.css("horizontal-align", "center");
		$finishRecurseButton.on("click", finishRecurse);
		$finishRecurseButton.append(document.createTextNode("Finish Recursion"))
		$container.append($finishRecurseButton);

	}

	function upLeftRightDownButtons($buttonContainer) {
		$upButton = $("<button>", { id: "upButton", class: "button" });
		$upButton.css("horizontal-align", "center");
		$upButton.on("click", moveUp);
		$upButton.append(document.createTextNode("Up"))
		$buttonContainer.append($upButton);

		$leftRightContainer = $(document.createElement("div"));
		$buttonContainer.append($leftRightContainer);

		$leftButton = $("<button>", { id: "leftButton", class: "button" });
		$leftButton.on("click", moveLeft);
		$leftButton.append(document.createTextNode("Left"));
		$leftRightContainer.append($leftButton);

		$rightButton = $("<button>", { id: "rightButton", class: "button" });
		$rightButton.on("click", moveRight);
		$rightButton.append(document.createTextNode("Right"));
		$leftRightContainer.append($rightButton);

		$downButton = $("<button>", { id: "downButton", class: "button" });
		$upButton.css("horizontal-align", "center");
		$downButton.on("click", moveDown);
		$downButton.append(document.createTextNode("Down"));
		$buttonContainer.append($downButton);


	}

	function back(event) {
		if (tree.getCurrentDepth() == 1) {
			tree.moveLeft();
			while (tree.node.children.length > 0) {
				tree.node = tree.node.children[tree.node.children.length - 1];
			}
		}
		else {
			tree.moveUp();
		}
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
		while (tree.node != tree.node.parent.children[0] && tree.getCurrentDepth() != 1) {
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
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", recurseRight);
		}

		$button = $("#recurseLeft");
		if (tree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", recurseLeft);
		}

		$button = $("#finishRecurse");
		if (tree.getCurrentDepth() == 1 && (tree.node.rightSibling == null || tree.node.parent.children.indexOf(tree.node) % 2 == 1)) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", finishRecurse);
		}

		$button = $("#backButton");
		if (tree.getCurrentDepth() == 1 && tree.node.parent.children.indexOf(tree.node)%2 == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", back);
		}

	}

	// To generate the tree that represents the algorithm, this function performs the algorithm, updating the graph as it does so, and "screenshots" the graph representation and attaches them to a node
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
				edges.push(new Edge(distPoint, e.p1, { strokeColor: 'yellow',dash: 2 }));
				edges.push(new Edge(distPoint, e.p2, { strokeColor: 'yellow',dash: 2 }));
			}
			n.data = cloneData();
			if (ps.length > 0) {
				edges.pop();
				edges.pop();
			}
			e.setAttribute({ strokeColor: "blue" });
			root.adopt(n);
			recurse(e, ps, n, i);

			var n = new TreeNode();
			n.data = cloneData();
			root.adopt(n);

			j++;
		}
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
			edges.push(new Edge(e1.p1, distPoint, { strokeColor: 'yellow',dash: 2 }));
			edges.push(new Edge(e1.p2, distPoint, { strokeColor: 'yellow',dash: 2 }));
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
			edges.push(new Edge(e2.p1, distPoint, { strokeColor: 'yellow',dash: 2 }));
			edges.push(new Edge(e2.p2, distPoint, { strokeColor: 'yellow',dash: 2 }));
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
