
function GraphContainer(title) {
	document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
	document.documentElement.style.height = "100%";

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

	this.sidebar = document.createElement("div");
//	this.sidebar.style.width = "150px";
	this.sidebar.style.backgroundColor = "#F7DC6F";
	this.sidebar.appendChild(document.createTextNode("Algorithms"));
	this.domEl.appendChild(this.sidebar);

	this.contentCol = document.createElement("div");
	this.contentCol.style.display = "flex";
	this.contentCol.style.minWidth = "600px";
	this.contentCol.style.flex = "1"
	this.contentCol.style.flexDirection = "column";
	this.contentCol.style.flexWrap = "nowrap";
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

	this.contentRow = document.createElement("div");
	this.contentRow.style.display = "flex";
	this.contentRow.style.minWidth = "600px";
	this.contentRow.style.flex = "1";
	this.contentRow.style.color = "black";
	this.contentRow.style.flexDirection = "row";
	this.contentRow.style.flexWrap = "nowrap";
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
	this.buttonCol.style.flex = "1";
	this.contentRow.appendChild(this.buttonCol);

	var algList = new AlgorithmList();
	this.sidebar.appendChild(algList.domEl);
}

function AlgorithmList() {
	var homePath = "http://students.engineering.wustl.edu/comp_geo_algorithms/"
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
	var lineArrPaths = ["line_arrangement/lineArrangment.html"];
	titles.push(lineArrAlgs);
	links.push(lineArrPaths);

	this.domEl = document.createElement("UL");
	this.domEl.style.paddingLeft = "20px";
	for (var i = 0; i < topics.length; ++i) {

		var li = document.createElement("LI");
		li.style.paddingLeft = "0";
		li.appendChild(document.createTextNode(topics[i]));
		this.domEl.appendChild(li);

		var topicList = document.createElement("UL");
		topicList.style.paddingLeft = "5px";
		this.domEl.appendChild(topicList);

		for (var j = 0; j < titles[i].length; ++j) {
			var subli = document.createElement("LI");
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