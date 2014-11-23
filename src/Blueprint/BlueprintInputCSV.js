/* globals window, _, VIZI, d3, JXON */
(function() {
  "use strict";

/**
 * Blueprint CSV input
 * @author Robin Hawkes - vizicities.com
 * @author Edward Oliver Greer - eogreer.me
 */  

  // input: {
  //   type: "BlueprintInputCSV",
  //   options: {
  //     path: "./data/crime0914.kml"
  //   }
  // }
  VIZI.BlueprintInputCSV = function(options) {
    var self = this;

    VIZI.BlueprintInput.call(self, options);

    _.defaults(self.options, {});

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []},
      {name: "dataReceived", arguments: ["csv"]}
    ];

    self.actions = [
      {name: "requestData", arguments: []}
    ];
  };

  VIZI.BlueprintInputCSV.prototype = Object.create( VIZI.BlueprintInput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintInputCSV.prototype.init = function() {
    var self = this;
    self.emit("initialised");
  };

  // TODO: Cache a certain amount of tiles
  // TODO: Pull from cache if available
  VIZI.BlueprintInputCSV.prototype.requestData = function(tiles) {
    var self = this;

    if (!self.options.path) {
      throw new Error("Required path option missing");
    }

    // Request data
    d3.csv(self.options.path, function(error, data) {
      if (error) {
        if (VIZI.DEBUG) console.log("Failed to request CSV data");
        console.warn(error);
        return;
      }
    })
    .row(function(d) { return { "coordinates" : [d.Longitude, d.Latitude]}; })
    .get(function(error, rows) { console.log(rows); self.emit("dataReceived", rows); });

  };

  // Process coordinates from CSV into a 2D array [lon, lat]
  //VIZI.BlueprintInputCSV.prototype.processCoordinates = function(obj) {
  //  var self = this;
  //
  //  var csv = obj.split('\n'); // Split on new line
  //  var csvsize = csv.length;
  //  for ( var i = 0; i <= csvsize; i++ ) {
  //    if ( csv[i] !== "" ) {
  //      csv[i] = csv[i].split(','); // Split on comma
  //    } else {
  //      csv.splice(i, 1);
  //    }
  //  }
  //  console.log(csv);
  //
  //  var headers = csv[0];
  //  var longitude = headers.indexOf("Longitude");
  //  var latitude = headers.indexOf("Latitude");
  //
  //  for ( var j = 1; j <= csvsize; j++ ) {
  //    obj[j] = csv[longitude] + "," + csv[latitude];
  //    console.log(obj[j]);
  //  }
  //
  //};
}());