function Circle(p1, p2, p3,  pointGraph, attr, id){ // p1, p2, p3 is coords
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.id = id;
    this.center_coords;
    this.graph = pointGraph;

    //this.center = JXG.Math.Geometry.circumcenter(p1, p2, p3, pointGraph.board);
    var center_coords = this.getCirCenter(p1, p2, p3);
    this.center_coords = center_coords
    this.jxgCenter = pointGraph.board.create('point', center_coords, {face:'<>', size:3, withLabel:false, fixed:true});
    this.radius = this.getRadius(center_coords, p1);
    this.jxgCircle = pointGraph.board.create('circle', [this.jxgCenter, this.radius],{dash:1});

   //Object.assign(this.attr, attr);
    this.setAttribute = function(attr){
       Object.assign(this.attr, attr);
       if (this.jxgCircle) {
            this.jxgCircle.setAttribute(this.attr);
       }
    }


}
Circle.prototype.getCirCenter = function(p1coords,p2coords,p3coords){
    var x1 = Math.round(p1coords[0]*100)/100;
    var x2 = Math.round(p2coords[0]*100)/100;
    var x3 = Math.round(p3coords[0]*100)/100;

    var y1 = Math.round(p1coords[1]*100)/100;
    var y2 = Math.round(p2coords[1]*100)/100;
    var y3 = Math.round(p3coords[1]*100)/100;

    var a = x1*x1 + y1*y1;
    var b = x2*x2 + y2*y2;
    var c = x3*x3 + y3*y3;

    var x0 = (a*(y2-y3)-y1*(b-c)+(y3*b-y2*c))/(2*(x1*(y2-y3)-y1*(x2-x3)+(x2*y3-x3*y2)));
    var y0 = (x1*(b-c)-a*(x2-x3)+(x2*c-x3*b))/(2*(x1*(y2-y3)-y1*(x2-x3)+(x2*y3-x3*y2)));
    //return [x0,y0];
    //var center = new Point([x0,y0],attr);
    //center.jxgPoint.off('drag');
    return [x0,y0];
    
     
}
Circle.prototype.getRadius = function(x1,x2){
    
    return Math.sqrt((x1[0]-x2[0])*(x1[0]-x2[0])+(x1[1]-x2[1])*(x1[1]-x2[1]));
     
}

Circle.prototype.update = function(p1,p2,p3){
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    var center_coords = this.getCirCenter(this.p1, this.p2, this.p3);

    this.jxgCenter.moveTo(center_coords);
    this.radius = this.getRadius(center_coords, p1);
    this.jxgCircle.setRadius(this.radius);

}

Circle.prototype.remove = function(){
    this.graph.board.removeObject(this.jxgCircle);
    this.graph.board.removeObject(this.jxgCenter);
}
Circle.prototype.addCircle = function(){
    
    this.jxgCenter = this.graph.board.create('point', this.center_coords, {face:'<>', size:3, withLabel:false, fixed:true});
    this.jxgCircle = this.graph.board.create('circle', [this.jxgCenter, this.radius],{dash:1});

}

Circle.prototype.testIn = function(p){ //p Point
    var x = this.center_coords[0];
    var y = this.center_coords[1];
    var dist = Math.sqrt((x-p.coords[0])*(x-p.coords[0])+(y-p.coords[1])*(y-p.coords[1]));
    if(dist <= this.radius) return true;
    else return false;

}
Circle.prototype.clone = function () {
	var attr = {};
    Object.assign(attr, this.attr);
    var circle = new Circle(this.p1, this.p2, this.p3, this.graph, attr, this.id );
    circle.remove();
	return circle;
}