javascript:(function () {
  if (document.getElementById('bm-worldmap-overlay')) return;

  // MapLibre GL CSS 読み込み
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
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

  // MapLibre GL スクリプト
  var script = document.createElement('script');
  script.id = 'bm-maplibre-script';
  script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';

  script.onload = function () {
    var map = new maplibregl.Map({
      container: mapDiv,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
      },
      center: [0, 20], // マップの初期中心座標
      zoom: 1,         // 初期ズームレベル
      attributionControl: false // 右下に著作権🄫表示
    });
    map.doubleClickZoom.disable();　// ダブルクリックでズームを無効

    // データソース
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
      'benin','birtawil','botswana','burkina faso','burundi',
      'cameroon','capeverde','central african republic','chad','comoros',
      'democratic republic of the congo','djibouti',
      'egypt','equatorial guinea','eritrea','eswatini','ethiopia',
      'gabon','gambia','ghana','guinea','guinea-bissau',
      'ivory coast',
      'kenya',
      'lesotho','liberia','libya',
      'madagascar','malawi','mali','mauritania','mauritius','morocco','mozambique',
      'namibia','niger','nigeria',
      'republic of the congo','rwanda',
      'senegal','seychelles','sierra leone','somalia','somaliland','south africa','south sudan','sudan','swaziland',
      'thegambia','togo','tunisia',
      'uganda','united republic of tanzania',
      'western sahara',
      'zambia','zimbabwe'
    ],
    'MiddleEast': [
      'afghanistan','armenia','azerbaijan',
      'bahrain',
      'cyprus',
      'georgia',
      'iran','iraq','israel',
      'jordan',
      'kazakhstan','kuwait','kyrgyzstan',
      'lebanon',
      'northerncyprus',
      'oman',
      'palestine',
      'qatar',
      'saudi arabia','syria',
      'tajikistan','turkey','turkmenistan',
      'united arab emirates','uzbekistan',
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
      'antigua and barbuda',
      'barbados','belize','bermuda',
      'canada','costa rica','cuba',
      'dominica','dominican republic',
      'el salvador',
      'grenada','greenland','guatemala',
      'haiti','honduras',
      'jamaica',
      'mexico',
      'nicaragua',
      'panama','puerto rico',
      'saintkittsandnevis','saint lucia','saintvincentand the grenadines',
      'the bahamas','trinidad and tobago',
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
    
    var filledFeatures = {};

    function normalize(name) {
      return name.trim().toLowerCase();
    }
    
    function getRegion(properties) {
      if (properties.state_code && usStates.includes(properties.state_code)) {
        return 'North America';
      }
      if (properties.id && properties.id.startsWith('USA-')) {
        return 'North America';
      }

      var isoCode = properties['name'] || properties['ISO3166-1-Alpha-2'];
      if (isoCode) {
        for (const [region, list] of Object.entries(countryRegions)) {
          if (list.includes(isoCode)) return region;
        }
      }

      var name = properties.name || properties.NAME || properties.ADMIN || properties.ADMIN_EN || '';
      var n = normalize(name);
      for (const [region, list] of Object.entries(countryRegions)) {
        if (list.some(c => normalize(c) === n)) return region;
      }

      return 'Default';
    }

    // 指定したURLからGeoJSONデータを取得
    function loadLayer(key, url) {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          map.addSource(key, {
            type: 'geojson',
            data: data,
            promoteId: key === 'usaStates' ? 'state_code' : 'name'
          });

          // 塗りつぶしレイヤーの追加
          map.addLayer({
            id: key + '-fill',
            type: 'fill',
            source: key,
            paint: {
              'fill-color': [
                'case',
                ['!=', ['feature-state', 'fillColor'], null],
                ['feature-state', 'fillColor'],
                '#eaeaea'
              ],
              'fill-opacity': 1
            }
          });

          // 境界線レイヤーの追加
          map.addLayer({
            id: key + '-line',
            type: 'line',
            source: key,
            paint: {
              'line-color': '#888',
              'line-width': 1
            }
          });

          // 初期表示設定（world初期表示、usaStates初期非表示）
          if (key === 'world') {
            document.getElementById('layer_' + key).checked = true;
          } else {
            map.setLayoutProperty(key + '-fill', 'visibility', 'none');
            map.setLayoutProperty(key + '-line', 'visibility', 'none');
          }
        })
        .catch(err => console.error('GeoJSON load failed for', key, err));
    }

    // 地図ロード（地図の読み込み完了後に、世界地図レイヤー、アメリカ州レイヤーを順に読み込んで追加）
    map.on('load', function() {
      loadLayer('world', geoUrls.world);
      loadLayer('usaStates', geoUrls.usaStates);

      // クリックイベント
      ['world', 'usaStates'].forEach(key => {
        map.on('click', key + '-fill', function(e) {
          var feature = e.features[0];
          var props = feature.properties;
    
    // usaStatesが表示されているとき、worldレイヤーのアメリカはスキップ
    if (key === 'world') {
      const usaStatesVisible = map.getLayoutProperty('usaStates-fill', 'visibility') !== 'none';
      const isUSA = props.ADMIN === 'United States of America' || 
                    props.name === 'United States of America' ||
                    props.NAME === 'United States of America';
      
      if (usaStatesVisible && isUSA) {
        return; // アメリカ本土のクリックを無視
      }
    }
    
    var featureId = key === 'usaStates' ? props.state_code : (props['name'] || feature.id);
          var id = featureId || props.id || props.name || props.NAME;
          var name = props.name || props.NAME || props.ADMIN || props.ADMIN_EN || 'Unknown';
          var region = getRegion(props);
          var fillColor = regionColors[region] || regionColors.Default;

          // クリックによる色塗り・解除
          if (!filledFeatures[id]) {
            filledFeatures[id] = { color: fillColor, layerId: key };
            
            map.setFeatureState(
              { source: key, id: featureId },
              { fillColor: fillColor }
            );
          // すでに塗られている地物を再クリックしたとき
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
            // ポップアップを表示
            var popup = new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(popupContent)
              .addTo(map);

            // リセットボタンで色を戻す
            setTimeout(() => {
              const btn = document.getElementById('resetColorBtn');
              if (btn) {
                btn.addEventListener('click', () => {
                  delete filledFeatures[id];
                  
                  map.removeFeatureState(
                    { source: key, id: featureId }
                  );
                  
                  popup.remove();
                });
              }
            }, 0);
          }
        });

        // マウスイベント
        map.on('mouseenter', key + '-fill', function() {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', key + '-fill', function() {
          map.getCanvas().style.cursor = '';
        });
      });
    });

    // 地図ボタンの親コンテナ作成
    var mappBtnContainer = document.createElement('div');
    Object.assign(mappBtnContainer.style, {
      position: 'absolute',
      top: '20px',
      left: '10px',
      zIndex: 1
    });
    
    // 地図ボタン作成
    var mapButton = document.createElement('button');
    mapButton.innerHTML = '地図';
    Object.assign(mapButton.style, {
      padding: '4px 8px',
      background: '#fff',
      border: '2px solid rgba(0,0,0,0.2)',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    });
    
    // レイヤー切り替えUI（アコーディオン風）
    var layerControl = document.createElement('div');
    Object.assign(layerControl.style, {
      display: 'none',
      marginTop: '2px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '14px'
    });
    
    layerControl.innerHTML = `
      <label><input type="checkbox" id="layer_world" checked> World</label><br>
      <label><input type="checkbox" id="layer_usaStates"> USA States</label>
    `;
    
    // layerControl自体のクリックで閉じないようにする
    layerControl.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // チェックボックスのイベント設定
    ['world', 'usaStates'].forEach(key => {
      const cb = layerControl.querySelector('#layer_' + key);
      cb.addEventListener('change', (e) => {
        const visibility = e.target.checked ? 'visible' : 'none';
    
        if (map.getLayer(key + '-fill')) {
          map.setLayoutProperty(key + '-fill', 'visibility', visibility);
          map.setLayoutProperty(key + '-line', 'visibility', visibility);
        }
    
        // usaStates は常に上に
        if (map.getLayer('usaStates-fill') && map.getLayer('usaStates-line')) {
          map.moveLayer('usaStates-fill');
          map.moveLayer('usaStates-line');
        }
      });
    });

    
    // アコーディオン開閉
    mapButton.addEventListener('click', function(e) {
      e.stopPropagation();
      layerControl.style.display = layerControl.style.display === 'none' ? 'block' : 'none';
      
      // 地域ボタンの位置を調整
      if (layerControl.style.display === 'block') {
        const mapBtnHeight = mappBtnContainer.offsetHeight;
        regionBtnContainer.style.top = (20 + mapBtnHeight + 5) + 'px'; // 5pxは余白
      } else {
        regionBtnContainer.style.top = '55px'; // 元の位置に戻す
      }
    });
    
    // 外側クリックで閉じる
    document.addEventListener('click', function() {
      if (layerControl.style.display === 'block') {
        layerControl.style.display = 'none';
        regionBtnContainer.style.top = '55px'; // 元の位置に戻す
      }
    });
    
    // コンテナ組み立て
    mappBtnContainer.appendChild(mapButton);
    mappBtnContainer.appendChild(layerControl);
    container.appendChild(mappBtnContainer);

    // 地域ボタンの親コンテナ作成
    var regionBtnContainer = document.createElement('div');
    Object.assign(regionBtnContainer.style, {
      position: 'absolute',
      top: '55px',
      left: '10px',
      zIndex: 1
    });

    // 地域ボタン作成
    var regionButton = document.createElement('button');
    regionButton.innerHTML = '地域';
    Object.assign(regionButton.style, {
      padding: '4px 8px',
      background: '#fff',
      border: '2px solid rgba(0,0,0,0.2)',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    });

    // 地域コントロールUI（アコーディオン風）
    var regionControl = document.createElement('div');
    Object.assign(regionControl.style, {
      display: 'none',
      marginTop: '2px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      padding: '4px',
      borderRadius: '4px'
    });

    // 地域リスト（カラー付き）生成
    Object.entries(regionColors).forEach(([region, color]) => {
      var item = document.createElement('div');
      Object.assign(item.style, {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '4px',
        cursor: 'pointer'
      });
    
      // 色の四角
      var colorBox = document.createElement('span');
      Object.assign(colorBox.style, {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        background: color,
        marginRight: '6px',
        border: '1px solid #333'
      });
    
      // ラベル
      var label = document.createElement('span');
      label.textContent = region;
    
      // リセットボタン
      var resetBtn = document.createElement('button');
      resetBtn.textContent = '↵';
      Object.assign(resetBtn.style, {
        all: 'initial',
        marginLeft: '6px',
        paddingInline: '4px 4px',
        fontSize: '13px',
        background: 'white',
        color: '#979797',
        border: '1px solid #c3c3c3',
        cursor: 'pointer'
      });
    
      // 色ボックスクリックで色を設定
      colorBox.addEventListener('click', function(e) {
        e.stopPropagation();
        
        ['world', 'usaStates'].forEach(key => {
          if (map.getSource(key)) {
            var source = map.getSource(key);
            var data = source._data;
            data.features.forEach(f => {
              if (getRegion(f.properties) === region) {
                var fId = key === 'usaStates' 
                  ? f.properties.state_code 
                  : (f.properties['name'] || f.id || f.properties.id);
                if (fId) {
                  map.setFeatureState(
                    { source: key, id: fId },
                    { fillColor: color }
                  );
                  filledFeatures[fId] = { color: color, layerId: key };
                }
              }
            });
          }
        });
      });
    
      // リセットボタンクリックで色を元に戻す
      resetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
    
        ['world', 'usaStates'].forEach(key => {
          if (map.getSource(key)) {
            var source = map.getSource(key);
            var data = source._data;
            data.features.forEach(f => {
              if (getRegion(f.properties) === region) {
                var fId = key === 'usaStates' 
                  ? f.properties.state_code 
                  : (f.properties['name'] || f.id || f.properties.id);
                if (fId) {
                  map.setFeatureState(
                    { source: key, id: fId },
                    { fillColor: null } // 元に戻す
                  );
                  delete filledFeatures[fId]; // 管理オブジェクトから削除
                }
              }
            });
          }
        });
      });
    
      item.appendChild(colorBox);
      item.appendChild(label);
      item.appendChild(resetBtn);
      regionControl.appendChild(item);
    });


    // アコーディオン開閉
    regionButton.addEventListener('click', function(e) {
      e.stopPropagation();
      regionControl.style.display = regionControl.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', function() {
      regionControl.style.display = 'none';
    });

    // コンテナ組み立て
    regionBtnContainer.appendChild(regionButton);
    regionBtnContainer.appendChild(regionControl);
    container.appendChild(regionBtnContainer);
  };

  document.body.appendChild(script);
})();
