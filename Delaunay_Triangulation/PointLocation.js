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
	var shiftPress = 0;
	var tree = new Tree();
    var root;

    //var parent_tri;
    var cur_tri;
    var backgroundTris = [];
    
    var index = -1;
    var finalTri = [];
    var curData;

    var starPoint;
    var bb ;
    var bbox ;

    var T0  ;

   
	this.displayPL = function(event){
        pointLGraph.container = new GraphContainer("Point Location");
	   var width = pointLGraph.container.graphCol.clientWidth;
	   var height = pointLGraph.container.graphCol.clientHeight;

	   var attr= { interactionType: "pointGraph", keepAspectRatio: true, zoom:true};
       
	   //graph = new Graph(attr, pointLGraph.container.graphDiv);
	   graph = new Graph(attr,pointLGraph.container.graphDiv);
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
   
       T0 = [[0, 2*(bbox.yb - bbox.yt)], [-(1*(bbox.xr - bbox.xl)), -5], [1.0*(bbox.xr - bbox.xl),-5]];


    }
    


	function transition(){


        points = graph.points;
        var i;
        for(i=0; i<points.length; i++){
            points[i].setAttribute({withLabel:true, name:i+1});
        }
      
        computePL();
        debugger;
        //graph.freeze();
        
        console.log("a");
        var $buttonContainer = $(pointLGraph.container.buttonContainer);
		$("#pointlocation").remove();


		var $outerLoopContainer = $("<div>");
        $outerLoopContainer.css("display", "flex");
        
		var $outerBackButton = $("<div>", { id: "outerBackButton", class: "button" });
		$outerBackButton.on("click", prev);
		var $outerBackText = $('<div>', { class: "button-content" });
		$outerBackText.append(document.createTextNode("Back"));
		$outerBackButton.append($outerBackText);
		$outerLoopContainer.append($outerBackButton);

		var $outerForwardButton = $("<div>", { id: "outerForwardButton", class: "button" });
		$outerForwardButton.on("click", next);
		var $outerForwardText = $('<div>', { class: "button-content" });
		$outerForwardText.append(document.createTextNode("Next"));
		$outerForwardButton.append($outerForwardText);
		$outerLoopContainer.append($outerForwardButton);

		$buttonContainer.append($outerLoopContainer);

 
        tree.node = tree.root;
		//while (tree.node.children.length > 0) tree.moveDown();
        updateButtons();
        loadData(tree.node.data);

        graph.board.zoomOut(0,5);
        
        
        graph.board.on('up', (event) => { 
            temp = graph.points;
            starPoint  = temp[temp.length-1];
            starPoint.setAttribute({face:'<>', size:5, withLabel:false, fixed:true, strokeColor:"red", fillColor:"red"});
            
            graph.board.removeEventHandlers();
            

        });
    
        
        //console.log("1st points", points);
	
    }
    
	function updateButtons() {
		var $button = $("#outerForwardButton");
		if (!tree.node.hasChildren()) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", next);
		}

		$button = $("#outerBackButton");
		if (tree.node == root) {
			$button.css("background-color", "lightgray");
			$button.off();
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off();
			$button.on("click", prev);
		}
	}


    function prev() {
		//if (tree.node.children == []) return;
		loadData(tree.moveUp().data);
        updateButtons();
	}

	function next() {
        if (!tree.node.hasChildren()) return;
        
        findNode(tree.node, starPoint);

		loadData(tree.node.data);
        updateButtons();
	}

    function findNode(node, p){
        var len = 0;
        var cur
        while(len < node.children.length){
            if(len == 0) cur = tree.moveDown().data.cur_tri.vertice;// [[ , ],[ , ],[ , ]]
            else cur = tree.moveRight().data.cur_tri.vertice;
            if(inTriangle(cur, p)) return;
            len++;

        }
    }
 
    function computePL(){
        debugger;

		root = new TreeNode();
		tree.root = root;
		tree.node = root;
         
        var tris = getDel(points);
        var i;
        for(i=0; i<tris.length; i++){
            var triangle = new Triangle(tris[i], {fillColor:"yellow"}, graph, 0);
            backgroundTris.push(triangle);
        }
        var parent_tri = new Triangle(T0, {strokeColor:"orange"}, graph, 0);


        root.data = cloneData(parent_tri, parent_tri, 0);
        tree.node = root;
        parent_tri.setAttribute({fillColor:"white"});
        sepToTris(1, root);

        
        

    }
   

    function sepToTris( k, parent){
       
        if(k > points.length) return;
        var parent_tri = parent.data.cur_tri;
        var curpoints = points.slice(0,k);
        var tris = getDel(curpoints);

        var i;
        for(i=0; i<tris.length; i++){
            var triangle = new Triangle(tris[i], {fillColor:"orange"}, graph, k);
         //   var interArray = parent_tri.jxgPolygon.intersect(triangle.jxgPolygon);
            if(true){
                var node = new TreeNode();
                parent.adopt(node);
                node.data = cloneData(triangle, parent_tri, k);
                sepToTris(k+1, node);
            }
            triangle.setAttribute({fillColor:"yellow"});
            

        }


    }

    function checkContain(pcoords){
        return function checkcon(array){
            var p1 = array[0];
            var p2 = array[1];
            var p3 = array[2]
            return (p1[0]==pcoords[0]&&p1[1]==pcoords[1])||(p2[0]==pcoords[0]&&p2[1]==pcoords[1])||(p3[0]==pcoords[0]&&p3[1]==pcoords[1]);
        }

    }

    function getDel(ps){
        var array = ps.map(x => x.coords);
        array = array.concat(T0);
        var tris = vo.triangles(array);
        return tris;
    }




    function cloneData(parent_tri, cur_tri, k) { // curTri: [[],[],[]]  curPoint: Point()
        var data = {cur_tri: null, parent_tri:null, point: null, circle: null, background:[], trisOverlay:[]};

        if(k>0){
            data.point = points[k-1];
        }
        data.parent_tri = parent_tri;
        data.cur_tri = cur_tri;
        data.parent_tri.remove();
        data.cur_tri.remove();
        
        data.background = backgroundTris;
        /*for(i=0; i<tris.length;i++){
            var trangle = new Polygon(tris[i], {fillColor:"dodgerblue"}, graph, -1);
            trangle.remove();
            data.tris.push(trangle);

        }
        data.tri = new Polygon(tri, {fillColor:"yellow" }, graph, points.indexOf(point));
        
        data.tri.remove();
        */
		return data;
    }
    
    function loadData(data){
        graph.board.suspendUpdate();
        reset(data);
        addObjects(data);
        graph.board.unsuspendUpdate();
    }

    function addObjects(data){
        //data.tris.map(x => x.addTriangle());
        if(data.point) graph.addPoint(data.point, true);
        data.cur_tri.addTriangle();
        data.parent_tri.addTriangle();
        data.background.map(x => x.addTriangle());

    }

    function reset(data){
        //if(data.point) curData.point.setAttribute({strokeColor:"black", fillColor:"black"});
       // if(curData.background.length>0) curData.background.map(x => x.remove());
       // if(curData.tris.length>0) curData.tris.map(x => x.remove());
       // data.tri.remove();
       // data.parent_tri.remove();
    }

    function inTriangle(cur, p){
        var p1 = cur.map(x=>x[0]);
        var p2 = cur.map(x=>x[1]);
        var p3 = cur.map(x=>x[2]);
        var a = new Point(p1, {});
        var b = new Point(p2, {});
        var c = new Point(p3, {});
 
        if(Math.sign(Point.orient(p,a,b)) == Math.sign(Point.orient(p,b,c))&& Math.sign(Point.orient(p,a,b)) == Math.sign(Point.orient(p,c,a)))
             return true;
        return false;
    }

    
 
 
 }