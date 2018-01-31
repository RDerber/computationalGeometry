var graph;

window.onload = function () {
	convexHullButton = document.createElement('div');
	convexHullButton.id = "computeHullButton";
	convexHullButton.classList.add("button-computeHull");
	convexHullButton.addEventListener('click', displayConvexHull);
	document.body.appendChild(convexHullButton);
}

