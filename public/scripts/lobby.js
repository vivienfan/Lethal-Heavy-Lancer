function createLobby() {
  engine.displayLoadingUI();
  createBasicScene();
  createLobbyScene();
}

function checkPlayerChoice() {
  if (avatar.position.x >= 20 && avatar.position.x <= 40
    && avatar.position.z >= -165 && avatar.position.z <= -135) {
    console.log("left sphere, go to tutorial");
    STATE = "TUTORIAL";
    engine.displayLoadingUI();
    startTutorial();
  } else if (avatar.position.x >= -40 && avatar.position.x <= -20
    && avatar.position.x >= -165 && avatar.position.z <= -135) {
    console.log("right sphere, go to game");
    STATE = "GAME";
    engine.displayLoadingUI();
    playerStatus = {};
    player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
    disposeLobbyScene();
    startGame();
  }
}