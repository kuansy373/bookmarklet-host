javascript:(function () {
  if (document.getElementById('bm-worldmap-overlay')) return;

  // Leaflet の CSS 読み込み
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(css);

  // オーバーレイ作成
  var overlay = document.createElement('div');
  overlay.id = 'bm-worldmap-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2147483646,
    background: 'rgba(0,0,0,0.6)',
  });
  document.body.appendChild(overlay);

  // コンテナ
  var container = document.createElement('div');
  Object.assign(container.style, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '95%',
    height: '90%',
    maxWidth: '1400px',
    maxHeight: '900px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    background: '#fff',
  });
  overlay.appendChild(container);

  // 閉じるボタン
  var closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.title = '閉じる';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    right: '8px',
    top: '8px',
    zIndex: 9999,
    fontSize: '22px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  });
  container.appendChild(closeBtn);

  closeBtn.addEventListener('click', function () {
    document.head.removeChild(css);
    document.body.removeChild(overlay);
    var s = document.getElementById('bm-leaflet-script');
    if (s) s.parentNode.removeChild(s);
  });

  // マップ領域
  var mapDiv = document.createElement('div');
  mapDiv.id = 'bm-worldmap';
  Object.assign(mapDiv.style, { width: '100%', height: '100%' });
  container.appendChild(mapDiv);

  // Leaflet スクリプト
  var script = document.createElement('script');
  script.id = 'bm-leaflet-script';
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  script.onload = function () {
    var map = L.map(mapDiv, {
      zoomControl: true,
      attributionControl: false,
    });
    map.setView([20, 0], 2);
    map.getContainer().style.background = '#ffffff';

    var geoUrl = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

    // 🌍 地域別カラー設定
    var regionColors = {
      Asia: '#f7a8b8',        // ピンク
      Europe: '#7ec8c9',      // 浅葱色
      Africa: '#ffd966',      // 黄色
      'North America': '#a4c2f4', // 水色
      'South America': '#b6d7a8', // 黄緑
      Oceania: '#d5a6bd',     // 薄紫
      Antarctica: '#eeeeee',  // グレー
      Default: '#cccccc',     // その他
    };

    // 国名から地域を判定する簡易関数（ざっくり版）
    function getRegion(name) {
      name = name.toLowerCase();
      if (
        /japan|china|india|korea|vietnam|thailand|indonesia|malaysia|philippines|pakistan|iran|turkey|saudi|mongolia|nepal|bangladesh|sri lanka/.test(
          name
        )
      ) return 'Asia';
      if (/france|germany|italy|spain|uk|sweden|russia|norway|poland|greece|portugal|finland|ireland|netherlands|belgium|switzerland/.test(name))
        return 'Europe';
      if (/egypt|nigeria|kenya|south africa|morocco|ethiopia|ghana|tanzania|algeria|uganda/.test(name))
        return 'Africa';
      if (/canada|united states|mexico|usa/.test(name))
        return 'North America';
      if (/brazil|argentina|chile|peru|colombia|venezuela|paraguay|uruguay|ecuador/.test(name))
        return 'South America';
      if (/australia|new zealand|fiji|papua|samoa/.test(name))
        return 'Oceania';
      if (/antarctica/.test(name))
        return 'Antarctica';
      return 'Default';
    }

    // GeoJSON 読み込み
    fetch(geoUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('GeoJSON load failed');
        return res.json();
      })
      .then(function (geojson) {
        function style() {
          return {
            color: '#888',
            weight: 1,
            fillColor: '#f5f5f5',
            fillOpacity: 1,
          };
        }

        // 各国イベント設定
        function onEachFeature(feature, layer) {
          var filled = false; // 一度だけ塗る用

          layer.on('click touchstart', function (e) {
            var props = feature.properties || {};
            var name =
              props.name ||
              props.NAME ||
              props.ADMIN ||
              props.ADMIN_EN ||
              'Unknown';

            // 地域を判定
            var region = getRegion(name);
            var fillColor = regionColors[region] || regionColors.Default;

            // 🌈 初回クリック時に色を固定
            if (!filled) {
              layer.setStyle({
                fillColor: fillColor,
                fillOpacity: 0.9,
                color: '#333',
                weight: 1.5,
              });
              filled = true;
            }

            // 国名ポップアップ表示
            L.popup()
              .setLatLng(e.latlng)
              .setContent(
                '<div style="font-weight:600;">' +
                  name +
                  '</div><div style="font-size:12px;color:#555;">' +
                  region +
                  '</div>'
              )
              .openOn(map);
          });
        }

        // GeoJSON をマップに追加
        L.geoJSON(geojson, {
          style: style,
          onEachFeature: onEachFeature,
        }).addTo(map);
      })
      .catch(function (err) {
        console.error(err);
        alert('国境データの読み込みに失敗しました: ' + err.message);
      });
  };

  document.body.appendChild(script);
})();
