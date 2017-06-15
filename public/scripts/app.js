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

    var onPointerDown = function (e) {
    // check if we clicked on a mesh
    var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    if (pickInfo.hit) {
        currentMesh = pickInfo.pickedMesh;
        rotationInit = currentMesh.rotation.y;
    }
};

var onPointerMove = function (e) {

    dragDiff = {
        x: e.x - dragInit.x,
        y: e.y - dragInit.y
    }

    var newRotation = rotationInit;
    newRotation.x = rotationInit.x - dragDiff.x /70
    newRotation.y = rotationInit.y - dragDiff.y /70

    currentMesh.rotation = newRotation;
    return true;
};
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
        element.rotation.y += Math.PI/10;
      });
    }
    if (event.key == "d") {
      console.log("move right")
      player.forEach(function(element) {
        element.position.x -= 0.3;
        // element.rotation.y += Math.PI/10;
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

    var indicator = BABYLON.MeshBuilder.CreateCylinder("indicator", { height: 1, diameterTop: 0, diameterBottom: 0.5 }, scene);
    indicator.rotation.x = -Math.PI / 2;
    indicator.bakeCurrentTransformIntoVertices();
    indicator.position.y = 1;

    BABYLON.SceneLoader.ImportMesh("","", "batman.babylon", scene, function (newMeshes, particleSystems) {
      player = newMeshes;
      player[0].rotation.x = -Math.PI / 2;
      player[0].bakeCurrentTransformIntoVertices();
      // player[0].position.y = 1;
      // console.log('Player', player);
      // player[0].rotation.x = -Math.PI / 20;
      // player[0].bakeCurrentTransformIntoVertices();
      // player[0].position.y = 1;
      // player.forEach(function(element) {
      //   element.rotation.x = -Math.PI / 2;
      //   element.bakeCurrentTransformIntoVertices();
      //   element.position.y = 1;
      // });

      camera = new BABYLON.FollowCamera("followCam",BABYLON.Vector3.Zero(),scene);
      camera.lockedTarget = player[0];
      camera.radius = 20;
      camera.heightOffset = 10;
      camera.attachControl(canvas, true);
      scene.activeCamera = camera;
      view = true;

      window.addEventListener("mousemove", function(event) {
        // We try to pick an object
      var pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit) {
        var targetPoint = pickResult.pickedPoint;
        targetPoint.y = 1;
        player[0].lookAt(targetPoint);
      }
          // player[0].rotation.y -= Math.PI/10;
//          diff event.position.x > range
//          player[0].lookAt
    //    var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    //    if (pickResult.hit) {
    //      player[0].lookAt(pickResult.pickedPoint);
    //      console.log('Indicator', indicator);
  //      }
      });
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
