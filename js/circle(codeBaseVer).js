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