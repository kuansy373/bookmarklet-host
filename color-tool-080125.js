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
      .apply-btn {
        font-size: 1em;
        padding: 0 4px;
        cursor: pointer;
        background: #eee;
        border: 1px solid #999;
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
          <div class="color-current"></div>
        </div>
        <button class="apply-btn" id="applyBgHex">⇦</button>
        <input id="bgHex" class="hex-display">
      </div>
      <div class="row">
        <div class="label">FG:</div>
        <div id="fgSwatch" class="color-swatch">
          <div class="color-current"></div>
        </div>
        <button class="apply-btn" id="applyFgHex">⇦</button>
        <input id="fgHex" class="hex-display">
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

    // Pickr 初期化
    const createPickr = (el, onChange, onSave) =>
      Pickr.create({
        el,
        theme: 'classic',
        default: '#000000',
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            hex: true,
            input: true,
            save: true
          }
        }
      }).on('change', (color) => {
        const hex = color.toHEXA().toString();
        onChange(hex);
      }).on('save', (color) => {
        const hex = color.toHEXA().toString();
        onSave(hex);
      });

    const bgSwatch = document.getElementById("bgSwatch");
    const fgSwatch = document.getElementById("fgSwatch");
    const bgHex = document.getElementById("bgHex");
    const fgHex = document.getElementById("fgHex");

    let bgColor = '#ffffff';
    let fgColor = '#000000';

    const updateSwatch = (swatch, color) => {
      swatch.querySelector('.color-current').style.background = color;
    };

    const updateHex = (input, color) => {
      input.value = color;
    };

    const updateContrast = () => {
      const contrast = getContrast(bgColor, fgColor).toFixed(2);
      document.getElementById("contrastRatio").textContent = contrast;
    };

    const getContrast = (bg, fg) => {
      const lum = (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) / 255;
        const g = ((rgb >> 8) & 0xff) / 255;
        const b = (rgb & 0xff) / 255;
        const f = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const l1 = lum(bg);
      const l2 = lum(fg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };

    const bgPickr = createPickr(bgSwatch, (hex) => {
      bgColor = hex;
      updateSwatch(bgSwatch, hex);
      updateHex(bgHex, hex);
      updateContrast();
    }, (hex) => {
      bgColor = hex;
      updateSwatch(bgSwatch, hex);
      updateHex(bgHex, hex);
      updateContrast();
    });

    const fgPickr = createPickr(fgSwatch, (hex) => {
      fgColor = hex;
      updateSwatch(fgSwatch, hex);
      updateHex(fgHex, hex);
      updateContrast();
    }, (hex) => {
      fgColor = hex;
      updateSwatch(fgSwatch, hex);
      updateHex(fgHex, hex);
      updateContrast();
    });

    // 「⇦」ボタン: setColor（no save）
    document.getElementById("applyBgHex").onclick = () => {
      const val = bgHex.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        bgPickr.setColor(val, true); // silent update
      }
    };

    document.getElementById("applyFgHex").onclick = () => {
      const val = fgHex.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        fgPickr.setColor(val, true); // silent update
      }
    };

    // 色変更ボタン（ランダム）
    document.getElementById("randomColorBtn").onclick = () => {
      const randomHex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
      if (!document.getElementById('color-toggle-bg-lock').checked) {
        const newBg = randomHex();
        bgPickr.setColor(newBg);
      }
      if (!document.getElementById('color-toggle-fg-lock').checked) {
        const newFg = randomHex();
        fgPickr.setColor(newFg);
      }
    };

    document.getElementById("pickrClose").onclick = () => {
      document.getElementById("pickrContainer").remove();
    };

    // 初期表示
    bgPickr.setColor(bgColor);
    fgPickr.setColor(fgColor);
  });
})();
