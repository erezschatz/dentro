var childData;
var objID = 0;

var Outline = function () {
    this.id = objID++;
    this.isContainerOpen = false;
    return this;
}

$(document).ready(function(){
    loadFile();
});

var keypressaction = function(event, i) {
    if (event.keyCode == 13) {
        insertNode(i);
    } else if (event.keyCode == 9 ) {
        indentIn(i);
    } else if (event.keyCode == 46) {
        deleteNode(i);
    } else {
        childData[i].text = $('input[id=' + i + ']').attr('text');
    }
}

var loadFile = function () {
    Components.utils.import("resource://gre/modules/NetUtil.jsm");
    Components.utils.import("resource://gre/modules/FileUtils.jsm");

    var file = new FileUtils.File(
        "/home/erez/dev/projects/dentro/dentro.opml"
    );
    NetUtil.asyncFetch(file, function(inputStream, status) {
        if (!Components.isSuccessCode(status)) {
            return;
        }
        var stream = NetUtil.readInputStreamToString(
            inputStream,
            inputStream.available());

        parseOPML(stream);
        populateData(childData);
        $('input[id=outline0]').focus().select();
    });
}

/* not the cleanest code, and could use some heavy refactoring, but works.
iterates over 'childData' array, and sets ul,li tags according to
whether item has childs, is open, has next sibling etc. */

var populateData = function () {
    var output = '<ul>';
    for (var i = 0; i < childData.length; i++) {

        var cssClass = childData[i].isContainerOpen ?
            'open' : 'closed';

        output += '<li class="' + cssClass +
            '" onclick="toggleOpenState(' + i +  ')">' +
            '<input id="outline' + i + '" type="text" value="' +
            childData[i].text + '" onkeypress="keypressaction(event, ' +
            i + ');"></li>';

        // parents with visible children
        if (childData[i].isContainerOpen &&
            typeof childData[i].childs !== 'undefined' &&
           childData[i].childs.length > 0) {
            output += '<ul>';
        }

        if (childData[i].isContainerOpen &&
            (typeof childData[i].childs === 'undefined' ||
            childData[i].childs.length == 0) &&
            !hasNextSibling(i)) {
            var diff = getLevel(i) - getLevel(i + 1);
            for (var d = 0; d < diff; d++) {
                output += '</ul>';
            }
        }

        if (!childData[i].isContainerOpen &&
            typeof childData[i].parent !== 'undefined' &&
            ! hasNextSibling(i) ) {
            var diff = getLevel(i) - getLevel(i + 1);
            for (var d = 0; d < diff; d++) {
                output += '</ul>';
            }
        }
    }
    output += '</ul>';
    document.getElementById("mainTree").innerHTML = output;
}

var parseOPML = function (input) {
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(input, "text/xml");

    var nodesSnapshot = oDOM.evaluate(
        '/opml/body/outline', oDOM, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );

    childData=[];

    for ( var i = 0; i < nodesSnapshot.snapshotLength; i++ ) {
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

var toggleOpenState = function(idx) {
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
    populateData();
    $('input[id=outline' + idx + ']').focus().select();
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
    populateData();
    var next = idx + 1;
    $('input[id=outline' + next + ']').focus().select();
}

var deleteNode =  function (idx) {
     var toDelete = childData[idx];
    populateData();
}

var indentIn = function (idx) {
    var lastItem = childData[idx];
    if (getLevel(idx - 1) == getLevel(idx)) {
        var siblingIdx = idx - 1;
        if (! childData[siblingIdx].isContainerOpen) {
            toggleOpenState(siblingIdx);
            if (typeof childData[siblingIdx].childs !== 'undefined' &&
                childData[siblingIdx].childs.length > 0)
                idx += childData[siblingIdx].childs.length;
        }
        if (typeof lastItem.parent != 'undefined') {
            for (var i = 0; i < lastItem.parent.childs.length; i++ ) {
                if (lastItem.parent.childs[i].id == lastItem.id) {
                    lastItem.parent.childs.splice(i, 1);
                    break;
                }
            }
        }
        lastItem.parent = childData[siblingIdx];
        if (typeof childData[siblingIdx].childs == 'undefined')
            childData[siblingIdx].childs = [];
        childData[siblingIdx].childs.push(lastItem);
    }
    populateData();
}

var indentOut = function(idx) {
    populateData();
}
