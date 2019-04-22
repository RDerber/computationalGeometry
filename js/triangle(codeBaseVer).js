function Triangle(tri, attr, id){
   // var color = getHueColor(id);
    this.attr = { strokeColor: "black"};
    this.tri = tri;
    Object.assign(this.attr, attr);
    this.vertice = this.getVertice(tri);
    this.id = id;
    this.jxgCurve ;
    this.jxgCircle ;
 
}

Triangle.prototype.setAttribute = function (attr) {
	Object.assign(this.attr, attr);
	if (this.jxgCurve)
		this.jxgCurve.setAttribute(this.attr);
}

Triangle.prototype.getVertice = function(tri){

    var x = tri.map(x => x[0]);
    var y = tri.map(x => x[1]);
    x.push(tri[0][0]);
    y.push(tri[0][1]);
    return [x,y];
}

Triangle.prototype.clone = function () {
	var attr = {};
    Object.assign(attr, this.attr);
    var triangle = new Triangle(this.tri, attr, this.id );
	return triangle;
}

Triangle.prototype.updateVertice = function(tri){
  
    this.tri = tri;
    this.vertice = this.getVertice(tri);
  
}
Triangle.hasPoint = function(tri,p){ // judge if p is one of the vertices
    var a = tri[0];
    var b = tri[1];
    var c = tri[2];
    if(a[0]==p[0] && a[1]==p[1]) return true;
    if(b[0]==p[0] && b[1]==p[1]) return true;
    if(c[0]==p[0] && c[1]==p[1]) return true;
    return false;
}

Triangle.hasEdge = function(a, b, c, edge){ // judge if edge is one of the edges
    var flag1 = Point.samePoint(a,edge.p1) || Point.samePoint(a,edge.p2) ;
    var flag2 = Point.samePoint(b,edge.p1) || Point.samePoint(b,edge.p2) ;
    var flag3 = Point.samePoint(c,edge.p1) || Point.samePoint(c,edge.p2) ;
    if(flag1&&flag2) return true;
    if(flag2&&flag3) return true;
    if(flag1&&flag3) return true;
    return false

}