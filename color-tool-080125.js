(function() {
  if (window.__pickrLoaded) return;
  window.__pickrLoaded = !0;
  const load = (tag, attrs) => new Promise((res, rej) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => (el[k] = v));
    el.onload = res;
    el.onerror = rej;
    document.head.appendChild(el)
  });
  Promise.all([load('link', {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css',
  }), load('script', {
    src: 'https://cdn.jsdelivr.net/npm/@simonwep/pickr'
  }), ]).then(() => {
    const style = document.createElement('style');
    style.textContent = `
      #pickrContainer {
        all: initial;
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        background: #C4EFF5 !important;
        padding: 12px;
        padding-bottom: 0;
        border: 1px solid #ccc;
        border-radius: 8px;
        font-family: sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
    
      #pickrContainer,
      #pickrContainer *,
      .pcr-app,
      .pcr-app * {
        color: #000000 !important;
      }
    
      #pickrContainer .row {
        display: flex;
        align-items: center;
        margin-bottom: 5px;
        gap: 10px;
      }
    
      #pickrContainer .label {
        font-weight: bold;
        font-family: monospace;
        font-size: 21px;
      }
    
      #pickrClose {
        cursor: pointer;
        position: absolute;
        top: 4px;
        right: 8px;
        font-weight: bold;
      }
    
      .pcr-app {
        position: fixed !important;
        top: 200px !important;
        right: 10px !important;
        z-index: 1000000 !important;
        background: #C4EFF5 !important;
      }

      .pickr .pcr-button {
        all: unset;
        display: inline-block;
        position: relative;
        height: 12.3px;
        width: 12.3px;
        padding: .5em;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
        border-radius: .15em;
        background-size: 0;
        transition: all .3s;
      }

      .pcr-last-color {
        margin-top: 0;
        margin-bottom: 0;
      }
      
      .color-swatch {
        width: 30px;
        height: 30px;
        border: 1px solid #999;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
    
      .color-swatch > div {
        flex: 1;
      }
    
      .color-saved {
        border-bottom: 1px solid #999;
      }
    
      .hex-display {
        all: initial;
        font-family: monospace;
        font-size: 13px;
        padding: 2px 4px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        text-align: center;
        width: 80px;
      }
    
      .hex-load-btn {
        all: initial;
        cursor: pointer;
        padding: 2px 6px;
        font-size: 1em;
        border: 1px solid #aaa;
        background: #e0e0e0;
        border-radius: 4px;
      }

      input.contrast-display {
        all: initial;
        font-family: monospace;
        font-size: 14px;
        width: 40px;       /* hex-displayと違う横幅に */
        padding: 2px 4px;
        background: #ffffff;
        border: 1px solid #999;
        border-radius: 4px;
        text-align: center;
      }
          
      #randomColorBtn {
        all: initial;
        background: #e0e0e0;
        border: 1px solid #aaa;
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 15px;
        font-family: monospace;
      }
    
      #pickrContainer .row.contrast-row {
        justify-content: flex-start;
        gap: 4px;
      }
    
      #pickrContainer .row.contrast-row > strong {
        display: inline-block;
        min-width: 60px;
      }
      #dragHandle {
        cursor: move;
        padding: 1px;
        margin-right: 15px;
      }
    `;


    document.head.appendChild(style);
    const container = document.createElement('div');
    container.id = 'pickrContainer';
    container.innerHTML = `
      <div id="pickrClose">✕</div>
    
      <div class="row">
        <div class="label">BG:</div>
        <div id="bgSwatch" class="color-swatch">
          <div class="color-saved"></div>
          <div class="color-current"></div>
        </div>
        <button id="bgHexLoad" class="hex-load-btn">⇦</button>
        <input id="bgHex" class="hex-display" value="-">
        <button id="dragHandle" class="hex-load-btn">🟰</button>
      </div>
    
      <div class="row">
        <div class="label">FG:</div>
        <div id="fgSwatch" class="color-swatch">
          <div class="color-saved"></div>
          <div class="color-current"></div>
        </div>
        <button id="fgHexLoad" class="hex-load-btn">⇦</button>
        <input id="fgHex" class="hex-display" value="-">
        <button id="swapColorsBtn" class="hex-load-btn">↕</button>
      </div>
    
      <div class="row">
        <button id="randomColorBtn">🎨色変更</button>
        <label><input type="checkbox" id="color-toggle-bg-lock">BG固定</label>
        <label><input type="checkbox" id="color-toggle-fg-lock">FG固定</label>
      </div>
    
      <div class="row contrast-row" style="align-items: center;">
        <strong>Contrast:</strong>
        <span id="contrastRatio" style="width: 51px;">-</span>
        <input
          id="contrastMin"
          class="contrast-display"
          type="number"
          min="1"
          max="21"
          step="0.1"
          value="3"
          title="Minimum contrast ratio"
        >
        <span style="margin: 0;">–</span>
        <input
          id="contrastMax"
          class="contrast-display"
          type="number"
          min="1"
          max="21"
          step="0.1"
          value="21"
          title="Maximum contrast ratio"
        >
      </div>
    `;

    document.body.appendChild(container);

    // ここからドラッグ処理を追加
  (function() {
    const dragHandle = document.getElementById('dragHandle');
    const container = document.getElementById('pickrContainer');
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
  
    // --- マウス操作 ---
    dragHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;
      e.preventDefault();
    });
  
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      container.style.left = e.clientX - offsetX + 'px';
      container.style.top = e.clientY - offsetY + 'px';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  
    // --- タッチ操作 ---
    dragHandle.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      isDragging = true;
      offsetX = touch.clientX - container.getBoundingClientRect().left;
      offsetY = touch.clientY - container.getBoundingClientRect().top;
      e.preventDefault();
    });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    container.style.left = touch.clientX - offsetX + 'px';
    container.style.top = touch.clientY - offsetY + 'px';
    container.style.right = 'auto';
    container.style.bottom = 'auto';
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });
})();

    
    const getHex = (prop) => {
      const rgb = getComputedStyle(document.body)[prop];
      if (!rgb || rgb === 'transparent' || rgb.startsWith('rgba(0, 0, 0, 0)')) {
        return null
      }
      const nums = rgb.match(/\d+/g)?.map(Number);
      return nums && nums.length >= 3 ? '#' + nums.slice(0, 3).map((n) => n.toString(16).padStart(2, '0')).join('') : null
    };
    const applyStyle = (prop, value) => {
      if (!value) return;
      const id = prop === 'color' ? '__fgOverride' : '__bgOverride';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        document.head.appendChild(el)
      }
      el.textContent = `*:not(#pickrContainer):not(#pickrContainer *):not(.pcr-app):not(.pcr-app *) {       ${prop}: ${value} !important;     }`
    };
    const updateSwatch = (swatch, current, saved) => {
      if (!swatch) return;
      swatch.querySelector('.color-current').style.background = current;
      swatch.querySelector('.color-saved').style.background = saved
    };
    const updateColorHexDisplays = () => {
      document.getElementById("bgHex").value = currentBg;
      document.getElementById("fgHex").value = currentFg
    };
    const getContrast = (fg, bg) => {
      const lum = (hex) => {
        const rgb = hex.match(/\w\w/g).map((v) => parseInt(v, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
      };
      const [l1, l2] = [lum(fg), lum(bg)];
      return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2)
    };

    function hexToHSL(hex) {
      let r = parseInt(hex.substr(1,2),16)/255;
      let g = parseInt(hex.substr(3,2),16)/255;
      let b = parseInt(hex.substr(5,2),16)/255;
    
      let max = Math.max(r,g,b), min = Math.min(r,g,b);
      let h, s, l = (max + min)/2;
    
      if(max == min){
        h = s = 0; // achromatic
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
          case r: h = (g - b)/d + (g < b ? 6 : 0); break;
          case g: h = (b - r)/d + 2; break;
          case b: h = (r - g)/d + 4; break;
        }
        h *= 60;
      }
    
      return {h: Math.round(h), s: Math.round(s*100), l: Math.round(l*100)};
    }
    
    const contrastEl = document.getElementById('contrastRatio');
    const updateContrast = () => (contrastEl.textContent = getContrast(currentFg, currentBg));
    let savedFg = getHex('color') || '#000000';
    let savedBg = getHex('backgroundColor') || '#ffffff';
    let currentFg = savedFg;
    let currentBg = savedBg;
    const initPickr = (id, prop) => {
      const swatch = document.getElementById(id + 'Swatch');
      const isFg = prop === 'color';
      const getSaved = () => (isFg ? savedFg : savedBg);
      const setSaved = (v) => (isFg ? (savedFg = v) : (savedBg = v));
      const getCurrent = () => (isFg ? currentFg : currentBg);
      const setCurrent = (v) => (isFg ? (currentFg = v) : (currentBg = v));
      const pickr = Pickr.create({
        el: `#${id}Swatch`,
        theme: 'classic',
        default: getSaved(),
        components: {
          preview: !0,
          opacity: !1,
          hue: !0,
          interaction: {
            input: !0,
            save: !0,
          },
        },
      });
      pickr.on('change', (color) => {
        const hex = color.toHEXA().toString();
        setCurrent(hex);
        applyStyle(prop, hex);
        updateSwatch(swatch, hex, getSaved());
        updateContrast()
      });
      pickr.on('save', (color) => {
        const hex = color.toHEXA().toString();
        setCurrent(hex);
        setSaved(hex);
        applyStyle(prop, hex);
        updateSwatch(swatch, hex, hex);
        updateContrast();
        if (isFg) window.__fgHSL = hexToHSL(hex);
        else window.__bgHSL = hexToHSL(hex);
      });
      pickr.on('hide', () => {
        setCurrent(getSaved());
        applyStyle(prop, getSaved());
        updateSwatch(swatch, getSaved(), getSaved());
        updateContrast()
      });
      updateSwatch(swatch, getCurrent(), getSaved());
      applyStyle(prop, getCurrent());
      updateContrast();
      return pickr
    };
    let bgPickr = null;
    let fgPickr = null;
    try {
      bgPickr = initPickr('bg', 'background-color');
      fgPickr = initPickr('fg', 'color')
    } catch (e) {
      console.warn('Pickrの初期化に失敗しました:', e);
      alert('Pickrの初期化に失敗しました:', e);
      bgPickr = {
        setColor: (color) => {
          currentBg = savedBg = color;
          applyStyle('background-color', color);
          updateSwatch(document.getElementById('bgSwatch'), color, color);
          updateContrast()
        },
        show: () => {},
        destroyAndRemove: () => {},
      };
      fgPickr = {
        setColor: (color) => {
          currentFg = savedFg = color;
          applyStyle('color', color);
          updateSwatch(document.getElementById('fgSwatch'), color, color);
          updateContrast()
        },
        show: () => {},
        destroyAndRemove: () => {},
      }
    }
    updateColorHexDisplays();
    document.getElementById('bgHexLoad').onclick = () => {
      const val = document.getElementById('bgHex').value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        bgPickr.setColor(val, !0)
      }
      bgPickr.show()
    };
    document.getElementById('fgHexLoad').onclick = () => {
      const val = document.getElementById('fgHex').value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        fgPickr.setColor(val, !0)
      }
      fgPickr.show()
    };

    function hslToHex(h, s, l) {
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0,
        g = 0,
        b = 0;
      if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0
      } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0
      } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x
      } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c
      } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c
      } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x
      }
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")
    }

    function getRandomHSL() {
      return {
        h: Math.floor(Math.random() * 360),
        s: Math.floor(Math.random() * 80) + 20,
        l: Math.floor(Math.random() * 80) + 10
      }
    }

    function changeColors() {
      const bgLocked = document.getElementById("color-toggle-bg-lock").checked;
      const fgLocked = document.getElementById("color-toggle-fg-lock").checked;
      const contrastMin = parseFloat(document.getElementById("contrastMin").value) || 1;
      const contrastMax = parseFloat(document.getElementById("contrastMax").value) || 21;
      let trials = 0;
      const maxTrials = 300;
      while (trials < maxTrials) {
        trials++;
        if (!bgLocked) {
          window.__bgHSL = getRandomHSL()
        }
        if (!fgLocked) {
          window.__fgHSL = getRandomHSL()
        }
        const bgHex = hslToHex(window.__bgHSL.h, window.__bgHSL.s, window.__bgHSL.l);
        const fgHex = hslToHex(window.__fgHSL.h, window.__fgHSL.s, window.__fgHSL.l);
        const ratio = parseFloat(getContrast(fgHex, bgHex));
        if (ratio >= contrastMin && ratio <= contrastMax) {
          if (!bgLocked) currentBg = savedBg = bgHex;
          if (!fgLocked) currentFg = savedFg = fgHex;
          applyStyle("background-color", savedBg);
          applyStyle("color", savedFg);
          updateSwatch(document.getElementById("bgSwatch"), savedBg, savedBg);
          updateSwatch(document.getElementById("fgSwatch"), savedFg, savedFg);
          updateContrast();
          updateColorHexDisplays();
          return
        }
      }
      alert("指定されたコントラスト範囲に合うランダム色の組み合わせが見つかりませんでした。")
    }
    document.getElementById("randomColorBtn").onclick = changeColors;
    document.getElementById("swapColorsBtn").onclick = () => {
      [currentFg, currentBg] = [currentBg, currentFg];
      [savedFg, savedBg] = [currentFg, currentBg];
      applyStyle("color", currentFg);
      applyStyle("background-color", currentBg);
      updateColorHexDisplays();
      updateContrast()
    };
    document.getElementById("bgHex").addEventListener("change", (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        currentBg = savedBg = val;
        applyStyle("background-color", val);
        updateSwatch(document.getElementById("bgSwatch"), val, val);
        updateContrast();
        window.__bgHSL = hexToHSL(val);
      }
    });
    document.getElementById("fgHex").addEventListener("change", (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        currentFg = savedFg = val;
        applyStyle("color", val);
        updateSwatch(document.getElementById("fgSwatch"), val, val);
        updateContrast()
      }
    });
    document.getElementById('pickrClose').onclick = () => {
      fgPickr.destroyAndRemove();
      bgPickr.destroyAndRemove();
      container.remove();
      style.remove();
      applyStyle('color', savedFg);
      applyStyle('background-color', savedBg);
      updateContrast();
      window.__pickrLoaded = !1
    }
  })
  .catch((err) => {
    alert("Pickr の読み込みに失敗しました。CSP によってブロックされている可能性があります。");
    console.error("Pickr load error:", err);
});
})()
