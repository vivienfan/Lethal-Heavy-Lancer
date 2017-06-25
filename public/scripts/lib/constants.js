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
    REMOVE: 4,    // for both npc and player
    GAME_END: 5,  // when all npc die in a game instance
    GAME_START: 6 // start a game -> need this when u create loop of games
  },

// Types of missions
  MISSION_TYPE: {
    KILL: 0,
    STEAL: 1
  },

  MISSION: {
    MAX_PLAYERS: 4,
    NUM_ENEMIES: 12
  },

// Player attributes
  PLAYER: {
    INITIAL_HEALTH: 200,
    MAX_SPEED: 0.9,
    RANGE: 100
  },

// NPC attributes
  NPC: {
    MAX_FWD_SPEED: 2.5,
    DETECTION_RANGE: 8
  },

// Map attributes
  MAP: {
    DEFAULT_SIZE: 70,
    ELEMENT_SIZE: 25,
    MIN_ROOMS: 14,
    MAX_ROOMS: 18,
    MIN_ROOM_SIZE: 4,
    MAX_ROOM_SIZE: 10,
    FAIL_CUTOFF: 100,
    SAFE_DISTANCE: 6
  }
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = CONSTANTS;
}
