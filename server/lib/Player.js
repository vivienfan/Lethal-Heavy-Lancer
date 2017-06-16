
'use strict';

// Player.js

const uuidV4 = require('uuid/v4');
const Mission = require('./Mission');
const Character = require('./Character');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Player {
  constructor(props) {
    props = props || {}
    this._id = props.id || uuidV4();
    this._currentMission = props.currentMission || null;
    this._totalHealth = props.totalHealth || 100;
    this._currentHealth = props.currentHealth || 100;
  }

  get id() {
    return this._id;
  }

  get currentMission() {
    return this._currentMission
  }

  get totalHealth() {
    return this._totalHealth
  }

  get currentHealth() {
    return this._currentHealth
  }

  get type() {
    return CONSTANTS.CHAR_TYPE.PLAYER
  }

  joinMission(mission) {
    if (mission instanceof Mission) {
      this._currentMission = mission;
    } else {
      this._currentMission = new Mission(mission)
    }

    let player_char_stats = this.messageFormat
    console.log("player type: ", player_char_stats.type = this.type)
    // return this._currentMission.addCharacter(new Character(player_char_stats))
  }

  messageFormat() {
    return {
      'id': this._id,
      'totalHealth': this._totalHealth,
      'currentHealth': this._currentHealth
    }
  }

}

module.exports = Player;