// app.js
window.onload = function() {

  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  socket.onopen = function (event) {
    console.log('connected to server');
  }

  socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
  }

  console.log("app.js loaded");


}
