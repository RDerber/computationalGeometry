window.onload = function () {
  	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0xffffff, 1);
	document.body.appendChild( renderer.domElement );

	var r = 1;
	var height = 2;

	var button;
	var pts = [];
	var pairs = [];
	var colormap = [];
	var fileid = 0;
	var fileGraph = [];
	createUpload();

	this.buttonListener = function () {
		if ('files' in button) {
			for(var i = 0; i < button.files.length; i++){
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

			
				fr.readAsText(button.files[i], "UTF-8");
			}
		}
	}

	button.addEventListener("change", this.buttonListener);

	renderer.shadowMap.enabled = true
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// 环境光
	var ambientLight = new THREE.AmbientLight(0x606060);
	scene.add(ambientLight);
	// 平行光
	var directionalLight = new THREE.DirectionalLight(0xBCD2EE);
	directionalLight.position.set(1, 0.75, 0.5).normalize();
	scene.add(directionalLight);

	var geometry = new THREE.ConeBufferGeometry( 1, 2, 64, 1, false );
	console.log(geometry.attributes);

	var vertices = geometry.getAttribute('position').array;
	var vertexColors = [];

	for(var i = 0; i < vertices.length; i+=3){
		var hsv = pos2hsv([vertices[i],vertices[i+1],vertices[i+2]]);
		var rgb = hsv2rgb(hsv);
		vertexColors = vertexColors.concat(rgb);
	}

	var typed = new Float32Array(vertexColors);

	var a_colors = new THREE.BufferAttribute(typed, 3);
	geometry.setAttribute('a_color', a_colors);

	var material = new THREE.ShaderMaterial({
	
	vertexShader: `
		attribute vec3 a_color;
		varying vec3 v_color;

		void main() {
		  v_color = a_color;
	      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
	    }`,

	fragmentShader: `
		precision lowp float;
		varying vec3 v_color;
	    void main() {
	      gl_FragColor = vec4(v_color, 0.8);
	    }`,
	transparent: true,
	});

	var cone = new THREE.Mesh( geometry, material );
	cone.rotation.z += Math.PI;
	scene.add( cone );

	//var material2 = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 5} );

	/*var points = [];
	points.push( new THREE.Vector3( - 1, 0, 0 ) );
	points.push( new THREE.Vector3( 0, 1, 0 ) );
	points.push( new THREE.Vector3( 1, 0, 0 ) );

	var geometry2 = new THREE.BufferGeometry().setFromPoints( points );

	var line = new THREE.Line( geometry2, material2 );
	scene.add( line );*/

	//camera.position.z = 5;
	camera.position.set( 0, 0, 5 );
	camera.lookAt( 0, 0, 0 );

	renderer.render( scene, camera );

	hideButton();

	function switchModel(){
		if (cone.material.visible){
			if (cone.material.wireframe)
				cone.material.visible = false;
			cone.material.wireframe = true;
		}
		else{
			cone.material.visible = true;
			cone.material.wireframe = false;
		}
	}

	function hideButton(){
		var hide = document.createElement('div');
		hide.id = "hide/show";
		hide.classList.add("button");

		var buttontext = document.createElement('div');
		buttontext.classList.add("button-content");
		buttontext.appendChild(document.createTextNode("hide/show"));
		hide.appendChild(buttontext);
		hide.addEventListener('click', switchModel);
		document.body.appendChild(hide);
	}

	function showDataSets(){
		var pgroup = [];
		var lgroup = [];

		for (var i in colormap){
			var hsv = colormap[i];
			var pos = hsv2pos(hsv);
			var rgb = hsv2rgb(hsv)

			var cstr = "rgb(" + Math.round(rgb[0]*100) + "%, " + Math.round(rgb[1]*100) + "%, " + Math.round(rgb[2]*100) + "%)";
			var c = new THREE.Color(cstr);

			var mat = new THREE.PointsMaterial({ color : c, size : 0.1});
			var geo = new THREE.Geometry();
			geo.vertices.push(new THREE.Vector3(pos[0], pos[1], pos[2]));

			var p = new THREE.Points(geo, mat);
			pgroup.push(p);
			scene.add(p);
		}

		for (var c in pairs){

			var p1hsv = colormap[pairs[c][0]];
			var p2hsv = colormap[pairs[c][1]];

			var p1pos = hsv2pos(p1hsv);
			var p2pos = hsv2pos(p2hsv);

			var mat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2});
			var vertices = [];
			vertices.push(new THREE.Vector3(p1pos[0], p1pos[1], p1pos[2]));
			vertices.push(new THREE.Vector3(p2pos[0], p2pos[1], p2pos[2]));
			var geo = new THREE.BufferGeometry().setFromPoints(vertices);

			var line = new THREE.Line(geo, mat);
			lgroup.push(line);
			scene.add(line);
		}

		fileGraph.push([pgroup, lgroup]);
		createControlButton(fileid);
		console.log(colormap);
		fileid += 1;
	}

	function createControlButton(index){
		var control = document.createElement('div');
	    var controlbox = document.createElement('input');
	    controlbox.setAttribute("type", "checkbox");
	    controlbox.setAttribute("id", index);
	    controlbox.addEventListener("click", function(){
	        if(document.getElementById(index).checked) {
	        	showElement(index);
	        }
	        else {
	        	hideElement(index);
	        }
	    });

	    control.appendChild(controlbox);
	    control.appendChild(document.createTextNode(index));
	    document.body.appendChild(control);
	}

	function showElement(index){
		var points = fileGraph[index][0];
		var lines = fileGraph[index][1];

		for (var i in points){
			points[i].material.visible = true;
		}

		for(var i in lines){
			lines[i].material.visible = true;
		}
	}

	function hideElement(index){
		var points = fileGraph[index][0];
		var lines = fileGraph[index][1];

		for (var i in points){
			points[i].material.visible = false;
		}

		for(var i in lines){
			lines[i].material.visible = false;
		}
	}

	function hsv2pos(hsv){
		var h = hsv[0];
		var s = hsv[1];
		var v = hsv[2];

		var angle = h / 180 * Math.PI;

		var z = height * v - height / 2;

		var len = r * v * s;

		var x = len * Math.cos(angle);
		var y = -len * Math.sin(angle);

		return [x, z, y];
	}

	function pos2hsv(pos){
		// z-axis is the vertical axis
		var x = pos[0];
		var y = pos[2];
		var z = pos[1];

		var angle = Math.atan2(y, x);
		
		var len = Math.sqrt(x**2 + y**2);

		var v = 1 - (z + height / 2) / 2;
		var h = (angle * 180) / Math.PI + 180;
		var s = len / r / (v / 1);
		if (v == 0)
			s = 0;
		

		return [h, s, v];
	}

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
	    //return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	    return [r, g, b];
	}


	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
	}
	animate();
	console.log(geometry.vertices);

	var radius = 5;
	var onMouseDownTheta = 45;
	var onMouseDownPhi = 90;
	var onMouseDownPosition = {x:0, y:0};
	var theta = 0;
	var phi = 0;
	var click = false;

	document.addEventListener('mousedown', mouseDown, false);
	document.addEventListener('mousemove', mouseMove, false);
	document.addEventListener('mouseup', mouseUp, false);

	function mouseDown(event){
		onMouseDownPosition.x = event.clientX;
		onMouseDownPosition.y = event.clientY;
		onMouseDownTheta = theta;
		onMouseDownPhi = phi;
		click = true;
	}

	function mouseUp(event){
		click = false;
	}

	function mouseMove(event){
		if(!click)
			return;

		theta = -((event.clientX - onMouseDownPosition.x) * 0.8) + onMouseDownTheta;
		phi = ((event.clientY - onMouseDownPosition.y) * 0.8) + onMouseDownPhi;
		camera.position.x = radius * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
		camera.position.y = radius * Math.sin(phi * Math.PI / 360);
		camera.position.z = radius * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);

		camera.lookAt( 0, 0, 0 );
	}

	function createUpload(){
		button = document.createElement("input");
		button.setAttribute('type', "file");
		button.setAttribute('id', 'graphFile');
		button.setAttribute('multiple', '');
		button.style.flex = "0";
		button.setAttribute("value", "Upload Graph Data");
		document.body.appendChild(button);
	}

	function loadData(data){
		pts = data.points;
		pairs = data.pairs;
		colormap = data.colormap;

		showDataSets();
	}

	function getCode(coords){
		return (coords[0] + coords[1]).toFixed(10);
	}
}