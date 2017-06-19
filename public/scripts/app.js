// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, camera, playerMesh, npcMesh;
  var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
  var inputManager = new InputManager()

  var ANGLE = Math.PI/180;
  var UP_ANGLE_MAX = -Math.PI/3;
  var DOWN_ANGLE_MAX = Math.PI/10;
  var CAM_OFFSET = 4.5;
  var SPEED = 2;
  var ALPHA_OFFSET = Math.PI/2;
  var BETA_OFFSET = Math.PI/2;
  var RADIUS = 3;

  var playerStatus = {};

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
    extraGround.position.y = -2.5;
    extraGround.material = extraGroundMaterial;
  }

  function createPlayers(players) {
    console.log(players);
    BABYLON.SceneLoader.ImportMesh("", "", "walk.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      playerMesh = newMeshes[0];
      playerMesh.isPickable = false;
      players.forEach(function(player, index) {
        var newPlayer = playerMesh.createInstance(player.id);//, index);
        newPlayer.id = player.id;
        newPlayer.name = player.name;
        newPlayer.position = player.position;
        newPlayer.rotation = player.rotation;
      })
    });
    console.log(scene.meshes);
  }

  function createNPCs(npcs) {
    console.log(npcs);
    BABYLON.SceneLoader.ImportMesh("", "", "robot.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      npcMesh = newMeshes[0];
      npcs.forEach(function(npc, index) {
        var newNpc = npcMesh.createInstance(npc.id);//, index);
        newNPC.id = npc.id;
        newNPC.name = npc.id;
        newNPC.position = npc.position;
        newNPC.rotation = npc.rotation;
      })
      console.log(scene.meshes);
    });
  }

  function createCharacters(characters) {
    console.log("here we create characters:", characters);
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

    // var direction = new BABYLON.Vector3(0, -Math.sin(camera.beta + BETA_OFFSET), 0);

    var direction = new BABYLON.Vector3(Math.sin(camera.alpha - ALPHA_OFFSET),
      -Math.sin(camera.beta + BETA_OFFSET),
      -Math.cos(camera.alpha - ALPHA_OFFSET));

    // var direction = new BABYLON.Vector3(Math.sin(camera.alpha + ALPHA_OFFSET), 0, 0;

    // var direction = new BABYLON.Vector3(0, 0, Math.cos(camera.alpha + ALPHA_OFFSET));


    // var direction = new BABYLON.Vector3(-(camera.alpha + ALPHA_OFFSET)/2, -(camera.beta + BETA_OFFSET), 0);

    // var direction = new BABYLON.Vector3(0, 10, 0);

    var length = 100;

    var ray = new BABYLON.Ray(origin, direction, length);
    ray.show(scene, new BABYLON.Color3(1, 1, 0.1));

    var hit = scene.pickWithRay(ray);

    if (hit.pickedMesh){
      hit.pickedMesh.scaling.y += 0.01;
    }
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

    scene.registerBeforeRender(function() {
      castRay();
    });

    return scene;
  }

  function updateCharacters(characters) {
    characters.forEach(function(character, index) {
      if (character.id !== playerStatus.id) {
        if (scene.getMeshByName(character.id)){
          scene.getMeshByName(character.id).position = character.position;
          scene.getMeshByName(character.id).rotation = character.rotation;
        } else {
          if (character.type === CONSTANTS.CHAR_TYPE.ENEMY && npcMesh) {
            var newNpc = npcMesh.createInstance(character.id);//, index);
            newNPC.id = character.id;
            newNPC.name = character.id;
            newNPC.position = character.position;
            newNPC.rotation = character.rotation;
          } else if (character.type === CONSTANTS.CHAR_TYPE.PLAYER && playerMesh) {
            var newPlayer = playerMesh.createInstance(character.id);//, index);
            newPlayer.id = character.id;
            newPlayer.name = character.id;
            newPlayer.position = character.position;
            newPlayer.rotation = character.rotation;
          }
        }
      }
    });
  }

  function updateScene(characters) {
    if (scene && scene.getAnimationRatio()) {
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

      if( playerStatus ) {
        var msg = {
          type: CONSTANTS.MESSAGE_TYPE.UPDATE,
          player: player
        };
        msg.player.position = playerStatus.position;
        msg.player.rotation = playerStatus.rotation;
        msg.player.id = playerStatus.id;

        // Send the msg object as a JSON-formatted string.
        // console.log(msg);
        socket.send(JSON.stringify(msg));
      }
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