'use strict';
// GameMap.js

const uuidV4 = require('uuid/v4');
const CONSTANTS = require("../../public/scripts/lib/constants");

class GameMap {
  constructor(props) {
    props = props || {}
    this.id = uuidV4();
    this.grid = []
    this.elementSize = CONSTANTS.MAP.ELEMENT_SIZE
    this.startPos = [1,1]
    let x = props.x || CONSTANTS.MAP.DEFAULT_SIZE
    let z = props.z || CONSTANTS.MAP.DEFAULT_SIZE
    let type = props.type || CONSTANTS.MISSION_TYPE.KILL
    this.generateMap(x,z)
    // this.update(props);
  }

  messageFormat() {
    let messageGrid = this.grid.map(x => {
      return x.map(z => {
        return z.messageFormat()
      })
    })
    return {
      'id': this.id,
      'grid': messageGrid,
      'elementSize': this.elementSize
    }
  }

  generateMap(width,length) {
    for (var x = 0; x < width; x++) {
      this.grid[x] = []
      for (var z = 0; z < length; z++) {
        this.grid[x][z] = new MapElement()
        if ( !this.isEdge(x,z, width, length) ) {
          this.grid[x][z].open()
        }
      }
    }
  }

  isEdge(x,z, width, length) {
    return ( x === 0 || z === 0 || x === width - 1 || z === length - 1)
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

class MapElement {
  constructor(props) {
    props = props || {}
    this.isObstacle = props.isObstacle !== undefined ? props.isObstacle : true
  }

  messageFormat() {
    return {
      'isObstacle': this.isObstacle
    }
  }

  open() {
    this.isObstacle = false
  }

  block() {
    this.isObstacle = true
  }

}

module.exports = GameMap;