// app.js
var socket;

var canvas;
var engine;

var scene, camera, playerMesh, npcMesh, ground, skybox, flame;
var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
var inputManager = new InputManager();

var healthBar;
var health;
var bloodBlur;
var gameOver;

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
var SPACESHIP_ELLIPSOID;
var TOTAL_BUILDINGS = 23;
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

var shootingSound, npcSound, alarmSound, burningSound, explosionSound, bgm;
var npcSoundEffects = {};




window.onload = function() {
  socket = new WebSocket(`ws://${window.location.hostname}:8080`);

  canvas = document.getElementById("canvas");
  engine = new BABYLON.Engine(canvas, true);
  engine.displayLoadingUI();

  healthBar = document.getElementById("health-bar");
  health = document.getElementById("health");
  bloodBlur = document.getElementById("blood-blur");
  gameOver = document.getElementById("game-over");

  SPACESHIP_ELLIPSOID = new BABYLON.Vector3(10, 10, 10);


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

    loadAudio();

    createSkybox();
    createSun();
    createGround();
    createBuildings(map);
    // viewAllBuildingTextures(TOTAL_BUILDINGS, scene, WORLD_OFFSET);

    createNPCMesh();
    createPlayerMesh();
    createAvatar();

    scene.executeWhenReady(function() {
      socket.send(JSON.stringify({type: CONSTANTS.MESSAGE_TYPE.PLAYER_READY}));

      health.classList.remove("hide");
      bloodBlur.classList.remove("hide");

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

  function loadAudio() {
    bgm = new BABYLON.Sound("bgm", "assets/audio/moon.mp3", scene, null, {loop: true, autoplay: true});
    bgm.setVolume(1.2);

    shootingSound = new BABYLON.Sound("laserBeam", "assets/audio/laser_beam.wav", scene);
    shootingSound.setVolume(0.2);

    npcSound = new BABYLON.Sound("npc", "assets/audio/npc.mp3", scene, null, { loop: true, autoplay: false, maxDistance: 250});
    npcSound.setVolume(0.8);

    alarmSound = new BABYLON.Sound("alarm", "assets/audio/alarm.wav", scene, null, { loop: true, autoplay: false, playbackRate: 2});
    alarmSound.setVolume(0.2);

    burningSound = new BABYLON.Sound("burning", "assets/audio/burning.wav", scene, null, { loop: true, autoplay: false, maxDistance: 250});
    burningSound.setVolume(2);

    explosionSound = new BABYLON.Sound("explosion", "assets/audio/explosion.wav", scene, null, {loop: false, autoplay: false, maxDistance: 250});
    explosionSound.setVolume(0.8);
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
    mirrorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, -5.5);
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
      // newMaterial.bumpTexture = new BABYLON.Texture("assets/texture/buildings/normal_" + i + ".png", scene);
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
          if (!alarmSound.isPlaying) {
            alarmSound.play();
          }
          healthBar.style.backgroundColor = HEALTH_COLOR_HALF;
        } else if (healthPercent >= 20) {
          healthBar.style.backgroundColor = HEALTH_COLOR_LOW;
        } else {
          healthBar.style.backgroundColor = HEALTH_COLOR_VERY_LOW;
        }
        if (healthPercent <= 75) {
          bloodBlur.style.opacity = (1 - healthPercent / 100) * 0.7;
        }
      }
    });
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


}
