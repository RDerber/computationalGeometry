function VDGraph(attr, parent) {
    var vorgraph = this;
    this.graph ;
    this.vorpoints = [];
    this.vorMap = new Map();
    var vo = d3.voronoi();
    this.vorcells = [];
    this.tris = [];
    this.circles = [];

 

    var shiftPress = 0;
    this.attr = {axis: true, grid: true, showNavigation: false, showCopyright: false,showClearTraces: true };
    //Object.assign(this.attr, attr);
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
    this.domEl.appendChild(leftDiv);
    //Div.appendChild(leftDiv);

    this.graph = new Graph({boundingbox: [0, 100, 100*Math.round((leftDiv.clientWidth/leftDiv.clientHeight)*100)/100, 0],

        showNavigation: false, showZoom: false,showClearTraces: true, pan: {
        enabled: false,
        needshift: false
    }, zoom:false, keepAspectRatio: true}, leftDiv, "graph");
    //this.graph.board.removeEventHandlers();
 /*   debugger;
    var width = vorgraph.graph.svg.clientWidth;
    var height = vorgraph.graph.svg.clientHeight;
    var ratio = 100*Math.round((width/height)*100)/100;
    vorgraph.graph.board.setBoundingBox([0,100,ratio,0],true);*/

	var $randomDiv = $(document.createElement('div'));
	$randomDiv.css("flex", 0);

	var $moreText = $(document.createElement('div'));
    $moreText.css("display", "inline-block");
    $moreText.append(document.createTextNode("Random Points: "));
	$randomDiv.append($moreText);

	var $input = $(document.createElement('input'));
	$input.attr("id", "randomInput");
	$input.css("display", "inline-block");
	$input.css("type", "number");
	$randomDiv.append($input);

	var $randomButton = $(document.createElement('button'));
    $randomButton.css("display", "inline-block");
    $randomButton.append(document.createTextNode("Add"));
    $randomButton.on("click", () => { 
        var num = $("#randomInput").val();
        addRandomPoints(num, vorgraph.graph);
        
         });


    $randomDiv.append($randomButton);
    //debugger;
    this.graph.bottomRow.appendChild($randomDiv.get(0));



    //checkbox div
    var rightDiv = document.createElement('div');
    rightDiv.style.width = "200px";
    this.domEl.appendChild(rightDiv);

    var vordiv = document.createElement('div');
    var vorcheckbox = document.createElement('input');
    vorcheckbox.setAttribute("type", "checkbox");
    vorcheckbox.setAttribute("id", "vorcheckbox");
    vorcheckbox.addEventListener("click", function(){
        if(document.getElementById("vorcheckbox").checked)  updateVor();
        else resetVorcells();
    });
    vordiv.appendChild(vorcheckbox);
    vordiv.appendChild(document.createTextNode("Voronoi Diagram"));
    rightDiv.appendChild(vordiv);

    var deldiv = document.createElement('div');
    var delcheckbox = document.createElement('input');
    delcheckbox.setAttribute("type", "checkbox");
    delcheckbox.setAttribute("id", "delcheckbox");
    delcheckbox.addEventListener("click", function(){
        if(document.getElementById("delcheckbox").checked)  updateVor();
        else resetTriangles();
    });

    deldiv.appendChild(delcheckbox);
    deldiv.appendChild(document.createTextNode("Delaunay Triangulation"));
    rightDiv.appendChild(deldiv);

    var cirdiv = document.createElement('div');
    var circheckbox = document.createElement('input');
    circheckbox.setAttribute("type", "checkbox");
    circheckbox.setAttribute("id", "circheckbox");
    circheckbox.addEventListener("click", function(){
        if(document.getElementById("circheckbox").checked)  updateVor();
        else resetCircles();
    });

    cirdiv.appendChild(circheckbox);
    cirdiv.appendChild(document.createTextNode("Empty Circle"));
    rightDiv.appendChild(cirdiv);

    var tutorial = document.createElement('div');
    tutorial.id = "tutorial";
    tutorial.classList.add("tutorial");
    var text1 = document.createElement('div');
    text1.classList.add('subtutorial');
    text1.appendChild(document.createTextNode('1. Add points: Click the board or use Random Points button'));
    tutorial.appendChild(text1);
    var text2 = document.createElement('div');
    text2.classList.add('subtutorial');
    text2.appendChild(document.createTextNode('2. Click related checkbox'));
    tutorial.appendChild(text2);
    rightDiv.appendChild(tutorial);

    var bb = this.graph.board.getBoundingBox();
    var bbox = {xl: bb[0], xr: bb[2], yt: bb[3], yb: bb[1]}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

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

    this.graph.board.on('move', () => { moveFlag = 1 });
    this.graph.board.on('down', () => { moveFlag = 0 });
	this.graph.board.on('up', () =>
        checkClick(function(event) {
            var coords = vorgraph.graph.getMouseCoords(event);
            createPointEvent(coords, vorgraph.graph);
        })
    );
    
    function addRandomPoints(numPoints, pointGraph) {
        var i;
        debugger;
        var dx = [bb[0], bb[2]];
        var dy = [bb[1], bb[3]];
        pointGraph.board.suspendUpdate();
        for (i = 0; i < numPoints; ++i) {
            ;
            var x = Math.random() * (dx[1] - dx[0]-40) + dx[0]+2;
            var y = Math.random() * (dy[1] - dy[0]) + dy[0];
            createPointEvent([x, y], pointGraph);
        }
        //this.board.unsuspendUpdate();
        pointGraph.board.update();
    }


	function createPointEvent(coords, pointGraph) {
		var vp = vorgraph.createVorPoint(coords, pointGraph, { fillColor: "black", strokeColor: "black", straightFirst: "true", straightLast: "true" });
		if (!vp)
            return;
        var point = vp.jxgPoint;
        point.on('drag', function () {
            updateVor();
        });

        updateVor(); 

	}

    function updateVor(){
        vorgraph.graph.board.suspendUpdate();
        if(vorgraph.vorpoints.length <=1 ) return; // only has one point, don't need to compute voronoi diagram.
        // compute voronoi diagram
        var points = vorgraph.vorpoints;
        var array = points.map(x => x.coords);
        
        vo.extent([[bbox.xl-1000, bbox.yt-1000],[bbox.xr+1000, bbox.yb+1000]]);


        // display voronoi diagram
        if(document.getElementById("vorcheckbox").checked){
            getVorDiagram(vo, array);
        }
         // display delaunay triangulation
        if(document.getElementById("delcheckbox").checked){
            if(vorgraph.vorpoints.length <=2 ) return;
            getDelTri(vo, array);
        }
        // display empty circle
        if(document.getElementById("circheckbox").checked){
            if(vorgraph.vorpoints.length <=2 ) return;
            getEmptyCircle(vo, array);
        }

        vorgraph.graph.board.unsuspendUpdate();
        
    }  
 
    function getVorDiagram(vo, array){
        var diagram = vo.polygons(array);
        var d_site = diagram.map(x => x.data);

        var vcellslen = vorgraph.vorcells.length;
        var flag = false;
        if(vcellslen == 0) flag = true;
        while(vcellslen < vorgraph.vorpoints.length){
            var color = getHueColor(vcellslen+1);
            var cell = new Vorcell( vorgraph.vorpoints[vcellslen].coords,{fillColor: color},vorgraph.graph, vcellslen);
            vorgraph.vorcells.push(cell);
            vcellslen++;
        }
        vorgraph.vorcells.map(x => x.update(diagram[d_site.indexOf(array[x.id])],flag) );
    }

    function getDelTri(vo, array){
        var curTris = vo.triangles(array); // new Delaunay Triangle
        console.log(curTris);
        if(curTris.length == vorgraph.tris.length){
            vorgraph.tris.map(x => x.update(curTris[x.id]));
        }else if(curTris.length > vorgraph.tris.length){
            if(vorgraph.tris.length>0) vorgraph.tris.map(x => x.update(curTris[x.id]));
            var cur = vorgraph.tris.length;
            while(cur < curTris.length){
                var triangle = new Triangle(curTris[cur], attr, vorgraph.graph,cur);
                vorgraph.tris.push(triangle);
                cur++;
            }
        }else{
            var i = vorgraph.tris.length - 1;
            while(i >= curTris.length){
                vorgraph.graph.board.removeObject(vorgraph.tris[i].jxgCurve);
                vorgraph.tris.pop();
                i--;
            }
            vorgraph.tris.map(x => x.update(curTris[x.id]));
        }
    }

    function getEmptyCircle(vo, array){
        
        var curTris = vo.triangles(array); // new Delaunay Triangle
        var i = vorgraph.circles.length -1;
        while(i >= curTris.length){
            vorgraph.graph.board.removeObject(vorgraph.circles[i].jxgCircle);
            vorgraph.graph.board.removeObject(vorgraph.circles[i].jxgCenter);
            vorgraph.circles.pop();
            i--;
        }
        
        for(i=0; i<vorgraph.circles.length; i++){

            var p1 = vorgraph.vorpoints[array.indexOf(curTris[i][0])];
            var p2 = vorgraph.vorpoints[array.indexOf(curTris[i][1])];
            var p3 = vorgraph.vorpoints[array.indexOf(curTris[i][2])];
            vorgraph.circles[i].update(p1.coords, p2.coords, p3.coords);

        }
        
        while(i < curTris.length){
            var p1 = vorgraph.vorpoints[array.indexOf(curTris[i][0])];
            var p2 = vorgraph.vorpoints[array.indexOf(curTris[i][1])];
            var p3 = vorgraph.vorpoints[array.indexOf(curTris[i][2])];
            var  circle = new Circle( p1.coords, p2.coords, p3.coords, vorgraph.graph, {}, i);
            vorgraph.circles.push(circle);
            i++;
        }
        
    }

    function resetVorcells(){
        vorgraph.vorcells.map(x => x.remove());
        vorgraph.vorcells = [];
        //vorgraph.vorMap = new Map();
    }

    function resetTriangles(){
        vorgraph.tris.map(x => x.remove());
        vorgraph.tris = [];
    }

    function resetCircles(){
        vorgraph.circles.map(x => x.remove());
        vorgraph.circles = [];
    }

}


VDGraph.prototype.createVorPoint = function (coords, pointGraph, attr, overrideOverlap) {
	if (!overrideOverlap && pointGraph.pointOverlap(coords))
		return null;
    var vp = new Point(coords, attr);
	return this.addVorPoint(vp, pointGraph, true);
}

VDGraph.prototype.addVorPoint = function (vorpoint, pointGraph, overrideOverlap) {
	if (!overrideOverlap && pointGraph.pointOverlap(vorpoint.coords))
		return null;
    pointGraph.addPoint(vorpoint, true);
    this.vorpoints.push(vorpoint);

	return vorpoint;
}

VDGraph.prototype.createVorcell = function (cell, attr, pointGraph) {

    var newcell = new Vorcell(cell, attr, pointGraph);
    if(newcell.vertice.length == 0) return null;
    this.vorcells.push(newcell);
	return newcell;
}







