'use strict';

var notFound = require('../middleware/not_found');
var staticCache = require('../middleware/static');
var middlewares = require('koa-middlewares');

var routes = require('../routes/web');
var config = require('../config');

var cacheService=require('../services/cache');

var path = require('path');
var http = require('http');
var koa = require('koa');
var fs = require('fs');
var maxrequests = require('koa-maxrequests');

var app = koa();

var rootdir = path.dirname(__dirname);

app.use(maxrequests());

app.use(middlewares.rt({headerName: 'X-ReadTime'}));
app.use(middlewares.rewrite('/favicon.ico', '/favicon.png'));
app.use(staticCache);

app.keys = ['BBF', config.sessionSecret];

app.use(middlewares.bodyParser());
app.use(notFound);

if (config.enableCompress) {
  app.use(middlewares.compress({threshold: 150}));
}

app.use(middlewares.conditional());
app.use(middlewares.etag());

var viewDir = path.join(rootdir, 'view', 'web');
cacheService.writeLayout();


middlewares.ejs(app, {
  root: viewDir,
  viewExt: 'html',
  layout: '_layout',
  cache: config.viewCache,
  debug: config.debug,
  locals: {
	config: config
  }
});

/**
 * Routes
 */
app.use(middlewares.router(app));
routes(app);

/**
 * Error handler
 */
app.on('error', function (err, ctx) {
  err.url = err.url || ctx.request.url;
  console.log(err);
  console.log(err.stack);
});

app = http.createServer(app.callback());
module.exports = app;
