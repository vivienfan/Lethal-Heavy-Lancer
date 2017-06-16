// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, player, npc, cross, origin, camera;
  var view = false;

  var ANGLE = Math.PI/180;
  var CAM_OFFSET = 5;
  var SPEED = 2;

  socket.onopen = function (event) {
    console.log('connected to server');
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
  });

  function createScene() {
    scene = new BABYLON.Scene(engine);
    // Changes the background color
    scene.clearColor = new BABYLON.Color3.White();
    var sun = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(60, 100, 10), scene);
    scene.enablePhysics(gravityVector, physicsPlugin);

    origin = BABYLON.Mesh.CreateBox("Origin", 4.0, scene);
    var material = new BABYLON.StandardMaterial("material1", scene);
    material.wireframe = true;
    origin.material = material;

    // Create skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("CNTower/", scene);
    console.log('reflection texture', skyboxMaterial.reflectionTexture);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Create ground
    var extraGround = BABYLON.Mesh.CreateGround("extraGround", 1000, 1000, 1, scene, false);
    var extraGroundMaterial = new BABYLON.StandardMaterial("extraGround", scene);
    extraGroundMaterial.diffuseTexture = new BABYLON.Texture("ground.jpg", scene);
    extraGroundMaterial.diffuseTexture.uScale = 60;
    extraGroundMaterial.diffuseTexture.vScale = 60;
    extraGround.position.y = -2.05;
    extraGround.material = extraGroundMaterial;

    npm = BABYLON.Mesh.CreateSphere("NPC", 10, 1.0, scene);
    npm.position.z = 20;

    cross = BABYLON.Mesh.CreateTorus("torus", 2, 0.1, 10, scene, false);
    cross.rotation.y = Math.PI;
    cross.rotation.x = Math.PI / 2;
    cross.position.z = 30;
    cross.position.y = 8;

    camera = new BABYLON.FollowCamera("followCam", BABYLON.Vector3.Zero(), scene);
    camera.lockedTarget = cross;
    camera.radius = 33;
    camera.heightOffset = -3.5;
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;
    view = true;

    console.log(scene);
  }

  function updateScene(data) {
    scene.getMeshByName("NPC").position.x = data.count * 5;
  }

  window.addEventListener("resieze", function() {
    engine.resize();
  })

  window.addEventListener("keydown", function(event) {
    console.log(event.key)
    if (event.key == "w") {
      cross.position.x += SPEED * Math.sin(cross.rotation.y + Math.PI);
      cross.position.z += SPEED * Math.cos(cross.rotation.y + Math.PI);
    }

    // left arrow
    if (event.key == "ArrowLeft") {
      cross.rotation.y -= ANGLE
    }

    // right arrow
    if (event.key == "ArrowRight") {
      cross.rotation.y += ANGLE
    }

    // up arrow
    if (event.key == "ArrowUp") {
      if (cross.position.y < 30) {
        cross.position.y += 1
      }
    }

    // down arrow
    if (event.key == "ArrowDown") {
      if (cross.position.y > 3) {
       cross.position.y -= 1
      }
    }
  });

  // var prevX, prevY;
  // window.addEventListener("mousemove", function(event) {
  //   if (!prevX) {
  //     prevX = event.clientX;
  //   } else {
  //     if (prevX - event.clientX > 1) {
  //       prevX = event.clientX;
  //       cross.rotation.y -= ANGLE
  //       // player[0].rotation.y -= ANGLE;
  //       // player[0].position.x = cross.position.x + 30 * Math.sin(cross.rotation.y);
  //       // player[0].position.z = cross.position.z + 30 * Math.cos(cross.rotation.y);
  //       // console.log(player[0].position);
  //     } else if (event.clientX - prevX > 1) {
  //       prevX = event.clientX;
  //       cross.rotation.y += ANGLE
  //       // player[0].rotation.y += ANGLE;
  //       // player[0].position.x = cross.position.x + 30 * Math.sin(cross.rotation.y);
  //       // player[0].position.z = cross.position.z + 30 * Math.cos(cross.rotation.y);
  //       // console.log(player[0].position);
  //     }
  //   }

  //   if (!prevY) {
  //     prevY = event.clientY;
  //   } else {
  //     if (prevY - event.clientY > 30) {
  //       prevY = event.clientY;
  //       if (cross.position.y < 30) {
  //         cross.position.y += 1
  //       }
  //       // player[0].rotation.x -= ANGLE;
  //       // player[0].position.x = cross.position.x + 30 * Math.sin(cross.rotation.x);
  //       // player[0].position.z = cross.position.z + 30 * Math.cos(cross.rotation.x);
  //       // console.log(player[0].position);
  //     } else if (event.clientY - prevY > 30) {
  //       prevY = event.clientY;
  //       if (cross.position.y > 3) {
  //        cross.position.y -= 1
  //       }
  //       // player[0].rotation.x += ANGLE;
  //       // player[0].position.x = cross.position.x + 30 * Math.sin(cross.rotation.x);
  //       // player[0].position.z = cross.position.z + 30 * Math.cos(cross.rotation.x);
  //       // console.log(player[0].position);
  //     }
  //   }
  // });
}
