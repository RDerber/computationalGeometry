
//performs binary search for item's index in array using comparison as a function, 
//will return the index of the first element in the array that is as big as item
(function (toolbox, $, undefined) {
	toolbox.binarySearch = function (item, array, start, end, comparison) {
		if (end - start == 1) {
			if (comparison(item, array[start]) > 0) return start + 1;
			else return start;
		}
		if (end - start == 0) return 0;
		var mid = start + Math.floor((end - start) / 2)

		diff = comparison(item, array[mid])
		if ( diff > 0) return toolbox.binarySearch(item, array, mid, end, comparison);
		else return toolbox.binarySearch(item, array, start, mid, comparison);
	}

	toolbox.combineDefaultObject = function (attr, defaultAttrs) {
		for (var attrname in attr) { defaultAttrs[attrname] = attr[attrname] };

	}
}(window.toolbox = window.toolbox || {}, jQuery));

