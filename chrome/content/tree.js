
loadFile();

function loadFile () {
    Components.utils.import("resource://gre/modules/NetUtil.jsm");
    Components.utils.import("resource://gre/modules/FileUtils.jsm");

    var file = new FileUtils.File(
        "/home/erez/dev/projects/dentro/dentro.opml"
    );
    var data;
    NetUtil.asyncFetch(file, function(inputStream, status) {
        if (!Components.isSuccessCode(status)) {
            // Handle error!
            return;
        }

        // The file data is contained within inputStream.
        // You can read it into a string with
        data = NetUtil.readInputStreamToString(
            inputStream,
            inputStream.available());
        parseAndLoad(data);
    });
}

function parseAndLoad (input) {
    document.getElementById('mainTree').innerHTML = input;
}

function doKeyAction(event) {

    if (event.keyCode == 13) {
        treeView.insertNode();
    } else if (event.keyCode == 9 ) {
        treeView.indentIn();
    } else if (event.keyCode == 46) {
        treeView.deleteNode();
    }
}
