/* globals window, _, VIZI, d3, THREE */
(function() {
  "use strict";

/**
 * Blueprint Distance output
 * @author Robin Hawkes - vizicities.com
 * @author Edward Oliver Greer
 */

  // output: {
  //   type: "BlueprintOutputDistance",
  //   options: {
  //     colour: ["#669966"],
  //     layer: 100
  //   }
  // }
  VIZI.BlueprintOutputDistance = function(options) {
    var self = this;

    VIZI.BlueprintOutput.call(self, options);

    _.defaults(self.options, {
      colour: ["#669966"],
      layer: 10
    });

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []}
    ];

    self.actions = [
      {name: "outputDistance", arguments: ["data"]}
    ];

    self.world;
  };

  VIZI.BlueprintOutputDistance.prototype = Object.create( VIZI.BlueprintOutput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintOutputDistance.prototype.init = function() {
    var self = this;

    self.emit("initialised");
  };

  // {
  //   outline: [],
  //   value: 123
  // }
  VIZI.BlueprintOutputDistance.prototype.outputDistance = function(data) {
    var self = this;

    var material = new THREE.LineBasicMaterial({
      color: 0x669966
    });

    var geometry = new THREE.Geometry();

    _.each(data, function(point) {
      var coords = point.coordinates;

      var offset = new VIZI.Point();

      var geoCoord = self.world.project(new VIZI.LatLon(coords[1], coords[0]));

      offset.x = -1 * geoCoord.x;
      offset.y = -1 * geoCoord.y;

      var mesh = new THREE.Line(geometry,material);

      // Offset
      mesh.position.x = -1 * offset.x;
      mesh.position.z = -1 * offset.y;

      mesh.matrixAutoUpdate && mesh.updateMatrix();
      geometry.merge(mesh.geometry, mesh.matrix);
    });

    // Move merged geom to 0,0 and return offset
    var offset = geometry.center();

    var combinedMesh = new THREE.Line(geometry, material);

    // Use previously calculated offset to return merged mesh to correct position
    // This allows frustum culling to work correctly
    combinedMesh.position.x = -1 * offset.x;

    // Removed for scale center to be correct
    // Offset with applyMatrix above
    combinedMesh.position.y = -1 * offset.y;

    combinedMesh.position.z = -1 * offset.z;
    debugLine = combinedMesh;
    self.add( combinedMesh );
  };

  VIZI.BlueprintOutputDistance.prototype.onAdd = function(world) {
    var self = this;
    self.world = world;
    self.init();
  };
}());
