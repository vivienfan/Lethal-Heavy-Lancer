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
    this._fwdSpeed = 0;
    this._sideSpeed = 0;
    this._totalHealth = 100;
    this._currentHealth = 100;
    this.update(props);
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get messageFormat() {
    return {
      'id': this._id,
      'type': this._type,
      'position': this._position,
      'rotation': this._rotation,
      'fwdSpeed': this._fwdSpeed,
      'sideSpeed': this._sideSpeed,
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
    this._fwdSpeed = props.fwdSpeed || this._fwdSpeed;
    this._sideSpeed = props.sideSpeed || this._sideSpeed;
    this._totalHealth = props.totalHealth || this._totalHealth;
    this._currentHealth = props.currentHealth || this._currentHealth;
  }

  process(dt) {
    this._rotation.y += 0.002 * dt
    // camera.rotation.x += 1.0 * DT
    // camera.rotation.x = Math.min(Math.max(camera.rotation.x, -Math.PI/2), Math.PI/2)
    this._fwdSpeed = 0.01;
    this._position.x -= this._fwdSpeed * Math.sin(this._rotation.y + Math.PI) * dt;
    this._position.z -= this._fwdSpeed * Math.cos(this._rotation.y + Math.PI) * dt;
    this._position.x -= this._sideSpeed * -Math.cos(this._rotation.y + Math.PI) * dt;
    this._position.z -= this._sideSpeed * Math.sin(this._rotation.y + Math.PI) * dt;

  }

}

module.exports = Character;