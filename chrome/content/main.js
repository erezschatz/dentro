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

(function (document, window) {
    "use strict";
    
    var Main = function(){
        
    };

Main.newOPMLFile = function () {
    document.getElementById('mainWindow').contentWindow.Outline.newFile();
};

Main.loadOPMLFile = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        nsIFilePicker
    );
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    var res = fp.open(function () {
        var file = fp.file;
        if (res != nsIFilePicker.returnCancel){
           document.getElementById("mainWindow").contentWindow.Outline.loadFile(file);
        }
        document.title = file.leafName;
    });
};

Main.saveOPMLFileAs = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(
        nsIFilePicker
    );
    fp.init(window, "Select a File", nsIFilePicker.modeSave);

    var res = fp.open(function () {
        var file = fp.file;
        if (res != nsIFilePicker.returnCancel){
            document.getElementById("mainWindow").contentWindow.saveFile(file);
        }
        document.title = file.leafName;
    });
};

Main.init = function () {
    document.getElementById("mainWindow").setAttribute(
        'src',
        'chrome://dentro/content/test.html'
    );
};

Main.saveOPMLFile = function () {
    if (!document.getElementById("mainWindow").contentWindow.saveFile()) {
        Main.saveOPMLFileAs();
    }
};

Main.toOpenWindowByType = function (inType, uri) {
    var winopts = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
    window.open(uri, "_blank", winopts);
};

Main.collapseAll = function() {
    document.getElementById('mainWindow').contentWindow.collapseAll();
};

Main.expandAll = function() {
    document.getElementById('mainWindow').contentWindow.Dentro.expandAll();
};

Main.closeDentro = function() {
    window.close();
};

window.Main = document.Main = Main;

})(document, window);
