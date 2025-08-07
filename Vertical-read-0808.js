(() => {
  let text = '';
  document.querySelectorAll('body > h1, body > h2, body > h3, .metadata, .main_text, .p-novel__title, .p-novel__text, .widget-episodeTitle, .widget-episodeBody p, .novel-title, .novel-body p, .chapter-title, .episode-title, #novelBody').forEach(node => {
    text += node.innerHTML.replace(/<(\/?ruby|\/?rb|\/?rp|\/?rt)>/g, '___$1___').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/___([^_]+)___/g, '<$1>') + '　'
  });
  text = text.trim().replace(/(\r\n|\r)+/g, '\n').replace(/\n{2,}/g, '\n').replace(/\n/g, '　').replace(/　{2,}/g, '　');
  document.querySelectorAll('body > *').forEach(node => {
    node.style.display = 'none'
  });
  let vp = document.querySelector('meta[name="viewport"]');
  if (!vp) {
    vp = document.createElement('meta');
    vp.name = 'viewport';
    document.head.appendChild(vp)
  }
  vp.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  const hideStyle = document.createElement('style');
  hideStyle.textContent = `#pageTop, .c-navigater, .js-navigater-totop, .global-header, .global-footer { display: none !important; }`;
  document.head.appendChild(hideStyle);
  const container = document.createElement('div');
  container.id = 'novelDisplay';
  container.innerHTML = text;
  container.style.cssText = `     writing-mode: vertical-rl;     white-space: nowrap;     letter-spacing: 0.25em;     line-height: 1.8;     font-size: 23px;     display: block;     padding: 2em;     contain: none;     content-visibility: visible;     will-change: transform;     transform: translateZ(0);`;
  document.body.appendChild(container);
  document.body.style.cssText = `     background-color: #e8d3c7;     color: #2c4f45;     display: flex;     justify-content: center;     font-family: '游明朝', 'Yu Mincho', YuMincho, 'Hiragino Mincho Pro', serif;     font-feature-settings: 'pkna';     -moz-osx-font-smoothing: grayscale;     -webkit-font-smoothing: antialiased;     margin: 0;     padding: 0;     overflow-x: hidden;`;
  const scrollSlider = document.createElement('input');
  scrollSlider.type = 'range';
  scrollSlider.min = 0;
  scrollSlider.max = 15;
  scrollSlider.value = 0;
  scrollSlider.style.position = 'fixed';
  scrollSlider.style.bottom = '-98vh';
  scrollSlider.style.right = '30px';
  scrollSlider.style.zIndex = '9999';
  scrollSlider.style.width = '80px';
  scrollSlider.style.opacity = '0.05';
  scrollSlider.style.height = '200vh';
  document.body.appendChild(scrollSlider);
  const scroller = document.scrollingElement || document.documentElement;
  let scrollSpeed = 0;
  let lastTimestamp = null;

  function forceScroll(timestamp) {
    if (lastTimestamp !== null) {
      const elapsed = timestamp - lastTimestamp;
      scroller.scrollTop += (scrollSpeed * elapsed) / 1000
    }
    lastTimestamp = timestamp;
    requestAnimationFrame(forceScroll)
  }
  scrollSlider.addEventListener('input', () => {
    scrollSpeed = parseFloat(scrollSlider.value) * 15
  });
  requestAnimationFrame(forceScroll);
  ['fontSizeSlider', 'fontSizeLabel', 'fontSizeClose', 'fontSizeDecrease', 'fontSizeIncrease', 'fontSizeOpen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  const target = container;
  const currentSize = parseInt(getComputedStyle(target).fontSize) || 23;
  const fontSlider = document.createElement('input');
  fontSlider.type = 'range';
  fontSlider.id = 'fontSizeSlider';
  fontSlider.min = 12;
  fontSlider.max = 48;
  fontSlider.value = currentSize;
  Object.assign(fontSlider.style, {
    position: 'fixed',
    top: '40px',
    right: '50px',
    zIndex: '9999',
    width: '100px',
    display: 'none'
  });
  const label = document.createElement('div');
  label.id = 'fontSizeLabel';
  label.textContent = `文字サイズ: ${fontSlider.value}px`;
  Object.assign(label.style, {
    position: 'fixed',
    top: '10px',
    right: '47px',
    background: '#fff',
    padding: '2px 6px',
    fontSize: '14px',
    zIndex: '10000',
    border: '1px solid #ccc',
    borderRadius: '4px',
    display: 'none'
  });
  const closeBtn = document.createElement('div');
  closeBtn.id = 'fontSizeClose';
  closeBtn.textContent = '×';
  Object.assign(closeBtn.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '0 8px',
    fontSize: '14px',
    cursor: 'pointer',
    zIndex: '10001',
    borderRadius: '4px',
    display: 'none'
  });
  const decreaseBtn = document.createElement('button');
  decreaseBtn.id = 'fontSizeDecrease';
  decreaseBtn.textContent = '◀';
  Object.assign(decreaseBtn.style, {
    position: 'fixed',
    top: '40px',
    right: '170px',
    zIndex: '9999',
    fontSize: '16px',
    padding: '0 6px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: '#eee',
    cursor: 'pointer',
    display: 'none'
  });
  const increaseBtn = document.createElement('button');
  increaseBtn.id = 'fontSizeIncrease';
  increaseBtn.textContent = '▶';
  Object.assign(increaseBtn.style, {
    position: 'fixed',
    top: '40px',
    right: '10px',
    zIndex: '9999',
    fontSize: '16px',
    padding: '0 6px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: '#eee',
    cursor: 'pointer',
    display: 'none'
  });
  const openBtn = document.createElement('div');
  openBtn.id = 'fontSizeOpen';
  openBtn.textContent = '○';
  Object.assign(openBtn.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '0 8px',
    fontSize: '14px',
    opacity: '0.3',
    cursor: 'pointer',
    zIndex: '10001',
    borderRadius: '4px',
    display: 'block'
  });
  closeBtn.addEventListener('click', () => {
    fontSlider.style.display = 'none';
    label.style.display = 'none';
    closeBtn.style.display = 'none';
    decreaseBtn.style.display = 'none';
    increaseBtn.style.display = 'none';
    openBtn.style.display = 'block'
  });
  openBtn.addEventListener('click', () => {
    fontSlider.style.display = 'block';
    label.style.display = 'block';
    closeBtn.style.display = 'block';
    decreaseBtn.style.display = 'block';
    increaseBtn.style.display = 'block';
    openBtn.style.display = 'none'
  });
  decreaseBtn.addEventListener('click', () => {
    let size = parseInt(fontSlider.value) - 1;
    if (size >= parseInt(fontSlider.min)) {
      fontSlider.value = size;
      target.style.fontSize = `${size}px`;
      label.textContent = `文字サイズ: ${size}px`
    }
  });
  increaseBtn.addEventListener('click', () => {
    let size = parseInt(fontSlider.value) + 1;
    if (size <= parseInt(fontSlider.max)) {
      fontSlider.value = size;
      target.style.fontSize = `${size}px`;
      label.textContent = `文字サイズ: ${size}px`
    }
  });
  fontSlider.addEventListener('input', () => {
    target.style.fontSize = `${fontSlider.value}px`;
    label.textContent = `文字サイズ: ${fontSlider.value}px`
  });
  document.body.appendChild(fontSlider);
  document.body.appendChild(label);
  document.body.appendChild(closeBtn);
  document.body.appendChild(decreaseBtn);
  document.body.appendChild(increaseBtn);
  document.body.appendChild(openBtn)
})()
