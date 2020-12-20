window.onload = function () {
    var view = new ColorContrastGraph();
    view.displayVoronoi();
}

function ColorContrastGraph(){
	var voronoiGraph = this;
	this.container;
	var graph;

	var points = [];
	var pcoords = [];
	var edges = [];
	var data = {};
	var texts = [];
	var shiftPress = 0;
	var hsv1 = [];
	var hsv2 = [];
	var voronoi = new Voronoi();
	var vo = d3.voronoi();
	var vorcells = [];
    var tris = [];
    var colormap = [];
    var pairs = [];
    var colorlist = [];
    var color_index = 0;
	var diagram;
	var bb;
	var bbox;
	var attr;
	var totaldis = 0;
	var lastdis = 0;
	var totalText;
	var lastText;

   
	this.displayVoronoi = function(event){
	   voronoiGraph.container = new GraphContainer("Color Optimization");
	   var width = voronoiGraph.container.graphCol.clientWidth;
	   var height = voronoiGraph.container.graphCol.clientHeight;

	   attr= { interactionType: "pointGraph", boundingbox: [0, 100, 100*Math.round((width/height)*100)/100, 0] };
       
	   //graph = new VDGraph(attr,voronoiGraph.container.graphDiv);
	   this.graph = new Graph(attr,voronoiGraph.container.graphDiv);
	   var buttonContainer = voronoiGraph.container.buttonContainer;
	   buttonContainer.id = "buttonContainer";

	   var button = document.createElement('div');
		button.id = "start";
		button.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("Start"));
		button.appendChild(buttontext);
		button.addEventListener('click', transition);
		buttonContainer.appendChild(button);

		bb = this.graph.board.getBoundingBox();
    	bbox = {xl: bb[0], xr: bb[2], yt: bb[3], yb: bb[1]}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

		var text1 = "1. Click in the left panel to add points, or use the Random Point button.";
		var text2 = "2. Click Start button."

		this.graph.createTutorial(20, 85, text1);
		this.graph.createTutorial(20, 75, text2);


		$(this.graph.downloadDiv).off("click");
		$(this.graph.downloadDiv).on("click", () => { Toolbox.objectToJsonFile({points: points.map(x => x.coords), pairs: pairs, colormap: colormap, weight: weightPair()}, "file")});

		this.upDivListener = function () {
			if ('files' in voronoiGraph.graph.uploadDiv) {
				for(var i = 0; i < voronoiGraph.graph.uploadDiv.files.length; i++){
				var stringData
				var graphData;
				var fr = new FileReader();
				fr.onload = function (fileLoadedEvent) {
					stringData = fileLoadedEvent.target.result;
					var graphObjNames = ["points", "pairs", "colormap"];
					var graphObj = {}
					function parser(key, value) {
						if(graphObjNames.includes(key)){
							graphObj[key] = value;
						}

						return value;
					}
					graphData = JSON.parse(stringData, parser);
					loadData(graphData);
				}

				
					fr.readAsText(voronoiGraph.graph.uploadDiv.files[i], "UTF-8");
				}
			}
		}

		this.graph.uploadDiv.removeEventListener("change", this.graph.uploadDivListener);
		this.graph.uploadDiv.addEventListener("change", this.upDivListener);

		var $random = $("#randombutton");
		$random.off("click");
		$random.on("click", () => { addRandomPoints($("#randomInput").val(), voronoiGraph.graph) })
	}

	function addRandomPoints(numPoints, pointGraph) {
        var i;
        var dx = [bb[0], bb[2]];
        var dy = [bb[1], bb[3]];
        pointGraph.board.suspendUpdate();
        for (i = 0; i < numPoints; ++i) {
            ;
            var x = Math.random() * (dx[1] - dx[0]) + dx[0];
            var y = Math.random() * (dy[1] - dy[0]) + dy[0];
           	createPointEvent([x, y], pointGraph);
        }
        //this.board.unsuspendUpdate();
        pointGraph.board.update();
        updateVor();
    }

	function loadData(data){
		pcoords = data.points;
		pairs = data.pairs;
		colormap = data.colormap;
		colorlist.push(colormap.slice());
		color_index = colorlist.length - 1;

		updateColor();
		updateButtons();
	}

	function updateColor(){
		for (var i = 0; i < vorcells.length; i++){
 			var hsv = colormap[i];
 			var hsl = hsv2hsl(hsv);

 			var str = "hsl(" + hsl[0] + ", " + hsl[1] + "%, " + hsl[2] + "%)";

 			vorcells[i].attr = {fillColor : str};
 			vorcells[i].c.visProp.fillcolor = str;
 		}

 		voronoiGraph.graph.board.update();
 		clearText();
 		showDistance();
 		lastText.nodeValue = "Last Distance: " + lastdis.toFixed(2);
 		totalText.nodeValue = "Total Distance: " + totaldis.toFixed(2);
	}

	function transition() {
		points = voronoiGraph.graph.cloneData().points;
		console.log(points);
		if (points.length < 3) return;

		$("#start").remove();
		$("#tutorial").remove();
 
		var $buttonContainer = $("#buttonContainer");

		var $eventButtonContainer = $(document.createElement("div"));
		$eventButtonContainer.css("display", "block");

		$buttonContainer.append($eventButtonContainer);
	   
		var $randomContainer = $(document.createElement("div"));
        $randomContainer.css("display", "inline-block");
		var $randomButton = $("<button>", { id: "randomButton", class: "button" });
		$randomButton.on("click", randomColor);
		$randomButton.append(document.createTextNode("Random Color"))
		$randomContainer.append($randomButton);
		$eventButtonContainer.append($randomContainer);

		var $prevContainer = $(document.createElement("div"));
		$prevContainer.css("display", "inline-block");

		var $prevbutton = $("<button>", { id: "prev", class: "button" });
		$prevbutton.on("click", prevColor);
		$prevbutton.append(document.createTextNode("Prev Color"));
		$prevContainer.append($prevbutton);
		$buttonContainer.append($prevContainer);

		var $nextContainer = $(document.createElement("div"));
		$nextContainer.css("display", "inline-block");

		var $nextbutton = $("<button>", { id: "next", class: "button" });
		$nextbutton.on("click", nextColor);
		$nextbutton.append(document.createTextNode("Next Color"));
		$nextContainer.append($nextbutton);
		$buttonContainer.append($nextContainer);
		

		drawVor();

		totalText = document.createTextNode("Total Distance: " + totaldis.toFixed(2));
		$buttonContainer.append(totalText);

		$buttonContainer.append(document.createElement("p"));

		lastText = document.createTextNode("Last Distance: " + lastdis.toFixed(2));
		$buttonContainer.append(lastText);

		colorlist.push(colormap.slice());
		updateButtons();
	}

	function updateButtons(){
		var $button;

		$button = $("#prev");
		if (color_index == 0) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", prevColor);
		}

		$button = $("#next");
		if (color_index == colorlist.length - 1) {
			$button.css("background-color", "lightgray");
			$button.off("click");
		}
		else {
			$button.css("background-color", "dodgerblue");
			$button.off("click");
			$button.on("click", nextColor);
		}
	}

	function prevColor(){
		color_index = color_index - 1;
		colormap = colorlist[color_index];
		updateColor();
		updateButtons();
	}

	function nextColor(){
		color_index = color_index + 1;
		colormap = colorlist[color_index];
		updateColor();
		updateButtons();
	}

	function weightPair(){
		var weighted_pair = [];
		var std = 0;
		for(var i = 0; i < vorcells.length; i++){
			for(var j = i + 1; j < vorcells.length; j++){
				if(isDup(pairs, [i,j])){
					weighted_pair.push([i,j,0]);
				}
				else{
					var dis = vorcellDistance(vorcells[i],vorcells[j]);
					weighted_pair.push([i,j,dis]);
					std += dis ** 2;
				}
			}
		}

		std = Math.sqrt(std / weighted_pair.length);

		if(std == 0){
			for(var i = 0; i < weighted_pair.length; i++){
				weighted_pair[i][2] = 1;
			}
		}
		else{
			for(var i = 0; i < weighted_pair.length; i++){
				//Gaussian function
				var weight = Math.exp(-1/2 * (weighted_pair[i][2]**2 / std**2));
				weighted_pair[i][2] = weight;
			}
		}
		return weighted_pair;
	}

	function vorcellDistance(cell1, cell2){
		var vert1 = cell1.vertice;
		var vert2 = cell2.vertice;
		var mindis = 99999;
		for(var i = 0; i < vert1[0].length; i++){
			for(var j = 0; j < vert2[0].length; j++){
				var dis = (vert1[0][i] - vert2[0][j])**2 + (vert1[1][i] - vert2[1][j])**2;
				if (mindis > dis)
					mindis = dis;
			}
		}

		return mindis;
	}

	function createPointEvent(coords, pointGraph) {
		var vp = createVorPoint(coords, pointGraph, { fillColor: "black", strokeColor: "black", straightFirst: "true", straightLast: "true" });
	}

	function updateVor(){
        voronoiGraph.graph.board.suspendUpdate();
        clearText();
        drawVor();
        voronoiGraph.graph.board.unsuspendUpdate();
    }  

	function drawVor(){
		pcoords = points.map(x => x.coords);
		vo.extent([[bbox.xl-1000, bbox.yt-1000],[bbox.xr+1000, bbox.yb+1000]]);
		diagram = vo(pcoords);

		showVor(pcoords);
		showDelTri(pcoords);

		showDistance();
	}

	function showDistance(){
		lastdis = totaldis;
		totaldis = 0;
		for (var c in pairs){

			var index1 = pairs[c][0];
			var index2 = pairs[c][1];

			var p1coords = pcoords[index1];
			var p2coords = pcoords[index2];

			var p1hsv = colormap[index1];
			var p2hsv = colormap[index2];

			var dis = Math.floor(hsvDistance(p1hsv, p2hsv)) / 100;
			totaldis += dis;

			var text = voronoiGraph.graph.board.create('text', [(p1coords[0] + p2coords[0])/2, (p1coords[1] + p2coords[1])/2 - 0.5, dis]);
			texts.push(text);
		}
	}

	function showVor(array){
		var polygons = diagram.polygons();
        var d_site = polygons.map(x => x.data);

        var vcellslen = vorcells.length;
        var flag = false;
        if(vcellslen == 0) flag = true;
        while(vcellslen < points.length){
            var color = getHueColor(vcellslen+1);
            addColorMap(vcellslen, color);
            var cell = new Vorcell( points[vcellslen].coords,{fillColor: color},voronoiGraph.graph, vcellslen);
            cell.c.visPropCalc.visible = true;
            vorcells.push(cell);
            vcellslen++;
        }
        vorcells.map(x => x.update(polygons[d_site.indexOf(array[x.id])],flag) );
	}

	function showDelTri(array){
		var curTris = diagram.triangles(); // new Delaunay Triangle
        if(curTris.length == tris.length){
            tris.map(x => x.update(curTris[x.id]));
        }else if(curTris.length > tris.length){
            if(tris.length>0) tris.map(x => x.update(curTris[x.id]));
            var cur = tris.length;
            while(cur < curTris.length){
                var triangle = new Triangle(curTris[cur], attr, voronoiGraph.graph,cur);
                addPairs(curTris[cur]);
                tris.push(triangle);
                cur++;
            }
        }else{
            var i = tris.length - 1;
            while(i >= curTris.length){
                voronoiGraph.graph.board.removeObject(tris[i].jxgCurve);
                tris.pop();
                i--;
            }
            tris.map(x => x.update(curTris[x.id]));
        }
	}

	function addPairs(tri){

		var index1 = getIndex(pcoords, tri[0]);
		var index2 = getIndex(pcoords, tri[1]);
		var index3 = getIndex(pcoords, tri[2]);

		if(!isDup(pairs, [index1,index2]))
			pairs.push([index1,index2]);
		if(!isDup(pairs, [index2,index3]))
			pairs.push([index2,index3]);
		if(!isDup(pairs, [index1,index3]))
			pairs.push([index1,index3]);
	}

	function addColorMap(index, color){
		var p = points[index];

		var hsl = color.match(/\d+/g).map(Number);
		var hsv = hsl2hsv(hsl[0], hsl[1] / 100, hsl[2] / 100);

		colormap.splice(index, 0, hsv);
	}

	function hsl2hsv(hue, sat, light){
		sat *= light<.5?light:1-light;
		return [hue, 2*sat/(light+sat), light+sat];
	}

	function getCode(coords){
		return (coords[0] + coords[1]).toFixed(10);
	}
 
 	function randomColor(){
 		colormap = colormap.slice();
 		for (var i = 0; i < vorcells.length; i++){
 			var h = Math.floor(Math.random() * 361);
 			var s = Math.floor(Math.random() * 51) + 50;
 			var l = Math.floor(Math.random() * 51) + 30;

 			var hsl = "hsl(" + h + ", " + s + "%, " + l + "%)";

 			vorcells[i].attr = {fillColor : hsl};
 			vorcells[i].c.visProp.fillcolor = hsl;

 			var hsv = hsl2hsv(h, s/100, l/100);
 			var code = getCode(vorcells[i].site);

 			colormap[i] = hsv;
 		}

 		colorlist.push(colormap.slice());
 		color_index = colorlist.length - 1;

 		voronoiGraph.graph.board.update();
 		clearText();
 		showDistance();
 		updateButtons();
 		lastText.nodeValue = "Last Distance: " + lastdis.toFixed(2);
 		totalText.nodeValue = "Total Distance: " + totaldis.toFixed(2);
 	}

 	function clearText(){
 		for(var i = 0; i < texts.length; i++){
 			texts[i].remove();
 		}

 		texts = [];
 	}

 	/* get from https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately */
 	function hsv2rgb(hsv) {
	    var r, g, b, i, f, p, q, t;
	    var h = hsv[0] / 360;
	    var s = hsv[1];
	    var v = hsv[2];

	    i = Math.floor(h * 6);
	    f = h * 6 - i;
	    p = v * (1 - s);
	    q = v * (1 - f * s);
	    t = v * (1 - (1 - f) * s);
	    switch (i % 6) {
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }
	    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	function hsv2hsl(hsv){
		var h = hsv[0];
		var s = hsv[1];
	    var v = hsv[2];

	    var l = (2 - s) * v / 2;

	    if (l != 0) {
	        if (l == 1) {
	            s = 0;
	        } else if (l < 0.5) {
	            s = s * v / (l * 2);
	        } else {
	            s = s * v / (2 - l * 2);
	        }
	    }

	    s = Math.floor(s * 100);
	    l = Math.floor(l * 100);

	    return [h, s, l];
	}

 	function hsvDistance(hsv1, hsv2){
 		var x1 = hsv1[1] * 100 * Math.cos(hsv1[0] / 180 * Math.PI) * hsv1[2];
 		var y1 = hsv1[1] * 100 * Math.sin(hsv1[0] / 180 * Math.PI) * hsv1[2];
 		var z1 = hsv1[2] * 100;


 		var x2 = hsv2[1] * 100 * Math.cos(hsv2[0] / 180 * Math.PI) * hsv2[2];
 		var y2 = hsv2[1] * 100 * Math.sin(hsv2[0] / 180 * Math.PI) * hsv2[2];
 		var z2 = hsv2[2] * 100;

 		var dis = Math.sqrt((x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2);

 		return dis;
 	}

 	function cloneData() {
		var i;
		var data = {edges: [], points: []};
		for (i = 0; i < points.length; i++) {
			data.points.push(points[i].clone());
		}
		for (i = 0; i < edges.length; i++) {
			var j = points.indexOf(edges[i].p1)
			var p1Clone = data.points[j];
			j = points.indexOf(edges[i].p2)
			var p2Clone = data.points[j];
			data.edges.push(edges[i].clone(p1Clone, p2Clone));
		}
		return data;
	}

	function getIndex(array, target){
		var i;
		for (i = 0; i < array.length; i++){
			if (array[i][0] == target[0] && array[i][1] == target[1])
				return i;
		}

		return -1;
	}

	function isDup(array, target){
		var i;
		for (i = 0; i < array.length; i++){
			if (array[i][0] == target[0] && array[i][1] == target[1])
				return true;
			if (array[i][0] == target[1] && array[i][1] == target[0])
				return true;
		}

		return false;
	}

	function createVorPoint(coords, pointGraph, attr, overrideOverlap) {
		if (!overrideOverlap && pointGraph.pointOverlap(coords))
			return null;
	    var vp = new Point(coords, attr);
		return addVorPoint(vp, pointGraph, true);
	}

	function addVorPoint(vorpoint, pointGraph, overrideOverlap) {
		if (!overrideOverlap && pointGraph.pointOverlap(vorpoint.coords))
			return null;
	    pointGraph.addPoint(vorpoint, true);
	    points.push(vorpoint);

		return vorpoint;
	}
 }