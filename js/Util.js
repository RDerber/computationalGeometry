
getHueColor = function(param){
    var colors = [];
    var e_color = [];
    var index = 0;
    
    if(param == 1) return 'hsl(0,100%, 50%)';
    colors.push(0);
    index++;

    var loop = 0
    while(loop<30){

        var hue = Math.round(360/(Math.pow(2,index)));
        var i = hue;
        for(;i<360;i+=2*hue){				
            e_color.push(i);				
        }
        index++;
        
        if(param > colors.length && param <= e_color.length + colors.length){
           return getFurhue();
        }else{
            colors = colors.concat(e_color); // merge 
            e_color = [];
        }
        loop++;
    }

	function getFurhue(){
        while(param - colors.length > 0){
            var i=0;
            var max = 0;
            var item;
            while(i<e_color.length){
                var x = Math.cos(e_color[i]);
                var y = Math.sin(e_color[i]);
                
                var dist= 0;
                var j=0;
                while(j<colors.length){
                    dist += Math.pow(x - Math.cos(colors[j]),2) + Math.pow(y - Math.sin(colors[j]),2);
                    j++;
                }
                if(dist > max){ max = dist; item = i;}
                i++;
            }
            colors.push(e_color[item]);
            e_color.splice(item,1);
        }
        var res = colors[colors.length-1];
        
		return 'hsl('+res+','+Math.floor(Math.random()*20+80)+'%, '+Math.floor(Math.random()*35+45)+'%)';
    }
    
}