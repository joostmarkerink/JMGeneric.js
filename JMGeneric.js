/*
Copyright 2018 Joost Markerink

Permission is hereby granted, free of charge,
to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

Object.prototype.isElementObject=function(){ return false; };

function JMElementObject(tag,classes){
  JMElementObject.allObjects.push(this);
  if(tag && Array.isArray(tag)){
    classes=tag; tag='div';
  }else{
    if(!classes) classes=[];
    if(!tag) tag='div';
  }
  this.element=JMCreateElement(tag,classes);
  this.element.elementObject=this;
}

JMElementObject.defineClass=function(func){
  func.prototype = Object.create(JMElementObject.prototype);
  func.prototype.constructor = func;
};

JMElementObject.allObjects=[];

JMElementObject.prototype.isElementObject=function(){ return true; };


function JMLeftClick(e){
  if(this.elementObject && !this.elementObject.rightMouseButtonIsDown && this.elementObject.click) this.elementObject.click(e,false);
}
function JMRightClick(e){
  console.log('up?',e.buttons);
  if(e.buttons==0){
    this.elementObject.rightMouseButtonIsDown=false;
    this.removeEventListener('mouseup',JMRightClick,false);
    if(this.elementObject && this.elementObject.click) this.elementObject.click(e,true);
  }

}

function JMRightMouseDown(e){
  if(this.elementObject){
    e.preventDefault();
    this.elementObject.rightMouseButtonIsDown=true;
    this.addEventListener('mouseup',JMRightClick,false);
  }
}

function JMAddLeftClick(obj){
  obj.element.addEventListener('click',JMLeftClick,false);
}
function JMAddRightClick(obj){
  obj.element.addEventListener('contextmenu',JMRightMouseDown,false);
}

function JMTouchStart(e){
  if(this.elementObject && !this.elementObject.touching && e.changedTouches.length==1 && this.elementObject.touchStart){
    e.preventDefault();

    this.elementObject.touching=true;
    this.elementObject.finger={touch:e.changedTouches[0].identifier,x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
    this.addEventListener('touchmove',JMTouchMove,false);
    this.addEventListener('touchend',JMTouchEnd,false);
    this.addEventListener('touchcancel',JMTouchEnd,false);
    this.elementObject.touchStart(e);

  }
}

function JMTouchMove(e){
  if(this.elementObject && this.elementObject.touching && this.elementObject.touchMove){

    for(var i=0;i<e.changedTouches.length;i++){
      if(e.changedTouches[i].identifier==this.elementObject.finger.touch){
        e.preventDefault();
        var x=e.changedTouches[0].clientX-this.elementObject.finger.x;
        var y=e.changedTouches[0].clientY-this.elementObject.finger.y;
        this.elementObject.touchMove(x,y);
        break;
      }
    }
  }
}

function JMTouchEnd(e){
  if(this.elementObject && this.elementObject.touching){
    for(var i=0;i<e.changedTouches.length;i++){
      if(e.changedTouches[i].identifier==this.elementObject.finger.touch){
        e.preventDefault();
        this.elementObject.touching=false;
        this.removeEventListener('touchmove',JMTouchMove,false);
        this.removeEventListener('touchend',JMTouchEnd,false);
        this.removeEventListener('touchcancel',JMTouchEnd,false);
        this.identifier=0;
        if(this.elementObject.touchEnd) this.elementObject.touchEnd(e);
        break;
      }
    }
  }
}
var JMMouseTarget=null;

function JMMouseDown(e){
  JMMouseTarget=this.elementObject;
  JMMouseTarget.mouse={x:e.clientX,y:e.clientY};
  window.addEventListener('mousemove',JMMouseMove,false);
  window.addEventListener('mouseup',JMMouseUp,false);
  if(JMMouseTarget.mouseDown){
    e.preventDefault();
    JMMouseTarget.mouseDown(JMMouseTarget.mouse.x,JMMouseTarget.mouse.y);
  }
}


function JMMouseMove(e){
  if(JMMouseTarget && JMMouseTarget.mouseMove){
    e.preventDefault();
    var x=e.clientX-JMMouseTarget.mouse.x;
    var y=e.clientY-JMMouseTarget.mouse.y;
    JMMouseTarget.mouseMove(x,y);
  }
}



function JMMouseUp(e){
  if(JMMouseTarget){
    e.preventDefault();
    var x=e.clientX-JMMouseTarget.mouse.x;
    var y=e.clientY-JMMouseTarget.mouse.y;

    if(JMMouseTarget.mouseUp) JMMouseTarget.mouseUp(x,y);
    window.removeEventListener('mousemove',JMMouseMove,false);
    window.removeEventListener('mouseup',JMMouseUp,false);
    JMMouseTarget=null;
  }
}


function JMAddMouse(obj){ obj.element.addEventListener('mousedown',JMMouseDown,false); }

function JMAddTouch(obj){ obj.element.addEventListener('touchstart',JMTouchStart,false); }


function JMCreateElement(tag,classes,parent){
  var e=document.createElement(tag);
  for(var i=0;i<classes.length;i++) e.classList.add(classes[i]);
  if(parent) parent.appendChild(e);
  return e;
}


var JMWindow_resize_timer=0;
var JMWindow_resize_targets=[];



function JMWindow_didResize(){
 JMWindow_resize_timer=0;
 document.querySelector('body').classList.add('resizing');
 for(var i=0;i<JMWindow_resize_targets.length;i++){
   if(JMWindow_resize_targets[i] && JMWindow_resize_targets[i].resized)
    JMWindow_resize_targets[i].resized();
 }
 setTimeout(function(){document.querySelector('body').classList.remove('resizing');},200);
}


function JMWindow_resize(e){
  clearTimeout(JMWindow_resize_timer);
  JMWindow_resize_timer=setTimeout(JMWindow_didResize,100);
}


function JMAddWindowResized(ob){
  JMWindow_resize_targets.push(ob);
  window.removeEventListener('resize',JMWindow_resize);
  window.addEventListener('resize',JMWindow_resize);
  JMWindow_didResize();
}

var JMGlobal={element:null,resize:function(){}};

window.addEventListener('load',function(){
  JMAddWindowResized(JMGlobal);
  JMGlobal.element=document.querySelector('body');
},false);
