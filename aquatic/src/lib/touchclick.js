define(['jquery'],function(){
	
	var _delegate=$.fn.delegate;
	var _bind=$.fn.bind;
	
	$.fn.delegate=function(selector,eveName,handle){
		if(eveName.toLowerCase&&eveName.toLowerCase()=='click'){
			
			var started=[];
			
			_delegate.call(this,selector,'touchstart',function(e){
				var dom=this;
				for( var i=0; i<started.length; i++){
					if(started[i].dom==dom){
						return true;
					}
				}
				
				var eve=e.originalEvent;
				var changed=eve.changedTouches, fingers=[];
				
				for( var i=0; i<changed.length; i++){
					fingers.push({
						x: changed[i].screenX,
						y: changed[i].screenY,
						id: changed[i].identifier,
						dom: dom,
						time: new Date().valueOf()
					});
				}
	
				if(fingers.length==1){
					started.push(fingers[0]);
				}
				
				return true;
			});
			
			_delegate.call(this,selector,'touchend',function(e){
				var dom=this, finger=false, index=0;
				for( var i=0; i<started.length; i++){
					if(started[i].dom==dom){
						finger=started[i];
						index=i;
						break;
					}
				}
				
				if(finger){
					var eve=e.originalEvent;
					var changed=eve.changedTouches;
					for( var i=0; i<changed.length; i++){
						if(finger.id==changed[i].identifier){
							var pos={
								x: changed[i].screenX,
								y: changed[i].screenY,
								id: changed[i].identifier,
								time: new Date().valueOf()
							};
							
							if((finger.x-pos.x)*(finger.x-pos.x)+(finger.y-pos.y)*(finger.y-pos.y)< 50 && pos.time - finger.time < 1000 ){
								handle.call(this,e);
							}
							
							started.splice(i,1);
							break;
						}
					}
				}
				
				return true;
			});
			
		}else{
			return _delegate.call(this,selector,eveName,handle);
		}
	};
	
	
	$.fn.bind=function(eveName,handle){
		if(eveName.toLowerCase&&eveName.toLowerCase()=='click'){
			
			var started=[];
			
			_bind.call(this,'touchstart',function(e){
				var dom=this;
				for( var i=0; i<started.length; i++){
					if(started[i].dom==dom){
						return true;
					}
				}
				
				var eve=e.originalEvent;
				var changed=eve.changedTouches, fingers=[];
				for( var i=0; i<changed.length; i++){
					fingers.push({
						x: changed[i].screenX,
						y: changed[i].screenY,
						id: changed[i].identifier,
						dom: dom
					});
				}
				
				if(fingers.length==1){
					started.push(fingers[0]);
				}
				
				return true;
			});
			
			_bind.call(this,'touchend',function(e){
				var dom=this, finger=false, index=0;
				for( var i=0; i<started.length; i++){
					if(started[i].dom==dom){
						finger=started[i];
						index=i;
						break;
					}
				}
				
				if(finger){
					var eve=e.originalEvent;
					var changed=eve.changedTouches;
					for( var i=0; i<changed.length; i++){
						if(finger.id==changed[i].identifier){
							var pos={
								x: changed[i].screenX,
								y: changed[i].screenY,
								id: changed[i].identifier
							};
							
							if((finger.x-pos.x)*(finger.x-pos.x)+(finger.y-pos.y)*(finger.y-pos.y)< 50){
								handle.call(this,e);
							}
							
							started.splice(i,1);
							break;
						}
					}
				}
				
				return true;
			});
			
		}else{
			return _bind.call(this,eveName,handle);
		}
		
		return this;
	};
	
	return $;
});