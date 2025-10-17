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
    width: '100%',
    height: '100%',
    overflow: 'hidden',
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
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false,
      zoomSnap: 0,
      zoomAnimation: false,
      inertia: false
    });
    map.setView([20, 0], 2);
    map.getContainer().style.background = '#ffffff';

    var geoUrl = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

    // 地域別カラー設定
    var regionColors = {
      Europe: '#3ebbb6',
      Africa: '#81ca98',
      'Middle East': '#a5a66a',
      Asia: '#fa9eaa',
      Oceania: '#dc7550',
      'North America': '#b3ce62',
      'South America': '#a3d3d8',
      Antarctica: '#a5dce9',
      Default: '#000000',
    };

    // 国名から地域を判定
    function getRegion(name) {
      name = name.trim().toLowerCase();
    
      const regions = {
        Europe: [
          'united kingdom', 'england', 'scotland', 'wales', 'northern ireland', 'ireland',
          'france', 'germany', 'italy', 'spain', 'portugal', 'belgium', 'netherlands',
          'luxembourg', 'switzerland', 'austria', 'poland', 'czech republic', 'slovakia',
          'hungary', 'slovenia', 'croatia', 'bosnia and herzegovina', 'serbia', 'kosovo', 'macedonia',
          'albania', 'north macedonia', 'greece', 'bulgaria', 'romania', 'moldova', 'ukraine',
          'montenegro', 'belarus', 'russia', 'finland', 'sweden', 'norway', 'denmark', 'iceland', 'estonia',
          'latvia', 'lithuania', 'malta', 'andorra', 'monaco', 'liechtenstein', 'san marino',
          'vatican city'
        ],
        Africa: [
          'egypt', 'morocco', 'western sahara', 'algeria', 'tunisia', 'libya', 'sudan', 'south sudan', 'ethiopia',
          'eritrea', 'djibouti', 'somalia', 'kenya', 'uganda', 'tanzania', 'rwanda', 'burundi',
          'democratic republic of the congo', 'republic of the congo', 'gabon', 'angola', 'zambia', 'malawi',
          'mozambique', 'zimbabwe', 'botswana', 'namibia', 'south africa', 'lesotho', 'swaziland', 'eswatini',
          'ghana', 'nigeria', 'cameroon', 'ivory coast', 'senegal', 'gambia', 'mali', 'burkina faso',
          'niger', 'chad', 'central african republic', 'togo', 'benin', 'sierra leone',
          'liberia', 'guinea', 'guinea-bissau', 'the gambia', 'mauritania', 'cape verde',
          'seychelles', 'comoros', 'mauritius', 'madagascar'
        ],
        'Middle East': [
          'kazakhstan', 'uzbekistan', 'tajikistan', 'kyrgyzstan', 'turkmenistan', 'afghanistan',
          'iran', 'iraq', 'israel', 'West Bank', 'palestine', 'jordan', 'lebanon', 'syria',
          'saudi arabia','yemen', 'oman', 'united arab emirates', 'qatar', 'bahrain', 'kuwait',
          'turkey', 'cyprus', 'azerbaijan', 'armenia', 'georgia'
        ],
        Asia: [
          'japan', 'china', 'taiwan', 'hong kong', 'macau', 'mongolia', 'north korea', 'south korea',
          'vietnam', 'thailand', 'myanmar', 'laos', 'cambodia', 'malaysia', 'singapore',
          'indonesia', 'philippines', 'brunei', 'east timor', 'india', 'pakistan', 'bangladesh',
          'nepal', 'bhutan', 'sri lanka', 'maldives'
        ],
        Oceania: [
          'australia', 'new zealand', 'papua new guinea', 'fiji', 'solomon islands', 'vanuatu',
          'samoa', 'tonga', 'tuvalu', 'kiribati', 'micronesia', 'palau', 'marshall islands',
          'nauru', 'new caledonia'
        ],
        'North America': [
          'canada', 'united states', 'usa', 'mexico', 'guatemala', 'belize', 'honduras', 'el salvador',
          'nicaragua', 'costa rica', 'panama', '', 'greenland', 'bermuda', 'bahamas',
          'cuba', 'jamaica', 'haiti', 'dominican republic', 'puerto rico', 'trinidad and tobago',
          'barbados', 'saint lucia', 'grenada', 'saint vincent and the grenadines', 'antigua and barbuda',
          'dominica', 'saint kitts and nevis'
        ],
        'South America': [
          'brazil', 'argentina', 'chile', 'uruguay', 'paraguay', 'bolivia', 'peru',
          'ecuador', 'colombia', 'venezuela', 'guyana', 'suriname', 'french guiana',
          'falkland islands'
        ],
        Antarctica: ['antarctica', 'french southern and antarctic lands']
      };
    
      const all = Object.entries(regions)
        .map(([region, list]) => list.map(c => ({ name: c, region })))
        .flat()
        .sort((a, b) => b.name.length - a.name.length);
    
      for (const { name: cname, region } of all) {
        if (name.includes(cname)) return region;
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
          layer._filled = false; // 初期状態は塗られていない
        
          layer.on('click touchstart', function (e) {
            var props = feature.properties || {};
            var name = props.name || props.NAME || props.ADMIN || props.ADMIN_EN || 'Unknown';
        
            var region = getRegion(name);
            var fillColor = regionColors[region] || regionColors.Default;
        
            if (!layer._filled) {
              // 1回目タップ：色を付けるだけ
              layer.setStyle({
                fillColor: fillColor,
                fillOpacity: 0.9,
                color: '#333',
                weight: 1.5,
              });
              layer._filled = true;
            } else {
              // 2回目タップ：国名ポップアップ表示
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
            }
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

    
    // --- 地域ボタンコントロール ---
    var RegionControl = L.Control.extend({
      options: { position: 'topleft' },
    
      onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.width = 'auto';
        container.style.height = 'auto';

        // ボタン
        var button = L.DomUtil.create('a', '', container);
        button.innerHTML = '地域';
        button.href = '#';
        button.style.padding = '4px 8px';
        button.style.background = '#fff';
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        button.style.fontSize = '14px';

        // マップへのクリック伝播を防ぐ
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.disableScrollPropagation(button);
        
        // アコーディオンコンテナ
        var accordion = L.DomUtil.create('div', '', container);
        Object.assign(accordion.style, {
          display: 'none',
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: '2px',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          padding: '4px',
          width: 'auto',
          whiteSpace: 'nowrap'
        });
        
        // マップへのクリック伝播を防ぐ
        L.DomEvent.disableClickPropagation(accordion);
        L.DomEvent.disableScrollPropagation(accordion);
    
        // 各地域の項目を追加
        Object.entries(regionColors).forEach(([region, color]) => {
    
          var item = document.createElement('div');
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.marginBottom = '4px';
          item.style.cursor = 'pointer';
    
          var colorBox = document.createElement('span');
          colorBox.style.display = 'inline-block';
          colorBox.style.width = '16px';
          colorBox.style.height = '16px';
          colorBox.style.background = color;
          colorBox.style.marginRight = '6px';
          colorBox.style.border = '1px solid #333';
    
          var label = document.createElement('span');
          label.textContent = region;
    
          item.appendChild(colorBox);
          item.appendChild(label);
          accordion.appendChild(item);
    
          // アイコンクリックで地域すべてを塗る
          colorBox.addEventListener('click', function(e){
            e.stopPropagation(); // 親クリックイベント防止
    
            map.eachLayer(function(layer){
              if(layer.feature && layer.feature.properties){
                var name = layer.feature.properties.name ||
                           layer.feature.properties.ADMIN ||
                           layer.feature.properties.ADMIN_EN ||
                           'Unknown';
                if(getRegion(name) === region){
                  layer.setStyle({
                    fillColor: color,
                    fillOpacity: 0.9,
                    color: '#333',
                    weight: 1.5
                  });
                }
              }
            });
          });
        });
    
        // ボタン押下でアコーディオン開閉
        button.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
        });
        
        // アコーディオン内部のクリックも伝播させない
        accordion.addEventListener('click', function(e){
          e.stopPropagation();
        });
    
        // Leaflet のマップ上のクリックで閉じる
        L.DomEvent.addListener(map.getContainer(), 'click', function(){
          accordion.style.display = 'none';
        });
    
        return container;
      }
    });
    
    // マップに追加
    map.addControl(new RegionControl());

  };

  document.body.appendChild(script);
})();
