// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, player, origin, camera;
  var view = false;
  var walk = false;
  var walkingAnimation;

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
    var material = new BABYL
    ON.StandardMaterial("material1", scene);
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

    BABYLON.SceneLoader.ImportMesh("", "", "walk.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      player = newMeshes;
      player[0].rotation.y = Math.PI;
      player.scaling = new BABYLON.Vector3(0.05,0.05,0.05);
      player.position = new BABYLON.Vector3(0, 0, 0);
      player[0].setPhysicsState({impostor: BABYLON.PhysicsEngine.MeshImpostor, mass: 0, friction: 0.5, restitution: 0.7});
      skeleton = skeletons[0];

      player[0].skeleton = skeleton;
      player[0].skeleton.createAnimationRange("walk", 0, 30);

      camera = new BABYLON.FollowCamera("followCam",BABYLON.Vector3.Zero(),scene);
      camera.lockedTarget = player[0];
      camera.radius = 15;
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

  window.addEventListener("resieze", function() {
    engine.resize();
  })

  window.addEventListener("keydown", function() {
    if (event.key == "w") {
      if (walk) {
        walk = false
      } else {
        console.log("move forward")
        walk = true;
        walkingAnimation = player[0].skeleton.beginAnimation("walk", false, 2);
        player[0].position.z -= 5;
        var obj = {
          type: "position",
          position: player[0].position
        };
        socket.send(JSON.stringify(obj));
      }
    }
  });

  window.addEventListener("keyup", function() {
    walkingAnimation.pause();
  });

  var prevX;
  window.addEventListener("mousemove", function(event) {
    if (!prevX) {
      prevX = event.clientX;
    } else {
      if (prevX - event.clientX > 20) {
        prevX = event.clientX;
        player[0].rotation.y -= Math.PI/12;
      }

      if (event.clientX - prevX > 20) {
        prevX = event.clientX;
        player[0].rotation.y += Math.PI/12;
      }
    }
  });
}
