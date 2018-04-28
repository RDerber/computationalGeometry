window.onload = function () {
	var view = new quickHull();
	view.displayConvexHull();
}

function quickHull() {
	var quickHull = this;
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

	this.displayConvexHull = function (event) {
		var $graphRow = $(document.createElement("div"));
		$graphRow.css("white-space", "nowrap");

		$(document.body).append($graphRow);

		var attr = { interactionType: "pointGraph" };
		var graphDiv = document.createElement('div');
		graphDiv.style = "display: inline-block;";
		$graphRow.append(graphDiv);

		graph = new Graph(attr, graphDiv);

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

		random($graphRow);
	}

	function random($parentElement) {

		var $randomDiv = $(document.createElement('div'));
		var $randTextDiv = $(document.createElement('div'));
		$randTextDiv.css("display", "inline-block");
		$randTextDiv.append(document.createTextNode("Add"));
		$randomDiv.append($randTextDiv)

		var $input = $(document.createElement('input'));
		$input.attr("id", "randomInput");
		$input.css("display", "inline-block");
		$input.css("type", "number");
		$randomDiv.append($input);

		var $moreText = $(document.createElement('div'));
		$moreText.css("display", "inline-block");
		$moreText.append(document.createTextNode("Random Points: "));
		$randomDiv.append($moreText);

		var $randomButton = $(document.createElement('button'));
		$randomButton.css("display", "inline-block");
		$randomButton.append(document.createTextNode("Add Points"));
		$randomDiv.append($randomButton);
		$randomButton.on("click", addRandomPoints);
		$parentElement.append($randomDiv);
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
		tree = tree.flatten();
		tree.node = tree.root;
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
			if (ps.length > 0) {
				getDistPoint(ps, e).setAttribute({ strokeColor: 'red', fillColor: 'red' });
			}
			n.data = cloneData();
			e.setAttribute({ strokeColor: "blue" });
			root.adopt(n);
			recurse(e, ps, root, i);
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

		if(set1.length > 0)
			getDistPoint(set1, e1).setAttribute({ strokeColor: 'red', fillColor: 'red' });

		var node = new TreeNode();
		node.data = cloneData();
		parent.adopt(node);

		recurse(e1, set1, node, negativeOffset + 1);
		e2.setAttribute({ strokeColor: "yellow" });
		for (i = 0; i < set2.length; ++i) {
			set2[i].setAttribute({ strokeColor: 'yellow', fillColor: 'yellow' });
		}

		if(set2.length > 0)
			getDistPoint(set2, e2).setAttribute({ strokeColor: 'red', fillColor: 'red' });

		node = new TreeNode();
		node.data = cloneData();
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

	function addRandomPoints(event) {
		graph.addRandomPoints($("#randomInput").val());
	}
}