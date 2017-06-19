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
  return update(props, this);

  function update(props, that) {
    var props = props || {}
    that.id = props.id || that.id;
    that.type = props.type === undefined ? that.type : props.type
    if ( props.position ) {
      that.position.x = props.position.x === undefined ? that.position.x : props.position.x
      that.position.y = props.position.y === undefined ? that.position.y : props.position.y
      that.position.z = props.position.z === undefined ? that.position.z : props.position.z
    }
    if ( props.rotation ) {
      that.rotation.x = (props.rotation.x === undefined ? that.rotation.x : props.rotation.x)
      that.rotation.y = (props.rotation.y === undefined ? that.rotation.y : props.rotation.y)
      that.rotation.z = (props.rotation.z === undefined ? that.rotation.z : props.rotation.z)
    }
    that.fwdSpeed = props.fwdSpeed === undefined ? that.fwdSpeed : props.fwdSpeed
    that.rotYSpeed = props.rotYSpeed === undefined ? that.rotYSpeed : props.rotYSpeed
    that.sideSpeed = props.sideSpeed === undefined ? that.sideSpeed : props.sideSpeed
    that.totalHealth = props.totalHealth === undefined ? that.totalHealth : props.totalHealth
    that.currentHealth = props.currentHealth === undefined ? that.currentHealth : props.currentHealth
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Character;
}