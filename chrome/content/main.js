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

var newOPMLFile = function () {
    document.getElementById('mainWindow').contentWindow.newFile();
};

var loadOPMLFile = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        nsIFilePicker
    );
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    fp.open(function () {
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.loadFile(file);
        document.title = file.leafName;
    });
};

var saveOPMLFileAs = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        nsIFilePicker
    );
    fp.init(window, "Select a File", nsIFilePicker.modeSave);

    fp.open( function () {
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.saveFile(file);
        document.title = file.leafName;
    });
};

var init = function () {
    document.getElementById("mainWindow").setAttribute(
        'src',
        'chrome://dentro/content/test.html'
    );
};

var saveOPMLFile = function () {
    if (!document.getElementById("mainWindow").contentWindow.saveFile()) {
        saveOPMLFileAs();
    }
};

/*
var toOpenWindowByType = function (inType, uri) {
    var winopts =
        "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
    window.open(uri, "_blank", winopts);
};

*/

var collapseAll = function() {
    document.getElementById('mainWindow').contentWindow.collapseAll();
};

var expandAll = function() {
    document.getElementById('mainWindow').contentWindow.expandAll();
};

var closeDentro = function() {
    window.close();
};

var postToWordpress = function() {
    document.getElementById('mainWindow').contentWindow.postToWordpress();
};

var togglePageDirection = function() {
    document.getElementById('mainWindow').contentWindow.togglePageDirection();
};
