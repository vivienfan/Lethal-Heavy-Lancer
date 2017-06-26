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