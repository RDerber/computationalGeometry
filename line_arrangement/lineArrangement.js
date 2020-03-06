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
	var tableLines = [];

	this.display = function (event) {
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
                ["Line Arrangement",
                    "for each line L:",
                    "  find left most face F containing the line L",
                    "  for each line that comes before L:",
                    "    traverse bounding of face F to find an edge intersecting line L",
                    "    break face F into smaller faces",
                    "    find next face"];

        var line = lines[0];
        var row = table.insertRow();

        var l = row.insertCell();
        var r = row.insertCell();
        var text = row.insertCell();
        text.style.padding = 0;
        text.style.margin = 0;
        text.style.textDecoration = "underline";
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

		lineArrangement.container = new GraphContainer("Line Arrangement Construction", [], desc);

		var attr = { interactionType: "pointGraph" };

		graph = new Graph({ interactionType: 'lineGraph' },lineArrangement.container.graphDiv);

		var buttonContainer = lineArrangement.container.buttonContainer;

		var button = document.createElement('div');
		button.id = "computeLineArrangementButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Create Line Arrangement"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		/*var tutorial = document.createElement('div');
		tutorial.id = "tutorial";
		tutorial.classList.add("tutorial");
		var text1 = document.createElement('div');
		text1.classList.add('subtutorial');
		text1.appendChild(document.createTextNode('1. Click in the left panel to add segments (each two consecutive points define a segment), or use the Random Lines button.'));
		tutorial.appendChild(text1);
		var text2 = document.createElement('div');
		text2.classList.add('subtutorial');
		text2.appendChild(document.createTextNode('2. Click Create Line Arrangement button.'));
		tutorial.appendChild(text2);
		buttonContainer.appendChild(tutorial);*/

		var text1 = "1. Click in the left panel to add segments (each two consecutive points define a segment), or use the Random Lines button.";
		var text2 = "2. Click Create Line Arrangement button."

		graph.createTutorial(-3, 4, text1);
		graph.createTutorial(-3, 3, text2);
	}

	function transition() {

		graph.freeze();

		$("#computeLineArrangementButton").remove();
		$("#tutorial").remove();

		var $buttonContainer = $(lineArrangement.container.buttonContainer);

		var $lineContainer = $(document.createElement("div"));
		$lineContainer.css("display", "flex");
		var $lineHeader = $(document.createElement("div"));
		$lineHeader.css("display", "flex");
		var $faceContainer = $(document.createElement("div"));
		$faceContainer.css("display", "flex");
		var $faceHeader = $(document.createElement("div"));
		$faceHeader.css("display", "flex");
		var $halfEdgeContainer = $(document.createElement("div"));
		$halfEdgeContainer.css("display", "flex");
		var $halfEdgeHeader = $(document.createElement("div"));
		$halfEdgeHeader.css("display", "flex");

		$buttonContainer.append($lineHeader);
		$buttonContainer.append($lineContainer);
		$buttonContainer.append($faceHeader);
		$buttonContainer.append($faceContainer);
		$buttonContainer.append($halfEdgeHeader);
		$buttonContainer.append($halfEdgeContainer);

		var $linedes = $(document.createElement("div"));
		$linedes.append(document.createTextNode("Lines are ordered by construction time."));
		$lineHeader.append($linedes);

		var $prevLineButton = $("<div>", { id: "prevLineButton", class: "button" });
		$prevLineButton.css("horizontal-align", "center");
		$prevLineButton.on("click", prevLine);
		$prevLineText = $(document.createElement("div"));
		$prevLineText.addClass("button-content");
		$prevLineText.append(document.createTextNode("Prev Line"))
		$prevLineButton.append($prevLineText);
		$lineContainer.append($prevLineButton);
		
		var $nextLineButton = $("<div>", { id: "nextLineButton", class: "button" });
		$nextLineButton.css("horizontal-align", "center");
		$nextLineButton.on("click", nextLine);
		$nextLineText = $(document.createElement("div"));
		$nextLineText.addClass("button-content");
		$nextLineText.append(document.createTextNode("Next Line"))
		$nextLineButton.append($nextLineText);
		$lineContainer.append($nextLineButton);

		var $facedes = $(document.createElement("div"));
		$facedes.append(document.createTextNode("From leftmost to rightmost cut by current line."));
		$faceHeader.append($facedes);

	
		var $prevFaceButton = $("<div>", { id: "prevFaceButton", class: "button" });
		$prevFaceButton.css("horizontal-align", "center");
		$prevFaceButton.on("click", prevFace);
		$prevFaceText = $(document.createElement("div"));
		$prevFaceText.addClass("button-content");
		$prevFaceText.append(document.createTextNode("Prev Face"))
		$prevFaceButton.append($prevFaceText);
		$faceContainer.append($prevFaceButton);

		var $nextFaceButton = $("<div>", { id: "nextFaceButton", class: "button" });
		$nextFaceButton.css("horizontal-align", "center");
		$nextFaceButton.on("click", nextFace);
		$nextFaceButton.on("mouseover", () => {tableLines[2].style.backgroundColor = "tan";});
		$nextFaceButton.on("mouseout", () => {tableLines[2].style.backgroundColor = "";});
		$nextFaceText = $(document.createElement("div"));
		$nextFaceText.addClass("button-content");
		$nextFaceText.append(document.createTextNode("Next Face"))
		$nextFaceButton.append($nextFaceText);
		$faceContainer.append($nextFaceButton);

		var $halfedgedes = $(document.createElement("div"));
		$halfedgedes.append(document.createTextNode("Boundary of current face in counter clockwise order."));
		$halfEdgeHeader.append($halfedgedes);

		var $prevHalfEdgeButton = $("<div>", { id: "prevHalfEdgeButton", class: "button" });
		$prevHalfEdgeButton.css("horizontal-align", "center");
		$prevHalfEdgeButton.on("click", prevHalfEdge);
		$prevHalfEdgeText = $(document.createElement("div"));
		$prevHalfEdgeText.addClass("button-content");
		$prevHalfEdgeText.append(document.createTextNode("Prev HalfEdge"))
		$prevHalfEdgeButton.append($prevHalfEdgeText);
		$halfEdgeContainer.append($prevHalfEdgeButton);

		var $nextHalfEdgeButton = $("<div>", { id: "nextHalfEdgeButton", class: "button" });
		$nextHalfEdgeButton.css("horizontal-align", "center");
		$nextHalfEdgeButton.on("click", nextHalfEdge);
		$nextHalfEdgeButton.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
		$nextHalfEdgeButton.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		$nextHalfEdgeText = $(document.createElement("div"));
		$nextHalfEdgeText.addClass("button-content");
		$nextHalfEdgeText.append(document.createTextNode("Next HalfEdge"))
		$nextHalfEdgeButton.append($nextHalfEdgeText);
		$halfEdgeContainer.append($nextHalfEdgeButton);

		createLineArrangement();
		updateButtons();

		// Description Container
		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var yellowdashline = new desContainer("yellowdashedge.jpeg","Current line.",DesContainer);
		var blueface = new desContainer("lightblue.jpeg","Face which includes yellow dash line.",DesContainer);
		var yellowsolidedge = new desContainer("yellowedge.jpeg"," Boundary of purple face.",DesContainer);
	
		$buttonContainer.append($(DesContainer));
	}

	function prevLine() {
		tree.moveToDepthForLA(1);
		tree.moveLeft(); 
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextLine() {
		var d = tree.getCurrentDepth();
		tree.moveToDepthForLA(1);
		if(d >= 1)
			tree.moveRight();

		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function prevFace() {
		tree.moveToDepthForLA(2);
		tree.moveLeft();
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextFace() {
		var d = tree.getCurrentDepth();
		tree.moveToDepthForLA(2);
		if (d >= 2)
			tree.moveRight();
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function prevHalfEdge() {
		tree.moveToDepthForLA(3);
		tree.moveLeft();
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextHalfEdge() {
		var d = tree.getCurrentDepth();
		if (d < 3) {
			tree.moveToDepthForLA(3);
		}
		else {
			tree.moveToDepthForLA(3);
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
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", prevLine);
		}

		$button = $("#nextLineButton");
		if (tree.atDepthLeft(1).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", nextLine);
		}

		$button = $("#prevFaceButton");
		if (tree.atDepthLeft(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", prevFace);
		}

		$button = $("#nextFaceButton");
		if (tree.atDepthLeft(2).rightSibling == null && tree.getCurrentDepth() >= 2) {
			$button.css("background-color", "lightgray");
			$button.off();
			$button.on("mouseover", () => {tableLines[2].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[2].style.backgroundColor = "";});
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", nextFace);
			$button.on("mouseover", () => {tableLines[2].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[2].style.backgroundColor = "";});
		}

		$button = $("#prevHalfEdgeButton");
		if (tree.atDepthLeft(3).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", prevHalfEdge);
		}

		$button = $("#nextHalfEdgeButton");
		if (tree.atDepthLeft(3).rightSibling == null && tree.getCurrentDepth() >= 3) {
			$button.css("background-color", "lightgray");
			$button.off();
			$button.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan"});
			$button.on("mouseout", () => {tableLines[4].style.backgroundColor = ""});
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", nextHalfEdge);
			$button.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan"});
			$button.on("mouseout", () => {tableLines[4].style.backgroundColor = ""});
		}
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
		var dx = right - left;
		var dy = top - bot;
		dx = dx * .1;
		dy = dy * .1;
		bbPoints = [[left, top], [left, bot], [right, bot], [right, top]];
		graph.board.setBoundingBox([left - dx, top + dy, right + dx, bot - dy]);
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
}