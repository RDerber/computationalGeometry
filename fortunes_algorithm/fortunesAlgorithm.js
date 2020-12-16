window.onload = function () {
	var view = new fortunesAlgorithm();
	view.displayFortunesAlgorithm();
}

function fortunesAlgorithm() {
	var fortunesAlgorithm = this;
	var eventQueue = [];
	var pList = [];
	var sweepStatus = [];
	var points = [];
	var edges = [];
	var vedges = [];
	var paras = [];
	var dash_paras = [];
	var breaks = {};
	var centers = {};
	var circles = [];
	var vEdge = {};
	var intersections = [];
	var tree = new Tree();
	var root = tree.root;
	var tableLines = [];
	var curve = null;
	this.graph;
	this.container;

	var eventType = {
		site: 1,
		circle: 2
	};

	function vEdgeNode(){
		this.bound = []
		this.leftpoint = null;
		this.rightpoint = null;
	}

	function Event(point, type){
		this.point = point;
		this.type = type;
		this.circle = null;
		this.curvePointer = null;
		this.ptOnCircle = null;
	}

	function pNode(point){
		this.point = point;
		this.leftbound = null;
		this.rightbound = null;
		this.prevIntersectIndex = null;
	}

	function CurveNode(upperpoint, lowerpoint, leftChild, rightChild, breakpos) {
		this.upperpoint = upperpoint;
		this.lowerpoint = lowerpoint;
		this.leftChild = leftChild;
		this.rightChild = rightChild;
		this.breakpos = breakpos;
		this.breaks = null;
		this.breakmark = null;
		this.isLeaf = false;
	}

	function Leaf(point){
		this.point = point;
		this.isLeaf = true;
		this.circleEvent = null;
		this.parent = null;
	}

	this.displayFortunesAlgorithm = function (event) {
		var desc = document.createElement("div");
		desc.style.whiteSpace = "pre";

		var table = document.createElement("table");
		table.style.tableLayout = "fixed";
		table.style.fontSize = "small";
		table.style.borderCollapse = "collapse";
		desc.appendChild(table);
		
		var lines =
			["Fortunes Algorithm",
			"-------------------",
			"MainFunction(points):",
			"    order points by y value",
			"    create site events by given points",
			"    insert site events into a event queue Q",
			"    while Q is not empty:",
			"        pop the event from Q",
			"        EventHandler(event)",
			"EventHandler(event):",
			"    if the event is site event:",
			"        insert the site into parabola list",
			"           (create the list if it is the first site)",
			"        insert a new circle event if this new site and",
			"           its sibling form a new empty circle",
			"    else:",
			"        create a voronoi vertex",
			"        remove disappering parabola from the list",
			"        insert a new circle event if there is new",
			"           empty circle detected after removing"]

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
		}

		fortunesAlgorithm.container = new GraphContainer("Fortune's Algorithm", [] , desc)

		var width = fortunesAlgorithm.container.graphDiv.clientWidth;
	   	var height = fortunesAlgorithm.container.graphDiv.clientHeight;
		var attr = { interactionType: "pointGraph", boundingbox: [0, 100, 100*Math.round((width/height)*100)/100, 0] };
		fortunesAlgorithm.graph = new Graph(attr, fortunesAlgorithm.container.graphDiv);

		var buttonContainer = fortunesAlgorithm.container.buttonContainer;
		buttonContainer.id = "buttonContainer";
		buttonContainer.style.width = "320px";

		var button = document.createElement('div');
		button.id = "computefortunesAlgorithm";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Start Algorithm"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		var text1 = "1. Click in the left panel to add points, or use the Random Point button.";
		var text2 = "2. Click Start Algorithm button."

		this.graph.createTutorial(20, 85, text1);
		this.graph.createTutorial(20, 75, text2);
	}

	function transition() {
		fortunesAlgorithm.graph.freeze();

		$("#computefortunesAlgorithm").remove();
		$("#tutorial").remove();

		var $buttonContainer = $("#buttonContainer");

		var $eventButtonContainer = $(document.createElement("div"));
		$eventButtonContainer.css("display", "block");

		$buttonContainer.append($eventButtonContainer);
	   
		var $deseventContainer = $(document.createElement("div", { display:"block"}));
		$deseventContainer.append(document.createTextNode("Event is ordered by the"));
		$deseventContainer.append(document.createTextNode("Y-coordinate of event points."));
		$eventButtonContainer.append($deseventContainer);

		var $preeventContainer = $(document.createElement("div"));
        $preeventContainer.css("display", "inline-block");
		var $prevEventButton = $("<button>", { id: "prevEventButton", class: "button" });
		$prevEventButton.on("click", prev);
		$prevEventButton.append(document.createTextNode("Prev Event"))
		$preeventContainer.append($prevEventButton);
		$eventButtonContainer.append($preeventContainer);

		var $nextvEventContainer = $(document.createElement("div", { display:"flex", width:"150px"}));
		$nextvEventContainer.css("display", "inline-block");
		var $nextEventButton = $("<button>", { id: "nextEventButton", class: "button" });
		$nextEventButton.on("click", next);
		$nextEventButton.append(document.createTextNode("Next Event"))
		$nextvEventContainer.append($nextEventButton);
		$eventButtonContainer.append($nextvEventContainer);

		computefortunesAlgorithm();
		updateButtons();

		// Checkbox Container
		var boxContainer = document.createElement('div');
		boxContainer.style.width = "330px";

	    var paradiv = document.createElement('div');
	    var paracheckbox = document.createElement('input');
	    paracheckbox.setAttribute("type", "checkbox");
	    paracheckbox.setAttribute("id", "paracheckbox");
	    paracheckbox.addEventListener("click", function(){
	        if(document.getElementById("paracheckbox").checked)  {
	        	showDashParabola();
	        }
	        else {
	        	hideDashParabola();
	        }

	        var data = cloneData();

			fortunesAlgorithm.graph.loadData(data);

	    });
	    paradiv.appendChild(paracheckbox);
	    paradiv.appendChild(document.createTextNode("Show Full Parabolas"));
	    boxContainer.appendChild(paradiv);

	    var cirdiv = document.createElement('div');
	    var circheckbox = document.createElement('input');
	    circheckbox.setAttribute("type", "checkbox");
	    circheckbox.setAttribute("id", "circheckbox");
	    circheckbox.addEventListener("click", function(){
	        if(document.getElementById("circheckbox").checked) {
	        	hideCircle();
	        }
	        else {
	        	showCircle();
	        }

	        var data = cloneData();

			fortunesAlgorithm.graph.loadData(data);
	    });

	    cirdiv.appendChild(circheckbox);
	    cirdiv.appendChild(document.createTextNode("Hide Empty Circle"));
	    boxContainer.appendChild(cirdiv);

	    var edgediv = document.createElement('div');
	    var edgecheckbox = document.createElement('input');
	    edgecheckbox.setAttribute("type", "checkbox");
	    edgecheckbox.setAttribute("id", "edgecheckbox");
	    edgecheckbox.addEventListener("click", function(){
	        if(document.getElementById("edgecheckbox").checked) {
	        	hideEdge();
	        }
	        else {
	        	showEdge();
	        }

	        var data = cloneData();

			fortunesAlgorithm.graph.loadData(data);
	    });

	    edgediv.appendChild(edgecheckbox);
	    edgediv.appendChild(document.createTextNode("Hide Voronoi Edges"));
	    boxContainer.appendChild(edgediv);


	    $buttonContainer.append($(boxContainer));

		// Description Container
		var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var redpoint = new desContainer("redpoint.jpeg","current event point.",DesContainer);
		var reddash = new desContainer("reddashedge.jpeg", "empty circle on circle event", DesContainer);
		var blackpoint = new desContainer("bluepoint.jpeg","coloring points correspond to parabolas.",DesContainer);
		var blackedge = new desContainer("blueedge.jpeg","coloring porabolas form the beach line.",DesContainer);
		var blueedge = new desContainer("blackedge.jpeg","current voronoi edges.",DesContainer);
        
		$buttonContainer.append($(DesContainer));
	}

	function prev() {
		if (tree.node.leftSibling == null) return;
		readData(tree.moveLeft().data);
		if(document.getElementById("paracheckbox").checked) {
	    	showDashParabola();
	    }
	    
	    if(document.getElementById("circheckbox").checked) {
	    	hideCircle();
	    }

	    if(!document.getElementById("edgecheckbox").checked) {
	    	showEdge();
	    }

	    if(circles.length == 0){
	    	highlightSiteEvent();
	    }
	    else{
	    	highlightCircleEvent();
	    }

	    var data = cloneData();

		fortunesAlgorithm.graph.loadData(data);
		updateButtons();
	}

	function next() {
		if (tree.node.rightSibling == null) return;
		readData(tree.moveRight().data);
		if(document.getElementById("paracheckbox").checked) {
	    	showDashParabola();
	    }
	    
	    if(document.getElementById("circheckbox").checked) {
	    	hideCircle();
	    }

	    if(!document.getElementById("edgecheckbox").checked) {
	    	showEdge();
	    }

	    if(circles.length == 0){
	    	highlightSiteEvent();
	    }
	    else{
	    	highlightCircleEvent();
	    }

	    var data = cloneData();

		fortunesAlgorithm.graph.loadData(data);
		updateButtons();
	}

	function updateButtons() {
		var $button = $("#nextEventButton");
		if (tree.node.rightSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", next);
		}

		$button = $("#prevEventButton");
		if (tree.node.leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", prev);
		}
	}

	function assignColor(){
		var i;
		var step = 320 / points.length;
		for (i = 0; i < points.length; i++){
			var hue = i * step + 20;
			var sat = Math.random() * 20 + 80;
			var light = Math.random() * 10 + 50;

			var str = "hsl(" + hue + "," + sat + "%," + light +"%)";

			points[i].setAttribute({ strokeColor : str, fillColor: str });
		}
	}

	function computefortunesAlgorithm() {
		points = fortunesAlgorithm.graph.cloneData().points;
		points = points.sort(Point.compareY).reverse();

		assignColor();

		var i;
		for (i = 0; i < points.length; i++){
			eventQueue.push(new Event(points[i], eventType.site));
		}

		while(eventQueue.length){
			performEvent(eventQueue.shift());
		}

		fortunesAlgorithm.graph.loadData(tree.moveDown().data);
	}

	function performEvent(event) {
		if(event.type == 1){
			siteEvent(event);
		}
		else{
			circleEvent(event);
		}
	}

	function updateNodeList(node1, node2, node3, center, p){
		breaks = {};

		var code1 = getCode(node1.point, node2.point);

		computeBreakPoint(node1, node2, p.y);

		var inters = breaks[code1];
		var target = inters[node2.prevIntersectIndex];
		var other = inters[(node2.prevIntersectIndex+1)%2];


		if (target.x > other.x){
			vEdge[code1].rightpoint = center;
		}
		else{
			vEdge[code1].leftpoint = center;
		}
		

		
		var code2 = getCode(node2.point, node3.point);

		computeBreakPoint(node2, node3, p.y);

		inters = breaks[code2];
		target = inters[node3.prevIntersectIndex];
		other = inters[(node3.prevIntersectIndex+1)%2];

		if (target.x > other.x){
			vEdge[code2].rightpoint = center;
		}
		else{
			vEdge[code2].leftpoint = center;
		}
		
		

		var code3 = getCode(node1.point, node3.point);

		computeBreakPoint(node1, node3, p.y);
		inters = breaks[code3];

		if(node1.point.y < node3.point.y){
			node3.prevIntersectIndex = 1;
		}
		else{
			node3.prevIntersectIndex = 0;
		}

		
		target = inters[node3.prevIntersectIndex];
		other = inters[(node3.prevIntersectIndex+1)%2];

		if (target.x > other.x){
			vEdge[code3].leftpoint = center;
		}
		else{
			vEdge[code3].rightpoint = center;
		}	
	}

	function circleEvent(event) {
		edges = [];
		vedges = [];
		var p = event.point;
		var edge = new Edge(p, new Point([event.point.x - 1, event.point.y], { visible: false }), { straightFirst: true, straightLast: true, strokeColor:'grey', dash:2 });
		edges.push(edge);

		circles.push(event.circle);

		var center = event.circle.center;
		var intersection = new Point([center.x, center.y], { visible: false });

		var i = pList.indexOf(event.curvePointer);

		updateNodeList(pList[i-1], pList[i], pList[i+1], intersection, p);
		
		pList.splice(i, 1);

		paras = [];
		dash_paras = [];
		breaks = {};
		drawCurve(p.y);

		

		if (pList[i+1]){
			var key = computeKey(pList[i-1], pList[i], pList[i+1]);
			if(!centers[key]){
				var cir = checkCircle(pList[i-1], pList[i], pList[i+1]);
				if (cir != null && cir[0] > pList[i].leftbound.x){
					insertCircle(pList[i-1], pList[i], pList[i+1], key, cir);
				}
			}
		}

		if(pList[i-2]){
			var key = computeKey(pList[i-2], pList[i-1], pList[i]);
			if(!centers[key]){
				var cir = checkCircle(pList[i-2], pList[i-1], pList[i]);
				if (cir != null && cir[0] < pList[i].point.x){
					insertCircle(pList[i-2], pList[i-1], pList[i], key, cir);
				}
			}	
		}

		points.push(event.circle.center);
		drawEdges();

		var node = new TreeNode();
		node.data = cloneData();
		root.adopt(node);

		points.splice(points.indexOf(event.circle.center), 1);
		circles = [];
		resetCurves();
	}

	function ptColor(plist){
		var attrs = [];
		var i;
		for (i = 0; i < plist.length; i++) {
			attrs.push(plist[i].getAttribute());
			plist[i].setAttribute({fillColor: 'orange', strokeColor: 'orange'});
		}

		return attrs;
	}

	function ptColorReset(plist, attrs){
		var i;
		for (i = 0; i < plist.length; i++) {
			plist[i].setAttribute(attrs[i]);
		}
	}

	function insertCircle(node1, node2, node3, key, cir){
		var p;
		var ymin = node1.point.y;

		if(node2.point.y < ymin)
			ymin = node2.point.y;

		if(node3.point.y < ymin)
			ymin = node3.point.y

		if(ymin < (cir[1] - cir[2])){
			p = new Point([cir[0], ymin - 0.01], {visible: false});
		}
		else{
			p = new Point([cir[0], cir[1] - cir[2]], {visible: false});
		}
		
		var event = new Event(p, eventType.circle);
		
		var center = new Point([cir[0], cir[1]], {fillColor: 'red', strokeColor : 'red'});
		event.circle = new Circle(center, cir[2], {strokeColor : 'red', dash : 2});
		event.ptOnCircle = [node1.point, node2.point, node3.point];
		event.curvePointer = node2;

		var j;
		for (j = 0; j < eventQueue.length; j++){
			if(p.y > eventQueue[j].point.y)
				break;
		}

		eventQueue.splice(j, 0, event);
		centers[key] = cir;
	}

	function siteEvent(event){
		edges = [];
		vdeges = [];
		var p = event.point;
		var edge = new Edge(p, new Point([event.point.x - 1, event.point.y], { visible: false }), { straightFirst: true, straightLast: true, strokeColor:'grey', dash:2 });
		edges.push(edge);

		var attr = p.getAttribute();
		p.setAttribute({fillColor: 'red', strokeColor: 'red'});

		if (pList.length == 0){
			pList.push(new pNode(p));
			
			var node = new TreeNode();
			node.data = cloneData();
			root.adopt(node);
		}
		else {
			paras = [];
			dash_paras = []
			breaks = {};
			drawCurve(p.y);

			var i;
			for (i = 0; i < pList.length; i++){
				if(pList[i].rightbound == null){
					break;	
				}

				if(p.x < pList[i].rightbound.x){
					break;
				}
			}

			var a = 1 / (2 * pList[i].point.y - 2 * p.y);
			var b = -pList[i].point.x / (pList[i].point.y - p.y);
			var c = (pList[i].point.x**2 + pList[i].point.y**2 - p.y**2) / (2 * pList[i].point.y - 2 * p.y);
			var y = a * (p.x**2) + b * p.x + c

			var vEdge = new Edge(p, new Point([p.x, y], { visible: false }), {strokeColor:'red'});
			edges.push(vEdge);

			drawEdges();

			var node = new TreeNode();
			node.data = cloneData();
			root.adopt(node);

			insertNode(i, p);
			resetCurves();
		}

		p.setAttribute(attr);
	}

	function drawEdges(){
		for (var code in vEdge){
			var edge = new Edge(vEdge[code].bound[0], vEdge[code].bound[1], {strokeColor:'black'});
			vedges.push(edge);
		}
	}

	function resetCurves(){
		var i;
		for (i = 0; i < pList.length; i++){
			pList[i].leftbound = null;
			pList[i].rightbound = null;
		}
	}

	function computeBreakPoint(node1, node2, y) {
		/* 	(x-x1)^2 + (y-y1)^2 = (y-y0)^2 
			y = x^2/2(y1-y0) - x1x/(y1-y0) + (x1^2 + y1^2 - y0^2)/2(y1-y0)
		*/
		var p1 = node1.point;
		var p2 = node2.point;
		var code = getCode(p1, p2);

		if(!breaks[code]){
			var leftbreak, rightbreak;

			var a1 = 1 / (2 * p1.y - 2 * y);
			var a2 = 1 / (2 * p2.y - 2 * y);

			var b1 = -p1.x / (p1.y - y);
			var b2 = -p2.x / (p2.y - y);

			var c1 = (p1.x**2 + p1.y**2 - y**2) / (2 * p1.y - 2 * y);
			var c2 = (p2.x**2 + p2.y**2 - y**2) / (2 * p2.y - 2 * y);

			var a = a1 - a2;
			var b = b1 - b2;
			var c = c1 - c2;

			var x1 = (- b - Math.sqrt(b**2 - 4*a*c)) / (2*a);
			var x2 = (- b + Math.sqrt(b**2 - 4*a*c)) / (2*a);

			var y1 = a1 * x1**2 + b1 * x1 + c1;
			var y2 = a1 * x2**2 + b1 * x2 + c1;

			if (x1 < x2){
				leftbreak = new Point([x1, y1], { visible: false });
				rightbreak = new Point([x2, y2], { visible: false });
			}
			else{
				rightbreak = new Point([x1, y1], { visible: false });
				leftbreak = new Point([x2, y2], { visible: false });
			}

			breaks[code] = [leftbreak, rightbreak];

			var bound = [leftbreak, rightbreak];

			if (!vEdge[code]){
				var newNode = new vEdgeNode();
				newNode.bound = bound;

				vEdge[code] = newNode;
			}
			else{
				var node = vEdge[code];
				if (node.leftpoint){
					bound[0] = node.leftpoint;
				}

				if (node.rightpoint){
					bound[1] = node.rightpoint;
				}

				node.bound = bound;
			}
			
		}

		return breaks[code][node2.prevIntersectIndex];
	}

	function drawCurve(y){
		var i;
		for(i = 0; i < pList.length - 1; i++){
			var breakpos = computeBreakPoint(pList[i], pList[i+1], y);
			pList[i].rightbound = breakpos;
			pList[i+1].leftbound = breakpos;

			var radbound = [-Math.PI*3/2, Math.PI/2];
			if(pList[i].leftbound != null){
				var rad = Math.atan2(pList[i].leftbound.y - pList[i].point.y, pList[i].leftbound.x - pList[i].point.x);
				if (rad > Math.PI/2){
					rad -= 2 * Math.PI;
				}
				radbound[0] = rad;
			}

			var rad = Math.atan2(breakpos.y - pList[i].point.y, breakpos.x - pList[i].point.x);
			if (rad > Math.PI/2){
				rad -= 2 * Math.PI;
			}
			radbound[1] = rad;
			para = new Parabola(pList[i].point, [[0, y], [1, y]], radbound, pList[i].point.getAttribute());
			para.setAttribute({fillColor : 'none'});
			paras.push(para);

			var dash_para = new Parabola(pList[i].point, [[0, y], [1, y]], [-Math.PI*3/2, Math.PI/2], pList[i].point.getAttribute());
			dash_para.setAttribute({fillColor : 'none', dash : 2});
			dash_paras.push(dash_para);
		}

		var radbound = [-Math.PI*3/2, Math.PI/2];
		if(pList[i].leftbound != null){
			var rad = Math.atan2(pList[i].leftbound.y - pList[i].point.y, pList[i].leftbound.x - pList[i].point.x);
			if (rad > Math.PI/2){
				rad -= 2 * Math.PI;
			}
			radbound[0] = rad;
		}

		para = new Parabola(pList[pList.length-1].point, [[0, y], [1, y]], radbound, pList[pList.length-1].point.getAttribute());
		para.setAttribute({fillColor : 'none'});
		paras.push(para);

		var dash_para = new Parabola(pList[pList.length-1].point, [[0, y], [1, y]], [-Math.PI*3/2, Math.PI/2], pList[pList.length-1].point.getAttribute());
		dash_para.setAttribute({fillColor : 'none', dash : 2});
		dash_paras.push(dash_para);
	}

	function computeKey(node1, node2, node3){
		var p1 = node1.point;
		var p2 = node2.point;
		var p3 = node3.point;

		return (p1.x + p2.x + p3.x + p1.y + p2.y + p3.y).toFixed(10);
	}

	function insertNode(index, point) {
		var newNode = new pNode(point);
		newNode.prevIntersectIndex = 0;

		var copy = new pNode(pList[index].point);
		copy.prevIntersectIndex = pList[index].prevIntersectIndex;

		pList[index].prevIntersectIndex = 1;

		pList.splice(index, 0, newNode);
		pList.splice(index, 0, copy);

		var i = index + 1;
		if(pList.length >= 5){

			if (pList[i+2]){
				var key = computeKey(pList[i], pList[i+1], pList[i+2]);
				if(!centers[key]){
					var cir = checkCircle(pList[i], pList[i+1], pList[i+2]);
					if (cir != null && cir[0] > pList[i].point.x){
						insertCircle(pList[i], pList[i+1], pList[i+2], key, cir);
					}
				}
			}

			if(pList[i-2]){
				var key = computeKey(pList[i-2], pList[i-1], pList[i]);
				if(!centers[key]){
					var cir = checkCircle(pList[i-2], pList[i-1], pList[i]);
					if (cir != null && cir[0] < pList[i].point.x){
						insertCircle(pList[i-2], pList[i-1], pList[i], key, cir);
					}
				}	
			}
		}
	}

	function checkCircle(node1, node2, node3){
		var p1 = node1.point;
		var p2 = node2.point;
		var p3 = node3.point;

		var a1 = 2*(p2.x - p1.x);
		var b1 = 2*(p2.y - p1.y);
		var c1 = p2.x**2 + p2.y**2 - p1.x**2 - p1.y**2;

		var a2 = 2*(p3.x - p2.x);
		var b2 = 2*(p3.y - p2.y);
		var c2 = p3.x**2 + p3.y**2 - p2.x**2 - p2.y**2;

		var x = (c1*b2 - c2*b1) / (a1*b2 - a2*b1);
		var y = (a1*c2 - a2*c1) / (a1*b2 - a2*b1);
		var r = Math.sqrt((x-p1.x)**2 + (y-p1.y)**2);

		var i = 0;
		for(i = 0; i < points.length; i++){
			var d = Math.sqrt((x-points[i].x)**2 + (y-points[i].y)**2);
			if(d < (r-0.1) && points[i] != p1 && points[i] != p2 && points[i] != p3){
				return null;
			}
		}

		return [x,y,r];
	}

	function showEdge(){
		readData(tree.node.data);
		edges = edges.concat(vedges);
		if(document.getElementById("paracheckbox").checked){
			paras = paras.concat(dash_paras);
		}

		if(document.getElementById("circheckbox").checked){
			hideCircle();
		}
	}

	function hideEdge(){
		edges = edges.filter(n => !vedges.includes(n));
	}

	function showCircle(){
		readData(tree.node.data);
		if(document.getElementById("paracheckbox").checked){
			showDashParabola();
		}

		if(!document.getElementById("edgecheckbox").checked){
			showEdge();
		}
	}

	function hideCircle(){
		circles = [];
	}

	function showDashParabola(){
		readData(tree.node.data);
		paras = paras.concat(dash_paras);
		if(document.getElementById("circheckbox").checked){
			hideCircle();
		}

		if(!document.getElementById("edgecheckbox").checked){
			edges = edges.concat(vedges);
		}		
	}

	function hideDashParabola(){
		paras = paras.filter(n => !dash_paras.includes(n));
	}

	function getCode(p1, p2){
		return (p1.x + p1.y + p2.x + p2.y).toFixed(10);
	}

	function compareEventY(event1, event2) {
		return Point.compareY(event1.point, event2.point);
	}

	function highlightSiteEvent(){
		tableLines[10].style.backgroundColor = "tan";
		tableLines[11].style.backgroundColor = "tan";
		tableLines[12].style.backgroundColor = "tan";
		tableLines[13].style.backgroundColor = "tan";
		tableLines[14].style.backgroundColor = "tan";
		tableLines[15].style.backgroundColor = "";
		tableLines[16].style.backgroundColor = "";
		tableLines[17].style.backgroundColor = "";
		tableLines[18].style.backgroundColor = "";
		tableLines[19].style.backgroundColor = "";
	}

	function highlightCircleEvent(){
		tableLines[10].style.backgroundColor = "";
		tableLines[11].style.backgroundColor = "";
		tableLines[12].style.backgroundColor = "";
		tableLines[13].style.backgroundColor = "";
		tableLines[14].style.backgroundColor = "";
		tableLines[15].style.backgroundColor = "tan";
		tableLines[16].style.backgroundColor = "tan";
		tableLines[17].style.backgroundColor = "tan";
		tableLines[18].style.backgroundColor = "tan";
		tableLines[19].style.backgroundColor = "tan";
	}

	function readData(data){
		edges = data.edges;
		points = data.points;
		paras = data.paras;
		circles = data.circles;
		dash_paras = data.dash_paras;
		vedges = data.vedges;
	}

	function cloneData() {
		var data = {edges: [], points: [], paras: [], circles: [], dash_paras: [], vedges: []};
		var i;
		for (i = 0; i < points.length; ++i) {
			data.points.push(points[i].clone());
		}

		for (i = 0; i < edges.length; ++i) {
			var p1, p2;
			p1 = edges[i].p1.clone();
			p2 = edges[i].p2.clone();
			data.points.push(p1);
			data.points.push(p2);
			data.edges.push(edges[i].clone(p1,p2));
		}

		for (i = 0; i < paras.length; i++) {
			data.paras.push(paras[i].clone());
		}

		for (i = 0; i < circles.length; i++) {
			data.circles.push(circles[i].clone());
		}

		for (i = 0; i < dash_paras.length; i++) {
			data.dash_paras.push(dash_paras[i].clone());
		}

		for (i = 0; i < vedges.length; ++i) {
			var p1, p2;
			p1 = vedges[i].p1.clone();
			p2 = vedges[i].p2.clone();
			data.points.push(p1);
			data.points.push(p2);
			data.vedges.push(vedges[i].clone(p1,p2));
		}

		return data;
	}
}