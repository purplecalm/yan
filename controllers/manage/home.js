'use strict';

var config = require('../../config');

module.exports = function* show(next) {
  var params = this.params;
  // normal: {id: $id, subid, $subid}
  // scope: [$id, $subid]
  
  this.status=200;

  yield this.render('home', {
    title: 'home',
    config: config,
    type: 'home'
  });
};
