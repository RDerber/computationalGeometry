
//creates an edge between 2 points
function Edge(p1, p2, board) {
	var edge = this;
	this.p1 = p1;
	this.p2 = p2;
	this.jxgEdge = board.create('line', [p1.jxgPoint, p2.jxgPoint],
		{ straightFirst: false, straightLast: false, strokeWidth: 1 });

	this.getLeftPoint = function (){
		if (compareX(edge.p1, edge.p2)) return p2;
		else return p1;
	}

	this.getRightPoint = function () {
		if (compareX(edge.p1, edge.p2)) return p1;
		else return p2;
	}

}
