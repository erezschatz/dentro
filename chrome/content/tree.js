
var objID = 0;

var Outline = function () {
    this.id = objID++;
    this.isContainerOpen = false;
    return this;
}

$(document).ready(function(){
    loadFile();

    $('input[type=textbox]').keypress(function(event) {
        if (event.keyCode == 13) {
            insertNode();
        } else if (event.keyCode == 9 ) {
            indentIn();
        } else if (event.keyCode == 46) {
            deleteNode();
        }
    });
});

//hard coded test data

var solids = new Outline();
var liquids = new Outline();
var gases = new Outline();

solids.text = 'Solids';
liquids.text = 'Liquids';
gases.text = 'Gases';

var silver = new Outline();
var gold = new Outline();
var lead = new Outline();
var mercury = new Outline();
var helium = new Outline();
var nitrogen = new Outline();
var white = new Outline();
var red = new Outline();

silver.text = 'Silver';
gold.text = 'Gold';
lead.text = 'Lead';
mercury.text = 'Mercury';
helium.text = 'Helium';
nitrogen.text = 'Nitrogen';
red.text = 'Red';
white.text = 'White';

solids.childs = [ silver, gold, lead ];
silver.parent = gold.parent = lead.parent = solids;
liquids.childs = [ mercury ];
mercury.parent = liquids;
gases.childs = [ helium, nitrogen ];
helium.parent = nitrogen.parent = gases;
gold.childs = [ white, red ];
white.parent = red.parent = gold;

var childData = [ solids, liquids, gases ];
//end of hard coded test data

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

var populateData = function () {
    var output = '<ul>';
    for (var i = 0; i < childData.length; i++) {

        var cssClass = childData[i].isContainerOpen ?
            'open' : 'closed';

        output += '<li class="' + cssClass +
            '" onclick="toggleOpenState(' + i +  ')">' +
            '<input id="outline' + i + '" type="text" value="' +
            childData[i].text + '"></li>';

        if (childData[i].isContainerOpen &&
            typeof childData[i].childs !== 'undefined')
            output += '<ul>';

        if (childData[i].isContainerOpen &&
            typeof childData[i].childs === 'undefined' &&
            !hasNextSibling(i))
            output += '</ul>';

        if (!childData[i].isContainerOpen &&
            typeof childData[i].parent !== 'undefined' &&
            ! hasNextSibling(i) )
            output += '</ul>';
    }
    output += '</ul>';
    document.getElementById("mainTree").innerHTML = output;
//    $('div[id=mainTree]').attr('innerHTML', output);
}

var parseOPML = function (input) {
    var oParser = new DOMParser();
    var oDOM = oParser.parseFromString(input, "text/xml");
    var iterator = oDOM.evaluate('//outline', oDOM, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );

    try {
        var thisNode;
        while (thisNode = iterator.iterateNext()) {
            alert(thisNode);
        }
    }
    catch (e) {
        dump(e);
    }
}

var getCellText = function(idx) {
    return typeof childData[idx].text != 'undefined' ?
        childData[idx].text :
        '';
}

var getParentIndex = function(idx) {
    var parent = childData[idx].parent;

    for (var i = idx; i >= 0; i--) {
        if (childData[i] === parent)
            return i;
    }
    return 0;
}

// to figure level, go until the root, incrementing in each step
var getLevel = function(idx) {
    var level = 0;
    var checked_element = childData[idx];
    while (typeof checked_element != 'undefined' &&
           typeof checked_element.parent != 'undefined') {
        level++;
        checked_element = checked_element.parent;
    }
    return level;
};

// basically checks the next item in the tree
// and sees if its the level
var hasNextSibling =  function(idx) {
    var thisLevel = getLevel(idx);
    return getLevel(idx + 1) == thisLevel;
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

var insertNode =  function() {
    var idx = getSelectedIndex();
    if (idx == -1) return;
    var selectedItem = childData[idx];
    var newRow = new outline();

    if (selectedItem.parent) {
        newRow.parent = selectedItem.parent;
        selectedItem.parent.childs.push(newRow);
    } else {
        data.push(newRow);
    }
    if (selectedItem.isContainerOpen &&
        typeof selectedItem.childs != 'undefined') {
        idx += selectedItem.childs.length;
    }
    //move selection to new row
    childData.splice(idx + 1, 0, newRow);
    populateData();
}

var deleteNode =  function () {
    var selectedIdx = getSelectedIndex();
    if (selectedIdx == -1) return;
    var toDelete = childData[selectedIdx];
    populateData();
}

var indentIn = function () {
    var last = getSelectedIndex();
    if (last == -1) return;
    var lastItem = childData[last];
    if (getLevel(last - 1) == getLevel(last)) {
        var siblingIdx = last - 1;
        if (! childData[siblingIdx].isContainerOpen) {
            toggleOpenState(siblingIdx);
            if (typeof childData[siblingIdx].childs != 'undefined')
                last += childData[siblingIdx].childs.length;
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

var indentOut = function() {
    var selectedIdx = getSelectedIndex();
    if (selectedIdx == -1) return;
    var toDelete = childData[selectedIdx];
    populateData();
}

var setCellText = function(row, value) {
    childData[row].text = value;
}
