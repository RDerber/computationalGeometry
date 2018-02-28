function convexHull() {
	var convexHull = this;
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
		var $graphRow = $(document.createElement('div', { "white-space": "nowrap" }));
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

		lowerHullSetup();
		computeConvexHull();

		var $buttonContainer = $("#buttonContainer");
		$("#computeHullButton").remove();


		var $hullContainer = $("<div>");

		var $lowerButton = $("<div>", { id: "lowerButton", class: "button-inline" });
		$lowerButton.on("click", startLowerHull);
		var $lowerText = $('<div>', { class: "button-content" });
		$lowerText.append(document.createTextNode("Lower Hull"));
		$lowerButton.append($lowerText);
		$hullContainer.append($lowerButton);

		var $upperButton = $("<div>", { id: "upperButton", class: "button-inline" });
		$upperButton.on("click", startUpperHull);
		var $upperText = $('<div>', {class: "button-content"});
		$upperText.append(document.createTextNode("Upper Hull"));
		$upperButton.append($upperText);
		$hullContainer.append($upperButton);

		$buttonContainer.append($hullContainer);

		var $outerLoopContainer = $("<div>");
		$outerLoopContainer.append($("<div>").append(document.createTextNode("Outer Loop")));

		var $outerBackButton = $("<div>", { id: "outerBackButton", class: "button-inline" });
		$outerBackButton.on("click", moveLeftOuterLoop);
		var $outerBackText = $('<div>', { class: "button-content" });
		$outerBackText.append(document.createTextNode("Back"));
		$outerBackButton.append($outerBackText);
		$outerLoopContainer.append($outerBackButton);

		var $outerForwardButton = $("<div>", { id: "outerForwardButton", class: "button-inline" });
		$outerForwardButton.on("click", moveRightOuterLoop);
		var $outerForwardText = $('<div>', { class: "button-content" });
		$outerForwardText.append(document.createTextNode("Next"));
		$outerForwardButton.append($outerForwardText);
		$outerLoopContainer.append($outerForwardButton);

		$buttonContainer.append($outerLoopContainer);

		var $innerLoopContainer = $("<div>");
		$innerLoopContainer.append($("<div>").append(document.createTextNode("Inner Loop")));

		var $innerBackButton = $("<div>", { id: "innerBackButton", class: "button-inline" });
		$innerBackButton.on("click", moveLeftInnerLoop);
		var $innerBackText = $('<div>', { class: "button-content" });
		$innerBackText.append(document.createTextNode("Back"));
		$innerBackButton.append($innerBackText);
		$innerLoopContainer.append($innerBackButton);

		var $innerForwardButton = $("<div>", { id: "innerForwardButton", class: "button-inline" });
		$innerForwardButton.on("click", moveRightInnerLoop);
		var $innerForwardText = $('<div>', { class: "button-content" });
		$innerForwardText.append(document.createTextNode("Next"));
		$innerForwardButton.append($innerForwardText);
		$innerLoopContainer.append($innerForwardButton);

		$buttonContainer.append($innerLoopContainer);

		tree.node = tree.root;
		tree.begin();
		updateButtons();
		graph.reset();
		graph.addObjects(tree.node.data);
	}

	function moveLeftOuterLoop(event) {
		tree.node = tree.atDepth(2);
		tree.moveRight();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveRightOuterLoop(event) {
		tree.node = tree.atDepth(2);
		tree.moveRight();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveRightInnerLoop(event) {
		tree.node = tree.atDepth(3);
		tree.node = tree.moveRight();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveLeftInnerLoop(event) {
		tree.node = tree.atDepth(3);
		tree.node = tree.moveLeft();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function startUpperHull(){
		tree.node = tree.root.children[1];
		while (tree.node.children.length > 0)
			tree.node = tree.node.children[0];

		graph.loadData(tree.node.getData());
	}

	function startLowerHull() {
		tree.node = tree.root.children[0];
		while (tree.node.children.length > 0)
			tree.node = tree.node.children[0];

		graph.loadData(tree.node.getData());
	}

	function updateButtons() {
		var $button;
		$button = $("#outerForwardButton");
		if (!tree.atDepth(2).rightNeighbor) {
			$button.css("fillcolor", "lightgray");
			$button.off();
		}
		else {
			$button.css("fillcolor", "gray");
			$button.on("click", moveRightOuterLoop);
		}

		$button = $("#outerBackButton");
		if (!tree.atDepth(2).leftNeighbor) {
			$button.css("fillcolor", "lightgray");
			$button.off();
		}
		else {
			$button.css("fillcolor", "gray");
			$button.on("click", moveLeftOuterLoop);
		}

		$button = $("#innerForwardButton");
		if (!tree.atDepth(3).rightNeighbor) {
			$button.css("fillcolor", "lightgray");
			$button.off();
		}
		else {
			$button.css("fillcolor", "gray");
			$button.on("click", moveRightInnerLoop);
		}

		$button = $("#innerBackButton");
		if (!tree.atDepth(3).leftNeighbor == null) {
			$button.css("fillcolor", "lightgray");
			$button.off();
		}
		else {
			$button.css("fillcolor", "gray");
			$button.on("click", moveLeftInnerLoop);
		}

	}

	function lowerHullSetup() {
		points.sort(Point.compareX);
		lowerHull.push(points[0]);

		lowerHull[lowerHull.length - 1].setAttribute({ fillColor: "yellow" });
		points[1].setAttribute({ fillColor: "yellow" });


		edges.push(new Edge(lowerHull[0], points[1], { strokeColor: "yellow" }));


		curHull = lowerHull;
		preComputedHalfHull = preComputedLowerHull;
		orientation = -1;
		curIndex = 1;
	}

	function upperHullSetup() {
		upperHull.push(points[0]);

		upperHull[upperHull.length - 1].setAttribute({ fillColor: "yellow" });
		points[1].setAttribute({ fillColor: "yellow" });

		edges.push(new Edge(upperHull[0], points[1], { strokeColor: "yellow" }));

		orientation = 1;
		curIndex = 1;
		curHull = upperHull;
		preComputedHalfHull = preComputedUpperHull;

	}

	function computeConvexHull() {
		root = new Node();
		tree.root = root;
		tree.node = root;
		var lowNode = new Node();
		while (curIndex < points.length) nextPoint(lowNode);

		upperHullSetup();

		var hiNode = new Node();

		while (curIndex < points.length) nextPoint(hiNode);
		root.adopt(lowNode);
		root.adopt(hiNode);
	}

	function nextPoint(parent) {
		var node = new Node();
		parent.adopt(node);
		while (!curHullBaseStep(node));
	}

	function curHullBaseStep(parent) {
		var ret;
		if (curHull.length > 1 && Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], points[curIndex])) == orientation) {
			var removed = curHull.pop();
			removed.setAttribute({ fillColor: "black" });
			if (curHull.length > 1) {
				curHull[curHull.length - 2].setAttribute({ fillColor: "yellow" });
				if (Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], points[curIndex])) == orientation) {
					curHull[curHull.length - 1].setAttribute({ fillColor: "red" });
				}
				else curHull[curHull.length - 1].setAttribute({ fillColor: "green" });
			}
			edges.pop();
			edges.pop();
			edges.push(new Edge(curHull[curHull.length - 1], points[curIndex], { strokeColor: "yellow" }));
			if (curHull.length > 1) {
				edges[edges.length - 2].setAttribute({ strokeColor: "yellow" });
			}
			ret = false;
		}
		else {
			curHull.push(points[curIndex++]);
			curHull[curHull.length - 2].setAttribute({ fillColor: "yellow" });
			if (points[curIndex]) {
				points[curIndex].setAttribute({ fillColor: "yellow" });
				if (Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], points[curIndex])) == orientation) {
					curHull[curHull.length - 1].setAttribute({ fillColor: "red" });
				}
				else curHull[curHull.length - 1].setAttribute({ fillColor: "green" });
				edges.push(new Edge(curHull[curHull.length - 1], points[curIndex], { strokeColor: "yellow" }));
			}
			if (curHull.length > 2) {
				curHull[curHull.length - 3].setAttribute({ fillColor: "black" });
				if (curIndex != points.length)
					edges[edges.length - 3].setAttribute({ strokeColor: "black" });
			}

			if (curIndex == points.length) {
				curHull[curHull.length - 1].setAttribute({ fillColor: "black" });
				curHull[curHull.length - 2].setAttribute({ fillColor: "black" });
				if (curHull.length > 2) {
					curHull[curHull.length - 3].setAttribute({ fillColor: "black" });
					edges[edges.length - 2].setAttribute({ strokeColor: "black" });
				}

				edges[edges.length - 1].setAttribute({ strokeColor: "black" });


			}
			ret = true;
			
		}

		var node = new Node();
		data = { edges: [], points: [] }

		var i;
		for (i = 0; i < points.length; i++) {
			data.points.push(points[i].clone());
		}
		for (i = 0; i < edges.length; i++) {
			var j = points.indexOf(edges[i].p1)
			var p1Clone = data.points[j];
			j = points.indexOf(edges[i].getRightPoint())
			var p2Clone = data.points[j];
			data.edges.push(edges[i].clone(p1Clone, p2Clone));
		}
		node.data = data;
		parent.adopt(node);
		return ret;
	}
}