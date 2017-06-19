// character.js

function Character(props) {
  props = props || {}
  this.id = 0;
  this.type = CONSTANTS.CHAR_TYPE.ENEMY
  this.position = { x: 0, y: 0, z: 0 };
  this.rotation = { x: 0, y: 0, z: 0 };
  this.fwdSpeed = 0;
  this.rotYSpeed = 0;
  this.sideSpeed = 0;
  this.totalHealth = 100;
  this.currentHealth = 100;

  function update() {
    props = props || {}
    this.id = props.id || this.id;
    this.type = props.type === undefined ? this.type : props.type
    if ( props.position ) {
      this.position.x = props.position.x === undefined ? this.position.x : props.position.x
      this.position.y = props.position.y === undefined ? this.position.y : props.position.y
      this.position.z = props.position.z === undefined ? this.position.z : props.position.z
    }
    if ( props.rotation ) {
      this.rotation.x = (props.rotation.x === undefined ? this.rotation.x : props.rotation.x)
      this.rotation.y = (props.rotation.y === undefined ? this.rotation.y : props.rotation.y)
      this.rotation.z = (props.rotation.z === undefined ? this.rotation.z : props.rotation.z)
    }
    this.fwdSpeed = props.fwdSpeed === undefined ? this.fwdSpeed : props.fwdSpeed
    this.rotYSpeed = props.rotYSpeed === undefined ? this.rotYSpeed : props.rotYSpeed
    this.sideSpeed = props.sideSpeed === undefined ? this.sideSpeed : props.sideSpeed
    this.totalHealth = props.totalHealth === undefined ? this.totalHealth : props.totalHealth
    this.currentHealth = props.currentHealth === undefined ? this.currentHealth : props.currentHealth
  }(props);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Character;
}