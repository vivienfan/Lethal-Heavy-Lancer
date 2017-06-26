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
    player.position.y = CONSTANTS.WORLD_OFFSET;

    var emitter = BABYLON.Mesh.CreateBox("emitter", 0.1, scene);
    emitter.position.x = player.position.x;
    emitter.position.y = CONSTANTS.WORLD_OFFSET;
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
      if (npc.counter === -2) {
        npc.sound.dispose();
        deadNPC.splice(index, 1);
      }
      if(npc.counter === 0) {
        npc.mesh.dispose();
      } else {
        if (npc.counter > 2) {
          npc.mesh.scaling.x /= 1.7;
          npc.mesh.scaling.y /= 1.7;
          npc.mesh.scaling.z /= 1.7;
        }
        if (npc.counter === 2) {
          npc.sound.play();
        }
        npc.counter--;
      }
    });
  }