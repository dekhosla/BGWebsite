
require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Editor"

], function (WebMap, MapView, Editor) {
    // Create a map frm the referenced webmap item id
    let webmap = new WebMap({
        portalItem: {
            id: "21bfa9bac7784decacf62b8d45a65dc0"
        }
    });

    let view = new MapView({
        container: "viewDiv",
        map: webmap
    });

    view.when(function () {
        view.popup.autoOpenEnabled = false; //disable popups

        // Create the Editor
        let editor = new Editor({
            view: view
        });

        // Add widget to top-right of the view
        view.ui.add(editor, "top-right");
    });
});