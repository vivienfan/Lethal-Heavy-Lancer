// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, camera;
  var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
  var npm = [];
  var inputManager = new InputManager()

  var ANGLE = Math.PI/180;
  var UP_ANGLE_MAX = -Math.PI/3
  var DOWN_ANGLE_MAX =  Math.PI/10;
  var CAM_OFFSET = 5;
  var SPEED = 2;

  var playerStatus;

  socket.onopen = function (event) {
    console.log('connected to server');
  }

  socket.onmessage = (event) => {
    var data = JSON.parse(event.data);
    switch(data.type) {
      case CONSTANTS.MESSAGE_TYPE.PLAYER_INFO:
        initWorld(data.data, data.mission);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_STATE:
        updateScene(data.mission.characters);
        break;
      default:
        break;
    }
  }

  engine.runRenderLoop(function(){
    if (scene && scene.activeCamera) {
      updateScene();
      scene.render();
    }
  });

  function initWorld(player, mission) {
    playerStatus = new Player(player, mission);
    createScene(mission.characters);
  }

  function createSkybox() {
    // Create skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("CNTower/", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
  }

  function createGround() {
    // Create ground
    var extraGround = BABYLON.Mesh.CreateGround("extraGround", 1000, 1000, 1, scene, false);
    var extraGroundMaterial = new BABYLON.StandardMaterial("extraGround", scene);
    extraGroundMaterial.diffuseTexture = new BABYLON.Texture("ground.jpg", scene);
    extraGroundMaterial.diffuseTexture.uScale = 60;
    extraGroundMaterial.diffuseTexture.vScale = 60;
    extraGround.position.y = -2.05;
    extraGround.material = extraGroundMaterial;
  }

  function createCharacters(characters) {
    console.log("here we create characters:", characters);
    characters.forEach(function (character) {
      if (character.id !== playerStatus.id) {
        switch(character.type) {
          case CONSTANTS.CHAR_TYPE.ENEMY:
            var enemy = BABYLON.MeshBuilder.CreateTorusKnot(character.id, {}, scene);
            break;
          case CONSTANTS.CHAR_TYPE.PLAYER:
            var ally = BABYLON.MeshBuilder.CreateCylinder(character.id, {diameterTop: 0, tessellation: 4}, scene);
            break;
        }
      }
    });
    console.log(scene.meshes);
  }

  function createAvatar() {
    camera = new BABYLON.FollowCamera("followCam", BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;
  }

  function createScene(characters) {
    scene = new BABYLON.Scene(engine);
    // Changes the background color
    scene.clearColor = new BABYLON.Color3.White();
    var sun = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(60, 100, 10), scene);
    scene.enablePhysics(gravityVector, physicsPlugin);

    createSkybox();
    createGround();
    createCharacters(characters);
    createAvatar();
  }

  function updateCharacters(characters) {
    characters.forEach(function(character) {
      if (character.id !== playerStatus.id) {
        scene.getMeshByName(character.id).position = character.position;
      }
    });
  }

  function updateScene(characters) {
    if ( characters ){
      updateCharacters(characters);
    }
    if (scene && scene.getAnimationRatio()) {
      camera.rotation.y += player.rotationY
      camera.rotation.y += player.rotYSpeed * scene.getAnimationRatio()
      player.rotationY = 0
      camera.rotation.x += player.rotationX
      camera.rotation.x += player.rotXSpeed * scene.getAnimationRatio()
      camera.rotation.x = Math.min(Math.max(camera.rotation.x, UP_ANGLE_MAX), DOWN_ANGLE_MAX)
      player.rotationX = 0
      camera.position.x -= player.fwdSpeed * Math.sin(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
      camera.position.z -= player.fwdSpeed * Math.cos(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
      camera.position.x -= player.sideSpeed * -Math.cos(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
      camera.position.z -= player.sideSpeed * Math.sin(camera.rotation.y + Math.PI) * scene.getAnimationRatio();

    }
  }

  window.addEventListener("resize", function() {
    engine.resize();
  })

  canvas.addEventListener("click", function() {
    canvas.requestPointerLock()
    console.log("pointer should be locked")
  })

  canvas.addEventListener("mousemove", function(event) {
    inputManager.process("mousemove", event)
  })

  window.addEventListener("keyup", function(event) {
    inputManager.process("keyup", event)
  })

  window.addEventListener("keydown", function(event) {
    inputManager.process("keydown", event)
  });

  function InputManager() {

    this.isPressed = {}
    this.lastY = 0

    this.process = function(type, event) {
      // we want to update mousemove directly, as it is a direct relation to how far user moved mouse
      if ( type === "mousemove" ) {
        // player.rotationY += event.movementX * ANGLE
        // player.rotationX += event.movementY * ANGLE
      } else {
        // otherwise, it is a key input. From here, determine the key, modify the relevant speed, and
        // apply, so it can be used on the next update call. Allows smooth movement independent of framerate
        // and input frequency
        switch ( event.key ) {
          case "w":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fwdSpeed = SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.fwdSpeed = 0
            }
            break;
          case "s":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fwdSpeed = -(SPEED)
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.fwdSpeed = 0
            }
            break;
          case "a":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.sideSpeed = SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.sideSpeed = 0
            }
            break;
          case "d":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.sideSpeed = -SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.sideSpeed = 0
            }
            break;
          case "ArrowRight":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotYSpeed = ANGLE
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotYSpeed = 0
            }
            break;
          case "ArrowLeft":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotYSpeed = -(ANGLE)
              // console.log("Set rotspeed")
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotYSpeed = 0
            }
            break;
          case "ArrowUp":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotXSpeed = -(ANGLE)
              // console.log("Set rotspeed")
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotXSpeed = 0
            }
            break;
          case "ArrowDown":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotXSpeed = ANGLE
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotXSpeed = 0
            }
            break;
          } // end of switch statement
        }
      } // end of process method
  } // end of InputManager class

}
