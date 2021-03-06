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


	this.displayConvexHull = function (event) {
		grahamScan.container = new GraphContainer("Graham Scan");

		var attr= { interactionType: "pointGraph" };

		graph = new Graph(attr, grahamScan.container.graphDiv);

		var buttonContainer = grahamScan.container.buttonCol;

		var button = document.createElement('div');  // computeConvexHull button 
		button.id = "computeHullButton";
		button.classList.add("button");

		var buttontext = document.createElement('div'); // textnode of computeConvexHull button
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Compute Convex Hull"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition); // click event
		buttonContainer.appendChild(button);

		random($(grahamScan.container.graphCol)); // design add how many random points
	}

	function transition() {  // click "compute convexhull "button function
		if (graph.points.length < 3) return;

		graph.freeze();

		points = graph.cloneData().points;

		computeConvexHull();

		var $buttonContainer = $(grahamScan.container.buttonCol);
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

		$buttonContainer.append($hullContainer); // append to buttonContainer

		//var $outerLoopContainer = $("<div>");
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

		$buttonContainer.append($outerLoopContainer); // append to buttonContainer

        // innerLoopContainer
		var $innerLoopContainer = $("<div>");     
		$innerLoopContainer.append($("<div>").append(document.createTextNode("Inner Loop"))); // textnode innerloop

		var $innerBackButton = $("<div>", { id: "innerBackButton", class: "button-inline" });
		$innerBackButton.on("click", moveLeftInnerLoop);  // click event moveLeftInnerLoop
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

        // Description 
		var loopContainer = document.createElement('div');
		loopContainer.className = "des";
		var outloopdiv = document.createElement('div');
		outloopdiv.appendChild(document.createTextNode("Outer Loop: find the next point maximize the convex angle."));
		var innerloopdiv = document.createElement('div');
		innerloopdiv.appendChild(document.createTextNode("Inner Loop: check the orientation of last three points."));

		loopContainer.appendChild(outloopdiv);
		loopContainer.appendChild(innerloopdiv);
		$buttonContainer.append($(loopContainer));


		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var red = new desContainer("redpoint.jpeg","Lying on the current Upper Hull.",DesContainer);
		var blue = new desContainer("bluepoint.jpeg","Lying on the current Lower Hull.",DesContainer);
		var purple = new desContainer("purplepoint.jpeg","The last second point of current hull, which means the orientation of last three points is opposite to the orientation of current ConvexHull. ",DesContainer);
		var green = new desContainer("greenpoint.jpeg","The last second point of current hull, which means the orientation of last three points is same as the orientation of current ConvexHull.",DesContainer);

		$buttonContainer.append($(DesContainer));

		
		tree.node = tree.root;
		while (tree.node.children.length > 0) tree.moveDown();
		updateButtons();
		graph.reset();
		graph.addObjects(tree.node.data);
		graph.board.removeEventHandlers();
	}

	function random($parentElement) { // add random points

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

	function moveLeftOuterLoop(event) {
		tree.node = tree.atDepth(2);
		tree.moveLeft();
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
		tree.moveRight();
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function moveLeftInnerLoop(event) {
		tree.node = tree.atDepth(3);
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
		if (tree.atDepth(2).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", moveRightOuterLoop);
		}

		$button = $("#outerBackButton");
		if (tree.atDepth(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", moveLeftOuterLoop);
		}

		$button = $("#innerForwardButton");
		if (tree.atDepth(3).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", moveRightInnerLoop);
		}

		$button = $("#innerBackButton");
		if (tree.atDepth(3).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
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
		upperHull.push(points[0]);
        points[0].setAttribute({ fillColor: "red", strokeColor: "red" });
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
		edges.push(new Edge(curHull[curHull.length - 1], points[curIndex]));

		colorPointOfInterest();

		var next = new TreeNode();
		next.data = cloneData();
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
			edges.push(new Edge(curHull[curHull.length - 1], points[curIndex]));
			ret = false;
		}
		else {
			colormodify(points[curIndex]);
			curHull.push(points[curIndex++]);
			return true;
			
		}

		colorPointOfInterest();
        
		var node = new TreeNode();
		node.data = cloneData();
		decolorPointOfInterest();
		parent.adopt(node);
		return ret;
	}

	function decolorPointOfInterest() {
		if (curIndex < points.length && curHull.length > 1) {
            colormodify(curHull[curHull.length - 1]);
			//   curHull[curHull.length - 1].setAttribute({ fillColor: "blue", strokeColor: "blue" });
		}
	}

	function colorPointOfInterest() {
		if (curIndex < points.length && curHull.length > 1) {
			if (Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], points[curIndex])) == orientation) {
				curHull[curHull.length - 1].setAttribute({ fillColor: "darkorchid", strokeColor: "darkorchid" });
				//points[curIndex].setAttribute({ fillColor: "blue", strokeColor: "blue" });
				colormodify(points[curIndex]);
			}
			else {
				//points[curIndex].setAttribute({ fillColor: "blue", strokeColor: "blue" });
				colormodify(points[curIndex]);
				curHull[curHull.length - 1].setAttribute({ fillColor: "Lime", strokeColor: "Lime" });
				
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

	function addRandomPoints(event) {
		graph.addRandomPoints($("#randomInput").val());
	}

	function colormodify(point){
		if(orientation>0) point.setAttribute({ fillColor: "red", strokeColor: "red" });
		else point.setAttribute({ fillColor: "blue", strokeColor: "blue" });
	}
}