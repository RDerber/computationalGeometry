window.onload = function () {
    var container = new GraphContainer("Duality");
    var view = new DualGraph({}, container.graphDiv);
    container.buttonCol.remove();
}
