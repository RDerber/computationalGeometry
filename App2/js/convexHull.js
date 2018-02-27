function convexHull() {
	var convexHull = this;
	var graph;
	var preComputedLowerHull;
	var preComputedUpperHull;
	var lowerHull = [];
	var upperHull = [];
	var curHull, curIndex, orientation, finished;

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

	function computeConvexHull() {
		var i;
		getHullPoints(graph.points);

		//		for (i = 1; i < hull.length; i++) {
		//			graph.createEdge(hull[i - 1], hull[i]);
		//		}

		//		graph.createEdge(hull[hull.length - 1], hull[0]);
	}

	function getHullPoints(points) {
		var i, leftPoint, rightPoint;
		points.sort(Point.compareX);

		preComputedLowerHull = [points[0], points[1]];
		for (i = 2; i < points.length; i++) {
			while (preComputedLowerHull.length > 1 && Point.orient(preComputedLowerHull[preComputedLowerHull.length - 2], preComputedLowerHull[preComputedLowerHull.length - 1], points[i]) < 0) {
				preComputedLowerHull.pop();
			}
			preComputedLowerHull.push(points[i]);
		}

		preComputedUpperHull = [points[points.length - 1], points[points.length - 2]];
		for (i = points.length - 3; i > -1; i--) {
			while (preComputedUpperHull.length > 1 && Point.orient(preComputedUpperHull[preComputedUpperHull.length - 2], preComputedUpperHull[preComputedUpperHull.length - 1], points[i]) < 0) {
				preComputedUpperHull.pop();
			}
			preComputedUpperHull.push(points[i]);
		}
	}

	function lowerHullSetup() {
		getHullPoints(graph.points);
		graph.points.sort(Point.compareX);
		lowerHull.push(graph.points[0]);

		lowerHull[lowerHull.length - 1].jxgPoint.setAttribute({ fillColor: "yellow" });
		graph.points[1].jxgPoint.setAttribute({ fillColor: "yellow" });


		graph.createEdge(lowerHull[0], graph.points[1], { strokeColor: "yellow" });


		curHull = lowerHull;
		preComputedHalfHull = preComputedLowerHull;
		orientation = -1;
		curIndex = 1;
	}

	function upperHullSetup() {
		graph.points.sort(Point.compareX);
		upperHull.push(graph.points[0]);

		upperHull[upperHull.length - 1].jxgPoint.setAttribute({ fillColor: "yellow" });
		graph.points[1].jxgPoint.setAttribute({ fillColor: "yellow" });

		graph.createEdge(upperHull[0], graph.points[1], { strokeColor: "yellow" });

		orientation = 1;
		curIndex = 1;
		curHull = upperHull;
		preComputedHalfHull = preComputedUpperHull;

	}

	function nextLowerHullPoint() {
		while (!preComputedLowerHull.includes(graph.points[curIndex])) nextPointLowerHull();
		nextPointLowerHull();
	}

	function nextPointLowerHull() {
		while (curIndex < graph.points.length && !lowerHullBaseStep());
	}

	function transition() {
		if (graph.points.length < 3) return;

		getHullPoints(graph.points);

		var buttonContainer = document.getElementById("buttonContainer");
		buttonContainer.removeChild(document.getElementById("computeHullButton"));

		var stepButton = document.createElement('div');
		stepButton.addEventListener("click", curHullBaseStep);
		stepButton.classList.add("button");
		stepButton.id = "stepButton";
		var stepText = document.createElement('div');
		stepText.classList.add("button-content");
		stepText.appendChild(document.createTextNode("Step"));
		stepButton.appendChild(stepText);
		buttonContainer.appendChild(stepButton);

		var nextPointButton = document.createElement('div');
		nextPointButton.addEventListener("click", loadFirst);
		nextPointButton.classList.add("button");
		nextPointButton.id = "nextPointButton";
		var nextPointText = document.createElement('div');
		nextPointText.classList.add("button-content");
		nextPointText.appendChild(document.createTextNode("Next Point"));
		nextPointButton.appendChild(nextPointText);
		buttonContainer.appendChild(nextPointButton);

		var finishButton = document.createElement('div');
		finishButton.addEventListener("click", finish);
		finishButton.classList.add("button");
		finishButton.id = "finishButton";
		var finishText = document.createElement('div');
		finishText.classList.add("button-content");
		finishText.appendChild(document.createTextNode("Finish"));
		finishButton.appendChild(finishText);
		buttonContainer.appendChild(finishButton);

		computeConvexHull();

		lowerHullSetup();
	}

	function loadFirst() {
		JXG.JSXGraph.freeBoard(graph.board);
		graph.board = JXG.JSXGraph.initBoard(graph.domEl.id, { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false });
		graph.board.jc.parse(root.children[0].children[0].children[0].getData());
	}

	function finish() {
		root = new Node();
		var lowNode = new Node();
		while (curIndex < graph.points.length) nextPoint(lowNode);

		upperHullSetup();

		var hiNode = new Node();

		while (curIndex < graph.points.length) nextPoint(hiNode);
		root.adopt(lowNode);
		root.adopt(hiNode);
	}

	function nextPoint(parent) {
		var node = new Node();
		parent.adopt(node);
		while (!curHullBaseStep(node));
	}

	function curHullBaseStep(parent) {
		var ret;
		if (curHull.length > 1 && Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], graph.points[curIndex])) == orientation) {
			var removed = curHull.pop();
			removed.jxgPoint.setAttribute({ fillColor: "black" });
			if (curHull.length > 1) {
				curHull[curHull.length - 2].jxgPoint.setAttribute({ fillColor: "yellow" });
				if (Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], graph.points[curIndex])) == orientation) {
					curHull[curHull.length - 1].jxgPoint.setAttribute({ fillColor: "red" });
				}
				else curHull[curHull.length - 1].jxgPoint.setAttribute({ fillColor: "green" });
			}
			graph.removeEdge(graph.edges[graph.edges.length - 1]);
			graph.removeEdge(graph.edges[graph.edges.length - 1]);
			graph.createEdge(curHull[curHull.length - 1], graph.points[curIndex], { strokeColor: "yellow" });
			if (curHull.length > 1) {
				graph.edges[graph.edges.length - 2].jxgEdge.setAttribute({ strokeColor: "yellow" });
			}
			ret = false;
		}
		else {
			curHull.push(graph.points[curIndex++]);
			curHull[curHull.length - 2].jxgPoint.setAttribute({ fillColor: "yellow" });
			if (graph.points[curIndex]) {
				graph.points[curIndex].jxgPoint.setAttribute({ fillColor: "yellow" });
				if (Math.sign(Point.orient(curHull[curHull.length - 2], curHull[curHull.length - 1], graph.points[curIndex])) == orientation) {
					curHull[curHull.length - 1].jxgPoint.setAttribute({ fillColor: "red" });
				}
				else curHull[curHull.length - 1].jxgPoint.setAttribute({ fillColor: "green" });
				graph.createEdge(curHull[curHull.length - 1], graph.points[curIndex], { strokeColor: "yellow" });
			}
			if (curHull.length > 2) {
				curHull[curHull.length - 3].jxgPoint.setAttribute({ fillColor: "black" });
				if (curIndex != graph.points.length)
					graph.edges[graph.edges.length - 3].jxgEdge.setAttribute({ strokeColor: "black" });
			}

			if (curIndex == graph.points.length) {
				curHull[curHull.length - 1].jxgPoint.setAttribute({ fillColor: "black" });
				curHull[curHull.length - 2].jxgPoint.setAttribute({ fillColor: "black" });
				if (curHull.length > 2) {
					curHull[curHull.length - 3].jxgPoint.setAttribute({ fillColor: "black" });
					graph.edges[graph.edges.length - 2].jxgEdge.setAttribute({ strokeColor: "black" });
				}

				graph.edges[graph.edges.length - 1].jxgEdge.setAttribute({ strokeColor: "black" });


			}
			ret = true;
			
		}

		var node = new Node();
		node.data = JXG.Dump.toJessie(graph.board);
		parent.adopt(node);
		return ret;
	}
}