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
    map.doubleClickZoom.disable(); // ダブルクリックでズームを無効
    map.dragRotate.disable(); // マウスでの回転を無効
    map.touchZoomRotate.disableRotation(); // タッチ操作での回転を無効

    // データソース
    var geoUrls = {
      world: 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson',
      usaStates: 'https://raw.githubusercontent.com/datasets/geo-admin1-us/master/data/admin1-us.geojson',
      capitals: 'https://raw.githubusercontent.com/kuansy373/bookmarklet-host/main/capitals.geojson'
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
      Capitals: '#ff0000',
      Default: '#000000',
    };

    // 判定用リスト
    var countryRegions = {
     Europe: [
      'albania','andorra','armenia','austria','azerbaijan',
      'belarus','belgium','bosnia and herzegovina','bulgaria',
      'croatia','cyprus','czechia',
      'denmark',
      'estonia',
      'finland','france',
      'georgia','germany','greece',
      'hungary',
      'iceland','ireland','italy',
      'kazakhstan','kosovo','kyrgyzstan',
      'latvia','liechtenstein','lithuania','luxembourg',
      'malta','moldova','monaco','montenegro',
      'netherlands','north macedonia','norway',
      'poland','portugal',
      'republic of serbia','romania','russia',
      'san marino','slovakia','slovenia','spain','sweden','switzerland',
      'tajikistan','turkmenistan',
      'ukraine','united kingdom','uzbekistan',
      'vatican'
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
    'Middle East': [
      'afghanistan',
      'bahrain',
      'iran','iraq','israel',
      'jordan',
      'kuwait',
      'lebanon',
      'oman',
      'palestine',
      'qatar',
      'saudi arabia','syria',
      'turkey',
      'united arab emirates',
      'yemen'
    ],
    Asia: [
      'bangladesh','bhutan','brunei',
      'cambodia','china',
      'east timor',
      'hong kong s.a.r.',
      'india','indonesia',
      'japan',
      'laos',
      'macao s.a.r','malaysia','maldives','mongolia','myanmar',
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
    ],
    Capitals: [
      'accra','ashgabat','astana','asmara','asuncion','addis ababa','athenes','apia','abuja','abu dhabi','amsterdam',
      'seoul',
      'tokyo',
      'district of columbia'
    ]
    };

    // アメリカ州リスト（state_codeで判定）
    var usStates = [
      'DE','PA','NJ','GA','CT','MA','MD','SC','NH','VA','NY','NC','RI',
      'VT','KY','TN','OH','LA','IN','MS','IL','AL','ME',
      'MO','AR','MI','FL','TX','IA','WI','CA','MN','OR',
      'KS','WV','NV','NE','CO','ND','SD','MT','WA','ID',
      'WY','UT','OK','NM','AZ','AK','HI',
    ];
    
    // 色塗り管理オブジェクト
    var filledFeatures = {};

    // nameの前後の空白を削除し、小文字に変換する関数
    function normalize(name) {
      return name.trim().toLowerCase();
    }
    
    // geojsonプロパティにある個別のstate_codeがusStateに登録されている場合はNorth Americaを返す。IDがUSA-で始まる場合もNorth Americaを返す。
    function getRegion(properties) {
      if (properties.state_code && usStates.includes(properties.state_code)) {
        return 'North America';
      }

      // geojsonにプロパティnameがあればnameで、なければISO3166-1-Alpha-2を使ってregionを判定し返す。
      var isoCode = properties['name'] || properties['ISO3166-1-Alpha-2'];
      if (isoCode) {
        for (const [region, list] of Object.entries(countryRegions)) {
          if (list.includes(isoCode)) return region;
        }
      }

      // nameにproperties.nameを代入して正規化関数を使い正規化し、regionリストの中に同じものがあればその地域を返す。
      var name = properties.name || '';
      var n = normalize(name);
      for (const [region, list] of Object.entries(countryRegions)) {
        if (list.some(c => normalize(c) === n)) return region;
      }

      return 'Default';
    }

    // 検索ボックスとプログレス表示エリア
    var searchContainer = document.createElement('div');
    Object.assign(searchContainer.style, {
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      background: 'white',
      padding: '10px',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      minWidth: '200px'
    });
    container.appendChild(searchContainer);
  
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '個数を確認...';
    Object.assign(searchInput.style, {
      width: '100%',
      padding: '5px',
      border: '1px solid #ccc',
      borderRadius: '3px',
      fontSize: '14px'
    });
    searchContainer.appendChild(searchInput);
  
    var progressDisplay = document.createElement('div');
    progressDisplay.id = 'progress-display';
    Object.assign(progressDisplay.style, {
      fontSize: '15px',
    });
    searchContainer.appendChild(progressDisplay);

    // 国リストの開閉状態を保持
    var expandedLists = {};

    // 進捗を更新する関数
    function updateProgress() {
      var searchQuery = searchInput.value.trim();
      
      if (!searchQuery) {
        progressDisplay.innerHTML = '';
        return;
      }

      // コンマ区切りで複数検索に対応
      var searchTerms = searchQuery.split(',').map(term => term.trim().toLowerCase()).filter(term => term);
      
      if (searchTerms.length === 0) {
        progressDisplay.innerHTML = '';
        return;
      }

      // 地域名の部分一致検索（Defaultも含む）
      var allRegions = Object.keys(countryRegions).concat(['Default']);
      var matchedRegions = [];
      
      searchTerms.forEach(searchTerm => {
        allRegions.forEach(region => {
          if (region.toLowerCase().includes(searchTerm) && !matchedRegions.includes(region)) {
            matchedRegions.push(region);
          }
        });
      });

      if (matchedRegions.length === 0) {
        progressDisplay.innerHTML = '<div style="color:#999;">該当する地域がありません</div>';
        return;
      }

      var html = '';
      matchedRegions.forEach(region => {
        var totalCount = 0;
        var filledCount = 0;
        var countryList = [];

        if (region === 'Default') {
          // Defaultは塗られた国の中からカウント
          Object.keys(filledFeatures).forEach(id => {
            var feature = filledFeatures[id];
            // どの地域にも属していないかチェック
            var belongsToRegion = false;
            for (const [reg, list] of Object.entries(countryRegions)) {
              if (list.some(country => normalize(country) === normalize(id) || country === id)) {
                belongsToRegion = true;
                break;
              }
            }
            if (!belongsToRegion) {
              filledCount++;
              countryList.push({ name: id, filled: true });
            }
          });
          totalCount = '?'; // 総数は不明
        } else {
          var regionCountries = countryRegions[region];
          totalCount = regionCountries.length;

          // その地域の国リストを作成
          regionCountries.forEach(country => {
            var isFilled = Object.keys(filledFeatures).some(id => {
              return normalize(country) === normalize(id) || country === id;
            });
            
            if (isFilled) {
              filledCount++;
            }
            
            countryList.push({ name: country, filled: isFilled });
          });
        }

        var color = regionColors[region] || regionColors.Default;
        var listId = 'country-list-' + region.replace(/\s+/g, '-');
        var isExpanded = expandedLists[region] || false;
        
       html += `
          <div style="margin-bottom:8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
              <div>
                <div style="font-weight:600; color:${color};">${region}</div>
                <div style="color:#555; font-size:13px;">${filledCount} / ${totalCount}</div>
              </div>
              <button class="toggle-list-btn" data-target="${listId}" data-region="${region}" style="background:none; border:none; cursor:pointer; font-size:16px; padding:4px 8px;">${isExpanded ? '▲' : '▼'}</button>
            </div>
            <div id="${listId}" style="display:${isExpanded ? 'block' : 'none'}; margin-top:5px; padding-left:10px; max-height:200px; overflow-y:auto; font-size:12px; line-height:1.6;">
              ${countryList.map(country => {
                var countryColor = country.filled ? color : '#ccc';
                return `<div style="color:${countryColor};">${country.name}</div>`;
              }).join('')}
            </div>
          </div>
        `;
      });

      progressDisplay.innerHTML = html;
      
      // トグルボタンのイベントを設定
      var toggleButtons = progressDisplay.querySelectorAll('.toggle-list-btn');
      toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          var targetId = this.getAttribute('data-target');
          var region = this.getAttribute('data-region');
          var listElement = document.getElementById(targetId);
          
          if (listElement.style.display === 'none') {
            listElement.style.display = 'block';
            this.textContent = '▲';
            expandedLists[region] = true;
          } else {
            listElement.style.display = 'none';
            this.textContent = '▼';
            expandedLists[region] = false;
          }
        });
      });
    }

    // 検索ボックスのイベント
    searchInput.addEventListener('input', updateProgress);

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

    // 地図ロード
    map.on('load', function() {
      loadLayer('world', geoUrls.world);
      loadLayer('usaStates', geoUrls.usaStates);
      loadLayer('capitals', geoUrls.capitals);
    
      // レイヤー順（下から上）
      const layerOrder = ['world', 'usaStates', 'capitals'];
      
      // クリックイベント
      layerOrder.forEach(key => {
        map.on('click', key + '-fill', function (e) {
          const feature = e.features[0];
          const props = feature.properties;
      
          // クリック座標から上位レイヤーを探索
          const currentIndex = layerOrder.indexOf(key);
          const upperLayers = layerOrder.slice(currentIndex + 1);
      
          for (const upperKey of upperLayers) {
            const upperFillId = upperKey + '-fill';
            if (!map.getLayer(upperFillId)) continue;
      
            // クリック地点に上位レイヤーのフィーチャがあるかを判定
            const upperFeatures = map.queryRenderedFeatures(e.point, { layers: [upperFillId] });
      
            if (upperFeatures.length > 0) {
              // 上位レイヤー上をクリックしている → 下位レイヤーは無視
              return;
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
            
            // 進捗を更新
            updateProgress();
          } else {
            // すでに塗られている地物を再クリックしたとき
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
                  
                  // 進捗を更新
                  updateProgress();
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
    var mapBtnContainer = document.createElement('div');
    Object.assign(mapBtnContainer.style, {
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
      <label><input type="checkbox" id="layer_capitals"> Capitals</label><br>
      <label><input type="checkbox" id="layer_usaStates"> USA States</label><br>
      <label><input type="checkbox" id="layer_meridians"> Meridians</label><br>
      <label><input type="checkbox" id="layer_parallels"> Parallels</label>
    `;
    
    // layerControl自体のクリックで閉じないようにする
    layerControl.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // レイヤー順の定義（下から上）
    const layerOrder = ['world', 'usaStates', 'capitals'];
    
    // レイヤー順を整理する関数
    function reorderLayers() {
      // 下から順に moveLayer を呼ぶことで、最終的に上に積まれていく
      layerOrder.forEach(key => {
        ['fill', 'line'].forEach(type => {
          const layerId = key + '-' + type;
          if (map.getLayer(layerId)) {
            map.moveLayer(layerId);
          }
        });
      });
    }
    
    // チェックボックスのイベント
    ['world', 'usaStates', 'capitals'].forEach(key => {
      const cb = layerControl.querySelector('#layer_' + key);
      cb.addEventListener('change', (e) => {
        const visibility = e.target.checked ? 'visible' : 'none';
    
        ['fill', 'line'].forEach(type => {
          const layerId = key + '-' + type;
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', visibility);
          }
        });
    
        // チェック変更のたびに順序を整理
        reorderLayers();
      });
    });

    // 経線・緯線のGeoJSON生成
    function generateMeridiansParallels() {
      const meridians = { type: 'FeatureCollection', features: [] };
      const parallels = { type: 'FeatureCollection', features: [] };
    
      // 経線: -180 ~ 180 度, 10度刻み
      for (let lon = -180; lon <= 180; lon += 10) {
        meridians.features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[lon, -90], [lon, 90]]
          },
          properties: {}
        });
      }
    
      // 緯線: -90 ~ 90 度, 10度刻み
      for (let lat = -90; lat <= 90; lat += 10) {
        parallels.features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[-180, lat], [180, lat]]
          },
          properties: {}
        });
      }
    
      return { meridians, parallels };
    }
    
    const gridData = generateMeridiansParallels();
    
    // Mapにソース追加
    map.on('load', function() {
      map.addSource('meridians', { type: 'geojson', data: gridData.meridians });
      map.addSource('parallels', { type: 'geojson', data: gridData.parallels });
    
      // レイヤー追加（当たり判定用の透明な太い線 + 表示用の細い線）
      map.addLayer({
        id: 'meridians-line-hitarea',
        type: 'line',
        source: 'meridians',
        paint: { 
          'line-color': 'rgba(0,0,0,0)', // 完全に透明
          'line-width': 10 // 当たり判定用に太く
        },
        layout: { visibility: 'none' }
      });
      
      map.addLayer({
        id: 'meridians-line',
        type: 'line',
        source: 'meridians',
        paint: { 'line-color': '#888', 'line-width': 1 },
        layout: { visibility: 'none' }
      });
      
      map.addLayer({
        id: 'parallels-line-hitarea',
        type: 'line',
        source: 'parallels',
        paint: { 
          'line-color': 'rgba(0,0,0,0)',
          'line-width': 10
        },
        layout: { visibility: 'none' }
      });
      
      map.addLayer({
        id: 'parallels-line',
        type: 'line',
        source: 'parallels',
        paint: { 'line-color': '#888', 'line-width': 1 },
        layout: { visibility: 'none' }
      });
    });
    
    // チェックボックスのイベント（両方のレイヤーを連動）
    ['meridians', 'parallels'].forEach(key => {
      const cb = layerControl.querySelector('#layer_' + key);
      cb.addEventListener('change', (e) => {
        const visibility = e.target.checked ? 'visible' : 'none';
        if (map.getLayer(key + '-line')) {
          map.setLayoutProperty(key + '-line', 'visibility', visibility);
          map.setLayoutProperty(key + '-line-hitarea', 'visibility', visibility);
        }
      });
    });

    // クリックされた線のハイライト管理
    let highlightedLineId = null;
    
    // クリックされた線のハイライト管理（配列で複数管理）
    let highlightedLines = new Map(); // key: 一意のID, value: { layerId, sourceId, degree }
    
    // 経線・緯線クリックイベント
    ['meridians-line-hitarea', 'parallels-line-hitarea'].forEach(layerId => {
      map.on('click', layerId, function (e) {
        // 他の上位レイヤー（国や州）をクリックしているか判定
        const topFeatures = map.queryRenderedFeatures(e.point, {
          layers: ['world-fill', 'world-line', 'usaStates-fill', 'usaStates-line'] // ← 上位レイヤーIDを指定
        });
        
        // もし上位フィーチャがあれば、このクリックは無視
        if (topFeatures.length > 0) {
          return;
        }
        if (!e.features.length) return;
        const feature = e.features[0];
        const coords = feature.geometry.coordinates;
        const isMeridian = layerId === 'meridians-line-hitarea';
        const degreeRaw = isMeridian ? coords[0][0] : coords[0][1];
        const degree = Math.round(degreeRaw); // 小数点以下を四捨五入して整数化
        const label = (isMeridian ? '経度 ' : '緯度 ') + degree + '°';
        
        // 一意のIDを生成（経度/緯度の値で識別）
        const uniqueId = (isMeridian ? 'lon_' : 'lat_') + degree;
        const highlightLayerId = 'highlight-line-' + uniqueId;
        const highlightSourceId = 'highlight-source-' + uniqueId;
    
        // すでにハイライトされている場合は解除
        if (highlightedLines.has(uniqueId)) {
          if (map.getLayer(highlightLayerId)) {
            map.removeLayer(highlightLayerId);
          }
          if (map.getSource(highlightSourceId)) {
            map.removeSource(highlightSourceId);
          }
          highlightedLines.delete(uniqueId);
          return; // 解除したら終了
        }
    
        // 新しいハイライト追加
        // 極域を避けた新しい線を生成
        const highlightFeature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: isMeridian
              ? [[degree, -85.0511], [degree, 85.0511]] // 経線
              : [[-180, degree], [180, degree]]          // 緯線
          }
        };
        
        map.addSource(highlightSourceId, {
          type: 'geojson',
          data: highlightFeature
        });
    
        map.addLayer({
          id: highlightLayerId,
          type: 'line',
          source: highlightSourceId,
          paint: {
            'line-color': '#ff7171',
            'line-width': 1.5
          }
        });
    
        // タップで最前面に移動
        map.moveLayer(highlightLayerId);
    
        // 管理用Mapに追加
        highlightedLines.set(uniqueId, { 
          layerId: highlightLayerId, 
          sourceId: highlightSourceId,
          degree: degree 
        });
    
        // ポップアップをクリック位置に表示
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<strong>${label}</strong>`)
          .addTo(map);
      });
    });
    
    // カーソル変更も当たり判定レイヤーに
    ['meridians-line-hitarea', 'parallels-line-hitarea'].forEach(layerId => {
      map.on('mousemove', layerId, (e) => {
        // 上位レイヤーに地物があるかチェック
        const topFeatures = map.queryRenderedFeatures(e.point, {
          layers: ['world-fill', 'world-line', 'usaStates-fill', 'usaStates-line'] // ← 上位レイヤーIDに合わせて調整
        });
    
        // 経線・緯線の下に上位地物がなければカーソルをpointerに
        if (topFeatures.length === 0) {
          map.getCanvas().style.cursor = 'pointer';
        } else {
          map.getCanvas().style.cursor = '';
        }
      });
    
      // マウスがレイヤー外に出たらカーソルを戻す
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    });

    // アコーディオン開閉
    mapButton.addEventListener('click', function(e) {
      e.stopPropagation();
      layerControl.style.display = layerControl.style.display === 'none' ? 'block' : 'none';
      
      // 地域ボタンの位置を調整
      if (layerControl.style.display === 'block') {
        const mapBtnHeight = mapBtnContainer.offsetHeight;
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
    mapBtnContainer.appendChild(mapButton);
    mapBtnContainer.appendChild(layerControl);
    container.appendChild(mapBtnContainer);

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
    
      // 色ボックスクリックで色を適用
      colorBox.addEventListener('click', function(e) {
        e.stopPropagation();
        
        ['world', 'usaStates', 'capitals'].forEach(key => {
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
          }updateProgress();
        });
      });

      // 地域ごとの中心座標とズーム設定
      var regionView = {
        'Europe': { center: [14, 52], zoom: 2.7 },
        'Africa': { center: [17, 5], zoom: 2.4 },
        'Middle East': { center: [54, 36], zoom: 2.7 },
        'Asia': { center: [105, 25], zoom: 2.5 },
        'Oceania': { center: [147, -25], zoom: 2.5 },
        'North America': { center: [-85, 25], zoom: 3 },
        'South America': { center: [-60, -18], zoom: 2.4 },
      };
      
      // 地域名クリックでフォーカスズーム
      label.addEventListener('click', function (e) {
        e.stopPropagation();
      
        var view = regionView[region];
        if (view) {
          map.flyTo({
            center: view.center,
            zoom: view.zoom,
            speed: 0.8,   // アニメーション速度
            curve: 1.2,   // 動きの滑らかさ
            essential: true
          });
        } else {
          alert(region + ' のビュー設定がありません');
        }
      });

      // リセットボタンクリックで色を元に戻す
      resetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
    
        ['world', 'usaStates', 'capitals'].forEach(key => {
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
          }updateProgress();
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
