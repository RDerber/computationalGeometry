function Point(initCoords, attr) {
	var coords = [];
	coords[0] = initCoords[0] + (Math.random() - 0.5) / 1000;
	coords[1] = initCoords[1] + (Math.random() - 0.5) / 1000;
	this.jxgPoint = null;
	this.attr = {
		fillColor: "black",
		strokeColor: "black",
		withLabel: false
	};
	Object.assign(this.attr, attr);
	this.id = objectId++;

	Object.defineProperties(this, {
		"coords": {
			"get": function () {
				var updatedCoords;
				if (this.jxgPoint != null) {
					updatedCoords = this.jxgPoint.coords.usrCoords.slice(1, 3);
					var i;
					for (i = 0; i < updatedCoords.length; i++) {
						updatedCoords[i] = updatedCoords[i] / this.jxgPoint.coords.usrCoords[0];
					}
					coords = updatedCoords;
					return updatedCoords;
				}
				return coords;
			},
			"set": function (newCoords) {
				if (this.jxgPoint) {
					this.jxgPoint.setPositionDirectly(JXG.COORDS_BY_USER, [1, newCoords[0], newCoords[1]], this.jxgPoint.coords.usrCoords);
					coords = this.jxgPoint.coords.usrCoords.slice(1);
				}
				else
					coords = newCoords;
			}
		},

		"x": {
			"get": function () {
				return this.coords[0];
			},
			"set": function (newX) {
				this.coords = [newX, coords[1]];
			}
		},

		"y": {
			"get": function () {
				return this.coords[1];
			},
			"set": function (newY) {
				this.coords = [coords[0], newY];
			}
		}

	});

	this.setAttribute = function (attr) {
		Object.assign(this.attr, attr);
		if (this.jxgPoint)
			this.jxgPoint.setAttribute(this.attr);
	}

	this.toJSON = function () {
		return `{coords: ${JSON.stringify([this.x, this.y])},attr: "${this.attr}",id: "${this.id}"}`;
	}
}

//this will not clone the JXG portion of the point, but will maintain all data defined in this object
Point.prototype.clone = function () {
	var attr = {};
	Object.assign(attr, this.attr);
	return new Point([this.coords[0], this.coords[1]], attr);
}

Point.prototype.isNear = function (p) {
	return (Math.abs(this.x - p.x) < 0.001) && (Math.abs(this.y - p.y) < 0.001);
}

Point.compareX = function(p1, p2) {
	return p1.coords[0] - p2.coords[0];
}

Point.compareY = function(p1, p2) {
	return p1.coords[1] - p2.coords[1];
}

Point.orient = function(a, b, c) {
return (b.coords[0] - a.coords[0]) * (c.coords[1] - a.coords[1]) -
		(c.coords[0] - a.coords[0]) * (b.coords[1] - a.coords[1]);
}

Point.samePoint = function (p1, p2) {
	return p1.x == p2.x && p1.y == p2.y;
}

Point.getSlope = function (p1, p2) {
	return (p1.y - p2.y) / (p1.x - p2.x);
}