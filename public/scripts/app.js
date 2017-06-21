// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  engine.displayLoadingUI();

  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, camera, playerMesh, npcMesh, extraGround, skybox;
  var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
  var inputManager = new InputManager()

  var healthBar = document.getElementById("health-bar");
  var health = document.getElementById("health");

  var ANGLE = Math.PI/180;
  var UP_ANGLE_MAX = -Math.PI/3;
  var DOWN_ANGLE_MAX = Math.PI/10;
  var CAM_OFFSET = 4.5;
  var ALPHA_OFFSET = Math.PI/2;
  var BETA_OFFSET = Math.PI/2;
  var RADIUS = 3;
  var SPEED = 0.5;

  var prevTime = Date.now()

  var playerStatus = {};
  var characterStatus = [];

  var HEALTH_COLOR_FULL = "#86e01e";
  var HEALTH_COLOR_HIGH = "#f2d31b";
  var HEALTH_COLOR_HALF = "#f2b01e";
  var HEALTH_COLOR_LOW = "#f27011";
  var HEALTH_COLOR_VERY_LOW = "#f63a0f";

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
      //checkForKills();
      scene.render();
    }
  });

  function initWorld(player, mission) {
    playerStatus = new Player(player, mission);
    createScene(mission.characters);
  }

  function createScene(characters) {
    scene = new BABYLON.Scene(engine);
    engine.enableOfflineSupport = false;

    createSkybox();
    createSun();
    createGround();
    createCharacters(characters);
    createAvatar();

    health.classList.remove("hide");
    engine.hideLoadingUI();
    return scene;
  }

  function createSkybox() {
    // Create skybox
    skybox = BABYLON.Mesh.CreateBox("skyBox", 1000, scene);
    skybox.isPickable = false;

    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;

    // texture
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/texture/moon/", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // removing all light reflections
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    skybox.material = skyboxMaterial;

    // skybox follow camera position
    skybox.infiniteDistance = true;
  }

  function createSun() {
    var sun = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(20, 100, 20), scene);
    sun.diffuse = new BABYLON.Color3(1, 1, 1);
    sun.specular = new BABYLON.Color3(1, 1, 1);
    sun.groundColor = new BABYLON.Color3(0, 0, 0);
  }

  function createGround() {
    extraGround = BABYLON.Mesh.CreateGround("extraGround", 1500, 1500, 1, scene, false);
    extraGround.position.y = -3;
    extraGround.isPickable = false;

    var mirrorMaterial = new BABYLON.StandardMaterial("mat", scene);
    mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirror", 512, scene, true);
    mirrorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -7, 0, -10.0);
    mirrorMaterial.reflectionTexture.renderList.push(skybox);
    mirrorMaterial.reflectionTexture.level = 0.6;
    // removing all light reflections
    mirrorMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    mirrorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    extraGround.material = mirrorMaterial;
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
          extraGround.material.reflectionTexture.renderList.push(newNPC);
        }
      });
    });
  }

  function createPlayers(players) {
    BABYLON.SceneLoader.ImportMesh("", "", "walk.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      playerMesh = newMeshes[0];
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
          newPlayer.isPickable = false;
          extraGround.material.reflectionTexture.renderList.push(newPlayer);
        }
      });
    });
  }

  function createAvatar() {
    BABYLON.SceneLoader.ImportMesh("", "", "walk.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      avatar = newMeshes[0];
      avatar.id = playerStatus.id;
      avatar.name = playerStatus.id;
      avatar.isPickable = false;
      extraGround.material.reflectionTexture.renderList.push(avatar);

      cameraTarget = BABYLON.Mesh.CreateSphere("cameraTarget", 1, 0.1, scene);
      cameraTarget.isPickable = false;
      initFocus();

      camera = new BABYLON.ArcRotateCamera("arcCam", ALPHA_OFFSET, BETA_OFFSET, RADIUS, cameraTarget, scene);
      camera.lowerBetaLimit = Math.PI / 3;
      camera.upperBetaLimit = (5 * Math.PI) / 6;
      scene.activeCamera = camera;
    });
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
            extraGround.material.reflectionTexture.renderList.push(newNPC);
          } else if (character.type === CONSTANTS.CHAR_TYPE.PLAYER && playerMesh) {
            var newPlayer = playerMesh.createInstance(character.id);
            newPlayer.id = character.id;
            newPlayer.name = character.id;
            newPlayer.position = character.position;
            newPlayer.rotation = character.rotation;
            newPlayer.isPickable = false;
            extraGround.material.reflectionTexture.renderList.push(newPlayer);
          }
        }
      } else {
        var healthPercent = Math.round((character.currentHealth / character.totalHealth) * 100);
        healthBar.style.width = healthPercent + "%";
        if (healthPercent >= 80) {
          healthBar.style.backgroundColor = HEALTH_COLOR_FULL;
        } else if (healthPercent >= 60) {
          healthBar.style.backgroundColor = HEALTH_COLOR_HIGH;
        } else if (healthPercent >= 40) {
          healthBar.style.backgroundColor = HEALTH_COLOR_HALF;
        } else if (healthPercent >= 20) {
          healthBar.style.backgroundColor = HEALTH_COLOR_LOW;
        } else {
          healthBar.style.backgroundColor = HEALTH_COLOR_VERY_LOW;
        }
      }
    });
  }

  function removeCharacter(character) {
    scene.getMeshByName(character.id).dispose();
  }


  function updateScene() {
    if (scene && scene.getAnimationRatio()) {
      var nowTime = Date.now()
      var dt = nowTime - prevTime
      prevTime = nowTime

      updatePlayerOrientation();
      sendPlayerState();
      updateCharacterOriendtation();
    }
  }

  function updatePlayerOrientation() {
    playerStatus.rotation.y += player.rotationY;
    player.rotationY = 0;
    playerStatus.rotation.y += player.rotYSpeed * scene.getAnimationRatio();
    playerStatus.rotation.y = playerStatus.rotation.y % (2 * Math.PI);
    avatar.rotation.y = playerStatus.rotation.y;
    cameraTarget.rotation.y = playerStatus.rotation.y;
    camera.alpha = - (playerStatus.rotation.y + ALPHA_OFFSET);

    // // rotation on x-axis
    camera.beta -= player.rotationX;
    player.rotationX = 0;
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
        player: Object.assign({},player)
      };
      msg.player.id = playerStatus.id;
      msg.player.rotation = playerStatus.rotation;
      msg.player.position = playerStatus.position;
      msg.player.fwdSpeed = player.fwdSpeed;
      msg.player.sideSpeed = player.sideSpeed;

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
            char.position.x -= character.fwdSpeed * Math.sin(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.z -= character.fwdSpeed * Math.cos(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.x -= character.sideSpeed * -Math.cos(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.z -= character.sideSpeed * Math.sin(character.rotation.y + Math.PI) * scene.getAnimationRatio();
          }
        }
    });
  }


  function castRay(){
    var length = 100;
    var origin = cameraTarget.position;
    var direction = new BABYLON.Vector3(
      -Math.sin(camera.alpha + ALPHA_OFFSET) * Math.abs(Math.cos(camera.beta - BETA_OFFSET)),
      Math.sin(camera.beta - BETA_OFFSET),
      Math.cos(camera.alpha + ALPHA_OFFSET) * Math.abs(Math.cos(camera.beta - BETA_OFFSET)));

    var ray = new BABYLON.Ray(origin, direction, length);
    var hit = scene.pickWithRay(ray);

    var msg = {
      type: CONSTANTS.MESSAGE_TYPE.FIRE,
      target: {}
    }
    if (hit.pickedMesh){
      console.log(hit.pickedMesh);
      msg.target.id = hit.pickedMesh.id;
    }
    socket.send(JSON.stringify(msg));
  }

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
              castRay();
            } else if (type === "keyup") {
              this.isPressed[event.key] = false;
            }
            break;
          } // end of switch statement
        }
      } // end of process method
  } // end of InputManager class
}
