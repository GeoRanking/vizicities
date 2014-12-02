/* globals window, _, VIZI, THREE */

/**
 * Map control class
 * https://github.com/mattzhao92/Planet-Blitz/blob/master/libs/MapControls.js
 * @author Robin Hawkes - vizicities.com
 */

(function() {
  "use strict";
  VIZI.ControlsClick = function(camera, options) {
    var self = this;
    options = options || {};

    VIZI.Controls.call(self, camera, options);
    self.camera = camera.camera;
    //self.controls = new THREE.MapControls(camera.camera);

    document.addEventListener("mousedown", function(event) {
      event.preventDefault();
      self.onMouseDown();
    });
  };

  VIZI.ControlsClick.prototype = Object.create( VIZI.Controls.prototype );

  // Based on http://stackoverflow.com/a/7984767
  VIZI.ControlsClick.prototype.onMouseDown = function(options) {
    var self = this;
    console.log("MOUSE DOWN");

    options = options || {};
    var camera = self.camera;

    var vector = new THREE.Vector3(
        ( event.clientX / window.innerWidth ) * 2 - 1,
        - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5
    );

    vector.unproject(camera);

    var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
    //options.object = world.layers[2].object.children;
    var intersects = ray.intersectObjects( options.object );

    if ( intersects.length > 0 ) {
	console.log("INTERSECT FOUND");
      //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
      intersects[ 0 ].object.material.color.setHex( 0xff0000 );

      //var particle = new THREE.Particle( particleMaterial );
      //particle.position = intersects[ 0 ].point;
      //particle.scale.x = particle.scale.y = 8;
      //self.add( particle );

    }

  };

})();
