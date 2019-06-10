window.onload = function () {
  var view = new KD_Tree();
	view.display();

  //  container.buttonCol.remove();
}

function KD_Tree(){
  var kdTree = this;
  this.kd;
  this.domEl;
  this.container;
  var graphs = [];
  var graph;
  var treeGraph;
  var tutorial = [];

  var points = [];
  var lines = [];
  var addedLine;
  var faces = [];
  var tree = new Tree();
  var KDnodes = [];
  var kdedges = [];
  var kdfaces = [];
  var wholeDepth;

  var leftTop;
  var rightBot;
  var oldLeftBot;
  var oldRightTop;
  var Qarea;
  var Qflag = 0;
  var kdroot;
  var queryTree = new Tree()
  var nodesList = [];
  var checkList = [];


  this.display = function(event){
    kdTree.container = new GraphContainer("KD-Tree");
    kdTree.kd = new KDGraph({interactionType: 'pointGraph'}, kdTree.container.graphDiv);
    graphs = kdTree.kd.graphs;
    graph = graphs[0];
    treeGraph = graphs[1];
	$(graphs[1].bottomRow).remove()
	
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

	var tutorial = document.createElement('div');
	tutorial.id = "tutorial";
	tutorial.classList.add("tutorial");
	var text1 = document.createElement('div');
	text1.classList.add('subtutorial');
	text1.appendChild(document.createTextNode('1. Click in the left panel to place new points, or use the Random Points button.'));
	tutorial.appendChild(text1);
	var text2 = document.createElement('div');
	text2.classList.add('subtutorial');
	text2.appendChild(document.createTextNode('2. Click Create KD-Tree button.'));
	tutorial.appendChild(text2);
	buttonContainer.appendChild(tutorial);
  }

  function transition(){
		$("#computeKDTreeButton").remove();
		$("#tutorial").remove();

		var $buttonContainer = $(kdTree.container.buttonContainer);


		$quadContainer = $(document.createElement("div"));
		$buttonContainer.append($quadContainer);

		var $upperContainer = $(document.createElement("div"));
		//$upperContainer.css();
		var $lowerContainer = $(document.createElement("div"));

		backNextButtons($buttonContainer);

		createkdTree();

		updateButtons();

		var tutorial = document.createElement('div');
		tutorial.id = "tutorial";
		tutorial.classList.add("tutorial");
		var text1 = document.createElement('div');
		text1.classList.add('subtutorial');
		text1.appendChild(document.createTextNode('* Click Start Query button after kd tree is constructed.'));
		tutorial.appendChild(text1);
		$buttonContainer.append($(tutorial));
  }

	function backNextButtons($container) {
		$backButton = $("<button>", { id: "backButton", class: "button" });
		$backButton.css("horizontal-align", "center");
		$backButton.on("click", back);
		$backButton.on("click", back);
		$backButton.append(document.createTextNode("Undo Recurse"))
		$container.append($backButton);

		$recurseDiv = $("<div>", { id: "recurseDiv" });
		$recurseDiv.css('display','block');
		$container.append($recurseDiv);

		$recurseRightButton = $("<button>", { id: "recurseRight", class: "button" });
		$recurseRightButton.css("horizontal-align", "center");
		$recurseRightButton.css("display", "block");
		$recurseRightButton.on("click", recurseRight);
//		$recurseRightButton.on("mouseover", () => (tableLines[9].style.backgroundColor = "tan"));
//		$recurseRightButton.on("mouseout", () => (tableLines[9].style.backgroundColor = ""));
		$recurseRightButton.append(document.createTextNode("Recurse"))
		$recurseDiv.append($recurseRightButton);

		$recurseLeftButton = $("<button>", { id: "recurseLeft", class: "button" });
		$recurseLeftButton.css("horizontal-align", "center");
		$recurseLeftButton.css("display", "none");
		$recurseLeftButton.on("click", recurseLeft);
//		$recurseLeftButton.on("mouseover", () => (tableLines[10].style.backgroundColor = "tan"));
//		$recurseLeftButton.on("mouseout", () => (tableLines[10].style.backgroundColor = ""));
		$recurseLeftButton.append(document.createTextNode("Recurse CW"));
		$recurseDiv.append($recurseLeftButton);

		$finishRecurseButton = $("<button>", { id: "finishRecurse", class: "button" });
		$finishRecurseButton.css("horizontal-align", "center");
		$finishRecurseButton.on("click", finishRecurse);
		$finishRecurseButton.append(document.createTextNode("Finish Subtree"))
		$container.append($finishRecurseButton);

		$query = $("<button>", { id: "query", class: "button" });
		$query.css("horizontal-align", "center");
		$query.css("display", "block");
		$query.on("click", query);
		$query.append(document.createTextNode("Start Query"))
		$container.append($query);

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
		kdTree.kd.loadData(tree.node.getData());
		updateButtons();
	}

	function recurseLeft(event) {
		tree.node = tree.node.children[1];
		graph.loadData(tree.node.getData());
		kdTree.kd.loadData(tree.node.getData());
		updateButtons();
	}

	function recurseRight(event) {
		tree.node = tree.node.children[0];
		graph.loadData(tree.node.getData());
		kdTree.kd.loadData(tree.node.getData());
		updateButtons();
	}
	function finishRecurse(event) {
		while (tree.node != tree.node.parent.children[0] && tree.getCurrentDepth() != 1) {
			tree.moveUp();
		}
		tree.node = tree.node.rightSibling;
		graph.loadData(tree.node.getData());
		kdTree.kd.loadData(tree.node.getData());
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
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", recurseRight);
		}

		$button = $("#recurseLeft");
		if (tree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", recurseLeft);
		}

		$button = $("#finishRecurse");
		if (tree.getCurrentDepth() == 1 && tree.node.rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", finishRecurse);
		}

		$button = $("#backButton");
		if (tree.getCurrentDepth() == 1 && tree.node.leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", back);
		}

	}

	function updateQueryButtons(){
		var $button;
		$button = $("#qbackButton");
	}
	function createkdTree() {
		points = graphs[0].cloneData().points;
		wholeDepth = Math.ceil(Math.log2(points.length)) +1;
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

		splitFace(boundingFace, xpoints, ypoints, 0, root, 1, null);

		var finishNode = new TreeNode();
		finishNode.data = cloneData();
		tree.root.adopt(finishNode);

		tree.node = root.children[0];

		graph.loadData(tree.node.data);
		kdTree.kd.loadData(tree.node.data);
	}

	function splitFace(face, xpoints, ypoints, dimension, parentNode, degree, kdparent) {
		
		var array = face.getPoints();
		var newarray = array.map(x => x.coords);
		var kdface = graph.board.create('polygon', newarray, {visible:false, vertices:{visible:false}});
		kdfaces.push(kdface);

		if (xpoints.length != ypoints.length) debugger;

		if (xpoints.length <= 1) {
			for (var i = 0; i < xpoints.length; ++i) {
				xpoints[i].setAttribute({ strokeColor: "Blue", fillColor: "Blue" });
			}
			face.setAttribute({ fillColor: "Blue" });

			if(KDnodes.length <= degree-1){
				var nodes = [];
				KDnodes.push(nodes);
			}
			
			var kdnode = new KDNode(kdparent.x, -1, {strokeColor:"dodgerblue", fillColor:"dodgerblue"}, degree, KDnodes[degree-1].length, wholeDepth,kdface, newarray, xpoints);
			KDnodes[degree-1].push(kdnode);

			if(kdparent){
				var kdedge = new Edge(kdparent.bot, kdnode.top,{});
				kdedges.push(kdedge);
				kdparent.setChild(kdnode);
			}
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

		// kdnode in right graph
		if(KDnodes.length <= degree-1){
			var nodes = [];
			KDnodes.push(nodes);
		}
		var kdnode;
		if(kdparent){
			kdnode = new KDNode(kdparent.x, !dimension, {strokeColor:"dodgerblue", fillColor:"white"}, degree, KDnodes[degree-1].length, wholeDepth,kdface, newarray, xpoints);
			KDnodes[degree-1].push(kdnode);
			var kdedge = new Edge(kdparent.bot, kdnode.top,{});
			kdedges.push(kdedge);
			kdparent.setChild(kdnode);
		}else{
			kdnode = new KDNode(5, !dimension, {strokeColor:"dodgerblue", fillColor:"white"}, degree, KDnodes[degree-1].length,wholeDepth, kdface, newarray, xpoints);
			kdroot = kdnode;
			KDnodes[degree-1].push(kdnode);
		}



		var node = new TreeNode();
		parentNode.adopt(node);
		node.data = cloneData();

		kdnode.setAttribute({fillColor:"dodgerblue"});

		for (var i = 0; i < xpoints.length; ++i) {
			xpoints[i].setAttribute({ strokeColor: "Black", fillColor: "Black" });
		}
		leftBotFace.setAttribute({ fillColor: "White" });
		rightTopFace.setAttribute({ fillColor: "White" });
		splitEdge.setAttribute({ strokeColor: "Black" });


		var nextDimension = -dimension + 1;
		splitFace(leftBotFace, x1Points, y1Points, nextDimension, node, degree+1, kdnode);
		splitFace(rightTopFace, x2Points, y2Points, nextDimension, node, degree+1, kdnode);
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

	function query(){
		$("#recurseRight").remove();
		$("#recurseLeft").remove();
		$("#finishRecurse").remove();
		$("#backButton").remove();
		$("#query").remove();
		$("#tutorial").remove();

		$container = $(kdTree.container.buttonContainer);
		$queryDiv = $("<div>", { id: "queryDiv" });
		$queryDiv.css('display','block');
		$container.append($queryDiv);

		$qbackButton = $("<button>", { id: "qUndoRecurse", class: "button" });
		$qbackButton.css("horizontal-align", "center");
		$qbackButton.css('display','block');
		$qbackButton.append(document.createTextNode("UndoRecurse"));
		$qbackButton.css("background-color", "lightgray");
		$qbackButton.off("click");
		$queryDiv.append($qbackButton);

		$qnextButton = $("<button>", { id: "qRecurse", class: "button" });
		$qnextButton.css("horizontal-align", "center");
		$qnextButton.css('display','block');
		$qnextButton.append(document.createTextNode("Recurse"));
		$qnextButton.css("background-color", "lightgray");
		$qnextButton.off("click");
		$queryDiv.append($qnextButton);

		$qFinishButtion = $("<button>", { id: "qFinishRecurse", class: "button" });
		$qFinishButtion.css("horizontal-align", "center");
		$qFinishButtion.css('display','block');
		$qFinishButtion.append(document.createTextNode("Finish Subtree"));
		$qFinishButtion.css("background-color", "lightgray");
		$qFinishButtion.off("click");
		$queryDiv.append($qFinishButtion);

		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var red = new desContainer("redpoint.jpeg","Current Node.",DesContainer);
		var blue = new desContainer("bluepoint.jpeg","Unvisited Node.",DesContainer);
		var green = new desContainer("darkergreenpoint.jpeg","Visited LeafNode: point stored at it lies in R.",DesContainer);
		var gray = new desContainer("graypoint.jpeg","Visited LeafNode: point stored at it doesn't lie in R.",DesContainer);
		var yellow = new desContainer("yellowpoint.jpeg"," Visited Intermediate Node: region intersects R. ",DesContainer);
		var black = new desContainer("blackpoint.jpeg","Visited Intermediate Node: region doesn't intersect R.",DesContainer);

		$container.append($(DesContainer));

		var tutorial = document.createElement('div');
		tutorial.id = "tutorial";
		tutorial.classList.add("tutorial");
		var text1 = document.createElement('div');
		text1.classList.add('subtutorial');
		text1.appendChild(document.createTextNode('* Click two points in the left panel to define a query region.'));
		tutorial.appendChild(text1);
		$container.append($(tutorial));

		graph.board.on('up', (event) => { 
			points = graph.points;
            var i;
            if(!Qflag){
				if(Qarea) oldLeftTop = findPoint(leftTop);
				
				leftTop = points[points.length-1];
				leftTop.setAttribute({face:'<>', visible:true,size:2, withLabel:false, name: points.length,fixed:true, strokeColor:"green", fillColor:"green"});
				Qflag = 1;
			}else{
				debugger
				if(Qarea) oldRightBot = findPoint(rightBot);
				rightBot = points[points.length-1];
				rightBot.setAttribute({face:'<>', visible:true,size:2, withLabel:false, name: points.length,fixed:true, strokeColor:"green", fillColor:"green"});

				var p1x = leftTop.coords[0];
				var p1y = leftTop.coords[1];
				var p2x = rightBot.coords[0];
				var p2y = rightBot.coords[1];
				if(Qarea){
					debugger
					//graph.points.splice(17,2);
					//graph.removePoint(points[oldLeftTop]);
				//	graph.removePoint(points[oldRightBot]);
					points[oldLeftTop].setAttribute({visible:false});
					points[oldRightBot].setAttribute({visible:false});
					graph.board.removeObject(Qarea);
				   
				}
				points = graph.points;
				var QareaCoords =  [[p1x,p1y],[p1x,p2y],[p2x,p2y],[p2x,p1y]];
				Qarea = graph.board.create('polygon',QareaCoords, {vertices:{visible:false}});
				Qflag = 0;

				nodesReset(kdroot);
				pointsReset();

				queryTree = new Tree();
				var root = new TreeNode();
				root.data = cloneData();
				queryTree.root = root;

				var node1 = new TreeNode();
				kdroot.setAttribute({fillColor:"red"});
				node1.data = cloneData();
				kdroot.setAttribute({fillColor:"yellow"});
				root.adopt(node1);

				searchKD(kdroot.lc, modifyBox(QareaCoords),node1 );
				searchKD(kdroot.rc,  modifyBox(QareaCoords),node1 );

				var finishNode = new TreeNode();
				finishNode.data = cloneData();
				queryTree.root.adopt(finishNode);

				queryTree.node = root;
				//graph.loadData(queryTree.moveDown().data);
				kdTree.kd.loadData(queryTree.moveDown().data);

				 updateQueryButton();
			} 
            
        });	
	}

	function queryBack(event){
		if (queryTree.getCurrentDepth() == 1) {
			queryTree.moveLeft();
			while (queryTree.node.children.length > 0) {
				queryTree.node = queryTree.node.children[queryTree.node.children.length - 1];
			}
		}
		else {
			queryTree.moveUp();
		}
		graph.loadData(queryTree.node.getData());
		kdTree.kd.loadData(queryTree.node.getData());
		updateQueryButton();
	}
	function queryRecurse(event){
		queryTree.node = queryTree.node.children[0];
		graph.loadData(queryTree.node.getData());
		kdTree.kd.loadData(queryTree.node.getData());
		updateQueryButton();

	}
	function finishQRecurse(event) {
		debugger
		while(queryTree.node.parent.children.length<2){
			queryTree.moveUp();
		}
		while (queryTree.node != queryTree.node.parent.children[0] && queryTree.getCurrentDepth() != 1) {
			queryTree.moveUp();
		}
		queryTree.node = queryTree.node.rightSibling;
		graph.loadData(queryTree.node.getData());
		kdTree.kd.loadData(queryTree.node.getData());
		updateQueryButton();
	}
    function updateQueryButton(){
		$button = $("#qRecurse");
		if (queryTree.node.children.length == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", queryRecurse);
		}

		$button = $("#qUndoRecurse");
		if (queryTree.getCurrentDepth() == 1 && queryTree.node.leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", queryBack);
		}

		$button = $("#qFinishRecurse");
		if (queryTree.getCurrentDepth() == 1 && queryTree.node.rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", finishQRecurse);
		}
	}


	function searchKD(v, R, parent){
		var node = new TreeNode();
		var array = points.map(x => x.coords);
		v.setAttribute({fillColor:"red"}); // current TreeNode
		var xpoints = v.points;
		colorPoints(xpoints, "blue");

		node.data = cloneData();
		parent.adopt(node);
		v.setAttribute({fillColor:"gray"});
		colorPoints(xpoints, "black");
		var subnode = new TreeNode();

		if(!v.lc && !v.rc){ // leaf

			var leafPoint = v.points[0];
					   
			if(testInRec(leafPoint, R)){
				v.setAttribute({fillColor:"green"});
				colorPoints(xpoints, "yellow");
			}else{
				v.setAttribute({fillColor:"gray"});
				colorPoints(xpoints, "black");
			}
			
			subnode.data = cloneData();
			node.adopt(subnode);

			return;
		}


		var box = modifyBox(v.box);
		
		
		if(box.xmin >= R.xmax || box.xmax <= R.xmin || box.ymin >= R.ymax || box.ymax <= R.ymin){  // not interset not contain
			// region doesn't intersect R
			v.setAttribute({fillColor:"black"});
			subnode.data = cloneData();
			node.adopt(subnode);
			return;
		}else{
			//region intersects R
			v.setAttribute({fillColor:"yellow"});
			searchKD(v.lc, R, node);
			searchKD(v.rc, R, node);
		}
	}
    function nodesReset(root){
		nodesList = [];
		reportSubtree(root);
		var i;
		for(i=0; i<nodesList.length; i++){
			nodesList[i].setAttribute({fillColor:"dodgerblue"});	
			nodesList[i].reset();		
		}       
	}
	function pointsReset(){
		var i;
		for(i=0; i<points.length-2; i++){
            points[i].setAttribute({strokeColor:"black", fillColor:"black"});
		}
	}
	function modifyBox(box){
		var x1, x2, y1, y2;
		var xcoords = box.map(x => x[0]);
		var ycoords = box.map(x => x[1]);

		x1 = Math.min.apply(null, xcoords);
		x2 = Math.max.apply(null, xcoords);
		y1 = Math.min.apply(null, ycoords);
		y2 = Math.max.apply(null, ycoords);
		return {xmin: x1, xmax:x2, ymin: y1, ymax:y2};
	}
	function findPoint(p){
		var res ;
		var i;
		for(i=0; i<points.length; i++){
            if(p.isNear(points[i])){
				return i;
			}
		}
		return -1;
	}
	function colorPoints(ps, color){
		var i;
		for(i=0; i<ps.length; i++){
		   var j;
		   for(j=0; j<points.length; j++){
			   if(ps[i].isNear(points[j])){
				   points[j].setAttribute({strokeColor:color, fillColor:color});
				   ps[i].setAttribute({strokeColor:color, fillColor:color});
			   }

		   }
		}
	}
	function reportSubtree(qNode){
		if(qNode.lc != null && qNode.rc != null){ // not leafNode
		   nodesList.push(qNode.lc);
		   nodesList.push(qNode.rc);
		   reportSubtree(qNode.lc);
		   reportSubtree(qNode.rc);
		}else{
			nodesList.push(qNode);
		}
		
	}
	function nextBoundaryHalfEdge(halfEdge) {
		var nextEdge = halfEdge.next;
		if (nextEdge.twin)
			nextEdge = nextEdge.twin.next;
		return nextEdge;
	}
	function testInRec(p, box){
		var x = p.coords[0];
		var y = p.coords[1];
		if(box.xmin <= x && box.xmax >= x && box.ymin <= y && box.ymax >=y){
			return true;
		}else return false;
	}
	function rightCloneData(){
		var i
		var data = {KDnodes:[], KDedges:[]}
		for(i = 0; i<KDnodes.length; i++){
			for(j=0; j<KDnodes[i].length; j++){
				data.KDnodes.push(KDnodes[i][j].clone());
			}
			
		}
		for (i = 0; i < kdedges.length; i++) {
			var p1Clone = kdedges[i].p1.clone();
			var p2Clone = kdedges[i].p2.clone();
			data.KDedges.push(kdedges[i].clone(p1Clone, p2Clone));
		}
		return data;
	}
	function cloneData() {
		var i;
		var data = { edges: [], points: [], faces: [], KDnodes: [], KDedges:[] };

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

		for(i = 0; i<KDnodes.length; i++){
			for(j=0; j<KDnodes[i].length; j++){
				data.KDnodes.push(KDnodes[i][j].clone());
			}
			
		}
		//debugger
		for (i = 0; i < kdedges.length; i++) {
			var p1Clone = kdedges[i].p1.clone();
			var p2Clone = kdedges[i].p2.clone();
			data.KDedges.push(kdedges[i].clone(p1Clone, p2Clone));
		}

		return data;
	}
}