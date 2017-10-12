'use strict';

var home = require('../controllers/manage/home');
var api = require('../controllers/manage/api');

function routes(app) {
	app.get('/', home);
	app.get('/manage', home);

	app.get(/\/api\/(.+)$/, api);
	app.get('/api/:key', api);

	app.post(/\/api\/(.+)$/, api);
	app.post('/api/:key', api);
}

module.exports = routes;
