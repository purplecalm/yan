module.exports={
	subByte: function(t,e,n){var o=[],i=t.split("");n=n||"…";for(var r=0,s=i.length;s>r;r++)i[r].charCodeAt(0)>255&&o.push("*"),o.push(i[r]);return e&&e>0&&o.length>e?i=o.join("").substring(0,e-1).replace(/\*/g,"")+n:t}
};