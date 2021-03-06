var world = new VIZI.World({
    viewport: document.querySelector("#vizicities-viewport"),
    center: new VIZI.LatLon(51.278709, 1.080535)
});

VIZI.DEBUG = false;

var controls = new VIZI.ControlsMap(world.camera);

var mapConfig = {
    input: {
        type: "BlueprintInputMapTiles",
        options: {
            tilePath: "https://a.tiles.mapbox.com/v3/examples.map-i86l3621/{z}/{x}/{y}@2x.png",
            opacity: 0.8
        }
    },
    output: {
        type: "BlueprintOutputImageTiles",
        options: {
            grids: [{
                zoom: 19,
                tilesPerDirection: 3,
                cullZoom: 17
            }, {
                zoom: 18,
                tilesPerDirection: 3,
                cullZoom: 16
            }, {
                zoom: 17,
                tilesPerDirection: 3,
                cullZoom: 15
            }, {
                zoom: 16,
                tilesPerDirection: 3,
                cullZoom: 14
            }, {
                zoom: 15,
                tilesPerDirection: 3,
                cullZoom: 13
            }, {
                zoom: 14,
                tilesPerDirection: 3,
                cullZoom: 12
            }, {
                zoom: 13,
                tilesPerDirection: 5,
                cullZoom: 11
            }]
        }
    },
    triggers: [{
        triggerObject: "output",
        triggerName: "initialised",
        triggerArguments: ["tiles"],
        actionObject: "input",
        actionName: "requestTiles",
        actionArguments: ["tiles"],
        actionOutput: {
            tiles: "tiles" // actionArg: triggerArg
        }
    }, {
        triggerObject: "output",
        triggerName: "gridUpdated",
        triggerArguments: ["tiles"],
        actionObject: "input",
        actionName: "requestTiles",
        actionArguments: ["tiles"],
        actionOutput: {
            tiles: "tiles" // actionArg: triggerArg
        }
    }, {
        triggerObject: "input",
        triggerName: "tileReceived",
        triggerArguments: ["image", "tile"],
        actionObject: "output",
        actionName: "outputImageTile",
        actionArguments: ["image", "tile"],
        actionOutput: {
            image: "image", // actionArg: triggerArg
            tile: "tile"
        }
    }]
};

var switchboardMap = new VIZI.BlueprintSwitchboard(mapConfig);
switchboardMap.addToWorld(world);

var choroplethConfig = {
    input: {
        type: "BlueprintInputGeoJSON",
        options: {
            path: "./data/allCT.geojson"
        }
    },
    output: {
        type: "BlueprintOutputChoropleth",
        options: {
            colourRange: ["#ff69b4", "#e65fa2", "#cc5490", "#b34a7e", "#993f6c", "#80355a", "#662a48"],
            layer: 100,
            opacity: 0.7,
        }
    },
    triggers: [{
        triggerObject: "output",
        triggerName: "initialised",
        triggerArguments: [],
        actionObject: "input",
        actionName: "requestData",
        actionArguments: [],
        actionOutput: {}
    }, {
        triggerObject: "input",
        triggerName: "dataReceived",
        triggerArguments: ["geoJSON"],
        actionObject: "output",
        actionName: "outputChoropleth",
        actionArguments: ["data"],
        actionOutput: {
            data: {
                // Loop through each item in trigger.geoJSON and return a new array of processed values (a map)
                process: "map",
                itemsObject: "geoJSON",
                itemsProperties: "features",
                // Return a new object for each item with the given properties
                transformation: {
                    outline: "geometry.coordinates[0]",
                    value: "properties.ranking"
                }
            }
        }
    }]
};

var switchboardChoropleth = new VIZI.BlueprintSwitchboard(choroplethConfig);
switchboardChoropleth.addToWorld(world);

var buildingsConfig = {
    input: {
        type: "BlueprintInputGeoJSON",
        options: {
            tilePath: "http://vector.mapzen.com/osm/buildings/{z}/{x}/{y}.json"
        }
    },
    output: {
        type: "BlueprintOutputBuildingTiles",
        options: {
            grids: [{
                zoom: 15,
                tilesPerDirection: 1,
                cullZoom: 13,
            }],
            opacity: 0.8,
            workerURL: "../../build/vizi-worker.min.js"
        }
    },
    triggers: [{
        triggerObject: "output",
        triggerName: "initialised",
        triggerArguments: ["tiles"],
        actionObject: "input",
        actionName: "requestTiles",
        actionArguments: ["tiles"],
        actionOutput: {
            tiles: "tiles" // actionArg: triggerArg
        }
    }, {
        triggerObject: "output",
        triggerName: "gridUpdated",
        triggerArguments: ["tiles"],
        actionObject: "input",
        actionName: "requestTiles",
        actionArguments: ["tiles"],
        actionOutput: {
            tiles: "tiles" // actionArg: triggerArg
        }
    }, {
        triggerObject: "input",
        triggerName: "tileReceived",
        triggerArguments: ["geoJSON", "tile"],
        actionObject: "output",
        actionName: "outputBuildingTile",
        actionArguments: ["buildings", "tile"],
        actionOutput: {
            buildings: {
                process: "map",
                itemsObject: "geoJSON",
                itemsProperties: "features",
                transformation: {
                    outline: "geometry.coordinates",
                    height: "properties.height"
                }
            },
            tile: "tile"
        }
    }]
};

var switchboardBuildings = new VIZI.BlueprintSwitchboard(buildingsConfig);
switchboardBuildings.addToWorld(world);

var clock = new VIZI.Clock();

var update = function() {
    var delta = clock.getDelta();

    world.onTick(delta);
    world.render();

    window.requestAnimationFrame(update);
};

update();