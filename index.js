n"use strict";

const PORT          = 8080;
const express       = require("express");
const WebSocket     = require('ws');
const SocketServer  = WebSocket.Server;
const uuidV4        = require('uuid/v4');
const app           = express();
const bcrypt        = require("bcrypt");

app.use(express.static("public"));

const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected')
  let count = 0

  let timer = setInterval(function() {
    count %= 5;
    count++;
    ws.send(JSON.stringify({'count': count}));
    console.log('sending count:', count)
  }, 2000);

  ws.on('message', function incoming(message) {
    message = JSON.parse(message)
    // message.id = uuidV4()

    wss.clients.forEach( (c) => {
      if (c.readyState === WebSocket.OPEN) {

        c.send(JSON.stringify(message));
      }
    })

  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected')
    // userCount--
    clearInterval(timer)
  });
});