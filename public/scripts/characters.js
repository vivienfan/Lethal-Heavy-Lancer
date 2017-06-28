function createNPCMesh() {
  var npcMaterial = new BABYLON.StandardMaterial('columnsmat', scene);
  npcMaterial.emissiveTexture = new BABYLON.Texture("assets/texture/npc.jpg", scene);
  // npcMaterial.emissiveTexture = new BABYLON.Texture("assets/texture/blue_red_flame.jpg", scene);
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

  createParticles(character.id)

  var newNPCSound = npcSound.clone();
  newNPCSound.attachToMesh(newNPC);
  newNPCSound.autoplay = true;
  npcSoundEffects[character.id] = newNPCSound;
  ground.material.reflectionTexture.renderList.push(newNPC);
}

function buildNewPlayer(character) {
  var newPlayer = playerMesh.clone(character.id);
  newPlayer.position.x = character.position.x;
  newPlayer.position.y = 0;
  newPlayer.position.z = character.position.z;
  newPlayer.rotation = character.rotation;
  newPlayer.checkCollisions = true;
  ground.material.reflectionTexture.renderList.push(newPlayer);
}

function removeCharacter(character) {
  if (character.id === playerStatus.id) {
    displayGameLose();
  } else {
    if (character.type === CONSTANTS.CHAR_TYPE.PLAYER) {
      removePlayer(character.id);
    } else {
      removeNPC(character.id);
    }
  }
}

function removePlayer(id) {
  var player = scene.getMeshByName(id);
  player.rotation.x = 0;
  player.position.y = CONSTANTS.WORLD_OFFSET;
  var emitter = burningSpaceshipAnimation(player.position);

  var newBurningSound = burningSound.clone();
  newBurningSound.play();
  newBurningSound.attachToMesh(emitter);
}

function removeNPC(id) {
  npcSoundEffects[id].dispose();
  particleSystems[id][0].dispose();
  particleSystems[id][1].dispose();
  var mesh = scene.getMeshByName(id)
  var newExplosionSound = explosionSound.clone();
  newExplosionSound.attachToMesh(mesh)
  deadNPC.push({counter: 5, mesh: mesh, particleSystems: null, sound: newExplosionSound}); // 10 frames
}

function updateCharacterOrientation() {
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
            npcMovingAnimation(character.id, char.position);
          }
        }
      }
  });
}

