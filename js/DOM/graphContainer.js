function GraphContainer(title, keyItems = null, description = null) {
    SetBody();

    this.domEl = document.createElement("div");
	this.domEl.style.display = "flex";
	this.domEl.style.height = "100%";
    this.domEl.style.flexDirection = "column";
    this.domEl.style.flexWrap = "nowrap";
    this.domEl.style.justifyContent = "flex-start";
    document.body.appendChild(this.domEl);

	this.headerBar = new HeaderBar();
	this.domEl.appendChild(this.headerBar.domEl);

    this.contentCol = ContentCol();
    this.domEl.appendChild(this.contentCol);

    this.titleDiv = document.createElement("div");
    this.titleDiv.style.color = "#922B21";
    this.titleDiv.style.verticalAlign = "top";
    this.contentCol.appendChild(this.titleDiv);

    this.titleText = document.createElement("h1");
    this.titleText.style.marginTop = 0;
    this.titleText.style.marginBottom = 0;
    this.titleText.appendChild(document.createTextNode(title));
    this.titleDiv.appendChild(this.titleText);

    this.contentRow = ContentRow();
    this.contentCol.appendChild(this.contentRow);

    this.graphCol = document.createElement("div");
    this.graphCol.style.minWidth = "400px";
    this.graphCol.style.flex = "5";
    this.graphCol.style.display = "flex";
    this.graphCol.style.flexDirection = "column";
    this.graphCol.style.alignItems = "stretch";
    this.contentRow.appendChild(this.graphCol);

    this.graphDiv = document.createElement("div");
    this.graphDiv.style.display = "flex";
    this.graphDiv.style.flexDirection = "column";
    this.graphDiv.style.flex = "1";
    this.graphDiv.style.align = "left";
	this.graphCol.appendChild(this.graphDiv);

	this.buttonCol = document.createElement("div");
	this.buttonCol.style.display = "flex";
	this.buttonCol.style.flexDirection = "column";
	this.buttonCol.style.justifyContent = "space-between";
	this.buttonCol.style.minWidth = "150px";
	this.buttonCol.style.height = "100%";
	this.buttonCol.style.marginLeft = "5px";
	this.buttonCol.style.paddingBottom = "10px";
	this.buttonCol.style.position = "relative";
	this.contentRow.appendChild(this.buttonCol);

	this.buttonContainer = document.createElement("div");
	this.buttonContainer.style.display = 'flex';
	this.buttonContainer.style.flexDirection = "column";
	this.buttonContainer.style.height = "100%";
	this.buttonContainer.style.paddingBottom = "10px";
	this.buttonContainer.style.position = "relative";
	this.buttonCol.appendChild(this.buttonContainer);

	this.lowerRightContainer = document.createElement("div");
	this.buttonCol.appendChild(this.lowerRightContainer);
	if (keyItems != null) {
		this.graphKey = GraphKey(keyItems);
		this.lowerRightContainer.appendChild(this.graphKey);
	}

	if (description) {
		this.descriptionDiv = document.createElement("div");
		this.descriptionDiv.style.width = "100%";
		this.descriptionDiv.style.marginTop = "5px";
		this.descriptionDiv.style.padding = "4px";
		this.lowerRightContainer.appendChild(this.descriptionDiv);
		this.descriptionDiv.appendChild(description);
	}
}

function HomePage(title, keyItems = null, description = null) {
	SetBody();

	this.domEl = document.createElement("div");
	this.domEl.style.display = "flex";
	this.domEl.style.flexDirection = "row";
	this.domEl.style.height = "100%";
	this.domEl.style.flexWrap = "nowrap";
	this.domEl.style.justifyContent = "flex-start";
	document.body.appendChild(this.domEl);

	this.sidebar = SideBar();
	this.domEl.appendChild(this.sidebar);

	this.contentCol = ContentCol();
	this.domEl.appendChild(this.contentCol);

	this.titleDiv = document.createElement("div");
	this.titleDiv.style.color = "#922B21";
	this.titleDiv.style.verticalAlign = "top";
	this.contentCol.appendChild(this.titleDiv);

	this.titleText = document.createElement("h1");
	this.titleText.style.marginTop = 0;
	this.titleText.style.marginBottom = 0;
	this.titleText.appendChild(document.createTextNode(title));
	this.titleDiv.appendChild(this.titleText);

	this.contentRow = ContentRow();
	this.contentCol.appendChild(this.contentRow);
}

function SetBody() {
    document.documentElement.style.height = "100%";
    document.body.style.height = "96%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
}

function SideBar() {
    var sidebar = document.createElement("div");
    sidebar.style.backgroundColor = "#F7DC6F";
    sidebar.style.flexGrow = "0";
    sidebar.appendChild(document.createTextNode("Algorithms"));
    sidebar.style.paddingRight = "15px";
    sidebar.style.paddingLeft = "5px";
    var algList = new AlgorithmList();
	sidebar.appendChild(algList.domEl);
    return sidebar;
}

function ContentCol() {
    var contentCol = document.createElement("div");
	contentCol.style.display = "flex";
	contentCol.style.height = "98%";
    contentCol.style.minWidth = "600px";
    contentCol.style.flex = "1";
    contentCol.style.flexDirection = "column";
    contentCol.style.flexWrap = "nowrap";
    contentCol.style.marginLeft = "5px";
    return contentCol;
}

function ContentRow() {
    var contentRow = document.createElement("div");
    contentRow.style.display = "flex";
	contentRow.style.minWidth = "600px";
    contentRow.style.flex = "1";
    contentRow.style.color = "black";
    contentRow.style.flexDirection = "row";
    contentRow.style.flexWrap = "nowrap";
    return contentRow;
}

function HeaderBar() {
	this.domEl= document.createElement("div");
	this.domEl.style.position = "relative";
	this.domEl.style.zIndex = "1";
	this.domEl.style.backgroundColor = "#a51417";
	this.algoDrop = document.createElement("div");
	this.algoDrop.style.float = "left";

	this.algoDropButton = document.createElement("button");
	this.algoDropButton.appendChild(document.createTextNode("Computational Geometry Algorithms"));
	this.algoDropButton.style.backgroundColor = "#a51417";
	this.algoDropButton.style.color = "white";
	this.algoDropButton.style.cursor = "pointer";
	this.algoDropButton.addEventListener("click", () => {
		window.location.assign(getHomePagePath());
	});
	this.algoDrop.appendChild(this.algoDropButton);

	this.algoDropButton.addEventListener("mouseenter", () => {
		this.algoDropContent.style.display = "block";
		this.algoDropButton.backgroundColor = "#a01010";
	})
	this.algoDrop.addEventListener("mouseleave", () => {
		this.algoDropContent.style.display = "none";
	})

	this.algoDropContent = document.createElement("div");
	this.algoDropContent.style.display = "none";
	this.algoDropContent.style.position = "absolute";
	this.algoDrop.appendChild(this.algoDropContent);

	this.algoList = new AlgorithmList();
	this.algoDropContent.appendChild(this.algoList.domEl);

	this.domEl.appendChild(this.algoDrop);

	this.about = document.createElement("div");
	this.about.style.float = "left";
	this.about.style.width = "300px";
	this.about.style.zIndex = "99";
	this.aboutButton = document.createElement("button");
	this.aboutButton.appendChild(document.createTextNode("About"));
	this.aboutButton.style.backgroundColor = "#a51417";
	this.aboutButton.style.color = "white";
	this.aboutButton.style.float = "center";
	this.about.appendChild(this.aboutButton);
	this.domEl.appendChild(this.about);

	this.algoAboutContent = document.createElement("div");
	this.algoAboutContent.style.display = "none";
	this.algoAboutContent.style.position = "absolute";
	this.algoAboutContent.style.width = "300px";
	this.about.appendChild(this.algoAboutContent);

	this.aboutButton.addEventListener("mouseenter", () => {
		this.algoAboutContent.style.display = "block";
		this.algoAboutContent.backgroundColor = "#a01010";
	})
	this.aboutButton.addEventListener("mouseleave", () => {
		this.algoAboutContent.style.display = "none";
	})
	this.aboutContent = new AboutContent();
	this.algoAboutContent.appendChild(this.aboutContent.domEl);

	return this.headerBar;
}
function getHomePagePath() {
	var home = "/comp_geo_algorithms";
	var homePath = "/";
	var loc = window.location.pathname;
	var i = loc.length - 1;
	while (i >= 0) {
		var end = i + 1;
		while (i >= 0 && loc[i] != '/') {
			--i;
		}
		var partpath = loc.slice(i, end + 1);
		if (partpath == home) {
			homePath = loc.slice(0, end + 1);
			break;
		}
		--i;
	}
	return homePath+"index.html";
}

function AlgorithmList() {
	var home = "http://students.engineering.wustl.edu/comp_geo_algorithms/devBranch";
	var homePath = home + "/";
	var loc = window.location.pathname;
	var i = loc.length - 1;
	while (i >= 0) {
		var end = i + 1;
		while (i >= 0 && loc[i] != '/') {
			--i;
		}
        var partpath = loc.slice(i, end+1);
		if (partpath == home) {
			homePath = loc.slice(0, end + 1);
			break;
		}
		--i;
	}
    var topics = ["Convex Hull", "Line Sweep", "Duality", "Line Arrangements", "Voronoi Diagram", "Delaunay Triangulation","Trees"];

    var titles = [];
    var links = [];

    var convAlgs = ["Graham Scan", "Quick Hull"];
	var convPaths = ["graham_scan/grahamScan.html", "quick_hull/quickHull.html"];
    titles.push(convAlgs);
    links.push(convPaths);

    var sweepAlgs = ["Segment Intersection"];
    var sweepPaths = ["line_sweep/lineSweep.html"]
    titles.push(sweepAlgs);
    links.push(sweepPaths);

    var dualAlgs = ["Dual Points"];
    var dualPaths = ["dual_point/dualPoint.html"]
    titles.push(dualAlgs);
    links.push(dualPaths);

    var lineArrAlgs = ["LA Construction"];
    var lineArrPaths = ["line_arrangement/lineArrangement.html"];
    titles.push(lineArrAlgs);
    links.push(lineArrPaths);

	var voronoi = ["Voronoi Diagram"];
	var voronoiPath = ["Voronoi_Diagram/VoronoiDiagram.html"];
    titles.push(voronoi);
	links.push(voronoiPath);
	
	var Del = ["Delaunay_Triangulation"];
	var DelPath = ["Delaunay_Triangulation/DelaunayTriangulation.html"];
    titles.push(Del);
	links.push(DelPath);

	var treeAlgs = ["KD-Tree"];
	var treePaths = ["KD-Tree/kd.html"];
	titles.push(treeAlgs);
	links.push(treePaths);

	
	this.domEl = document.createElement("UL");
	this.domEl.style.margin = 0;
	this.domEl.style.borderStyle = "solid";
	this.domEl.style.borderWidth = "1px";
	this.domEl.style.backgroundColor = "white";
    this.domEl.style.paddingLeft = "20px";
    for (var i = 0; i < topics.length; ++i) {

        var li = document.createElement("LI");
        li.style.paddingLeft = "0";
        li.appendChild(document.createTextNode(topics[i]));
        this.domEl.appendChild(li);
        li.style.whiteSpace = "nowrap";

        var topicList = document.createElement("UL");
        topicList.style.paddingLeft = "5px";
        this.domEl.appendChild(topicList);

        for (var j = 0; j < titles[i].length; ++j) {
            var subli = document.createElement("LI");
            subli.style.whiteSpace = "nowrap";
			subli.style.padding = "0";
			subli.style.border = "1";
            topicList.appendChild(subli);

            var link = document.createElement("a");
			link.href = homePath + links[i][j];
            subli.appendChild(link);

            var algName = document.createTextNode(titles[i][j]);
            link.appendChild(algName);
        }
	}

}

function AboutContent(){
	this.domEl = document.createElement("div");
	this.domEl.style.margin = 0;
	this.domEl.style.borderStyle = "solid";
	this.domEl.style.borderWidth = "1px";
	this.domEl.style.backgroundColor = "white";
	this.domEl.style.paddingRight = "20px";
	var textDiv = document.createElement("div");
    textDiv.style.marginLeft = "5px";
	var text = document.createTextNode("This webpage hosts a suite of javascript demos for computational geometry algorithms. The demos provide step-by-step animation of the algorithms and allow interaction with the user. The project came out of the CSE546 course at Washington University in St. Louis. Key contributors include Robert Derber and Yujie Zhou. If you have any questions or feedback, please email Prof. Tao Ju (taoju@wustl.edu).");
	textDiv.appendChild(text);
	this.domEl.appendChild(textDiv);

}



function GraphKey(keyitems) {
	var keyDiv = document.createElement("div");
	for (var i = 0; i < keyitems.length; ++i) {
		keyDiv.appendChild(KeyItem(keyitems[i].type, keyitems[i].color, keyitems[i].text));
	}
	return keyDiv;
}



function KeyItem(type, color, text) {
	var item = document.createElement("div");
	item.style.display = "flex";
	item.style.flexDirection = "row";

	var colorContainer = document.createElement("div");
	colorContainer.style.display = "flex";
	colorContainer.style.flexDirection = "column";
	colorContainer.style.justifyContent = "space-around";
	colorContainer.style.marginRight = "5px";
	item.appendChild(colorContainer);

	if (type == "point") {
		var colorBox = document.createElement("div");
		colorBox.style.marginRight = "8px";
		colorBox.style.marginLeft = "8px";
		colorBox.style.height = "12px";
		colorBox.style.width = "12px";
		colorBox.style.borderRadius = "50%";
		colorBox.style.backgroundColor = color;
		colorContainer.appendChild(colorBox);
	}
	else if (type == "line") {
		var lineBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");;
		lineBox.setAttribute('height', "12px");
		lineBox.setAttribute('width', "28px");
		var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', "4");
		line.setAttribute('x2', '24');
		line.setAttribute('y1', "4");
		line.setAttribute('y2', "4");
		line.setAttribute('y2', "4");
		line.setAttribute('stroke-width', "2");
		line.setAttribute('stroke', color);
		lineBox.appendChild(line);
		colorContainer.appendChild(lineBox);
	}
	else if (type == "line-dotted") {
		var lineBox = document.createElementNS("http://www.w3.org/2000/svg", "svg");;
		lineBox.setAttribute('height', "12px");
		lineBox.setAttribute('width', "28px");
		var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		line.setAttribute('x1', "4");
		line.setAttribute('x2','24');
		line.setAttribute('y1', "4");
		line.setAttribute('y2', "4");
		line.setAttribute('y2', "4");
		line.setAttribute('stroke', color);
		line.setAttribute('stroke-width', "2");
		line.setAttribute('stroke-dasharray', "2");
		lineBox.appendChild(line);
		colorContainer.appendChild(lineBox);
	}

	var textBox = document.createElement("div");
	item.appendChild(textBox);

	var textNode = document.createTextNode(text);
	textNode.whiteSpace = "pre";
	textBox.appendChild(textNode);

	return item;
}