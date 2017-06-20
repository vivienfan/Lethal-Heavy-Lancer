// test_mission.js

var assert = require("chai").assert;

const CONSTANTS = require("../public/scripts/lib/constants");
const Mission   = require('../server/lib/Mission.js');
const Character = require('../server/lib/Character.js');

describe('Mission',function(){
  let fullParams = {
    id: 'test-id-12345',
    type: CONSTANTS.MISSION_TYPE.STEAL,
    characters: [
      { id: "test-char-id", type: CONSTANTS.CHAR_TYPE.PLAYER },
      { id: "second-test-char-id"}
    ]
  }

  describe('when created without parameters',function(){
    let mission = new Mission()
    it('Should return with default attributes', function() {
      assert.equal(typeof mission.id, 'string', 'Mission id should be a string.');
      assert.notEqual(mission.id, new Mission().id, 'Id should be different from another new mission instance.');
      assert.equal(mission.type, CONSTANTS.MISSION_TYPE.KILL, 'Mission type should be KILL constant value');
      assert.deepEqual(mission.characters, [], 'Character Array should be an empty array');
    });
  });

  describe('When created with full parameters',function(){
    let mission = new Mission(fullParams);
    it('Should return with attributes from parameters', function() {
      assert.equal(mission.id, fullParams.id, 'Id should be the same as passed in parameters');
      assert.notEqual(mission.id, new Mission().id, 'Id should be different from another new mission instance.');
      assert.equal(mission.type, fullParams.type, 'Current mission type should be the same as in parameters');
      assert.equal(mission.characters.length, fullParams.characters.length, 'Amount of characters should be the same as parameters');
      assert.deepEqual(mission.characters[1], new Character(fullParams.characters[1]), 'characters should be properly constructed');
    });
  });

  describe('When calling fire on', function() {
    let params = { characters: [
      new Character({id: "player", range: 100, damage: 55, type: CONSTANTS.CHAR_TYPE.PLAYER}),
      new Character({id: "enemy1", type: CONSTANTS.CHAR_TYPE.ENEMY}),
      new Character({id: "enemy2", position: {x: 150, y: 0, z: 150}, type: CONSTANTS.CHAR_TYPE.ENEMY}),
      new Character({id: "enemy3", position: {x: 99, y: 0, z: 99}, type: CONSTANTS.CHAR_TYPE.PLAYER})
      ]}
    let mission = new Mission(params);
    it("Should be able to tell if a character can hit another", function() {
      assert.isTrue(mission.canHit(mission.characters[0], mission.characters[1]), 'Should be true when in range')
      assert.isFalse(mission.canHit(mission.characters[0], mission.characters[2]), 'Should be false when not in any range')
      assert.isFalse(mission.canHit(mission.characters[0], mission.characters[3]), 'Should be false when not in radial range')
    })

    it("Should be able hit a character in range and damage it", function() {
      mission.fireOn(mission.characters[0], mission.characters[1])
      mission.fireOn(mission.characters[0], mission.characters[2])
      assert.equal(mission.characters[1].currentHealth, 45, 'Health should be reduced')
      assert.equal(mission.characters[2].currentHealth, 100, 'health should not be reduced when out of range')
    })

  })

//   describe('getter functions',function(){
//     let mission = new mission(fullParams);
//     it('Should return correct attributes from parameters', function() {
//       assert.equal(mission.id, fullParams.id, 'Id should be the same as passed in parameters');
//       assert.equal(mission.currentMission, fullParams.currentMission, 'Current mission should be the same as in parameters');
//       assert.equal(mission.totalHealth, fullParams.totalHealth, 'Total health should be same as in parameters');
//       assert.equal(mission.currentHealth, fullParams.currentHealth, 'Current health should be the same as in parameters');
//     });
//     it('Should not be writeable', function() {
//       let fail = "fail-value"
//       mission.id = mission.currentMission = mission.totalHealth = mission.currentHealth = fail;
//       assert.notEqual(mission.id, fail, 'Should not overwrite when trying to write to id getter.');
//       assert.equal(mission.currentMission, fullParams.currentMission, 'Should not overwrite when trying to write to currentMission getter.');
//       assert.equal(mission.totalHealth, fullParams.totalHealth, 'Should not overwrite when trying to write to totalHealth getter.');
//       assert.equal(mission.currentHealth, fullParams.currentHealth, 'Should not overwrite when trying to write to currentHealth getter.');
//     });
//   });

});