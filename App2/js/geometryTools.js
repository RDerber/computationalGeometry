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

