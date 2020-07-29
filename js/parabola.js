function Parabola(point, line, bound, attr){
   // var color = getHueColor(id);
    this.attr = { strokeColor: "black"};
    Object.assign(this.attr, attr);
    this.point = point;
    this.line = line;
    this.bound = bound
    this.id = objectId++;;
    this.jxgCurve = null;
    this.leftdash = null;
    this.rightdash = null;
    this.dashattr = { strokeColor: 'black', dash: 2 };
 
}

Parabola.prototype.setAttribute = function (attr) {
	Object.assign(this.attr, attr);
	if (this.jxgCurve)
		this.jxgCurve.setAttribute(this.attr);
}

Parabola.prototype.remove = function(){
    this.graph.board.removeObject(this.jxgCurve);
    this.jxgCurve = null;
}

Parabola.prototype.clone = function () {
	var attr = {};
    Object.assign(attr, this.attr);
    var para = new Parabola(this.point, this.line, this.bound, attr);
	return para;
}