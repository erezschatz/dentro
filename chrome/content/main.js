"use strict";

function loadOPMLfile(){
    var params = { file: null };
    window.openDialog("open_file.xul", "",
	              "chrome, dialog, modal",params).focus();
    parseAndLoad(params.file);
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
