function startTutorial() {
  playerStatus = {
    id: "currentPlayer",
    position: {
      x: 105,
      y: 0,
      z: 40
    },
    rotation: {
      x: 0,
      y: Math.PI,
      z: 0
    }
  };

  createTutorialScene();
}

var dummyNPC = {
  id: "dummyNPC",
  type: CONSTANTS.CHAR_TYPE.ENEMY,
  position: {
    x: 120,
    y: 5,
    z: 350
  },
  rotation: {
    x: 0,
    y: - Math.PI / 4,
    z: 0
  },
  fwdSpeed: 0,
  rotYSpeed: 0,
  sideSpeed: 0,
  totalHealth: 100,
  currentHealth: 100
};

var dummyPlayer = {
  id: "dummyPlayer",
  type: CONSTANTS.CHAR_TYPE.PLAYER,
  position: {
    x: 100,
    y: 0,
    z: 330
  },
  rotation: {
    x: 10 * Math.PI / 180,
    y: - 3 * Math.PI / 4,
    z: 0
  },
  fwdSpeed: 0,
  rotYSpeed: 0,
  sideSpeed: 0,
  totalHealth: 50,
  currentHealth: 200
};

var BUILT = false;
var BUILT2 = false;

function checkTutorialStage() {
  if (avatar.position.z <= 220) {
  // stage 1:
  // look around
  // look up and down
  // move around
  // drop building -> collision
  } else if (avatar.position.z <= 400) {
    if (!BUILT) {
      // stage 2:
      BUILT = true;
      // drop npc and player
      buildNewNPC(dummyNPC);
      buildNewPlayer(dummyPlayer);
      // player shooting npc
      // player ship burning
      // npc moving / attacking
      simulateBattle();
    }
  } else if (avatar.position.z <= 560) {
    if (!BUILT2) {
      simulateDamage();
      BUILT2 = true;
    }
  } else {
    // health.classList.add("hide");
    FSM.transite("LOBBY");
  }
}

function simulateBattle() {
  var npc_mesh = scene.getMeshByName("dummyNPC");

  highlight.addMesh(npc_mesh, BABYLON.Color3.Red());
  highlight.innerGlow = false;
  highlight.blurHorizontalSize = 0.5;
  highlight.blurVerticalSize = 0.5;

  setTimeout(function() {
    displayPlayerFire("dummyPlayer");
  }, 200);

  setTimeout(function() {
    displayPlayerFire("dummyPlayer");
  }, 900);

  setTimeout(function() {
    displayPlayerFire("dummyPlayer");
  }, 1600);

  setTimeout(function() {
    displayPlayerFire("dummyPlayer");
  }, 2300);

  setTimeout(function() {
    removePlayer("dummyPlayer");
    highlight.removeMesh(npc_mesh);
  }, 3200);
}

function simulateDamage() {
  health.classList.remove("hide");
  updateHealthBar(100, 100);

  setTimeout(function() {
    updateHealthBar(80, 100);
  }, 400);

  setTimeout(function() {
    updateHealthBar(80, 100);
  }, 800);

  setTimeout(function() {
    updateHealthBar(70, 100);
  }, 1200);

  setTimeout(function() {
    updateHealthBar(60, 100);
  }, 1600);

  setTimeout(function() {
    updateHealthBar(50, 100);
  }, 2000);

  setTimeout(function() {
    updateHealthBar(40, 100);
  }, 2400);

  setTimeout(function() {
    updateHealthBar(30, 100);
  }, 2800);

  setTimeout(function() {
    updateHealthBar(20, 100);
  }, 3200);

  setTimeout(function() {
    updateHealthBar(10, 100);
  }, 3600);

  setTimeout(function() {
    updateHealthBar(5, 100);
  }, 4000);
}