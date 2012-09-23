var childData;
var objID = 0;
var file;

var Outline = function () {
    this.id = objID++;
    this.isContainerOpen = false;
    return this;
}

//$(document).ready(function(){});

var keypressaction = function(event, i) {
    assignContent(i);
    if (event.keyCode == 13) { //enter
        if (event.altKey) {
            toggleOpenState(i);
        } else if (event.ctrlKey) {
            //insert comment
        } else {
            insertNode(i);
        }
    } else if (event.keyCode == 9 ) { //tab
        if (event.shiftKey) {
            indentOut(i);
        }
        else {
            indentIn(i);
        }
    } else if (event.keyCode == 46) { //delete
        if (event.ctrlKey)
            deleteNode(i);
    } else if (event.keyCode == 40) { //down arrow
        var newfocus = i + 1;
        $('input[id=outline' + newfocus + ']').focus().select();
    } else if (event.keyCode == 38) { //up arrow
        var newfocus = i - 1;
        $('input[id=outline' + newfocus + ']').focus().select();
    } else {
        assignContent(i);
    }
}

var loadFile = function (chosenFile) {
    Components.utils.import("resource://gre/modules/NetUtil.jsm");
    if (typeof chosenFile === 'undefined') {
        Components.utils.import("resource://gre/modules/FileUtils.jsm");

        file = new FileUtils.File(
            "/home/erez/dev/projects/dentro/dentro.opml"
        );
    } else {
        file = chosenFile;
    }
    NetUtil.asyncFetch(file, function(inputStream, status) {
        if (!Components.isSuccessCode(status)) {
            return;
        }
        var stream = NetUtil.readInputStreamToString(
            inputStream,
            inputStream.available());

        parseOPML(stream);
        populateData(0);
    });
}

// currently generates OPML (standard not fully implemented)

var saveFile = function(toFile) {
    var output = '<?xml version="1.0" encoding="ISO-8859-1"?>\n' +
        '<opml version="2.0">\n' +
        '  <head>\n' +
        '  <title>dentro.opml</title>\n' +
        '    <dateCreated>' + new Date() + '</dateCreated>\n'+
        '    <dateModified>' + new Date() + '</dateModified>\n' +
        '    <ownerName></ownerName>\n' +
        '    <ownerEmail></ownerEmail>\n' +
        '  </head>\n' +
        '  <body>\n';
    for (var i = 0; i < childData.length; i++) {
        //just top level nodes and recourse from there
        if (typeof childData[i].parent === 'undefined') {
            output += formatOPMLElement(childData[i], getLevel(i));
            output += '</outline>\n';
        }
    }
    output += '</body></opml>';

    var foStream =
        Components.classes[
            "@mozilla.org/network/file-output-stream;1"
        ].createInstance(Components.interfaces.nsIFileOutputStream);

    if (typeof toFile !== 'undefined') {
        file = toFile;
    }

    foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
    var converter = Components.classes[
        "@mozilla.org/intl/converter-output-stream;1"
    ].createInstance(Components.interfaces.nsIConverterOutputStream);
    converter.init(foStream, "ISO-8859-1", 0, 0);
    converter.writeString(output);
    converter.close();
}

var formatOPMLElement = function (node, level) {
    var space = '    ';
    for (var i = 0; i < level; i++)
        space += '    ';
    var output = space + '<outline text="' + node.text + '"';
    if (typeof node.childs !== 'undefined' &&
        node.childs.length > 0) {
        output += '>\n';
        for (var c = 0; c < node.childs.length; c++) {
            output += formatOPMLElement(node.childs[c], level + 1);
            output += space + '</outline>\n';
        }
    } else {
        output += '>\n';
    }

    return output;
}
/* iterates over 'childData' array, creates a bullet
   div and an input box for each item, indented it according to level, creating
   the illusion of nested lists */

var populateData = function (idx) {
    var output = '';
    for (var i = 0; i < childData.length; i++) {

        var cssClass = childData[i].isContainerOpen ?
            'open' : 'closed';
        var level = getLevel(i) * 15;
        output += '<div style="margin-left:' + level + 'px">' +
            '<div class="' + cssClass + '" onclick="toggleOpenState(' + i + ');">&nbsp;</div>'+
            '<input id="outline' + i + '" type="text" value="' +
            childData[i].text + '" onkeypress="keypressaction(event, ' +
            i + ');" onkeyup="assignContent(' + i + ');" style="width:' + childData[i].text.length + '0px;"></div>';
    }
//    alert(output);
    document.getElementById("mainTree").innerHTML = output;
    $('input[id=outline' + idx + ']').focus().select();
}

var assignContent = function(idx) {
    childData[idx].text = $('input[id=outline' + idx + ']').attr('value');
}

var parseOPML = function (input) {
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(input, "text/xml");

    var nodesSnapshot = oDOM.evaluate(
        '/opml/body/outline', oDOM, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );

    //initialise the main array;

    childData = [];

    for (var i = 0; i < nodesSnapshot.snapshotLength; i++) {
        var node = $(nodesSnapshot.snapshotItem(i));
        var outline = new Outline();
        outline.text = node.attr("text");
        outline.childs = [];
        node.children().each(function() {
            outline.childs.push(generateChildNode(outline, this));
        });
        childData.push(outline);
    }
}

var generateChildNode = function(parentNode, childNode) {
    var child = new Outline();
    child.parent = parentNode;
    child.text = $(childNode).attr("text");
    child.childs = [];
    $(childNode).children().each(function() {
        child.childs.push(generateChildNode(child, this));
    });
    return child;
}

// to figure level, go until the root, incrementing in each step
var getLevel = function(idx) {
    var level = 0;
    var checked_element = childData[idx];
    while (typeof checked_element !== 'undefined' &&
           typeof checked_element.parent !== 'undefined') {
        level++;
        checked_element = checked_element.parent;
    }
    return level;
};

// basically checks the next item in the tree
// and sees if its the level
var hasNextSibling =  function(idx) {
    return getLevel(idx + 1) == getLevel(idx);
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

        for (var t = idx + 1; t < visible &&
             getLevel(t) > thisLevel; t++) {
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
        item.isContainerOpen = true;

        var toinsert = childData[idx].childs;
        var length = toinsert ? toinsert.length : 0;
        for (var i = 0; i < length; i++) {
            childData.splice(idx + i + 1, 0, toinsert[i]);
        }
    }
    populateData(idx);
}

var insertNode =  function(idx) {
    var selectedItem = childData[idx];
    var newRow = new Outline();
    newRow.text = '';

    if (typeof selectedItem.parent !== 'undefined') {
        newRow.parent = selectedItem.parent;
        selectedItem.parent.childs.push(newRow);
    }
    if (selectedItem.isContainerOpen &&
        typeof selectedItem.childs !== 'undefined' &&
        selectedItem.childs.length > 0) {
        idx += selectedItem.childs.length;
    }
    //move selection to new row
    childData.splice(idx + 1, 0, newRow);
    populateData(idx + 1);
}

var deleteNode = function (idx) {
    var currentItem = childData[idx];
    var toDelete = currentItem.isContainerOpen &&
        currentItem.childs.length > 0 ?
        currentItem.childs.length + 1: 1;

    childData.splice(idx, toDelete);
    var currentParent = currentItem.parent;
    if (typeof currentParent !== 'undefined') {
        var length = currentParent.childs.length;
        for (var i = 0; i < length; i++) {
            if (currentParent.childs[i].id === currentItem.id) {
                currentParent.childs.splice(i, 1);
                break;
            }
        }
    }

    populateData(idx);
}

// if element before selected is the same level, indent under
// if not, indent under element's parent
var indentIn = function (idx) {
    var lastItem = childData[idx];
    var siblingIdx = -1;
    if (getLevel(idx - 1) == getLevel(idx)) {
         siblingIdx = idx - 1;
    } else if (childData[idx - 1] !== lastItem.parent) {
        for (var i = idx - 1; i >= 0; i--) {
            // find element's parent
            if (childData[i] === childData[idx - 1].parent) {
                siblingIdx = i;
                break;
            }
        }
    }
    if (siblingIdx > -1) {
        lastItem.parent = childData[siblingIdx];
        if (! childData[siblingIdx].isContainerOpen) {
            toggleOpenState(siblingIdx);
        }
        if (typeof childData[siblingIdx].childs === 'undefined')
            childData[siblingIdx].childs = [];
        childData[siblingIdx].childs.push(lastItem);
        populateData(idx);
    }
}

var indentOut = function(idx) {
    var currentItem = childData[idx];
    var currentParent = currentItem.parent;
    if (typeof currentParent === 'undefined' )
        return;

    var length = currentParent.childs.length;
    for (var i = 0; i < length; i++) {
        if (currentParent.childs[i].id === currentItem.id) {
            currentParent.childs.splice(i, 1);
            length -=  i + 1;
            break;
        }
    }
    currentItem.parent = currentParent.parent;
    childData.splice(idx, 1);
    childData.splice(idx + length, 0, currentItem);

    populateData(idx);
}
