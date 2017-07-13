function startGame() {
  console.log("start game");

  socket = new WebSocket(`ws://${window.location.hostname}:8081`);
  console.log('sent socket request')
  socket.onopen = function (event) {
    console.log('socket open')
  }

  socket.onmessage = (event) => {
    console.log('got message')
    var data = JSON.parse(event.data);
    switch(data.type) {
      case CONSTANTS.MESSAGE_TYPE.PLAYER_INFO:
        console.log('game init')
        initWorld(data.data, data.mission, data.map.grid);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_STATE:
        updateCharacters(data.mission.characters);
        updateGameState(data.mission.numPlayers, data.mission.remainingEnemies, data.mission.totalEnemies);
        break;
      case CONSTANTS.MESSAGE_TYPE.FIRE:
        displayPlayerFire(data.data.id);
        break;
      case CONSTANTS.MESSAGE_TYPE.REMOVE:
        removeCharacter(data.character);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_END:
        displayGameWin();
        break;
      default:
        break;
    }
  }
}

function initWorld(player, mission, map) {
  console.log("init world");
  playerStatus = new Player(player, mission);
  createGameScene(map);
}

function updateGameState(numPlayers, remainingEnemies, totalEnemies) {
  npcStats.innerHTML = remainingEnemies + "/" + totalEnemies;
  playerStats.innerHTML = numPlayers;
}