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
    opacity: '0.06',
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
      Asia: '#fa9eaa',        // ピンク色
      Europe: '#3ebbb6',      // 色
      Africa: '#81ca98',      // 色
      'Middle East': '#a5a66a',
      'North America': '#b3ce62', // 色
      'South America': '#a3d3d8', // 色
      Oceania: '#dc7550',     // 色
      Antarctica: '#a5dce9',  // 色
      Default: '#cccccc',     // その他
    };

    // 国名から地域を判定
    function getRegion(name) {
      name = name.trim().toLowerCase();
    
      const regions = {
        Asia: [
          'japan', 'china', 'taiwan', 'hong kong', 'macau', 'mongolia', 'north korea', 'south korea',
          'vietnam', 'thailand', 'myanmar', 'laos', 'cambodia', 'malaysia', 'singapore',
          'indonesia', 'philippines', 'brunei', 'east timor', 'india', 'pakistan', 'bangladesh',
          'nepal', 'bhutan', 'sri lanka', 'maldives'
        ],
        'Middle East': [
          'iran', 'iraq', 'israel', 'palestine', 'jordan', 'lebanon', 'syria', 'saudi arabia',
          'yemen', 'oman', 'united arab emirates', 'qatar', 'bahrain', 'kuwait',
          'turkey', 'cyprus', 'azerbaijan', 'armenia', 'georgia'
        ],
        Europe: [
          'united kingdom', 'england', 'scotland', 'wales', 'northern ireland', 'ireland',
          'france', 'germany', 'italy', 'spain', 'portugal', 'belgium', 'netherlands',
          'luxembourg', 'switzerland', 'austria', 'poland', 'czech republic', 'slovakia',
          'hungary', 'slovenia', 'croatia', 'bosnia and herzegovina', 'serbia', 'montenegro',
          'albania', 'north macedonia', 'greece', 'bulgaria', 'romania', 'moldova', 'ukraine',
          'belarus', 'russia', 'finland', 'sweden', 'norway', 'denmark', 'iceland', 'estonia',
          'latvia', 'lithuania', 'malta', 'andorra', 'monaco', 'liechtenstein', 'san marino',
          'vatican city'
        ],
        Africa: [
          'egypt', 'morocco', 'algeria', 'tunisia', 'libya', 'sudan', 'south sudan', 'ethiopia',
          'eritrea', 'djibouti', 'somalia', 'kenya', 'uganda', 'tanzania', 'rwanda', 'burundi',
          'democratic republic of the congo', 'republic of the congo', 'angola', 'zambia', 'malawi',
          'mozambique', 'zimbabwe', 'botswana', 'namibia', 'south africa', 'lesotho', 'eswatini',
          'ghana', 'nigeria', 'cameroon', 'ivory coast', 'senegal', 'mali', 'burkina faso',
          'niger', 'chad', 'central african republic', 'togo', 'benin', 'sierra leone',
          'liberia', 'guinea', 'guinea-bissau', 'the gambia', 'mauritania', 'cape verde',
          'seychelles', 'comoros', 'mauritius', 'madagascar'
        ],
        'North America': [
          'canada', 'united states', 'usa', 'mexico', 'greenland', 'bermuda', 'bahamas',
          'cuba', 'jamaica', 'haiti', 'dominican republic', 'puerto rico', 'trinidad and tobago',
          'barbados', 'saint lucia', 'grenada', 'saint vincent and the grenadines', 'antigua and barbuda',
          'dominica', 'saint kitts and nevis'
        ],
        'South America': [
          'brazil', 'argentina', 'chile', 'uruguay', 'paraguay', 'bolivia', 'peru',
          'ecuador', 'colombia', 'venezuela', 'guyana', 'suriname', 'french guiana'
        ],
        Oceania: [
          'australia', 'new zealand', 'papua new guinea', 'fiji', 'solomon islands', 'vanuatu',
          'samoa', 'tonga', 'tuvalu', 'kiribati', 'micronesia', 'palau', 'marshall islands',
          'nauru'
        ],
        Antarctica: ['antarctica']
      };
    
      for (const [region, countries] of Object.entries(regions)) {
        if (countries.some(c => name.includes(c))) return region;
      }
    
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
