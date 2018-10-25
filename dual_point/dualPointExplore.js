window.onload = function () {
    var container = new DualGraphContainer("Duality");
    var view = new DualGraph({}, container.graphDiv);
    container.buttonCol.remove();
}
