/* globals window, _, VIZI, THREE */

/**
 * Map control class
 * https://github.com/mattzhao92/Planet-Blitz/blob/master/libs/MapControls.js
 * @author Robin Hawkes - vizicities.com
 */

(function() {
  "use strict";

  var mouse = new THREE.Vector2();

  VIZI.ControlsClick = function(camera, options) {
    var self = this;
    options = options || {};

    VIZI.Controls.call(self, camera, options);
    self.camera = camera.camera;
    //self.controls = new THREE.MapControls(camera.camera);

    document.addEventListener("mousedown", function(event) {
      event.preventDefault();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;		

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

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse,camera);
    VIZI.Messenger.emit("clickedObject", raycaster);
    //
    // //options.object = ;
    // for (var i = 0; i < world.layers.length; i++)  {
    //   var intersects = ray.intersectObjects( world.layers[i].object.children );
    //
    //   if ( intersects.length > 0 ) {
    //     //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
    //     //intersects[ 0 ].object.material.color.setHex( 0xff0000 );
    //
    //     VIZI.Messenger.emit("clickedObject", intersects[0].object.uuid);
    //
    //     //var particle = new THREE.Particle( particleMaterial );
    //     //particle.position = intersects[ 0 ].point;
    //     //particle.scale.x = particle.scale.y = 8;
    //     //self.add( particle );
    //
    //   }
    // }

  };

})();
