function createLobbyScene() {
  scene = new BABYLON.Scene(engine);
  loadAudio();

  createSkybox();
  createSun();
  createGround();

  createAvatar();

  createLounge();

  scene.executeWhenReady(function() {
    engine.hideLoadingUI();
    engine.runRenderLoop(function() {
      if (scene && scene.activeCamera) {
        scene.render();
      }
    });
  });

  scene.registerBeforeRender(function() {
    updateLobbyScene();
  });

  return scene;
}

function createLounge() {
  var sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
  sphereMat.bumpTexture = new BABYLON.Texture("assets/texture/normal_map.jpg", scene);
  sphereMat.bumpTexture.vScale = 7;
  sphereMat.bumpTexture.uScale = 7;
  sphereMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  sphereMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
  sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
  sphereMat.backFaceCulling = false;
  sphereMat.alpha = 0.8;

  tutorialLounge = BABYLON.Mesh.CreateSphere("tutorialSphere", 20, 50, scene);
  tutorialLounge.material = sphereMat;
  tutorialLounge.position = new BABYLON.Vector3(30, 0, 150);

  gameLounge = BABYLON.Mesh.CreateSphere("gameSphere", 20, 50, scene);
  gameLounge.material = sphereMat;
  gameLounge.position = new BABYLON.Vector3(-30, 0, 150);
}

function createTutorialScene() {
  var map = [];
  for (var x = -100; x <= 100; x++) {
    for (var z = -100; z <= 100; z++) {
      var point = { isObstacle: false };
      if (x === -100 || x === 100 || z === -100 || z === 100) {
        point.isObstacle = true;
      }
    }
  }
}

function createGameScene(map) {
  scene = new BABYLON.Scene(engine);
  loadAudio();

  createSkybox();
  createSun();
  createGround();
  createBuildings(map);
  // viewAllBuildingTextures(CONSTANTS.TOTAL_BUILDINGS, scene, CONSTANTS.WORLD_OFFSET);

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
  skybox.position.y = CONSTANTS.WORLD_OFFSET;

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
  ground.position.y = CONSTANTS.GROUND_LEVEL + CONSTANTS.WORLD_OFFSET;
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
  for( var i = 0; i < CONSTANTS.TOTAL_BUILDINGS; i++) {
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
        newObstacle.position.y = CONSTANTS.WORLD_OFFSET;

        var randomSize = (Math.floor(Math.random() * 500) + 300) / 100;
        var randomIndex = Math.floor(Math.random() * CONSTANTS.TOTAL_BUILDINGS);

        newObstacle.scaling.y = randomSize;
        var buildingMaterial = materials[randomIndex].clone(indexX + "-" + indexZ);
        buildingMaterial.emissiveTexture.vScale = randomSize ;
        newObstacle.material = buildingMaterial;
        ground.material.reflectionTexture.renderList.push(newObstacle);

        var newObstacleBase = buildingBase.clone(indexX + "-" + indexZ);
        newObstacleBase.position.x = newObstacle.position.x;
        newObstacleBase.position.y = CONSTANTS.WORLD_OFFSET;
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
        healthBar.style.backgroundColor = CONSTANTS.HEALTH_COLOR.FULL;
      } else if (healthPercent >= 60) {
        healthBar.style.backgroundColor = CONSTANTS.HEALTH_COLOR.HIGH;
      } else if (healthPercent >= 40) {
        if (!alarmSound.isPlaying) {
          alarmSound.play();
        }
        healthBar.style.backgroundColor = CONSTANTS.HEALTH_COLOR.HALF;
      } else if (healthPercent >= 20) {
        healthBar.style.backgroundColor = CONSTANTS.HEALTH_COLOR.LOW;
      } else {
        healthBar.style.backgroundColor = CONSTANTS.HEALTH_COLOR.VERY_LOW;
      }
      if (healthPercent <= 75) {
        bloodBlur.style.opacity = (1 - healthPercent / 100) * 0.7;
      }
    }
  });
}

function updateScene() {
  if (scene && scene.getAnimationRatio() && scene.activeCamera) {
    if (ALIVE) {
      updatePlayerOrientation();
    }
    sendPlayerState();
    updateCharacterOriendtation();
    deadNPCAnimation();
  }
}

function updateLobbyScene() {
  if (scene && scene.getAnimationRatio() && scene.activeCamera) {
    updatePlayerOrientation();
    checkPlayerChoice();
  }
}
