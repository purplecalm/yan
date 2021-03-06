'use strict';

var path = require('path');
var util = require('util');
var cfork = require('cfork');
var config = require('./config');
var workerPath = path.join(__dirname, 'worker.js');

(function(){
	console.log('Starting Server ...');
	cfork({
		exec: workerPath,
		count: config.numCPUs,
	}).on('fork', function (worker) {
		console.log('[%s] [worker:%d] new worker start', Date(), worker.process.pid);
	}).on('disconnect', function (worker) {
		console.error('[%s] [master:%s] wroker:%s disconnect, suicide: %s, state: %s.',
			Date(), process.pid, worker.process.pid, worker.suicide, worker.state);
	}).on('exit', function (worker, code, signal) {
		var exitCode = worker.process.exitCode;
		var err = new Error(util.format('worker %s died (code: %s, signal: %s, suicide: %s, state: %s)',
		  worker.process.pid, exitCode, signal, worker.suicide, worker.state));
		err.name = 'WorkerDiedError';
		console.error('[%s] [master:%s] wroker exit: %s', Date(), process.pid, err.stack);
	});
})();