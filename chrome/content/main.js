var objID = 0;

function init() {
  document.getElementById("elementList").view = treeView;
}

function outline() {
    this.id = objID++; //should really be self-incrementing
    this.isContainerOpen = false;
    return this;
}

//hard coded test data
var solids = new outline();
var liquids = new outline();
var gases = new outline();

solids.text = 'Solids';
liquids.text = 'Liquids';
gases.text = 'Gases';

var silver = new outline();
var gold = new outline();
var lead = new outline();
var mercury = new outline();
var helium = new outline();
var nitrogen = new outline();
var white = new outline();
var red = new outline();

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

//end of hard coded test data

var treeView = {
    childData : [ solids, liquids, gases ],

    treeBox: null,
    selection: null,
    get rowCount() { return this.childData.length },
    setTree: function(treeBox) { this.treeBox = treeBox; },
    getCellText: function(idx, column) { return this.childData[idx].text; },
    isContainer: function(idx) { return true; },
    isContainerOpen: function(idx) {
        return this.childData[idx].isContainerOpen;
    },
    isContainerEmpty: function(idx)    { return false; }, //this.childData[idx].text; },
    isSeparator: function(idx)         { return false; },
    isSorted: function()               { return false; },
    isEditable: function(idx, column)  { return true; },

    getParentIndex: function(idx) {
        if (this.isContainer(idx)) return -1;
        for (var t = idx - 1; t >= 0 ; t--) {
            if (this.isContainer(t)) return t;
        }
    },

    // if element has a .parent, level++ until no parent (root)
    getLevel: function(idx) {
        level = 0;
        checked_element = this.childData[idx];
        while (checked_element.parent) {
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
            for (var t = idx + 1; t < visible; t++) {
                if (this.getLevel(t) > thisLevel) deletecount++;
                else break;
            }
            if (deletecount) {
                this.childData.splice(idx + 1, deletecount);
                this.treeBox.rowCountChanged(idx + 1, -deletecount);
            }
        }
        else {

            item.isContainerOpen = true;

            // needs to open also opened childs.
            var toinsert = this.childData[idx].childs;
            for (var i = 0; i < toinsert.length; i++) {
                this.childData.splice(idx + i + 1, 0, toinsert[i]);
            }
            this.treeBox.rowCountChanged(idx + 1, toinsert.length);
        }
        this.treeBox.invalidateRow(idx);
    },

    getImageSrc: function(idx, column) {},
    getProgressMode : function(idx,column) {},
    getCellValue: function(idx, column) {},
    cycleHeader: function(col, elem) {},
    selectionChanged: function() {},
    cycleCell: function(idx, column) {},
    performAction: function(action) {},
    performActionOnCell: function(action, index, column) {},
    getRowProperties: function(idx, prop) {},
    getCellProperties: function(idx, column, prop) {},
    getColumnProperties: function(column, element, prop) {},
};
