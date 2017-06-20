// test_character.js

var assert = require("chai").assert;

const CONSTANTS     = require("../public/scripts/lib/constants");
const Character     = require('../server/lib/Character');

describe('Character',function(){
  let fullParams = {
    id: "test-char-id",
    type: CONSTANTS.CHAR_TYPE.PLAYER,
    position: { x: 12, y: 21, z: 7 },
    rotation: { x: 6, y: 8, z: 42 },
    fwdSpeed: 1,
    rotYSpeed: 3,
    sideSpeed: 2.3,
    totalHealth: 123,
    currentHealth: 56
  }

  describe('when created without parameters',function(){
    let character = new Character()
    it('Should return with default attributes', function() {
      assert.equal(typeof character.id, 'string', 'character id should be a string.');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character.position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character.rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character.fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character.rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character.sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character.totalHealth, 100, 'Total health should be 100');
      assert.equal(character.currentHealth, 100, 'Current health should be 100');
    });
  });

  describe('when created with full parameters',function(){
    let character = new Character(fullParams)
    it('Should return with attributes from parameters', function() {
      assert.equal(character.id, fullParams.id, 'Id should be the same as passed in parameters');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, fullParams.type, 'character type should be same as parameters');
      assert.deepEqual(character.position, fullParams.position, 'position should be same as parameters');
      assert.equal(character.position.x, fullParams.position.x, 'character position at x should be same as parameters');
      assert.deepEqual(character.rotation, fullParams.rotation, 'rotation should be same as parameters');
      assert.equal(character.fwdSpeed, fullParams.fwdSpeed, 'fwdSpeed should be same as parameters');
      assert.equal(character.rotYSpeed, fullParams.rotYSpeed, 'rotYSpeed should be same as parameters');
      assert.equal(character.sideSpeed, fullParams.sideSpeed, 'sideSpeed should be same as parameters');
      assert.equal(character.totalHealth, fullParams.totalHealth, 'Total health should be same as parameters');
      assert.equal(character.currentHealth, fullParams.currentHealth, 'Current health should be same as parameters');
    });
  });


  describe('When created with partial parameters',function(){
    it('Should return correctly with only id parameter assigned', function() {
      let params = {id: 'new-test-id'}
      let character = new Character(params);
      assert.equal(character.id, params.id, 'Id should be the same as passed in parameters');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character.position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character.rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character.fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character.rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character.sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character.totalHealth, 100, 'Total health should be 100');
      assert.equal(character.currentHealth, 100, 'Current health should be 100');
    });
    it('Should return correctly with only total health parameter assigned', function() {
      let params = {totalHealth: 498}
      let character = new Character(params);
      assert.equal(typeof character.id, 'string', 'character id should be a string.');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character.position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character.rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character.fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character.rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character.sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character.totalHealth, params.totalHealth, 'Total health should be 100');
      assert.equal(character.currentHealth, 100, 'Current health should be 100');
    });
    it('Should return correctly with only currentHealth parameter assigned', function() {
      let params = {currentHealth: 42}
      let character = new Character(params);
      assert.equal(typeof character.id, 'string', 'character id should be a string.');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character.position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character.rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character.fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character.rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character.sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character.totalHealth, 100, 'Total health should be 100');
      assert.equal(character.currentHealth, params.currentHealth, 'Current health should be 100');
    });
  });

  describe('when created with irrelevant parameters',function(){
    let params = {neverGonnaGetUsed: "fake", anotherUnusedIndex: "not there"}
    let character = new Character(params)
    it('Should return without those attributes', function() {
      assert.equal(typeof character.id, 'string', 'character id should be a string.');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character.position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character.rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character.fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character.rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character.sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character.totalHealth, 100, 'Total health should be 100');
      assert.equal(character.currentHealth, 100, 'Current health should be 100');
      assert.notExists(character.neverGonnaGetUsed, "variable neverGonnaGetUsed should not exist")
      assert.notExists(character.anotherUnusedIndex, "variable neverGonnaGetUsed should not exist")

    });
  });

  describe('when created with mix of relevant and irrelevant parameters',function(){
    let params = {id: "fancyId", totalHealth: 987, neverGonnaGetUsed: "fake", anotherUnusedIndex: "not there"}
    let character = new Character(params)
    it('Should return accordingly', function() {
      assert.equal(character.id, params.id, 'Id should be the same as passed in parameters');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character.position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character.rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character.fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character.rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character.sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character.totalHealth, params.totalHealth, 'Total health should be same as parameters');
      assert.equal(character.currentHealth, 100, 'Current health should be 100');
      assert.notExists(character.neverGonnaGetUsed, "variable neverGonnaGetUsed should not exist")
      assert.notExists(character.anotherUnusedIndex, "variable neverGonnaGetUsed should not exist")
    });
  });

  describe('when created with inline parameters',function(){
    let character = new Character({id: "fancyId", totalHealth: 987, neverGonnaGetUsed: "fake", anotherUnusedIndex: "not there"})
    it('Should return with attributes from parameters', function() {
      assert.equal(character.id, "fancyId", 'Id should be the same as passed in parameters');
      assert.notEqual(character.id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character.totalHealth, 987, 'Total health should be same as parameters');
    });
  });

  describe('dealing damage',function(){
    let character = new Character({curentHealth: 100})
    it('Should be able to take damage', function() {
      character.takeDamage(32)
      assert.equal(character.currentHealth, 68, 'resulting health should be 68');
    });
  });
  // describe('getter functions',function(){
  //   let character = new character(fullParams);
  //   it('Should return correct attributes from parameters', function() {
  //     assert.equal(character.id, fullParams.id, 'Id should be the same as passed in parameters');
  //     assert.equal(character.currentMission, fullParams.currentMission, 'Current mission should be the same as in parameters');
  //     assert.equal(character.totalHealth, fullParams.totalHealth, 'Total health should be same as in parameters');
  //     assert.equal(character.currentHealth, fullParams.currentHealth, 'Current health should be the same as in parameters');
  //   });
  //   it('Should not be writeable', function() {
  //     let fail = "fail-value"
  //     character.id = character.currentMission = character.totalHealth = character.currentHealth = fail;
  //     assert.notEqual(character.id, fail, 'Should not overwrite when trying to write to id getter.');
  //     assert.equal(character.currentMission, fullParams.currentMission, 'Should not overwrite when trying to write to currentMission getter.');
  //     assert.equal(character.totalHealth, fullParams.totalHealth, 'Should not overwrite when trying to write to totalHealth getter.');
  //     assert.equal(character.currentHealth, fullParams.currentHealth, 'Should not overwrite when trying to write to currentHealth getter.');
  //   });
  // });

});