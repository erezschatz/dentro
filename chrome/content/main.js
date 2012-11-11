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
along with Dentro  If not, see <http://www.gnu.org/licenses/>.

*/

"use strict";

var newOPMLfile = function () {
    document.getElementById('mainWindow').contentWindow.newFile();
};

var loadOPMLfile = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        nsIFilePicker
    );
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    var res = fp.show();
    if (res != nsIFilePicker.returnCancel){
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.loadFile(file);
    }
    document.title = file.leafName;
};

var saveOPMLfileAs = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        nsIFilePicker
    );
    fp.init(window, "Select a File", nsIFilePicker.modeSave);

    var res = fp.show();
    if (res != nsIFilePicker.returnCancel){
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.saveFile(file);
        document.title = file.leafName
    }
}

var init = function () {
    document.getElementById("mainWindow").setAttribute(
        'src',
        'chrome://dentro/content/test.html'
    );
};

var saveOPMLfile = function () {
    if (! document.getElementById("mainWindow").contentWindow.saveFile()) {
        saveOPMLfileAs();
    }
};

var toOpenWindowByType = function (inType, uri) {
    var winopts =
        "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
    window.open(uri, "_blank", winopts);
};

var collapseAll = function() {
    document.getElementById('mainWindow').contentWindow.collapseAll();
};

var expandAll = function() {
    document.getElementById('mainWindow').contentWindow.expandAll();
};

var closeDentro = function() {
    if (document.getElementById('mainWindow').contentWindow.isEdited) {
        alert("Document has unsaved changes, save document?");
    }
    window.close();
};
