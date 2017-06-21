'use strict';
// MapSegment.js

const uuidV4 = require('uuid/v4');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Character {
  constructor(props) {
    props = props || {}
    this.id = uuidV4();
    this.type = CONSTANTS.CHAR_TYPE.ENEMY
    this.firing = false;
    this.range = 10;
    this.damage = 50;
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
    this.update(props);
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