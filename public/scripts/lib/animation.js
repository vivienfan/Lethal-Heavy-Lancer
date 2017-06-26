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