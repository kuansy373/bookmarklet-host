javascript:(function(){
  var c=document.createElement('canvas');
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  c.style.position='fixed';
  c.style.top='0';
  c.style.left='0';
  c.style.zIndex='1';
  c.style.cursor='crosshair';
  document.body.appendChild(c);
  var ctx=c.getContext('2d');
  ctx.strokeStyle='black';
  ctx.lineWidth=3;
  var drawing=false;

  // マウス用イベント
  c.addEventListener('mousedown',function(e){
    drawing=true; 
    ctx.beginPath(); 
    ctx.moveTo(e.clientX,e.clientY);
  });
  c.addEventListener('mousemove',function(e){
    if(drawing){ctx.lineTo(e.clientX,e.clientY); ctx.stroke();}
  });
  c.addEventListener('mouseup',function(){drawing=false;});
  c.addEventListener('mouseleave',function(){drawing=false;});

  // タッチ用イベント
  c.addEventListener('touchstart',function(e){
    drawing=true;
    var touch=e.touches[0];
    ctx.beginPath();
    ctx.moveTo(touch.clientX, touch.clientY);
  }, {passive:false});
  c.addEventListener('touchmove',function(e){
    e.preventDefault();
    if(drawing){
      var touch=e.touches[0];
      ctx.lineTo(touch.clientX, touch.clientY);
      ctx.stroke();
    }
  }, {passive:false});
  c.addEventListener('touchend',function(e){drawing=false;});
  c.addEventListener('touchcancel',function(e){drawing=false;});
})();
