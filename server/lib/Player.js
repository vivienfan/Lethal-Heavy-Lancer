
'use strict';

// Player.js

const uuidV4 = require('uuid/v4');
const Mission = require('./Mission');
const Character = require('./Character');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Player {
  constructor(props) {
    props = props || {}
    this.id = props.id || uuidV4();
    this.type = CONSTANTS.CHAR_TYPE.PLAYER
    this.currentMission = props.currentMission || null;
    this.range = 100;
    this.totalHealth = props.totalHealth || CONSTANTS.PLAYER.INITIAL_HEALTH;
    this.currentHealth = props.currentHealth || CONSTANTS.PLAYER.INITIAL_HEALTH;
    this.damage = props.damage || CONSTANTS.PLAYER.DAMAGE
    this.rotation = {x: 0, y: Math.PI * -1/4, z: 0}
    this.position = {x: 0, y:0, z:0}
    this.ws = props.ws || null
  }

  joinMission(mission) {
    if (mission instanceof Mission) {
      this.currentMission = mission;
    } else {
      this.currentMission = new Mission(mission)
    }
    this.position = this.currentMission.map.getStartPosition()
    return this.currentMission.addCharacter(this)
  }

  setMission(mission) {
    this.currentMission = mission
  }

  messageFormat() {
    return {
      'id': this.id,
      'type': this.type,
      'totalHealth': this.totalHealth,
      'currentHealth': this.currentHealth
    }
  }

}

module.exports = Player;