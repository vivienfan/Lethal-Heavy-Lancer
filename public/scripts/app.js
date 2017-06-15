// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var scene, player, origin, camera;

  socket.onopen = function (event) {
    console.log('connected to server');
  }

  socket.onmessage = (event) => {
    var data = JSON.parse(event.data);
    updateScene(data);
  }

  createScene();
  engine.runRenderLoop(function(){
    scene.render();
  });

  window.addEventListener("keydown", function() {
    if (event.key == "w") {
      scene.getMeshByName("Player").position.z -= 0.3;
      console.log("move forward")
    }
    if (event.key == "s") {
      console.log("move backward")
      scene.getMeshByName("Player").position.z += 0.3;
    }
    if (event.key == "a") {
      console.log("move left")
      scene.getMeshByName("Player").position.x += 0.3;
    }
    if (event.key == "d") {
      console.log("move right")
      scene.getMeshByName("Player").position.x -= 0.3;
    }
  });

  function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3.White();

    origin = BABYLON.Mesh.CreateBox("Origin", 4.0, scene);
    var material = new BABYLON.StandardMaterial("material1", scene);
    material.wireframe = true;
    origin.material = material;

    BABYLON.SceneLoader.ImportMesh("","", "batman.babylon", scene, function (newMeshes, particleSystems) {
    });
    player = BABYLON.Mesh.CreateBox("Player", 4.0, scene);

    camera = new BABYLON.FollowCamera("followCam",BABYLON.Vector3.Zero(),scene);
    camera.lockedTarget = player;
    camera.radius = 20;
    camera.heightOffset = 10;
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;

    npm = BABYLON.Mesh.CreateSphere("NPC", 10, 1.0, scene);
    npm.position.z = -20;
  }

  function updateScene(data) {
    console.log(data);
    scene.getMeshByName("NPC").position.x = data.count * 5;
  }
}
