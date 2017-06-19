// constants.js

var CONSTANTS = {

// Character types
  CHAR_TYPE: {
    ENEMY: 0,
    PLAYER: 1,
    ALLY: 2
  },

// Message types being sent through sockets
  MESSAGE_TYPE: {
    GAME_STATE: 0,
    UPDATE: 1,
    PLAYER_INFO: 2,
    FIRE: 3
  },

// Types of missions
  MISSION_TYPE: {
    KILL: 0
  },

// Player attributes
  PLAYER: {
    INITIAL_HEALTH: 100
  }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = CONSTANTS;
}
