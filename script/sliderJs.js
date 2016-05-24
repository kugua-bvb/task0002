window.onload = function(){
	var container = document.getElementById("container");
	var list = document.getElementById("list");
	var button = document.getElementById("slider-control").getElementsByTagName("span");
	var index = 1;
	var timer = null;

	for(var i = 0,len = button.length; i < len; i++){
		button[i].onclick = function(){
			if(this.className == "selected"){
				return;
			}
			var curIndex = this.getAttribute("index");
			var offset = -630 * (curIndex - index);
			animate(offset);
			index = curIndex;
			showButton();
		};
	}

	container.onmouseover = stop;
	container.onmouseout = play;

	play();

	function showButton(){
		for(var i = 0, len = button.length; i < len; i++){
			if(button[i].className == "selected"){
				button[i].className = "";
				break;
			}
		}

		button[index - 1].className = "selected";
	}

	function animate(offset){
		var newLeft = parseInt(list.style.left) + offset;
		var time = 300;
		var interval = 10;
		var speed = offset/(time/interval);
		go();

		function go(){
			if((speed < 0 && parseInt(list.style.left) > newLeft) || (speed > 0 && parseInt(list.style.left) < newLeft)){
				list.style.left = parseInt(list.style.left) + speed + "px";
				setTimeout(go,interval);
			}
			else{
				list.style.left = newLeft + "px";
				if(newLeft > -630){
					list.style.left = -3150 + "px";
				}
				if(newLeft < -3150){
					list.style.left = -630 + "px";
				}
			}	
		}
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
};