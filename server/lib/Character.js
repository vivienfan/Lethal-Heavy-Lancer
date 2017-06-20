'use strict';

// character.js

const uuidV4 = require('uuid/v4');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Character {
  constructor(props) {
    props = props || {}
    this.id = uuidV4();
    this.type = CONSTANTS.CHAR_TYPE.ENEMY
    this.firing = false;
    this.range = 100;
    this.damage = 50;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.fwdSpeed = 0;
    this.rotYSpeedMax = 0.02;
    this.rotYSpeed = 0;
    this.sideSpeed = 0;
    this.totalHealth = 100;
    this.currentHealth = 100;
    this.target = null;
    this.update(props);
  }

  startFiring() {
    this.firing = true;
  }

  stopFiring() {
    this.firing = false;
  }

  takeDamage(amount) {
    this.currentHealth -= amount;
    return this.currentHealth <= 0;
  }

  isDead() {
    return this.currentHealth <= 0;
  }

  setTarget(target) {
    this.target = target
  }

  messageFormat() {
    return {
      'id': this.id,
      'type': this.type,
      'firing': this.firing,
      'range': this.range,
      'position': this.position,
      'rotation': this.rotation,
      'fwdSpeed': this.fwdSpeed,
      'rotYSpeed': this.rotYSpeed,
      'sideSpeed': this.sideSpeed,
      'totalHealth': this.totalHealth,
      'currentHealth': this.currentHealth
    }
  }

  process(dt) {
    if (this.type !== CONSTANTS.CHAR_TYPE.PLAYER) {
      // this.rotYSpeed = 0.02;
      // this.fwdSpeed = .5;
      if (this.target) {
        let diffPositionX = this.position.x - this.target.position.x
        let diffPositionZ = this.position.z - this.target.position.z
        let goalAngle = Math.atan2(diffPositionX, diffPositionZ)
        let diffAngle = (goalAngle - this.rotation.y + 2 * Math.PI) % (2 * Math.PI)
        if ( diffAngle > 0.08 && diffAngle <= Math.PI ) {
          this.rotYSpeed = Math.min(this.rotYSpeedMax, (diffAngle - 0.04) / 0.16 * this.rotYSpeedMax);
        } else if ( diffAngle < ( 2 * Math.PI - 0.08) && diffAngle > Math.PI){
          this.rotYSpeed = -Math.min(this.rotYSpeedMax, (2 * Math.PI - diffAngle + 0.04) / 0.16 * this.rotYSpeedMax);
        } else {
          this.rotYSpeed = 0
        }
      }
    } else {
      // console.log(this.fwdSpeed, this.sideSpeed)
    }
    this.rotation.y += (this.rotYSpeed * dt)
    // this.rotation.y %= Math.PI * 2
    this.position.x -= this.fwdSpeed * Math.sin(this.rotation.y + Math.PI) * dt;
    this.position.z -= this.fwdSpeed * Math.cos(this.rotation.y + Math.PI) * dt;
    this.position.x -= this.sideSpeed * -Math.cos(this.rotation.y + Math.PI) * dt;
    this.position.z -= this.sideSpeed * Math.sin(this.rotation.y + Math.PI) * dt;
  }

  update(props) {
    props = props || {}
    for ( let index in props )  {
      if ( this[index] !== undefined ) {
        this[index] = props[index];
        if(index === "position") {}
      }
    }
    // this._id = props.id || this._id;
    // this._type = props.type === undefined ? this._type : props.type
    // if ( props.position ) {
    //   this._position.x = props.position.x === undefined ? this._position.x : props.position.x
    //   this._position.y = props.position.y === undefined ? this._position.y : props.position.y
    //   this._position.z = props.position.z === undefined ? this._position.z : props.position.z
    // }
    // if ( props.rotation ) {
    //   this._rotation.x = (props.rotation.x === undefined ? this._rotation.x : props.rotation.x)
    //   this._rotation.y = (props.rotation.y === undefined ? this._rotation.y : props.rotation.y)
    //   this._rotation.z = (props.rotation.z === undefined ? this._rotation.z : props.rotation.z)
    // }
    // this._fwdSpeed = props.fwdSpeed === undefined ? this._fwdSpeed : props.fwdSpeed
    // this._rotYSpeed = props.rotYSpeed === undefined ? this._rotYSpeed : props.rotYSpeed
    // this._sideSpeed = props.sideSpeed === undefined ? this._sideSpeed : props.sideSpeed
    // this._totalHealth = props.totalHealth === undefined ? this._totalHealth : props.totalHealth
    // this._currentHealth = props.currentHealth === undefined ? this._currentHealth : props.currentHealth
  }

  // autoUpdate(obj, props) {
  //   props = props || {}
  //   for ( let index in props )  {
  //     if ( obj["_"+index] !== undefined ) {
  //       console.log(typeof props[index] === "object" ? Object.keys(props[index]) : "not object")
  //       obj["_"+index] = props[index];
  //     } else if ( obj[index] !== undefined ) {
  //       obj[index] = props[index];
  //     }
  //   }
  // }


}

module.exports = Character;