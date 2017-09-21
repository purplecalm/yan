'use strict';

/**
 * Module dependencies.
 */
module.exports = function* notFound(next) {
	yield* next;

	if (this.status && this.status !== 404) {
		return;
	}
	if (this.body) {
		return;
	}
	
	this.status=404;

	yield* this.render('404', {
		title: '404'
	});
};
