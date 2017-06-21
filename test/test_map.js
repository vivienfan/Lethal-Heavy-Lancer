// test_player.js

var assert = require('chai').assert;

const CONSTANTS     = require('../public/scripts/lib/constants');
const GameMap        = require('../server/lib/GameMap');

const gridSize = CONSTANTS.MAP.DEFAULT_SIZE

describe('GameMap',function(){
  let fullParams = {
    id: 'test-id-12345',
  }

  describe('when created without parameters',function(){
    let map = new GameMap()
    it('Should return with default attributes', function() {
      assert.equal(typeof map.id, 'string', 'Player id should be a string.');
      assert.notEqual(map.id, new GameMap().id, 'Id should be different from another new player instance.');
      assert.isTrue(map.grid[0][0].isObstacle, 'Corner should be an obstacle');
      assert.isTrue(map.grid[gridSize -1][gridSize -1].isObstacle, 'Corner should be an obstacle');
      assert.isTrue(map.grid[12][gridSize -1].isObstacle, 'Edge should be obstace');
      assert.isTrue(map.grid[0][7].isObstacle, 'Edge should be obstace');
      assert.isTrue(map.grid[gridSize -1][10].isObstacle, 'Edge should be obstace');
      assert.isTrue(map.grid[2][0].isObstacle, 'Edge should be obstace');
      assert.isFalse(map.grid[2][2].isObstacle, 'Inner spot should not be obstace');
    });
    // console.log(map.messageFormat())
    console.log(map.messageFormat().grid[0][0],map.messageFormat().grid[1][1])
  });

  // describe('When created with full parameters',function(){
  //   let player = new Player(fullParams);
  //   it('Should return with attributes from parameters', function() {
  //     assert.equal(player.id, fullParams.id, 'Id should be the same as passed in parameters');
  //     assert.notEqual(player.id, new Player().id, 'Id should be different from another new player instance.');
  //     assert.equal(player.currentMission, fullParams.currentMission, 'Current mission should be the same as in parameters');
  //     assert.equal(player.totalHealth, fullParams.totalHealth, 'Total health should be same as in parameters');
  //     assert.equal(player.currentHealth, fullParams.currentHealth, 'Current health should be the same as in parameters');
  //   });
  // });

  // describe('When created with partial parameters',function(){
  //   it('Should return correctly with only id parameter assigned', function() {
  //     let params = {id: 'new-test-id'}
  //     let player = new Player(params);
  //     assert.equal(player.id, params.id, 'Id should be the same as passed in parameters');
  //     assert.notEqual(player.id, new Player().id, 'Id should be different from another new player instance.');
  //     assert.equal(player.currentMission, null, 'Mission should be null');
  //     assert.equal(player.totalHealth, 200, 'Total health should be 200');
  //     assert.equal(player.currentHealth, 150, 'Current health should be 150');
  //   });
  //   it('Should return correctly with only current mission parameter assigned', function() {
  //     let params = { mission: {id:'test-mission-id'} }
  //     let player = new Player(params);
  //     assert.equal(typeof player.id, 'string', 'Player id should be a string.');
  //     assert.notEqual(player.id, new Player().id, 'Id should be different from another new player instance.');
  //     assert.equal(player.currentMission, params.currentMission, 'Current mission should be the same as in parameters');
  //     assert.equal(player.totalHealth, 200, 'Total health should be 200');
  //     assert.equal(player.currentHealth, 150, 'Current health should be 150');
  //   });
  //   it('Should return correctly with only total health parameter assigned', function() {
  //     let params = {totalHealth: 498}
  //     let player = new Player(params);
  //     assert.equal(typeof player.id, 'string', 'Player id should be a string.');
  //     assert.notEqual(player.id, new Player().id, 'Id should be different from another new player instance.');
  //     assert.equal(player.currentMission, null, 'Mission should be null');
  //     assert.equal(player.totalHealth, params.totalHealth, 'Total health should be same as in parameters');
  //     assert.equal(player.currentHealth, 150, 'Current health should be 150');
  //   });
  //   it('Should return correctly with only id parameter assigned', function() {
  //     let params = {currentHealth: 42}
  //     let player = new Player(params);
  //     assert.equal(typeof player.id, 'string', 'Player id should be a string.');
  //     assert.notEqual(player.id, new Player().id, 'Id should be different from another new player instance.');
  //     assert.equal(player.currentMission, null, 'Mission should be null');
  //     assert.equal(player.totalHealth, 200, 'Total health should be 200');
  //     assert.equal(player.currentHealth, params.currentHealth, 'Current health should be the same as in parameters');
  //   });
  // });

  // describe('getter functions',function(){
  //   let player = new Player(fullParams);
  //   it('Should return correct attributes from parameters', function() {
  //     assert.equal(player.id, fullParams.id, 'Id should be the same as passed in parameters');
  //     assert.equal(player.currentMission, fullParams.currentMission, 'Current mission should be the same as in parameters');
  //     assert.equal(player.totalHealth, fullParams.totalHealth, 'Total health should be same as in parameters');
  //     assert.equal(player.currentHealth, fullParams.currentHealth, 'Current health should be the same as in parameters');
  //   });
  //   it('Should not be writeable', function() {
  //     let fail = "fail-value"
  //     player.id = player.currentMission = player.totalHealth = player.currentHealth = fail;
  //     assert.notEqual(player.id, fail, 'Should not overwrite when trying to write to id getter.');
  //     assert.equal(player.currentMission, fullParams.currentMission, 'Should not overwrite when trying to write to currentMission getter.');
  //     assert.equal(player.totalHealth, fullParams.totalHealth, 'Should not overwrite when trying to write to totalHealth getter.');
  //     assert.equal(player.currentHealth, fullParams.currentHealth, 'Should not overwrite when trying to write to currentHealth getter.');
  //   });
  // });

});