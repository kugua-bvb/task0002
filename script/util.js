/**
* 判断是否有某个className
* @param {HTMLElement} element 元素
* @param {string} className className
* @return {boolean}
*/
function hasClass(element, className) {
    var classNames = element.className;
    if (!classNames) {
        return false;
    }
    classNames = classNames.split(/\s+/);
    for (var i = 0, len = classNames.length; i < len; i++) {
        if (classNames[i] === className) {
            return true;
        }
    }
    return false;
}

/**
* 添加className
*
* @param {HTMLElement} element 元素
* @param {string} className className
*/
function addClass(element, className) {
    if (!hasClass(element, className)) {
        element.className = element.className ?[element.className, className].join(' ') : className;
    }
}

/**
* 删除元素className
*
* @param {HTMLElement} element 元素
* @param {string} className className
*/
function removeClass(element, className) {
    if (className && hasClass(element, className)) {
        var classNames = element.className.split(/\s+/);
        for (var i = 0, len = classNames.length; i < len; i++) {
            if (classNames[i] === className) {
                classNames.splice(i, 1);
                break;
            }
        }
    }
    element.className = classNames.join(' ');
}

/**
* 添加事件
* @param {Element} element DOM元素
* @param {string} event 事件名称
* @param {function} listener 事件处理程序的函数
*/
var addEvent = function(element, event, listener) {
    if (element.addEventListener) {
        element.addEventListener(event, listener);
    } else if (element.attachEvent) {
        element.attachEvent("on" + event, listener);
    }
};

/**
* 删除事件
* @param {Element} element DOM元素
* @param {string} event 事件名称
* @param {function} listener 事件处理程序的函数
*/
var removeEvent = function(element, event, listener) {
    if (element.removeEventListener) {
        element.removeEventListener(event, listener);
    } else if (element.detachEvent) {
        element.detachEvent("on" + event, listener);
    }
};

/**
* 事件代理
* @param {Element} element DOM元素(父元素)
* @param {string} tag 标签名
* @param {string} eventName 事件名称
* @param {function} listener 事件处理程序的函数
*/
var delegateEvent = function(element, tag, eventName, listener) {
    addEvent(element, eventName, function(e) {
        var event = e || window.event;
        var target = event.target || event.srcElement; 
        if (target && target.tagName.toLowerCase() == tag.toLowerCase()) {
            listener.call(target, event);
        }
    });
};

/**
* 封装AJAX
* @param {string} url 发送请求的地址
* @param {Object} options 发送请求的选项参数
*/
function ajax(url,options){
    var options = options || {};
    var data = stringifyData(options.data || {});
    var type = {options.type || "GET"}.toUpperCase();

    var xhr = null;
    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
    }else if(window.ActiveXObject){
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if(type === "GET" && data){
        url += url + (url.indexOf("?") >= 0?"&":"?") + data;
    }
    xhr.open(type,url,true);
    if(type === "GET"){
        xhr.send(null);
    }else if(type === "POST"){
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        xhr.send(data);
    }

    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status >= 200 && xhr.status <300 || xhr.status === 304){
                if(options.onsuccess){
                    options.onsuccess(xhr.responseText,xhr.responseXML);
                }else if(options.onfail){
                    options.onfail();
                }
            }
        }
    };

    return xhr;

    function stringifyData(data){
        var param = [];
        for(var key in data){
            if(data.hasOwnProperty(key)){
                param.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
            }
        }
    }
}

/**
 * 简易 $
 * @param {string} selector 选择器
 * @return {Array.<HTMLElement>} 返回匹配的元素列表
 */
function $(selector) {
    var idReg = /^#([\w_\-]+)/;
    var classReg = /^\.([\w_\-]+)/;
    var tagReg = /^\w+$/i;
    // [data-log]
    // [data-log="test"]
    // [data-log=test]
    // [data-log='test']
    var attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/;

    var context = document;

    function direct(part, actions) {
        actions = actions || {
            id: blank,
            className: blank,
            tag: blank,
            attribute: blank
        };
        var fn;
        var params = [].slice.call(arguments, 2);
        // id
        if (result = part.match(idReg)) {
            fn = 'id';
            params.push(result[1]);
        }
        // class
        else if (result = part.match(classReg)) {
            fn = 'className';
            params.push(result[1]);
        }
        // tag
        else if (result = part.match(tagReg)) {
            fn = 'tag';
            params.push(result[0]);
        }
        // attribute
        else if (result = part.match(attrReg)) {
            fn = 'attribute';
            var tag = result[1];
            var key = result[2];
            var value = result[4];
            params.push(tag, key, value);
        }
        return actions[fn].apply(null, params);
    }

    function find(parts, context) {
        var part = parts.pop();

        var actions = {
            id: function (id) {
                return [
                    document.getElementById(id)
                ];
            },
            className: function (className) {
                var result = [];
                if (context.getElementsByClassName) {
                    result = context.getElementsByClassName(className)
                }
                else {
                    var temp = context.getElementsByTagName('*');
                    for (var i = 0, len = temp.length; i < len; i++) {
                        var node = temp[i];
                        if (hasClass(node, className)) {
                            result.push(node);
                        }
                    }
                }
                return result;
            },
            tag: function (tag) {
                return context.getElementsByTagName(tag);
            },
            attribute: function (tag, key, value) {
                var result = [];
                var temp = context.getElementsByTagName(tag || '*');

                for (var i = 0, len = temp.length; i < len; i++) {
                    var node = temp[i];
                    if (value) {
                        var v = node.getAttribute(key);
                        (v === value) && result.push(node);
                    }
                    else if (node.hasAttribute(key)) {
                        result.push(node);
                    }
                }
                return result;
            }
        };

        var ret = direct(part, actions);

        // to array
        ret = [].slice.call(ret);

        return parts[0] && ret[0] ? filterParents(parts, ret) : ret;
    }

    function filterParents(parts, ret) {
        var parentPart = parts.pop();
        var result = [];

        for (var i = 0, len = ret.length; i < len; i++) {
            var node = ret[i];
            var p = node;

            while (p = p.parentNode) {
                var actions = {
                    id: function (el, id) {
                        return (el.id === id);
                    },
                    className: function (el, className) {
                         return hasClass(el, className);
                    },
                    tag: function (el, tag) {
                        return (el.tagName.toLowerCase() === tag);
                    },
                    attribute: function (el, tag, key, value) {
                        var valid = true;
                        if (tag) {
                            valid = actions.tag(el, tag);
                        }
                        valid = valid && el.hasAttribute(key);
                        if (value) {
                            valid = valid && (value === el.getAttribute(key))
                        }
                        return valid;
                    }
                };
                var matches = direct(parentPart, actions, p);

                if (matches) {
                    break;
                }
            }

            if (matches) {
                result.push(node);
            }
        }

        return parts[0] && result[0] ? filterParents(parts, result) : result;
    }

    var result = find(selector.split(/\s+/), context);

    return result;
}

