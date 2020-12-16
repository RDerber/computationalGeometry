window.onload = function () {
	var view = new mergeHull();
	view.displayConvexHull();
}

function mergeHull() {
	var mergeHull = this;
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
	var convex = []
	var curHull, curIndex, startstate, finished;
	var curPoint;
	var edgeChange = true;
	var tableLines = [];
	var endState;

	this.displayConvexHull = function (event) {
		//Algorithm at bottom right
		var desc = document.createElement("div");
		desc.style.whiteSpace = "pre";

		var table = document.createElement("table");
		table.style.tableLayout = "fixed";
		table.style.fontSize = "small";
		table.style.borderCollapse = "collapse";
		desc.appendChild(table);
		var lines =
["Merge Hull",
"------------------- ",
"Rcursion(points):",
"   if there are less than 3 points, return the simple convex hull",
"   left_hull = Recursion(left_points)",
"   right_hull = Recursion(right_points)",
"   curr_hull = merge(left_hull, right_hull)",
"   return curr_hull",
"merge(left_hull, right_hull):",
"   find upper tangent",
"   find lower tangent",
"   return merged hull",
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
		mergeHull.container = new GraphContainer("Merge Hull", [], desc);

		var attr= { interactionType: "pointGraph" };

		graph = new Graph(attr, mergeHull.container.graphDiv);

		var buttonContainer = mergeHull.container.buttonContainer;

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
		if (graph.points.length < 4) return;

		graph.freeze();

		points = graph.cloneData().points;

		$("#computeHullButton").remove();
		$("#tutorial").remove();

		var $buttonContainer = $(mergeHull.container.buttonContainer);

		var $recursionContainer = $(document.createElement("div"));
		$recursionContainer.css("display", "flex");
		var $recursionHeader = $(document.createElement("div"));
		$recursionHeader.css("display", "flex");
		var $returnContainer = $(document.createElement("div"));
		$returnContainer.css("display", "flex");
		var $mergeContainer = $(document.createElement("div"));
		$mergeContainer.css("display", "flex");
		var $mergeHeader = $(document.createElement("div"));
		$mergeHeader.css("display", "flex");
		var $stepContainer = $(document.createElement("div"));
		$stepContainer.css("display", "flex");
		var $stepHeader = $(document.createElement("div"));
		$stepHeader.css("display", "flex");
		var $finishContainer = $(document.createElement("div"));
		$finishContainer.css("display", "flex");
		var $finishHeader = $(document.createElement("div"));
		$finishHeader.css("display", "flex");

		$buttonContainer.append($recursionHeader);
		$buttonContainer.append($returnContainer);
		$buttonContainer.append($recursionContainer);
		$buttonContainer.append($finishContainer);
		$buttonContainer.append($mergeHeader);
		$buttonContainer.append($mergeContainer);
		$buttonContainer.append($stepHeader);
		$buttonContainer.append($stepContainer);
		$buttonContainer.append($finishHeader);
		
		

		var $recurdes = $(document.createElement("div"));
		$recurdes.append(document.createTextNode("Recursion Buttons:"));
		$recurdes.append(document.createElement('br'));
		$recurdes.append(document.createTextNode("Choose to move between recursion level"));
		$recursionHeader.append($recurdes);

		var $returnButton = $("<div>", { id: "returnButton", class: "button" });
		$returnButton.css("horizontal-align", "center");
		$returnButton.on("click", returnRecursion);
		$returnText = $(document.createElement("div"));
		$returnText.addClass("button-content");
		$returnText.append(document.createTextNode("Undo Subtree"))
		$returnButton.append($returnText);
		$finishContainer.append($returnButton);

		var $leftButton = $("<div>", { id: "leftButton", class: "button" });
		$leftButton.css("horizontal-align", "center");
		$leftButton.on("click", leftRecursion);
		$leftButton.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
		$leftButton.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		$leftText = $(document.createElement("div"));
		$leftText.addClass("button-content");
		$leftText.append(document.createTextNode("Left Recursion"))
		$leftButton.append($leftText);
		$recursionContainer.append($leftButton);
		
		var $rightButton = $("<div>", { id: "rightButton", class: "button" });
		$rightButton.css("horizontal-align", "center");
		$rightButton.on("click", rightRecursion);
		$rightButton.on("mouseover", () => {tableLines[5].style.backgroundColor = "tan";});
		$rightButton.on("mouseout", () => {tableLines[5].style.backgroundColor = "";});
		$rightText = $(document.createElement("div"));
		$rightText.addClass("button-content");
		$rightText.append(document.createTextNode("Right Recursion"))
		$rightButton.append($rightText);
		$recursionContainer.append($rightButton);

		var $mergedes = $(document.createElement("div"));
		$mergedes.append(document.createTextNode("Merge Function Buttons:"));
		$mergeHeader.append($mergedes);

		var $startMergeButton = $("<div>", { id: "startMergeButton", class: "button" });
		$startMergeButton.css("horizontal-align", "center");
		$startMergeButton.on("click", startMerge);
		$startMergeButton.on("mouseover", () => {tableLines[6].style.backgroundColor = "tan";});
		$startMergeButton.on("mouseout", () => {tableLines[6].style.backgroundColor = "";});
		$startMergeText = $(document.createElement("div"));
		$startMergeText.addClass("button-content");
		$startMergeText.append(document.createTextNode("Start Merge"))
		$startMergeButton.append($startMergeText);
		$recursionContainer.append($startMergeButton);

		var $upperButton = $("<div>", { id: "upperButton", class: "button" });
		$upperButton.css("horizontal-align", "center");
		$upperButton.on("click", upper);
		$upperButton.on("mouseover", () => {tableLines[9].style.backgroundColor = "tan";});
		$upperButton.on("mouseout", () => {tableLines[9].style.backgroundColor = "";});
		$upperText = $(document.createElement("div"));
		$upperText.addClass("button-content");
		$upperText.append(document.createTextNode("Upper Tangent"))
		$upperButton.append($upperText);
		$mergeContainer.append($upperButton);

		var $lowerButton = $("<div>", { id: "lowerButton", class: "button" });
		$lowerButton.css("horizontal-align", "center");
		$lowerButton.on("click", lower);
		$lowerButton.on("mouseover", () => {tableLines[10].style.backgroundColor = "tan";});
		$lowerButton.on("mouseout", () => {tableLines[10].style.backgroundColor = "";});
		$lowerText = $(document.createElement("div"));
		$lowerText.addClass("button-content");
		$lowerText.append(document.createTextNode("Lower Tangent"))
		$lowerButton.append($lowerText);
		$mergeContainer.append($lowerButton);

		var $stepdes = $(document.createElement("div"));
		$stepdes.append(document.createTextNode("Perform a single step of the merge function"));
		$stepHeader.append($stepdes);
	
		var $prevStepButton = $("<div>", { id: "prevStepButton", class: "button" });
		$prevStepButton.css("horizontal-align", "center");
		$prevStepButton.on("click", prevStep);
		$prevStepText = $(document.createElement("div"));
		$prevStepText.addClass("button-content");
		$prevStepText.append(document.createTextNode("Prev Step"))
		$prevStepButton.append($prevStepText);
		$stepContainer.append($prevStepButton);

		var $nextStepButton = $("<div>", { id: "nextStepButton", class: "button" });
		$nextStepButton.css("horizontal-align", "center");
		$nextStepButton.on("click", nextStep);
		$nextStepText = $(document.createElement("div"));
		$nextStepText.addClass("button-content");
		$nextStepText.append(document.createTextNode("Next Step"))
		$nextStepButton.append($nextStepText);
		$stepContainer.append($nextStepButton);

		/*var $finishdes = $(document.createElement("div"));
		$finishdes.append(document.createTextNode("finish current recursion(all blue points)"));
		$finishHeader.append($finishdes);*/

		var $finishButton = $("<div>", { id: "finishButton", class: "button" });
		$finishButton.css("horizontal-align", "center");
		$finishButton.on("click", finishRecursion);
		$finishText = $(document.createElement("div"));
		$finishText.addClass("button-content");
		$finishText.append(document.createTextNode("Finish Subtree"))
		$finishButton.append($finishText);
		$finishContainer.append($finishButton);

		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var blackedge = new desContainer("blackedge.jpeg","Convex edges.",DesContainer);
		var blackpoint = new desContainer("blackpoint.jpeg","Points not in current recursion.",DesContainer);
		var bluepoint = new desContainer("bluepoint.jpeg","Points in current recursion.",DesContainer);
		var blue = new desContainer("bluedashedge.jpeg","Upper tangent. ",DesContainer);
		var red = new desContainer("reddashedge.jpeg","Lower tangent.",DesContainer);

		$buttonContainer.append($(DesContainer));

		computeConvexHull();

		tree.node = tree.root.children[0];
		updateButtons();
		graph.reset();
		graph.addObjects(tree.node.data);
		graph.board.removeEventHandlers();
	}

	function returnRecursion(){
		if(tree.node.children.length == 0){
			tree.moveUp();
		}

		if(tree.getCurrentDepth() != 1){
			tree.moveUp()
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function leftRecursion() {
		if(tree.node.children.length != 0){
			tree.node = tree.node.children[0];
		}
		else{
			tree.node = tree.node.leftSibling.leftSibling;
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function rightRecursion() {
		if(tree.node.children.length != 0){
			tree.node = tree.node.children[1];
		}
		else{
			tree.node = tree.node.leftSibling;
		}

		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function startMerge(){
		if(tree.node.children.length != 0){
			tree.node = tree.node.children[3];
		}
		else{
			tree.node = tree.node.rightSibling;
		}
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function upper(){
		if(tree.node.children.length == 0)
			tree.moveUp();
		tree.node = tree.node.parent.children[3];
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function lower(){
		if(tree.node.children.length == 0)
			tree.moveUp();
		tree.node = tree.node.parent.children[4];
		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function prevStep() {
		if(tree.node.leftSibling == null)
			tree.moveUp();
		else
			tree.node = tree.node.leftSibling;

		updateButtons();
		graph.loadData(tree.node.getData());
	}

	function nextStep() {
		if(tree.node.children.length != 0)
			tree.node = tree.node.children[0];
		else
			tree.node = tree.node.rightSibling;

		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function finishRecursion() {
		if(tree.getCurrentDepth() == 1){
			tree.node = endState;
		}
		else if(interState()){	
			tree.moveUp();
			if(tree.getCurrentDepth() == 1){
				tree.node = endState;
			}
			else{
				tree.node = tree.node.rightSibling;
			}		
		}
		else {
			if(tree.node.children.length == 0){
				tree.moveUp();
			}

			if(inMerge()){
				if(tree.node.children.length == 0)
					tree.moveUp();
				if(tree.node.rightSibling != null)
					tree.node = tree.node.rightSibling;
			}

			if(tree.node.rightSibling == null || tree.node.children.length == 0){
				if(tree.getCurrentDepth() == 2){
					tree.node = tree.node.children[tree.node.children.length-1];
				}
				else{
					tree.moveUp();
					tree.node = tree.node.rightSibling;
				}
			}
			else{
				tree.node = tree.node.rightSibling;
			}
		}

		graph.loadData(tree.node.getData());
		updateButtons();
	}

	function updateButtons() {
		var $button;
		var inmerge = inMerge();

		$button = $("#returnButton");
		if (tree.getCurrentDepth() == 1) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", returnRecursion);
		}

		$button = $("#leftButton");
		if ((tree.node.children.length < 2 && !interState()) || inmerge) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", leftRecursion);
			$button.on("mouseover", () => {tableLines[4].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[4].style.backgroundColor = "";});
		}

		$button = $("#rightButton");
		if ((tree.node.children.length < 2 && !interState()) || inmerge) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", rightRecursion);
			$button.on("mouseover", () => {tableLines[5].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[5].style.backgroundColor = "";});
		}

		$button = $("#finishButton");
		if (tree.node == endState) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", finishRecursion);
		}

		$button = $("#startMergeButton");
		if ((tree.node.children.length < 2 && !interState()) || inmerge) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", startMerge);
			$button.on("mouseover", () => {tableLines[6].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[6].style.backgroundColor = "";});
		
		}

		$button = $("#upperButton");
		if (!inmerge) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("mouseover", () => {tableLines[9].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[9].style.backgroundColor = "";});
			$button.on("click", upper);
		}

		$button = $("#lowerButton");
		if (!inmerge) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("mouseover", () => {tableLines[10].style.backgroundColor = "tan";});
			$button.on("mouseout", () => {tableLines[10].style.backgroundColor = "";});
			$button.on("click", lower);
		}

		$button = $("#prevStepButton");
		if (!inmerge || tree.node.children.length != 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", prevStep);
		}

		$button = $("#nextStepButton");
		if ((tree.node.children.length == 0 && tree.node.rightSibling == null) || !inmerge) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", nextStep);
		}
	}

	function computeConvexHull(){
		root = new TreeNode();
		tree.root = root;
		tree.node = root;
	
		var startNode = new TreeNode();
		var endNode = new TreeNode();

		points.sort(Point.compareX, root);
		convex = recurse(points, startNode);
		endNode.data = cloneData();

		root.adopt(startNode);
		root.adopt(endNode);
		var temp = root.children[0].children[4];
		endState = temp.children[temp.children.length-1];
	}

	function merge(left_convex, right_convex, parent){
		var list = [];
		var right = 0;
		var left = 0;
		var i;

		for(i = 0; i < left_convex.length; i++){
			if(left_convex[i].x > left_convex[left].x){
				left = i;
			}
		}

		var leftIndex = left;

		edges.push(new Edge(left_convex[left], right_convex[right], {fillColor: "blue", strokeColor: "blue", dash: 2}));

		var upperNode = new TreeNode();
		var treeNode = new TreeNode();
		upperNode.data = cloneData();
		parent.adopt(upperNode);

		while(true){
			if(Math.sign(Point.orient(left_convex[left], right_convex[right], right_convex[(right + 1) % right_convex.length])) == 1){
				for(; true; i++){
					if(Math.sign(Point.orient(left_convex[left], right_convex[right], right_convex[(right + 1) % right_convex.length])) == 1){
						right = right + 1;
						edges.pop();
						edges.push(new Edge(left_convex[left], right_convex[right], {fillColor: "blue", strokeColor: "blue", dash: 2}));
						treeNode = new TreeNode();
						treeNode.data = cloneData();
						upperNode.adopt(treeNode);
						continue;
					}
					break;
				}
				continue;
			}

			if(Math.sign(Point.orient(right_convex[right], left_convex[left], left_convex[(left + left_convex.length - 1) % left_convex.length])) == -1){
				for(; true; i--){
					if(Math.sign(Point.orient(right_convex[right], left_convex[left], left_convex[(left + left_convex.length - 1) % left_convex.length])) == -1){
						left = (left + left_convex.length - 1) % left_convex.length;
						edges.pop();
						edges.push(new Edge(left_convex[left], right_convex[right], {fillColor: "blue", strokeColor: "blue", dash: 2}));
						treeNode = new TreeNode();
						treeNode.data = cloneData();
						upperNode.adopt(treeNode);
						continue;
					}
					break;
				}
				continue;
			}

			break;
		}

		edges[edges.length-1].setAttribute({fillColor: "blue", strokeColor: "blue", dash: 0});
		treeNode = new TreeNode();
		treeNode.data = cloneData();
		upperNode.adopt(treeNode);

		var upleft = left;
		var upright = right;
		left = leftIndex;
		right = 0;

		edges.push(new Edge(left_convex[left], right_convex[right], {fillColor: "red", strokeColor: "red", dash: 2}));

		var lowerNode = new TreeNode();
		lowerNode.data = cloneData();
		parent.adopt(lowerNode);

		while(true){
			if(Math.sign(Point.orient(left_convex[left], right_convex[right], right_convex[(right + right_convex.length - 1) % right_convex.length])) == -1){
				for(; true; i--){
					if(Math.sign(Point.orient(left_convex[left], right_convex[right], right_convex[(right + right_convex.length - 1) % right_convex.length])) == -1){
						right = (right + right_convex.length - 1) % right_convex.length;
						edges.pop();
						edges.push(new Edge(left_convex[left], right_convex[right], {fillColor: "red", strokeColor: "red", dash: 2}));
						treeNode = new TreeNode();
						treeNode.data = cloneData();
						lowerNode.adopt(treeNode);
						continue;
					}
					break;
				}
				continue;
			}

			if(Math.sign(Point.orient(right_convex[right], left_convex[left], left_convex[(left + 1) % left_convex.length])) == 1){
				for(; true; i++){
					if(Math.sign(Point.orient(right_convex[right], left_convex[left], left_convex[(left + 1) % left_convex.length])) == 1){
						left = (left + 1) % left_convex.length;
						edges.pop();
						edges.push(new Edge(left_convex[left], right_convex[right], {fillColor: "red", strokeColor: "red", dash: 2}));
						treeNode = new TreeNode();
						treeNode.data = cloneData();
						lowerNode.adopt(treeNode);
						continue;
					}
					break;
				}
				continue;
			}

			break;
		}

		edges[edges.length-1].setAttribute({fillColor: "red", strokeColor: "red", dash: 0});
		treeNode = new TreeNode();
		treeNode.data = cloneData();
		lowerNode.adopt(treeNode);


		for(i = 0; i <= upleft; i++){
			list.push(left_convex[i]);
		}

		if(right < upright){
			right += right + right_convex.length;
		}
		
		for(i = upright; i <= right; i++){
			list.push(right_convex[i % right_convex.length]);
		}

		if(left != 0){
			for(i = left; i < left_convex.length; i++){
				list.push(left_convex[i]);
			}
		}

		var num = left_convex.length + right_convex.length + 2;
		if(left_convex.length == 2)
			num -= 1;

		if(right_convex.length == 2)
			num -= 1;

		for(; num > 0; num--){
			edges.pop();
		}

		for(i = 0; i < list.length-1; i++){
			edges.push(new Edge(list[i], list[i+1], {fillColor: "black", strokeColor: "black"}));
		}

		edges.push(new Edge(list[list.length-1], list[0], {fillColor: "black", strokeColor: "black"}));


		treeNode = new TreeNode();
		treeNode.data = cloneData();
		lowerNode.adopt(treeNode);

		return list;
	}

	function recurse(curr_points, parent){
		var endNode = new TreeNode();
		var i;
		var curr_convex;
		
		for(i = 0; i < points.length; i++){
			if(curr_points.includes(points[i])){
				points[i].setAttribute({ fillColor: "red", strokeColor: "red"});
			}
			else{
				points[i].setAttribute({ fillColor: "black", strokeColor: "black"});
			}
		}

		parent.data = cloneData();

		if(curr_points.length < 4){
			curr_convex = simpleHull(curr_points);
			endNode.data = cloneData();
			parent.adopt(endNode);
		}
		else{
			var leftPoints = curr_points.slice(0, curr_points.length/2);
			var rightPoints = curr_points.slice(curr_points.length/2, curr_points.length);
			var leftNode = new TreeNode();
			var rightNode = new TreeNode();
			var left_convex = recurse(leftPoints, leftNode);
			var right_convex = recurse(rightPoints, rightNode);
			parent.adopt(leftNode);
			parent.adopt(rightNode);

			for(i = 0; i < points.length; i++){
				if(curr_points.includes(points[i])){
					points[i].setAttribute({ fillColor: "red", strokeColor: "red"});
				}
				else{
					points[i].setAttribute({ fillColor: "black", strokeColor: "black"});
				}
			}

			var interNode = new TreeNode();
			interNode.data = cloneData();
			parent.adopt(interNode);

			curr_convex = merge(left_convex, right_convex, parent);
		}

		return curr_convex;
	}

	function simpleHull(curr_points){
		if(curr_points.length <= 1){
			return curr_points;
		}

		if(curr_points.length == 2){
			edges.push(new Edge(curr_points[0], curr_points[1], {fillcolor: "black", strokeColor: "black"}));
			return curr_points;
		}

		edges.push(new Edge(curr_points[0], curr_points[1], {fillcolor: "black", strokeColor: "black"}));
		edges.push(new Edge(curr_points[1], curr_points[2], {fillcolor: "black", strokeColor: "black"}));
		edges.push(new Edge(curr_points[2], curr_points[0], {fillcolor: "black", strokeColor: "black"}));
		if(Math.sign(Point.orient(curr_points[0], curr_points[1], curr_points[2])) == 1){
			return [curr_points[0], curr_points[2], curr_points[1]];
		}
		else{
			return curr_points;
		}
	}

	function copyList(array){
		var i;
		var copy = [];
		for(i = 0; i < array.length; i++){
			copy.push(array[i]);
		}
		return copy;
	}

	function inMerge(){
		if(tree.getCurrentDepth() == 1)
			return false;

		if (tree.node.children.length == 0) {
			tempnode = tree.node.parent;
			if(tree.getCurrentDepth() == 2)
				return false;
		}
		else{
			tempnode = tree.node;
		}

		return tempnode == tempnode.parent.children[3] || tempnode == tempnode.parent.children[4];
	}

	function interState(){
		if(tree.node.children.length == 0){
			if(tree.node.leftSibling != null && tree.node.leftSibling.children.length != 0){
				return true;
			}
		}

		return false;
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