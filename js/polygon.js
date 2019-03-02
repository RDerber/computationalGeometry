function Polygon(vertices, attr, pointGraph, id){
    this.attr = { strokeColor: "gray", fillColor:"white", vertices:{visible:false}};
    Object.assign(this.attr, attr);
    this.graph = pointGraph;
    this.vertice = vertices
    this.id = id;
   // this.jxgCurve = pointGraph.board.create('curve', this.vertice, this.attr);
    this.jxgPolygon = pointGraph.board.create('polygon', this.vertice, this.attr );
 
}



Polygon.prototype.addTriangle = function(){
    this.jxgPolygon = this.graph.board.create('polygon', this.vertice );
}

Polygon.prototype.setAttribute = function (attr) {
	Object.assign(this.attr, attr);
	if (this.jxgPolygon)
		this.jxgPolygon.setAttribute(this.attr);
}


Polygon.prototype.remove = function(){
    this.graph.board.removeObject(this.jxgCurve);
}