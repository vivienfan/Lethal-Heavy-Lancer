'use strict';

// Mission.js


const uuidV4    = require('uuid/v4');
const Character = require('./Character');
const GameMap   = require('./GameMap');
const CONSTANTS = require("../../public/scripts/lib/constants");
const WebSocket = require('ws');

const DT        = process.env.DT || 50;

class Mission {
  constructor(props) {
    props = props || {}
    this.id = props.id || uuidV4();
    this.type = props.type || CONSTANTS.MISSION_TYPE.KILL;
    this.map = new GameMap()
    this.characters = []
    this.totalEnemies = CONSTANTS.MISSION.MIN_ENEMIES
    this.remainingEnemies = CONSTANTS.MISSION.MIN_ENEMIES
    this.enemies = []
    this.allies = []
    this.playerChars = []
    this.players = []
    this.wss = props.wss || null
    if ( Array.isArray(props.characters) ) {
      props.characters.forEach(character => {
        this.addCharacter(character)
      })
    }

    this.prevTime = Date.now()
    this.timer = this.missionTimer()

  }

  addCharacter(character) {
    if (!(character instanceof Character)) {
      character = new Character(character);
    }

    let playerStartPos = character.position || this.getStartPosition()
    if ( character.type === CONSTANTS.CHAR_TYPE.PLAYER ) {
      character.position = playerStartPos
      this.playerChars.push(character)
    } else if ( character.type === CONSTANTS.CHAR_TYPE.ENEMY ) {
      this.enemies.push(character)
      character.update({ position: this.map.generateEnemySpawnPosition(this.playerChars) })
    } else {
      this.allies.push(character)
    }
    this.characters.push(character);
    return this
  }

  addPlayer(player) {
    if (player && player.ws) {
      this.players.push(player)
      player.setMission(this)
      player.position = this.map.getStartPosition()
      this.addCharacter(player)

      if (this.totalEnemies < CONSTANTS.MISSION.MIN_ENEMIES * this.numPlayers) {
        let increase = this.map.GetRandom(CONSTANTS.MISSION.MIN_ENEMIES, CONSTANTS.MISSION.MAX_ENEMIES)
        this.remainingEnemies += increase
        this.totalEnemies += increase
      }
      if (this.enemies.length < Math.min(this.remainingEnemies, CONSTANTS.MISSION.CONCURRENT_ENEMIES)) {
        this.spawnEnemies(Math.min(this.remainingEnemies, CONSTANTS.MISSION.CONCURRENT_ENEMIES) - this.enemies.length)
      }

    }
  }

  spawnEnemies(num = CONSTANTS.MISSION.MIN_ENEMIES) {
    // console.log('spawning Enemies, num:', num)
    // console.log('remainingEnemies', this.remainingEnemies, "/", this.totalEnemies)
    for (var i = 0; i < num; i++) {
      this.addCharacter({type: CONSTANTS.CHAR_TYPE.ENEMY})
    }
  }

  playerReady(player) {
    let playerChar = this.findCharacter(player)
    if (playerChar) {
      this.allies.push(playerChar) // Enemies only pick targets from the allies list. This could include friendly npcs as well later on.
    }
  }

  removePlayer(player) {
    let index = this.players.findIndex(function(element) {
      return element.id === player.id;
    });
    if (index > -1) {
      player.currentMission = null
      this.players.splice(index, 1)
    }
    this.removeCharacter(player)
  }

  removeCharacter(character) {
    let index = this.characters.findIndex(function(element) {
      return element.id === character.id;
    });
    if (index > -1) {
      this.characters.splice(index, 1)

      if ( character.type === CONSTANTS.CHAR_TYPE.ENEMY ) {
        this.remainingEnemies--;
        index = this.enemies.findIndex(function(element) {
          return element.id === character.id;
        });
        if (index > -1) {
          this.enemies.splice(index, 1)
        }
        if (this.enemies.length < Math.min(this.remainingEnemies, CONSTANTS.MISSION.CONCURRENT_ENEMIES)) {
          this.spawnEnemies(Math.min(this.remainingEnemies, CONSTANTS.MISSION.CONCURRENT_ENEMIES) - this.enemies.length)
        }

      } else {
        index = this.allies.findIndex(function(element) {
          return element.id === character.id;
        });
        if (index > -1) {
          this.allies.splice(index, 1)
        }
      }

      let deathMessage = JSON.stringify({
        'type': CONSTANTS.MESSAGE_TYPE.REMOVE,
        'character': character.messageFormat()
      })
      this.broadcast(deathMessage);

      if (character.type === CONSTANTS.CHAR_TYPE.ENEMY && this.enemies.length <= 0){
        let winMessage = JSON.stringify({
          'type': CONSTANTS.MESSAGE_TYPE.GAME_END
        })
        console.log('sent win')
        this.broadcast(winMessage)
      }
    }
    return this
  }

  getStartPosition() {
    return this.map.getStartPosition()
  }

  findCharacter(character) {
    let result = this.characters.find(function(element) {
      return element.id === character.id;
    });
    return result
  }

  findCharacterIndex(character) {
    let result = this.characters.findIndex(function(element) {
      return element.id === character.id;
    });
    return result
  }

  findClosest(origin, targets) {
    return this.findClosestInRange(origin, null, targets)
  }

  findClosestInRange(origin, range, targets) {
    let foundTarget = null;
    let foundDistSqr;
    targets.forEach(target => {
      let distSqr = this.findDistSqr(origin, target)
      if( !target.isDead() && (!range || distSqr <= range * range) )
        if ( !foundTarget || distSqr < foundDistSqr ){
          foundTarget = target
          foundDistSqr = distSqr
        }
    })
    return foundTarget
  }

  isWithinRange(origin, range, target) {
    let distSqr = this.findDistSqr(origin, target)
    return (distSqr <= (origin.range * origin.range));
  }

  findDistSqr(origin, target) {
    let diff = {
      x: target.position.x - origin.position.x,
      y: target.position.y - origin.position.y,
      z: target.position.z - origin.position.z}
    return diff.x * diff.x + diff.y * diff.y + diff.z * diff.z
  }

  fireOn(origin, target) {
    if ( origin.id ) {
      if ( !(origin instanceof Character) ) {
        origin = this.findCharacter(origin)
      }
      if (origin) {
        origin.startFiring()

        target = this.findCharacter(target)
        if ( target && target.id ) {
          if ( this.canHit(origin, target) ) {
            target.takeDamage(origin.damage);
          }
          if (target.isDead()) {
            this.removeCharacter(target)
          }
        }
      }
    }
  }

  canHit(origin, target) {
    return this.isWithinRange(origin, origin.range, target)
  }

  get numPlayers() {
    return this.players.length
  }

  messageFormat(playerId) {
    let foundUser = this.characters[playerId]
    let result = {
      'id': this.id,
      'type': this.type,
      'remainingEnemies': this.remainingEnemies,
      'totalEnemies': this.totalEnemies,
      'numPlayers': this.numPlayers,
      'characters': this.characters.map(character => {
        return character.messageFormat();
      })
    }

    return result;
  }

  update(dt) {
    this.characters.forEach((character, i) => {
      if (character.type !== CONSTANTS.CHAR_TYPE.PLAYER) {
        character.process(dt, this)
      }
    })
  }

  broadcast(data, except) {
    this.players.forEach(function each(player) {
      if (player.ws.readyState === WebSocket.OPEN && player.ws !== except) {
        player.ws.send(data);
      }
    });
  }

  destroy() {
    clearInterval(this.timer)
    // for (var i = characters.length - 1; i >= 0; i--) {
    //   delete characters[i]
    // }
  }

  missionTimer() {
    return setInterval(()=> {
      let triggers = []
      let currTime = Date.now()
      let updateRatio = (currTime - this.prevTime) * 0.06 // following Babylon's definition of the animationRatio: dt * ( 60/1000 )
      this.prevTime = currTime
      this.update(updateRatio)
      let message = JSON.stringify({
        'type': CONSTANTS.MESSAGE_TYPE.GAME_STATE,
        'mission': this.messageFormat(),
        'triggers': triggers
      })
      // console.log("mission timer")
      this.broadcast(message);
    }, DT);
  }
}

module.exports = Mission;