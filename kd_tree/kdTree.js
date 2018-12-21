window.onload = function () {
	var view = new KD_Tree();
	view.display();
}

function KD_Tree() {
	var kdTree = this;
	this.container;
	var graph
	var boundingBoxEdge;
	var points = [];
	var lines = [];
	var addedLine;
	var dualPoints;
	var faces = [];
	var tree = new Tree();
	var root;
	var preComputedLowerHull;
	var preComputedUpperHull;
	var lowerHull = [];
	var upperHull = [];
	var curHull, curIndex, orientation, finished;

	this.display = function (event) {
		kdTree.container = new GraphContainer("KD-Tree");

		graph = new Graph({ interactionType: 'pointGraph' },kdTree.container.graphDiv);

		var buttonContainer = kdTree.container.buttonContainer;

		var button = document.createElement('div');
		button.id = "computeKDTreeButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Create KD-Tree"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);
	}

	function transition() {

		$("#computeKDTreeButton").remove();

		var $buttonContainer = $(kdTree.container.buttonContainer);


		$quadContainer = $(document.createElement("div"));
		$buttonContainer.append($quadContainer);

		var $upperContainer = $(document.createElement("div"));
		//$upperContainer.css();
		var $lowerContainer = $(document.createElement("div"));

		backNextButtons($buttonContainer);

		createkdTree();

		updateButtons();
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
//		$recurseRightButton.on("mouseover", () => (tableLines[9].style.backgroundColor = "tan"));
//		$recurseRightButton.on("mouseout", () => (tableLines[9].style.backgroundColor = ""));
		$recurseRightButton.append(document.createTextNode("Recurse CCW"))
		$recurseDiv.append($recurseRightButton);

		$recurseLeftButton = $("<button>", { id: "recurseLeft", class: "button" });
		$recurseLeftButton.css("horizontal-align", "center");
		$recurseLeftButton.on("click", recurseLeft);
//		$recurseLeftButton.on("mouseover", () => (tableLines[10].style.backgroundColor = "tan"));
//		$recurseLeftButton.on("mouseout", () => (tableLines[10].style.backgroundColor = ""));
		$recurseLeftButton.append(document.createTextNode("Recurse "));
		$recurseLeftButton.append(document.createElement("br"));
		$recurseLeftButton.append(document.createTextNode("CW"));
		$recurseDiv.append($recurseLeftButton);

		$finishRecurseButton = $("<button>", { id: "finishRecurse", class: "button" });
		$finishRecurseButton.css("horizontal-align", "center");
		$finishRecurseButton.on("click", finishRecurse);
		$finishRecurseButton.append(document.createTextNode("Finish Recursion"))
		$container.append($finishRecurseButton);

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
		if (tree.getCurrentDepth() == 1 && tree.node.leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "gray");
			$button.off("click");
			$button.on("click", back);
		}

	}

	function createkdTree() {
		points = graph.cloneData().points;
		boundingFace = makeBoundingFace();
		boundingFace.setAttribute({
			points: { visible: false }
		});
		var dimension = 0;
		tree = new Tree();
		var root = tree.root;
		root.data = cloneData();

		var xpoints = points.slice().sort(Point.compareX);
		var ypoints = points.slice().sort(Point.compareY);

		splitFace(boundingFace, xpoints, ypoints, 0, root);

		var finishNode = new TreeNode();
		finishNode.data = cloneData();
		tree.root.adopt(finishNode);

		tree.node = root.children[0];

		graph.loadData(tree.node.data);
	}

	function splitFace(face, xpoints, ypoints, dimension, parentNode) {
		if (xpoints.length != ypoints.length) debugger;

		if (xpoints.length <= 1) {
			for (var i = 0; i < xpoints.length; ++i) {
				xpoints[i].setAttribute({ strokeColor: "Blue", fillColor: "Blue" });
			}
			face.setAttribute({ fillColor: "Blue" });

			var node = new TreeNode();
			parentNode.adopt(node);
			node.data = cloneData();

			for (var i = 0; i < xpoints.length; ++i) {
				xpoints[i].setAttribute({ strokeColor: "Black", fillColor: "Black" });
			}
			face.setAttribute({ fillColor: "White" });
			return;
		}
		var leftBotEdge, rightTopEdge;

		var diffPoint, compFn, splitPoints, otherPoints, addPoint;

		//split on x, vertical line
		if (dimension == 0) {
			diffPoint = new Point([0, 1]);
			addPoint = new Point([-.01, 0], {});
			splitPoints = xpoints;
			otherPoints = ypoints;
			compFn = Point.compareX;
		}
		//split on y, horizontal line
		else {
			diffPoint = new Point([1, 0]);
			splitPoints = ypoints;
			otherPoints = xpoints;
			compFn = Point.compareY;
		}

		splitIndex = Math.ceil((splitPoints.length - 1 )/2.0);
		splitPoint = splitPoints[splitIndex];

		var splitLine = new Edge(splitPoint, Point.add(splitPoint, diffPoint));

		newFaces = face.splitOnLine(splitLine);

		if (newFaces.length != 1) debugger;

		var leftBotFace, rightTopFace;
		if (compFn(newFaces[0].centroid() ,face.centroid()) < 0) {
			leftBotFace = newFaces[0];
			rightTopFace = face;
		}
		else {
			leftBotFace = face;
			rightTopFace = newFaces[0];
		}

		faces.push(newFaces[0]);
		var otherLeftBotPoints = [];
		var otherRightTopPoints = [];
		otherPoints.forEach(function (p) {
			if (p === splitPoints[splitIndex]) {
				otherRightTopPoints.push(p);
			}
			else
			if (compFn(p,splitPoint) < 0) {
				otherLeftBotPoints.push(p);
			}
			else {
				otherRightTopPoints.push(p);
			}
		});

		var x1Points, y1Points, x2Points, y2Points;
		if (dimension == 0) {
			x1Points = splitPoints.slice(0, splitIndex);
			y1Points = otherLeftBotPoints;
			x2Points = splitPoints.slice(splitIndex, splitPoints.length);
			y2Points = otherRightTopPoints;
		}
		else {
			x1Points = otherLeftBotPoints;
			y1Points = splitPoints.slice(0, splitIndex);
			x2Points = otherRightTopPoints;
			y2Points = splitPoints.slice(splitIndex, splitPoints.length);
		}

		var splitEdge = face.boundary.edge;

		for (var i = 0; i < xpoints.length; ++i) {
			xpoints[i].setAttribute({ strokeColor: "Blue", fillColor: "Blue" });
		}
		leftBotFace.setAttribute({ fillColor: "Blue" });
		rightTopFace.setAttribute({ fillColor: "Blue" });
		splitEdge.setAttribute({ strokeColor: "Yellow" });
		splitPoint.setAttribute({
			strokeColor: "Yellow",
			fillColor: "Yellow"
		});

		var node = new TreeNode();
		parentNode.adopt(node);
		node.data = cloneData();

		for (var i = 0; i < xpoints.length; ++i) {
			xpoints[i].setAttribute({ strokeColor: "Black", fillColor: "Black" });
		}
		leftBotFace.setAttribute({ fillColor: "White" });
		rightTopFace.setAttribute({ fillColor: "White" });
		splitEdge.setAttribute({ strokeColor: "Black" });

		var nextDimension = -dimension + 1;
		splitFace(leftBotFace, x1Points, y1Points, nextDimension, node);
		splitFace(rightTopFace, x2Points, y2Points, nextDimension, node);
	}

	function makeBoundingFace() {
		var left, right, top, bot, bbPoints;

		var bb = graph.board.getBoundingBox();
		left = bb[0];
		top = bb[1];
		right = bb[2];
		bot = bb[3];

		for (var i = 0; i < lines.length; ++i) {
			for (var j = i + 1; j < lines.length; ++j) {
				var point = Edge.intersection(lines[i], lines[j]);
				var x = point[0];
				var y = point[1];
				if (x < left)
					left = x;
				if (x > right)
					right = x;
				if (y < bot)
					bot = y;
				if (y > top)
					top = y;
			}
		}

		points.forEach(function (point) {
			if (point.x < left)
				left = point.x;
			if (point.y < bot)
				bot = point.y;
			if (point.x > right)
				right = point.right;
			if (point.y > top)
				top = point.y;
		});

		left = left - 1;
		right = right + 1;
		top = top + 1;
		bot = bot - 1;
		var dx = right - left;
		var dy = top - bot;
		dx = dx * .1;
		dy = dy * .1;
		bbPoints = [[left, top], [left, bot], [right, bot], [right, top]];
		graph.board.setBoundingBox([left - dx, top + dy, right + dx, bot - dy]);
		var face = new Face(bbPoints, {});
		faces.push(face);
		return face;
	}

	function nextBoundaryHalfEdge(halfEdge) {
		var nextEdge = halfEdge.next;
		if (nextEdge.twin)
			nextEdge = nextEdge.twin.next;
		return nextEdge;
	}

	function cloneData() {
		var i;
		var data = { edges: [], points: [], faces: [] };

		for (i = 0; i < points.length; ++i) {
			data.points.push(points[i].clone());
		}

		if (addedLine) {
			data.points.push(addedLine.p1);
			data.points.push(addedLine.p2);
			data.edges.push(addedLine);
		}

		for (i = 0; i < faces.length; ++i) {
			var face = faces[i];
			var boundary = face.boundary;
			var halfEdge = boundary.next;
			if (boundary.target.copy == null) {
				boundary.target.copy = boundary.target.clone();
			}
			boundary.copy = new HalfEdge(null, boundary.target.copy, null);
			var prevHE = boundary;

			while (halfEdge != boundary) {
				if (halfEdge.target.copy == null) {
					halfEdge.target.copy = halfEdge.target.clone();
				}
				if (halfEdge.edge.copy == null) {
					halfEdge.edge.copy = halfEdge.edge.clone(halfEdge.prev.copy.target, halfEdge.target.copy);
				}
				halfEdge.copy = new HalfEdge(null, halfEdge.target.copy, halfEdge.edge.copy);
				halfEdge.copy.prev = prevHE.copy;
				prevHE.copy.next = halfEdge.copy;

				prevHE = halfEdge;
				halfEdge = halfEdge.next;
			}

			boundary.copy.prev = prevHE.copy;
			prevHE.copy.next = boundary.copy;
			if (boundary.edge.copy == null) {
				boundary.edge.copy = boundary.edge.clone(boundary.copy.prev.target, boundary.copy.target);
			}
			boundary.copy.edge = boundary.edge.copy;

			data.faces.push(new Face(boundary.copy, boundary.face.attr));
		}

		for (i = 0; i < faces.length; ++i) {
			var face = faces[i];
			var boundary = face.boundary;
			boundary.target.copy = null;
			boundary.edge.copy = null;
			boundary.copy = null;
			var halfEdge = boundary.next;
			while (halfEdge != boundary) {
				halfEdge.edge.copy = null;
				halfEdge.target.copy = null;
				halfEdge.copy = null;
				halfEdge = halfEdge.next;
			}
		}

		return data;
	}
}