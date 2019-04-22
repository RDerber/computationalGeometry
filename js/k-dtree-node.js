function KDNode(coords, vertical,attr, degree, id, wholeDepth, face, box, points){
    this.attr = attr;
  //  var interval = 8.0/(Math.pow(2,degree-1)+1);
   // this.x = -5+(id+1)*interval;
    var interval = 0.5*(Math.pow(2, wholeDepth-degree));
    console.log(wholeDepth, degree);
    this.x = coords - interval*Math.pow(-1, id%2);
    this.y = 10 - 2 * degree;
    this.degree = degree;
    this.coords = coords;
    this.id = id;
    this.wholeDepth = wholeDepth;
    this.vertical = vertical;
    this.face = face;
    this.box = box;
    this.points = points;

    var center_attr = { strokeColor:"white",fillColor:"white", size:12, visible:false, fillOpacity:0.4};
    var edge_attr = {straightFirst:false, straightLast:false, strokeColor:"black", fillColor:"black", highlight:false};
    var circle_attr = {strokeColor:"dodgerblue", fillColor:"white",hasInnerPoints: true};
    
    Object.assign(circle_attr, this.attr);
    var p1x, p2x, p1y, p2y;

    this.lc = null;
    this.rc = null;

    if(vertical == 1){ // vertical
        p1x = this.x;
        p2x = this.x;
        p1y = this.y + 0.4;
        p2y = this.y - 0.4;
        this.text = "x = "+coords;
    }else if(vertical == 0){ // horizontal
        p1x = this.x - 0.4;
        p2x = this.x + 0.4;
        p1y = this.y;
        p2y = this.y;
        this.text = "y = "+coords;
    }else{  // leaf
   //     center_attr = {face:'[]', strokeColor:"dodgerblue",fillColor:this.attr.fillColor, size:13, visible:true};
    //    edge_attr = { visible:false};
   //     circle_attr = {visible:false};
    }
    
    this.top = new Point([this.x, this.y+0.4], {visible:false});
    this.bot = new Point([this.x, this.y-0.4], {visible:false});
    this.center = new Point([this.x, this.y], center_attr ); // center point of circle
    this.p1 = new Point([p1x, p1y], {visible:false}); // vertice of edge
    this.p2 = new Point([p2x, p2y], {visible:false}); // vertice of edge
    this.edge = new Edge(this.p1,this.p2, edge_attr); // edge
    this.circle = new Circle(this.center, 0.4, circle_attr);
    this.jxgText;

    this.setAttribute = function(attr){
        Object.assign(this.attr, attr);
        
	//	this.circle.setAttribute(this.attr);
	}
}

KDNode.prototype.clone = function(){
    return new KDNode(this.coords, this.vertical, this.attr, this.degree, this.id, this.wholeDepth,this.face, this.box,this.points);
}  

KDNode.prototype.setChild = function(kdnodeChild){
    if(!this.lc){
        this.lc = kdnodeChild;
    }else{
        this.rc = kdnodeChild;
    }
}

KDNode.prototype.reset = function(){
    var i;
    for(i=0; i<this.points.length; i++){
       this.points[i].setAttribute({strokeColor:"black", fillColor:"black"});
    }
}