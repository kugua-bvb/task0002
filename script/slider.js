//base on util.js

//copy Object
function extend(target,source){
	for(var key in source){
		if(source.hasOwnProperty(key)){
			target[key] = source[key];
		}
	}

	return target;
}

//bind
function bind(fn,context){
	var args = [].slice.call(arguments,2);

	return function(){
		return fn.apply(context,args);
	};
}

//inherits prototype
function inherits(subClass,superClass){
	var proto = subClass.prototype;
	var Fn = function(){};
	Fn.prototype = superClass.prototype;
	subClass.prototype = new Fn();
	extend(subClass.prototype,proto);

	return subClass;
}

//contains,browser conpatible
function contains(node1,node2){
    if(node1 === node2){
    	return false;
    }
    if(node1.contains){
    	return node1.contains(node2);
    }
    return !!(node1.compareDocumentPosition(node2) & 16);
}


function crossElementBoundary(e) {
    // 当前处理事件的元素
    var currentTarget = e.currentTarget;
    // mouseover时，来源
    var relatedTarget = e.relatedTarget;
    // mouseout时，去处
    if (contains(currentTarget, relatedTarget)) 
        {
            return false;
        }
        return true;
}

// Slider Object
var Slider = function(options){
    this.prefix = "slider";
    this.itemClass = "slider-item";
    this.index = 0;
    this.interval = 2000;
    this.loop = 1;
    this.effect = null;

    extend(this,options);

    this._main = $("." + this.prefix)[0];
    this._items = $("." + this.prefix + " " + "." + this.itemClass);
    this._count = this._items.length;
    this._stage = $("." + this.getPartClass("inner"))[0];
    this._stageWidth = this._stage.clientWidth;

    //dom of control i
    var div = document.createElement('div');
    div.className = this.getPartClass('control');
    for (var i = 0, len = this._items.length; i < len; i++) {
        var iEl = document.createElement('i');
        iEl.setAttribute('data-index', i);
        div.appendChild(iEl);
    }
    this._main.appendChild(div);

    var self = this;

    div.addEventListener('click', function (e) {
        var node = e.target;
        if (node.tagName === 'I' && !hasClass(node, self.getPartClass('item-selected'))) {
            var index = parseInt(node.getAttribute('data-index'), 10);
            self.goTo(index);
        }
    }, false);

    var main = this._main;
    main.addEventListener('mouseover', function (e) {
        if (crossElementBoundary(e)) {
            self._clearTimer();
        }
    }, false);

    main.addEventListener('mouseout', function (e) {
        if (crossElementBoundary(e)) {
            self.play();
        }
    }, false);

    this._setCurrent();
    // init select
    this.slide(this.index);
};

Slider.prototype._setCurrent = function () {
    //获取所有小圆点的dom
    var controlElements = $('.' + this.getPartClass('control') + ' i');
    //定义被选中的class
    var selectedClass = this.getPartClass('control-selected');
    //移除当前index的classname
    if (controlElements[this.lastIndex]) {
        removeClass(controlElements[this.lastIndex], selectedClass);
    }
    //给下一个index增加一个selectedclassname
    if (controlElements[this.index]) {
        addClass(controlElements[this.index], selectedClass);
    }
};

Slider.prototype.getPartClass = function (part) {
    return this.prefix + '-' + part;
};

//determine index at the border by the value of loop
Slider.prototype.getIndex = function (index) {
    if (index >= this._count) {
        index = this.loop ? 0 : this._count - 1;
    } else if (index < 0) {
        index = this.loop ? this._count - 1 : 0;
    }
    return index;
};

//index+1,jump to next pic
Slider.prototype.next = function () {
    this.goTo(this.index + 1);
    return this;
};

Slider.prototype.goTo = function (index) {
    index = this.getIndex(index);
    // update index
    this.lastIndex = this.index;
    this.index = index;
    //给小圆点增加/删除被选中的classname
    this._setCurrent();
    //小圆点搞定了，开始搞图片
    this.slide(this.index, this.lastIndex);

    return this;
};

Slider.prototype.slide = function (index, lastIndex) {
    if (this.effect) {
        this.effect.startWithTarget(this);
        this.effect.switchTo(index, lastIndex);
    }
};

Slider.prototype._onSwitch = function () {
    //执行跳到下一个图片的函数
    this.next();
};
//start from here
Slider.prototype.play = function () {
    //自动循环
    if (this.auto) {
        this._clearTimer();
        this._switchTimer = setInterval(bind(this._onSwitch, this), this.interval);
    }
};

Slider.prototype._clearTimer = function () {
    clearInterval(this._switchTimer);
    this._switchTimer = null;
};

// ----------------- 简易的动画效果---------------------
// setTimeout的定时器值推荐最小使用16.7ms（1000/60）
var raf = window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || function (callback) {
        return setTimeout(callback, 1000 / 60);
    };

var caf = window.cancelAnimationFrame
    || window.webkitCancelAnimationFrame
    || window.mozCancelAnimationFrame
    || window.oCancelAnimationFrame
    || function (id) {
        clearTimeout(id);
    };

// Ainimation Object
var Animation = function (options) {
    this.duration = 1000;
    extend(this, options);
};

Animation.prototype.startWithTarget = function (target) {
    //transfer Slider Object to the prototype of Animation
    this.target = target;
};

Animation.prototype.start = function () {
var self = this;
self._startTime = +new Date();
function mainLoop() {
    var now = +new Date();
    //计算间隔时间
    var elapsedTime = now - self._startTime;
    if (elapsedTime >= self.duration) {
        self.tick(1);
        self.stop();
    }
    else {
        self.tick(elapsedTime / self.duration);
        self._rafId = raf(mainLoop);
    }
}
if (!this._rafId) {
    this._rafId = raf(mainLoop);
}
};

Animation.prototype.stop = function () {
    if (this._rafId) {
        caf(this._rafId);
        this._rafId = null;
    }
};

Animation.prototype.tick = function (percent) {
    this.draw(percent);
};

Animation.prototype.transition = function (from, to, cb) {
    this.from = from;
    this.to = to;
    this.start();
    //Register Callback
    this._done = cb;
};

Animation.prototype.draw = function (percent) {};



// ----------- 轮播效果，继承自Animation ------------- 

var SlideEffect = function(options) {
Animation.call(this, options);
};

// 切换到指定index
SlideEffect.prototype.switchTo = function (index, lastIndex) {
    var slider = this.target;
    //items是一个数组，为图片的dom
    var items = slider._items;
    //选中的图片的classname
    var itemSelectedClass = slider.getPartClass('item-selected');
    //下一张图片的classname
    var itemNextClass = slider.getPartClass('item-next');
    //当前图片的dom
    var currentItem = items[lastIndex];
    //下一张图片的dom
    var nextItem = items[index];
    //给当前图片增加一个选中的class，使其显示出来
    if (currentItem) {
        addClass(currentItem, itemSelectedClass);
    }
    //给下一张图片设置一个等待的class，使其预备着
    if (nextItem) {
        addClass(nextItem, itemNextClass);
    }
    //当只指定了一个index参数时，不播放动画
    if (index === undefined || lastIndex === undefined) {
        return this;
    }
    //start
    var from = 0;
    //stop
    var to = slider._stageWidth;
    //copy下一张图片的index
    this._index = index;
    //copy当前图片的index
    this._lastIndex = lastIndex;
    //slide effect done
    function done() {
        //取消当前选中，使下一个图片候选
        if (currentItem) {
            removeClass(currentItem, itemSelectedClass);
        }
        if (nextItem) {
            removeClass(nextItem, itemNextClass);
            addClass(nextItem, itemSelectedClass);
        }
    }
    this.transition(from, to, done);
    return this;
};

// 绘制dom元素
SlideEffect.prototype.draw = function (percent) {
    var slider = this.target;
    var delta = (this.to - this.from) * percent;
    //    var stageWidth = slider._stageWidth;
    var items = slider._items;
    var currentItem = items[this._lastIndex];
    var nextItem = items[this._index];

    currentItem.style.left = this.from - delta + 'px';
    nextItem.style.left = this.to - delta + 'px';
};

inherits(SlideEffect, Animation);