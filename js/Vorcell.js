function Vorcell(data,attr, pointGraph, id){
    this.attr = attr;
    this.site = data;
    this.id = id;
    this.graph = pointGraph;
    this.vertice;
    this.jxgCurve =  pointGraph.board.create('curve', [[],[]], {visible: false});
    this.c = this.joinCurves(pointGraph.board, [this.jxgCurve,this.jxgCurve], 
        {   strokeColor:'black', 
            strokeWidth:1, 
            fillColor: attr.fillColor, fillOpacity:0.8
        });
    /*this.attr = attr;
    this.site = cell.data;
    this.graph = pointGraph;
    this.vertice = this.getVertice(cell);
    //this.jxgPolygon = pointGraph.board.create('polygon', this.vertice, {});;
    console.log("fillcolor",attr.fillColor);
    this.jxgCurve = pointGraph.board.create('curve', this.vertice, {visible: false});
    this.c = this.joinCurves(pointGraph.board, [this.jxgCurve,this.jxgCurve], 
        {   strokeColor:'black', 
            strokeWidth:1, 
            fillColor: attr.fillColor, fillOpacity:0.8
        });*/
 
}


Vorcell.prototype.joinCurves = function(board, parents, attributes){
    var cu1 = parents[0], 
    cu2 = parents[1],
    attr = JXG.copyAttributes(attributes, board.options, 'curve'),
    c = board.create('curve', [[0], [0]], attr);

    c.updateDataArray = function() {
    // The two paths have to be connected
    this.dataX = cu1.dataX.slice(0,-1).concat(cu2.dataX);
    this.dataY = cu1.dataY.slice(0,-1).concat(cu2.dataY);
    if (this.dataX.length<4) {
        this.bezierDegree = 1;
    } else {
        this.bezierDegree = cu1.bezierDegree;
    }
    return c;
    };
    c.prepareUpdate().update().updateRenderer();
    return c;
}

Vorcell.prototype.getVertice = function(cell){

    var x = cell.map(x => x[0]);
    var y = cell.map(x => x[1]);
    x.push(cell[0][0]);
    y.push(cell[0][1]);
    return [x,y];
}


Vorcell.prototype.update = function(cell, flag){

    //this.attr = attr;

    //console.log("a");
    this.vertice = this.getVertice(cell);
    var x = this.vertice[0];
    var y = this.vertice[1];
    this.jxgCurve.updateDataArray = function(){
        this.dataX = x;
        this.dataY = y;
    }
    this.jxgCurve.prepareUpdate().update().updateRenderer();
    if(flag) this.graph.board.update();
  
}

Vorcell.prototype.remove = function(){
    this.graph.board.removeObject(this.jxgCurve);
    this.graph.board.removeObject(this.c);
}