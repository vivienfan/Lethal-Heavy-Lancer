"use strict";


const PORT          = process.env.PORT || 8080;
const express       = require("express");
const WebSocket     = require('ws');
const SocketServer  = WebSocket.Server;
const uuidV4        = require('uuid/v4');
const app           = express();
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
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });
// set up broacast function
wss.broadcast = function broadcast(data, except) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN || client === except) {
      client.send(data);
    }
  });
};

// let prevTime = Date.now()


wss.on('connection', (ws) => {
  console.log('Client connected')
  const player = new Player({ws: ws})
  const playerCharacter = new Character(player)

  let existingMission = findOpenMission()
  if (existingMission) {
    existingMission.addPlayer(player)
  } else {
    existingMission = player.joinMission(mission)
  }

  // send player their player data after connection
  ws.send(JSON.stringify({
    'type': CONSTANTS.MESSAGE_TYPE.PLAYER_INFO,
    'data': player.messageFormat(),
    'mission': player.currentMission.messageFormat(),
    'map': player.currentMission.map.messageFormat()
  }))


  ws.on('message', function incoming(message) {
    message = JSON.parse(message)

    if ( player.currentMission ) {
      if ( message.type === CONSTANTS.MESSAGE_TYPE.UPDATE ) {
        let playerChar = player.currentMission.characters.find(function(element) {
          return element.id === player.id;
        });

        if (playerChar) {
          playerChar.update(message.player);
        }
      } else if ( message.type === CONSTANTS.MESSAGE_TYPE.FIRE) {
        player.currentMission.broadcast(JSON.stringify({
          'type': CONSTANTS.MESSAGE_TYPE.FIRE,
          'data': player.messageFormat(),
        }), ws)
        player.currentMission.fireOn(player, message.target)

      } else if (message.type === CONSTANTS.MESSAGE_TYPE.PLAYER_READY) {
        player.currentMission.playerReady(player)
      }
    }

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    let index = missions.findIndex(function(element) {
      return element.id === player.currentMission.id;
    });
    player.currentMission.removePlayer(player)
    console.log('Client disconnected, numPlayers:', missions[index].numPlayers)
    if (index > -1 && missions[index].numPlayers <= 0) {
      console.log('removed mission from list')
      missions.splice(index, 1)
    }
  });
});

function findOpenMission() {
  for (var i = 0; i < missions.length; i++) {
    if (missions[i].numPlayers < CONSTANTS.MISSION.MAX_PLAYERS) {
      console.log('found open mission')
      return missions[i]
    }
  }
  let newMission = new Mission()
  console.log('creating new mission')
  missions.push(newMission)
  return newMission
}