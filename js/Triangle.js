function Triangle(tri, attr, pointGraph, id){
   // var color = getHueColor(id);
    this.attr = { strokeColor: "black"};
    this.tri = tri;
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
  
    this.tri = tri;
    this.vertice = this.getVertice(tri);
    var x = this.vertice[0];
    var y = this.vertice[1];
    this.jxgCurve.updateDataArray = function(){
        this.dataX = x;
        this.dataY = y;
    }
    this.jxgCurve.prepareUpdate().update().updateRenderer();
  
}

Triangle.prototype.updateVertice = function(tri){
    if(this.jxgCurve){
        this.graph.board.removeObject(this.jxgCurve);
        this.jxgCurve = null;

    }
    this.tri = tri;
    this.vertice = this.getVertice(tri);
    this.jxgCurve = this.graph.board.create('curve', this.vertice, this.attr);

}

Triangle.prototype.remove = function(){
    this.graph.board.removeObject(this.jxgCurve);
    this.jxgCurve = null;
}

Triangle.prototype.clone = function () {
	var attr = {};
    Object.assign(attr, this.attr);
    var triangle = new Triangle(this.tri, attr, this.graph, this.id );
    triangle.remove();
	return triangle;
}

Triangle.hasPoint = function(tri,p){
    var a = tri[0];
    var b = tri[1];
    var c = tri[2];
    if(a[0]==p[0] && a[1]==p[1]) return true;
    if(b[0]==p[0] && b[1]==p[1]) return true;
    if(c[0]==p[0] && c[1]==p[1]) return true;
    return false;

}

Triangle.hasEdge = function(a, b, c, edge){
    var flag1 = Point.samePoint(a,edge.p1) || Point.samePoint(a,edge.p2) ;
    var flag2 = Point.samePoint(b,edge.p1) || Point.samePoint(b,edge.p2) ;
    var flag3 = Point.samePoint(c,edge.p1) || Point.samePoint(c,edge.p2) ;
    if(flag1&&flag2) return true;
    if(flag2&&flag3) return true;
    if(flag1&&flag3) return true;
    return false


}
