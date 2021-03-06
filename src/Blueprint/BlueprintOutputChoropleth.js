/* globals window, _, VIZI, d3, THREE */
(function() {
  "use strict";

  /**
   * Blueprint choropleth output
   * @author Robin Hawkes - vizicities.com
   */

    // output: {
    //   type: "BlueprintOutputChoropleth",
    //   options: {
    //     colourRange: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],
    //     layer: 100
    //   }
    // }
  VIZI.BlueprintOutputChoropleth = function(options) {
    var self = this;

    VIZI.BlueprintOutput.call(self, options);

    _.defaults(self.options, {
      colourRange: ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],
      layer: 10
    });

    // Triggers and actions reference
    self.triggers = [
      {name: "initialised", arguments: []}
    ];

    self.actions = [
      {name: "outputChoropleth", arguments: ["data"]}
    ];

    // Store objects for the blueprint
    self.objects = [];

    self.world;

    VIZI.Messenger.on("clickedObject", function(raycaster) {
      self.clickHandler(raycaster);
    });
    
    self.current;
  };

  VIZI.BlueprintOutputChoropleth.prototype = Object.create( VIZI.BlueprintOutput.prototype );

  // Initialise instance and start automated processes
  VIZI.BlueprintOutputChoropleth.prototype.init = function() {
    var self = this;

    self.emit("initialised");
  };

  // {
  //   outline: [],
  //   value: 123
  // }
  VIZI.BlueprintOutputChoropleth.prototype.outputChoropleth = function(data) {
    var self = this;

    // Choropleth range settings
    if (self.options.colourRange) {
      // Sort feature data in order
      var dataValues = data.sort(function(a, b) {
        return d3.ascending(a.value, b.value);
      });

      var lo = dataValues[0].value;
      var hi = dataValues[data.length - 1].value;

      // TODO: Decouple range values
      var scale = d3.scale.linear()
          .domain([lo, hi])
          .range([1, 500]);

      var scaleColour = d3.scale.quantile()
          .domain([lo, hi])
          .range(self.options.colourRange);
    }

    //var combinedGeom = new THREE.Geometry();

    _.each(data, function(feature) {

	var material = new THREE.MeshLambertMaterial({
	  vertexColors: THREE.VertexColors,
	  ambient: 0xffffff,
	  emissive: 0x000000,
	  shading: THREE.FlatShading,
	  // TODO: Remove this by implementing logic to make points clockwise
	  side: THREE.BackSide
	});

    // Choropleth opacity settings
    if (self.options.opacity)  {
      material.opacity = self.options.opacity;
      material.transparent = true;
    }
    
      var offset = new VIZI.Point();
      var shape = new THREE.Shape();
      _.each(feature.outline, function(coord, index) {
        var geoCoord = self.world.project(new VIZI.LatLon(coord[1], coord[0]));

        if (offset.length === 0) {
          offset.x = -1 * geoCoord.x;
          offset.y = -1 * geoCoord.y;
        }

        // Move if first coordinate
        if (index === 0) {
          shape.moveTo( geoCoord.x + offset.x, geoCoord.y + offset.y );
        } else {
          shape.lineTo( geoCoord.x + offset.x, geoCoord.y + offset.y );
        }
      });

      var geom = new THREE.ShapeGeometry( shape );
	  
      // Use choropleth range colour if defined, else random
      var colour = (self.options.colourRange) ? new THREE.Color(scaleColour(feature.value)) : new THREE.Color(0xffffff * Math.random());

      //self.applyVertexColors(geom, colour);
	  material.color = colour;

      var mesh = new THREE.Mesh(geom);

      // Offset
      mesh.position.x = -1 * offset.x;
      mesh.position.z = -1 * offset.y;

      // TODO: Provide Y offset in options (to avoid clashing with floor, etc)
      //mesh.position.y = 10;
      mesh.position.y = 1;

      // Flip as they are up-side down
      // TODO: Remove this by implementing logic to make points clockwise
      mesh.rotation.x = 90 * Math.PI / 180;

      mesh.matrixAutoUpdate && mesh.updateMatrix();
      
      var newGeom = new THREE.Geometry();

      newGeom.merge(mesh.geometry, mesh.matrix);

      var newMesh = new THREE.Mesh(newGeom, material);
      
      newMesh.userData = feature.properties;

      if (self.options.layer.toString().length > 0) {
        newMesh.renderDepth = -1 * self.options.layer;
        newMesh.material.depthWrite = false;
        newMesh.material.transparent = true;
      }

      self.objects.push(newMesh);
      self.add(newMesh);
    });



  /*
    // Move merged geom to 0,0 and return offset
    var offset = combinedGeom.center();

    var combinedMesh = new THREE.Mesh(combinedGeom, material);

    if (self.options.layer.toString().length > 0) {
      combinedMesh.renderDepth = -1 * self.options.layer;
      combinedMesh.material.depthWrite = false;
      combinedMesh.material.transparent = true;
    }

    // Use previously calculated offset to return merged mesh to correct position
    // This allows frustum culling to work correctly
    combinedMesh.position.x = -1 * offset.x;

    // Removed for scale center to be correct
    // Offset with applyMatrix above
    combinedMesh.position.y = -1 * offset.y;

    combinedMesh.position.z = -1 * offset.z;
    self.combined.push(combinedMesh);
    self.add(combineMesh);*/
  };

  VIZI.BlueprintOutputChoropleth.prototype.onAdd = function(world) {
    var self = this;
    self.world = world;
    self.init();
  };

  VIZI.BlueprintOutputChoropleth.prototype.clickHandler = function(raycaster)  {
    var self = this;
    if (!self.objects) return;

    var intersects = raycaster.intersectObjects( self.objects );
	
	if ( self.current ) { self.current.object.material.color = self.currentColour; }

    for ( var i in intersects ) {
	    
		self.current = intersects[i];
		self.currentColour = intersects[i].object.material.color;
		
		intersects[i].object.material.color = self.options.highlightColour ? new THREE.Color(self.options.highlightColour) : new THREE.Color(0xffffff * Math.random());
		intersects[i].object.material.needsUpdate = true;
		
		var areaData = self.current.object.userData;
		
		VIZI.Messenger.emit("areaData", areaData);
		
	}

  };
}());
