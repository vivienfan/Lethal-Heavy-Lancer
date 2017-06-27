// global variables
var engine;
var scene, camera, ground, skybox;

var avatar, cameraTarget;
var ALIVE = true;
var playerStatus = {id: "currentPlayer", position: {x: 0, y:0, z:0}, rotation: {x: 0, y: 0, z:0}};
var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}

var playerMesh, npcMesh;
var characterStatus = [];

var npcSoundEffects = {};
var shootingSound, npcSound, alarmSound, burningSound, explosionSound, bgm;

var alpha = 0;
var deadNPC = [];
var particleSystems = {};

var inputManager = new InputManager();

var STATE = "LOBBY";
var GAME_SCENE_READY = false;

var tutorialLounge, gameLounge;

//
window.onload = function() {
  canvas = document.getElementById("canvas");
  engine = new BABYLON.Engine(canvas, true);

  healthBar = document.getElementById("health-bar");
  health = document.getElementById("health");
  bloodBlur = document.getElementById("blood-blur");
  gameOver = document.getElementById("game-over");

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

  createLobby();
}