javascript:(function(){
  var c=document.createElement('canvas');
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  c.style.position='fixed';
  c.style.top='0';
  c.style.left='0';
  c.style.zIndex='1000';
  c.style.cursor='crosshair';
  document.body.appendChild(c);
  var ctx=c.getContext('2d');
  ctx.strokeStyle='black';
  ctx.lineWidth=3;
  var drawing=false;
  var mode='pen'; // 'pen' or 'eraser'

  // UIコンテナ作成
  var container=document.createElement('div');
  container.style.position='fixed';
  container.style.top='10px';
  container.style.left='10px';
  container.style.zIndex='1001';
  container.style.background='rgba(255,255,255,0.8)';
  container.style.padding='5px';
  container.style.border='1px solid #ccc';
  container.style.borderRadius='5px';
  
  var penBtn=document.createElement('button');
  penBtn.innerText='ペン';
  var eraserBtn=document.createElement('button');
  eraserBtn.innerText='消しゴム';
  container.appendChild(penBtn);
  container.appendChild(eraserBtn);
  document.body.appendChild(container);

  penBtn.onclick=function(){mode='pen'; ctx.globalCompositeOperation='source-over'; ctx.strokeStyle='black';};
  eraserBtn.onclick=function(){mode='eraser'; ctx.globalCompositeOperation='destination-out'; ctx.strokeStyle='rgba(0,0,0,1)';};

  // マウスイベント
  c.addEventListener('mousedown',function(e){
    drawing=true;
    ctx.beginPath();
    ctx.moveTo(e.clientX,e.clientY);
  });
  c.addEventListener('mousemove',function(e){
    if(drawing){ ctx.lineTo(e.clientX,e.clientY); ctx.stroke(); }
  });
  c.addEventListener('mouseup',function(){drawing=false;});
  c.addEventListener('mouseleave',function(){drawing=false;});

  // タッチイベント
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
