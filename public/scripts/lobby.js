function createLobby() {
  playerStatus = {
    id: "currentPlayer",
    position: {
      x: 0,
      y: 0,
      z: 0
    },
    rotation: {
      x: 0,
      y: Math.PI,
      z: 0
    }
  };
  createLobbyScene();
}

function disposeLobby(callback) {
  console.log("dispose lobby");
  engine.stopRenderLoop();
  engine.displayLoadingUI();
  setTimeout(function () {
    scene.dispose();
    callback();
  }, 5);
}

function checkPlayerChoice() {
  if (avatar.position.x >= 20 && avatar.position.x <= 40
    && avatar.position.z >= 135 && avatar.position.z <= 165) {
    FSM.transite("GAME");
  } else if (avatar.position.x >= -40 && avatar.position.x <= -20
    && avatar.position.z >= 135 && avatar.position.z <= 165) {
    // FSM.transite("TUTORIAL");
  }
}