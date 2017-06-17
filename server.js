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
const DT            = process.env.DT || 33;


app.use(express.static("public"));

const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });
// set up broacast function
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

let mission = new Mission()
mission.addCharacter({type: CONSTANTS.CHAR_TYPE.ENEMY, x: 10, y: 10})

const timer = setInterval(function() {

  // testing character updates
  // mission._characters[0]._position.x += 5
  // mission._characters[0]._position.x %= 30
  mission.update(DT)
  let message = JSON.stringify({
    'type': CONSTANTS.MESSAGE_TYPE.GAME_STATE,
    'mission': mission.messageFormat()
  })
  // console.log(mission._characters)
  wss.broadcast(message);
}, DT);

wss.on('connection', (ws) => {
  console.log('Client connected')
  let count = 0
  const player = new Player()
  const player_character = new Character(player)


  player.joinMission(mission)
  // mission.addCharacter({type: CONSTANTS.CHAR_TYPE.ENEMY})

  // send player their player data after connection
  ws.send(JSON.stringify({
    'type': CONSTANTS.MESSAGE_TYPE.PLAYER_INFO,
    'data': player.messageFormat(),
    'mission': mission.messageFormat()
  }))

  console.log("player char:", player_character.messageFormat)
  console.log("mission: ", mission)

  ws.on('message', function incoming(message) {
    message = JSON.parse(message)

    if ( mission && message.type === CONSTANTS.MESSAGE_TYPE.UPDATE ) {
      let player = mission.characters.find(function(element) {
        return element._id === message.player.id;
      });
      if (player) {
        player.update(message.player);
      }
      // console.log(mission.characters)
    }

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    // userCount--
    // clearInterval(timer)
  });
});