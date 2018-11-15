var objectId = 0;

function Graph(attr, parent, id) {
    var graph = this;
    this.points = [];
    this.edges = [];
    this.faces = [];
    this.attr = {
        boundingbox: [-5, 5, 5, -5],
        keepAspectRatio: false,
        axis: false,
        grid: false,
        showNavigation: false,
        showCopyright: false,
        showZoom: true,
        showNavigation: true,
        zoom: {
            factorX: 1.25,
            factorY: 1.25,
            wheel: true,
            needshift: false,
            pinchHorizontal: true,
            pinchVertical: true
        },
        pan: {
            enabled: true,
            needshift: false
		}
    };
    Object.assign(this.attr, attr);
    this.domEl = document.createElement('div');
    if (!id)
        id = "jxgbox";
    this.domEl.id = id;
    this.domEl.classList.add("jxgbox");
    this.domEl.style.width = "100%";
    this.domEl.style.height = "100%";
    this.domEl.style.flexDirection = "column";
	if (parent) {
		parent.appendChild(this.domEl);
		this.parent = parent;
	}
	else {
		document.body.appendChild(this.domEl);
		this.parent = document.body;
	}
	this.board = JXG.JSXGraph.initBoard(id, this.attr);

	this.createBottomRow();
	this.createRandomDiv(this.attr.interactionType);

	this.createDownloadDiv();
	this.createUploadDiv();
	this.createResetDiv();

    this.svg = this.board.containerObj.children[0];
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("width", "100%");
    this.svg.style.width = "100%";
    this.svg.style.height = "100%";

    window.addEventListener("resize", function() { resize(graph) });
    function resize(g) {
        g.board.setBoundingBox(g.board.getBoundingBox(), false);
        g.svg.setAttribute("height", "100%");
        g.svg.setAttribute("width", "100%");
        g.svg.style.width = "100%";
        g.svg.style.height = "100%";
    }

    resize(this);

    var moveFlag = 0;
    var graphListeners = [];

    graphListeners["pointGraph"] = function(event) {
        {
            var coords = graph.getMouseCoords(event);

            var point = graph.createPoint(coords);

        }
    }

    graphListeners["edgeGraph"] = function(event) {
        {
            var coords = graph.getMouseCoords(event);

            var newPoint = graph.createPoint(coords);
            if (newPoint == null) return;
            if (graph.points.length % 2) return;
            else {
                graph.createEdge(graph.points[graph.points.length - 2], newPoint);
            }
        }
    }

    graphListeners["lineGraph"] = function(event) {
        {
            var coords = graph.getMouseCoords(event);

            var newPoint = graph.createPoint(coords);
            if (newPoint == null) return;
            if (graph.points.length % 2) return;
            else {
                graph.createEdge(graph.points[graph.points.length - 2], newPoint, { straightFirst: true, straightLast: true });
            }
        }
	}

	var clickbegin;
	var clickend;
	checkClick = function (func) {
        if (!moveFlag) {
            func();
        }
    }
	this.board.on('move', () => { moveFlag = 1 });

    this.board.on('down', (event) => { clickbegin = [event.clientX, event.clientY]});
	if (this.attr.interactionType) this.board.on('up', () => {
		var dist = Math.sqrt(Math.pow(clickbegin[0] - event.clientX, 2) + Math.pow(clickbegin[1] - event.clientY, 2));
		if (dist < 10) {
			graphListeners[this.attr.interactionType]();
		}
	})


    this.getMouseCoords = function(event) {
        var cPos = graph.board.getCoordsTopLeftCorner(event),
            absPos = JXG.getPosition(event),
            dx = absPos[0] - cPos[0],
            dy = absPos[1] - cPos[1];
        var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], graph.board);
        return [coords.usrCoords[1], coords.usrCoords[2]];
    }
	var g = this;
	this.uploadDivListener = function () {
		if ('files' in g.uploadDiv) {
			var stringData
			var graphData;
			var fr = new FileReader();
			fr.onload = function (fileLoadedEvent) {
				stringData = fileLoadedEvent.target.result;
				var graphObjNames = ["Point", "Face", "HalfEdge", "Edge", "DualPoint"];
				var graphObj = {}
				function parser(key, value) {
					if (graphObjNames.includes(value.className)) {
						if (value.id in graphObj)
							return graphObj[key];
						else {
							graphObj[value.id] = value;
							return value;
						}
					}
					return value;
				}
				graphData = JSON.parse(stringData, parser);
				g.reset();
				g.setAttribute(graphData.attr);
				g.loadData(graphData.graphObjects);
			}
			fr.readAsText(g.uploadDiv.files[0], "UTF-8");
		}
	}
	this.downloadDivListener = function (event) {
		Toolbox.objectToJsonFile({ attr: g.attr, graphObjects: { points: g.points, edges: g.edges, faces: g.faces } }, "file.json");
	};

	this.uploadDiv.addEventListener("change", this.uploadDivListener);
}


Graph.prototype.createEdge = function(p1, p2, attr) {
    if (p1 == null || p2 == null) debugger;
    var newEdge = new Edge(p1, p2, attr);

    newEdge.jxgEdge = this.board.create('line', [p1.jxgPoint, p2.jxgPoint], newEdge.attr);

    this.edges.push(newEdge);
}

Graph.prototype.removeEdge = function(edge) {
    var index = this.edges.indexOf(edge);
    if (index == -1) return;
	this.board.removeObject(edge.jxgEdge);
	edge.jxgEdge = null;
	this.removePoint(edge.p1);
	this.removePoint(edge.p2);
    this.edges.splice(index, 1);
}

Graph.prototype.addEdge = function(newEdge) {
    newEdge.jxgEdge = this.board.create('line', [newEdge.p1.jxgPoint, newEdge.p2.jxgPoint], newEdge.attr);
    this.edges.push(newEdge);
}

Graph.prototype.createPoint = function(coords, attr, overrideOverlap) {
    if (!overrideOverlap && this.pointOverlap(coords)) return null;
    var newPoint = new Point(coords);
    this.addPoint(newPoint, 1);
    return newPoint;
}

Graph.prototype.addPoint = function(point, overrideOverlap) {

    if (!overrideOverlap && this.pointOverlap(point.coords)) return null;

    point.jxgPoint = this.board.create('point', point.coords, point.attr);
    point.jxgPoint.setLabel("");
    this.points.push(point);
}

Graph.prototype.addFace = function(face) {
    var coords = [];
    var halfEdge = face.boundary;
    coords.push(halfEdge.target.coords);
    this.addHalfEdge(halfEdge);
    halfEdge = halfEdge.next;
    while (halfEdge != face.boundary) {
        coords.push(halfEdge.target.coords);
        this.addHalfEdge(halfEdge);
        halfEdge = halfEdge.next;
    }

    face.polygon = this.board.create('polygon', coords, face.attr);
    this.faces.push(face);
    return face;
}

Graph.prototype.removeFace = function (face) {
	var index = this.faces.indexOf(face);
	if (index == -1) return;
	var halfEdge = face.boundary;
	this.removeHalfEdge(halfEdge);
	halfEdge = halfEdge.next;
	while (halfEdge != face.boundary) {
		this.removeHalfEdge(halfEdge);
		halfEdge = halfEdge.next;
	}

	this.board.removeObject(face.polygon);
	face.polygon = null;

	this.faces.splice(index, 1);

	return face;
}

Graph.prototype.addHalfEdge = function(halfEdge) {
    if (halfEdge.target.jxgPoint == null)
        this.addPoint(halfEdge.target, true);
    if (halfEdge.prev.target.jxgPoint == null)
        this.addPoint(halfEdge.prev.target, true);
    if (halfEdge.edge.jxgEdge == null)
        this.addEdge(halfEdge.edge);

    return halfEdge;
}

Graph.prototype.removeHalfEdge = function (halfEdge) {
	if (halfEdge.target.jxgPoint != null)
		this.removePoint(halfEdge.target);
	if (halfEdge.prev.target.jxgPoint != null)
		this.removePoint(halfEdge.prev.target);
	if (halfEdge.edge.jxgEdge != null)
		this.removeEdge(halfEdge.edge);
}

Graph.prototype.removePoint = function(point) {
    var index = this.points.indexOf(point);
    if (index == -1) return;
	this.board.removeObject(point.jxgPoint);
	point.jxgPoint = null;
    this.points.splice(index, 1);
}

Graph.prototype.freeze = function() {
    this.attr["registerEvents"] = false;
    if (this.board) {
        this.board.removeEventHandlers();
    }
}

Graph.prototype.pointOverlap = function(coords) {
    var jxgCoords = new JXG.Coords(JXG.COORDS_BY_USER, [1, coords[0], coords[1]], this.board);
    for (el in this.board.objects) {
        if (this.board.objects[el].hasPoint(jxgCoords.scrCoords[1], jxgCoords.scrCoords[2]))
            return true;
    }
    return false;
}

Graph.prototype.reset = function () {
	while (this.faces.length > 0) {
		this.removeFace(this.faces[0]);
	}
	this.faces = [];

	while (this.edges.length > 0) {
        this.removeEdge(this.edges[0]);
    }
	this.edges = [];

	while (this.points.length > 0) {
        this.removePoint(this.points[0]);
    }
    this.points = [];

    this.attr.boundingbox = this.board.getBoundingBox();
    //	JXG.JSXGraph.freeBoard(this.board);
    //	this.board = JXG.JSXGraph.initBoard(this.domEl.id, this.attr)
}
Graph.prototype.loadData = function (data) {
	this.board.suspendUpdate();
    this.reset();
	this.addObjects(data);
	this.board.unsuspendUpdate();
}

Graph.prototype.addObjects = function(objects) {
    var i;
    if (objects.points) {
        for (i = 0; i < objects.points.length; i++) {
            this.addPoint(objects.points[i], true);
        }
    }

    if (objects.edges) {
        for (i = 0; i < objects.edges.length; i++) {
            this.addEdge(objects.edges[i]);
        }
    }

    if (objects.faces) {
        for (i = 0; i < objects.faces.length; ++i) {
            this.addFace(objects.faces[i]);
        }
    }
}

Graph.prototype.cloneData = function() {
    var i, data = {};
    data.points = [];
    for (i = 0; i < this.points.length; i++) {
        data.points.push(this.points[i].clone());
    }

    data.edges = [];
    for (i = 0; i < this.edges.length; i++) {
        var p1Clone = data.points[this.points.indexOf(this.edges[i].getLeftPoint())];
        var p2Clone = data.points[this.points.indexOf(this.edges[i].getRightPoint())];
        data.edges.push(this.edges[i].clone(p1Clone, p2Clone));
    }

    return data;
}

Graph.prototype.addRandomPoints = function(numPoints) {
    var i;
    var bb = this.board.attr.boundingbox;
    var dx = [bb[0], bb[2]];
	var dy = [bb[1], bb[3]];
	this.board.suspendUpdate();
    for (i = 0; i < numPoints; ++i) {
        var x = Math.random() * (dx[1] - dx[0]) + dx[0];
        var y = Math.random() * (dy[1] - dy[0]) + dy[0];
        this.createPoint([x, y], {}, true);
	}
	this.board.unsuspendUpdate();
}

Graph.prototype.addRandomEdges = function (numEdges) {
	var i;
	var bb = this.board.attr.boundingbox;
	var dx = [bb[0], bb[2]];
	var dy = [bb[1], bb[3]];
	this.board.suspendUpdate();
	for (i = 0; i < numEdges; ++i) {
		var x = Math.random() * (dx[1] - dx[0]) + dx[0];
		var y = Math.random() * (dy[1] - dy[0]) + dy[0];
		var p1 = this.createPoint([x, y], {}, true);
		var x = Math.random() * (dx[1] - dx[0]) + dx[0];
		var y = Math.random() * (dy[1] - dy[0]) + dy[0];
		var p2 = this.createPoint([x, y], {}, true);
		this.createEdge(p1, p2, {});
	}
	this.board.unsuspendUpdate();
}

Graph.prototype.addRandomLines = function (numEdges) {
	var i;
	var bb = this.board.attr.boundingbox;
	var dx = [bb[0], bb[2]];
	var dy = [bb[1], bb[3]];
	this.board.suspendUpdate();
	for (i = 0; i < numEdges; ++i) {
		var x = Math.random() * (dx[1] - dx[0]) + dx[0];
		var y = Math.random() * (dy[1] - dy[0]) + dy[0];
		var p1 = this.createPoint([x, y], {}, true);
		var x = Math.random() * (dx[1] - dx[0]) + dx[0];
		var y = Math.random() * (dy[1] - dy[0]) + dy[0];
		var p2 = this.createPoint([x, y], {}, true);
		this.createEdge(p1, p2, { straightFirst: true, straightLast: true });
	}
	this.board.unsuspendUpdate();
}

Graph.prototype.setAttribute = function(newAttrs) {
    this.attr = Object.assign(this.attr, newAttrs);
}

Graph.prototype.createBottomRow = function () {
	this.bottomRow = document.createElement("div");
	this.bottomRow.style.display = "flex";
	this.bottomRow.style.justifyContent = "spacing";
	this.parent.appendChild(this.bottomRow);
}

Graph.prototype.createRandomDiv = function (interactionType) {
	var $randomDiv = $(document.createElement('div'));
	$randomDiv.css("flex", 0);

	var $moreText = $(document.createElement('div'));
	$moreText.css("display", "inline-block");
	$randomDiv.append($moreText);

	var $input = $(document.createElement('input'));
	$input.attr("id", "randomInput");
	$input.css("display", "inline-block");
	$input.css("type", "number");
	$randomDiv.append($input);

	var $randomButton = $(document.createElement('button'));
	$randomButton.css("display", "inline-block");

	$randomDiv.append($randomButton);

	$(this.bottomRow).append($randomDiv);

	if (interactionType == "pointGraph") {
		var g = this;
		$randomButton.on("click", () => { g.addRandomPoints($("#randomInput").val()) });
		$moreText.append(document.createTextNode("Random Points: "));
		$randomButton.append(document.createTextNode("Add"));
	}
	else if (interactionType == "edgeGraph") {
		var g = this;
		$randomButton.on("click", () => { g.addRandomEdges($("#randomInput").val()) });
		$moreText.append(document.createTextNode("Random Edges: "));
		$randomButton.append(document.createTextNode("Add Edges"));
	}
	else if (interactionType == "lineGraph") {
		var g = this;
		$randomButton.on("click", () => { g.addRandomLines($("#randomInput").val()) });
		$moreText.append(document.createTextNode("Random Lines: "));
		$randomButton.append(document.createTextNode("Add Lines"));
	}
};

Graph.prototype.createResetDiv = function () {
	this.resetDiv = document.createElement("div");
	this.resetDiv.style.flex = "0";
	this.resetDiv.style.textDecoration = "underline";
	this.resetDiv.style.cursor = "pointer";
	this.resetDiv.style.color = "blue";
	this.resetDiv.appendChild(document.createTextNode("reset"));

	var g = this;
	$(this.resetDiv).on("click", () => { location.reload() });
	this.bottomRow.appendChild(this.resetDiv);
};

Graph.prototype.createEllipsePoints = function (numPoints) {
	var radius = Math.max(this.attr.boundingbox[1] - this.attr.boundingbox[0], this.attr.boundingbox[2] - this.attr.boundingbox[3]) / 2;
	var radius = radius * .9;
	var totalAngle = 2 * Math.PI;
	var center = [(this.attr.boundingbox[1] + this.attr.boundingbox[0]) / 2, (this.attr.boundingbox[3] + this.attr.boundingbox[2]) / 2];
	var angleIter = totalAngle / numPoints;
	for (i = 0; i < numPoints; ++i) {
		point = [center[0] + Math.cos(angleIter * i) * radius, center[1] + Math.sin(angleIter * i) * radius];
		this.createPoint(point, {}, true)
	}
};

Graph.prototype.createDownloadDiv = function () {
	this.downloadDiv = document.createElement("div");
	this.downloadDiv.style.flex = "0";
	this.downloadDiv.style.textDecoration = "underline";
	this.downloadDiv.style.cursor = "pointer";
	this.downloadDiv.style.color = "blue";
	this.downloadDiv.style.whiteSpace = "nowrap";
	this.downloadDiv.appendChild(document.createTextNode("Download Graph Data"));

	var g = this;
	$(this.downloadDiv).on("click", () => { Toolbox.objectToJsonFile({ attr: g.attr, graphObjects: { points: g.points, edges: g.edges, faces: g.faces } }, "file.json") });
	this.bottomRow.appendChild(this.downloadDiv);
};

Graph.prototype.createUploadDiv = function () {
	this.uploadDiv = document.createElement("input");
	this.uploadDiv.setAttribute('type', "file");
	this.uploadDiv.setAttribute('id', 'graphFile');
	this.uploadDiv.setAttribute('multiple', '');
	this.uploadDiv.style.flex = "0";
	this.uploadDiv.setAttribute("value", "Upload Graph Data");

	this.bottomRow.appendChild(this.uploadDiv);
};