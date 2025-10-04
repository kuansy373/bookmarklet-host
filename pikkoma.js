// === 右スライダー ===
const scrollSliderRight = document.createElement('input');
scrollSliderRight.type = 'range';
scrollSliderRight.min = 0;
scrollSliderRight.max = 25;
scrollSliderRight.value = 0;
Object.assign(scrollSliderRight.style, {
  all: 'unset',
  position: 'fixed',
  height: '210vh',
  bottom: '-108vh',
  right: '30px',
  zIndex: '9999',
  width: '80px',
  opacity: '1',
});
document.body.appendChild(scrollSliderRight);
// === 左スライダー ===
const scrollSliderLeft = document.createElement('input');
scrollSliderLeft.type = 'range';
scrollSliderLeft.min = 0;
scrollSliderLeft.max = 25;
scrollSliderLeft.value = 0;
Object.assign(scrollSliderLeft.style, {
  all: 'unset',
  position: 'fixed',
  height: '210vh',
  bottom: '-108vh',
  left: '30px',
  zIndex: '9999',
  width: '80px',
  opacity: '1',
  direction: 'rtl', // 左用は増加方向反転
});
document.body.appendChild(scrollSliderLeft);

// === スクロール処理 ===
const scroller = document.querySelector('.PCM-viewer2_frame');
let scrollSpeed = 0;
let lastTimestamp = null;

function forceScroll(timestamp) {
  if (lastTimestamp !== null && scrollSpeed !== 0) {
    const elapsed = timestamp - lastTimestamp;
    scroller.scrollTop += (scrollSpeed * elapsed) / 1000;
  }
  lastTimestamp = timestamp;
  requestAnimationFrame(forceScroll);
}

// スライダー入力に応じてスクロール速度を変更
function syncScrollSpeed(value) {
  scrollSpeed = parseInt(value, 10) * speedScale;
}
scrollSliderRight.addEventListener('input', () => {
  syncScrollSpeed(scrollSliderRight.value);
  scrollSliderLeft.value = scrollSliderRight.value;
});
scrollSliderLeft.addEventListener('input', () => {
  syncScrollSpeed(scrollSliderLeft.value);
  scrollSliderRight.value = scrollSliderLeft.value;
});
requestAnimationFrame(forceScroll);
  
// ==============================
// Slider Settings
// ==============================
const scrollUI = document.createElement('div');
Object.assign(scrollUI.style, {
  all: 'unset',
  position: 'fixed',
  top: '10px',
  left: '10px',
  padding: '8px',
  background: 'inherit',
  border: '1px solid',
  borderRadius: '4px',
  fontSize: '14px',
  zIndex: '10002',
  fontFamily: 'sans-serif',
});
scrollUI.innerHTML = `
  <div style="font-weight:bold;">< Slider Settings ></div>
  <label><input id="scrollB" class="settingCheckbox" type="checkbox"><span class="labelText"> Border</span></label><br>
  <label><input id="scrollC" class="settingCheckbox" type="checkbox"><span class="labelText"> Color in</span></label><br>
  <label>Shadow: <input id="scrollS" class="settingInputbox" type="number" value="0"> px</label><br>
  <label><input id="scrollBoth" class="settingCheckbox" type="checkbox"><span class="labelText"> Both sides</span></label><br>
  <label><input id="scrollRight" class="settingCheckbox" type="checkbox" checked><span class="labelText"> Right side</span></label><br>
  <label><input id="scrollLeft" class="settingCheckbox" type="checkbox"><span class="labelText"> Left side</span></label><br>
  <label>Position: <input id="scrollX" class="settingInputbox" type="number" value="30"> px</label><br>
  <label>Width: <input id="scrollW" class="settingInputbox" type="number" value="80"> px</label><br>
  <label>Opacity: <input id="scrollO" class="settingInputbox" type="text" inputmode="decimal" min="0" max="1" step="0.05" value="1"> (0~1)</label><br>
  <label>Speed scale: <input id="scrollSpeedScale" class="settingInputbox" type="number" min="0" max="20" step="1" value="10"> (0~20)</label><br>
  <label><input id="scrollHide" class="settingCheckbox" type="checkbox"><span class="labelText"> Slider ball</span></label><br>
`;
document.body.appendChild(scrollUI);
document.querySelectorAll('.settingCheckbox').forEach(cb => {
  Object.assign(cb.style, {
    all: 'revert',
    height: '15px',
    width: '15px',
    verticalAlign: 'middle',
  });
});
document.querySelectorAll('.settingInputbox').forEach(cb => {
  Object.assign(cb.style, {
    all: 'initial',
    width: '60px',
    border: '1px solid',
    color: 'unset',
  });
});
document.querySelectorAll('.labelText').forEach(span => {
  Object.assign(span.style, {
    position: 'fixed',
    paddingTop: '1.5px',
  });
});
// === イベント ===
// Border
document.getElementById('scrollB').addEventListener('change', e => {
if (e.target.checked) {
    if (scrollC.checked) scrollC.checked = false;
    scrollSliderRight.style.border = scrollSliderLeft.style.border = '1px solid';
    scrollSliderRight.style.setProperty("background", "transparent", "important");
    scrollSliderLeft.style.setProperty("background", "transparent", "important");
  } else {
    scrollSliderRight.style.border = scrollSliderLeft.style.border = 'none';
  }
});
// Color in
document.getElementById('scrollC').addEventListener('change', e => {
  if (e.target.checked) {
    if (scrollB.checked) scrollB.checked = false;
    scrollSliderRight.style.border = scrollSliderLeft.style.border = 'none';
    const borderColor = 'currentColor'; // border と同じ色
    scrollSliderRight.style.setProperty("background", borderColor, "important");
    scrollSliderLeft.style.setProperty("background", borderColor, "important");
  } else {
    scrollSliderRight.style.setProperty("background", "transparent", "important");
    scrollSliderLeft.style.setProperty("background", "transparent", "important");
  }
});
// Shadow
const scrollS = document.getElementById('scrollS');
scrollS.addEventListener('input', () => {
  let val = Number(scrollS.value) || 0;
  if (val < 0) {
    // マイナス値のときは inset にして、値は絶対値に直す
    scrollSliderRight.style.boxShadow = `inset 0 0 ${Math.abs(val)}px`;
    scrollSliderLeft.style.boxShadow  = `inset 0 0 ${Math.abs(val)}px`;
  } else {
    // プラス値のときは通常
    scrollSliderRight.style.boxShadow = `0 0 ${val}px`;
    scrollSliderLeft.style.boxShadow  = `0 0 ${val}px`;
  }
});
// 右側、左側、両側
const rightbox = document.getElementById('scrollRight');
const leftbox = document.getElementById('scrollLeft');
const bothbox = document.getElementById('scrollBoth');
// 最初に「Right side」にチェック
rightbox.checked = true;
scrollSliderRight.style.display = 'block';
scrollSliderLeft.style.display = 'none';
// Rightチェックイベント
rightbox.addEventListener('change', e => {
  if (e.target.checked) {
    if (bothbox.checked) {
      bothbox.checked = false;
    }
    if (leftbox.checked) {
        leftbox.checked = false;
      }
    scrollSliderRight.style.display = 'block';
    scrollSliderLeft.style.display = 'none';
  }else {
    scrollSliderRight.style.display = 'none';
    scrollSliderLeft.style.display = 'none';
  }
});
// Leftチェックイベント
leftbox.addEventListener('change', e => {
  if (e.target.checked) {
    if (bothbox.checked) {
      bothbox.checked = false;
    }
    if (rightbox.checked) {
      rightbox.checked = false;
    }
    scrollSliderRight.style.display = 'none';
    scrollSliderLeft.style.display = 'block';
  } else {
    scrollSliderRight.style.display = 'none';
    scrollSliderLeft.style.display = 'none';
  }
});
// Bothチェックイベント
bothbox.addEventListener('change', e => {
  if (e.target.checked) {
    if (rightbox.checked) {
      rightbox.checked = false;
    }
    if (leftbox.checked) {
      leftbox.checked = false;
    }
    scrollSliderLeft.style.display = 'block';
    scrollSliderRight.style.display = 'block';
  } else if (!leftbox.checked) {
    scrollSliderLeft.style.display = 'none';
    scrollSliderRight.style.display = 'none';
  } else {
    scrollSliderLeft.style.display = 'none';
    scrollSliderRight.style.display = 'none';
  } 
});
// 位置、長さ、透明度
document.getElementById('scrollX').addEventListener('input', e => {
  const val = parseInt(e.target.value, 10);
  scrollSliderRight.style.right = scrollSliderLeft.style.left = `${val}px`;
});
document.getElementById('scrollW').addEventListener('input', e => {
  const val = parseInt(e.target.value, 10);
  scrollSliderRight.style.width = scrollSliderLeft.style.width = `${val}px`;
});
document.getElementById('scrollO').addEventListener('input', e => {
  const val = parseFloat(e.target.value);
  scrollSliderRight.style.opacity = scrollSliderLeft.style.opacity = val;
});
const opacityInput = document.getElementById('scrollO');
let lastValue = opacityInput.value; // 直前の値を保持
opacityInput.addEventListener('input', e => {
  const currentValue = e.target.value;
  // 一瞬だけ「0」→「0.」に補完
  if (currentValue === '0' && lastValue !== '0.') {
    e.target.value = '0.';
  }
  const num = parseFloat(e.target.value);
  if (!isNaN(num) && num >= 0 && num <= 1) {
    scrollSliderRight.style.opacity = scrollSliderLeft.style.opacity = num;
  }
  lastValue = e.target.value; // 今の値を保存
});
// フォーカス時に 0 → 0. に補完（あれば）
opacityInput.addEventListener('focus', e => {
  if (e.target.value === '0') {
    e.target.value = '0.';
  }
});
// フォーカスが外れたときに 0. → 0
opacityInput.addEventListener('blur', e => {
  if (e.target.value === '0.' || e.target.value === '') {
    e.target.value = '0';
    scrollSliderRight.style.opacity = scrollSliderLeft.style.opacity = 0;
  }
}); 
// スピードスケール  
const speedScaleInput = document.getElementById('scrollSpeedScale');
let speedScale = parseFloat(speedScaleInput.value);

speedScaleInput.addEventListener('input', e => {
  const num = parseFloat(e.target.value);
  if (!isNaN(num)) {
    speedScale = num;
    syncScrollSpeed(scrollSliderRight.value);
  }
});
// 入力値を 0 ～ 20 に制限
speedScaleInput.addEventListener('input', e => {
  let num = parseFloat(e.target.value);
  if (isNaN(num)) return;
  if (num > 20) {
    num = 20;
    e.target.value = 20;
  } else if (num < 0) {
    num = 0;
    e.target.value = 0;
  }
  speedScale = num;
  syncScrollSpeed(scrollSliderRight.value);
});
// Slider ball 
document.getElementById('scrollHide').addEventListener('change', e => {
  if (e.target.checked) {
    scrollSliderRight.style.height = '200vh';
    scrollSliderRight.style.bottom = '-98vh';
    scrollSliderLeft.style.height = '200vh';
    scrollSliderLeft.style.bottom = '-98vh';
  } else {
    scrollSliderRight.style.height = '210vh';
    scrollSliderRight.style.bottom = '-108vh';
    scrollSliderLeft.style.height = '210vh';
    scrollSliderLeft.style.bottom = '-108vh';
  }
});
// ===開閉ボタン ===
const scrollUIToggle = document.createElement('button');
scrollUIToggle.innerHTML = `
<svg width="14" height="14" viewBox="0 0 24 24">
  <polygon points="12,6.144 20,20 4,20" fill="none" stroke="currentColor" stroke-width="1"/>
</svg>
`;
Object.assign(scrollUIToggle.style, {
  all: 'initial',
  position: 'fixed',
    top: '10px',
    left: '18px',
    fontSize: '14px',
    color: 'unset',
    opacity: '0.3',
    cursor: 'pointer',
    zIndex: '10001',
    display: 'block'
});
document.body.appendChild(scrollUIToggle);

scrollUI.style.display = 'none';
  scrollUIToggle.addEventListener('click', () => {
  scrollUI.style.display = 'block';
});
const scrollSCloseBtn = document.createElement('button');
scrollSCloseBtn.textContent = '✕';
Object.assign(scrollSCloseBtn.style, {
  all: 'initial',
  position: 'absolute',
  top: '4px',
  right: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  color: 'unset',
});
scrollUI.appendChild(scrollSCloseBtn);

scrollSCloseBtn.addEventListener('click', () => {
  scrollUI.style.display = 'none';
});
