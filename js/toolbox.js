
//performs binary search for item's index in array using comparison as a function, 
//will return the index of the first element in the array that is as big as item
(function (Toolbox, $, undefined) {
	Toolbox.binarySearch = function (item, array, start, end, comparison) {
		if (end - start == 1) {
			if (comparison(item, array[start]) > 0) return start + 1;
			else return start;
		}
		if (end - start == 0) return 0;
		var mid = start + Math.floor((end - start) / 2);

		diff = comparison(item, array[mid]);
		if ( diff > 0) return Toolbox.binarySearch(item, array, mid, end, comparison);
		else return Toolbox.binarySearch(item, array, start, mid, comparison);
	} 

	Toolbox.shuffle = function (array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		while (0 !== currentIndex) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	};

	var m_w = 123456789;
	var m_z = 987654321;
	var mask = 0xffffffff;

	// Takes any integer
	Toolbox.seed = function (i) {
		m_w = i;
		m_z = 987654321;
	};

	// Returns number between 0 (inclusive) and 1.0 (exclusive),
	// just like Math.random().
	Toolbox.random = function() {
		m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
		m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
		var result = ((m_z << 16) + m_w) & mask;
		result /= 4294967296;
		return result + 0.5;
	}

	Toolbox.objectToJsonFile = function (exportObj, exportName) {
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", exportName + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	};

}(window.Toolbox = window.Toolbox || {}, jQuery));

