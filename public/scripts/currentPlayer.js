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

function updatePlayerOrientation() {
  playerStatus.rotation.y += player.rotationY;
  player.rotationY = 0;
  playerStatus.rotation.y += player.rotYSpeed * scene.getAnimationRatio();
  playerStatus.rotation.y = playerStatus.rotation.y % (2 * Math.PI);
  avatar.rotation.y = playerStatus.rotation.y;
  cameraTarget.rotation.y = playerStatus.rotation.y;
  camera.alpha = - (playerStatus.rotation.y + ALPHA_OFFSET);

  // rotation on x-axis
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