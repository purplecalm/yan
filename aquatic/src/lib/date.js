(function(){
	Date.prototype.format=function(tpl){
		return (tpl||tmpl).replace(/YYYY/g,this.getFullYear()).replace(/MM/g,String(this.getMonth()+101).substring(1)).replace(/DD/g,String(this.getDate()+100).substring(1))
			.replace(/hh/g,String(this.getHours()+100).substring(1)).replace(/mm/g,String(this.getMinutes()+100).substring(1)).replace(/ss/g,String(this.getSeconds()+100).substring(1));
	};
})();