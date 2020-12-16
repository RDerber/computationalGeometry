window.onload = function () {
	var view = new giftWrap();
	view.displayConvexHull();
}

function giftWrap() {
	var giftWrap = this;
	this.container;
	var graph;
	var points;
	var edges = [];
	var tree = new Tree();
	var root;
	var convex = []
	var curIndex, startstate, finished;
	var curPoint;
	var edgeChange = true;
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
["Gift Wrap",
"------------------- ",
"pointOnHull = leftmost point",
"i = 0",
"while end point does not come back to start point:",
"   P[i] = pointOnHull",
"   endpoint = S[0]",
"   for j from 1 to |S|:",
"      if S[j] is on right of line from P[i] to endpoint",
"          endpoint = S[j]",
"   i = i + 1",
"   pointOnHull = endpoint",
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
		giftWrap.container = new GraphContainer("Gift Wrap", [], desc);

		var attr= { interactionType: "pointGraph" };

		graph = new Graph(attr, giftWrap.container.graphDiv);

		var buttonContainer = giftWrap.container.buttonContainer;

		var button = document.createElement('div');
		button.id = "computeHullButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Compute Convex Hull"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		var text1 = "1. Click in the left panel to place new points, or use the Random Points button.";
		var text2 = "2. Click Compute Convex Hull button."

		graph.createTutorial(-3, 4, text1);
		graph.createTutorial(-3, 3, text2);
	}

	function transition() {
		if (graph.points.length < 3) return;

		graph.freeze();

		points = graph.cloneData().points;

		$("#computeHullButton").remove();
		$("#tutorial").remove();

		var $buttonContainer = $(giftWrap.container.buttonContainer);

		var $pointContainer = $(document.createElement("div"));
		$pointContainer.css("display", "flex");
		var $pointHeader = $(document.createElement("div"));
		$pointHeader.css("display", "flex");
		var $edgeContainer = $(document.createElement("div"));
		$edgeContainer.css("display", "flex");
		var $edgeHeader = $(document.createElement("div"));
		$edgeHeader.css("display", "flex");
		var $finishContainer = $(document.createElement("div"));
		$finishContainer.css("display", "flex");
		var $finishHeader = $(document.createElement("div"));
		$finishHeader.css("display", "flex");

		$buttonContainer.append($edgeHeader);
		$buttonContainer.append($edgeContainer);
		$buttonContainer.append($pointHeader);
		$buttonContainer.append($pointContainer);
		$buttonContainer.append($finishHeader);
		$buttonContainer.append($finishContainer);

		var $pointdes = $(document.createElement("div"));
		$pointdes.append(document.createTextNode("Inner Loop:"));
		$pointdes.append(document.createElement('br'));
		$pointdes.append(document.createTextNode("Each Click move to next/prev point to be checked"));
		$pointHeader.append($pointdes);

		var $prevPointButton = $("<div>", { id: "prevPointButton", class: "button" });
		$prevPointButton.css("horizontal-align", "center");
		$prevPointButton.on("click", prevPoint);
		$prevPointButton.on("mouseover", () => {tableLines[7].style.backgroundColor = "tan";});
		$prevPointButton.on("mouseout", () => {tableLines[7].style.backgroundColor = "";});
		$prevPointText = $(document.createElement("div"));
		$prevPointText.addClass("button-content");
		$prevPointText.append(document.createTextNode("Prev Point"))
		$prevPointButton.append($prevPointText);
		$pointContainer.append($prevPointButton);
		
		var $nextPointButton = $("<div>", { id: "nextPointButton", class: "button" });
		$nextPointButton.css("horizontal-align", "center");
		$nextPointButton.on("click", nextPoint);
		$nextPointButton.on("mouseover", () => {tableLines[7].style.backgroundColor = "tan";});
		$nextPointButton.on("mouseout", () => {tableLines[7].style.backgroundColor = "";});
		$nextPointText = $(document.createElement("div"));
		$nextPointText.addClass("button-content");
		$nextPointText.append(document.createTextNode("Next Point"))
		$nextPointButton.append($nextPointText);
		$pointContainer.append($nextPointButton);

		var $edgedes = $(document.createElement("div"));
		$edgedes.append(document.createTextNode("Outer Loop:"));
		$edgedes.append(document.createElement('br'));
		$edgedes.append(document.createTextNode("Each click implementing next/prev edge"));
		$edgeHeader.append($edgedes);

	
		var $prevEdgeButton = $("<div>", { id: "prevEdgeButton", class: "button" });
		$prevEdgeButton.css("horizontal-align", "center");
		$prevEdgeButton.on("click", prevEdge);
		$prevEdgeButton.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
		$prevEdgeButton.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		$prevEdgeText = $(document.createElement("div"));
		$prevEdgeText.addClass("button-content");
		$prevEdgeText.append(document.createTextNode("Prev Edge"))
		$prevEdgeButton.append($prevEdgeText);
		$edgeContainer.append($prevEdgeButton);

		var $nextEdgeButton = $("<div>", { id: "nextEdgeButton", class: "button" });
		$nextEdgeButton.css("horizontal-align", "center");
		$nextEdgeButton.on("click", nextEdge);
		$nextEdgeButton.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
		$nextEdgeButton.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		$nextEdgeText = $(document.createElement("div"));
		$nextEdgeText.addClass("button-content");
		$nextEdgeText.append(document.createTextNode("Next Edge"))
		$nextEdgeButton.append($nextEdgeText);
		$edgeContainer.append($nextEdgeButton);

		var $finishdes = $(document.createElement("div"));
		$finishdes.append(document.createTextNode("Click button below to finish whole Convex Hull"));
		$finishHeader.append($finishdes);

		var $finishButton = $("<div>", { id: "finishButton", class: "button" });
		$finishButton.css("horizontal-align", "center");
		$finishButton.on("click", finishHull);
		$finishText = $(document.createElement("div"));
		$finishText.addClass("button-content");
		$finishText.append(document.createTextNode("Finish Convex Hull"))
		$finishButton.append($finishText);
		$finishContainer.append($finishButton);

		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var black = new desContainer("blackedge.jpeg","Lying on the current Hull.",DesContainer);
		var bluepoint = new desContainer("redpoint.jpeg","Tail point on the current Hull.",DesContainer);
		var blue = new desContainer("blueedge.jpeg","Rightmost edge of current inner loop. ",DesContainer);
		var green = new desContainer("reddashedge.jpeg","Next edge to explore.",DesContainer);

		$buttonContainer.append($(DesContainer));

		computeConvexHull();

		tree.node = tree.root;
		while (tree.node.children.length > 0) tree.moveDown();
		updateButtons();
		graph.reset();
		graph.addObjects(tree.node.data);
		graph.board.removeEventHandlers();
	}

	function prevPoint() {
		tree.moveToDepth(2);
		tree.moveLeft(); 
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextPoint() {
		var d = tree.getCurrentDepth();
		tree.moveToDepth(2);
		tree.moveRight();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}

		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function prevEdge() {
		tree.moveToDepthForLA(1);
		tree.moveLeft();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextEdge() {
		var d = tree.getCurrentDepth();
		tree.moveToDepthForLA(1);
		tree.moveRight();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function finishHull() {
		tree.node = tree.root;
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[tree.node.children.length - 1];
		}
		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function updateButtons() {
		var $button;
		$button = $("#prevPointButton");
		if (tree.moveToDepth(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", prevPoint);
			$button.on("mouseover", () => {tableLines[7].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[7].style.backgroundColor = "";});
		}

		$button = $("#nextPointButton");
		if (tree.moveToDepth(2).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", nextPoint);
			$button.on("mouseover", () => {tableLines[7].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[7].style.backgroundColor = "";});
		}

		$button = $("#prevEdgeButton");
		if (tree.moveToDepth(1).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", prevEdge);
			$button.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		}

		$button = $("#nextEdgeButton");
		if (tree.moveToDepth(1).rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", nextEdge);
			$button.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		}
	}

	function computeConvexHull(){
		root = new TreeNode();
		tree.root = root;
		tree.node = root;
	
		var start_point = points.sort(Point.compareX)[0];
		convex.push(start_point);

		while(true){
			curIndex = 0;
			startstate = true;

			colorReset(convex[convex.length - 1]);

			var treeNode = new TreeNode();

			while(curIndex < points.length){
				goNextPoint(treeNode);
				curIndex++;
			}

			var endstate = new TreeNode();

			if(!edgeChange){
				edges.pop();
			}
				
			endstate.data = cloneData();
			edgeChange = true;
			treeNode.adopt(endstate);

			convex.push(curPoint);
			root.adopt(treeNode);

			if(convex[0] == convex[convex.length - 1])
				break;
		}


		if(!edgeChange){
			edges.pop();
		}
	}

	function goNextPoint(parent){
		if(convex[convex.length - 1] == points[curIndex] || convex[convex.length - 2] == points[curIndex])
			return;

		var node = new TreeNode();
		parent.adopt(node);

		if(!edgeChange){
			edges.pop();
		}

		edges.push(new Edge(convex[convex.length - 1], points[curIndex], { fillcolor: "red", strokeColor: "red", dash: 2 }));	

		var next = new TreeNode();
		next.data = cloneData();

		if(startstate){
			edges[edges.length-1].setAttribute({ fillcolor: "blue", strokeColor: "blue", dash: 0 });
			curPoint = points[curIndex];
			
			startstate = false;
			edgeChange = true;
		}
		else{
			if(rightofEdge(points[curIndex])){
				edges.splice(edges.length - 2, 1);
				edges[edges.length-1].setAttribute({ fillcolor: "blue", strokeColor: "blue", dash: 0 });
				curPoint = points[curIndex];
				edgeChange = true;
			}
			else{
				edges[edges.length-2].setAttribute({ dash: 0 });
				edgeChange = false;
			}
		}

		node.adopt(next);

	}

	function rightofEdge(point){
		var edge = edges[edges.length - 2];
		return Math.sign(Point.orient(edge.p1, edge.p2, point)) == -1;
	}

	function colorReset(point){
		var i;
		for(i = 0; i < points.length; i++){
			if(Point.samePoint(points[i], point)){
				points[i].setAttribute({ fillColor: "red", strokeColor: "red" });
			}
			else{
				points[i].setAttribute({ fillColor: "black", strokeColor: "black" });
			}
		}

		for(i = 0; i < edges.length; i++){
			edges[i].setAttribute({ fillcolor: "black", strokeColor: "black", dash: 0 });
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
}