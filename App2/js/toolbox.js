
//performs binary search for item's index in array using comparison as a function
(function (toolbox, $, undefined) {
	toolbox.binarySearch = function (item, array, start, end, comparison) {
		if (end - start == 1) {
			if (comparison(item, array[start]) > 0) return start + 1;
			else return start;
		}
		var mid = start + Math.floor((end - start) / 2)

		if (comparison(item, array[mid]) > 0) return toolbox.binarySearch(item, array, mid, end, comparison);
		else return toolbox.binarySearch(item, array, start, mid, comparison);
	}
}(window.toolbox = window.toolbox || {}, jQuery));

