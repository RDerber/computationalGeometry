function Point(initCoords, attr) {
	this.jxgObj;
	Object.assign(this.attr, attr);

	this.setAttribute = function (attr) {
		Object.assign(this.attr, attr);
		if (this.jxgPoint)
			this.jxgPoint.setAttribute(this.attr);
	}
}

//this will not clone the JXG portion of the point, but will maintain all data defined in this object
Point.prototype.clone = function () {
	var attr = {};
	Object.assign(attr, this.attr);
	return new Point([this.coords[0], this.coords[1]], attr);
}