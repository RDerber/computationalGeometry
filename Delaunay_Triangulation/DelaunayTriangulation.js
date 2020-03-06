window.onload = function () {
    var view = new PointLGraph();
    view.displayPL();
}

function PointLGraph(){
	var pointLGraph = this;
	this.container;
	var graph;

    var vo = d3.voronoi();
	var points = [];
    var tris = [];
    var edges = [];
    var points2tris = [];
    var edges2tris = [];
    var circle;
    var flag = 0;
    var background;
    var tableLines = [];
    
	var shiftPress = 0;
	var tree;
    var root;


    var starPoint;
    var bb ;
    var bbox ;

    var T0  ;
    var innerFlag = 0;
 
    function Point2Tri(pa, pb, pc, tri){ // pa , pb, pc  (index of points) tri (index of tris)
        this.pa = pa;
        this.pb = pb;
        this.pc = pc;
        this.tri = tri;
    }
 
    function Edge2Tri(edge, p){ // edge Edge(), p2tri1, p2tri2 (index of points2tris)
        this.edge = edges.indexOf(edge);
        this.p = p;  // index of points
        this.p2tri1 = -1;
        this.p2tri2 = -1;
    }
   
	this.displayPL = function(event){
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
                ["Delaunay Triangulation",
                    "Outer Loop:",
                    "    Find next edge which needs to be checked.",
                    "Inner Loop:",
                    "    Find triangles that share current edge.",
                    "    Draw empty circle",
                    "    If 4th point is inside the empty circle, flip the \n    diagonal and add new 2 edges into check list."];

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

        pointLGraph.container = new GraphContainer("Incremental Delaunay Triangulation", [], desc);
        var graphdiv = pointLGraph.container.graphDiv;
      // graphdiv.style.width = "890px";
       var attr= {boundingbox: [0, 100, 100*Math.round((graphdiv.clientWidth/graphdiv.clientHeight)*100)/100, 0], 
                  interactionType:"pointGraph", 
                  keepAspectRatio: true, 
                  
                  showNavigation: false, 
                  showCopyright: false};
       
       graph = new Graph(attr,graphdiv);
	   var buttonContainer = pointLGraph.container.buttonContainer;


       var button = document.createElement('div');  // compute Point Location button 
	   button.id = "pointlocation";
	   button.classList.add("button");

	   var buttontext = document.createElement('div'); // textnode  
	   buttontext.classList.add("button-content");
	   buttontext.appendChild(document.createTextNode("Triangulation"));
	   button.appendChild(buttontext);
	   button.addEventListener('click', transition); // click event
       buttonContainer.appendChild(button);
 
       
       bb = graph.board.getBoundingBox();
       bbox = {xl: bb[0], xr: bb[2], yt: bb[3], yb: bb[1]}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
       
       /*var tutorial = document.createElement('div');
       tutorial.id = "tutorial";
       tutorial.classList.add("tutorial");
       var text1 = document.createElement('div');
       text1.classList.add('subtutorial');
       text1.appendChild(document.createTextNode('1. Click in the left panel to place new points, or use the Random Points button.'));
       tutorial.appendChild(text1);
       var text2 = document.createElement('div');
       text2.classList.add('subtutorial');
       text2.appendChild(document.createTextNode('2. Click Triangulation button.'));
       tutorial.appendChild(text2);
       buttonContainer.appendChild(tutorial);*/

        var text1 = "1. Click in the left panel to place new points, or use the Random Points button.";
        var text2 = "2. Click Triangulation button."

        graph.createTutorial(bb[0]+40, bb[1]-10, text1);
        graph.createTutorial(bb[0]+40, bb[1]-20, text2);
    
    }
    


	function transition(){
        points = graph.cloneData().points;
      
        computeDel();

        var $buttonContainer = $(pointLGraph.container.buttonContainer);
		$("#pointlocation").remove();
        $("#tutorial").remove();

        var outerLoopContainer = document.createElement("div");
		outerLoopContainer.className = "loop"
		var outerdes = document.createElement("div");
		outerdes.className = "loopdes";
		outerdes.appendChild(document.createTextNode("Outer Loop Buttons:"));
		outerLoopContainer.appendChild(outerdes);
		var $outerLoopContainer = $("<div>");
		outerLoopContainer.appendChild($outerLoopContainer[0]);
		$outerLoopContainer.css("display", "flex");
        
		var $outerBackButton = $("<div>", { id: "outerBackButton", class: "button" });
		$outerBackButton.on("click", prev);
		var $outerBackText = $('<div>', { class: "button-content" });
		$outerBackText.append(document.createTextNode("Back"));
		$outerBackButton.append($outerBackText);
        $outerLoopContainer.append($outerBackButton);
        $outerBackButton.css("background-color", "lightgray");
        $outerBackButton.off();

		var $outerForwardButton = $("<div>", { id: "outerForwardButton", class: "button" });

        $outerForwardButton.on("click", next);
		var $outerForwardText = $('<div>', { class: "button-content" });
		$outerForwardText.append(document.createTextNode("Next"));
		$outerForwardButton.append($outerForwardText);
        $outerLoopContainer.append($outerForwardButton);
        $outerForwardButton.css("background-color", "lightgray");
        $outerForwardButton.off();

        $buttonContainer.append($(outerLoopContainer));
        
        
        var innerLoopContainer = document.createElement("div");
		innerLoopContainer.className = "loop"
		var innerdes = document.createElement("div");
        innerdes.className = "loopdes";
        
        innerdes.appendChild(document.createTextNode("Inner Loop Buttons:"))

        /*var $innerStep1 = $("<div>", { id: "innerStep1" });
        $innerStep1.append(document.createTextNode("Step1: Find triangles that share current edge."));
        var $innerStep2 = $("<div>", { id: "innerStep2" });
        $innerStep2.append(document.createTextNode("Step2: Draw empty circle"));
        var $innerStep3 = $("<div>", { id: "innerStep3" });
        $innerStep3.append(document.createTextNode("Step3: If 4th point is inside the empty circle, flip the diagonal and add new 2 edges into check list."));


        innerdes.appendChild($innerStep1[0]);
        innerdes.appendChild($innerStep2[0]);
        innerdes.appendChild($innerStep3[0]);
        innerLoopContainer.appendChild(innerdes);
        var descriptionDiv = document.createElement("div");
        descriptionDiv.style.width = "100%";
        descriptionDiv.style.marginTop = "5px";
        descriptionDiv.style.padding = "4px";
        descriptionDiv.appendChild(outerdes);
        descriptionDiv.appendChild(innerdes);*/
        innerLoopContainer.appendChild(innerdes);
        var $innerLoopContainer = $("<div>");
		$innerLoopContainer.css("display", "flex");
		innerLoopContainer.appendChild($innerLoopContainer[0]);


		var $innerBackButton = $("<div>", { id: "innerBackButton", class: "button" });
		$innerBackButton.on("click", moveLeftInnerLoop);
		var $innerBackText = $('<div>', { class: "button-content" });
		$innerBackText.append(document.createTextNode("Back"));
        $innerBackButton.append($innerBackText);
        $innerBackButton.css("background-color", "lightgray");
		$innerLoopContainer.append($innerBackButton);

		var $innerForwardButton = $("<div>", { id: "innerForwardButton", class: "button" });
		$innerForwardButton.on("click", moveRightInnerLoop);
		var $innerForwardText = $('<div>', { class: "button-content" });
		$innerForwardText.append(document.createTextNode("Next"));
        $innerForwardButton.append($innerForwardText);
        $innerForwardButton.css("background-color", "lightgray");
		$innerLoopContainer.append($innerForwardButton);

        $buttonContainer.append($(innerLoopContainer));
        
        var DesContainer = document.createElement('div');
		DesContainer.className = "des";

		var green = new desContainer("greenpoint.jpeg","Current point.",DesContainer);
        var greenEdge = new desContainer("greenedge.jpeg","Current edge.",DesContainer);
        var redEdge = new desContainer("rededge.jpeg","Unchecked edge.",DesContainer);
        var blueEdge = new desContainer("blueedge.jpeg","Legal edge.",DesContainer);
        var yellowFace = new desContainer("yellowface.jpeg","Triangles that share current edge.",DesContainer);
        $buttonContainer.append($(DesContainer));

        var $warningBox = $("<div>", { id: "warningBox"});
        $warningBox.append(document.createTextNode("Please draw point inside the diagram."));
        $warningBox.css('display', 'none');
        $warningBox.css('font-size', '20px');
        $warningBox.css('font-weight', 'bold');
        $buttonContainer.append($warningBox);
       
        var tutorial = document.createElement('div');
        tutorial.id = "tutorial";
        tutorial.classList.add("tutorial");
        var text1 = document.createElement('div');
        text1.classList.add('subtutorial');
        text1.appendChild(document.createTextNode('* Click on the left panel to add a new point to start the incremental algorithm.'));
        tutorial.appendChild(text1);
        $buttonContainer.append($(tutorial));

        tree.node = tree.root;
        loadData(tree.node.data);
        //$buttonContainer.css("display", "none");
        
        graph.board.on('up', (event) => { 
            reset();
            clearStepColor();
            points = graph.points;
            var i;
            for(i=0; i<points.length-1; i++){
                points[i].setAttribute({size:3,face:'o',withLabel:false, name:i+1, strokeColor:"black", fillColor:"black", isDraggable:false});
            }
            starPoint  = points[points.length-1];
            starPoint.setAttribute({face:'<>', size:5, withLabel:false, name: points.length,fixed:true, strokeColor:"blue", fillColor:"blue"});
            $buttonContainer.css("display", "block");

            computeDel();

            if(IncrementalTriangulation()){
                points = graph.cloneData().points;
                tree.moveDown();
                loadData(tree.moveDown().data);
                updateButtons();
            }
        });	

 
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
			$button.on("click", next);
		}

		$button = $("#outerBackButton");
		if (tree.moveToDepth(2).leftSibling == null) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", prev);
		}

        $button = $("#innerForwardButton");
        if(tree.moveToDepth(2).children.length == 0){
			$button.css("background-color", "lightgray");
			$button.off("click");
        }else{
            if (tree.moveToDepth(3).rightSibling == null) {
                $button.css("background-color", "lightgray");
                $button.off("click");
            }
            else {
                $button.css("background-color", "dodgerblue");
                $button.off("click");
                $button.on("click", moveRightInnerLoop);
            }

        }


        $button = $("#innerBackButton");
        if(tree.moveToDepth(2).children.length == 0){
            $button.css("background-color", "lightgray");
			$button.off("click");
        }else{
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
    }


	function prev(event) {
        innerFlag=0;
        checkStepColor();
		tree.node = tree.moveToDepth(2);
		tree.moveLeft();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		loadData(tree.node.getData());
		updateButtons();
	}

	function next(event) {
        innerFlag=0;
        checkStepColor();
		tree.node = tree.moveToDepth(2);
		tree.moveRight();
		while (tree.node.children.length > 0) {
			tree.node = tree.node.children[0];
		}
		loadData(tree.node.getData());
		updateButtons();
    }
    
    function moveRightInnerLoop(event) {
        innerFlag++;
        checkStepColor();
		tree.node = tree.moveToDepth(3);
		tree.moveRight();
		loadData(tree.node.getData());
		updateButtons();
	}

	function moveLeftInnerLoop(event) {
        innerFlag--;
        checkStepColor();
		tree.node = tree.moveToDepth(3);
		tree.moveLeft();
		loadData(tree.node.getData());
		updateButtons();
	}

    function checkStepColor(){
        clearStepColor();
        if(innerFlag%3 == 0) tableLines[4].style.backgroundColor = "#ffff99";//("background-color","	 #ffff99")
        else if(innerFlag%3 == 1) tableLines[5].style.backgroundColor = "#ffff99";
        else tableLines[6].style.backgroundColor = "#ffff99";
    }
    function clearStepColor(){
        /*$("#innerStep1").css("background-color","white");
        $("#innerStep2").css("background-color","white");
        $("#innerStep3").css("background-color","white");*/
        tableLines[4].style.backgroundColor = "white";
        tableLines[5].style.backgroundColor = "white";
        tableLines[6].style.backgroundColor = "white";
    }
  
 
    function computeDel(){
      //  debugger
        tree = new Tree();
		root = new TreeNode();
		tree.root = root;
        tree.node = root;
        
        tris = [];
        edges = [];
        points2tris = [];
        edges2tris = [];
        circle = null;
         
        var vertices = points;
        if(flag) vertices = points.slice(0,points.length-1);
        flag = 1;
        var finaltris = getDel(vertices); // return final tris
        var i;
        for(i=0; i<finaltris.length; i++){
            var a = new Point(finaltris[i][0]);
            var b = new Point(finaltris[i][1]);
            var c = new Point(finaltris[i][2]);
            var j, pa, pb, pc;
            for(j=0; j<vertices.length; j++){
                if(vertices[j].isNear(a)) pa = j;
                if(vertices[j].isNear(b)) pb = j;
                if(vertices[j].isNear(c)) pc = j;

            }
           // var triangle = new Triangle(finaltris[i], {}, graph, i+1);
            var triangle = new Triangle(finaltris[i], {}, i+1);
            tris.push(triangle);


            var p2tri = new Point2Tri(pa, pb, pc, tris.length-1);
            points2tris.push(p2tri);
        }
        root.data = cloneData();
        tree.node = root;

    }
   
    function IncrementalTriangulation(){
       // debugger
        var node = new TreeNode();

        var a,b,c, index; // index of points
        var curT = null; // index of tri
        var i;
        for(i=0; i<points2tris.length; i++){
            if(inTriangle(points[points2tris[i].pa],points[points2tris[i].pb],points[points2tris[i].pc],starPoint)){
                a = points2tris[i].pa;
                b = points2tris[i].pb;
                c = points2tris[i].pc;
                curT = points2tris[i].tri;
                index = i;
                break;
            }

        }
        if(curT == null){ // outside current diagram
            $("#warningBox").css('display','block');
            debugger
            graph.removePoint(points[points.length-1]);
            return false;
        }else{ // inside the current delaunay triangulation diagram
            $("#warningBox").css('display','none');
            tris[curT].setAttribute({visible:false});
            points2tris.splice(index,1);
    
            var tri1 = new Triangle([points[a].coords, points[b].coords, starPoint.coords], {}, tris.length);
            var tri2 = new Triangle([points[b].coords, points[c].coords, starPoint.coords], {}, tris.length+1);
            var tri3 = new Triangle([points[a].coords, points[c].coords, starPoint.coords], {}, tris.length+2);


            var p2tri1 = new Point2Tri(a, b, points.length-1, tris.length);
            var p2tri2 = new Point2Tri(b, c, points.length-1, tris.length+1);
            var p2tri3 = new Point2Tri(a, c, points.length-1, tris.length+2);
            points2tris.push(p2tri1);
            points2tris.push(p2tri2);
            points2tris.push(p2tri3);
    
            
            var edgeab = new Edge(points[a], points[b], {strokeColor:"red", fillColor:"red"});
            var edgebc = new Edge(points[b], points[c], {strokeColor:"red", fillColor:"red"});
            var edgeac = new Edge(points[a], points[c], {strokeColor:"red", fillColor:"red"});
    
            edges.push(edgeab);
            edges.push(edgebc);
            edges.push(edgeac);

            findTriangles(edgeab, points.indexOf(starPoint));
            findTriangles(edgebc, points.indexOf(starPoint));
            findTriangles(edgeac, points.indexOf(starPoint));
    
    
            tris.push(tri1);
            tris.push(tri2);
            tris.push(tri3);
            node.data = cloneData();
            tree.node.adopt(node);

            var secNode = new TreeNode();
            secNode.data = cloneData();
            node.adopt(secNode);
    
            while(edges2tris.length) checkLegal(node);
            var finalnode = new TreeNode();
            circle = null;
            var i;
            for(i=0; i<edges.length; i++){
                edges[i].setAttribute({visible:false});
    
            }
            finalnode.data = cloneData();
            node.adopt(finalnode);
            return true;
        }



    }

    function findTriangles(edgeab, p){
        var edgeab2tri = new Edge2Tri(edgeab);
        edgeab2tri.p = p;
        var i;
        for(i=0; i<points2tris.length; i++){
            if(Triangle.hasEdge(points[points2tris[i].pa],points[points2tris[i].pb],points[points2tris[i].pc], edgeab)){
                if(edgeab2tri.p2tri1 == -1) edgeab2tri.p2tri1 = i;
                else edgeab2tri.p2tri2 = i;
                continue;
            }
        }
        edges2tris.splice(1,-1,edgeab2tri);
        //edges2tris.push(edgeab2tri);

    }
    
    function checkLegal(parent){
        var node = new TreeNode();
        node.data = cloneData();
        var cur = edges2tris[0];

        edges[cur.edge].setAttribute({fillColor:"green", strokeColor:"green"});
        

        parent.adopt(node);

        innerCheck(node);
        edges2tris.splice(cur,1);
    }

    function innerCheck(parent){
       // debugger
        var cur = edges2tris[0];
        var pointIndex;
        var subnode1 = new TreeNode();
        var subnode2 = new TreeNode();
        var subnode3 = new TreeNode();
        var subnode4 = new TreeNode();
        var subnode5 = new TreeNode();

        var edge_p1 = points.indexOf(edges[cur.edge].p1); // index of points
        var edge_p2 = points.indexOf(edges[cur.edge].p2);


        if(cur.p2tri1 == -1 || cur.p2tri2 == -1){
            var thirdpoint;
            if(cur.p2tri1 != -1 ){
                if(points2tris[cur.p2tri1].pa != edge_p1 && points2tris[cur.p2tri1].pa != edge_p2) thirdpoint = points2tris[cur.p2tri1].pa ;
                else{
                    if(points2tris[cur.p2tri1].pb != edge_p1 && points2tris[cur.p2tri1].pb != edge_p2) thirdpoint = points2tris[cur.p2tri1].pb ;
                    else thirdpoint = points2tris[cur.p2tri1].pc;
                }
                tris[points2tris[cur.p2tri1].tri].setAttribute({fillColor:"yellow"});
      //          points[thirdpoint].setAttribute({strokeColor:"green", fillColor:"green"});
                subnode1.data = cloneData();
                parent.adopt(subnode1);
                
                circle = new Circle(points[points2tris[cur.p2tri1].pa].coords, points[points2tris[cur.p2tri1].pb].coords, points[points2tris[cur.p2tri1].pc].coords, graph, {}, 1);

            } 
            else{
                if(points2tris[cur.p2tri2].pa != edge_p1 && points2tris[cur.p2tri2].pa != edge_p2) thirdpoint = points2tris[cur.p2tri2].pa ;
                else{
                    if(points2tris[cur.p2tri2].pb != edge_p1 && points2tris[cur.p2tri2].pb != edge_p2) thirdpoint = points2tris[cur.p2tri2].pb ;
                    else thirdpoint = points2tris[cur.p2tri2].pc;
                }
                tris[points2tris[cur.p2tri2].tri].setAttribute({fillColor:"yellow"});
           //     points[thirdpoint].setAttribute({strokeColor:"green", fillColor:"green"});
                subnode1.data = cloneData();
                parent.adopt(subnode1);
                circle = new Circle(points[points2tris[cur.p2tri2].pa].coords, points[points2tris[cur.p2tri2].pb].coords, points[points2tris[cur.p2tri2].pc].coords, graph, {}, 1);



            } 
            circle.remove();

            subnode2.data = cloneData();
            parent.adopt(subnode2);

            if(cur.p2tri1 != -1 )  tris[points2tris[cur.p2tri1].tri].setAttribute({fillColor:"white"});
            else tris[points2tris[cur.p2tri2].tri].setAttribute({fillColor:"white"});
            edges[cur.edge].setAttribute({fillColor:"blue", strokeColor:"blue"});
           // if(cur.p2tri1 != -1) tris[points2tris[cur.p2tri1].tri].setAttribute({fillColor:"white"});
           // else tris[points2tris[cur.p2tri2].tri].setAttribute({fillColor:"white"});
            subnode3.data = cloneData();
            parent.adopt(subnode3);
         //   points[thirdpoint].setAttribute({strokeColor:"black", fillColor:"black"});

        }else{ // has 2 triangles
            var tag = 0;
            pointIndex = [points2tris[cur.p2tri1].pa,points2tris[cur.p2tri1].pb,,points2tris[cur.p2tri1].pc,
                              points2tris[cur.p2tri2].pa,points2tris[cur.p2tri2].pb,points2tris[cur.p2tri2].pc
        
                             ];
            pointIndex = pointIndex.filter(reomveEdgePoint(edge_p1,edge_p2));

            if(pointIndex[1] == -1) debugger
            if(pointIndex[0] == cur.p){
                tag = 0;
                points[pointIndex[1]].setAttribute({strokeColor:"green", fillColor:"green"});
            }   
            else {
                tag = 1;
                points[pointIndex[0]].setAttribute({strokeColor:"green", fillColor:"green"});
            }
            

            tris[points2tris[cur.p2tri1].tri].setAttribute({fillColor:"yellow"});
            tris[points2tris[cur.p2tri2].tri].setAttribute({fillColor:"yellow"});
            subnode1.data = cloneData();
            parent.adopt(subnode1);

            
        //    var pcoords = starPoint.coords;
         //   pointIndex.sort();
            circle = new Circle(points[pointIndex[tag]].coords, points[edge_p1].coords, points[edge_p2].coords, graph, {}, 1);
            circle.remove();
            subnode2.data = cloneData();
            parent.adopt(subnode2);
            
            if(circle.testIn(points[pointIndex[Math.abs(tag-1)]])){
                edges[cur.edge].setAttribute({visible:false});

                points2tris[cur.p2tri1] = updateP2t(points2tris[cur.p2tri1], edge_p1, pointIndex[1]);
                points2tris[cur.p2tri2] = updateP2t(points2tris[cur.p2tri2], edge_p2, pointIndex[0]);

                var newtri = [points[points2tris[cur.p2tri1].pa].coords, points[points2tris[cur.p2tri1].pb].coords, points[points2tris[cur.p2tri1].pc].coords];
                tris[points2tris[cur.p2tri1].tri].updateVertice(newtri);
                newtri = [points[points2tris[cur.p2tri2].pa].coords, points[points2tris[cur.p2tri2].pb].coords, points[points2tris[cur.p2tri2].pc].coords];
                tris[points2tris[cur.p2tri2].tri].updateVertice(newtri);

                var d; // index of point that needs to be checked whether it's in the circle
                if(pointIndex[0] == cur.p) d = pointIndex[1];
                else d = pointIndex[0];

                var edgebd = new Edge(points[edge_p1], points[d], {strokeColor:"red", fillColor:"red"});
                var edgead = new Edge(points[edge_p2], points[d], {strokeColor:"red", fillColor:"red"});
                edges.push(edgebd);
                edges.push(edgead);

                findTriangles(edgebd, cur.p);
                findTriangles(edgead, cur.p);

                subnode4.data = cloneData();
                parent.adopt(subnode4);

            }else{
                edges[cur.edge].setAttribute({fillColor:"blue", strokeColor:"blue"});
                subnode3.data = cloneData();
                parent.adopt(subnode3);
            }
            tris[points2tris[cur.p2tri1].tri].setAttribute({fillColor:"white"});
            tris[points2tris[cur.p2tri2].tri].setAttribute({fillColor:"white"});
            if(pointIndex[1]== cur.p)points[pointIndex[0]].setAttribute({strokeColor:"black", fillColor:"black"});
            else points[pointIndex[1]].setAttribute({strokeColor:"black", fillColor:"black"});

        }
        circle = null;


    }

    function getDel(ps){
        var array = ps.map(x => x.coords);
      //  array = array.concat(T0);
        var tris = vo.triangles(array);
        return tris;
    }


    function updateP2t(point2tri, b, d){
        var p2tri = new Point2Tri(point2tri.pa, point2tri.pb, point2tri.pc, point2tri.tri);
        if(p2tri.pa == p2tri.pb || p2tri.pa == p2tri.pc || p2tri.pb == p2tri.pc) debugger
        switch(b){
            case p2tri.pa:
            p2tri.pa = d;
            break;
            case p2tri.pb:
            p2tri.pb = d;
            break;
            case p2tri.pc:
            p2tri.pc = d;
            break;
        }
        if(p2tri.pa == p2tri.pb || p2tri.pa == p2tri.pc || p2tri.pb == p2tri.pc) debugger

        return p2tri;

    }

    function cloneData() { // curTri: [[],[],[]]  curPoint: Point()
        var data = {points:[], tris:[], edges:[], starPoint:null, circle:null};
        var i;
        for(i=0; i<points.length; i++){
            data.points.push(points[i].clone());
        }
        for(i=0; i<tris.length; i++){
            var temp = tris[i].clone();
            data.tris.push(tris[i].clone());
        }
        for (i = 0; i < edges.length; i++) {
			var j = points.indexOf(edges[i].p1)
			var p1Clone = data.points[j];
			j = points.indexOf(edges[i].p2)
			var p2Clone = data.points[j];
			data.edges.push(edges[i].clone(p1Clone, p2Clone));
		}
        if(starPoint) data.starPoint = starPoint.clone();
        if(circle) data.circle = circle.clone();
		return data;
    }
    
    function loadData(data){
        reset();
        graph.reset();
        graph.loadData(data);
        if(data.circle) data.circle.addCircle();
        circle = data.circle;
    }
    function reset(){

        if(circle) circle.remove();

    }


    
    function inTriangle(a,b,c,p){
        if(Math.sign(Point.orient(p,a,b)) == Math.sign(Point.orient(p,b,c))&& Math.sign(Point.orient(p,a,b)) == Math.sign(Point.orient(p,c,a)))
            return true;
        return false;
    }

    function reomveEdgePoint(p1, p2){
        return function (element){
           if(element == p1 || element == p2) return false;
           else return true;

        }
    }
 
 }