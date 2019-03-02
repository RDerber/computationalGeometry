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
	var voronoi = new Voronoi();
   
	this.displayVoronoi = function(event){
	   voronoiGraph.container = new GraphContainer("Voronoi Diagram");
	   var width = voronoiGraph.container.graphCol.clientWidth;
	   var height = voronoiGraph.container.graphCol.clientHeight;

	   var attr= { interactionType: "pointGraph", boundingbox: [0, 100, 100*Math.round((width/height)*100)/100, 0] };
       
	   //graph = new Graph(attr, voronoiGraph.container.graphDiv);
	   graph = new VDGraph(attr,voronoiGraph.container.graphDiv);
	   var buttonContainer = voronoiGraph.container.buttonCol;

	}


 





 
 
 }