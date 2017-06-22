'use strict';
// GameMap.js

const uuidV4      = require('uuid/v4');
const CONSTANTS   = require('../../public/scripts/lib/constants');
const PF  = require('pathfinding')

class GameMap {
  constructor(props) {
    props = props || {}
    this.id = uuidV4();
    this.grid = []
    this.elementSize = CONSTANTS.MAP.ELEMENT_SIZE
    this.startPos = [1,1]
    let x = props.x || CONSTANTS.MAP.DEFAULT_SIZE
    let z = props.z || CONSTANTS.MAP.DEFAULT_SIZE
    this.pfGrid = new PF.Grid(x, z)
    let type = props.type || CONSTANTS.MISSION_TYPE.KILL
    let seed = props.seed || this.id
    this.generateMap(x, z, seed)
    this.finder = new PF.AStarFinder({
      // allowDiagonal: true
      // diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle
      diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles
    });
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

  generateMap(width,length, seed) {
    for (var x = 0; x < width; x++) {
      this.grid[x] = []
      for (var z = 0; z < length; z++) {
        this.grid[x][z] = new MapElement()
        if ( this.isEdge(x,z, width, length) ) {
          // this.grid[x][z].block()
          this.block(x, z)
        }
      }
    }
    if ( seed === 'empty' ){

    } else if ( seed === 'test' ) {
      this.block(4,6)
    }
  }

  isEdge(x,z, width, length) {
    return ( x === 0 || z === 0 || x === width - 1 || z === length - 1)
  }

  block(x, z) {
    // console.log(x, z, this.grid[x][z])
    this.grid[x][z].block()
    this.pfGrid.setWalkableAt(x, z, false)
  }

  open(x, z) {
    this.grid[x][z].open()
    this.pfGrid.setWalkableAt(x, z, true)
  }

  isObstacle(x, z) {
    return this.grid[x][z].isObstacle
  }

  getStartPosition() {
    let startX = (this.startPos[0] + 0.5) * this.elementSize
    let startZ = (this.startPos[1] + 0.5) * this.elementSize
    return {x: startX, y: 0, z: startZ}
  }

  getPath(p0, p1) {
    let path = this.finder.findPath(p0.x, p0.z, p1.x, p1.z, this.pfGrid.clone())
      path = PF.Util.compressPath(path)
    if (path.length > 0) {
      path = PF.Util.smoothenPath(this.pfGrid, path)
    }
    return path;
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
    this.isObstacle = props.isObstacle ? props.isObstacle : false
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