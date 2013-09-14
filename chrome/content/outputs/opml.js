// currently generates OPML (standard not fully implemented)
var saveFile = function (toFile) {
	if (toFile !== undefined) {
		file = toFile;
	} else if (file === undefined) {
		return false;
	}

	if (dateCreated === undefined ||
		dateCreated === null ||
		dateCreated === '') {
		dateCreated = new Date();
	}
	var output =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<opml version="2.0">\n' +
		'  <head>\n' +
		'  <title>dentro.opml</title>\n' +
		'	<dateCreated>' + dateCreated + '</dateCreated>\n' +
		'	<dateModified>' + new Date() + '</dateModified>\n' +
		'	<ownerName></ownerName>\n' +
		'	<ownerEmail></ownerEmail>\n' +
		'  </head>\n' +
		'  <body>\n';

	for (var i = 0; i < childData.length; i++) {
		//just top level nodes and recourse from there
		if (childData[i].parent === undefined) {
			output += formatOPMLElement(childData[i], getLevel(i));
			output += '</outline>\n';
		}
	}
	output += '</body></opml>';

	var foStream =
		Components.classes[
			"@mozilla.org/network/file-output-stream;1"
		].createInstance(Components.interfaces.nsIFileOutputStream);

	foStream.init(file, 0x02 | 0x08 | 0x20, -1, 0);
	var converter = Components.classes[
		"@mozilla.org/intl/converter-output-stream;1"
	].createInstance(Components.interfaces.nsIConverterOutputStream);
	converter.init(foStream, "ISO-8859-1", 0, 0);
	converter.writeString(output);
	converter.close();
	//saveContent();
	return true;
};

var formatOPMLElement = function (node, level) {
	var space = '	', 
		i;

	for (i = 0; i < level; i++) {
		space += '	';
	}

	var output = space + '<outline text="' + node.text.
		replace(/"/g, '&quot;').
		replace(/</g, '&lt;').
		replace(/&/g, '&amp;').
		replace(/>/g, '&gt;') + '"';

	if (node.childs !== undefined &&
		node.childs.length > 0) {
		output += '>\n';
		for (i = 0; i < node.childs.length; i++) {
			output += formatOPMLElement(node.childs[i], level + 1);
			output += '	' + space + '</outline>\n';
		}
	} else {
		output += '>\n';
	}

	return output;
};

var parseOPML = function (input) {
	var oParser = new DOMParser();
	var oDOM = oParser.parseFromString(input, "text/xml");

	var snapshot = oDOM.evaluate(
		'/opml/head/dateCreated', oDOM, null,
		XPathResult.FIRST_ORDERED_NODE_TYPE, null
	);

	dateCreated = snapshot.singleNodeValue.textContent;

	var nodesSnapshot = oDOM.evaluate(
		'/opml/body/outline', oDOM, null,
		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
	);

	//initialise the main array;
	childData = [];

	for (var i = 0; i < nodesSnapshot.snapshotLength; i++) {
		var node = $(nodesSnapshot.snapshotItem(i));
		var outline = new Outline();
		outline.text = node.attr("text");

		node.children().each(function() {
			outline.childs.push(generateChildNode(outline, this));
		});

		childData.push(outline);
	}
};
