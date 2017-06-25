function viewAllBuildingTextures (limit, scene, offset) {
  var buildingMesh = BABYLON.Mesh.CreateBox("buildingMesh", CONSTANTS.MAP.ELEMENT_SIZE - 4, scene);
  buildingMesh.setEnabled(false);

  var buildingBase = BABYLON.Mesh.CreateBox("buildingBase", CONSTANTS.MAP.ELEMENT_SIZE, scene, false);
  buildingBase.scaling.y = 0.1;
  buildingBase.material = new BABYLON.StandardMaterial("baseMaterial", scene);
  buildingBase.material.emissiveTexture = new BABYLON.Texture("assets/texture/buildings/concrete.png", scene);
  buildingBase.material.bumpTexture = new BABYLON.Texture("assets/texture/buildings/concrete_normal.png", scene);
  buildingBase.material.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  buildingBase.material.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  buildingBase.material.backFaceCulling = false;
  buildingBase.setEnabled(false);

  for (var i = 0; i < limit; i++) {
    var newMaterial = new BABYLON.StandardMaterial("buildingMaterial" + i, scene);
    newMaterial.emissiveTexture = new BABYLON.Texture("assets/texture/buildings/" + i + ".jpg", scene);
    // newMaterial.bumpTexture = new BABYLON.Texture("assets/texture/buildings/normal_" + i + ".png", scene);
    newMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    newMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    newMaterial.backFaceCulling = false;

    var newObstacle = buildingMesh.clone(i);
    newObstacle.position.x = i * CONSTANTS.MAP.ELEMENT_SIZE - CONSTANTS.MAP.ELEMENT_SIZE / 2;
    newObstacle.position.z = 0;
    newObstacle.position.y = offset;

    var randomSize = (Math.floor(Math.random() * 500) + 300) / 100;
    newObstacle.scaling.y = randomSize;
    var buildingMaterial = newMaterial;
    buildingMaterial.emissiveTexture.vScale = randomSize ;
    newObstacle.material = buildingMaterial;

    var newObstacleBase = buildingBase.clone(i);
    newObstacleBase.position.x = newObstacle.position.x;
    newObstacleBase.position.y = offset;
    newObstacleBase.position.z = newObstacle.position.z;
  }
}