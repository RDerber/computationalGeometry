function GraphContainer(title) {
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
	this.buttonCol.style.minWidth = "300px";
	this.buttonCol.style.marginLeft = "5px";
    this.contentRow.appendChild(this.buttonCol);
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
    this.graphCol.appendChild(this.graphDiv);

    this.buttonCol = document.createElement("div");
    this.contentRow.appendChild(this.buttonCol);
}

function SetBody() {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
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
            topicList.appendChild(subli);

            var link = document.createElement("a");
            link.href = homePath + links[i][j];
            subli.appendChild(link);

            var algName = document.createTextNode(titles[i][j]);
            link.appendChild(algName);
        }
    }
}
