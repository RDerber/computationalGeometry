window.onload = function () {
	var view = new quickHull();
	view.displayConvexHull();
}

function quickHull() {
	var quickHull = this;
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

		$upButton = $(document.createElement("div"));
		$upButton.addClass("button");
		$lowerButton.

			tree.node = tree.root;
		tree.begin();
		updateButtons();
		graph.reset();
		graph.addObjects(tree.node.data);
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
		$button = $("#outerForwardButton");
		if (tree.atDepth(2).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveRightOuterLoop);
		}

		$button = $("#outerBackButton");
		if (tree.atDepth(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveLeftOuterLoop);
		}

		$button = $("#innerForwardButton");
		if (tree.atDepth(3).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveRightInnerLoop);
		}

		$button = $("#innerBackButton");
		if (tree.atDepth(3).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "gray");
			$button.off();
			$button.on("click", moveLeftInnerLoop);
		}

	}

	function computeConvexHull() {
		var i;
		root = new Node();
		tree.root = root;
		tree.node = root;
		points = graph.cloneData();
		var topPoint = points[0];
		for (i = 0; i < points.length; ++i) {

		}
	}

	function recurse(parent) {

	}
}