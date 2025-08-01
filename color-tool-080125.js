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
      .inject-btn {
        cursor: pointer;
        font-weight: bold;
        background: #eee;
        border: 1px solid #aaa;
        border-radius: 4px;
        padding: 0 6px;
        user-select: none;
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
        <div id="bgInject" class="inject-btn">⇦</div>
      </div>
      <div class="row">
        <div class="label">FG:</div>
        <div id="fgSwatch" class="color-swatch">
          <div class="color-saved"></div>
          <div class="color-current"></div>
        </div>
        <input id="fgHex" class="hex-display" value="-">
        <div id="fgInject" class="inject-btn">⇦</div>
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

    // 残りのロジックは元のコードのままです。
    // ⇦ボタンは、bgInject と fgInject にイベントリスナーを追加して、
    // 対応する Pickr インスタンスの setColor を使って更新します。

    // ...ここに元のコードのロジックを続けて組み込みます
  });
})();
