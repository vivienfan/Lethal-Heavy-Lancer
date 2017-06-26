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
    GAME_START: 6, // start a game -> need this when u create loop of games
    PLAYER_READY: 7
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
  },

  // client side constants:
  GROUND_LEVEL: -2.2,

  WORLD_OFFSET: -5,

  ANGLE: Math.PI / 180,

  CAMERA: {
    UP_ANGLE_MAX: 135 * Math.PI / 180,
    DOWN_ANGLE_MAX: 80 * Math.PI / 180,
    HEIGHT_OFFSET: 1.5,
    ALPHA_OFFSET: -Math.PI / 2,
    BETA_OFFSET:  Math.PI / 2 + 5 * Math.PI / 180,
    RADIUS: 1.5
  },

  AIM_OFFSET: 7 * Math.PI/180

  // SPACESHIP_ELLIPSOID:

  // TOTAL_BUILDINGS:

  // HEALTH_COLOR: {
  //   FULL:
  //   HIGHT:
  //   HALF:
  //   LOW:
  //   VERY_LOW:
  // }

}

if (typeof module !== "undefined" && module.exports) {
    module.exports = CONSTANTS;
}
