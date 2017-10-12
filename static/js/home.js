;(function(){
	var Slider=function(parent){
		this.parent=$(parent);
		this.interval=this.parent.data('interval')||5;
		this.children=$(parent).children();
		
		this.init();
	};
	
	$.extend(Slider.prototype,{
		init: function(){
		
			this.parent.css('width',(this.children.length+2)*100+'%');
			
			var lclone=this.children.last().clone();
			var fclone=this.children.first().clone();
			
			lclone.insertBefore(this.children.first());
			this.parent.append(fclone);
			
			this.parent.css('margin-left','-100%');
			
			this.current=0;
			
			this.initNav();
			
			this.initEvents();
		},
		
		initNav: function(){
			this.nav=$('<div class="slider-nav"></div>').insertAfter(this.parent);
			
			var html=[];
			this.children.each(function(){
				html.push('<a href="javascript:void(0)"></a>');
			});
			
			this.nav.html(html.join(''));
			
			var self=this;
			this.navs=this.nav.find('a').bind('click',function(e){
				e.preventDefault();
				self.moveTo($(this).index());
			});
			
			this.moveTo(this.current);
		},
		
		moveTo: function(index){
		
			index=index%this.children.length;
		
			this.navs.removeClass('current').eq(index).addClass('current');
			
			if(index===this.current){
				return;
			}
			
			
			this.parent.animate({
				'margin-left': (-index-1)*100+'%'
			},600);
			
			this.current=index;
		},
		
		initEvents: function(){
		
			var handle=false, enter=false, self=this, interval=this.interval*1000;
			
			var start=function(){
				enter=false;
				handle=setTimeout(function(){
					self.moveTo(self.current+1);
					
					if(!enter){
						start();
					}
				},interval);
			};
			
			var stop=function(){
				enter=true;
				clearTimeout(handle);
			};
		
			this.parent.bind('mouseenter',stop);
			this.parent.bind('mouseleave',start);
			
			start();
		}
	});
	
	
	var modules={
		list: function(dom){
			var tabParent=dom.find('.sub-tab');
			var tabs=tabParent.find('li');
			var panels=dom.find('.m-list-content');
			
			if(tabs.length===1){
				tabParent.hide();
				panels.show();
				return;
			}
			
			tabs.bind('click',function(){
				tabs.removeClass('active');
				$(this).addClass('active');
				
				panels.hide().eq($(this).index()).show();
			}).eq(0).trigger('click');
		}
	};
	
	$(function(){
		new Slider($('.sliders'));
		
		
		$('.module-item').each(function(){
			var dom=$(this);
			var type=$(this).data('module');
			
			if(modules[type]){
				modules[type](dom);
			}
		});
		
		$('#header .nav-item:eq(0)').addClass('current');
	});
})();