
/* iterates over 'childData' array, creates a bullet
   div and a element for each item, indented it according to level, creating
   the illusion of nested lists */

var populateData = function (idx) {
	var output = '',
	winwidth = $(window).width(),
	i = 0,
	elem;

	for (i = 0; i < childData.length; i++) {
		var maxwidth =  winwidth - (30 + (getLevel(i) * 15));
		var cssClass = childData[i].isContainerOpen ?
		   'open' : 'closed';
		var level = getLevel(i) * 15;

		output += '<div style="height: 20px; direction:' + direction +
			';margin-left:' + level + 'px;">' +
			'<div class="' + cssClass +
			'" draggable="true" onmouseup="toggleOpenState(' + i + ');">&nbsp;</div>' +
			'<span contenteditable="true" style="display:inline-block" id="outline' + i +
			'" onkeypress="keypressaction(event, ' + i +
			');" onblur="assignContent(' + i +
			');" style="width: ' + maxwidth + 'px;">' +
			childData[i].text + '</span></div>';
	}

	document.getElementById("mainTree").innerHTML = output;

	for (i = 0; i < childData.length; i++) {
		elem = document.getElementById('outline' + i);
		adjustNodeHeight(elem);
	}
	if ($(window).width() != winwidth) {
		populateData(idx);
	} else {
		elem = $('span[id=outline' + idx + ']');
		var elemLen = elem.text.length;
		elem.selectionStart = elemLen;
		elem.selectionEnd = elemLen;
		elem.focus();
	}
};
