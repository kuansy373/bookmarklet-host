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
        <button id="bgInject">⇦</button>
      </div>
      <div class="row">
        <div class="label">FG:</div>
        <div id="fgSwatch" class="color-swatch">
          <div class="color-saved"></div>
          <div class="color-current"></div>
        </div>
        <input id="fgHex" class="hex-display" value="-">
        <button id="fgInject">⇦</button>
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
      const bgHexEl = document.getElementById("bgHex");
      const fgHexEl = document.getElementById("fgHex");
      if (bgHexEl) bgHexEl.value = currentBg;
      if (fgHexEl) fgHexEl.value = currentFg;
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

    let bgPickr, fgPickr;

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
        updateContrast();
      });

      pickr.on('save', (color) => {
        const hex = color.toHEXA().toString();
        setCurrent(hex);
        setSaved(hex);
        applyStyle(prop, hex);
        updateSwatch(swatch, hex, hex);
        updateContrast();
      });

      pickr.on('hide', () => {
        setCurrent(getSaved());
        applyStyle(prop, getSaved());
        updateSwatch(swatch, getSaved(), getSaved());
        updateContrast();
      });

      updateSwatch(swatch, getCurrent(), getSaved());
      applyStyle(prop, getCurrent());
      updateContrast();

      return pickr;
    };

    bgPickr = initPickr('bg', 'background-color');
    fgPickr = initPickr('fg', 'color');
    updateColorHexDisplays();

    document.getElementById("bgInject").addEventListener("click", () => {
      const hex = document.getElementById("bgHex").value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        bgPickr.setColor(hex);
      }
    });

    document.getElementById("fgInject").addEventListener("click", () => {
      const hex = document.getElementById("fgHex").value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        fgPickr.setColor(hex);
      }
    });

    // 以降の randomColorBtn 等の処理は省略（元と同じ）
    // 必要に応じてここに追記可能
  });
})();
