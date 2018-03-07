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

function JMLeftClick(e){
  if(this.object && !this.object.rightMouseButtonIsDown && this.object.click) this.object.click(e,false);
}
function JMRightClick(e){
  console.log('up?',e.buttons);
  if(e.buttons==0){
    this.object.rightMouseButtonIsDown=false;
    this.removeEventListener('mouseup',JMRightClick,false);
    if(this.object && this.object.click) this.object.click(e,true);
  }

}

function JMRightMouseDown(e){
  if(this.object){
    e.preventDefault();
    this.object.rightMouseButtonIsDown=true;
    this.addEventListener('mouseup',JMRightClick,false);
  }
}

function JMAddLeftClick(el){ el.addEventListener('click',JMLeftClick,false); }
function JMAddRightClick(el){ el.addEventListener('contextmenu',JMRightMouseDown,false); }

function JMTouchStart(e){
  if(this.object && !this.object.touching && e.changedTouches.length==1 && this.object.touchStart){
    e.preventDefault();

    this.object.touching=true;
    this.object.finger={touch:e.changedTouches[0].identifier,x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
    this.addEventListener('touchmove',JMTouchMove,false);
    this.addEventListener('touchend',JMTouchEnd,false);
    this.addEventListener('touchcancel',JMTouchEnd,false);
    this.object.touchStart(e);

  }
}

function JMTouchMove(e){
  if(this.object && this.object.touching && this.object.touchMove){

    for(var i=0;i<e.changedTouches.length;i++){
      if(e.changedTouches[i].identifier==this.object.finger.touch){
        e.preventDefault();
        var x=e.changedTouches[0].clientX-this.object.finger.x;
        var y=e.changedTouches[0].clientY-this.object.finger.y;
        this.object.touchMove(x,y);
        break;
      }
    }
  }
}

function JMTouchEnd(e){
  if(this.object && this.object.touching){
    for(var i=0;i<e.changedTouches.length;i++){
      if(e.changedTouches[i].identifier==this.object.finger.touch){
        e.preventDefault();
        this.object.touching=false;
        this.removeEventListener('touchmove',JMTouchMove,false);
        this.removeEventListener('touchend',JMTouchEnd,false);
        this.removeEventListener('touchcancel',JMTouchEnd,false);
        this.identifier=0;
        if(this.object.touchEnd){
          this.object.touchEnd(e);
        }
        break;
      }
    }
  }
}
var JMMouseTarget=null;

function JMMouseDown(e){
  JMMouseTarget=this.object;
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


function JMAddMouse(el){ el.addEventListener('mousedown',JMMouseDown,false); }

function JMAddTouch(el){ el.addEventListener('touchstart',JMTouchStart,false); }


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
