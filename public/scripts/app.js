// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, camera, playerMesh, npcMesh;
  var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0, fire: false}
  var inputManager = new InputManager()

  var ANGLE = Math.PI/180;
  var UP_ANGLE_MAX = -Math.PI/3;
  var DOWN_ANGLE_MAX = Math.PI/10;
  var CAM_OFFSET = 4.5;
  var ALPHA_OFFSET = Math.PI/2;
  var BETA_OFFSET = Math.PI/2;
  var RADIUS = 3;
  var SPEED = 0.25;

  var prevTime = Date.now()

  var playerStatus = {};
  var characterStatus = [];

  var HEALTH_COLOR_FULL = "#86e01e";
  var HEALTH_COLOR_HIGH = "#f2d31b";
  var HEALTH_COLOR_HALF = "#f2b01e";
  var HEALTH_COLOR_LOW = "#f27011";
  var HEALTH_COLOR_VERY_LOW = "#f63a0f";

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
        updateCharacters(data.mission.characters);
        break;
      case CONSTANTS.MESSAGE_TYPE.REMOVE:
        removeCharacter(data.character);
        break;
      default:
        break;
    }
  }

  engine.runRenderLoop(function(){
    if (scene && scene.activeCamera) {
      updateScene();
      checkForKills();
      scene.render();
    }
  });

  function removeCharacter(character) {
    scene.getMeshByName(character.id).dispose();
    // TODO remove character from arr
  }

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
    extraGround.position.y = -2.5;
    extraGround.material = extraGroundMaterial;
  }

  function createPlayers(players) {
    BABYLON.SceneLoader.ImportMesh("", "", "walk.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      playerMesh = newMeshes[0];
      playerMesh.isPickable = false;
      playerMesh.position.y = -100;
      players.forEach(function(player, index) {
        if (scene.getMeshByName(player.id)){
          var newPlayer = playerMesh.createInstance(player.id);
          newPlayer.id = player.id;
          newPlayer.name = player.name;
          newPlayer.position.x = player.position.x + index * 5 + 2;
          newPlayer.position.y = player.position.y;
          newPlayer.position.z = player.position.z;
          newPlayer.rotation = player.rotation;
        }
      });
    });
  }

  function createNPCs(npcs) {
    BABYLON.SceneLoader.ImportMesh("", "", "robot.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      npcMesh = newMeshes[0];
      npcMesh.position.y = -100;
      npcs.forEach(function(npc, index) {
        if (scene.getMeshByName(npc.id)){
          console.log("other npc", npc);
          newNPC.id = npc.id;
          newNPC.name = npc.id;
          newNPC.position.x = npc.position.x - index * 5 + 2;
          newNPC.position.y = npc.position.y;
          newNPC.position.z = npc.position.z;
          newNPC.rotation = npc.rotation;
        }
      });
    });
  }

  function createCharacters(characters) {
    var playerArr = [];
    var npcArr = [];
    characters.forEach(function (character) {
      if (character.type === CONSTANTS.CHAR_TYPE.ENEMY) {
        npcArr.push(character);
      } else if (character.type === CONSTANTS.CHAR_TYPE.PLAYER
              && character.id !== playerStatus.id) {
        playerArr.push(character);
      }
    });
    createNPCs(npcArr);
    createPlayers(playerArr);
  }

  function initFocus() {
    avatar.position.x = playerStatus.position.x;
    avatar.position.y = playerStatus.position.y;
    avatar.position.z = playerStatus.position.z;
    avatar.rotation.x = playerStatus.rotation.x;
    avatar.rotation.y = playerStatus.rotation.y;
    avatar.rotation.z = playerStatus.rotation.z;

    cameraTarget.position.x = playerStatus.position.x;
    cameraTarget.position.y = playerStatus.position.y + CAM_OFFSET;
    cameraTarget.position.z = playerStatus.position.z;
    cameraTarget.rotation.x = playerStatus.rotation.x;
    cameraTarget.rotation.y = playerStatus.rotation.y;
    cameraTarget.rotation.z = playerStatus.rotation.z;
  }


  function createAvatar() {
    BABYLON.SceneLoader.ImportMesh("", "", "walk.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      avatar = newMeshes[0];
      avatar.id = playerStatus.id;
      avatar.name = playerStatus.id;
      avatar.skeleton = skeletons[0];
      avatar.skeleton.createAnimationRange("walk", 0, 30);
      avatar.isPickable = false;

      cameraTarget = BABYLON.Mesh.CreateSphere("cameraTarget", 1, 0.1, scene);
      cameraTarget.isPickable = false;

      camera = new BABYLON.ArcRotateCamera("arcCam", ALPHA_OFFSET, BETA_OFFSET, RADIUS, cameraTarget, scene);
      scene.activeCamera = camera;

      initFocus();
    });
  }

  function castRay(){
    var origin = cameraTarget.position;

    var direction = new BABYLON.Vector3(
      -Math.sin(camera.alpha + ALPHA_OFFSET) * Math.abs(Math.cos(camera.beta - BETA_OFFSET)),
      Math.sin(camera.beta - BETA_OFFSET),
      Math.cos(camera.alpha + ALPHA_OFFSET) * Math.abs(Math.cos(camera.beta - BETA_OFFSET)));

    var length = 100;

    var ray = new BABYLON.Ray(origin, direction, length);

    var hit = scene.pickWithRay(ray);

    var msg = {
      type: CONSTANTS.MESSAGE_TYPE.FIRE,
      target: {}
    }
    if (hit.pickedMesh){
      msg.target.id = hit.pickedMesh.id;
    }
    socket.send(JSON.stringify(msg));
  }

  function createScene(characters) {
    scene = new BABYLON.Scene(engine);
    engine.enableOfflineSupport = false;
    // Changes the background color
    scene.clearColor = new BABYLON.Color3.White();
    var sun = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(60, 100, 10), scene);
    scene.enablePhysics(gravityVector, physicsPlugin);

    createSkybox();
    createGround();
    createCharacters(characters);
    createAvatar();

    return scene;
  }

  function updateCharacters(characters) {
    characterStatus = [];
    characters.forEach(function(character, index) {
      characterStatus.push(new Character(character));
      if (character.id !== playerStatus.id) {
        if (scene.getMeshByName(character.id)){
          scene.getMeshByName(character.id).position = character.position;
          scene.getMeshByName(character.id).rotation = character.rotation;
        } else {
          if (character.type === CONSTANTS.CHAR_TYPE.ENEMY && npcMesh) {
            var newNPC = npcMesh.createInstance(character.id);
            newNPC.id = character.id;
            newNPC.name = character.id;
            newNPC.position = character.position;
            newNPC.rotation = character.rotation;
          } else if (character.type === CONSTANTS.CHAR_TYPE.PLAYER && playerMesh) {
            var newPlayer = playerMesh.createInstance(character.id);
            newPlayer.id = character.id;
            newPlayer.name = character.id;
            newPlayer.position = character.position;
            newPlayer.rotation = character.rotation;
          }
        }
      } else {
        var healthPercent = Math.round((character.currentHealth / character.totalHealth) * 100);
        var health = document.getElementById("health-bar");
        health.style.width = healthPercent + "%";
        if (healthPercent >= 80) {
          health.style.backgroundColor = HEALTH_COLOR_FULL;
        } else if (healthPercent >= 60) {
          health.style.backgroundColor = HEALTH_COLOR_HIGH;
        } else if (healthPercent >= 40) {
          health.style.backgroundColor = HEALTH_COLOR_HALF;
        } else if (healthPercent >= 20) {
          health.style.backgroundColor = HEALTH_COLOR_LOW;
        } else {
          health.style.backgroundColor = HEALTH_COLOR_VERY_LOW;
        }
      }
    });
  }

  function checkForKills(){
    if (player.fire) {
      castRay();
    }
  }

  function updatePlayerOrientation() {
      // playerStatus.rotation.y += player.rotationY;
      // player.rotationY = 0;
      playerStatus.rotation.y += player.rotYSpeed * scene.getAnimationRatio();
      playerStatus.rotation.y = playerStatus.rotation.y % (2 * Math.PI);
      avatar.rotation.y = playerStatus.rotation.y;
      cameraTarget.rotation.y = playerStatus.rotation.y;
      camera.alpha = - (playerStatus.rotation.y + ALPHA_OFFSET);

      // // rotation on x-axis
      // camera.beta -= player.rotationX;
      // player.rotationX = 0;
      camera.beta -= player.rotXSpeed * scene.getAnimationRatio();

      // move forward/backward
      playerStatus.position.x -= player.fwdSpeed * Math.sin(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
      playerStatus.position.z -= player.fwdSpeed * Math.cos(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();

      // move left/right
      playerStatus.position.x -= player.sideSpeed * -Math.cos(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
      playerStatus.position.z -= player.sideSpeed * Math.sin(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();

      avatar.position.x = playerStatus.position.x;
      avatar.position.z = playerStatus.position.z;
      cameraTarget.position.x = playerStatus.position.x;
      cameraTarget.position.z = playerStatus.position.z;
  }

  function sendPlayerState() {
    if( playerStatus && socket.readyState === socket.OPEN ) {
      var msg = {
        type: CONSTANTS.MESSAGE_TYPE.UPDATE,
        player: player
      };
      msg.player.position = playerStatus.position;
      msg.player.rotation = playerStatus.rotation;
      msg.player.id = playerStatus.id;
      msg.player.fwdSpeed = player.fwdSpeed
      msg.player.sideSpeed = player.sideSpeed

      // Send the msg object as a JSON-formatted string.
      socket.send(JSON.stringify(msg));
    }
  }

  function updateCharacterOriendtation() {
    characterStatus.forEach(function(character) {
      if (character.id !== playerStatus.id) {
        var char = scene.getMeshByName(character.id);
          if (char) {
            char.rotation.y += character.rotYSpeed * scene.getAnimationRatio();
            char.position.x += character.fwdSpeed * Math.sin(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.z += character.fwdSpeed * Math.cos(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.x += character.sideSpeed * -Math.cos(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.z += character.sideSpeed * Math.sin(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
          }
        }
    });
  }

  function updateScene() {
    if (scene && scene.getAnimationRatio()) {
      var nowTime = Date.now()
      var dt = nowTime - prevTime
      prevTime = nowTime

      updatePlayerOrientation();
      updateCharacterOriendtation();
      sendPlayerState();
    }
  }

  window.addEventListener("resize", function() {
    engine.resize();
  })

  canvas.addEventListener("click", function() {
    canvas.requestPointerLock()
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
          case "W":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fwdSpeed = SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.fwdSpeed = 0
            }
            break;
          case "s":
          case "S":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fwdSpeed = -(SPEED)
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.fwdSpeed = 0
            }
            break;
          case "a":
          case "A":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.sideSpeed = SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.sideSpeed = 0
            }
            break;
          case "d":
          case "D":
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
          case " ":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fire = true;
            } else if (type === "keyup") {
              this.isPressed[event.key] = false;
              player.fire = false;
            }
            break;
          } // end of switch statement
        }
      } // end of process method
  } // end of InputManager class
}