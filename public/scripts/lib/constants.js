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
    FIRE: 3,
    REMOVE: 4
  },

// Types of missions
  MISSION_TYPE: {
    KILL: 0,
    STEAL: 1
  },

// Player attributes
  PLAYER: {
    INITIAL_HEALTH: 100
  },

  MAP: {
    DEFAULT_SIZE: 64,
    ELEMENT_SIZE: 15,
    MIN_ROOMS: 12,
    MAX_ROOMS: 15,
    MIN_ROOM_SIZE: 6,
    MAX_ROOM_SIZE: 12,
    FAIL_CUTOFF: 100,
    SAFE_DISTANCE: 6
  }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = CONSTANTS;
}
