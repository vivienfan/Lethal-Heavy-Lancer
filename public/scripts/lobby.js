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

function disposeLobby() {
  engine.displayLoadingUI();
  scene.dispose();
}