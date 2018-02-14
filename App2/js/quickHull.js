function convexHull() {
	var convexHull = this;
	var topRightQueue;
	var botRightQueue;
	var botLeftQueue;
	var topLeftQueue;
	var polygon;
	var graph;

	this.displayConvexHull = function (event) {
		var attrs = { interactionType: "pointGraph" };
		var graphDiv = document.createElement('div');
		document.body.appendChild(graphDiv);
		graphDiv.style = "display: inline-block;";

		graph = new Graph(attrs, graphDiv);

		var buttonContainer = document.createElement('div');
		buttonContainer.id = "buttonContainer";
		buttonContainer.style = "display: inline-block; vertical-align: top";
		document.body.appendChild(buttonContainer);

		var button = document.createElement('div');
		button.id = "computeHullButton";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Compute Convex Hull"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);
	}


	function computeHull(p1, p2, points, direction) {
		var farPoint, i, maxDist = 0;
		for (i = 0; i < points.length; i++) {

			}
	}


	var recurse = function () {

	}
}