'use strict';

// Mission.js


const uuidV4    = require('uuid/v4');
const Character = require('./Character');
const CONSTANTS = require("../../public/scripts/lib/constants");

class Mission {
  constructor(props) {
    props = props || {}
    this._id = props.id || uuidV4();
    this._type = props.type || CONSTANTS.MISSION_TYPE.KILL;
    this._characters = props.characters || [];
  }

  addCharacter(character) {
    if (!(character instanceof Character)) {
      character = new Character(character);
    }
    this._characters.push(character);
    return this
  }

  removeCharacter(character) {
    console.log("remove char called")
    let index = this._characters.findIndex(function(element) {
      return element.id === character.id;
    });

    console.log("index is", index)
    if (index > -1) {
     this._characters.splice(index, 1)
    }
    return this
  }

  messageFormat(playerId) {
    let foundUser = this._characters[playerId]
    // console.log(foundUser)
    let result = {
      'id': this._id,
      'type': this._type,
      'characters': this._characters.map(character => {
        return character.messageFormat();
      })
    }

    return result;
  }

  get characters() {
    return this._characters
  }

  update(dt) {
    this._characters.forEach((character, i) => {
      if (character.type !== CONSTANTS.CHAR_TYPE.PLAYER) {
        // console.log("character", i, "is not player, processing", character)
        character.process(dt)
      }
    })
  }
}

module.exports = Mission;