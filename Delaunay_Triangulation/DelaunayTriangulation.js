window.onload = function () {
    var view = new VoronoiGraph();
    view.displayVoronoi();
}

function VoronoiGraph(){
	var voronoiGraph = this;
	this.container;
	var graph;

	var points = [];
	var edges = [];

	var shiftPress = 0;
   
	this.displayVoronoi = function(event){
	   voronoiGraph.container = new GraphContainer("Voronoi Diagram");
	   var width = voronoiGraph.container.graphCol.clientWidth;
	   var height = voronoiGraph.container.graphCol.clientHeight;

	   
	   var attr= { interactionType: "pointGraph", boundingbox: [-5, 5, 10*Math.round((width/height)*100)/100-5, -5] };

	   //graph = new Graph(attr, voronoiGraph.container.graphDiv);
	   graph = new VDGraph(attr,voronoiGraph.container.graphDiv);
	   var buttonContainer = voronoiGraph.container.buttonCol;

	   var button = document.createElement('div');  // computeConvexHull button 
	   button.id = "VoronoiButton";
	   button.classList.add("button");

	   var buttontext = document.createElement('div'); // textnode of computeConvexHull button
	   buttontext.classList.add("button-content");
	   buttontext.appendChild(document.createTextNode("Compute Voronoi Diagram"));
	   button.appendChild(buttontext);
	   button.addEventListener('click', transition); // click event
	   buttonContainer.appendChild(button);

	   random($(voronoiGraph.container.graphCol)); // design add how many random points

	}

	function transition(){
		

		points = graph.points;
		
        points.sort(Point.compareX);
		var array = points.map(x => x.coords);
        
		var voronoi = d3.voronoi();
		var polygon = voronoi.polygons(array);
		var tri = voronoi.triangles(array);

		var i;
		for(i=0; i<tri.length; i++){
			var p1 = points[array.indexOf(tri[i][0])];
			var p2 = points[array.indexOf(tri[i][1])];
			var p3 = points[array.indexOf(tri[i][2])];

			var edge1 = new Edge(p1,p2);
			var edge2 = new Edge(p2,p3);
			var edge3 = new Edge(p1,p3);
			if(edges.indexOf(edge1)==-1) {
				graph.addEdge(edge1);
				edges.push(edge1);
			}
			if(edges.indexOf(edge2)==-1) {
				graph.addEdge(edge2);
				edges.push(edge2);
			}
			if(edges.indexOf(edge3)==-1) {
				graph.addEdge(edge3);
				edges.push(edge3);
			}
			console.log("i: ",i," ", getCircle(p1,p2,p3));
			var center = graph.createVorPoint(getCircle(p1,p2,p3),{visible:true,fillColor: "blue", strokeColor: "blue" });
			graph.createCircle(center,p1);
			console.log("next");
			

		}

        //graph.board.create('line',[p1,p2]);
        //graph.addEdge(new Edge(points[0],points[1]));
        //var tri = voronoi.triangles(array);
	
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

	function addRandomPoints(event) {
		graph.addRandomPoints($("#randomInput").val());
	}

	function getCircle(p1, p2, p3){
		var x1 = Math.round(p1.coords[0]*100)/100;
		var x2 = Math.round(p2.coords[0]*100)/100;
		var x3 = Math.round(p3.coords[0]*100)/100;

		var y1 = Math.round(p1.coords[1]*100)/100;
		var y2 = Math.round(p2.coords[1]*100)/100;
		var y3 = Math.round(p3.coords[1]*100)/100;

		var a = x1*x1 + y1*y1;
		var b = x2*x2 + y2*y2;
		var c = x3*x3 + y3*y3;

		var x0 = (a*(y2-y3)-y1*(b-c)+(y3*b-y2*c))/(2*(x1*(y2-y3)-y1*(x2-x3)+(x2*y3-x3*y2)));
		var y0 = (x1*(b-c)-a*(x2-x3)+(x2*c-x3*b))/(2*(x1*(y2-y3)-y1*(x2-x3)+(x2*y3-x3*y2)));
		return [x0,y0];
	}
 
 
 }