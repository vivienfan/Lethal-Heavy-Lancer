"use strict";


const PORT          = 8080;
const express       = require("express");
const WebSocket     = require('ws');
const SocketServer  = WebSocket.Server;
const uuidV4        = require('uuid/v4');
const app           = express();
const bcrypt        = require("bcrypt");
const CONSTANTS     = require("./public/scripts/lib/constants");
const Mission       = require('./server/lib/Mission.js');
const Player        = require('./server/lib/Player');
const Character     = require('./server/lib/Character');
require('dotenv').config()
const DT            = process.env.DT || 50;
const missions      = []



app.use(express.static("public"));

const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });
// set up broacast function
wss.broadcast = function broadcast(data, except) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN || client === except) {
      client.send(data);
    }
  });
};

let mission = new Mission()
mission.addCharacter({type: CONSTANTS.CHAR_TYPE.ENEMY})

let prevTime = Date.now()
const timer = setInterval(function() {
  let triggers = []
  let currTime = Date.now()
  let updateRatio = (currTime - prevTime) * 0.06 // following Babylon's definition of the animationRatio: dt * ( 60/1000 )
  prevTime = currTime
  mission.update(updateRatio)
  let message = JSON.stringify({
    'type': CONSTANTS.MESSAGE_TYPE.GAME_STATE,
    'mission': mission.messageFormat(),
    'triggers': triggers
  })
  // console.log(mission._characters)
  wss.broadcast(message);
}, DT);

wss.on('connection', (ws) => {
  console.log('Client connected')
  let count = 0
  const player = new Player()
  console.log(player)
  const playerCharacter = new Character(player)
  // console.log(player.)

  let existingMission = findOpenMission()
  if (existingMission) {
    player.joinMission(existingMission)
  } else {
    existingMission = player.joinMission(mission)
  }
  // player.joinMission(mission)
  // mission.characters[0].setTarget(mission.characters[1])

  // send player their player data after connection
  ws.send(JSON.stringify({
    'type': CONSTANTS.MESSAGE_TYPE.PLAYER_INFO,
    'data': player.messageFormat(),
    'mission': mission.messageFormat(),
    'map': mission.map.messageFormat()
  }))

  // console.log("player char:", playerCharacter.messageFormat())
  // console.log("mission: ", mission)

  ws.on('message', function incoming(message) {
    message = JSON.parse(message)

    if ( mission ) {
      if ( message.type === CONSTANTS.MESSAGE_TYPE.UPDATE ) {
        let player = mission.characters.find(function(element) {
          // console.log("elem, char - ids",element.id, playerCharacter.id)
          return element.id === playerCharacter.id;
        });

        // console.log("player, char", player, playerCharacter)
        if (player) {
          player.update(message.player);
        }
      } else if ( message.type === CONSTANTS.MESSAGE_TYPE.FIRE) {
        let targetDied = mission.fireOn(player, message.target)
        wss.broadcast(JSON.stringify(message), ws)
        if (targetDied) {
          mission.removeCharacter(message.target)
          let deathMessage = JSON.stringify({
            'type': CONSTANTS.MESSAGE_TYPE.REMOVE,
            'character': message.target
          })
          wss.broadcast(deathMessage);
        }
      }
    }

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    mission.removeCharacter(player)
    let message = JSON.stringify({
      'type': CONSTANTS.MESSAGE_TYPE.REMOVE,
      'character': player.messageFormat()
    })
    // console.log(mission._characters)
    wss.broadcast(message);
  });
});

function findOpenMission() {
  for (var i = 0; i < missions.length; i++) {
    if (missions[i].numPlayers < CONSTANTS.MISSION.MAX_PLAYERS) {
      return missions[i]
    }
  }
}