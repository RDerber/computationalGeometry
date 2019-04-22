function KDGraph(attr, parent){
    var kdgraph = this;
    this.graphs = [];
	var colors = [];
	var e_color = [];
	var index = 0;
	var last;
    this.attr = { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false };
    var shiftPress = 0;
    Object.assign(this.attr, attr);
    this.domEl = document.createElement('div');
    this.domEl.style = "display: flex; \
						flex:1;\
						justify-content: space-evenly;\
						align-items: stretch;\
						flex-direction: row";
    if (parent)
        parent.appendChild(this.domEl);
    else
        document.body.appendChild(this.domEl);
    var leftDiv = document.createElement('div');
    leftDiv.style.flex = "1";
    var rightDiv = document.createElement('div');
    rightDiv.style.width = "400px";
    this.domEl.appendChild(leftDiv);
    this.domEl.appendChild(rightDiv);
    this.graphs.push(new Graph({interactionType: 'pointGraph',keepAspectRatio: true, showNavigation: false, showCopyright: false  }, leftDiv, "graph1"));
    this.graphs.push(new Graph({boundingbox: [-5, 10, 5, 0],keepAspectRatio: true, showNavigation: false, showCopyright: false }, rightDiv, "graph2"));

}

KDGraph.prototype.loadData = function (data) {
	this.graphs[1].board.suspendUpdate();
    this.graphs[1].reset();
	this.addObjects(data);
	this.graphs[1].board.unsuspendUpdate();
}
KDGraph.prototype.addKDnode = function(kdnode){
    var kd = this;
    this.graphs[1].addPoint(kdnode.top, true);
    this.graphs[1].addPoint(kdnode.bot, true);
    this.graphs[1].addPoint(kdnode.edge.p1, true);
    this.graphs[1].addPoint(kdnode.edge.p2, true);
    this.graphs[1].addEdge(kdnode.edge, true);
    this.graphs[1].addPoint(kdnode.center, true);
    this.graphs[1].addCircle(kdnode.circle, true);

    if(kdnode.circle.attr.fillColor == "red" ){
     //   debugger
     //   kd.HighLight(kdnode, "blue");
        kdnode.face.setAttribute({ visible:true,fillColor:"red" });
     //   debugger
    }else if( kdnode.circle.attr.fillColor == "green"){
   //     kd.HighLight(kdnode, "yellow");
        kdnode.face.setAttribute({ visible:true,fillColor:"white" });
    }else{
     //   kd.DisHighLight(kdnode);
        kdnode.face.setAttribute({ visible:false,fillColor:"white" });
    }
    var point = kdnode.circle.jxgCircle;
    //var point = kdnode.center.jxgPoint;
    point.on('mouseover', function () {
        debugger
 
        kd.HighLight(kdnode, "blue");
        kdnode.face.setAttribute({ visible:true,fillColor:"red" });
    });
    point.on('mouseout', function () {
        kd.DisHighLight(kdnode);
        kdnode.face.setAttribute({ visible:false,fillColor:"white" });
    });
}
KDGraph.prototype.addObjects = function(objects) {
    var i;
 
    if (objects.KDnodes) {
        
        for (i = 0; i < objects.KDnodes.length; i++) {
            this.addKDnode(objects.KDnodes[i]);
        }

    }
    if (objects.KDedges) {
        
        for (i = 0; i < objects.KDedges.length; i++) {
            this.graphs[1].addPoint(objects.KDedges[i].p1, true);
            this.graphs[1].addPoint(objects.KDedges[i].p2, true);
            this.graphs[1].addEdge(objects.KDedges[i], true);
        }
        
    }
	
}

KDGraph.prototype.HighLight = function(kdnode, color){
    var leftGraph = this.graphs[0];
    var points = kdnode.points;     
    var totalpoints = leftGraph.points;       
    var i;
    for(i=0; i<points.length; i++){
        var j;
        for(j=0; j<totalpoints.length; j++){
            if(points[i].isNear(totalpoints[j])){
                totalpoints[j].setAttribute({strokeColor:color,fillColor:color});
                break;
            }
        }
      
    }
}

KDGraph.prototype.DisHighLight = function(kdnode){
    var leftGraph = this.graphs[0];
    var points = kdnode.points;     
    var totalpoints = leftGraph.points;       
    var i;
    for(i=0; i<points.length; i++){
        var j;
        for(j=0; j<totalpoints.length; j++){
            console.log(points[i].attr.fillColor );
            if(points[i].isNear(totalpoints[j])){
                totalpoints[j].setAttribute({strokeColor:points[i].attr.strokeColor,fillColor:points[i].attr.fillColor});
                break;
            }
        }
      
    }
}