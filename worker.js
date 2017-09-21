'use strict';

var graceful = require('graceful');
var web = require('./servers/web');
var manage = require('./servers/manage');
var config = require('./config');

web.listen(config.webPort);
manage.listen(config.managePort);

console.log('[%s] [worker:%d] Server started, Manage server listen at port %d, Web server listen at port %d',
  new Date(), process.pid,
  config.managePort,
  config.webPort);

graceful({
  server: [web],
  error: function (err, throwErrorCount) {
    if (err.message) {
      err.message += ' (uncaughtException throw ' + throwErrorCount + ' times on pid:' + process.pid + ')';
    }
    console.error(err);
    console.error(err.stack);
  }
});
