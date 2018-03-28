window.onload = function () {
	var domEl = document.createElement('div');
	$(document.body).append($(domEl));
	var view = new DualGraph({}, domEl);
}
