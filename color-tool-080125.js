(function () {
  if (window.__pickrLoaded) return;
  window.__pickrLoaded = true;

  const load = (tag, attrs) =>
    new Promise((res, rej) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => (el[k] = v));
      el.onload = res;
      el.onerror = rej;
      document.head.appendChild(el);
    });

  Promise.all([
    load('link', {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/themes/classic.min.css',
    }),
    load('script', { src: 'https://cdn.jsdelivr.net/npm/@simonwep/pickr' }),
  ]).then(() => {
    const style = document.createElement('style');
    style.textContent = `
      #pickrContainer {
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 999999;
        background: #C4EFF5 !important;
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 8px;
        font-family: sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
      #pickrContainer, #pickrContainer *, .pcr-app, .pcr-app * {
        color: #000000 !important;
      }
      #pickrContainer .row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
      }
      #pickrContainer .label {
        width: 50px;
        font-weight: bold;
      }
      #pickrClose {
        cursor: pointer;
        color: red;
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
        font-family: monospace;
        font-size: 0.9em;
        padding: 2px 4px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        min-width: 70px;
        text-align: center;
      }
      .hex-load-btn {
        cursor: pointer;
        padding: 2px 6px;
        font-size: 1em;
        border: 1px solid #aaa;
        background: #e0e0e0;
        border-radius: 4px;
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
        <input id="bgHex" class="hex-display" value="-">
        <button id="bgHexLoad" class="hex-load-btn">⇦</button>
      </div>
      <div class="row">
        <div class="label">FG:</div>
        <div id="fgSwatch" class="color-swatch">
          <div class="color-saved"></div>
          <div class="color-current"></div>
        </div>
        <input id="fgHex" class="hex-display" value="-">
        <button id="fgHexLoad" class="hex-load-btn">⇦</button>
      </div>
      <div class="row">
        <button id="randomColorBtn">🎨色変更</button>
        <label><input type="checkbox" id="color-toggle-bg-lock">BG固定</label>
        <label><input type="checkbox" id="color-toggle-fg-lock">FG固定</label>
      </div>
      <div>
        <strong>Contrast:</strong> <span id="contrastRatio">-</span>
      </div>
    `;
    document.body.appendChild(container);

    const getHex = (prop) => {
      const rgb = getComputedStyle(document.body)[prop];
      const nums = rgb.match(/\d+/g)?.map(Number);
      return nums && nums.length >= 3
        ? '#' + nums.slice(0, 3).map((n) => n.toString(16).padStart(2, '0')).join('')
        : '#000000';
    };

    const applyStyle = (prop, value) => {
      const id = prop === 'color' ? '__fgOverride' : '__bgOverride';
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        document.head.appendChild(el);
      }
      el.textContent = `*:not(#pickrContainer):not(#pickrContainer *):not(.pcr-app):not(.pcr-app *) {
        ${prop}: ${value} !important;
      }`;
    };

    const updateSwatch = (swatch, current, saved) => {
      if (!swatch) return;
      swatch.querySelector('.color-current').style.background = current;
      swatch.querySelector('.color-saved').style.background = saved;
    };

    const updateColorHexDisplays = () => {
      document.getElementById("bgHex").value = currentBg;
      document.getElementById("fgHex").value = currentFg;
    };

    const getContrast = (fg, bg) => {
      const lum = (hex) => {
        const rgb = hex
          .match(/\w\w/g)
          .map((v) => parseInt(v, 16) / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      };
      const [l1, l2] = [lum(fg), lum(bg)];
      return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
    };

    const contrastEl = document.getElementById('contrastRatio');
    const updateContrast = () => (contrastEl.textContent = getContrast(currentFg, currentBg));

    let savedFg = getHex('color'),
        savedBg = getHex('backgroundColor');
    let currentFg = savedFg,
        currentBg = savedBg;

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
          preview: true,
          opacity: false,
          hue: true,
          interaction: {
            input: true,
            save: true,
          },
        },
      });

      pickr.on('change', (color) => {
        const hex = color.toHEXA().toString();
        setCurrent(hex);
        applyStyle(prop, hex);
        updateSwatch(swatch, hex, getSaved());
        updateColorHexDisplays();
        updateContrast();
      });

      pickr.on('save', (color) => {
        const hex = color.toHEXA().toString();
        setCurrent(hex);
        setSaved(hex);
        applyStyle(prop, hex);
        updateSwatch(swatch, hex, hex);
        updateColorHexDisplays();
        updateContrast();
      });

      pickr.on('hide', () => {
        setCurrent(getSaved());
        applyStyle(prop, getSaved());
        updateSwatch(swatch, getSaved(), getSaved());
        updateColorHexDisplays();
        updateContrast();
      });

      updateSwatch(swatch, getCurrent(), getSaved());
      applyStyle(prop, getCurrent());
      updateContrast();

      return pickr;
    };

    const bgPickr = initPickr('bg', 'background-color');
    const fgPickr = initPickr('fg', 'color');
    updateColorHexDisplays();

    // ⇦ ボタン機能：HEX欄の値を Pickr に反映
    document.getElementById('bgHexLoad').onclick = () => {
      const val = document.getElementById('bgHex').value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        bgPickr.setColor(val, true);
      }
    };

    document.getElementById('fgHexLoad').onclick = () => {
      const val = document.getElementById('fgHex').value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        fgPickr.setColor(val, true);
      }
    };

    function hslToHex(h, s, l) {
      s /= 100; l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (0 <= h && h < 60) { r = c; g = x; b = 0; }
      else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
      else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
      else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
      else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
      else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
    }

    function getRandomHSL() {
      return {
        h: Math.floor(Math.random() * 360),
        s: Math.floor(Math.random() * 30) + 70,
        l: Math.floor(Math.random() * 30) + 30
      };
    }

    function changeColors() {
      if (!window.__bgHSL) window.__bgHSL = getRandomHSL();
      if (!window.__fgHSL) window.__fgHSL = getRandomHSL();

      const bgLocked = document.getElementById("color-toggle-bg-lock").checked;
      const fgLocked = document.getElementById("color-toggle-fg-lock").checked;

      if (!bgLocked) {
        window.__bgHSL = getRandomHSL();
        const bgHex = hslToHex(window.__bgHSL.h, window.__bgHSL.s, window.__bgHSL.l);
        currentBg = savedBg = bgHex;
      }

      if (!fgLocked) {
        window.__fgHSL = getRandomHSL();
        const fgHex = hslToHex(window.__fgHSL.h, window.__fgHSL.s, window.__fgHSL.l);
        currentFg = savedFg = fgHex;
      }

      applyStyle("background-color", savedBg);
      applyStyle("color", savedFg);

      updateSwatch(document.getElementById("bgSwatch"), savedBg, savedBg);
      updateSwatch(document.getElementById("fgSwatch"), savedFg, savedFg);

      updateColorHexDisplays();
      updateContrast();
    }

    document.getElementById("randomColorBtn").onclick = changeColors;

    document.getElementById("bgHex").addEventListener("change", (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        currentBg = savedBg = val;
        applyStyle("background-color", val);
        updateSwatch(document.getElementById("bgSwatch"), val, val);
        updateContrast();
      }
    });

    document.getElementById("fgHex").addEventListener("change", (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        currentFg = savedFg = val;
        applyStyle("color", val);
        updateSwatch(document.getElementById("fgSwatch"), val, val);
        updateContrast();
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
      window.__pickrLoaded = false;
    };
  });
})();
