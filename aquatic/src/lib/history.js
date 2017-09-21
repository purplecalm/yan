;(function(window){
	;(function(){
		// exit if the browser implements that event
		if ( "onhashchange" in window.document.body ) {
			return;
		}
		var location = window.location,
			oldURL = location.href,
			oldHash = location.hash;

		// check the location hash on a 100ms interval
		setInterval(function() {
			var newURL = location.href,
			newHash = location.hash;

			// if the hash has changed and a handler has been bound...
			if ( newHash != oldHash && typeof window.onhashchange === "function" ) {
				// execute the handler
				window.onhashchange({
					type: "hashchange",
					oldURL: oldURL,
					newURL: newURL
				});

				oldURL = newURL;
				oldHash = newHash;
			}
		}, 100);
	})();
	
	var counter=parseInt(window.location.hash.substring(1),10)||0;
	
	var steps={};
	var _handle=function(){
		
		var hash=parseInt(window.location.hash.substring(1),10)||0;
		
		if(steps[hash]){
			//steps[hash]();
			//delete steps[hash];
			
			$.each(steps,function(key,callback){
				if(parseInt(key,10)>=hash){
					callback();
					delete steps[key];
				}
			});
		}
	};
	
	window.onhashchange=_handle;
	
	history.push=function(callback){
		var hash=parseInt(window.location.hash.substring(1),10)||0;
		steps[hash]=callback;
		counter++
		window.location.hash=counter;
	};
	
})(this);