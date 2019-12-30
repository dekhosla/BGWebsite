/*BG controller for BG View*/

require([
    "esri/Map",

    "esri/views/SceneView",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/VectorTileLayer",
    "esri/widgets/Legend",
    "esri/request",
    "esri/widgets/Expand",
    "esri/widgets/Bookmarks",

],
    function (Map, SceneView, FeatureLayer, TileLayer, VectorTileLayer, Legend, esriRequest, Expand, Bookmarks ) {
        /*****************************************************************
         * Create two TileLayer instances. One pointing to a
         * cached map service depicting U.S. male population and the other
         * pointing to a layer of roads and highways.
         *****************************************************************/
        var resultsDiv = document.getElementById("resultsDiv");

        var input = document.getElementById("inputUrl");

        // Define the 'options' for the request
        var options = {
            query: {
                f: "json"
            },
            responseType: "json"
        };
        //getting emodis DropDown
        // emodisDropDown();
        function emodisDropDown() {
            var url = "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/Modis2018/MapServer?f=pjson&cacheKey=8b49d656f0fc583b";
            esriRequest(url, options).then(function (response) {
                var emodisDropDownOptions = response.data.layers;
                var valTest = document.getElementById("modisDropSel");
                for (i = 0; i < emodisDropDownOptions.length; i++) {
                    var car = new Option(emodisDropDownOptions[i].name, emodisDropDownOptions[i].id);
                    valTest.options.add(car);
                }
            });
        }


       

  
        //getting prism DropDown
       // prismDropDown();
        function prismDropDown() {
            var url = "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/PICO_2011_2018/MapServer";
            esriRequest(url, options).then(function (response) {
                var prismDropDownOptions = response.data.layers;
                var valTest = document.getElementById("prismDropSel");
                for (i = 0; i < prismDropDownOptions.length; i++) {
                    var car = new Option(prismDropDownOptions[i].name, prismDropDownOptions[i].id);
                    valTest.options.add(car);
                }
            });
        }
        var housingLayer = new VectorTileLayer({
            url:"https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/Boundary_Saguaro_National_Park/VectorTileServer",
           // url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/NDVI_comp_258_0915_2019/MapServer",
            opacity: 0.9,
          
        });
       

        /*****************************************************************
         * Layers may be added to the map in the map's constructor
         *****************************************************************/
        var map = new Map({
            basemap: "oceans",
            layers: [housingLayer]           
        });
        var modisLayer = '';
        var prismLayer = '';

        /*****************************************************************
         * Or they may be added to the map using map.add()
         *****************************************************************/

        //map.layers.add(prismLayer);
        // MapView to SceneView
        var view = new SceneView({                    
            container: "viewDiv",
            map: map,
           /* camera: {
                // autocasts as new Camera()
                position: {
                    // autocasts as new Point()
                    x: 32.253460,
                    y: -110.911789,                  
                },            
               
            }*/
           // center: [-110.911789, 32.253460],
           // zoom: 6,
        });

        /*****************************************************************
         * The map handles the layers' data while the view and layer views
         * take care of renderering the layers
         *****************************************************************/
        view.on("layerview-create", function (event) {
            if (event.layer.id === "ny-housing") {
                // Explore the properties of the population layer's layer view here
                console.log(
                    "LayerView for male population created!",
                    event.layerView
                );
            }
            if (event.layer.id === "streets") {
                // Explore the properties of the transportation layer's layer view here
                // Explore the properties of the transportation layer's layer view here
                console.log("LayerView for streets created!", event.layerView);
            }
        });

        /*****************************************************************
         * Layers are promises that resolve when loaded, or when all their
         * properties may be accessed. Once the population layer has loaded,
         * the view will animate to it's initial extent.
         *****************************************************************/
   
        const screenshotBtn = document.getElementById("screenshotBtn");

        // the orange mask used to select the area
        const maskDiv = document.getElementById("maskDiv");

        // element where we display the print preview
        const screenshotDiv = document.getElementById("screenshotDiv");

        // replace the navigation elements with screenshot area selection button
         view.ui.empty("bottom-right");
        view.ui.add(screenshotBtn, "bottom-right");

        // add an event listener to trigger the area selection mode
        screenshotBtn.addEventListener("click", function () {
            screenshotBtn.classList.add("active");
            view.container.classList.add("screenshotCursor");
            let area = null;

            // listen for drag events and compute the selected area
            const dragHandler = view.on("drag", function (event) {
                // prevent navigation in the view
                event.stopPropagation();

                // when the user starts dragging or is dragging
                if (event.action !== "end") {
                    // calculate the extent of the area selected by dragging the cursor
                    const xmin = clamp(
                        Math.min(event.origin.x, event.x),
                        0,
                        view.width
                    );
                    const xmax = clamp(
                        Math.max(event.origin.x, event.x),
                        0,
                        view.width
                    );
                    const ymin = clamp(
                        Math.min(event.origin.y, event.y),
                        0,
                        view.height
                    );
                    const ymax = clamp(
                        Math.max(event.origin.y, event.y),
                        0,
                        view.height
                    );
                    area = {
                        x: xmin,
                        y: ymin,
                        width: xmax - xmin,
                        height: ymax - ymin
                    };
                    // set the position of the div element that marks the selected area
                    setMaskPosition(area);
                }
                // when the user stops dragging
                else {
                    // remove the drag event listener from the SceneView
                    dragHandler.remove();
                    // the screenshot of the selected area is taken
                    view
                        .takeScreenshot({ area: area, format: "png" })
                        .then(function (screenshot) {
                            // display a preview of the image
                            showPreview(screenshot);

                            // create the image for download
                            document.getElementById("downloadBtn").onclick = function () {
                               
                                const text = document.getElementById("textInput").value;                                
                                // if a text exists, then add it to the image
                                if (text) {
                                    const dataUrl = getImageWithText(screenshot, text);
                                    downloadImage(
                                        text + ".png",
                                        dataUrl
                                    );
                                }
                                // otherwise download only the webscene screenshot
                                else {
                                    downloadImage(
                                        "SelectedLocation" + ".png",
                                        screenshot.dataUrl
                                    );
                                }
                            };

                            // the screenshot mode is disabled
                            screenshotBtn.classList.remove("active");
                            view.container.classList.remove("screenshotCursor");
                            setMaskPosition(null);
                        });
                }
            });

            function setMaskPosition(area) {
                if (area) {
                    maskDiv.classList.remove("hide");
                    maskDiv.style.left = area.x + "px";
                    maskDiv.style.top = area.y + "px";
                    maskDiv.style.width = area.width + "px";
                    maskDiv.style.height = area.height + "px";
                } else {
                    maskDiv.classList.add("hide");
                }
            }

            function clamp(value, from, to) {
                return value < from ? from : value > to ? to : value;
            }
        });

        // creates an image that will be appended to the DOM
        // so that users can have a preview of what they will download
        function showPreview(screenshot) {
            screenshotDiv.classList.remove("hide");
            // add the screenshot dataUrl as the src of an image element
            const screenshotImage = document.getElementsByClassName(
                "js-screenshot-image"
            )[0];
            screenshotImage.width = screenshot.data.width;
            screenshotImage.height = screenshot.data.height;
            screenshotImage.src = screenshot.dataUrl;
        }

        // returns a new image created by adding a custom text to the webscene image
        function getImageWithText(screenshot, text) {
            const imageData = screenshot.data;

            // to add the text to the screenshot we create a new canvas element
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = imageData.height;
            canvas.width = imageData.width;

            // add the screenshot data to the canvas
            context.putImageData(imageData, 0, 0);
            context.font = "20px Arial";
            context.fillStyle = "#000";
            context.fillRect(
                0,
                imageData.height - 40,
                context.measureText(text).width + 20,
                30
            );

            // add the text from the textInput element
            context.fillStyle = "#fff";
            context.fillText(text, 10, imageData.height - 20);

            return canvas.toDataURL();
        }

        function downloadImage(filename, dataUrl) {
            // the download is handled differently in Microsoft browsers
            // because the download attribute for <a> elements is not supported
            if (!window.navigator.msSaveOrOpenBlob) {
                // in browsers that support the download attribute
                // a link is created and a programmatic click will trigger the download
                const element = document.createElement("a");
                element.setAttribute("href", dataUrl);
                element.setAttribute("download", filename);
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            } else {
                // for MS browsers convert dataUrl to Blob
                const byteString = atob(dataUrl.split(",")[1]);
                const mimeString = dataUrl
                    .split(",")[0]
                    .split(":")[1]
                    .split(";")[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });

                // download file
                window.navigator.msSaveOrOpenBlob(blob, filename);
            }
        }
        // button to hide the print preview html element

        document
            .getElementById("closeBtn")
            .addEventListener("click", function () {
                screenshotDiv.classList.add("hide");
            });
                       
        view.when(function () {
            housingLayer.when(function () {
               view.goTo(housingLayer.fullExtent);
               //view.goTo(housingLayer.setExtent(startExtent));
            });
        });
                

        //default button hidden
        document.getElementById("prismShow").style.visibility = 'hidden';
        document.getElementById("modisShow").style.visibility = 'hidden';
        document.getElementById("dynamicShow").style.visibility = 'hidden';
        document.getElementById("diffShow").style.visibility = 'hidden';
        document.getElementById("bgShow").style.visibility = 'hidden';
        document.getElementById("targetShow").style.visibility = 'hidden';


        // button click okay for selection
        document.getElementById("clickOkay").addEventListener("click", function (event) {
            var prismDropVal = document.getElementById("prismSelVal").checked ? (document.getElementById("prismDropSel").value == "Please Select" ? undefined : document.getElementById("prismDropSel").value) : undefined;
            var modisDropVal = document.getElementById("modisSelVal").checked ? (document.getElementById("modisDropSel").value == "Please Select" ? undefined : document.getElementById("modisDropSel").value) : undefined;
            var dynamicsDropVal = document.getElementById("dynamicsSelVal").checked ? (document.getElementById("dynamicsDropSel").value == "Please Select" ? undefined : document.getElementById("dynamicsDropSel").value) : undefined;
            var diffDropVal = document.getElementById("diffSelVal").checked ? (document.getElementById("diffDropSel").value == "Please Select" ? undefined : document.getElementById("diffDropSel").value) : undefined;
            var bgDropVal = document.getElementById("bgSelVal").checked ? (document.getElementById("bgDropSel").value == "Please Select" ? undefined : document.getElementById("bgDropSel").value) : undefined;
            var targetDropVal = document.getElementById("targetSelVal").checked ? (document.getElementById("targetDropSel").value == "Please Select" ? undefined : document.getElementById("targetDropSel").value) : undefined;
            var selArea = document.getElementById("areaOfIntrestSel").value;

            hideOptions(prismDropVal, modisDropVal, dynamicsDropVal, diffDropVal, bgDropVal, targetDropVal);
            clickOkay(map, prismDropVal, modisDropVal, dynamicsDropVal, diffDropVal, bgDropVal, targetDropVal, prismLayer, modisLayer, selArea);
        });

        //functio hide or show button
        function hideOptions(prismDropVal, modisDropVal, dynamicsDropVal, diffDropVal, bgDropVal, targetDropVal) {
            prismDropVal != undefined ? document.getElementById("prismShow").style.visibility = 'visible' : document.getElementById("prismShow").style.visibility = 'hidden';
            modisDropVal != undefined ? document.getElementById("modisShow").style.visibility = 'visible' : document.getElementById("modisShow").style.visibility = 'hidden';
            dynamicsDropVal != undefined ? document.getElementById("dynamicShow").style.visibility = 'visible' : document.getElementById("dynamicShow").style.visibility = 'hidden';
            diffDropVal != undefined ? document.getElementById("diffShow").style.visibility = 'visible' : document.getElementById("diffShow").style.visibility = 'hidden';
            bgDropVal != undefined ? document.getElementById("bgShow").style.visibility = 'visible' : document.getElementById("bgShow").style.visibility = 'hidden';
            targetDropVal != undefined ? document.getElementById("targetShow").style.visibility = 'visible' : document.getElementById("targetShow").style.visibility = 'hidden';
        }

        function clickOkay(map, prismDropVal, modisDropVal, dynamicsDropVal, diffDropVal, bgDropVal, targetDropVal, prismLayer, modisLayer, selArea) {

            var prismLayerToggle = document.getElementById("prismLayerSel");
            var ndviLayerToggle = document.getElementById("ndviLayerSel");
            var dynamicsLayerToggle = document.getElementById("dynamicsLayerSel");
            var differenceLayerToggle = document.getElementById("differenceLayerSel");
            var bgLayerToggle = document.getElementById("bgLayersel");
            var targetLayerToggle = document.getElementById("targetLayerSel");
           

            prismLayerToggle.checked = prismDropVal != undefined ? false : true;
            ndviLayerToggle.checked = modisDropVal != undefined ? false : true;
            dynamicsLayerToggle.checked = dynamicsDropVal != undefined ? false : true;
            differenceLayerToggle.checked = diffDropVal != undefined ? false : true;
            bgLayerToggle.checked = bgDropVal != undefined ? false : true;
            targetLayerToggle.checked = targetDropVal != undefined ? false : true;

            var test = map.allLayers._items.length;
            for (i = 0; i < test; i++) {
                var re = map.allLayers._items[0]
                map.allLayers.remove(re);
            }
            var length = map.layers._items.length;
            for (i = 0; i < length; i++) {
                var rr = map.layers._items[0]
                map.layers.remove(rr);
            }

            if (prismDropVal != undefined) {
                map.layers.remove(prismLayer);
                prismLayer = new TileLayer({
                    url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/" + prismDropVal + "/MapServer",
                    //url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/precipitation_buffelgrass_prism_0909_tif/MapServer",
                    //url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/USA_NPN_12_13_2019_climate_prism_ppt_tif/MapServer",
                    // This property can be used to uniquely identify the layer
                    visible: true
                });
                prismLayerToggle.checked = true;
                map.add(prismLayer);
            }
            if (modisDropVal != undefined) {
                map.layers.remove(modisLayer);
                if (modisDropVal) {
                    modisLayer = new TileLayer({                      
                        url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/" + modisDropVal + "/MapServer",
                        // This property can be used to uniquely identify the layer
                        visible: true
                    });
                    ndviLayerToggle.checked = true;
                }
                map.layers.add(modisLayer);
            }
            if (dynamicsDropVal != undefined) {
                dynamicsLayer = new TileLayer({
                    url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/mod09q1_a2018001_ndvi_img/MapServer",
                    // This property can be used to uniquely identify the layer
                    visible: true
                });
                dynamicsLayerToggle.checked = true;
                map.add(dynamicsLayer);
            }
            if (diffDropVal != undefined) {
                differenceLayer = new TileLayer({
                    url:"https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/difference_0930_0915geo_img_2019/MapServer",
                    //url:"https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/difference_0930_0915geo_img_20/MapServer",
                    //url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/difference_0930_0915geo_img/MapServer",
                    // This property can be used to uniquely identify the layer
                    visible: true
                });
                differenceLayerToggle.checked = true;

                map.add(differenceLayer);
            }
            if (bgDropVal != undefined) {
                bgLayer = new FeatureLayer({
                    url: "https://services1.arcgis.com/Ezk9fcjSUkeadg6u/arcgis/rest/services/BGpts_from_JM/FeatureServer",
                    visible: true,
                    zoom: 9,
                    center: [-110.9747, 32.2226]
                });
                bgLayerToggle.checked = true;
                map.add(bgLayer);
            }
            if (targetDropVal != undefined) {
                targetLayer = new TileLayer({
                    url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/BG_targets_2019_0930_3dyn_ppt0918m250_img/MapServer",
                    visible: true
                });
                targetLayerToggle.checked = true;
                map.add(targetLayer);
            }
            if (selArea == "Saguaro National Park") {
                housingLayer = new VectorTileLayer({
                    url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/Boundary_Saguaro_National_Park/VectorTileServer",
                    opacity: 0.9,

                });
            } else {
                housingLayer = new VectorTileLayer({
                    url: "https://tiles.arcgis.com/tiles/Ezk9fcjSUkeadg6u/arcgis/rest/services/" + selArea +"/VectorTileServer",                    
                    opacity: 0.9,
                    maxzoom: 12,
                });
               
            }           
            
            map.add(housingLayer);
            view.when(function () {
                housingLayer.when(function () {
                   // view.goTo(housingLayer.fullExtent);
                    //view.goTo(housingLayer.setExtent(startExtent));
                });
            });
          

            // Add widget to the bottom right corner of the view                  
            view.ui.empty("bottom-left");  
            view.ui.add([
                new Expand({
                    view: view,
                    content: new Legend({ view: view }),
                    group: "top-left",
                    expanded: true
                }) ],
                "bottom-left");

            ndviLayerToggle.addEventListener("change", function () {
                modisLayer.visible = ndviLayerToggle.checked;
            });
            prismLayerToggle.addEventListener("change", function () {

                prismLayer.visible = prismLayerToggle.checked;
            });
            dynamicsLayerToggle.addEventListener("change", function () {
                dynamicsLayer.visible = dynamicsLayerToggle.checked;
            });
            differenceLayerToggle.addEventListener("change", function () {
                differenceLayer.visible = differenceLayerToggle.checked;
            });
            bgLayerToggle.addEventListener("change", function () {
                bgLayer.visible = bgLayerToggle.checked;
            });
            targetLayerToggle.addEventListener("change", function () {
                targetLayer.visible = targetLayerToggle.checked;
            });
        }
    });

