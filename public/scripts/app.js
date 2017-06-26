// app.js
var socket;

var canvas, healthBar, health, bloodBlur, gameOver;

var engine, scene, camera, playerMesh, npcMesh, ground, skybox, flame;
var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
var inputManager = new InputManager();

var playerStatus = {};
var characterStatus = [];
var particleSystems = {};
var deadNPC = [];

var ALIVE = true;

var shootingSound, npcSound, alarmSound, burningSound, explosionSound, bgm;
var npcSoundEffects = {};

var alpha = 0;

var SPACESHIP_ELLIPSOID;
// var TOTAL_BUILDINGS = 23;
var CAMERA_TARGET_OFFSET = Math.PI / 2;

var HEALTH_COLOR_FULL = "#86e01e";
var HEALTH_COLOR_HIGH = "#f2d31b";
var HEALTH_COLOR_HALF = "#f2b01e";
var HEALTH_COLOR_LOW = "#f27011";
var HEALTH_COLOR_VERY_LOW = "#f63a0f";


window.onload = function() {
  socket = new WebSocket(`ws://${window.location.hostname}:8080`);

  canvas = document.getElementById("canvas");
  engine = new BABYLON.Engine(canvas, true);
  engine.displayLoadingUI();

  healthBar = document.getElementById("health-bar");
  health = document.getElementById("health");
  bloodBlur = document.getElementById("blood-blur");
  gameOver = document.getElementById("game-over");

  SPACESHIP_ELLIPSOID = new BABYLON.Vector3(10, 10, 10);


  window.addEventListener("resize", function() {
    engine.resize();
  })

  canvas.addEventListener("click", function() {
    canvas.requestPointerLock()
  })

  canvas.addEventListener("mousemove", function(event) {
    inputManager.process("mousemove", event)
  })

  window.addEventListener("keyup", function(event) {
    inputManager.process("keyup", event)
  })

  window.addEventListener("keydown", function(event) {
    inputManager.process("keydown", event)
  });

  socket.onopen = function (event) {
  }

  socket.onmessage = (event) => {
    var data = JSON.parse(event.data);
    switch(data.type) {
      case CONSTANTS.MESSAGE_TYPE.PLAYER_INFO:
        initWorld(data.data, data.mission, data.map.grid);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_STATE:
        updateCharacters(data.mission.characters);
        break;
      case CONSTANTS.MESSAGE_TYPE.FIRE:
        displayPlayerFire(data.data.id);
        break;
      case CONSTANTS.MESSAGE_TYPE.REMOVE:
        removeCharacter(data.character);
        break;
      case CONSTANTS.MESSAGE_TYPE.GAME_END:
        displayGameWin();
        break;
      default:
        break;
    }
  }

  function initWorld(player, mission, map) {
    console.log("init world: ", player, mission);
    playerStatus = new Player(player, mission);
    createScene(map);
  }


}
