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