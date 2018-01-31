var pointId = 0;

var PointDisplayEnum = Object.freeze({"default":".point-default"})

function Point(coords, board) {
	this.coords = coords;
	this.jxgPoint = board.create('point', [coords.usrCoords[1], coords.usrCoords[2]]);
	this.class = PointDisplayEnum.default;
}