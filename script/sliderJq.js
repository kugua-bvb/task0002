$(function(){
	var container = $(".container");
	var list = $(".list");
	var button = $(".slider-control span");
	var index = 1;
	var timer = null;
	var len = button.length;
	console.log(len);

	button.each(function(){
		$(this).bind("click",function(){
			if($(this).attr("class") == "selected"){
				return;
			}
			var curIndex = parseInt($(this).attr("index"));
			var offset = -630 * (curIndex - index);
			animate(offset);
			index = curIndex;
			showButton();
		});
	});

	container.hover(stop,play);

	play();

	function showButton(){
		button.eq(index-1).addClass("selected").siblings().removeClass("selected");
	}

	function animate(offset){
	    var left = parseInt(list.css("left")) + offset;
	    console.log(left);
 	    console.log(offset);
	    if (offset > 0) {
	        offset = '+=' + offset;
	    }
	    else {
	        offset = '-=' + Math.abs(offset);
	    }
	    list.animate({'left': offset}, 300, function () {
	        if(left > -630){
	            list.css('left', -630 * len);
	        }
	        if(left < (-630 * len)) {
	            list.css('left', -630);
	        }
	    });	
	}

	function next(){
		var offset = -630;
		animate(offset);
		if(index == 5){
			index = 1;
		}else{
			index++;
		}
		showButton();
	}

	function play(){
		timer = setInterval(next,3000);
	}
	function stop(){
		clearInterval(timer);
		timer = null;
	}
});