// test_player.js

var assert = require("chai").assert;

const CONSTANTS     = require("../public/scripts/lib/constants");
const Player        = require('../server/lib/Player');

describe("Player",function(){
  describe("When created without parameters",function(){
    let player = new Player()
    it("Should return a string for id", function() {
      // assert.isTrue(check(account));
      assert.equal(typeof player.id, "string");
    });
    it("Should have different id than another player object", function() {
      assert.notEqual(player.id, new Player().id);
    });
    it("Should return null for mission", function() {
      assert.equal(player.mission, null);
    });
    it("Should return 200 for totalHealth", function() {
      assert.equal(player.totalHealth, 200);
    });
    it("Should return 150 for currentHealth", function() {
      assert.equal(player.currentHealth, 150);
    });
  });
  // it("Should return false if the number does not match the luhn algorithm", function () {
  //   var account = 79927398710;
  //   assert.isFalse(check(account));
  // })
});