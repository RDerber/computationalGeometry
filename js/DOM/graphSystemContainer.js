function GraphSystemContainer(graph) {
	this.graphSystem = graph;


}

GraphSystemContainer.prototype.createUploadDiv = function () {
	var uploadDiv = document.createElement("input");
	uploadDiv.setAttribute('type', "file");
	uploadDiv.setAttribute('id', 'graphFile');
	uploadDiv.style.flex = "0";
	uploadDiv.style.height = "30%";
	uploadDiv.addEventListener("change", this.graphSystem.uploadDivListener);
	return uploadDiv;
}

GraphSystemContainer.prototype.createDownloadDiv = function () {
	var downloadDiv = document.createElement("div");
	downloadDiv.style.flex = "0";
	downloadDiv.style.textDecoration = "underline";
	downloadDiv.style.cursor = "pointer";
	downloadDiv.style.color = "blue";
	downloadDiv.appendChild(document.createTextNode("Download Graph Data"));
	downloadDiv.addEventListener(this.graph.downloadDivListener);
	return downloadDiv;
}

GraphSystemContainer.prototype.createResetDiv = function () {
	var resetDiv = document.createElement("div");
	resetDiv.style.flex = "0";
	resetDiv.style.textDecoration = "underline";
	resetDiv.style.cursor = "pointer";
	resetDiv.style.color = "blue";
	resetDiv.appendChild(document.createTextNode("reset"));
	resetDiv.addEventListener("click", () => { location.reload(); });
	return resetDiv;
}