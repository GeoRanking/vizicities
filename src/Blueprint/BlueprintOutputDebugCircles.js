/* globals window, _, VIZI, THREE */
(function() {
  "use strict";

/**
 * Blueprint debug circles output
 * @author Robin Hawkes - vizicities.com
 * @author Edward Oliver Greer - eogreer.me
 */  

  // output: {
  //   type: "BlueprintOutputDebugCircles",
  //   options: {}
  // }
  VIZI.BlueprintOutputDebugCircles = function(options) {
    var self = this;

    VIZI.BlueprintOutput.call(self, options);

    _.defaults(self.options, {});

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []}
    ];

    self.actions = [
      {name: "outputCircles", arguments: ["data"]}
    ];

    self.world;
  };

  VIZI.BlueprintOutputDebugCircles.prototype = Object.create( VIZI.BlueprintOutput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintOutputDebugCircles.prototype.init = function() {
    var self = this;

    self.emit("initialised");
  };

  // {
  //   coordinates: [lon, lat],
  //   distance: 123
  // }
  VIZI.BlueprintOutputDebugCircles.prototype.outputCircles = function(data) {
    var self = this;

    var material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });

    if (self.options.opacity)  {
      material.opacity = self.options.opacity;
      material.transparent = true;
    }

    var geom; // = new THREE.CircleGeometry();

    // Local pixels per meter - set once per tile
    var pixelsPerMeter;

    _.each(data, function(point) {
      var latLon = new VIZI.LatLon(point.coordinates[1], point.coordinates[0]);
      var geoCoord = self.world.project(latLon);

      // Set local pixels per meter if not set
      if (pixelsPerMeter === undefined) {
        pixelsPerMeter = self.world.pixelsPerMeter(latLon);
      }

      // TODO: Get this from options
      var height = 50;
      var radius = 100;
      var segments = 32;

      // Multiply height in meters by pixels per meter ratio at latitude
      height *= pixelsPerMeter.y;

      geom = new THREE.CircleGeometry(radius, segments);
      geom.vertices.push(new THREE.Vector3( geoCoord.x, height, geoCoord.y ));

    });

    var circle = new THREE.Mesh( geom, material );

    circle.rotateX(-90*(Math.PI/180));

    circle.position.y = 100;

    self.add(circle);
  };

  VIZI.BlueprintOutputDebugCircles.prototype.onAdd = function(world) {
    var self = this;
    self.world = world;
    self.init();
  };
}());