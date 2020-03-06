function DualGraph(attr, parent) {
    var dualgraph = this;
    this.graphs = [];
	this.dualPoints = [];
	var colors = [];
	var e_color = [];
	var index = 0;
	var last;
    this.attr = { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false };
    var shiftPress = 0;
    Object.assign(this.attr, attr);
    this.domEl = document.createElement('div');
    this.domEl.style = "display: flex; \
						flex:1;\
						justify-content: space-evenly;\
						align-items: stretch;\
						flex-direction: row";
    if (parent)
        parent.appendChild(this.domEl);
    else
        document.body.appendChild(this.domEl);
    var leftDiv = document.createElement('div');
    leftDiv.style.flex = "1";
    var rightDiv = document.createElement('div');
    rightDiv.style.flex = "1";
    this.domEl.appendChild(leftDiv);
    this.domEl.appendChild(rightDiv);
    this.graphs.push(new Graph({}, leftDiv, "graph1"));
    this.graphs.push(new Graph({}, rightDiv, "graph2"));




    document.addEventListener('keydown', (event) => {
        if (event.key == "Shift") {
            shiftPress = 1;
        }
    });
    document.addEventListener('keyup', (event) => {
        if (event.key == "Shift") {
            shiftPress = 0;
        }
    });

    checkClick = function(func) {
        if (!moveFlag) {
            func();
        }
    }

    var text1 = "Click the left plane or right plane to add point";

    this.graphs[0].createTutorial(-3, 4, text1);


    this.graphs[0].board.on('move', () => { moveFlag = 1 });
    this.graphs[0].board.on('down', () => { moveFlag = 0 });
	this.graphs[0].board.on('up', () =>
        checkClick(function(event) {
            var coords = dualgraph.graphs[0].getMouseCoords(event);
            createPointEvent(coords, dualgraph.graphs[0], dualgraph.graphs[1]);
        })
	);
    this.graphs[1].board.on('move', () => { moveFlag = 1 });
    this.graphs[1].board.on('down', () => { moveFlag = 0 });
	this.graphs[1].board.on('up', () =>
        checkClick(function(event) {
			var coords = dualgraph.graphs[1].getMouseCoords(event);
            createPointEvent(coords, dualgraph.graphs[1], dualgraph.graphs[0]);
        })
    );

	function createPointEvent(coords, pointGraph, edgeGraph) {
		//var color = randomColor({ luminosity: 'dark' });
		var temp = huecolor();
		var color = 'hsl('+temp+',100%, 50%)';
		var dp = dualgraph.createDualPoint(coords, pointGraph, edgeGraph, { fillColor: color, strokeColor: color, straightFirst: "true", straightLast: "true" });
		if (!dp)
			return;
		var point = dp.point.jxgPoint;
		var edge = dp.line.jxgEdge;
		edge.off('drag');
		edge.on('drag', function () {
			var coords1 = [0, -point.coords.usrCoords[2]];
			var coords2 = [1, -point.coords.usrCoords[2] + point.coords.usrCoords[1]];
			if (shiftPress == 0)
				point.moveTo([edge.getSlope(), -edge.getRise()]);
			else {
				edge.point2.moveTo(edgeGraph.getMouseCoords());
				edge.point1.moveTo(coords1);
				slope = (edge.point2.coords.usrCoords[2] - edge.point1.coords.usrCoords[2]) / (edge.point2.coords.usrCoords[1] - edge.point1.coords.usrCoords[1]);
				rise = edge.point1.coords.usrCoords[2];
				point.moveTo([slope, -rise]);
			}
		});

		edge.on('mouseover', function () {
			dp.line.p1.setAttribute({ visible: true });
			dp.line.p2.setAttribute({ visible: true }); 
		});
		edge.on('mouseout', function () {
			dp.line.p1.setAttribute({ visible: false });
			dp.line.p2.setAttribute({ visible: false });
		});
		edge.off('mouseover');
		point.on('drag', function () {
			edge.point1.moveTo([0, -point.coords.usrCoords[2]]);
			if (point.coords.usrCoords[1] - point.coords.usrCoords[2] > -5 && point.coords.usrCoords[1] - point.coords.usrCoords[2] < 5) {
				edge.point2.moveTo([1, point.coords.usrCoords[1] - point.coords.usrCoords[2]])
			}
			else
				edge.point2.moveTo([-1, -point.coords.usrCoords[1] - point.coords.usrCoords[2]]);

		});
		dualgraph.dualPoints.push(dp);
	}

	function huecolor(){		
		var res;
		if(colors.length == 0){
		   colors.push(0);
		   index++;
		   last = 0;
		   return 0;
		}
		if(e_color.length == 0){
			var hue = Math.round(360/(Math.pow(2,index)));
			var i = hue;
			for(;i<360;i+=2*hue){				
				e_color.push(i);				
			}
			index++;
		}
		res = getFurhue();
		last = res;
        return res;
	}

	function getFurhue(){
		var i=0;
		var max = 0;
		var item;
		while(i<e_color.length){
			var x = Math.cos(e_color[i]);
			var y = Math.sin(e_color[i]);
			
			var dist= 0;
			var j=0;
			while(j<colors.length){
                dist += Math.pow(x - Math.cos(colors[j]),2) + Math.pow(y - Math.sin(colors[j]),2)

                j++;
			}
			if(dist > max){ max = dist; item = i;}
		    i++;
		}
		var res = e_color[item];
		colors.push(res);
		e_color.splice(item,1);
		return res;
	}
}


DualGraph.prototype.createDualPoint = function (coords, pointGraph, edgeGraph, attr, overrideOverlap) {
	if (!overrideOverlap && pointGraph.pointOverlap(coords))
		return null;
	var dp = new DualPoint(coords, attr);
	return this.addDualPoint(dp, pointGraph, edgeGraph, true);
}

DualGraph.prototype.addDualPoint = function (dualpoint, pointGraph, edgeGraph, overrideOverlap) {
	if (!overrideOverlap && pointGraph.pointOverlap(dualpoint.point.coords))
		return null;
	pointGraph.addPoint(dualpoint.point, true);
	edgeGraph.addPoint(dualpoint.line.p1, true);
	edgeGraph.addPoint(dualpoint.line.p2, true);
	edgeGraph.addEdge(dualpoint.line);
	this.dualPoints.push(dualpoint);
	return dualpoint;
}

DualGraph.prototype.freeze = function () {

}

DualGraph.prototype.reset = function (data) {
}

DualGraph.prototype.loadData = function (data) {
}

DualGraph.prototype.cloneData = function () {
}