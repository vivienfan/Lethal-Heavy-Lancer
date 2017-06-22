'use strict';
// GameMap.js

const uuidV4      = require('uuid/v4');
const CONSTANTS   = require('../../public/scripts/lib/constants');
const PF          = require('pathfinding');
const seedRandom  = require('seedrandom')

class GameMap {
  constructor(props) {
    props = props || {}
    this.id = uuidV4();
    this.grid = []
    this.rooms = []
    this.elementSize = CONSTANTS.MAP.ELEMENT_SIZE
    this.startPos = [1,1]
    this.mapSize = props.mapSize || CONSTANTS.MAP.DEFAULT_SIZE
    this.pfGrid = new PF.Grid(this.mapSize, this.mapSize)
    let type = props.type || CONSTANTS.MISSION_TYPE.KILL
    this.seed = props.seed || this.id
    this.rng = new seedRandom(this.seed)
    this.generateMap(this.mapSize, this.seed)
    this.finder = new PF.AStarFinder({
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

  generateMap(size, seed) {
    for (var x = 0; x < size; x++) {
      this.grid[x] = []
      for (var z = 0; z < size; z++) {
        this.grid[x][z] = new MapElement()
        // this.block(x, z)
      }
    }
    if ( seed === 'empty' ){

    } else if ( seed === 'test' ) {
      this.block(4,6)
    } else {
      this.generateRooms()
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

  isRowEmpty(z) {
    for (var x = 0; x < this.grid.length; x++) {
      if (this.grid[x][z].isObstacle) return false;
    }
    return true
  }

  isColumnEmpty(x) {
    for (var z = 0; z < this.grid[x].length; z++) {
      if (this.grid[x][z].isObstacle) return false;
    }
    return true
  }

  trimGrid() {

  }

  isObstacle(x, z) {
    return this.grid[x][z].isObstacle
  }

  isBlank(x, z) {
    return this.grid[x][z].isBlank
  }

  getStartPosition() {
    let startX = (this.startPos[0] + 0.5) * this.elementSize
    let startZ = (this.startPos[1] + 0.5) * this.elementSize
    return {x: startX, y: 0, z: startZ}
  }

  generateEnemyPosition() {

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

  generateRooms() {
    // genroomstart
      let room_count = this.GetRandom(10, 12);
      let minSize = 5;
      let maxSize = 10;
      let cutoff = CONSTANTS.MAP.FAIL_CUTOFF

      for (let i = 0; i < room_count && cutoff > 0; i++) {
          let room = {};
          // console.log('creating room, map size', this.mapSize)

          room.x = this.GetRandom(1, this.mapSize - maxSize - 1);
          room.y = this.GetRandom(1, this.mapSize - maxSize - 1);
          room.w = this.GetRandom(minSize, maxSize);
          room.h = this.GetRandom(minSize, maxSize);

          if (this.DoesCollide(room)) {
            // console.log('collides', this.rooms.length)
              i--;
              cutoff--;
              continue;
          }
          room.w--;
          room.h--;

          this.rooms.push(room);
          // console.log('added a room')
      }
      room_count = this.rooms.length
      this.SquashRooms();

      for (let i = 0; i < room_count; i++) {
          let roomA = this.rooms[i];
          let roomB = this.FindClosestRoom(roomA);

          let pointA = {
              x: this.GetRandom(roomA.x, roomA.x + roomA.w),
              y: this.GetRandom(roomA.y, roomA.y + roomA.h)
          };
          let pointB = {
              x: this.GetRandom(roomB.x, roomB.x + roomB.w),
              y: this.GetRandom(roomB.y, roomB.y + roomB.h)
          };

          while ((pointB.x != pointA.x) || (pointB.y != pointA.y)) {
              if (pointB.x != pointA.x) {
                  if (pointB.x > pointA.x) pointB.x--;
                  else pointB.x++;
              } else if (pointB.y != pointA.y) {
                  if (pointB.y > pointA.y) pointB.y--;
                  else pointB.y++;
              }

              // this.map[pointB.x][pointB.y] = 1;
              this.open(pointB.x, pointB.y)
          }
      }

      for (let i = 0; i < room_count; i++) {
          let room = this.rooms[i];
          for (let x = room.x; x < room.x + room.w; x++) {
              for (let y = room.y; y < room.y + room.h; y++) {
                  // this.map[x][y] = 1;
                  this.open(x,y)
              }
          }
      }

      for (let x = 0; x < this.mapSize; x++) {
          for (let y = 0; y < this.mapSize; y++) {
              // if (this.map[x][y] == 1) {
              if (!this.isObstacle(x,y) && !this.isBlank(x,y)) {
                  for (let xx = x - 1; xx <= x + 1; xx++) {
                      for (let yy = y - 1; yy <= y + 1; yy++) {
                          // if (this.map[xx][yy] == 0) this.map[xx][yy] = 2;
                          if (this.grid[xx] && this.grid[xx][yy] && this.isBlank(xx,yy)) this.block(xx,yy);
                      }
                  }
              }
          }
      }
  }
  FindClosestRoom(room) {
      let mid = {
          x: room.x + (room.w / 2),
          y: room.y + (room.h / 2)
      };
      let closest = null;
      let closestDistance = 1000;
      for (let i = 0; i < this.rooms.length; i++) {
          let check = this.rooms[i];
          if (check == room) continue;
          let check_mid = {
              x: check.x + (check.w / 2),
              y: check.y + (check.h / 2)
          };
          let distance = Math.min(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2), Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2));
          if (distance < closestDistance) {
              closestDistance = distance;
              closest = check;
          }
      }
      return closest;
  }
  SquashRooms() {
      for (let i = 0; i < 10; i++) {
          for (let j = 0; j < this.rooms.length; j++) {
              let room = this.rooms[j];
              while (true) {
                  let old_position = {
                      x: room.x,
                      y: room.y
                  };
                  if (room.x > 1) room.x--;
                  if (room.y > 1) room.y--;
                  if ((room.x == 1) && (room.y == 1)) break;
                  if (this.DoesCollide(room, j)) {
                      room.x = old_position.x;
                      room.y = old_position.y;
                      break;
                  }
              }
          }
      }
  }
  DoesCollide(room, ignore) {
      for (let i = 0; i < this.rooms.length; i++) {
          if (i == ignore) continue;
          let check = this.rooms[i];

          if (!((room.x + room.w < check.x) || (room.x > check.x + check.w) || (room.y + room.h < check.y) || (room.y > check.y + check.h))) return true;
      }

      return false;
  }
  GetRandom(low, high) {
      return~~ (this.rng() * (high - low)) + low; // ~~ = equivalent to Math.floor(), usually faster
  } // see http://rocha.la/JavaScript-bitwise-operators-in-practice
  // genroomend
}

class MapElement {
  constructor(props) {
    props = props || {}
    // this.isObstacle = props.isObstacle ? props.isObstacle : false
    this.isObstacle = false
    this.isBlank = true
  }

  messageFormat() {
    return {
      'isObstacle': this.isObstacle
    }
  }

  open() {
    this.isObstacle = false
    this.isBlank = false
  }

  block() {
    this.isObstacle = true
    this.isBlank = false
  }

}

module.exports = GameMap;