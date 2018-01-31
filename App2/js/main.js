var graph;

window.onload = function () {
	convexHullButton = document.createElement('div');
	convexHullButton.id = "displayConvexHullButton";
	convexHullButton.classList.add("button-displayConvexHull");
	convexHullButton.addEventListener('click', displayConvexHull);
	document.body.appendChild(convexHullButton);
	lineSweepButton = document.createElement('div');
	lineSweepButton.id = "displayLineSweepButton";
	lineSweepButton.classList.add("button-displayLineSweep");
	lineSweepButton.addEventListener('click', displayLineSweep);
	document.body.appendChild(lineSweepButton);
}

