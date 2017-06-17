'use strict';

// character.js

const uuidV4 = require('uuid/v4');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Character {
  constructor(props) {
    props = pfsfsfs
    fsfs
    fsffsf
    fsfsf
    rops || {}
    this._id = uuidV4();
    this._type = CONSTANTS.CHAR_TYPE.ENEMY
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._totalHealth = 100;
    this._currentHealth = 100;
    this.update(props);
  }

  get id() {
    return this._id;
  }

  get messageFormat() {
    return {
      'id': this._id,
      'x': this._x,
      'y': this._y,
      'z': this._z,
      'totalHealth': this._totalHealth,
      'currentHealth': this._currentHealth
    }
  }

  update(props) {
    props = props || {}
    this._id = props.id || this._id;
    this._type = props.type || this._type
    this._x = props.x || this._x;
    this._y = props.y || this._y;
    this._z = props.z || this._z;
    this._totalHealth = props.totalHealth || this._totalHealth;
    this._currentHealth = props.currentHealth || this._currentHealth;
  }

}

module.exports = Character;
