window.onload = function () {
	var view = new lineArrangement();
	view.display();
}

function lineArrangement() {
	var lineArrangement = this;
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
		lineArrangement.container = new GraphContainer("Line Arrangement Construction");

		var attr = { interactionType: "pointGraph" };

		graph = new Graph({ interactionType: 'lineGraph' },lineArrangement.container.graphDiv);

		var buttonContainer = document.createElement('div');
		buttonContainer.id = "buttonContainer";
		buttonContainer.style = "display: inline-block; vertical-align: top; text-align: center";
		lineArrangement.container.contentRow.appendChild(buttonContainer);

		var button = document.createElement('div');
		button.id = "computeLineArrangementButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Create Line Arrangement"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		random($(lineArrangement.container.graphCol));
	}

	function transition() {

		graph.freeze();

		$("#computeLineArrangementButton").remove();

		var $buttonContainer = $("#buttonContainer");

		var $lineContainer = $(document.createElement("div"));
		var $faceContainer = $(document.createElement("div"));
		var $halfEdgeContainer = $(document.createElement("div"));

		$buttonContainer.append($lineContainer);
		$buttonContainer.append($faceContainer);
		$buttonContainer.append($halfEdgeContainer);

		var $prevLineButton = $("<div>", { id: "prevLineButton", class: "button-inline" });
		$prevLineButton.css("horizontal-align", "center");
		$prevLineButton.on("click", prevLine);
		$prevLineText = $(document.createElement("div"));
		$prevLineText.addClass("button-content");
		$prevLineText.append(document.createTextNode("Prev Line"))
		$prevLineButton.append($prevLineText);
		$lineContainer.append($prevLineButton);

		var $nextLineButton = $("<div>", { id: "nextLineButton", class: "button-inline" });
		$nextLineButton.css("horizontal-align", "center");
		$nextLineButton.on("click", nextLine);
		$nextLineText = $(document.createElement("div"));
		$nextLineText.addClass("button-content");
		$nextLineText.append(document.createTextNode("Next Line"))
		$nextLineButton.append($nextLineText);
		$lineContainer.append($nextLineButton);

		var $prevFaceButton = $("<div>", { id: "prevFaceButton", class: "button-inline" });
		$prevFaceButton.css("horizontal-align", "center");
		$prevFaceButton.on("click", prevFace);
		$prevFaceText = $(document.createElement("div"));
		$prevFaceText.addClass("button-content");
		$prevFaceText.append(document.createTextNode("Prev Face"))
		$prevFaceButton.append($prevFaceText);
		$faceContainer.append($prevFaceButton);

		var $nextFaceButton = $("<div>", { id: "nextFaceButton", class: "button-inline" });
		$nextFaceButton.css("horizontal-align", "center");
		$nextFaceButton.on("click", nextFace);
		$nextFaceText = $(document.createElement("div"));
		$nextFaceText.addClass("button-content");
		$nextFaceText.append(document.createTextNode("Next Face"))
		$nextFaceButton.append($nextFaceText);
		$faceContainer.append($nextFaceButton);

		var $prevHalfEdgeButton = $("<div>", { id: "prevHalfEdgeButton", class: "button-inline" });
		$prevHalfEdgeButton.css("horizontal-align", "center");
		$prevHalfEdgeButton.on("click", prevHalfEdge);
		$prevHalfEdgeText = $(document.createElement("div"));
		$prevHalfEdgeText.addClass("button-content");
		$prevHalfEdgeText.append(document.createTextNode("Prev HalfEdge"))
		$prevHalfEdgeButton.append($prevHalfEdgeText);
		$halfEdgeContainer.append($prevHalfEdgeButton);

		var $nextHalfEdgeButton = $("<div>", { id: "nextHalfEdgeButton", class: "button-inline" });
		$nextHalfEdgeButton.css("horizontal-align", "center");
		$nextHalfEdgeButton.on("click", nextHalfEdge);
		$nextHalfEdgeText = $(document.createElement("div"));
		$nextHalfEdgeText.addClass("button-content");
		$nextHalfEdgeText.append(document.createTextNode("Next HalfEdge"))
		$nextHalfEdgeButton.append($nextHalfEdgeText);
		$halfEdgeContainer.append($nextHalfEdgeButton);

		createLineArrangement();
		updateButtons();
	}

	function prevLine() {
		tree.moveToDepth(1);
		tree.moveLeft(); 
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextLine() {
		var d = tree.getCurrentDepth();
		tree.moveToDepth(1);
		if(d >= 1)
			tree.moveRight();

		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function prevFace() {
		tree.moveToDepth(2);
		tree.moveLeft();
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextFace() {
		var d = tree.getCurrentDepth();
		tree.moveToDepth(2);
		if (d >= 2)
			tree.moveRight();
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function prevHalfEdge() {
		tree.moveToDepth(3);
		tree.moveLeft();
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextHalfEdge() {
		var d = tree.getCurrentDepth();
		if (d < 3) {
			tree.moveToDepth(3);
		}
		else {
			tree.moveToDepth(3);
			tree.moveRight();
		}
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function updateButtons() {
		var d = tree.getCurrentDepth();
		var $button;
		$button = $("prevLineButton");
		if (tree.atDepthLeft(1).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", prevLine);
		}

		$button = $("#nextLineButton");
		if (tree.atDepthLeft(1).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", nextLine);
		}

		$button = $("#prevFaceButton");
		if (tree.atDepthLeft(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", prevFace);
		}

		$button = $("#nextFaceButton");
		if (tree.atDepthLeft(2).rightSibling == null && tree.getCurrentDepth() >= 2) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", nextFace);
		}

		$button = $("#prevHalfEdgeButton");
		if (tree.atDepthLeft(3).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", prevHalfEdge);
		}

		$button = $("#nextHalfEdgeButton");
		if (tree.atDepthLeft(3).rightSibling == null && tree.getCurrentDepth() >= 3) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", nextHalfEdge);
		}
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


	function createLineArrangement() {

		lines = graph.cloneData().edges;
		boundingBoxEdge = makeBoundingFace().boundary;
		tree = new Tree();
		root = tree.root;
		root.data = cloneData();
		for (var i = 0; i < lines.length; ++i) {

			addLine(lines[i]);
		}
		graph.loadData({ faces: faces });
	}

	function addLine(line, parent) {
		addedLine = line;
		var halfEdge;
		var boundary1 = boundingBoxEdge;
		while (!Edge.lineEdgeIntersect(line, boundary1.edge))
			boundary1 = nextBoundaryHalfEdge(boundary1);
		var boundary2 = nextBoundaryHalfEdge(boundary1);
		while (!Edge.lineEdgeIntersect(line, boundary2.edge))
			boundary2 = nextBoundaryHalfEdge(boundary2);
		var leftBoundary, rightBoundary;
		if (Edge.lineEdgeIntersect(line, boundary2.edge) < Edge.lineEdgeIntersect(line, boundary1.edge)) {
			leftBoundary = boundary2;
			rightBoundary = boundary1;
		}
		else {
			leftBoundary = boundary1;
			rightBoundary = boundary2;
		}


		halfEdge = leftBoundary;
		var p1, p2;
		p1 = new Point(Edge.lineEdgeIntersect(line, leftBoundary.edge), null, true);
		p2 = new Point(Edge.lineEdgeIntersect(line, rightBoundary.edge), null, true);
		addedLine = new Edge(p1, p2, { dash: 2, strokeColor: 'yellow' });

		var lineNode = new TreeNode();
		lineNode.data = cloneData();
		root.adopt(lineNode);

		var half1 = halfEdge;
		var half2;
		var point = new Point(Edge.intersection(line, half1.edge));
		half1 = half1.split(point);
		half1.edge.setAttribute({ strokeColor: 'yellow' });


		while (half1) {
			var faceNode = new TreeNode();
			half1.face.setAttribute({ fillColor: "blue" });
			faceNode.data = cloneData();
			lineNode.adopt(faceNode);

			var oppositeHalf = half1;
			oppositeHalf.edge.setAttribute({ strokeColor: 'yellow' });
			var edgeNode = new TreeNode();
			edgeNode.data = cloneData();
			faceNode.adopt(edgeNode);
			oppositeHalf.edge.setAttribute({ strokeColor: 'black' })
			oppositeHalf = oppositeHalf.next;
			
			while (!Edge.lineEdgeIntersect(line, oppositeHalf.edge)) {
				oppositeHalf.edge.setAttribute({ strokeColor: 'yellow' });
				edgeNode = new TreeNode();
				edgeNode.data = cloneData();
				faceNode.adopt(edgeNode);
				oppositeHalf.edge.setAttribute({ strokeColor: 'black' })
				oppositeHalf = oppositeHalf.next;
			}

			oppositeHalf.edge.setAttribute({ strokeColor: 'yellow' });
			edgeNode = new TreeNode();
			edgeNode.data = cloneData();
			faceNode.adopt(edgeNode);

			var oppositePoint = new Point(Edge.intersection(line, oppositeHalf.edge));

			var temp = oppositeHalf.split(oppositePoint);
			if (temp != oppositeHalf) debugger;

			half2 = half1.prev;
			var op2 = oppositeHalf;
			var op1 = op2.prev;

			var splitEdge = new Edge(point, oppositePoint);
			var split1 = new HalfEdge(half1.face, point, splitEdge);
			var split2 = new HalfEdge(null, oppositePoint, splitEdge);
			split1.twin = split2;
			split2.twin = split1;

			op1.next = split1;
			split1.prev = op1;
			split1.next = half1;
			half1.prev = split1;

			half2.next = split2;
			split2.prev = half2;
			split2.next = op2;
			op2.prev = split2;

			half1.face.boundary = half1;
			
			faces.push(new Face(half2, half1.face.attr));

			//debug
			if (half1.prev != split1) debugger;
			if (op1.next != split1) debugger;
			if (split1.next != half1) debugger;
			if (split1.prev != op1) debugger;
			if (half2.next != split2) debugger;
			if (split2.prev != half2) debugger;
			if (split2.next != op2) debugger;
			if (op2.prev != split2) debugger;
			if (op1.face == op2.face) debugger;
			if (half1.face == half2.face) debugger;
			if (op1.twin) {
				if (op1.twin.prev != op2.twin) debugger;
				if (op1.twin.face != op2.twin.face) debugger;
				if (op1.edge != op1.twin.edge) debugger;
				if (op2.edge != op2.twin.edge) debugger;
			}
			if (split1.face == split2.face) debugger;
			if (split1.edge != split2.edge) debugger;
			if (split1.twin != split2) debugger;
			if (split2.twin != split1) debugger;
			//end debug

			//move to next face
			half1.face.setAttribute({ fillColor: 'green' });
			half2.face.setAttribute({ fillColor: 'green' });
			half1.edge.setAttribute({ strokeColor: 'black' });
			op2.edge.setAttribute({ strokeColor: 'black' });
			op1.edge.setAttribute({ strokeColor: 'black' });
			half1 = op1.twin;
			point = oppositePoint;
		}
		addedLine = null;
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
		left = left - 1;
		right = right + 1;
		top = top + 1;
		bot = bot - 1;
		bbPoints = [[left, top], [left, bot], [right, bot], [right, top]];
		graph.board.setBoundingBox([left, top, right, bot]);
		var face = new Face(bbPoints);
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

	function addRandomPoints(event) {
		graph.addRandomPoints($("#randomInput").val());
	}
}