

/*
window.onload = function () {
	var header = document.createElement('HEADER');
	header.appendChild(document.createTextNode("Algorithms"));
	document.body.appendChild(header);
	var convexHullButton = document.createElement('div');
	convexHullButton.id = "displayConvexHullButton";
	convexHullButton.classList.add("button-displayConvexHull");
	convexHullButton.addEventListener('click', initConvexHull);
	var convexContent = document.createElement('div');
	convexContent.classList.add("button-content");
	convexContent.appendChild(document.createTextNode("Convex Hull (Upper-Lower Hull"));
	convexHullButton.appendChild(convexContent);
	document.body.appendChild(convexHullButton);
	var lineSweepButton = document.createElement('div');
	lineSweepButton.id = "displayLineSweepButton";
	lineSweepButton.classList.add("button-displayLineSweep");
	lineSweepButton.addEventListener('click', initLineSweep);
	var lineSweepContent = document.createElement('div');
	lineSweepContent.classList.add("button-content");
	lineSweepContent.appendChild(document.createTextNode("Line Segment Intersection (Line Sweep)"));
	lineSweepButton.appendChild(lineSweepContent);
	document.body.appendChild(lineSweepButton);

}

var initLineSweep = function () {
	var view = new lineSweep();
	view.displayLineSweep();
}

var initConvexHull = function () {
	var view = new convexHull();
	view.displayConvexHull();
}*/