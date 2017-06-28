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
    this.startPos = [3,3]
    this.mapSize = props.mapSize || CONSTANTS.MAP.DEFAULT_SIZE
    this.maxX = this.maxZ = this.mapSize
    this.pfGrid = new PF.Grid(this.mapSize, this.mapSize)
    let type = props.type || CONSTANTS.MISSION_TYPE.KILL
    this.seed = props.seed || this.id
    this.rng = new seedRandom(this.seed)
    this.generateMap(this.mapSize, this.seed)
    this.finder = new PF.AStarFinder({
      // diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle
      // diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles
      allowDiagonal: true,
      dontCrossCorners: true
    });
    // this.trimGrid()
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
      }
    }
    if ( seed === 'empty' ){

    } else if ( seed === 'test' ) {
      this.block(4,6)
    } else {
      this.generateSquashedRooms()
    }
  }

  isEdge(x,z, width, length) {
    return ( x === 0 || z === 0 || x === width - 1 || z === length - 1)
  }

  block(x, z) {
    this.grid[x][z].block()
    this.pfGrid.setWalkableAt(x, z, false)
  }

  open(x, z) {
    this.grid[x][z].open()
    this.pfGrid.setWalkableAt(x, z, true)
  }

  clear(x, z) {
    this.grid[x][z].clear()
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
    // TODO
    for (var x = 0; x < this.grid.length; x++) {
      if (this.isColumnEmpty(x)) {
        this.grid.splice(x)
        break
      }
    }
    for (var z = 0; z < this.grid[0].length; z++) {
      if(this.isRowEmpty(z)) {
        for (var x = 0; x < this.grid.length; x++) {
          this.grid[x].splice(z)
        }
        break
      }
    }
  }

  isObstacle(x, z) {
    return this.grid[x][z].isObstacle
  }

  isGameObstacle(x, z) {
    let gridPos = this.convertToMapCoords({x: x, z: z})
    return this.isObstacle(gridPos.x, gridPos.z)
  }

  isBlank(x, z) {
    return this.grid[x][z].isBlank
  }

  isValid(x,z) {
    let valid = x >= 0 && x < this.maxX && z >= 0 && z < this.maxZ
    return valid && !this.isBlank(x,z) && !this.isObstacle(x,z)
  }

  getStartPosition() {
    return this.convertToGameCoords({x: this.startPos[0], y: 0, z: this.startPos[1]})
  }

  getMapStartPosition() {
    return {x: this.startPos[0], y: 0, z: this.startPos[1]}
  }

  generateEnemyPosition() {
    let x = 0
    let z = 0
    let valid
    let cutoff = CONSTANTS.MAP.NPC_FAIL_CUTOFF
    let safeDist = CONSTANTS.MAP.SAFE_DISTANCE
    do {
      cutoff--;
      if ( cutoff <= 0 ) {
        cutoff = CONSTANTS.MAP.NPC_FAIL_CUTOFF
        safeDist /= 2
      }
      x = this.GetRandom(1, this.grid.length - 2)
      z = this.GetRandom(1, this.grid[0].length - 2)
      valid = !this.isObstacle(x,z) && !this.isBlank(x,z) && this.getPath({x:this.startPos[0], z:this.startPos[1]}, {x: x, z: z}).length > 3
    } while (!valid)
    return this.convertToGameCoords({x: x, z: z})
  }

  generateEnemySpawnPosition(players) {
    let x = 0
    let z = 0
    let valid
    let steps = 3
    let cutoff = CONSTANTS.MAP.NPC_FAIL_CUTOFF
    let safeDist = CONSTANTS.MAP.SAFE_DISTANCE
    do {
      cutoff--
      if (cutoff <= 0) {
        cutoff = CONSTANTS.MAP.NPC_FAIL_CUTOFF
        steps--
      }
      let pickedRoom = this.rooms[this.GetRandom(1,this.rooms.length - 1)]
      x = this.GetRandom(pickedRoom.x, pickedRoom.x + pickedRoom.w)
      z = this.GetRandom(pickedRoom.y, pickedRoom.y + pickedRoom.h)
      valid = !this.isObstacle(x,z) && !this.isBlank(x,z) && this.isAwayFromPlayers(players, {x: x, z: z}, steps)
    } while (!valid)
    return this.convertToGameCoords({x: x, z: z})
  }

  generateEnemyMovePosition() {
    let x = 0
    let z = 0
    let valid
    let cutoff = CONSTANTS.MAP.NPC_FAIL_CUTOFF
    let safeDist = CONSTANTS.MAP.SAFE_DISTANCE
    do {
      cutoff--;
      if ( cutoff <= 0 ) {
        cutoff = CONSTANTS.MAP.NPC_FAIL_CUTOFF
        safeDist /= 2
      }
      x = this.GetRandom(1, this.mapSize - 2)
      z = this.GetRandom(1, this.mapSize - 2)
      valid = !this.isObstacle(x,z) && !this.isBlank(x,z) && x > safeDist && z > safeDist &&
              !this.isWithinPathSteps({x:this.startPos[0], z:this.startPos[1]}, {x: x, z: z}, 3)
    } while (!valid)
    return this.convertToGameCoords({x: x, z: z})
  }

  isAwayFromPlayers(players, target, steps) {
    for (var i = 0; i < players.length; i++) {
      if (this.isWithinPathSteps(this.convertToMapCoords(players[i].position), target, steps) ) {
        return false
      }
    }
    return true
  }

  isWithinPathSteps(origin, target, steps) {
    return this.getPath(origin, target).length <= steps
  }

  getPath(p0, p1) {
    let path
    if ( this.isValid(p0.x, p0.z) && this.isValid(p1.x, p1.z) ) {
      path = this.finder.findPath(p0.x, p0.z, p1.x, p1.z, this.pfGrid.clone())
      path = PF.Util.compressPath(path)
      if (path.length > 0) {
        path = PF.Util.smoothenPath(this.pfGrid, path)
        // path = PF.Util.expandPath(path);
      }
    }
    return path;
  }

  getGamePath(p0,p1) {
    let path = this.getPath(this.convertToMapCoords(p0),this.convertToMapCoords(p1))
    if ( path ) {
      path = path.map(point => {
        return this.convertToGameCoords({x: point[0], z: point[1]})
      })
    }
    return path
  }

  convertToGameCoords(position) {
    return {x: (position.x - 0.5) * CONSTANTS.MAP.ELEMENT_SIZE, y: 5, z: (position.z - 0.5) * CONSTANTS.MAP.ELEMENT_SIZE}
  }

  convertToMapCoords(position) {
    return {x: Math.ceil(position.x / CONSTANTS.MAP.ELEMENT_SIZE) , z: Math.ceil(position.z / CONSTANTS.MAP.ELEMENT_SIZE)}
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

  generateSquashedSeriesRooms() { // adapted from https://jsfiddle.net/bigbadwaffle/YeazH/
    // genroomstart
    let room_count = this.GetRandom(CONSTANTS.MAP.MIN_ROOMS, CONSTANTS.MAP.MAX_ROOMS);
    let minSize = CONSTANTS.MAP.MIN_ROOM_SIZE;
    let maxSize = CONSTANTS.MAP.MAX_ROOM_SIZE;
    let cutoff = CONSTANTS.MAP.ROOM_FAIL_CUTOFF

    let startRoom = new Room(this, 6, 6, 'start')
    this.SquashSingleRoom(startRoom)
    this.rooms.push(startRoom)

    for (let i = 1; i < room_count && cutoff > 0; i++) {
      let room  = new Room(this, minSize, maxSize)

      if (this.DoesCollide(room)) {
        i--;
        cutoff--;
        continue;
      }
      this.SquashSingleRoom(room)
      room.w--;
      room.h--;

      if (this.rooms.length > 0) this.ConnectRooms(room, this.rooms)

      this.rooms.push(room);
    }
    if (cutoff <= 0) console.log("reached cutoff")
    room_count = this.rooms.length

    for (let i = 0; i < room_count; i++) {
      this.rooms[i].process(this)
    }

    this.renderWalls()
  }

  generateSquashedRooms() { // adapted from https://jsfiddle.net/bigbadwaffle/YeazH/
    // genroomstart
    let room_count = this.GetRandom(CONSTANTS.MAP.MIN_ROOMS, CONSTANTS.MAP.MAX_ROOMS);
    let minSize = CONSTANTS.MAP.MIN_ROOM_SIZE;
    let maxSize = CONSTANTS.MAP.MAX_ROOM_SIZE;
    let cutoff = CONSTANTS.MAP.ROOM_FAIL_CUTOFF

    let startRoom = new Room(this, 6, 6, 'start')
    this.SquashSingleRoom(startRoom)
    this.rooms.push(startRoom)

    for (let i = 1; i < room_count && cutoff > 0; i++) {
      let room  = new Room(this, minSize, maxSize)
      if (this.DoesCollide(room)) {
        i--;
        cutoff--;
        continue;
      }
      room.w--;
      room.h--;
      this.rooms.push(room);
    }
    room_count = this.rooms.length

    this.SquashRooms()

    for (let i = room_count - 1; i >= 0; i--) {
      this.rooms[i].process(this)
    }

    this.renderWalls()
  }

  renderWalls() {
    for (let x = 0; x < this.mapSize; x++) {
      for (let y = 0; y < this.mapSize; y++) {
        if (!this.isObstacle(x,y) && !this.isBlank(x,y)) {
          for (let xx = x - 1; xx <= x + 1; xx++) {
            for (let yy = y - 1; yy <= y + 1; yy++) {
              if (this.grid[xx] && this.grid[xx][yy] && this.isBlank(xx,yy)) this.block(xx,yy);
            }
          }
        }
      }
    }
  }

  FindClosestRoom(room, rooms) {
    let closest = rooms[this.FindClosestRoomIndex(room, rooms)]
    return closest;
  }
  FindClosestRoomIndex(room, rooms) {
    let mid = {
      x: room.x + (room.w / 2),
      y: room.y + (room.h / 2)
    };
    let closestIndex = null;
    let closestDistance = 1000;
    for (let i = 0; i < rooms.length; i++) {
      let check = rooms[i];
      if (check == room) continue;
      let check_mid = {
        x: check.x + (check.w / 2),
        y: check.y + (check.h / 2)
      };
      let distance = Math.min(Math.abs(Math.abs(mid.x - check_mid.x) - (room.w / 2) - (check.w / 2)), Math.abs(Math.abs(mid.y - check_mid.y) - (room.h / 2) - (check.h / 2)) );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    return closestIndex;
  }
  SquashRooms() {
    for (let i = 0; i < 15; i++) {
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
  SquashSingleRoom(room) {
    while (true) {
      let old_position = {
        x: room.x,
        y: room.y
      };
      if (room.x > 1) room.x--;
      if (room.y > 1) room.y--;
      if ((room.x == 1) && (room.y == 1)) break;
      if (this.DoesCollide(room)) {
        room.x = old_position.x;
        room.y = old_position.y;
        break;
      }
    }
    return room
  }
  ConnectRooms(roomA, rooms) {
    let roomBIndex = this.FindClosestRoomIndex(roomA, rooms);
    let roomB = rooms[roomBIndex]
    this.ConnectRoom(roomA, roomB)
    if(rooms.length === this.rooms.length && this.CheckOdds(CONSTANTS.MAP.CONNECTION_CHANCE)) {
      this.ConnectRooms(roomA, rooms.slice().splice(roomBIndex,1))
    }
  }

  ConnectRoom(roomA, roomB) {
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
      this.open(pointB.x, pointB.y)
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
    return Math.floor(this.rng() * (high - low) + low);
  }
  GetRandomNormalDistribution(low, high, iterations) {
    let sum = 0
    for (var i = 0; i < iterations; i++) {
      sum += this.rng() * (high - low) + low
    }
    return Math.floor(sum / iterations)
  }
  CheckOdds(odds) {
    return this.rng() < odds
  }
  // genroomend
}

class MapElement {
  constructor(props) {
    props = props || {}
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

  clear() {
    this.isObstacle = false
    this.isBlank = true
  }

}

class Room {
  constructor(map, minSize, maxSize, type = 'default') {
    this.x = map.GetRandomNormalDistribution(1, map.mapSize - maxSize - 1, 3);
    this.y = map.GetRandomNormalDistribution(1, map.mapSize - maxSize - 1, 3);
    this.w = map.GetRandom(minSize, maxSize);
    this.h = map.GetRandom(minSize, maxSize);
    this.type = type
    this.connections = []

    if (type !== 'start') {
      let closestIndex = map.FindClosestRoomIndex(this, map.rooms)
      this.connections.push(map.rooms[closestIndex])
      if (map.rooms.length > 1 && map.CheckOdds(CONSTANTS.MAP.CONNECTION_CHANCE)) {
        closestIndex = map.FindClosestRoomIndex(this, map.rooms.slice().splice(closestIndex,1) )
        this.connections.push(map.rooms[closestIndex])
      }
    }
  }

  process(map) {
    for (var i = 0; i < this.connections.length; i++) {
      map.ConnectRoom(this, this.connections[i])
    }
    for (let x = this.x; x < this.x + this.w; x++) {
      for (let y = this.y; y < this.y + this.h; y++) {
        if ( this.type === 'start' && this.isStartBox(x, y)) {
          map.clear(x,y)
        } else {
          map.open(x,y)
        }
      }
    }
  }

  isStartBox(x, y){
    let valid = ( x === this.x + this.w - 2 && y < this.y + this.h - 1 && y > 1) ||
                ( y === this.y + this.h - 2 && x < this.x + this.w - 1)
    return valid
  }

}

module.exports = GameMap;