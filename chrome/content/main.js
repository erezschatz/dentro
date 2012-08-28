"use strict";

var objID = 0;

function init() {
    document.getElementById("elementList").view = treeView;
}

function doKeyAction(event) {

    if (event.keyCode == 13) {
        treeView.insertNode();
    } else if (event.keyCode == 9 ) {
        treeView.indentIn();
    } else if (event.keyCode == 46) {
        treeView.deleteNode();
    } else if (event.keyCode == 112) {
        //launch venkman
    }
}

function Outline() {
    this.id = objID++;
    this.isContainerOpen = false;
    return this;
}

//hard coded test data

var data;

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
gases.childs = [ helium, nitrogen];
helium.parent = nitrogen.parent = gases;
gold.childs = [ white, red ];
white.parent = red.parent = gold;

data = [ solids, liquids, gases ];
//end of hard coded test data

var treeView = {
    childData : data,
    treeBox: null,
    selection: null,
    get rowCount() { return this.childData.length; },
    setTree: function(treeBox) { this.treeBox = treeBox; },
    getCellText: function(idx, column) {
        return typeof this.childData[idx].text != 'undefined' ?
            this.childData[idx].text :
            '';
    },
    isContainer: function(idx) { return true; },
    isContainerOpen: function(idx) {
        return this.childData[idx].isContainerOpen;
    },
    isContainerEmpty: function(idx)    { return false; },
    isSeparator: function(idx)         { return false; },
    isSorted: function()               { return false; },
    isEditable: function(idx, column)  { return true; },

    getParentIndex: function(idx) {
        var parent = this.childData[idx].parent;

        for (var i = idx; i >= 0; i--) {
            if (this.childData[i] === parent)
                return i;
        }
        return 0;
    },

    // to figure level, go until the root, incrementing in each step
    getLevel: function(idx) {
        var level = 0;
        var checked_element = this.childData[idx];
        while (typeof checked_element != 'undefined' &&
               typeof checked_element.parent != 'undefined') {
            level++;
            checked_element = checked_element.parent;
        }
        return level;
    },

    // basically checks the next item in the tree
    // and sees if its the level
    hasNextSibling: function(idx, after) {
        var thisLevel = this.getLevel(idx);
        return this.getLevel(idx + 1) == thisLevel;
    },

    toggleOpenState: function(idx) {
        var item = this.childData[idx];
        var visible = this.childData.length;
        if (item.isContainerOpen) {
            item.isContainerOpen = false;

            var thisLevel = this.getLevel(idx);
            var deletecount = 0;

            for (var t = idx + 1; t < visible &&
                 this.getLevel(t) > thisLevel; t++) {
                deletecount++;
                if (this.childData[t].isContainerOpen) {
                    this.toggleOpenState(t);
                }
            }
            if (deletecount) {
                this.childData.splice(idx + 1, deletecount);
                this.treeBox.rowCountChanged(idx + 1, -deletecount);
            }
        }
        else {
            item.isContainerOpen = true;

            var toinsert = this.childData[idx].childs;
            var length = 0;
            if (toinsert) length = toinsert.length;
            for (var i = 0; i < length; i++) {
                this.childData.splice(idx + i + 1, 0, toinsert[i]);
            }
            this.treeBox.rowCountChanged(idx + 1, length);
        }
        this.treeBox.invalidateRow(idx);
    },
    getImageSrc: function(idx, column) {},
    getProgressMode : function(idx,column) {},
    getCellValue: function(idx, column) {},
    cycleHeader: function(col, elem) {},
    selectionChanged: function() {},
    cycleCell: function(idx, column) {},
    getSelectedIndex: function () {
        var start = end = {};
        document.getElementById("elementList").view.selection.getRangeAt(
            0, start, end
        );
        return end.value;
    },
    insertNode: function() {
        var idx = this.getSelectedIndex();
        if (idx == -1) return;
        var selectedItem = this.childData[idx];
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
        this.childData.splice(idx + 1, 0, newRow);
        this.treeBox.rowCountChanged(idx + 1, 1);
        this.treeBox.invalidateRow(idx);
    },
    deleteNode: function () {
        var selectedIdx = this.getSelectedIndex();
        if (selectedIdx == -1) return;
        var toDelete = this.childData[selectedIdx];
        this.treeBox.invalidate();
    },
    indentIn: function () {
        var last = this.getSelectedIndex();
        if (last == -1) return;
        var lastItem = this.childData[last];
        if (this.getLevel(last - 1) == this.getLevel(last)) {
            var siblingIdx = last - 1;
            if (! this.childData[siblingIdx].isContainerOpen) {
                this.toggleOpenState(siblingIdx);
                if (typeof this.childData[siblingIdx].childs != 'undefined')
                    last += this.childData[siblingIdx].childs.length;
            }
            if (typeof lastItem.parent != 'undefined') {
                for (var i = 0; i < lastItem.parent.childs.length; i++ ) {
                    if (lastItem.parent.childs[i].id == lastItem.id) {

                        lastItem.parent.childs.splice(i, 1);
                        break;
                    }
                }
            }
            lastItem.parent = this.childData[siblingIdx];
            if (typeof this.childData[siblingIdx].childs == 'undefined')
                this.childData[siblingIdx].childs = [];
            this.childData[siblingIdx].childs.push(lastItem);
        }
        this.treeBox.invalidate();
    },
    indentOut: function() {
        var selectedIdx = this.getSelectedIndex();
        if (selectedIdx == -1) return;
        var toDelete = this.childData[selectedIdx];
        this.treeBox.invalidate();
    },
    performActionOnCell: function(action, index, column) {},
    performActionOnRow: function(action, index, column) {},
    getRowProperties: function(idx, prop) {},
    getCellProperties: function(idx, column, prop) {},
    getColumnProperties: function(column, element, prop) {},
    setCellText: function(row, col, value) {
        this.childData[row].text = value;
        this.treeBox.invalidateRow(row);
    }
};
