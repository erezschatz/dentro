/*

Copyright 2012 Erez Schatz.

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
along with Dentro.  If not, see <http://www.gnu.org/licenses/>.

*/

"use strict";
var childData, file;
var objID = 0;
var dateCreated;
var isEdited = false;

var Outline = function () {
    this.id = objID++;
    this.isContainerOpen = false;
    this.childs = [];
    this.text = '';
    return this;
};

// to figure level, go until the root, incrementing in each step
var getLevel = function(idx) {
    var level = 0;
    var checked_element = childData[idx];

    while (checked_element !== undefined && checked_element != null &&
           checked_element.parent !== undefined) {
        level++;
        checked_element = checked_element.parent;
    }
    return level;
};

// currently generates OPML (standard not fully implemented)
var saveFile = function (toFile) {
    if (toFile !== undefined) {
        file = toFile;
    } else if (file === undefined) {
        return;
    }

    if (dateCreated === undefined ||
        dateCreated === null ||
        dateCreated === '') {
        dateCreated = new Date();
    }
    var output =
        '<?xml version="1.0" encoding="ISO-8859-1"?>\n' +
        '<opml version="2.0">\n' +
        '  <head>\n' +
        '  <title>dentro.opml</title>\n' +
        '    <dateCreated>' + dateCreated + '</dateCreated>\n' +
        '    <dateModified>' + new Date() + '</dateModified>\n' +
        '    <ownerName></ownerName>\n' +
        '    <ownerEmail></ownerEmail>\n' +
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
    isEdited = false;
    return 1;
};

var formatOPMLElement = function (node, level) {
    var space = '    ';
    for (var i = 0; i < level; i++) {
        space += '    ';
    }

    var output = space + '<outline text="' + node.text.
        replace(/"/g, '&quot;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;') + '"';
    if (node.childs !== undefined &&
        node.childs.length > 0) {
        output += '>\n';
        for (var c = 0; c < node.childs.length; c++) {
            output += formatOPMLElement(node.childs[c], level + 1);
            output += '    ' + space + '</outline>\n';
        }
    } else {
        output += '>\n';
    }

    return output;
};
// checks whether the text has overflowed under the textarea size
var adjustNodeHeight = function (elem) {
    if (elem.clientHeight < elem.scrollHeight) {
        $(elem).height(elem.scrollHeight + 1);
    }
}

/* iterates over 'childData' array, creates a bullet
   div and a textarea for each item, indented it according to level, creating
   the illusion of nested lists */

var populateData = function (idx) {
    var output = '';
    var winwidth = $(window).width();
    for (var i = 0; i < childData.length; i++) {
        var maxwidth =  winwidth - (30 + (getLevel(i) * 15));
        var cssClass = childData[i].isContainerOpen ?
           'open' : 'closed';
        var level = getLevel(i) * 15;

        output += '<div style="margin-left:' + level + 'px;">' +
            '<div class="' + cssClass +
            '" onclick="toggleOpenState(' + i + ');">&nbsp;</div>' +
            '<div id="container' + i +
            '" style="display:inline-block"><textarea id="outline' + i +
            '" onkeypress="keypressaction(event, ' + i +
            ');" onkeyup="assignContent(' + i +
            ');" style="width: ' + maxwidth + '">' +
            childData[i].text + '</textarea></div></div>';
    }

    document.getElementById("mainTree").innerHTML = output;

    for (var i = 0; i < childData.length; i++) {
        var elem = document.getElementById('outline' + i);
        adjustNodeHeight(elem);
    }
    if ($(window).width() < winwidth) {
        populateData(idx);
    } else {
        var elem = $('textarea[id=outline' + idx + ']');
        var elemLen = elem.text.length;
        elem.selectionStart = elemLen;
        elem.selectionEnd = elemLen;
        elem.focus();
    }
};

var assignContent = function(idx) {
    var elem = document.getElementById('outline' + idx);
    adjustNodeHeight(elem);
    childData[idx].text = $(elem).attr('value');
    isEdited = true;
};

var parseOPML = function (input) {
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(input, "text/xml");

    var datesnapshot = oDOM.evaluate(
        '/opml/head/dateCreated', oDOM, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null
        );

    dateCreated = datesnapshot.singleNodeValue.textContent;

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
    var item = childData[idx];
    var visible = childData.length;
    if (item.isContainerOpen) {
        item.isContainerOpen = false;

        var thisLevel = getLevel(idx);
        var deletecount = 0;

        for (var t = idx + 1; t < visible && getLevel(t) > thisLevel; t++) {
            deletecount++;
            if (childData[t].isContainerOpen) {
                toggleOpenState(t);
            }
        }
        if (deletecount) {
            childData.splice(idx + 1, deletecount);
        }
    }
    else {
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

var insertWithContent = function (idx) {
    var nodeText = childNode[idx].text;
    var newText = nodeText.substr(point, nodeText.length);
    childNode[idx].text = nodeText.substr(0, point)
    insertNode(idx, newText);
}

var insertNode = function(idx, nodeText) {
    var selectedItem = childData[idx];
    var newRow = new Outline();
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
    var currentItem = childData[idx];
    var toDelete =
        currentItem.isContainerOpen && currentItem.childs.length > 0 ?
        currentItem.childs.length + 1 :
        1;

    childData.splice(idx, toDelete);
    var currentParent = currentItem.parent;
    if (currentParent !== undefined) {
        var length = currentParent.childs.length;
        for (var i = 0; i <= length; i++) {
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
    var lastItem = childData[idx];
    var siblingIdx = -1;
    var i;

    if (idx === 0) return;

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
        toggleOpenState(siblingIdx);
    }
    if (childData[siblingIdx].childs === undefined) {
        childData[siblingIdx].childs = [];
    }
    childData[siblingIdx].childs.push(lastItem);
    populateData(idx);
};

var indentOut = function(idx) {
    var currentItem = childData[idx];
    var currentParent = currentItem.parent;
    if (currentParent === undefined) {
        return;
    }

    var length = currentParent.childs.length;
    for (var i = 0; i < length; i++) {
        if (currentParent.childs[i].id === currentItem.id) {
            currentParent.childs.splice(i, 1);
            length -=  i + 1;
            break;
        }
    }
    if (currentParent.parent === undefined) {
        currentItem.parent = undefined;
    } else {
        for (i = 0; i < childData.length; i++) {
            if (childData[i].id === currentParent.parent.id) {
                currentItem.parent = childData[i];
                childData[i].childs.push(currentItem);
            }
        }
    }
    childData.splice(idx, 1);
    childData.splice(idx + length, 0, currentItem);

    populateData(idx);
};

var expandAll = function() {
}

var collapseAll = function() {
    for (var i = 0; i < childData.length; i++) {
        if (childData[i].isContainerOpen) {
            toggleOpenState(i);
        }
    }
}

var keypressaction = function(event, idx) {
    assignContent(idx);
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
        var newfocus = idx + 1;
        $('textarea[id=outline' + newfocus + ']').focus().select();
    } else if (event.keyCode === 38) { //up arrow
        var newfocus = idx - 1;
        $('textarea[id=outline' + newfocus + ']').focus().select();
    } else if (event.keyCode === 's' && event.ctrlKey) {
        if (event.shiftKey) {
            //saveFileAs
        } else {
            saveFile();
        }
    } else {
        assignContent(idx);
    }
};

var newFile = function () {
    childData = [new Outline()];
    populateData(0);
    isEdited = false;
};

var loadFile = function (chosenFile) {
    Components.utils.import("resource://gre/modules/NetUtil.jsm");

    NetUtil.asyncFetch(chosenFile, function(inputStream, status) {
        if (!Components.isSuccessCode(status)) {
            return;
        }
        var stream = NetUtil.readInputStreamToString(
            inputStream,
            inputStream.available());

        parseOPML(stream);
        populateData(0);
    });
    file = chosenFile;
    isEdited = false;
};
