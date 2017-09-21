define(function(){

	var stack={};
	var Case=function(cfg){
		this.config=$.extend({
			success: true,
			message: 'default fail message',
			status: 200,
			data: {},
			url: '',
			timeout: 3000
		},cfg);
		
		this.init();
	};
	
	$.extend(Case.prototype,{
		init: function(){
			if(!stack[this.config.url]){
				stack[this.config.url]=[];
			}
			
			stack[this.config.url].push(this);
		},
		
		send: function(url,callback,fail,complete){
			if(typeof url=='object'){
				callback=url.success||false;
				fail=url.fail||false;
				complete=url.complete||false;
				url=url.url;
			}
			
			if(typeof callback=='object'){
				fail=callback.fail||false;
				complete=callback.complete||false;
				callback=callback.success||false;
			}
			
			var handler;
			var item={
				responseText: JSON.stringify(this.config.data),
				status: this.config.status,
				abort: function(){
					clearTimeout(handler);
				},
				send: $.proxy(function(){
					var copydata=JSON.parse(item.responseText);
					handler=setTimeout($.proxy(function(){
						if(this.config.success){
							callback&&callback(copydata);
						}else{
							fail&&fail({message: this.config.message});
						}
						complete&&complete(item);
						
					},this),this.config.timeout);
				},this)
			};
			
			item.send();
		}
	});
	
	Case.lookup=function(url){
		return stack[url]||false;
	}
	
	return Case;
})(this);