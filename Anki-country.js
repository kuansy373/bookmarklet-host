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
      world: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
      usaStates: 'https://raw.githubusercontent.com/datasets/geo-admin1-us/master/data/admin1-us.geojson'
    };

    // 地域別カラー設定
    var regionColors = {
      Europe: '#3ebbb6',
      Africa: '#81ca98',
      'MiddleEast': '#a5a66a',
      Asia: '#fa9eaa',
      Oceania: '#dc7550',
      'North America': '#b3ce62',
      'South America': '#a3d3d8',
      Antarctica: '#a5dce9',
      Default: '#000000',
    };

    var countryRegions = {
     Europe: [
      'albania','andorra','austria',
      'belarus','belgium','bosnia and herzegovina','bulgaria',
      'croatia','czechia',
      'denmark',
      'england','estonia',
      'finland','france',
      'germany','greece',
      'hungary',
      'iceland','ireland','italy',
      'kosovo',
      'latvia','liechtenstein','lithuania','luxembourg',
      'malta','moldova','monaco','montenegro',
      'netherlands','northern ireland','north macedonia','norway',
      'poland','portugal',
      'republic of serbia','romania','russia',
      'sanmarino','scotland','slovakia','slovenia','spain','sweden','switzerland',
      'ukraine','united kingdom',
      'vaticancity',
      'wales'
    ],
    Africa: [
      'algeria','angola',
      'benin','birtawil','botswana','burkinafaso','burundi',
      'cameroon','capeverde','centralafricanrepublic','chad','comoros',
      'democraticrepublicofthecongo','djibouti',
      'egypt','equatorialguinea','eritrea','eswatini','ethiopia',
      'gabon','gambia','ghana','guinea','guineabissau',
      'ivorycoast',
      'kenya',
      'lesotho','liberia','libya',
      'madagascar','malawi','mali','mauritania','mauritius','morocco','mozambique',
      'namibia','niger','nigeria',
      'republicofthecongo','rwanda',
      'senegal','seychelles','sierraleone','somalia','somaliland','southafrica','southsudan','sudan','swaziland',
      'thegambia','togo','tunisia',
      'uganda','unitedrepublicoftanzania',
      'westernsahara',
      'zambia','zimbabwe'
    ],
    'MiddleEast': [
      'afghanistan','armenia','azerbaijan',
      'bahrain',
      'cyprus',
      'GEO',
      'iran','iraq','israel',
      'jordan',
      'kazakhstan','kuwait','kyrgyzstan',
      'lebanon',
      'northerncyprus',
      'oman',
      'palestine',
      'qatar',
      'saudiarabia','syria',
      'tajikistan','turkey','turkmenistan',
      'unitedarabemirates','uzbekistan',
      'westbank',
      'yemen'
    ],
    Asia: [
      'bangladesh','bhutan','brunei',
      'cambodia','china',
      'east timor',
      'hong kong',
      'india','indonesia',
      'japan',
      'laos',
      'macau','malaysia','maldives','mongolia','myanmar',
      'nepal','north korea',
      'pakistan','philippines',
      'singapore','south korea','sri lanka',
      'taiwan','thailand',
      'vietnam'
    ],
    Oceania: [
      'australia',
      'fiji',
      'kiribati',
      'marshall islands','micronesia',
      'nauru','new caledonia','new zealand',
      'palau','papua new guinea',
      'samoa','solomon islands',
      'tonga','tuvalu',
      'vanuatu'
    ],
    'North America': [
      'antiguaandbarbuda',
      'barbados','belize','bermuda',
      'canada','costarica','cuba',
      'dominica','dominican republic',
      'elsalvador',
      'grenada','greenland','guatemala',
      'haiti','honduras',
      'jamaica',
      'mexico',
      'nicaragua',
      'panama','puertorico',
      'saintkittsandnevis','saintlucia','saintvincentandthegrenadines',
      'the bahamas','trinidadand tobago',
      'united states of america'
    ],
    'South America': [
      'argentina',
      'bolivia','brazil',
      'chile','colombia',
      'ecuador',
      'falklandislands','frenchguiana',
      'guyana',
      'paraguay','peru',
      'suriname',
      'uruguay',
      'venezuela'
    ],
    Antarctica: [
      'antarctica',
      'french southern and antarctic lands'
    ]
    };

    // アメリカ州リスト（ISO3166コードとstate_codeで判定）
    var usStates = [
      'alabama','alaska','arizona','arkansas',
      'california','colorado','connecticut',
      'delaware',
      'florida',
      'GA',
      'hawaii',
      'idaho','illinois','indiana','iowa',
      'kansas','kentucky',
      'louisiana',
      'maine','maryland','massachusetts','michigan','minnesota','mississippi','missouri','montana',
      'nebraska','nevada','newhampshire','newjersey','newmexico','newyork','northcarolina','northdakota',
      'ohio','oklahoma','oregon',
      'pennsylvania',
      'rhodeisland',
      'southcarolina','southdakota',
      'tennessee','texas',
      'utah',
      'vermont','virginia',
      'washington','westvirginia','wisconsin','wyoming'
    ];
  
    // 名前を小文字化して空白をトリム
    function normalize(name) {
      return name.trim().toLowerCase();
    }
    
    // 地域判定関数（ISO3166コードとstate_codeを優先）
    function getRegion(properties) {
      // 1. アメリカ州の判定（state_codeを優先）
      if (properties.state_code && usStates.includes(properties.state_code)) {
        return 'North America';
      }
      if (properties.id && properties.id.startsWith('USA-')) {
        return 'North America';
      }

      // 2. 国のISO3166コードで判定
      var isoCode = properties['ISO3166-1-Alpha-3'] || properties['ISO3166-1-Alpha-2'];
      if (isoCode) {
        for (const [region, list] of Object.entries(countryRegions)) {
          if (list.includes(isoCode)) return region;
        }
      }

      // 3. 国名で判定（フォールバック）
      var name = properties.name || properties.NAME || properties.ADMIN || properties.ADMIN_EN || '';
      var n = normalize(name);
      for (const [region, list] of Object.entries(countryRegions)) {
        if (list.some(c => normalize(c) === n)) return region;
      }

      // 4. それ以外はデフォルト
      return 'Default';
    }

    // レイヤーを格納するオブジェクト
    var layers = {};
    
    // 各国イベント設定関数
    function onEachFeature(feature, layer) {
      layer._filled = false;
    
      layer.on('click touchstart', function (e) {
        var props = feature.properties || {};
        var name = props.name || props.NAME || props.ADMIN || props.ADMIN_EN || 'Unknown';
    
        var region = getRegion(props);
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
                  fillColor: '#eaeaea',
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
    
          if (key === 'world') {
            layers[key].addTo(map);
            document.getElementById('layer_' + key).checked = true;
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
    
        L.DomEvent.disableClickPropagation(div);
    
        return div;
      };
    
      control.addTo(map);
    
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
    
    createLayerControl();

    loadLayer('world', geoUrls.world, { color: '#666', weight: 1, fillColor: '#eaeaea', fillOpacity: 0.9 });
    loadLayer('usaStates', geoUrls.usaStates, { color: '#333', weight: 1, fillColor: '#eaeaea', fillOpacity: 0.8 });

    // --- 地域ボタンコントロール ---
    var RegionControl = L.Control.extend({
      options: { position: 'topleft' },
    
      onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.style.width = 'auto';
        container.style.height = 'auto';

        var button = L.DomUtil.create('a', '', container);
        button.innerHTML = '地域';
        button.href = '#';
        button.style.padding = '4px 8px';
        button.style.background = '#fff';
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        button.style.fontSize = '14px';

        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.disableScrollPropagation(button);
        
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
        
        L.DomEvent.disableClickPropagation(accordion);
        L.DomEvent.disableScrollPropagation(accordion);
    
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
    
          colorBox.addEventListener('click', function(e){
            e.stopPropagation();
    
            map.eachLayer(function(layer){
              if(layer.feature && layer.feature.properties){
                if(getRegion(layer.feature.properties) === region){
                  layer.setStyle({
                    fillColor: color,
                    fillOpacity: 0.9,
                    color: '#333',
                    weight: 1.5
                  });
                  layer._filled = true;
                }
              }
            });
          });
        });
    
        button.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
        });
        
        accordion.addEventListener('click', function(e){
          e.stopPropagation();
        });
    
        L.DomEvent.addListener(map.getContainer(), 'click', function(){
          accordion.style.display = 'none';
        });
    
        return container;
      }
    });
    
    map.addControl(new RegionControl());

  };

  document.body.appendChild(script);
})();
