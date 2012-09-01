function doOK(){
    var file = document.getElementById("file-path").value;
    if(!file){
	alert("Please enter valid Path");
	return false;
    }

    window.arguments[0].file = file;
    return true;
}

function doCancel(){
    return true;
}
