function Player(player, mission) {
  this.id = player.id;
  this.totalHealth = player.totalHealth;
  this.currentHealth = player.currentHealth;
  var character = mission.characters.find(function(element) {
    return element.id = player.id;
  });
  this.position = character.position;
  this.rotation = character.rotation;
  this.fwdSpeed = character.fwdSpeed;
  this.sideSpeed = character.sideSpeed;
  console.log(this);
  console.log(mission);
}
