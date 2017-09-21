'use strict';

var home = require('../controllers/web/home');
var category = require('../controllers/web/category');
var article = require('../controllers/web/article');

function routes(app) {
	app.get('/', home);

	app.get(/\/cateogry\/(\d+)$/, category);
	app.get(/\/cateogry\/(\d+)\/page\/(\d+)$/, category);
	app.get('/category/:id', category);
	app.get('/category/:id/page/:page', category);

	app.get(/\/article\/(\d+)$/, article);
	app.get('/article/:id', article);
}

module.exports = routes;
