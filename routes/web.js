'use strict';

var home = require('../controllers/web/home');
var category = require('../controllers/web/category');
var article = require('../controllers/web/article');

function routes(app) {
	app.get('/', home);
	
	app.get('/category/:id', function*(next){
		if(!/^\d+$/.test(this.params.id)){
			return this.status=404;
		}
		
		this.params.id=parseInt(this.params.id,10);
		
		yield next;
	},category);
	app.get('/category/:id/page/:page', function*(next){
		if(!/^\d+$/.test(this.params.id)||!/^\d+$/.test(this.params.page)){
			return this.status=404;
		}
		this.params.id=parseInt(this.params.id,10);
		this.params.page=parseInt(this.params.page,10);
		
		yield next;
	}, category);
	
	app.get('/article/:article', function*(next){
		if(!/^\d+$/.test(this.params.article)){
			return this.status=404;
		}
		this.params.article=parseInt(this.params.article,10);
		
		yield next;
	}, category);
}

module.exports = routes;
