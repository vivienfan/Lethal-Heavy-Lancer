'use strict';

// Mission.js


const uuidV4    = require('uuid/v4');
const Character = require('./Character');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Mission {
  constructor(props) {
    props = props || {}
    this.id = props.id || uuidV4();
    this.type = props.type || CONSTANTS.MISSION_TYPE.KILL;
    this.characters = []
    if ( Array.isArray(props.characters) ) {
      props.characters.forEach(character => {
        this.addCharacter(character)
      })
    }

  }

  addCharacter(character) {
    if (!(character instanceof Character)) {
      character = new Character(character);
    }
    this.characters.push(character);
    return this
  }

  removeCharacter(character) {
    let index = this.characters.findIndex(function(element) {
      return element.id === character.id;
    });

    if (index > -1) {
     this.characters.splice(index, 1)
    }
    return this
  }

  findCharacter(character) {
    let result = this.characters.find(function(element) {
      return element.id === character.id;
    });
    return result
  }

  findCharacterIndex(character) {
    let result = this.characters.findIndex(function(element) {
      return element.id === message.player.id;
    });
    return result
  }

  fireOn(origin, target) {
    if ( origin.id ) {
      if ( !(origin instanceof Character) ) {
        origin = this.findCharacter(origin)
      }
      origin.startFiring()

      if ( target.id ) {
        target = this.findCharacter(target)
        if ( target && this.canHit(origin, target) ) {
          target.takeDamage(origin.damage);
        }
        return target.isDead()
      }
    }
  }

  canHit(origin, target) {
    let diff = {
      x: target.position.x - origin.position.x,
      y: target.position.y - origin.position.y,
      z: target.position.z - origin.position.z}
    let distSqr = diff.x * diff.x + diff.y * diff.y + diff.z * diff.z
    return (distSqr <= (origin.range * origin.range));
  }

  messageFormat(playerId) {
    let foundUser = this.characters[playerId]
    let result = {
      'id': this.id,
      'type': this.type,
      'characters': this.characters.map(character => {
        return character.messageFormat();
      })
    }

    return result;
  }

  update(dt) {
    this.characters.forEach((character, i) => {
      if (character.type !== CONSTANTS.CHAR_TYPE.PLAYER) {
        character.process(dt)
      }
    })
  }
}

module.exports = Mission;