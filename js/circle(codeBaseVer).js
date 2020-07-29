function Circle(p, r, attr){
  this.center = p;
  this.radius = r;
  this.attr = attr;
  this.jxgCircle;


}
Circle.prototype.setAttribute = function (attr) {
	Object.assign(this.attr, attr);
  if(this.jxgCircle){
		this.jxgCircle.setAttribute(this.attr);
  }

}

Circle.prototype.clone = function () {
	var attr = {};
    Object.assign(attr, this.attr);
    var circle = new Circle(this.center, this.radius, attr);
	return circle;
}