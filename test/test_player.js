// test_player.js

var assert = require('chai').assert;

const CONSTANTS     = require('../public/scripts/lib/constants');
const Player        = require('../server/lib/Player');

describe('Player',function(){
  let fullParams = {
    id: 'test-id-12345',
    currentMission: {id: 'test-mission-id'},
    totalHealth: 561,
    currentHealth: 246
  }

  describe('when created without parameters',function(){
    let player = new Player()
    it('Should return with default attributes', function() {
      assert.equal(typeof player._id, 'string', 'Player id should be a string.');
      assert.notEqual(player._id, new Player().id, 'Id should be different from another new player instance.');
      assert.equal(player._currentMission, null, 'Mission should be null');
      assert.equal(player._totalHealth, 200, 'Total health should be 200');
      assert.equal(player._currentHealth, 150, 'Current health should be 150');
    });
  });

  describe('When created with full parameters',function(){
    let player = new Player(fullParams);
    it('Should return with attributes from parameters', function() {
      assert.equal(player._id, fullParams.id, 'Id should be the same as passed in parameters');
      assert.notEqual(player._id, new Player().id, 'Id should be different from another new player instance.');
      assert.equal(player._currentMission, fullParams.currentMission, 'Current mission should be the same as in parameters');
      assert.equal(player._totalHealth, fullParams.totalHealth, 'Total health should be same as in parameters');
      assert.equal(player._currentHealth, fullParams.currentHealth, 'Current health should be the same as in parameters');
    });
  });

  describe('When created with partial parameters',function(){
    it('Should return correctly with only id parameter assigned', function() {
      let params = {id: 'new-test-id'}
      let player = new Player(params);
      assert.equal(player._id, params.id, 'Id should be the same as passed in parameters');
      assert.notEqual(player._id, new Player().id, 'Id should be different from another new player instance.');
      assert.equal(player._currentMission, null, 'Mission should be null');
      assert.equal(player._totalHealth, 200, 'Total health should be 200');
      assert.equal(player._currentHealth, 150, 'Current health should be 150');
    });
    it('Should return correctly with only current mission parameter assigned', function() {
      let params = { mission: {id:'test-mission-id'} }
      let player = new Player(params);
      assert.equal(typeof player._id, 'string', 'Player id should be a string.');
      assert.notEqual(player._id, new Player().id, 'Id should be different from another new player instance.');
      assert.equal(player._currentMission, params.currentMission, 'Current mission should be the same as in parameters');
      assert.equal(player._totalHealth, 200, 'Total health should be 200');
      assert.equal(player._currentHealth, 150, 'Current health should be 150');
    });
    it('Should return correctly with only total health parameter assigned', function() {
      let params = {totalHealth: 498}
      let player = new Player(params);
      assert.equal(typeof player._id, 'string', 'Player id should be a string.');
      assert.notEqual(player._id, new Player().id, 'Id should be different from another new player instance.');
      assert.equal(player._currentMission, null, 'Mission should be null');
      assert.equal(player._totalHealth, params.totalHealth, 'Total health should be same as in parameters');
      assert.equal(player._currentHealth, 150, 'Current health should be 150');
    });
    it('Should return correctly with only id parameter assigned', function() {
      let params = {currentHealth: 42}
      let player = new Player(params);
      assert.equal(typeof player._id, 'string', 'Player id should be a string.');
      assert.notEqual(player._id, new Player().id, 'Id should be different from another new player instance.');
      assert.equal(player._currentMission, null, 'Mission should be null');
      assert.equal(player._totalHealth, 200, 'Total health should be 200');
      assert.equal(player._currentHealth, params.currentHealth, 'Current health should be the same as in parameters');
    });
  });

  describe('getter functions',function(){
    let player = new Player(fullParams);
    it('Should return correct attributes from parameters', function() {
      assert.equal(player.id, fullParams.id, 'Id should be the same as passed in parameters');
      assert.equal(player.currentMission, fullParams.currentMission, 'Current mission should be the same as in parameters');
      assert.equal(player.totalHealth, fullParams.totalHealth, 'Total health should be same as in parameters');
      assert.equal(player.currentHealth, fullParams.currentHealth, 'Current health should be the same as in parameters');
    });
    it('Should not be writeable', function() {
      let fail = "fail-value"
      player.id = player.currentMission = player.totalHealth = player.currentHealth = fail;
      assert.notEqual(player.id, fail, 'Should not overwrite when trying to write to id getter.');
      assert.equal(player.currentMission, fullParams.currentMission, 'Should not overwrite when trying to write to currentMission getter.');
      assert.equal(player.totalHealth, fullParams.totalHealth, 'Should not overwrite when trying to write to totalHealth getter.');
      assert.equal(player.currentHealth, fullParams.currentHealth, 'Should not overwrite when trying to write to currentHealth getter.');
    });
  });

});