// global constants
var socket;

var canvas, healthBar, health, bloodBlur, gameOver;

var engine, scene, camera, playerMesh, npcMesh, ground, skybox, flame;
var inputManager = new InputManager();

var npcSoundEffects = {};
var shootingSound, npcSound, alarmSound, burningSound, explosionSound, bgm;

var ALIVE = true;
var SPACESHIP_ELLIPSOID;

var playerStatus = {};
var characterStatus = [];
var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}

var alpha = 0;
var deadNPC = [];
var particleSystems = {};

var FSM = new StateMachine();

window.onload = function() {
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

  FSM.transite("LOBBY");

  if (true) {
    FSM.transite("GAME");
  } else if (false) {
    FSM.transite("TUTORIAL");
  }
}
