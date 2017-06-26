function createLobby() {
  engine.displayLoadingUI();
  createBasicScene();
  createLobbyScene();
}

function checkPlayerChoice() {
  if (avatar.position.x >= 20 && avatar.position.x <= 40
    && avatar.position.z >= -165 && avatar.position.z <= -135) {
    console.log("left sphere, redirect to game");
  } else if (avatar.position.x >= -40 && avatar.position.x <= -20
    && avatar.position.x >= -165 && avatar.position.z <= -135) {
    console.log("right sphere, redirect to turotial");
  }
}