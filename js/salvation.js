/**
 * Notes:
 * - Coordinates are specified as (X, Y, Z) where X and Z are horizontal and Y
 *   is vertical
 */

 

var map = [ 
		 // 1  2  3  4  5  6  7  8  9  10 11
		   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 1
           [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1,], // 2
           [1, 1, 0, 0, 2, 2, 0, 0, 0, 1, 1,], // 3
           [1, 0, 0, 0, 2, 2, 2, 0, 0, 1, 1,], // 4
           [1, 0, 2, 2, 0, 0, 2, 2, 0, 1, 1,], // 5
           [1, 0, 0, 0, 2, 0, 2, 0, 0, 1, 1,], // 6
           [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1,], // 7
           [1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1,], // 9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 10
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 11
           ],mapW = map.length, mapH = map[0].length;
           
           



// Semi-constants
var WIDTH = window.outerWidth,
	HEIGHT = window.outerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 360,
	WALLHEIGHT = 125,
	MOVESPEED = 170,
 	LOOKSPEED = 0.100,
	BULLETSPEED = MOVESPEED * 20,
	BULLETMOVESPEED = MOVESPEED * 10,
	NUMAI = 5,
	PROJECTILEDAMAGE = 90;

// Global vars
var t = THREE, scene, cam, renderer, geometry, mesh, controls, clock, projector, composer, skin, world, mass, body;

var runAnim = true, mouse = { x: 5, y: 5 }, kills = 0; lives = 3; health = 150;  
var healthCube, lastHealthPickup = 0;
var gameSounds = new WebAudiox.GameSounds();
var velocity = new THREE.Vector3();
var vy = 0, vx = 0, loaded = 0, gravity = 1.0, rise = 0.2, eSpeed =0.6;
var jumping = false, inAir = true, falling = false; 
var falling = false;
 
// Initialize and run on document ready
$(document).ready(function() {
	$('body').append('<div id="intro">Welcome Username<br /><br />Click here to start your mission!</div>');
	$('body').append('<div id="current_highscore">Highscore: 0</div>');
	$('#intro').css({width: WIDTH, height: HEIGHT}).one('click', function(e) {
		e.preventDefault();
		$(this).fadeOut();
		init();
		setInterval(drawRadar, 1000);
		animate();
	});
	 
});

	

// Setup
function init() {
	clock = new t.Clock(); // Used in render() for controls.update()
	projector = new t.Projector(); // Used in bullet projection
	scene = new t.Scene(); // Holds all objects in the canvas
	scene.fog = new t.FogExp2(0xD6F1FF, 0.00015); // color, density

	
	// Set up camera
	cam = new t.PerspectiveCamera(70, ASPECT, 1, 10000); // FOV, aspect, near, far
	cam.position.y = UNITSIZE * 0.2;
	scene.add(cam);
	
	// Camera moves with mouse, flies around with WASD/arrow keys
	controls = new t.FirstPersonControls(cam);
	controls.movementSpeed = MOVESPEED;
	controls.lookSpeed = LOOKSPEED;
	controls.lookVertical = false; // Temporary solution; play on flat surfaces only
	controls.verticalMin = 1.0;
    controls.verticalMax = 2.0;
	controls.noFly = true;


	// World objects
	setupScene();
	
	// Artificial Intelligence
	setupAI();
	 
	
	// Handle drawing as WebGL (faster than Canvas but less supported)
	renderer = new t.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	

	// Add the canvas to the document
	renderer.domElement.style.backgroundImage = "url('images/sky.jpg')"; // easier to see
	document.body.appendChild(renderer.domElement);
	
	// Track mouse position so we know where to shoot
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	
	// Shoot on click
	$(document).click(function(e) {
		e.preventDefault;
		if (e.which === 1) { // Left click only
			createBullet();
			//Load sound and play it as bullets are fired.
			WebAudiox.loadBuffer(context, 'audio/laser.ogg', function(buffer){
        	// init AudioBufferSourceNode
        	var source = context.createBufferSource();
        	source.buffer = buffer;
        	source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
		}
	});
	
	function render() {
        renderer.clear();
            composer.render(0.01);
   }

	// Display HUD
	$('body').append('<canvas id="radar" width="185" height="185"></canvas>');
	$('body').append('<div id="hud"><p>Player: <span id="username"></span><br />Health: <span id="health">150</span><br />Lives: <span id="lives">3</span><br />Score: <span id="score">0</span></p></div>');
	$('body').append('<div id="credits"><span id="hstext">Salvation: Created by Juan Anthony Crespo. WASD keys to move, mouse to look, click to shoot. P to pause the game, click Cancel to unpause. Space bar for thrusters.</span></div>');
	$('body').append('<div id="radar_button" class="btn btn-warning">Radar</div><div id="thrust"><image src="images/thrust.png" /></div>');
	$('body').append('<div id="dir"><image src="images/rsz_gunmodel.png" /></div>');

	  


	// Set up "hurt" flash
	$('body').append('<div id="hurt"></div>');
	$('#hurt').css({width: WIDTH, height: HEIGHT,});
 }


// Helper function for browser frames
function animate() {
	if (runAnim) {
		requestAnimationFrame(animate);
	}
	render();
}

// Update and display
function render() {
	var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
	var aispeed = delta * MOVESPEED;
	controls.update(delta); // Move camera

	 
	// Rotate the health cube
	healthcube.rotation.x += 0.002;
	healthcube.rotation.y += 0.006;
	// Allow picking it up once per minute
	if (Date.now() > lastHealthPickup + 60000) {
		if (distance(cam.position.x, cam.position.z, healthcube.position.x, healthcube.position.z) < 10 && health != 100) {
			//Load sound and play it as bullets are fired.
			WebAudiox.loadBuffer(context, 'audio/power_up.mp3', function(buffer){
        	// init AudioBufferSourceNode
        	var source = context.createBufferSource();
        	source.buffer = buffer;
        	source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
			health = Math.min(health + 60, 150);
			$('#health').html(health);
			lastHealthPickup = Date.now();
		}
		healthcube.material.wireframe = false;
	}
	else {
		healthcube.material.wireframe = true;
	}



	// Update bullets. Walk backwards through the list so we can remove items.
	for (var i = bullets.length-1; i >= 0; i--) {
		
		var b = bullets[i], BULLETSPEED, p = b.position, d = b.ray.direction;
		if (checkWallCollision(p)) {
			bullets.splice(i, 1);
			scene.remove(b);
			continue;
		}
		// Collide with AI
		var hit = false;

		for (var j = ai.length-1; j >= 0; j--) {
			
			var a = ai[j];
			var v = a.geometry.vertices[0];
			var c = a.position;
			var x = Math.abs(v.x), z = Math.abs(v.z);
			//console.log(Math.round(p.x), Math.round(p.z), c.x, c.z, x, z);
			if (p.x < c.x + x && p.x > c.x - x &&
					p.z < c.z + z && p.z > c.z - z &&
					b.owner != a) {
				bullets.splice(i, 1);
				scene.remove(b);
				a.health -= PROJECTILEDAMAGE;
				var color = a.material.color, percent = a.health / 100;
				a.material.color.setRGB(
						percent * color.r,
						percent * color.g,
						percent * color.b
				);
				hit = true;
				break;
			}
		}
		// Bullet hits player
		if (distance(p.x, p.z, cam.position.x, cam.position.z) < 25 && b.owner != cam) {
			// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/damage.mp3', function(buffer){
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
			$('#hurt').fadeIn(75);
			health -= 10;
			if (health < 0) health = 0;
			val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
			$('#health').html(val);
			bullets.splice(i, 1);
			scene.remove(b);
			$('#hurt').fadeOut(360);
		}
		if (!hit) {
			b.translateX(speed * d.x);
			//bullets[i].translateY(speed * bullets[i].direction.y);
			b.translateZ(speed * d.z);
		}
	}


	
	// Update AI.
	for (var i = ai.length-1; i >= 0; i--) {
		var a = ai[i];
		if (a.health <= 0) {
			ai.splice(i, 1);
			scene.remove(a);
		// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/grenade.mp3', function(buffer){

        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);

        //Ai Death results in explosion effect
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
  
  scene.add( this.object  ); 
  
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

				renderer.render( scene, cam );

			}
	
        
    });
    	



			kills++;

			var score = kills * 100;
			$('#score').html(score);
			$('#highscore').html(score);
		
			addAI();

			//Bonus life after every 1500 points
    	if (score % 500 === 0) {

     		$('#lives').html(lives = lives + 1);
      		$('#intro').fadeIn();
 			$('#intro').html('Earned Bonus!');
			$('#intro').fadeOut();
 
		// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/bonus.mp3', function(buffer){
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);

 		});
 		 
     }
		}
		// Move AI
		var r = Math.random();
		if (r > 0.995) {
			// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/drone.mp3', function(buffer){
        // init AudioBufferSourceNode
        var source  = context.createBufferSource();
        source.buffer   = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
			a.lastRandomX = Math.random() * 2 - 1;
			a.lastRandomZ = Math.random() * 2 - 1;
		}
		a.translateX(aispeed * a.lastRandomX);
		a.translateZ(aispeed * a.lastRandomZ);
		var c = getMapSector(a.position);
		if (c.x < 0 || c.x >= mapW || c.y < 0 || c.y >= mapH || checkWallCollision(a.position)) {
			a.translateX(-2 * aispeed * a.lastRandomX);
			a.translateZ(-2 * aispeed * a.lastRandomZ);
			a.lastRandomX = Math.random() * 2 - 1;
			a.lastRandomZ = Math.random() * 2 - 1;
		}
		if (c.x < -1 || c.x > mapW || c.z < -1 || c.z > mapH) {
			ai.splice(i, 1);
			scene.remove(a);
			addAI();
		}
		 
		var cc = getMapSector(cam.position);
		if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2) {
			createBullet(a);
			a.lastShot = Date.now();
		}
	}

	renderer.render(scene, cam); // Repaint

	//Added lives count
	if (health <= 0) {

		$('#lives').html(lives=lives - 1);
		$(renderer.domElement).fadeOut(500);
		$(renderer.domElement).fadeIn(500);
 		health = 150;
		$('#health').html(health);
		 

		// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/respawn.mp3', function(buffer){
        // init AudioBufferSourceNode
        var source  = context.createBufferSource();
        source.buffer   = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);

 	});

	}

	// Player death
	if (health && lives === 0) {

		// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/death_sound.mp3', function(buffer){
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);


 	});


		runAnim = false;
		$(renderer.domElement).fadeOut();
		$('#radar, #radar_button, #health, #maktopmenu, #thrust').fadeOut();
		$('#intro').fadeIn();
 		$('#intro').html('Mission Failure: Click here to launch Again!');
		$('#intro').one('click', function() {
			location = location;
			 
			 
		});

	}
}


// Set up the objects in the world
function setupScene() {
	var UNITSIZE = 360, units = mapW;

	// Geometry: floor
	var floor = new t.Mesh(
			new t.CubeGeometry(units * UNITSIZE, 50, units * UNITSIZE),
			new t.MeshLambertMaterial({map: t.ImageUtils.loadTexture('images/floor-1.jpg')})
	);
	scene.add(floor);
	

	// Geometry: walls
	var cube = new t.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
	var materials = [
	                 new t.MeshLambertMaterial({/*color: 0x00CCAA,*/map: t.ImageUtils.loadTexture('images/bloody_wall.jpg')}),
	                 new t.MeshLambertMaterial({/*color: 0xC5EDA0,*/map: t.ImageUtils.loadTexture('images/earth.jpg')}),
	                 new t.MeshLambertMaterial({color: 0xFBEBCD}),
	                 ];

	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {

			if (map[i][j]) {	

				var wall = new t.Mesh(cube, materials[map[i][j]-1]);
				wall.position.x = (i - units/2) * UNITSIZE;
				wall.position.y = WALLHEIGHT/2;
				wall.position.z = (j - units/2) * UNITSIZE;
				scene.add(wall);

			}

		
		}
	}



	mesh = new THREE.Mesh( cube, materials, wall );
          scene.add( mesh );

	// Health cube
	healthcube = new t.Mesh(
			new t.SphereGeometry(30, 182, 182),
			new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/bubble.png')})
	);
	healthcube.position.set(-UNITSIZE-15, 60, -UNITSIZE-15);
	scene.add(healthcube);
	
	// Lighting
	var directionalLight1 = new t.DirectionalLight( 0xC9CCC1, 0.9 );
	directionalLight1.position.set( 0.7, 1, 0.7 );
	scene.add( directionalLight1 );
	var directionalLight2 = new t.DirectionalLight( 0xC9CCC1, 0.7 );
	directionalLight2.position.set( -0.7, -1, -0.7 );
	scene.add( directionalLight2 );
}



var ai = [];
var aiGeo = new t.CubeGeometry(30, 40, 40);
function setupAI() {
	for (var i = 0; i < NUMAI; i++) {
		addAI();
	}
}

function addAI() {
	var c = getMapSector(cam.position);
	var aiMaterial = new t.MeshBasicMaterial({/*color: 0xEE3333,*/map: t.ImageUtils.loadTexture('images/flaming_skull.png')});
	var o = new t.Mesh(aiGeo, aiMaterial);
	do {
		var x = getRandBetween(0, mapW-1);
		var z = getRandBetween(0, mapH-1);
	} while (map[x][z] > 0 || (x == c.x && z == c.z));
	x = Math.floor(x - mapW/2) * UNITSIZE;
	z = Math.floor(z - mapW/2) * UNITSIZE;
	o.position.set(x, UNITSIZE * 0.15, z);
	o.health = 100;
	//o.path = getAIpath(o);
	o.pathPos = 1;
	o.lastRandomX = Math.random();
	o.lastRandomZ = Math.random();
	o.lastShot = Date.now(); // Higher-fidelity timers aren't a big deal here.
	ai.push(o);
	scene.add(o);
}

function getAIpath(a) {
	var p = getMapSector(a.position);
	do { // Cop-out
		do {
			var x = getRandBetween(0, mapW-1);
			var z = getRandBetween(0, mapH-1);
		} while (map[x][z] > 0 || distance(p.x, p.z, x, z) < 3);
		var path = findAIpath(p.x, p.z, x, z);
	} while (path.length === 0);
	return path;
}
	

/**
 * Find a path from one grid cell to another.
 *
 * @param sX
 *   Starting grid x-coordinate.
 * @param sZ
 *   Starting grid z-coordinate.
 * @param eX
 *   Ending grid x-coordinate.
 * @param eZ
 *   Ending grid z-coordinate.
 * @returns
 *   An array of coordinates including the start and end positions representing
 *   the path from the starting cell to the ending cell.
 */
  
function findAIpath(sX, sZ, eX, eZ) {
	var backupGrid = grid.clone();
	var path = finder.findPath(sX, sZ, eX, eZ, grid);
	grid = backupGrid;
	return path;
}
 

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function getMapSector(v) {
	var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW/2);
	var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW/2);
	return {x: x, z: z};
}

/**
 * Check whether a Vector3 overlaps with a wall.
 *
 * @param v
 *   A THREE.Vector3 object representing a point in space.
 *   Passing cam.position is especially useful.
 * @returns {Boolean}
 *   true if the vector is inside a wall; false otherwise.
 */
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] > 0;
}

// Radar
function drawRadar() {
	var c = getMapSector(cam.position), context = document.getElementById('radar').getContext('2d');
	context.font = '10px Helvetica';
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			var d = 0;
			for (var k = 0, n = ai.length; k < n; k++) {
				var e = getMapSector(ai[k].position);
				if (i == e.x && j == e.z) {
					d++;
				}
			}
			if (i == c.x && j == c.z && d === 0) {
				context.fillStyle = '#0000FF';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
			}
			else if (i == c.x && j == c.z) {
				context.fillStyle = '#AA33FF';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
				context.fillStyle = '#000000';
				context.fillText(''+d, i*20+8, j*20+12);
			}
			else if (d > 0 && d < 10) {
				context.fillStyle = '#FF0000';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
				context.fillStyle = '#000000';
				context.fillText(''+d, i*20+8, j*20+12);
			}
			else if (map[i][j] > 0) {
				context.fillStyle = '#D0EAF2';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
			}
			else {
				context.fillStyle = '#DBB725';
				context.fillRect(i * 20, j * 20, (i+1)*20, (j+1)*20);
			}
		}
	}
}

var bullets = [];
var sphereMaterial = new t.MeshBasicMaterial({color: 0x68DE8E});
var sphereGeo = new t.SphereGeometry(2, 5, 5);
function createBullet(obj) {
	if (obj === undefined) {
		obj = cam;
	}
	var sphere = new t.Mesh(sphereGeo, sphereMaterial);
	sphere.position.set(obj.position.x, obj.position.y * 0.8, obj.position.z);

	if (obj instanceof t.Camera) {
		var vector = new t.Vector3(mouse.x, mouse.y, 1);
		projector.unprojectVector(vector, obj);
		sphere.ray = new t.Ray(
				obj.position,
				vector.subSelf(obj.position).normalize()
		);
	}
	else {
		var vector = cam.position.clone();
		sphere.ray = new t.Ray(
				obj.position,
				vector.subSelf(obj.position).normalize()
		);
	}
	sphere.owner = obj;
	
	bullets.push(sphere);
	scene.add(sphere);
	
	return sphere;
}




function loadImage(path) {
	var image = document.createElement('img');
	var texture = new t.Texture(image, t.UVMapping);
	image.onload = function() { texture.needsUpdate = true; };
	img.crossOrigin = '';
	image.src = path;
	return texture;
}

 
function onDocumentMouseMove(e) {
	e.preventDefault();
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;
}
 

// Handle window resizing
$(window).resize(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	ASPECT = WIDTH / HEIGHT;
	if (cam) {
		cam.aspect = ASPECT;
		cam.updateProjectionMatrix();
	}
	if (renderer) {
		renderer.setSize(WIDTH, HEIGHT);
	}
	$('#intro, #hurt').css({width: WIDTH, height: HEIGHT,});
});


//Pauses Game with onpress event with 'p' key
$(window).bind('keydown', 'p', function() {confirm('Game Paused!'); });

//Thrusters
$(window).bind('keydown', 'SPACE', function jump() {
 				
 	$('#thrust').css('opacity', '0.6');
 	$('#thrust').css('background-color', 'red');


 		// load a sound and play it immediatly
    	WebAudiox.loadBuffer(context, 'audio/thrusters.mp3', function(buffer){
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);

 		});
    			controls.movementSpeed = MOVESPEED - 100;

 				cam.position.y += 60; 
           		vy = -5;
            	jumping = true; 

            	if (cam.position.y >= UNITSIZE * .50) {
      
        			$('#thrust').css('opacity', '1');
        			$('#thrust').css('background-color', '#ffffff');


            		controls.movementSpeed = MOVESPEED;
					cam.position.y = UNITSIZE * .2;
        
    }
            	 
   });


//Get a random integer between lo and hi, inclusive.
//Assumes lo and hi are integers and lo is lower than hi.
function getRandBetween(lo, hi) {
 return parseInt(Math.floor(Math.random()*(hi-lo+1))+lo, 10);
}
