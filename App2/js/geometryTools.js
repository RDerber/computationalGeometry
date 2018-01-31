//used to sort points on x coordinates
function compareX(p1, p2) { 
	if (p1.coords.usrCoords[1] < p2.coords.usrCoords[1])
		return -1;
	if (p1.coords.usrCoords[1] > p2.coords.usrCoords[1])
		return 1;
	return 0;
}

function compareY(p1, p2) {
	if (p1.coords.usrCoords[2] < p2.coords.usrCoords[2])
		return -1;
	if (p1.coords.usrCoords[2] > p2.coords.usrCoords[2])
		return 1;
	return 0;
}

//return 0 if the angle made by abc is straight, negative if clockwise, and positive if counterclockwise
function orient(a, b, c) {
	return (b.coords.usrCoords[1] - a.coords.usrCoords[1]) * (c.coords.usrCoords[2] - a.coords.usrCoords[2]) -
		(c.coords.usrCoords[1] - a.coords.usrCoords[1]) * (b.coords.usrCoords[2] - a.coords.usrCoords[2]);
}

function evaluateLine(x, p1, p2) {
	var m, b;
	m = (p1.coords.usrCoords[1] - p2.coords.usrCoords[1]) / (p1.coords.usrCoords[2] - p2.coords.usrCoords[2]);
	b = p1.coords.usrCoords[2] - m * p1.coords.usrCoords[1];

	return m * x + b; 
}

function edgeIntersection(e1, e2) {
	var A1, B1, C1, A2, B2, C2, det, x11, x12, x21, x22, y11, y12, y21, y22, x, y;

	x11 = e1.p1.coords.usrCoords[1];
	x12 = e1.p2.coords.usrCoords[1];
	x21 = e2.p1.coords.usrCoords[1];
	x22 = e2.p2.coords.usrCoords[1];
	y11 = e1.p1.coords.usrCoords[2];
	y12 = e1.p2.coords.usrCoords[2];
	y21 = e2.p1.coords.usrCoords[2];
	y22 = e2.p2.coords.usrCoords[2];

	A1 = y12 - y11;
	B1 = x11 - x12;
	C1 = A1 * x11 + B1 * y11;

	A2 = y22 - y21;
	B2 = x21 - x22;
	C2 = A2 * x21 + B2 * y21;

	det = A1 * B2 - A2 * B1;

	if (det == 0) return null;

	x = (B2 * C1 - B1 * C2) / det;
	y = (A1 * C2 - A2 * C1) / det;

	if (min(x11, x12) < x && x < max(x11, x12) &&
		min(x21, x12) < x && x < max(x21, x22)) {
		return [x, y];
	}
	return null;

}