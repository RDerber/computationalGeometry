﻿window.onload = function () {
	var view = new grahamScan();
	view.displayConvexHull();
}

function grahamScan() {
	var grahamScan = this;
	this.container;
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
	var tableLines = [];

	this.displayConvexHull = function (event) {
		var desc = document.createElement("div");
		desc.style.whiteSpace = "pre";

		var table = document.createElement("table");
		table.style.tableLayout = "fixed";
		table.style.fontSize = "small";
		table.style.borderCollapse = "collapse";
		desc.appendChild(table);
		var lines =
["GrahamScan",
"------------------- ",
"sort points on x",
"add leftmost point to lowerHull",
"for each point:",
"   while size(lowerHull) >= 1 && wrong angular orientation",
"		pop rightmost point off of lowerHull",
"   push point onto lowerHull",
"repeat with upperHull",
				"----------------"]

		for (var i = 0; i < lines.length; ++i) {
			var line = lines[i];
			var row = table.insertRow()
			
			var l = row.insertCell();
			var r = row.insertCell();
			var text = row.insertCell();
			text.style.padding = 0;
			text.style.margin = 0;
			tableLines.push(text);
			text.appendChild(document.createTextNode(line));
		};
		var key = [{ type: "point", color: "darkorchid", text: "wrong orientation" }, { type: "point", color: "lime", text: "right orientation" }, { type: "dotted-line", color: "black", text: "possible hull edges" }]
		grahamScan.container = new GraphContainer("Graham Scan", [], desc);

		var attr= { interactionType: "pointGraph" };

		graph = new Graph(attr, grahamScan.container.graphDiv);

		var buttonContainer = grahamScan.container.buttonContainer;

		var button = document.createElement('div');
		button.id = "computeHullButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Compute Convex Hull"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		/*var tutorial = document.createElement('div');
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
		buttonContainer.appendChild(tutorial);*/

		var text1 = "1. Click in the left panel to place new points, or use the Random Points button.";
		var text2 = "2. Click Compute Convex Hull button."

		graph.createTutorial(-3, 4, text1);
		graph.createTutorial(-3, 3, text2);
	}

	function transition() {
		if (graph.points.length < 3) return;

		graph.freeze();

		points = graph.cloneData().points;

		computeConvexHull();

		var $buttonContainer = $(grahamScan.container.buttonContainer);
		$("#computeHullButton").remove();
		$("#tutorial").remove();

		var $hullContainer = $("<div>");
		$hullContainer.css("display", "flex");

		var $lowerButton = $("<div>", { id: "lowerButton", class: "button" });
		$lowerButton.on("click", startLowerHull);
		var $lowerText = $('<div>', { class: "button-content" });
		$lowerText.append(document.createTextNode("Lower Hull"));
		$lowerButton.append($lowerText);
		$hullContainer.append($lowerButton);

		var $upperButton = $("<div>", { id: "upperButton", class: "button" });
		$upperButton.on("click", startUpperHull);
		var $upperText = $('<div>', {class: "button-content"});
		$upperText.append(document.createTextNode("Upper Hull"));
		$upperButton.append($upperText);
		$hullContainer.append($upperButton);

		$buttonContainer.append($hullContainer);

		var outerLoopContainer = document.createElement("div");
		outerLoopContainer.className = "loop"
		var outerdes = document.createElement("div");
		outerdes.className = "loopdes";
		outerdes.appendChild(document.createTextNode("Outer Loop: Find next leftmost point in remaining points set."));
		outerLoopContainer.appendChild(outerdes);
		var $outerLoopContainer = $("<div>");
		outerLoopContainer.appendChild($outerLoopContainer[0]);
		$outerLoopContainer.css("display", "flex");

		var $outerBackButton = $("<div>", { id: "outerBackButton", class: "button" });
		$outerBackButton.on("click", moveLeftOuterLoop);
		$outerBackButton.on("mouseover", () => (tableLines[4].style.backgroundColor = "tan"));
		$outerBackButton.on("mouseout", () => (tableLines[4].style.backgroundColor = ""));
		var $outerBackText = $('<div>', { class: "button-content" });
		$outerBackText.append(document.createTextNode("Back"));
		$outerBackButton.append($outerBackText);
		$outerLoopContainer.append($outerBackButton);

		var $outerForwardButton = $("<div>", { id: "outerForwardButton", class: "button" });
		$outerForwardButton.on("click", moveRightOuterLoop);
		$outerForwardButton.on("mouseover", () => (tableLines[4].style.backgroundColor = "tan"));
		$outerForwardButton.on("mouseout", () => (tableLines[4].style.backgroundColor = ""));
		var $outerForwardText = $('<div>', { class: "button-content" });
		$outerForwardText.append(document.createTextNode("Next"));
		$outerForwardButton.append($outerForwardText);
		$outerLoopContainer.append($outerForwardButton);

		$buttonContainer.append($(outerLoopContainer));

		var innerLoopContainer = document.createElement("div");
		innerLoopContainer.className = "loop"
		var innerdes = document.createElement("div");
		innerdes.className = "loopdes";
		innerdes.appendChild(document.createTextNode("Inner Loop: check the orientation of last three points of current convex hull."));
		innerLoopContainer.appendChild(innerdes);

		var $innerLoopContainer = $("<div>");
		$innerLoopContainer.css("display", "flex");
		innerLoopContainer.appendChild($innerLoopContainer[0]);

		var $innerBackButton = $("<div>", { id: "innerBackButton", class: "button" });
		$innerBackButton.on("click", moveLeftInnerLoop);
		$innerBackButton.on("mouseover", () => (tableLines[5].style.backgroundColor = "tan"));
		$innerBackButton.on("mouseout", () => (tableLines[5].style.backgroundColor = ""));
		var $innerBackText = $('<div>', { class: "button-content" });
		$innerBackText.append(document.createTextNode("Back"));
		$innerBackButton.append($innerBackText);
		$innerLoopContainer.append($innerBackButton);

		var $innerForwardButton = $("<div>", { id: "innerForwardButton", class: "button" });
		$innerForwardButton.on("click", moveRightInnerLoop);
		$innerForwardButton.on("mouseover", () => (tableLines[5].style.backgroundColor = "tan"));
		$innerForwardButton.on("mouseout", () => (tableLines[5].style.backgroundColor = ""));
		var $innerForwardText = $('<div>', { class: "button-content" });
		$innerForwardText.append(document.createTextNode("Next"));
		$innerForwardButton.append($innerForwardText);
		$innerLoopContainer.append($innerForwardButton);

		$buttonContainer.append($(innerLoopContainer));

		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var red = new desContainer("redpoint.jpeg","Lying on the current Upper Hull.",DesContainer);
		var blue = new desContainer("bluepoint.jpeg","Lying on the current Lower Hull.",DesContainer);
		var purple = new desContainer("purplepoint.jpeg","Second to last point if the orientation is incorrect. ",DesContainer);
		var green = new desContainer("greenpoint.jpeg","Second to last point if the orientation is correct.",DesContainer);

		$buttonContainer.append($(DesContainer));

		updateButtons();

		/*tree.node = tree.root;
		while (tree.node.children.length > 0) tree.moveDown();
		
		graph.reset();
		graph.addObjects(tree.node.data);
		graph.board.removeEventHandlers();*/
	}

	function moveLeftOuterLoop(event) {
		tree.node = tree.moveToDepth(2);
		tree.moveLeft();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveRightOuterLoop(event) {
		tree.node = tree.moveToDepth(2);
		tree.moveRight();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveRightInnerLoop(event) {
		tree.node = tree.moveToDepth(3);
		tree.moveRight();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveLeftInnerLoop(event) {
		tree.node = tree.moveToDepth(3);
		tree.moveLeft();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function startUpperHull(){
		tree.node = tree.root.children[1];
		while (tree.node.children.length > 0)
			tree.node = tree.node.children[0];

		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function startLowerHull() {
		tree.node = tree.root.children[0];
		while (tree.node.children.length > 0)
			tree.node = tree.node.children[0];

		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function updateButtons() {
		var $button;
		$button = $("#outerForwardButton");
		if (tree.moveToDepth(2).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", moveRightOuterLoop);
		}

		$button = $("#outerBackButton");
		if (tree.moveToDepth(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", moveLeftOuterLoop);
		}

		$button = $("#innerForwardButton");
		if (tree.moveToDepth(3).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", moveRightInnerLoop);
		}

		$button = $("#innerBackButton");
		if (tree.moveToDepth(3).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", moveLeftInnerLoop);
		}

	}

	function lowerHullSetup() {
		points.sort(Point.compareX);
		points[0].setAttribute({ fillColor: "blue", strokeColor: "blue" });
		lowerHull.push(points[0]);

		curHull = lowerHull;
		preComputedHalfHull = preComputedLowerHull;
		orientation = -1;
		curIndex = 1;
	}

	function upperHullSetup() {
		points[0].setAttribute({ fillColor: "red", strokeColor: "red" });
		upperHull.push(points[0]);

		orientation = 1;
		curIndex = 1;
		curHull = upperHull;
		preComputedHalfHull = preComputedUpperHull;

	}

	function computeConvexHull() {
		root = new TreeNode();
		tree.root = root;
		tree.node = root;
		var lowNode = new TreeNode();
		lowerHullSetup();
		while (curIndex < points.length) nextPoint(lowNode);

		upperHullSetup();

		var hiNode = new TreeNode();

		while (curIndex < points.length) nextPoint(hiNode);
		root.adopt(lowNode);
		root.adopt(hiNode);
	}

	function nextPoint(parent) {
		var node = new TreeNode();
		parent.adopt(node);

		var start = new TreeNode();
		start.data = cloneData();

		data = { edges: [], points: [] }
		edges.push(new Edge(curHull[curHull.length - 1], points[curIndex], { dash: 2 }));

		colorPointOfInterest();
		var next = new TreeNode();
		next.data = cloneData();
		edges[edges.length-1].setAttribute({ dash: 0 });
		decolorPointOfInterest();
		node.adopt(start);		
		node.adopt(next);


		while (!curHullBaseStep(node));
	}

	function curHullBaseStep(parent) {
		var ret;
		if (curHull.length > 1 && Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], points[curIndex])) == orientation) {
			var removed = curHull.pop();
			if(lowerHull.includes(removed)){
				removed.setAttribute({ fillColor: "blue", strokeColor: "blue" });
			}
			else
			    removed.setAttribute({ fillColor: "black", strokeColor: "black" });
			edges.pop();
			edges.pop();
			edges.push(new Edge(curHull[curHull.length - 1], points[curIndex], {dash: 2}));
			ret = false;
		}
		else {
			colormodify(points[curIndex]);
			edges[edges.length - 1].setAttribute({ dash: 0 });
			curHull.push(points[curIndex++]);
			return true;
		}

		colorPointOfInterest();

		var node = new TreeNode();
		node.data = cloneData();
		decolorPointOfInterest();
		edges[edges.length - 1].setAttribute({ dash: 0 });
		parent.adopt(node);
		return ret;
	}

	function decolorPointOfInterest() {
		if (curIndex < points.length && curHull.length > 1) {
			//curHull[curHull.length - 1].setAttribute({ fillColor: "black", strokeColor: "black" });
			colormodify(curHull[curHull.length - 1]);
		}
	}

	function colorPointOfInterest() {
		if (curIndex < points.length && curHull.length > 1) {
			if (Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], points[curIndex])) == orientation) {
				curHull[curHull.length - 1].setAttribute({ fillColor: "darkorchid", strokeColor: "darkorchid" });
			    colormodify(points[curIndex]);
			}
			else {
				curHull[curHull.length - 1].setAttribute({ fillColor: "Lime", strokeColor: "Lime" });
				colormodify(points[curIndex]);
			}
		}
	}

	function cloneData() {
		var i;
		var data = {edges: [], points: []};
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
	function colormodify(point){
		if(orientation>0) point.setAttribute({ fillColor: "red", strokeColor: "red" });
		else point.setAttribute({ fillColor: "blue", strokeColor: "blue" });
	}
}