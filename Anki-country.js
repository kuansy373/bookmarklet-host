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

    // データソースをまとめて定義
    var geoUrls = {
      world: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson', // 世界の国境
      usaStates: 'https://raw.githubusercontent.com/datasets/geo-admin1-us/master/data/admin1-us.geojson' // アメリカ州
    };

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

    
      var countryRegions = {
        Europe: [
          'united kingdom', 'england', 'scotland', 'wales', 'northern ireland', 'ireland',
          'france', 'germany', 'italy', 'spain', 'portugal', 'belgium', 'netherlands',
          'luxembourg', 'switzerland', 'austria', 'poland', 'czech republic', 'czechia', 'slovakia',
          'hungary', 'slovenia', 'croatia', 'bosnia and herzegovina', 'republic of serbia', 'kosovo', 'macedonia',
          'albania', 'north macedonia', 'greece', 'bulgaria', 'romania', 'moldova', 'ukraine',
          'montenegro', 'belarus', 'russia', 'finland', 'sweden', 'norway', 'denmark', 'iceland', 'estonia',
          'latvia', 'lithuania', 'malta', 'andorra', 'monaco', 'liechtenstein', 'san marino',
          'vatican city'
        ],
        Africa: [
          'egypt', 'morocco', 'western sahara', 'algeria', 'tunisia', 'libya', 'sudan', 'south sudan', 'ethiopia',
          'eritrea', 'djibouti', 'somalia', 'somaliland', 'kenya', 'uganda', 'united republic of tanzania', 'rwanda', 'burundi',
          'democratic republic of the congo', 'republic of the congo', 'gabon', 'angola', 'zambia', 'malawi',
          'mozambique', 'zimbabwe', 'botswana', 'namibia', 'south africa', 'lesotho', 'swaziland', 'eswatini',
          'ghana', 'nigeria', 'cameroon', 'ivory coast', 'senegal', 'gambia', 'mali', 'burkina faso',
          'niger', 'chad', 'central african republic', 'togo', 'benin', 'sierra leone',
          'liberia', 'guinea', 'guinea-bissau', 'equatorial guinea', 'the gambia', 'mauritania', 'cape verde',
          'seychelles', 'comoros', 'mauritius', 'madagascar', 'bir tawil',
        ],
        'Middle East': [
          'kazakhstan', 'uzbekistan', 'tajikistan', 'kyrgyzstan', 'turkmenistan', 'afghanistan',
          'iran', 'iraq', 'israel', 'West Bank', 'palestine', 'jordan', 'lebanon', 'syria',
          'saudi arabia','yemen', 'oman', 'united arab emirates', 'qatar', 'bahrain', 'kuwait',
          'turkey', 'cyprus', 'northern cyprus', 'azerbaijan', 'armenia', 'georgia'
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
          'canada', 'united states of america', 'mexico', 'guatemala', 'belize', 'honduras', 'el salvador',
          'nicaragua', 'costa rica', 'panama', 'greenland', 'bermuda', 'bahamas',
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

      // アメリカ州リスト（国ではなく州単位）
      var usStates = [
        'alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware',
        'florida','georgia','hawaii','idaho','illinois','indiana','iowa','kansas','kentucky','louisiana',
        'maine','maryland','massachusetts','michigan','minnesota','mississippi','missouri','montana',
        'nebraska','nevada','new hampshire','new jersey','new mexico','new york','north carolina',
        'north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island','south carolina',
        'south dakota','tennessee','texas','utah','vermont','virginia','washington','west virginia',
        'wisconsin','wyoming'
      ];
    
      // 名前を小文字化して空白をトリム
      function normalize(name) {
        return name.trim().toLowerCase();
      }
      
      // 地域判定関数
      function getRegion(name) {
        const n = normalize(name);
      
        // 1. 国名で判定
        for (const [region, list] of Object.entries(countryRegions)) {
          if (list.some(c => normalize(c) === n)) return region;
        }
      
        // 2. アメリカ州名で判定（州のみ）
        if (usStates.includes(n)) return 'North America';
      
        // 3. それ以外はデフォルト
        return 'Default';
      }


    
    // レイヤーを格納するオブジェクト
    var layers = {};
    
    // 各国イベント設定関数
    function onEachFeature(feature, layer) {
      layer._filled = false; // 初期状態は塗られていない
    
      layer.on('click touchstart', function (e) {
        var props = feature.properties || {};
        var name = props.name || props.NAME || props.ADMIN || props.ADMIN_EN || 'Unknown';
    
        var region = getRegion(name);
        var fillColor = regionColors[region] || regionColors.Default;
    
        if (!layer._filled) {
          layer.setStyle({
            fillColor: fillColor,
            fillOpacity: 0.9,
            color: '#333',
            weight: 1.5,
          });
          layer._filled = true;
        } else {
          var popupContent = `
            <div style="font-size:12px;">
              <div style="font-weight:600;">${name}</div>
              <div style="display:flex; align-items:center; margin-top:2px; color:#555;">
                <span>${region}</span>
                <button id="resetColorBtn" style="padding:0px 3px; margin-left:5px; font-size:12px;">↵</button>
              </div>
            </div>
          `;
          var popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent)
            .openOn(map);
    
          setTimeout(() => {
            const btn = document.getElementById('resetColorBtn');
            if (btn) {
              btn.addEventListener('click', () => {
                layer.setStyle({
                  fillColor: '#f5f5f5',
                  fillOpacity: 1,
                  color: '#888',
                  weight: 1,
                });
                layer._filled = false;
                map.closePopup();
              });
            }
          }, 0);
        }
      });
    }
    
    // GeoJSON読み込み時に onEachFeature を渡す
    function loadLayer(key, url, style) {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          layers[key] = L.geoJSON(data, {
            style: style,
            onEachFeature: onEachFeature
          });
    
          // 初期状態：worldだけを地図に追加
          if (key === 'world') {
            layers[key].addTo(map);
            document.getElementById('layer_' + key).checked = true; // チェックボックス初期状態
          }
        })
        .catch(err => console.error('GeoJSON load failed for', key, err));
    }

    // 左上にレイヤー切り替え用のチェックボックスUIを作る
    function createLayerControl() {
      const control = L.control({ position: 'topleft' });
    
      control.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'layer-control');
        div.style.background = 'white';
        div.style.padding = '5px 10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
        div.style.fontSize = '14px';
    
        div.innerHTML = `
          <label><input type="checkbox" id="layer_world" checked> World</label><br>
          <label><input type="checkbox" id="layer_usaStates"> USA States</label>
        `;
    
        // Leaflet の map イベントが UI に干渉しないようにする
        L.DomEvent.disableClickPropagation(div);
    
        return div;
      };
    
      control.addTo(map);
    
      // チェックボックスのイベント
      ['world', 'usaStates'].forEach(key => {
        const cb = document.getElementById('layer_' + key);
        cb.addEventListener('change', (e) => {
          if (layers[key]) {
            if (e.target.checked) {
              layers[key].addTo(map);
            } else {
              map.removeLayer(layers[key]);
            }
          }
        });
      });
    }
    
    // レイヤーを読み込んだ後に呼ぶ
    createLayerControl();

    // 読み込み実行
    loadLayer('world', geoUrls.world, { color: '#666', weight: 1, fillColor: '#eaeaea', fillOpacity: 0.9 });
    loadLayer('usaStates', geoUrls.usaStates, { color: '#333', weight: 1, fillColor: '#eaeaea', fillOpacity: 0.8 });




    
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
