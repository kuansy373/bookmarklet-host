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
  var mode='pen'; // 'pen' or 'eraser'

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

  // UIコンテナ作成
  var container = document.createElement('div');
  container.innerHTML = `
    <div style="font-weight:bold;padding-bottom:3px;">< Pen-Mode ></div>
    <button id="penBtn">ペン</button>
    <button id="eraserBtn">消しゴム</button>
  `;
  container.style.cssText = `
    position: fixed;
    display: block;
    top: 10px;
    left: 10px;
    z-index: 1001;
    background: rgba(255,255,255,0.8);
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  `;
  document.body.appendChild(container);
  
  // ボタン取得してクリックイベント
  var penBtn = document.getElementById('penBtn');
  var eraserBtn = document.getElementById('eraserBtn');
  
  penBtn.onclick = function() {
    mode = 'pen';
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'black';
  };
  
  eraserBtn.onclick = function() {
    mode = 'eraser';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  };
})();
