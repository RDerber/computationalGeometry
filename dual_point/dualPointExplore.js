window.onload = function () {
    var container = new GraphContainer("Duality");
    var view = new DualGraph({}, container.graphDiv);
    //container.buttonCol.remove();
    var buttonContainer = container.buttonContainer;
	var tutorial = document.createElement('div');
    tutorial.id = "tutorial";
    tutorial.classList.add("tutorial");
    var text1 = document.createElement('div');
    text1.classList.add('subtutorial');
    text1.appendChild(document.createTextNode('* Click the left plane or right plane to add point'));
    tutorial.appendChild(text1);
	buttonContainer.appendChild(tutorial);

}
