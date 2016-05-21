//////////////settings/////////
var movementSpeed = 60;
var totalObjects = 3000;
var objectSize = 12;
var sizeRandomness = 4000;
var colors = 0x380205;
/////////////////////////////////
var dirs = [];
var parts = [];
var container = document.createElement('div');
document.body.appendChild(container);

function ExplodeAnimation(x,y)
{
  var geometry = new THREE.Geometry();
  
  for (i = 0; i < totalObjects; i ++) 
  { 
    var vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = 0;
  
    geometry.vertices.push( vertex );
    dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
  }
  var material = new THREE.ParticleBasicMaterial( { size: objectSize,  color: colors });
  var particles = new THREE.ParticleSystem( geometry, material );
  
  this.object = particles;
  this.status = true;
  
  this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  
  scene.add( this.object ); 
  
  this.update = function(){
    if (this.status === true){
      var pCount = totalObjects;
      while(pCount--) {
        var particle =  this.object.geometry.vertices[pCount];
        particle.y += dirs[pCount].y;
        particle.x += dirs[pCount].x;
        particle.z += dirs[pCount].z;
      }
      this.object.geometry.verticesNeedUpdate = true;
    }
  };
  
}

parts.push(new ExplodeAnimation(0, 0));
render();

      function render() {
        requestAnimationFrame( render );
         
        var pCount = parts.length;
          while(pCount--) {
            parts[pCount].update();
          }

        renderer.render( scene, camera );

      }
