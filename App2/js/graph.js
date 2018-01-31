
function Graph() {
	this.points = [];
	this.edges = [];
	this.domEl = document.createElement('div');
	this.domEl.id = "graphDiv";
	this.domEl.classList.add("jxgbox");
	this.domEl.style = "width:400px; height:400px;";
	document.body.appendChild(this.domEl);
	this.board = JXG.JSXGraph.initBoard('graphDiv', { boundingbox: [-5, 5, 5, -5], axis: true, grid: true, showNavigation: false, showCopyright: false });
}