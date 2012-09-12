"use strict";

function loadOPMLfile() {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);
    var res = fp.show();
    if (res != nsIFilePicker.returnCancel){
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.loadFile(file);
    }
}

function saveOPMLfileAs() {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeSave);
    var res = fp.show();
    if (res != nsIFilePicker.returnCancel){
        var file = fp.file;
        document.getElementById("mainWindow").contentWindow.saveFile(file);
    }
}

function init() {
    document.getElementById("mainWindow").setAttribute(
        'src',
        'chrome://dentro/content/test.html'
    );
}

function saveOPMLfile() {
    document.getElementById("mainWindow").contentWindow.saveFile();
}
