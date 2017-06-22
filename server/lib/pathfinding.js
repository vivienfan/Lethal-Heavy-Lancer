'use strict'
// pathfinding.js

const GameMap = require("./GameMap");
const PF = require('pathfinding')

let map = new GameMap('empty')

function printMap(map) {
  let line = BresenhamLine({x:1,z:3}, {x:12, z:30})
  for (var i = 0; i < line.length; i++) {
    map.block(line[i].x, line[i].z)
  }
  let drawMap = map.grid.map(x => {
    return x.map(y => {
      if ( y.isObstacle ) {
        return 'X'
      } else {
        return ' '
      }
    })
  })
  let path = map.getPath({x:2, z:12}, {x:20, z:20})
  console.log(path.length)
  for (var i = 0; i < path.length; i++) {
    drawMap[path[i][0]][path[i][1]] = '.'
  }
  for (var x = 0; x < map.grid.length; x++) {
    let output = ''
    for (var z = 0; z < map.grid[x].length; z++) {
      output += drawMap[z][x]
    }
    console.log(output)
  }
}


// // Returns the list of points from p0 to p1
// private List<Point> BresenhamLine(Point p0, Point p1) {
//     return BresenhamLine(p0.X, p0.Y, p1.X, p1.Y);
// }

function swap(a,b) {
  return [b, a]
}

function BresenhamLine(p0, p1) {
  let result = []
  let x0 = p0.x, z0 = p0.z, x1 = p1.x, z1 = p1.z, temp
  let steep = Math.abs(z1 - z0) > Math.abs(x1 - x0);
  if (steep) {
    temp = x0
    x0 = z0
    z0 = temp
    temp = x1
    x1 = z1
    z1 = temp
  }
  if (x0 > x1) {
    temp =  x0
    x0 = x1
    x1 = temp
    temp =  x0
    x0 = x1
    x1 = temp
  }

  let deltax = x1 - x0
  let deltaz = Math.abs(z1 - z0)
  let error = 0
  let zstep
  let z = z0
  if (z0 < z1) {
    zstep = 1
  } else {
    zstep = -1
  }
  for (let x = x0; x < x1; x++) {
    if (steep) {
      result.push({'x': z, 'z': x})
    } else {
      result.push({'x': x, 'z': z})
    }
    error += deltaz
    if ( 2 * error >= deltax) {
      z += zstep
      error -= deltax;
    }
  }
  return result
}

printMap(map)