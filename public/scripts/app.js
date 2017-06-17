// app.js
window.onload = function() {
  console.log("attempting to connect WebSocket");
  var socket = new WebSocket("ws://localhost:8080");

  var canvas = document.getElementById("canvas");
  var engine = new BABYLON.Engine(canvas, true);
  var gravityVector = new BABYLON.Vector3(0, -9.8, 0);
  var physicsPlugin = new BABYLON.CannonJSPlugin();
  var scene, ui, npc, cross, origin, camera;
  var view = false;
  var player = {fwdSpeed: 0, sideSpeed: 0, rotationY: 0, rotationX: 0, rotYSpeed: 0, rotXSpeed: 0}
  var inputManager = new InputManager()

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

  createUI();
  createScene();
  engine.runRenderLoop(function(){
    if (view) {
      updateScene();
      scene.render();
    }
  });

  function createUI() {
    // var ui = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // var snipper = new BABYLON.GUI.Image("Snipper", "snipper.png");
    // snipper.width = 0.2;
    // snipper.height = "40px";
    // ui.addControl(snipper);
    // var canvas = new BABYLON.ScreenSpaceCanvas2D(scene, {
    //     id: "ScreenCanvas",
    //     size: new BABYLON.Size(300, 100),
    //     backgroundFill: "#4040408F",
    //     backgroundRoundRadius: 50,
    //     children: [
    //         new BABYLON.Text2D("Hello World!", {
    //             id: "text",
    //             marginAlignment: "h: center, v:center",
    //             fontName: "20pt Arial",
    //         })
    //     ]
    // });
    // return canvas;
  }

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

    camera = new BABYLON.FollowCamera("followCam", BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;
    view = true;

    console.log(scene);
  }

  function updateScene(data) {
    if ( data && data.mission ){
      scene.getMeshByName("NPC").position.x = data.mission * 5;
    }
    if (scene.getAnimationRatio()) {
      camera.rotation.y += player.rotationY
      camera.rotation.y += player.rotYSpeed * scene.getAnimationRatio()
      player.rotationY = 0
      camera.rotation.x += player.rotationX
      camera.rotation.x += player.rotXSpeed * scene.getAnimationRatio()
      camera.rotation.x = Math.min(Math.max(camera.rotation.x, -Math.PI/2), Math.PI/2)
      player.rotationX = 0
      camera.position.x -= player.fwdSpeed * Math.sin(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
      camera.position.z -= player.fwdSpeed * Math.cos(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
      camera.position.x -= player.sideSpeed * -Math.cos(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
      camera.position.z -= player.sideSpeed * Math.sin(camera.rotation.y + Math.PI) * scene.getAnimationRatio();
    }
  }

  window.addEventListener("resize", function() {
    engine.resize();
  })

  canvas.addEventListener("click", function() {
    canvas.requestPointerLock()
    console.log("pointer should be locked")
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

  function InputManager() {

    this.isPressed = {}
    this.lastY = 0

    this.process = function(type, event) {
      // we want to update mousemove directly, as it is a direct relation to how far user moved mouse
      if ( type === "mousemove" ) {
        player.rotationY += event.movementX * ANGLE
        player.rotationX += event.movementY * ANGLE
      } else {
        // otherwise, it is a key input. From here, determine the key, modify the relevant speed, and
        // apply, so it can be used on the next update call. Allows smooth movement independent of framerate
        // and input frequency
        switch ( event.key ) {
          case "w":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fwdSpeed = SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.fwdSpeed = 0
            }
            break;
          case "s":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.fwdSpeed = -(SPEED)
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.fwdSpeed = 0
            }
            break;
          case "a":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.sideSpeed = SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.sideSpeed = 0
            }
            break;
          case "d":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.sideSpeed = -SPEED
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.sideSpeed = 0
            }
            break;
          case "ArrowRight":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotYSpeed = ANGLE
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotYSpeed = 0
            }
            break;
          case "ArrowLeft":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotYSpeed = -(ANGLE)
              console.log("Set rotspeed")
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotYSpeed = 0
            }
            break;
          case "ArrowUp":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotXSpeed = ANGLE
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotXSpeed = 0
            }
            break;
          case "ArrowDown":
            if ( type === "keydown" && !this.isPressed[event.key] ) {
              this.isPressed[event.key] = true
              player.rotXSpeed = -(ANGLE)
              console.log("Set rotspeed")
            } else if ( type === "keyup" ){
              this.isPressed[event.key] = false
              player.rotXSpeed = 0
            }
            break;
          } // end of switch statement
        }
      } // end of process method
  } // end of InputManager class

}
