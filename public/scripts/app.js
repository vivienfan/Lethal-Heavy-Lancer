// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var scene, player, origin, camera;
  var view = false;

  socket.onopen = function (event) {
    // console.log('connected to server');
  }

  socket.onmessage = (event) => {
    var data = JSON.parse(event.data);
    updateScene(data);
  }

  createScene();
  engine.runRenderLoop(function(){
    if (view) {
      scene.render();
    }
    // var obj = {
    //   type: "user movement",
    //   data: scene.getMeshByName("Player").position
    // }
    // socket.send(JSON.stringify(obj));
    // console.log(obj);
  });

  window.addEventListener("keydown", function() {
    if (event.key == "w") {
      console.log("move forward")
      player.forEach(function(element) {
        element.position.z -= 0.3;
      });
    }
    if (event.key == "s") {
      console.log("move backward")
      player.forEach(function(element) {
        element.position.z += 0.3;
      });
    }
    if (event.key == "a") {
      console.log("move left")
      player.forEach(function(element) {
        element.position.x += 0.3;
      });
    }
    if (event.key == "d") {
      console.log("move right")
      player.forEach(function(element) {
        element.position.x -= 0.3;
      });
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
      player = newMeshes;

      camera = new BABYLON.FollowCamera("followCam",BABYLON.Vector3.Zero(),scene);
      camera.lockedTarget = player[0];
      camera.radius = 20;
      camera.heightOffset = 10;
      camera.attachControl(canvas, true);
      scene.activeCamera = camera;
      view = true;
    });


    npm = BABYLON.Mesh.CreateSphere("NPC", 10, 1.0, scene);
    npm.position.z = -20;

    console.log(scene);
  }

  function updateScene(data) {
    // console.log(data);
    scene.getMeshByName("NPC").position.x = data.count * 5;
  }
}
