/*

Copyright 2012-2013 Erez Schatz.

This file is part of Dentro.

Dentro is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

Dentro is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Dentro. If not, see <http://www.gnu.org/licenses/>.

*/

"use strict";

var childData,
file,
objID = 0,
dateCreated,
isEdited = false,
direction = 'ltr';

var togglePageDirection = function () {
	direction = direction.split("").reverse().join("");
	populateData();
};

var Outline = function () {
	this.id = objID++;
	this.isContainerOpen = false;
	this.childs = [];
	this.text = '';
	return this;
};

var postToWordpress = function () {
	var name, password, server;

	var blog_id;

	if (no_blog) {
		var request = new XmlRpcRequest(
			server, "wp.getUsersBlogs", name, password
		);
		var response = request.send();
		blog_id = response;
	}

	var request = new XmlRpcRequest(
		server, "wp.newPost", blog_id, name, password
	);

	request.addParam( 
		post_type,
		post_status,
		post_title,
		post_author,
		post_excerpt,
		post_content,
		post_date_gmt,
		post_format,
		post_name,
		post_password,
		comment_status,
		ping_status,
		sticky,
		post_thumbnail,
		post_parent,
		custom_fields
	);
	var response = request.send();
};

// to figure level, go until the root, incrementing in each step
var getLevel = function(idx) {
	var level = 0,
	checked_element = childData[idx];

	while (checked_element !== undefined && checked_element != null &&
		   checked_element.parent !== undefined) {
		level++;
		checked_element = checked_element.parent;
	}
	return level;
};

// use this for creating trees and graphics that need to know
// the total amount of items in the structure

var totalNodes = function(array) {
	var iterator = array.childs ? array.childs : array;
	var total = iterator.length;

	for (var i = 0; i < iterator.length; i++) {
		total += totalNodes(iterator[i]);
	}
	return total;
};

// checks whether the text has overflowed under the element size
var adjustNodeHeight = function (elem) {
	if (elem.clientHeight < elem.scrollHeight) {
		$(elem).height(elem.scrollHeight + 1);
	}
};

var assignContent = function(idx) {
	var elem = ('span[id=outline' + idx + ']');
	if (childData[idx].text !== $(elem).val()) {
		adjustNodeHeight(elem);
		childData[idx].text = $(elem).val();
		isEdited = true;
	}
};

var generateChildNode = function(parentNode, childNode) {
	var child = new Outline();

	child.parent = parentNode;
	child.text = $(childNode).attr("text");

	$(childNode).children().each(function() {
		child.childs.push(generateChildNode(child, this));
	});

	return child;
};

// tree manipulation is done on the childData array,
// then the app regenerates the tree html
var toggleOpenState = function(idx) {
	assignContent(idx);

	var item = childData[idx],
	visible = childData.length;

	if (item.isContainerOpen) {
		item.isContainerOpen = false;

		var thisLevel = getLevel(idx),
		deletecount = 0;

		for (var t = idx + 1; t < visible && getLevel(t) > thisLevel; t++) {
			deletecount++;
			if (childData[t].isContainerOpen) {
				toggleOpenState(t);
			}
		}
		if (deletecount) {
			childData.splice(idx + 1, deletecount);
		}
	} else {
		if (item.childs.length === 0) {
			return;
		}
		item.isContainerOpen = true;

		var toinsert = item.childs;
		var length = toinsert ? toinsert.length : 0;

		for (var i = 0; i < length; i++) {
			childData.splice(idx + i + 1, 0, toinsert[i]);
		}
	}
	populateData(idx);
};

// deletes the text from the cursor to the end of the node
// creates a sibling node with the deleted text

var insertWithContent = function (idx) {
	var point = document.getElementById('outline' + idx).selectionStart,
	nodeText = childData[idx].text,
	newText = nodeText.substring(point, nodeText.length);

	childData[idx].text = nodeText.substring(0, point);
	insertNode(idx, newText);
};

var insertNode = function(idx, nodeText) {
	var selectedItem = childData[idx],
	newRow = new Outline();

	newRow.text = nodeText === undefined ? '' : nodeText;

	if (selectedItem.parent !== undefined) {
		newRow.parent = selectedItem.parent;
		selectedItem.parent.childs.push(newRow);
	}
	if (selectedItem.isContainerOpen &&
		selectedItem.childs !== undefined &&
		selectedItem.childs.length > 0) {
		idx += selectedItem.childs.length;
	}
	//move selection to new row
	childData.splice(idx + 1, 0, newRow);
	populateData(idx + 1);
};

var deleteNode = function (idx) {
	if (childData.length == 1) {
		newFile(true);
		return;
	}

	var currentItem = childData[idx];
	var currentLevel = getLevel(idx);
		var i;
	for (i = idx; i < childData.length; i++) {
		if (getLevel(i) - currentLevel ==  1) { //child
			indentOut(i);
		}
	}

	childData.splice(idx, 1);
	var currentParent = currentItem.parent;
	if (currentParent !== undefined) {
		var length = currentParent.childs.length;
		for (i = 0; i <= length; i++) {
			if (currentParent.childs[i] !== undefined &&
				currentParent.childs[i].id === currentItem.id) {
				currentParent.childs.splice(i, 1);
				break;
			}
		}
	}

	populateData(idx);
};

// if element before selected is the same level, indent under
// if not, indent under element's parent
var indentIn = function (idx) {
	var lastItem = childData[idx],
	siblingIdx = -1,
	i;

	if (idx == 0) return;

	if (getLevel(idx - 1) === getLevel(idx)) {
		siblingIdx = idx - 1;
	} else if (lastItem.parent === undefined ||
			   childData[idx - 1].id !== lastItem.parent.id) {
		for (i = idx - 1; i >= 0; i--) {
			// find element's parent
			if (childData[i].id === childData[idx - 1].parent.id) {
				siblingIdx = i;
				break;
			}
		}
	} else {
		return;
	}

	if (lastItem.parent !== undefined) {
		var siblings = lastItem.parent.childs;
		for (i = 0; i < siblings.length; i++) {
			if (siblings[i].id === lastItem.id) {
				siblings.splice(i, 1);
			}
		}
	}

	lastItem.parent = childData[siblingIdx];
	if (! childData[siblingIdx].isContainerOpen) {
		childData[siblingIdx].isContainerOpen = true;
	}
	if (childData[siblingIdx].childs === undefined) {
		childData[siblingIdx].childs = [];
	}
	childData[siblingIdx].childs.push(lastItem);
	isEdited = true;
	populateData(idx);
};

// shift+tab

var indentOut = function(idx) {
	var currentItem = childData[idx],
		currentParent = currentItem.parent,
   		i = 0,
		length = 0;

	childData.splice(idx, 1);
	if (currentItem.isContainerOpen && currentItem.childs) {
		length = currentItem.childs.length;
		for (i = 0; i < length; i++) {
			childData.splice(idx, 1);
		}
		// idx is now currentItem sibling!
	}

	if (currentParent === undefined) {
		// current item is a root item
		return;
	} else if (currentParent.parent !== undefined) {
		// set item parent as parent's parent and add to its childs
		currentItem.parent = currentParent.parent;
		currentParent.parent.childs.splice(
			currentParent.childs.length - 1, 0, currentItem
		);
	} else { // current parent is root item
		currentItem.parent = undefined;
	}

	// set idx to old parent + childs (+ any child's childs if open)
	idx = countAllOpenedChilds(currentParent) + 1;

	childData.splice(idx, 0, currentItem);
	if (currentItem.isContainerOpen && currentItem.childs) {
		length = currentItem.childs.length;
		for (i = 0; i < length; i++) {
			childData.splice(idx + i + 1, 0, currentItem.childs[i]);
		}
	}

	isEdited = true;
	populateData(idx);
};

var countAllOpenedChilds = function (baseNode) {
	var length = 0,
		currentIdx = 0;

	for (var i = 0; i < childData.length; i++) {

		if (currentIdx > 0) {
			if (getLevel(i) > getLevel(currentIdx)) {
				length++;
			} else if (getLevel(i) <= getLevel(currentIdx)) {
				return length + currentIdx;
			}
		}
		if (childData[i].id == baseNode.id) {
			currentIdx = i;
		} 
	}
	return length + currentIdx;
};

// What I need is to add all the nodes and subnodes,
// in order to an array, and replace childData with that array.
var expandAll = function() {
	var tempArray = aggregateAllNodes(childData);
	childData = tempArray;
	populateData(0);
};

var aggregateAllNodes = function(array) {
	var tempArray = [];
	for (var i = 0; i < array.length; i++) {
		array[i].isContainerOpen = true;
		tempArray.push(array[i]);

		if (array[i].childs !== undefined && array[i].childs !== null &&
			array[i].childs.length !== 0) {

			var childNodes = aggregateAllNodes(array[i].childs);
			for (var j = 0; j < childNodes.length; j++) {
				tempArray.push(childNodes[j]);
			}
		}
	}
	return tempArray;
};

var collapseAll = function() {
	for (var i = 0; i < childData.length; i++) {
		if (childData[i].isContainerOpen) {
			toggleOpenState(i);
		}
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

var newFile = function (edit_status) {
	childData = [new Outline()];
	populateData(0);
	isEdited = edit_status;
};

var loadFile = function (chosenFile) {
	Components.utils.import("resource://gre/modules/NetUtil.jsm");
	NetUtil.asyncFetch(chosenFile, function(inputStream, status) {
		if (!Components.isSuccessCode(status)) {
			return;
		}

		var stream = NetUtil.readInputStreamToString(
			inputStream,
			inputStream.available()
		);

		parseOPML(stream);
		populateData(0);
	});
	file = chosenFile;
	isEdited = false;
};
