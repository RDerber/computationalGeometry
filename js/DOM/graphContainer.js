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

   // this.sidebar = SideBar();
   //this.domEl.appendChild(this.sidebar);

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
	this.buttonCol.appendChild(this.buttonContainer);

	this.lowerRightContainer = document.createElement("div");
	this.buttonCol.appendChild(this.lowerRightContainer);

	if (keyItems) {
		this.keyDiv = document.createElement("div");
		this.keyDiv.style.marginRight = "3px";
		this.keyDiv.style.border = "2px solid #922B21";
		this.keyDiv.style.borderRadius = "5px";
		this.keyDiv.style.padding = "5px";
		this.lowerRightContainer.appendChild(this.keyDiv);
		for (var i = 0; i < keyItems.length; ++i) {
			this.keyDiv.appendChild(KeyItem(keyItems[i].color, keyItems[i].text));
		}
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

function DualGraphContainer(title) {
    SetBody();
    this.domEl = document.createElement("div");
    this.domEl.style.display = "flex";
    this.domEl.style.flexDirection = "row";
    this.domEl.style.height = "100%";
    this.domEl.style.width = "100%";
    this.domEl.style.minWidth = "800px";
    this.domEl.style.flexWrap = "nowrap";
	this.domEl.style.justifyContent = "flex-start";
	this.domEl.style.alignItems = "stretch";
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
	this.graphDiv.style.margin = "10px";
    this.graphCol.appendChild(this.graphDiv);

    this.buttonCol = document.createElement("div");
    this.contentRow.appendChild(this.buttonCol);
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
	this.domEl.style.display = "flex";
	this.domEl.style.position = "relative";
	this.domEl.style.zIndex = "1";
	this.algoDrop = document.createElement("div");
	this.domEl.addEventListener("mouseenter", () => {
		this.algoDropContent.style.display = "block";
		this.algoDropButton.backgroundColor = "#a01010";
	})
	this.domEl.addEventListener("mouseleave", () => {
		this.algoDropContent.style.display = "none";
	})

	this.algoDropButton = document.createElement("button");
	this.algoDropButton.appendChild(document.createTextNode("Computational Geometry Algorithms"));
	this.algoDropButton.style.backgroundColor = "#a51417";
	this.algoDropButton.style.color = "white";
	this.algoDropButton.style.cursor = "pointer";
	this.algoDropButton.addEventListener("click", () => {
		window.location.assign(getHomePagePath());
	});
	this.algoDrop.appendChild(this.algoDropButton);

	this.algoDropContent = document.createElement("div");
	this.algoDropContent.style.display = "none";
	this.algoDropContent.style.position = "absolute";
	this.algoDrop.appendChild(this.algoDropContent);

	this.algoList = new AlgorithmList();
	this.algoDropContent.appendChild(this.algoList.domEl);

	this.domEl.appendChild(this.algoDrop);
	return this.headerBar;
}
function getHomePagePath() {
	var home = "/comp_geo_algorithms/";
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
	var home = "/comp_geo_algorithms/";
	var homePath = "/";
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
    var topics = ["Convex Hull", "Line Sweep", "Duality", "Line Arrangements"];

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

function GraphKey(keyitems) {
	var keyDiv = document.createElement("div");
	for (var i = 0; i < keyitems.length; ++i) {
		keyDiv.appendChild(KeyItem(keyitems[i].color, keyitems[i].text));
	}
}

function KeyItem(color, text) {
	var item = document.createElement("div");
	item.style.display = "flex";
	item.style.flexDirection = "row";

	var colorContainer = document.createElement("div");
	colorContainer.style.display = "flex";
	colorContainer.style.flexDirection = "column";
	colorContainer.style.justifyContent = "space-around";
	colorContainer.style.marginRight = "5px";
	item.appendChild(colorContainer);

	var colorBox = document.createElement("div");
	colorBox.style.height = "12px";
	colorBox.style.width = "12px";
	colorBox.style.borderRadius = "50%";
	colorBox.style.backgroundColor = color;
	colorContainer.appendChild(colorBox);

	var textBox = document.createElement("div");
	item.appendChild(textBox);

	var textNode = document.createTextNode(text);
	textNode.whiteSpace = "pre";
	textBox.appendChild(textNode);

	return item;
}