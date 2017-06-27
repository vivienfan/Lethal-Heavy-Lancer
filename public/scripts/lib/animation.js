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

function npcMovingAnimation(id, position) {
  particleSystems[id][0].emitter.position.x = 3.5 * Math.cos(alpha) + position.x;
  particleSystems[id][0].emitter.position.y = 0.5;
  particleSystems[id][0].emitter.position.z = 3.5 * Math.sin(alpha) + position.z;

  particleSystems[id][1].emitter.position.x = -2 * Math.cos(alpha) + position.x;
  particleSystems[id][1].emitter.position.y = 0.8;
  particleSystems[id][1].emitter.position.z = -2 * Math.sin(alpha) + position.z;
  alpha += 0.05 * scene.getAnimationRatio();
}

function burningSpaceshipAnimation(position) {
  var emitter = BABYLON.Mesh.CreateBox("emitter", 0.1, scene);
  emitter.position.x = position.x;
  emitter.position.y = CONSTANTS.WORLD_OFFSET;
  emitter.position.z = position.z;
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

  return emitter;
}

function createParticles(id) {
  console.log("createParticles for", id)
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