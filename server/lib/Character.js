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
    this.range = 3;
    this.moveRange = 3
    this.attackRange = 10
    this.damage = 50;
    this.attackSpeed = 0.75 * 1000
    this.lastAttack = 0
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.fwdSpeed = 0;
    this.fwdSpeedMax = 0.34;
    this.rotYSpeedMax = 0.04;
    this.rotYSpeed = 0;
    this.sideSpeed = 0;
    this.totalHealth = 100;
    this.currentHealth = 100;
    this.target = null;
    this.movePosition;
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

  setMovePosition(target) {

  }

  moveTo(position) {
    let diffPositionX = this.position.x - position.x
    let diffPositionZ = this.position.z - position.z
    let goalAngle = Math.atan2(diffPositionX, diffPositionZ)
    let diffAngle = (goalAngle - this.rotation.y + 4 * Math.PI) % (2 * Math.PI)
    if ( diffAngle > 0.08 && diffAngle <= Math.PI ) {
      this.rotYSpeed = Math.min(this.rotYSpeedMax, (diffAngle - 0.04) / 0.16 * this.rotYSpeedMax);
    } else if ( diffAngle < ( 2 * Math.PI - 0.08) && diffAngle > Math.PI){
      this.rotYSpeed = -Math.min(this.rotYSpeedMax, (2 * Math.PI - diffAngle + 0.04) / 0.16 * this.rotYSpeedMax);
    } else {
      this.rotYSpeed = 0

    }
    if ( diffAngle < 0.16 && diffAngle <= Math.PI || diffAngle > ( 2 * Math.PI - 0.16) && diffAngle > Math.PI) {
      let distSqr = diffPositionX * diffPositionX + diffPositionZ * diffPositionZ
      let rangeSqr = this.range * this.range * .8
      this.fwdSpeed = Math.max(0, Math.min(this.fwdSpeedMax, ( distSqr - rangeSqr ) / 24 * this.fwdSpeedMax))
    }
  }

  isWithinRange(range, target) {
    let distSqr = this.findDistSqr(target)
    return (distSqr <= (this.range * this.range));
  }

  findDistSqr(target) {
    let diff = {
      x: target.position.x - this.position.x,
      y: target.position.y - this.position.y,
      z: target.position.z - this.position.z}
    return diff.x * diff.x + diff.y * diff.y + diff.z * diff.z
  }

  fireOn(target) {
    this.startFiring()
    if ( target && target.id ) {
      if ( this.canHit(target) ) {
        target.takeDamage(this.damage);
      }
      return target.isDead()
    }
  }

  canHit(target) {
    return this.isWithinRange(this.attackRange, target)
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

  process(dt, map) {
    if (this.type !== CONSTANTS.CHAR_TYPE.PLAYER) {
      // this.rotYSpeed = 0.02;
      // this.fwdSpeed = .5;
      this.fwdSpeed = 0
      if (this.target) {
        let path = map.getGamePath(this.position, this.target.position)
        if ( path && path.length > 2 ) {
          this.movePosition = path[1]
          this.range = this.moveRange
          // if(this.position.x)          console.log('npc position', this.position)
        } else if ( path && path.length === 2) {
          this.movePosition = Object.assign({}, this.target.position)
          this.range = this.attackRange
        }
        if( this.movePosition ){
          // console.log("moving to pos:", this.movePosition, 'currPos', this.position)
          this.moveTo(this.movePosition)
        }
        let timeSinceAttack = Date.now() - this.lastAttack
        if ( this.target instanceof Character && this.canHit(this.target) && timeSinceAttack > this.attackSpeed) {
          this.lastAttack = Date.now()
          this.fireOn(this.target)
        }
      }
      this.rotation.y += this.rotYSpeed * dt
      this.rotation.y %= Math.PI * 2
      this.position.x += this.fwdSpeed * Math.sin(this.rotation.y + Math.PI) * dt;
      this.position.z += this.fwdSpeed * Math.cos(this.rotation.y + Math.PI) * dt;
      this.position.x += this.sideSpeed * -Math.cos(this.rotation.y + Math.PI) * dt;
      this.position.z += this.sideSpeed * Math.sin(this.rotation.y + Math.PI) * dt;
    } else {

    }
  }

  update(props) {
    props = props || {}
    for ( let index in props )  {
      if ( this[index] !== undefined ) {
        this[index] = props[index];
        if(index === "position") {}
      }
    }
  }

}

module.exports = Character;