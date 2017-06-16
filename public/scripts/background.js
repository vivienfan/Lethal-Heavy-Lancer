<script>
    window.onload = function() {
        var canvas = document.getElementById("renderCanvas");
        var engine = new BABYLON.Engine(canvas, true);
        var scene = new BABYLON.Scene(engine);

        // var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
        var sun = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(60, 100, 10), scene);

        camera.setPosition(new BABYLON.Vector3(-40, 40, 0));

        // var beforeRenderFunction = function () {
        //     // Camera
        //     if (camera.beta < 0.1)
        //         camera.beta = 0.1;
        //     else if (camera.beta > (Math.PI / 2) * 0.9)
        //         camera.beta = (Math.PI / 2) * 0.9;
        //
        //     if (camera.radius > 50)
        //         camera.radius = 50;
        //
        //     if (camera.radius < 5)
        //         camera.radius = 5;
        // };
        //
        // camera.attachControl(canvas);
        // 
        // scene.registerBeforeRender(beforeRenderFunction);

        engine.runRenderLoop(function () {
            scene.render();
        });
    }
</script>
