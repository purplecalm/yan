//css('preview.css');
define(['preview.mustache'],function(){


	var Col=function(cfg){
		this.config=$.extend({
			width: 0,
			parent: false
		},cfg);
		
		this.init();
	};
	
	$.extend(Col.prototype,{
	
	
		init: function(){
			this.dom=$('<div class="col index'+this.config.index+'" data-id="'+this.config.id+'" data-key="'+this.config.key+'"><div class="col-name">'+this.config.key+'</div></div>').appendTo(this.config.parent);
			
			this.width(this.config.width);
		},
	
		width: function(){
			if(arguments.length&&typeof arguments[0]=='number'){
				this.dom.width( 100*(arguments[0])/20 + '%');
				this.config.width=arguments[0];
			}
			
			return this.config.width;
		},
		
		remove: function(){
			this.dom.remove();
		}
	});

	var Preview=function(cfg){
		this.config=$.extend({
			parent: false
		},cfg);
		
		this.init();
	};
	
	$.extend(Preview.prototype,{
		init: function(){
			this.dom=$('<div class="m-preview"></div>').appendTo(this.config.parent);
			this.dom.height(parseInt(0.8*$(window).width()/3.2));
		
			this.counter=0;
		},
		
		addColumn: function(cfg){
			return new Col($.extend({parent: this.dom, index: this.counter++},cfg));
		}
	});
	
	return Preview;
});