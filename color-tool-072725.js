(function () {
  if (document.getElementById("color-toggle-container")) return;

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

  function applyColors(bgHSL, fgHSL) {
    const bg = `hsl(${bgHSL.h},${bgHSL.s}%,${bgHSL.l}%)`;
    const fg = `hsl(${fgHSL.h},${fgHSL.s}%,${fgHSL.l}%)`;
    const bgHex = hslToHex(bgHSL.h, bgHSL.s, bgHSL.l);
    const fgHex = hslToHex(fgHSL.h, fgHSL.s, fgHSL.l);

    let styleTag = document.getElementById("color-toggle-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "color-toggle-style";
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      html, body { background-color: ${bg} !important; color: ${fg} !important; }
      * { background-color: transparent !important; color: ${fg} !important; }
    `;

    const hexText = document.getElementById("color-toggle-hex-text");
    if (hexText) hexText.textContent = `BG: ${bgHex} / FG: ${fgHex}`;
  }

  function changeColors() {
    if (!window.__bgHSL) window.__bgHSL = getRandomHSL();
    if (!window.__fgHSL) window.__fgHSL = getRandomHSL();

    if (!document.getElementById("color-toggle-bg-lock").checked) {
      window.__bgHSL = getRandomHSL();
    }
    if (!document.getElementById("color-toggle-fg-lock").checked) {
      window.__fgHSL = getRandomHSL();
    }
    applyColors(window.__bgHSL, window.__fgHSL);
  }

  const container = document.createElement("div");
  container.id = "color-toggle-container";
  container.style.cssText = `
    position: fixed;
    top: 10px; left: 10px;
    background: #C4EFF5;
    color: #fff;
    font-family: sans-serif;
    font-size: 14px;
    z-index: 99999;
    padding: 8px;
    border-radius: 8px;
    user-select: none;
    cursor: default;
  `;

  const row1 = document.createElement("div");
  row1.style.display = "flex";
  row1.style.alignItems = "center";
  row1.style.gap = "0.5em";

  const button = document.createElement("button");
  button.textContent = "🎨色変更";
  button.onclick = changeColors;
  button.style.cursor = "pointer";

  const bgLock = document.createElement("label");
  const bgCheckbox = document.createElement("input");
  bgCheckbox.type = "checkbox";
  bgCheckbox.id = "color-toggle-bg-lock";
  bgLock.append(bgCheckbox, "BG固定");

  const fgLock = document.createElement("label");
  const fgCheckbox = document.createElement("input");
  fgCheckbox.type = "checkbox";
  fgCheckbox.id = "color-toggle-fg-lock";
  fgLock.append(fgCheckbox, "FG固定");

  const dragHandle = document.createElement("div");
  dragHandle.textContent = "🟰";
  dragHandle.style.cssText = `
    cursor: grab;
    margin-left: auto;
    padding: 0 4px;
  `;

  row1.append(button, bgLock, fgLock, dragHandle);

  const row2 = document.createElement("div");
  row2.style.marginTop = "4px";

  const hexText = document.createElement("div");
  hexText.id = "color-toggle-hex-text";
  hexText.style.fontFamily = "monospace";
  hexText.style.userSelect = "text";
  hexText.textContent = "BG: --- / FG: ---";

  row2.appendChild(hexText);

  container.append(row1, row2);
  document.body.appendChild(container);

  // === DRAG HANDLING (same as before) ===
  let isDragging = false;
  let dragStartX, dragStartY, startLeft, startTop, dragTimer;
  const threshold = 5;

  dragHandle.addEventListener("mousedown", e => {
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragTimer = setTimeout(() => startDrag(e), 10);
    window.addEventListener("mousemove", detectMove);
    window.addEventListener("mouseup", cancelPreDrag);
    e.preventDefault();
  });

  function detectMove(e) {
    if (Math.abs(e.clientX - dragStartX) > threshold || Math.abs(e.clientY - dragStartY) > threshold) {
      clearTimeout(dragTimer);
      cancelPreDrag();
    }
  }

  function cancelPreDrag() {
    window.removeEventListener("mousemove", detectMove);
    window.removeEventListener("mouseup", cancelPreDrag);
  }

  function startDrag(e) {
    isDragging = true;
    startLeft = container.offsetLeft;
    startTop = container.offsetTop;
    dragHandle.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", endDrag);
  }

  function onDrag(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    container.style.left = `${startLeft + dx}px`;
    container.style.top = `${startTop + dy}px`;
  }

  function endDrag() {
    isDragging = false;
    dragHandle.style.cursor = "grab";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", endDrag);
  }

  // === TOUCH SUPPORT ===
  dragHandle.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
    dragTimer = setTimeout(() => startDragTouch(e), 10);
    window.addEventListener("touchmove", detectMoveTouch);
    window.addEventListener("touchend", cancelPreDragTouch);
    e.preventDefault();
  });

  function detectMoveTouch(e) {
    const touch = e.touches[0];
    if (Math.abs(touch.clientX - dragStartX) > threshold || Math.abs(touch.clientY - dragStartY) > threshold) {
      clearTimeout(dragTimer);
      cancelPreDragTouch();
    }
  }

  function cancelPreDragTouch() {
    window.removeEventListener("touchmove", detectMoveTouch);
    window.removeEventListener("touchend", cancelPreDragTouch);
  }

  function startDragTouch(e) {
    isDragging = true;
    startLeft = container.offsetLeft;
    startTop = container.offsetTop;
    dragHandle.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    window.addEventListener("touchmove", onDragTouch, { passive: false });
    window.addEventListener("touchend", endDragTouch);
  }

  function onDragTouch(e) {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    container.style.left = `${startLeft + dx}px`;
    container.style.top = `${startTop + dy}px`;
    e.preventDefault();
  }

  function endDragTouch() {
    isDragging = false;
    dragHandle.style.cursor = "grab";
    document.body.style.userSelect = "";
    window.removeEventListener("touchmove", onDragTouch);
    window.removeEventListener("touchend", endDragTouch);
  }

})();
