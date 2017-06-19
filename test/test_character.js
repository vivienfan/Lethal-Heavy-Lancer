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
      assert.equal(typeof character._id, 'string', 'character id should be a string.');
      assert.notEqual(character._id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character._type, CONSTANTS.CHAR_TYPE.ENEMY, 'character type should that of an enemy');
      assert.deepEqual(character._position, {x:0, y:0, z:0}, 'position should be at origin');
      assert.deepEqual(character._rotation, {x:0, y:0, z:0}, 'rotation should be at origin');
      assert.equal(character._fwdSpeed, 0, 'fwdSpeed should be 0');
      assert.equal(character._rotYSpeed, 0, 'rotYSpeed should be 0');
      assert.equal(character._sideSpeed, 0, 'sideSpeed should be 0');
      assert.equal(character._totalHealth, 100, 'Total health should be 100');
      assert.equal(character._currentHealth, 100, 'Current health should be 100');
    });
  });

  describe('when created with full parameters',function(){
    let character = new Character(fullParams)
    it('Should return with attributes from parameters', function() {
      assert.equal(character._id, fullParams.id, 'Id should be the same as passed in parameters');
      assert.notEqual(character._id, new Character().id, 'Id should be different from another new character instance.');
      assert.equal(character._type, fullParams.type, 'character type should be same as parameters');
      assert.deepEqual(character._position, fullParams.position, 'position should be same as parameters');
      assert.deepEqual(character._rotation, fullParams.rotation, 'rotation should be same as parameters');
      assert.equal(character._fwdSpeed, fullParams.fwdSpeed, 'fwdSpeed should be same as parameters');
      assert.equal(character._rotYSpeed, fullParams.rotYSpeed, 'rotYSpeed should be same as parameters');
      assert.equal(character._sideSpeed, fullParams.sideSpeed, 'sideSpeed should be same as parameters');
      assert.equal(character._totalHealth, fullParams.totalHealth, 'Total health should be same as parameters');
      assert.equal(character._currentHealth, fullParams.currentHealth, 'Current health should be same as parameters');
    });
  });

  // describe('When created with partial parameters',function(){
  //   it('Should return correctly with only id parameter assigned', function() {
  //     let params = {id: 'new-test-id'}
  //     let character = new character(params);
  //     assert.equal(character._id, params.id, 'Id should be the same as passed in parameters');
  //     assert.notEqual(character._id, new character().id, 'Id should be different from another new character instance.');
  //     assert.equal(character._currentMission, null, 'Mission should be null');
  //     assert.equal(character._totalHealth, 200, 'Total health should be 200');
  //     assert.equal(character._currentHealth, 150, 'Current health should be 150');
  //   });
  //   it('Should return correctly with only current mission parameter assigned', function() {
  //     let params = { mission: {id:'test-mission-id'} }
  //     let character = new character(params);
  //     assert.equal(typeof character._id, 'string', 'character id should be a string.');
  //     assert.notEqual(character._id, new character().id, 'Id should be different from another new character instance.');
  //     assert.equal(character._currentMission, params.currentMission, 'Current mission should be the same as in parameters');
  //     assert.equal(character._totalHealth, 200, 'Total health should be 200');
  //     assert.equal(character._currentHealth, 150, 'Current health should be 150');
  //   });
  //   it('Should return correctly with only total health parameter assigned', function() {
  //     let params = {totalHealth: 498}
  //     let character = new character(params);
  //     assert.equal(typeof character._id, 'string', 'character id should be a string.');
  //     assert.notEqual(character._id, new character().id, 'Id should be different from another new character instance.');
  //     assert.equal(character._currentMission, null, 'Mission should be null');
  //     assert.equal(character._totalHealth, params.totalHealth, 'Total health should be same as in parameters');
  //     assert.equal(character._currentHealth, 150, 'Current health should be 150');
  //   });
  //   it('Should return correctly with only id parameter assigned', function() {
  //     let params = {currentHealth: 42}
  //     let character = new character(params);
  //     assert.equal(typeof character._id, 'string', 'character id should be a string.');
  //     assert.notEqual(character._id, new character().id, 'Id should be different from another new character instance.');
  //     assert.equal(character._currentMission, null, 'Mission should be null');
  //     assert.equal(character._totalHealth, 200, 'Total health should be 200');
  //     assert.equal(character._currentHealth, params.currentHealth, 'Current health should be the same as in parameters');
  //   });
  // });

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