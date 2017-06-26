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

    camera = new BABYLON.ArcRotateCamera("arcCam", CONSTANTS.CAMERA.ALPHA_OFFSET, CONSTANTS.CAMERA.BETA_OFFSET, CONSTANTS.CAMERA.RADIUS, cameraTarget, scene);
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
  cameraTarget.position.y = playerStatus.position.y + CONSTANTS.CAMERA.HEIGHT_OFFSET;
  cameraTarget.position.z = playerStatus.position.z;
  cameraTarget.rotation.x = playerStatus.rotation.x + CAMERA_TARGET_OFFSET;
  cameraTarget.rotation.y = playerStatus.rotation.y;
  cameraTarget.rotation.z = playerStatus.rotation.z;
}

function castRay(){
  var length = 100;
  var origin = cameraTarget.position;
  var direction = new BABYLON.Vector3(
    -Math.sin(avatar.rotation.y) * Math.abs(Math.cos(avatar.rotation.x + CONSTANTS.AIM_OFFSET)),
    Math.sin(avatar.rotation.x + CONSTANTS.AIM_OFFSET),
    -Math.cos(avatar.rotation.y) * Math.abs(Math.cos(avatar.rotation.x + CONSTANTS.AIM_OFFSET)));
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
  camera.alpha = - (playerStatus.rotation.y + CONSTANTS.CAMERA.ALPHA_OFFSET);

  // rotation on x-axis
  var tmp_angle = camera.beta - player.rotationX;
  tmp_angle = camera.beta - player.rotXSpeed * scene.getAnimationRatio();
  player.rotationX = 0;
  camera.beta = Math.min(Math.max(tmp_angle, CONSTANTS.CAMERA.DOWN_ANGLE_MAX), CONSTANTS.CAMERA.UP_ANGLE_MAX);
  avatar.rotation.x = camera.beta - CONSTANTS.CAMERA.BETA_OFFSET;
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
  cameraTarget.position.y = avatar.position.y + CONSTANTS.CAMERA.HEIGHT_OFFSET;
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

function displayGameLose() {
  ALIVE = false;
  healthBar.style.width = "0%";
  bloodBlur.style.opacity = 0.7;
  alarmSound.dispose();
  gameOver.classList.remove("hide");
}

function displayGameWin() {

}