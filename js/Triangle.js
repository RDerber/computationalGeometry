function Triangle(tri, attr, pointGraph, id){
    this.attr = { strokeColor: "gray"};
    Object.assign(this.attr, attr);
    this.graph = pointGraph;
    this.vertice = this.getVertice(tri);
    this.id = id;
    this.jxgCurve = pointGraph.board.create('curve', this.vertice, this.attr);
 
}


Triangle.prototype.addTriangle = function(){
    this.jxgCurve = this.graph.board.create('curve', this.vertice, this.attr);
}

Triangle.prototype.getVertice = function(tri){

    var x = tri.map(x => x[0]);
    var y = tri.map(x => x[1]);
    x.push(tri[0][0]);
    y.push(tri[0][1]);
    return [x,y];
}

Triangle.prototype.setAttribute = function (attr) {
	Object.assign(this.attr, attr);
	if (this.jxgCurve)
		this.jxgCurve.setAttribute(this.attr);
}

Triangle.prototype.update = function(tri){

    this.vertice = this.getVertice(tri);
    var x = this.vertice[0];
    var y = this.vertice[1];
    this.jxgCurve.updateDataArray = function(){
        this.dataX = x;
        this.dataY = y;
    }
    this.jxgCurve.prepareUpdate().update().updateRenderer();
  
}

Triangle.prototype.remove = function(){
    this.graph.board.removeObject(this.jxgCurve);
}

