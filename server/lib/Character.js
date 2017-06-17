'use strict';

// character.js

const uuidV4 = require('uuid/v4');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Character {
  constructor(props) {
    props = props || {}
    this._id = uuidV4();
    this._type = CONSTANTS.CHAR_TYPE.ENEMY
    this._position = { x: 0, y: 0, z: 0 };
    this._rotation = { x: 0, y: 0, z: 0 };
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
      'position': this._position,
      'rotation': this._rotation,
      'totalHealth': this._totalHealth,
      'currentHealth': this._currentHealth
    }
  }

  update(props) {
    props = props || {}
    this._id = props.id || this._id;
    this._type = props.type || this._type
    if ( props.position ) {
      this._position.x = props.position.x || this._position.x;
      this._position.y = props.position.y || this._position.y;
      this._position.z = props.position.z || this._position.z;
    }
    if ( props.rotation ) {
      this._rotation.x = props.rotation.x || this._rotation.x;
      this._rotation.y = props.rotation.y || this._rotation.y;
      this._rotation.z = props.rotation.z || this._rotation.z;
    }
    this._totalHealth = props.totalHealth || this._totalHealth;
    this._currentHealth = props.currentHealth || this._currentHealth;
  }

}

module.exports = Character;