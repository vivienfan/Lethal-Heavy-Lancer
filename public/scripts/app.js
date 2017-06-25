// app.js
window.onload = function() {
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  engine.displayLoadingUI();

  // var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  // var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, camera, playerMesh, npcMesh, ground, skybox, flame;
  var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
  var inputManager = new InputManager()

  var healthBar = document.getElementById("health-bar");
  var health = document.getElementById("health");
  var bloodBlur = document.getElementById("blood-blur");
  var gameOver = document.getElementById("game-over");

  var GROUND_LEVEL = -2.2;
  var WORLD_OFFSET = -5;

  var ANGLE = Math.PI / 180;
  var UP_ANGLE_MAX = 135 * ANGLE;
  var DOWN_ANGLE_MAX = 80 * ANGLE;
  var CAM_OFFSET = 1.5;
  var ALPHA_OFFSET = -Math.PI / 2;
  var BETA_OFFSET = Math.PI / 2 + 5 * ANGLE;
  var RADIUS = 1.5;

  var AIM_OFFSET = 7 * Math.PI/180;
  var SPEED = CONSTANTS.PLAYER.MAX_SPEED;
  var alpha = 0;
  var SPACESHIP_ELLIPSOID = new BABYLON.Vector3(10, 10, 10);
  var TOTAL_BUILDINGS = 25;
  var CAMERA_TARGET_OFFSET = Math.PI / 2;

  var playerStatus = {};
  var characterStatus = [];
  var particleSystems = {};
  var deadNPC = [];

  var HEALTH_COLOR_FULL = "#86e01e";
  var HEALTH_COLOR_HIGH = "#f2d31b";
  var HEALTH_COLOR_HALF = "#f2b01e";
  var HEALTH_COLOR_LOW = "#f27011";
  var HEALTH_COLOR_VERY_LOW = "#f63a0f";

  var ALIVE = true;

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
  }

  socket.onmessage = (event) => {
    var data = JSON.parse(event.data);
    switch(data.type) {
      case CONSTANTS.MESSAGE_TYPE.PLAYER_INFO:
        initWorld(data.data, data.mission, data.map.grid);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_STATE:
        updateCharacters(data.mission.characters);
        break;
      case CONSTANTS.MESSAGE_TYPE.FIRE:
        displayPlayerFire(data.data.id);
        break;
      case CONSTANTS.MESSAGE_TYPE.REMOVE:
        removeCharacter(data.character);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_END:
        displayGameWin();
        break;
      default:
        break;
    }
  }

  function initWorld(player, mission, map) {
    console.log("init world: ", player, mission);
    playerStatus = new Player(player, mission);
    createScene(map);
  }

  function createScene(map) {
    scene = new BABYLON.Scene(engine);
    flame = new BABYLON.Texture("Fire.png", scene);

    createSkybox();
    createSun();
    createGround();
    createBuildings(map);

    createNPCMesh();
    createPlayerMesh();
    createAvatar();

    scene.executeWhenReady(function() {
      health.classList.remove("hide");
      bloodBlur.classList.remove("hide");
      socket.send(JSON.stringify({type: CONSTANTS.MESSAGE_TYPE.PLAYER_READY}));

      engine.hideLoadingUI();
      engine.runRenderLoop(function(){
        if (scene && scene.activeCamera) {
          scene.render();
        }
      });
    });

    scene.registerBeforeRender(function() {
      updateScene();
    })

    return scene;
  }

  function createSkybox() {
    // Create skybox
    skybox = BABYLON.Mesh.CreateBox("skyBox", 1000, scene);
    skybox.isPickable = false;
    skybox.position.y = WORLD_OFFSET;

    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    // texture
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/moon/", scene);
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
    sun.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
    sun.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
    sun.groundColor = new BABYLON.Color3(0, 0, 0);
  }

  function createGround() {
    ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
    ground.position.y = GROUND_LEVEL + WORLD_OFFSET;
    ground.isPickable = false;

    var mirrorMaterial = new BABYLON.StandardMaterial("mat", scene);
    mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirror", 512, scene, true);
    mirrorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, -10);
    mirrorMaterial.reflectionTexture.renderList.push(skybox);
    mirrorMaterial.reflectionTexture.level = 0.5;
    // removing all light reflections
    mirrorMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    mirrorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = mirrorMaterial;
    ground.infiniteDistance = true;
  }

  function createBuildings(map) {
    var materials = [];
    for( var i = 0; i < TOTAL_BUILDINGS; i++) {
      var newMaterial = new BABYLON.StandardMaterial("buildingMaterial" + i, scene);
      newMaterial.emissiveTexture = new BABYLON.Texture("assets/texture/buildings/" + i + ".jpg", scene);
      newMaterial.bumpTexture = new BABYLON.Texture("assets/texture/buildings/normal_" + i + ".png", scene);
      newMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      newMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
      newMaterial.backFaceCulling = false;
      materials.push(newMaterial);
    }

    var buildingMesh = BABYLON.Mesh.CreateBox("buildingMesh", CONSTANTS.MAP.ELEMENT_SIZE - 4, scene);
    buildingMesh.checkCollisions = true;
    buildingMesh.isPickable = false;
    buildingMesh.setEnabled(false);

    var buildingBase = BABYLON.Mesh.CreateBox("buildingBase", CONSTANTS.MAP.ELEMENT_SIZE, scene, false);
    buildingBase.scaling.y = 0.1;
    buildingBase.isPickable = false;
    buildingBase.material = new BABYLON.StandardMaterial("baseMaterial", scene);
    buildingBase.material.emissiveTexture = new BABYLON.Texture("assets/texture/buildings/concrete.png", scene);
    buildingBase.material.bumpTexture = new BABYLON.Texture("assets/texture/buildings/concrete_normal.png", scene);
    buildingBase.material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    buildingBase.material.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    buildingBase.material.backFaceCulling = false;
    buildingBase.setEnabled(false);

    map.forEach(function(x, indexX) {
      x.forEach(function(z, indexZ) {
        if (z.isObstacle) {
          var newObstacle = buildingMesh.clone(indexX + "-" + indexZ);
          newObstacle.position.x = indexX * CONSTANTS.MAP.ELEMENT_SIZE - CONSTANTS.MAP.ELEMENT_SIZE / 2;
          newObstacle.position.z = indexZ * CONSTANTS.MAP.ELEMENT_SIZE - CONSTANTS.MAP.ELEMENT_SIZE / 2;
          newObstacle.position.y = WORLD_OFFSET;

          var randomSize = (Math.floor(Math.random() * 500) + 300) / 100;
          var randomIndex = Math.floor(Math.random() * TOTAL_BUILDINGS);
          newObstacle.scaling.y = randomSize;
          var buildingMaterial = materials[randomIndex].clone(indexX + "-" + indexZ);
          buildingMaterial.emissiveTexture.vScale = randomSize ;
          newObstacle.material = buildingMaterial;
          ground.material.reflectionTexture.renderList.push(newObstacle);

          var newObstacleBase = buildingBase.clone(indexX + "-" + indexZ);
          newObstacleBase.position.x = newObstacle.position.x;
          newObstacleBase.position.y = WORLD_OFFSET;
          newObstacleBase.position.z = newObstacle.position.z;
          ground.material.reflectionTexture.renderList.push(newObstacleBase);
        }
      });
    });
  }

  function createNPCMesh() {
    var npcMaterial = new BABYLON.StandardMaterial('columnsmat', scene);
    // npcMaterial.emissiveTexture = new BABYLON.Texture("assets/texture/npc.jpg", scene);
    npcMaterial.emissiveTexture = new BABYLON.Texture("assets/texture/blue_red_flame.jpg", scene);
    npcMaterial.bumpTexture = new BABYLON.Texture("assets/texture/npc_normal.png", scene);
    npcMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    npcMaterial.specularColor = new BABYLON.Color3(1, 0, 0);

    npcMesh = BABYLON.Mesh.CreateSphere("npc-mesh", 16, 8, scene);
    npcMesh.material = npcMaterial;
    npcMesh.checkCollisions = true;
    npcMesh.setEnabled(false);
  }

  function createPlayerMesh() {
    BABYLON.SceneLoader.ImportMesh("", "", "Spaceship.babylon", scene, function (newMeshes) {
      playerMesh = newMeshes[0];
      playerMesh.isPickable = false;
      playerMesh.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
      playerMesh.setEnabled(false);
      playerMesh.checkCollisions = true;
    });
  }

  function createAvatar() {
    BABYLON.SceneLoader.ImportMesh("", "", "Spaceship.babylon", scene, function (newMeshes,) {
      avatar = newMeshes[0];
      avatar.id = playerStatus.id;
      avatar.name = playerStatus.id;
      avatar.isPickable = false;
      avatar.backFaceCulling = false;

      // collision
      avatar.ellipsoid = SPACESHIP_ELLIPSOID;
      avatar.checkCollisions = true;

      avatar.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);

      cameraTarget = BABYLON.Mesh.CreateTorus("snipper-aim", 0.15, 0.01, 20, scene, false, BABYLON.Mesh.DEFAULTSIDE);
      cameraTarget.isPickable = false;
      cameraTarget.ellipsoid = SPACESHIP_ELLIPSOID;
      cameraTarget.checkCollisions = true;
      var aim = BABYLON.Mesh.CreateSphere("aim-point", 1, 0.02, scene);
      aim.isPickable = false;
      aim.parent = cameraTarget;
      initFocus();

      camera = new BABYLON.ArcRotateCamera("arcCam", ALPHA_OFFSET, BETA_OFFSET, RADIUS, cameraTarget, scene);
      scene.activeCamera = camera;
    });
  }

  function initFocus() {
    playerStatus.position.y = 0;
    avatar.position.x = playerStatus.position.x;
    avatar.position.y = playerStatus.position.y;
    avatar.position.z = playerStatus.position.z;
    avatar.rotation.x = playerStatus.rotation.x;
    avatar.rotation.y = playerStatus.rotation.y;
    avatar.rotation.z = playerStatus.rotation.z;

    cameraTarget.position.x = playerStatus.position.x;
    cameraTarget.position.y = playerStatus.position.y + CAM_OFFSET;
    cameraTarget.position.z = playerStatus.position.z;
    cameraTarget.rotation.x = playerStatus.rotation.x + CAMERA_TARGET_OFFSET;
    cameraTarget.rotation.y = playerStatus.rotation.y;
    cameraTarget.rotation.z = playerStatus.rotation.z;
  }

  function updateCharacters(characters) {
    characterStatus = [];
    characters.forEach(function(character, index) {
      characterStatus.push(new Character(character));
      if (character.id !== playerStatus.id) {
        var char_mesh = scene.getMeshByName(character.id);
        if (char_mesh){
          char_mesh.position = character.position;
          char_mesh.rotation = character.rotation;
          if (character.type === CONSTANTS.CHAR_TYPE.ENEMY) {
            char_mesh.rotation.y = character.rotation.y - Math.PI / 2;
          } else if (character.type === CONSTANTS.CHAR_TYPE.PLAYER){
            char_mesh.position.y = 0;
          }
        } else {
          if (character.type === CONSTANTS.CHAR_TYPE.ENEMY && npcMesh) {
            buildNewNPC(character);
          } else if (character.type === CONSTANTS.CHAR_TYPE.PLAYER && playerMesh) {
            buildNewPlayer(character);
          }
        }
      } else {  // update client info
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
        if (healthPercent <= 75) {
          bloodBlur.style.opacity = 1 - healthPercent / 100;
        }
      }
    });
  }

  function displayPlayerFire(id) {
    var player = scene.getMeshByName(id);
    var direction = new BABYLON.Vector3(
      -Math.sin(player.rotation.y) * Math.abs(Math.cos(player.rotation.x)),
      Math.sin(player.rotation.x),
      -Math.cos(player.rotation.y) * Math.abs(Math.cos(player.rotation.x)));
    createBeam(player.position, direction, -0.5);
  }

  function buildNewNPC(character) {
    var newNPC = npcMesh.clone(character.id);
    newNPC.position = character.position;
    newNPC.rotation = character.rotation;
    newNPC.checkCollisions = true;
    ground.material.reflectionTexture.renderList.push(newNPC);
    createParticles(character.id)
  }

  function createParticles(id) {
    particleSystems[id] = [];
    createOneLayer("Fire.png", id, 0, 0.2, 0.3);
    createOneLayer("Fire.png", id, 1, 0.2, 0.4);
  }

  function createOneLayer(filePath, id, level, minSize, maxSize) {
    var emitter = BABYLON.Mesh.CreateBox("emitter" + level, 0.1, scene);
    emitter.isVisible = false;

    particleSystems[id][level] = new BABYLON.ParticleSystem("particles", 1000, scene);
    particleSystems[id][level].particleTexture = new BABYLON.Texture(filePath, scene);
    particleSystems[id][level].minSize = minSize;
    particleSystems[id][level].maxSize = maxSize;
    particleSystems[id][level].minEmitPower = 1;
    particleSystems[id][level].maxEmitPower = 2;
    particleSystems[id][level].minLifeTime = 0.7;
    particleSystems[id][level].maxLifeTime = 1;
    particleSystems[id][level].emitter = emitter;
    particleSystems[id][level].emitRate = 100;
    particleSystems[id][level].blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystems[id][level].minEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystems[id][level].maxEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystems[id][level].direction1 = new BABYLON.Vector3(0, 0, 0);
    particleSystems[id][level].direction2 = new BABYLON.Vector3(0, 0, 0);
    particleSystems[id][level].start();
  }

  function buildNewPlayer(character) {
    var newPlayer = playerMesh.clone(character.id);
    newPlayer.position.x = character.position.x;
    newPlayer.position.y = 0;
    newPlayer.position.z = character.position.z;
    newPlayer.rotation = character.rotation;
    newPlayer.checkCollisions = true;
    ground.material.reflectionTexture.renderList.push(newPlayer);
    console.log(ground.material.reflectionTexture.renderList);
    console.log(newPlayer);
  }

  function removeCharacter(character) {
    if (character.id === playerStatus.id) {
      displayGameLose();
    } else {
      if (character.type === CONSTANTS.CHAR_TYPE.PLAYER) {
        var player = scene.getMeshByName(character.id);
        player.position.y = WORLD_OFFSET;

        var emitter = BABYLON.Mesh.CreateBox("emitter", 0.1, scene);
        emitter.position.x = player.position.x;
        emitter.position.y = WORLD_OFFSET;
        emitter.position.z = player.position.z;
        emitter.isVisible = false;

        var flame_ps = new BABYLON.ParticleSystem("particles", 2000, scene);
        flame_ps.particleTexture = new BABYLON.Texture("assets/texture/red_blue_flame.jpg", scene);
        flame_ps.minSize = 1;
        flame_ps.maxSize = 2;
        flame_ps.minLifeTime = 0.3;
        flame_ps.maxLifeTime = 1.5;
        flame_ps.minEmitPower = 1;
        flame_ps.maxEmitPower = 3;
        flame_ps.minAngularSpeed = 0;
        flame_ps.maxAngularSpeed = Math.PI;
        flame_ps.emitter = emitter;
        flame_ps.emitRate = 800;
        flame_ps.updateSpeed = 0.05;
        flame_ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
        flame_ps.direction1 = new BABYLON.Vector3(-7, 8, 3);
        flame_ps.direction2 = new BABYLON.Vector3(7, 8, -3);
        flame_ps.minEmitBox = new BABYLON.Vector3(-5, 0, -5);
        flame_ps.maxEmitBox = new BABYLON.Vector3(5, 0, 5);
        flame_ps.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        flame_ps.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        flame_ps.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        flame_ps.start();
      } else {
        particleSystems[character.id][0].dispose();
        particleSystems[character.id][1].dispose();
        deadNPC.push({counter: 12, mesh: scene.getMeshByName(character.id), particleSystems: null}); // 12 frames
      }
    }
  }

  function displayGameLose() {
    ALIVE = false;
    healthBar.style.width = "0%";
    bloodBlur.style.opacity = 1;
    gameOver.classList.remove("hide");
  }

  function displayGameWin() {

  }

  function updateScene() {
    if (scene && scene.getAnimationRatio()) {
      if (ALIVE) {
        updatePlayerOrientation();
      }
      sendPlayerState();
      updateCharacterOriendtation();
      deadNPCAnimation();
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
    var tmp_angle = camera.beta - player.rotationX;
    tmp_angle = camera.beta - player.rotXSpeed * scene.getAnimationRatio();
    player.rotationX = 0;
    camera.beta = Math.min(Math.max(tmp_angle, DOWN_ANGLE_MAX), UP_ANGLE_MAX);
    avatar.rotation.x = camera.beta - BETA_OFFSET;
    cameraTarget.rotation.x = avatar.rotation.x + CAMERA_TARGET_OFFSET;

    // move forward/backward
    playerStatus.position.x += player.fwdSpeed * Math.sin(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
    playerStatus.position.z += player.fwdSpeed * Math.cos(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();

    // move left/right
    playerStatus.position.x += player.sideSpeed * -Math.cos(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();
    playerStatus.position.z += player.sideSpeed * Math.sin(playerStatus.rotation.y + Math.PI) * scene.getAnimationRatio();

    // collision handling
    var direction = new BABYLON.Vector3(
      playerStatus.position.x - avatar.position.x, 0,
      playerStatus.position.z - avatar.position.z);
    avatar.moveWithCollisions(direction);

    // collision engine auto-adjust position when collision happens
    // avatar.position.y = 0;
    cameraTarget.position.x = avatar.position.x;
    cameraTarget.position.y = avatar.position.y + CAM_OFFSET;
    cameraTarget.position.z = avatar.position.z;
    playerStatus.position.x = avatar.position.x;
    playerStatus.position.y = avatar.position.y;
    playerStatus.position.z = avatar.position.z;
  }

  function sendPlayerState() {
    if( playerStatus && socket.readyState === socket.OPEN ) {
      var msg = {
        type: CONSTANTS.MESSAGE_TYPE.UPDATE,
        player: Object.assign({},player)
      };
      msg.player.id = playerStatus.id;
      msg.player.rotation = avatar.rotation;
      msg.player.position = avatar.position;
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
            char.position.x += character.fwdSpeed * Math.sin(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.z += character.fwdSpeed * Math.cos(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.x += character.sideSpeed * -Math.cos(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            char.position.z += character.sideSpeed * Math.sin(character.rotation.y + Math.PI) * scene.getAnimationRatio();
            // there is a particle for this mesh -> npc, rotate the particle;
            if (particleSystems[character.id]) {
              particleSystems[character.id][0].emitter.position.x = 3.5 * Math.cos(alpha) + char.position.x;
              particleSystems[character.id][0].emitter.position.y = 0.5;
              particleSystems[character.id][0].emitter.position.z = 3.5 * Math.sin(alpha) + char.position.z;

              particleSystems[character.id][1].emitter.position.x = -2 * Math.cos(alpha) + char.position.x;
              particleSystems[character.id][1].emitter.position.y = 0.8;
              particleSystems[character.id][1].emitter.position.z = -2 * Math.sin(alpha) + char.position.z;
              alpha += 0.05 * scene.getAnimationRatio();
            }
          }
        }
    });
  }

  function deadNPCAnimation() {
    deadNPC.forEach(function(npc, index) {
      if(npc.counter === 0) {
        npc.mesh.dispose();
        deadNPC.splice(index, 1);
      } else {
        if (npc.counter > 2) {
          npc.mesh.scaling.x /= 1.2;
          npc.mesh.scaling.y /= 1.2;
          npc.mesh.scaling.z /= 1.2;
        }
        npc.counter--;
      }
    });
  }

  function castRay(){
    var length = 100;
    var origin = cameraTarget.position;
    var direction = new BABYLON.Vector3(
      -Math.sin(avatar.rotation.y) * Math.abs(Math.cos(avatar.rotation.x + AIM_OFFSET)),
      Math.sin(avatar.rotation.x + AIM_OFFSET),
      -Math.cos(avatar.rotation.y) * Math.abs(Math.cos(avatar.rotation.x + AIM_OFFSET)));
    createBeam(cameraTarget.position, direction, -2);

    var ray = new BABYLON.Ray(origin, direction, length);
    var hit = scene.pickWithRay(ray);

    var msg = {
      type: CONSTANTS.MESSAGE_TYPE.FIRE,
      target: {}
    }
    if (hit.pickedMesh){
      msg.target.id = hit.pickedMesh.name;
    }
    socket.send(JSON.stringify(msg));
  }

  function createBeam(position, direction, offset) {
    var hilt = BABYLON.Mesh.CreateCylinder("beam", 0.5, 0.5, 0.5, 12, scene);
    hilt.position.y = position.y + offset;
    hilt.position.x = position.x;
    hilt.position.z = position.z;
    hilt.visibility = false;

    var particalSystem = new BABYLON.ParticleSystem("beam", 4000, scene);
    particalSystem.particleTexture = new BABYLON.Texture("Fire.png", scene);
    particalSystem.minSize = 0.5;
    particalSystem.maxSize = 0.5;
    particalSystem.minLifeTime = 0.2;
    particalSystem.maxLifeTime = 0.6;
    particalSystem.minEmitPower = 50;
    particalSystem.maxEmitPower = 100;

    particalSystem.minAngularSpeed = 0;

    particalSystem.emitter = hilt;
    particalSystem.emitRate = 500;
    particalSystem.updateSpeed = 0.05;
    particalSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    particalSystem.direction1 = direction;
    particalSystem.direction2 = direction;
    particalSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    particalSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);

    particalSystem.start();

    setTimeout(function() {
      particalSystem.stop();
    }, 200);
  }

  function InputManager() {
    this.isPressed = {}
    this.lastY = 0

    this.process = function(type, event) {
      if (ALIVE) {
        // we want to update mousemove directly, as it is a direct relation to how far user moved mouse
        if ( type === "mousemove" && !!document.pointerLockElement) {
          player.rotationY += event.movementX * ANGLE
          player.rotationX += event.movementY * ANGLE
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
                this.isPressed[event.key] = false;
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
        } // end of key input
      } else {
        if (event.key === "r" || event.key === "R") {
          // restart the game? redirect to lobby?
        }
      }
    } // end of process method
  } // end of InputManager class
}
