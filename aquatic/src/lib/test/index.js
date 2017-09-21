require(['./case.js','./cases/index.js'],function(Case){
	var _ajax=$.ajax;
	
	$.ajax=function(args){
		var url;
		if(typeof args=='string'){
			url=args;
		}else{
			url=args.url;
		}
		
		var cases;
		if(cases=Case.lookup(url)){
			var item=cases[parseInt(Math.random()*cases.length)];
			return item.send(args);
		}else{
			return _ajax.apply(this,Array.prototype.slice.call(arguments));
		}
	};
});