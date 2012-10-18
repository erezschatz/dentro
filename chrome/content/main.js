"use strict";

var newOPMLfile = function () {
}
var loadOPMLfile = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    var res = fp.show();
    if (res != nsIFilePicker.returnCancel){
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.loadFile(file);
    }
}

var saveOPMLfileAs = function () {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeSave);
    var res = fp.show();
    if (res != nsIFilePicker.returnCancel){
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.saveFile(file);
    }
}

var init = function () {
    document.getElementById("mainWindow").setAttribute(
        'src',
        'chrome://dentro/content/test.html'
    );
}

var saveOPMLfile = function () {
    document.getElementById("mainWindow").contentWindow.saveFile();
}
