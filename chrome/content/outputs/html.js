
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

//keyboard actions

var keypressaction = function(event, idx) {
	var newfocus;
	if (event.keyCode === 13) { //enter
		if (event.altKey) {
			toggleOpenState(idx);
		} else if (event.ctrlKey) {
			//insert comment
		} else if (event.shiftKey) {
			insertWithContent(idx);
		} else {
			insertNode(idx);
		}
	} else if (event.keyCode === 9) { //tab
		if (event.shiftKey) {
			indentOut(idx);
		} else {
			indentIn(idx);
		}
	} else if (event.keyCode === 46 && event.ctrlKey) { //delete
		deleteNode(idx);
	} else if (event.keyCode === 40) { //down arrow
		newfocus = idx + 1;
		$('span[id=outline' + newfocus + ']').focus().select();
	} else if (event.keyCode === 38) { //up arrow
		newfocus = idx - 1;
		$('span[id=outline' + newfocus + ']').focus().select();
	} else if (event.charCode === 115 && event.ctrlKey) { //ctrl+s
		if (event.shiftKey) {
		//currently doesn't work
			document.getElementById("mainTree").saveOPMLFileAs();
		} else {
			saveFile();
		}
	} else {
		assignContent(idx);
	}
};
