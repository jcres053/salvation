# Salvation(Beta) 

A browser-based, First-Person Shooter game which uses the IcreamYou gaming framework (https://github.com/IceCreamYou/Nemesis) along with the latest Three.js library and WebGL rendering components. Use the 'WASD' keys to move, mouse to look around, left mouse click button to shoot. Hit F11 to go full screen, 'p' key to pause(click cancel to unpause). Mouse recommended.

Key Changes and Additions

 -Added new textures and skybox, changed FOV, increased walking speed for both player and AI, bullet speed and damage for both player and AI, increased health and added a lives count and bonus lives based on conditional requirement.
 
-Changed Health Cube to Sphere and altered the values making it easier to pick up along with increassing the health bonus.
 
-Added thrusters (Space bar) for additional mobility options.
 
-Added additional elements to the canvas, radar and HUD including player name and highscore.
 
-Used WebAudioX.js library to add sound effects.
 
-Added code to simulate an explosion after an enemy AI death using particle effects.
 
-Added Mono0x jquery keybind plugin to simulate pause effect using 'p' key and confirm' function.
 
-Goals moving forward: Adding a simple jumping mechanic along with implementing collision detection for the wall textures. Using Firebase to create a database for player scores and append the updated highscore back to the DOM of the index.html and salvtiongame.html files.
