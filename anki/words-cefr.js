javascript:(async()=>{

  const jsonUrl = "https://raw.githubusercontent.com/kuansy373/bookmarklet-host/main/data/words-cefr.json";

  try {
    const res = await fetch(jsonUrl);
    const data = await res.json();
    const levels = [...new Set(data.map(d => d.CEFR))].sort();

    // 既に表示中なら削除
    const old = document.getElementById("cefr-bookmarklet");
    if (old) old.remove();

    // コンテナ作成
    const div = document.createElement("div");
    div.id = "cefr-bookmarklet";
    div.style = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: #b5b0ff;
      display: flex; align-items: center; justify-content: center;
      z-index: 999999; font-family: sans-serif;
    `;

    div.innerHTML = `
      <div style="background: white; border-radius: 10px; padding: 20px; max-width: 80%; max-height: 80%; overflow: auto;">
        <h2>CEFR英単語</h2>
        <label>レベルを選択:
          <select id="cefr-select">
            <option value="">--選択してください--</option>
            ${levels.map(l=>`<option value="${l}">${l}</option>`).join("")}
          </select>
        </label>
        <button id="cefr-close">✕ 閉じる</button>
        <div id="cefr-list" style="margin-top:20px;"></div>
      </div>
    `;
    document.body.appendChild(div);

    const select = div.querySelector("#cefr-select");
    const list = div.querySelector("#cefr-list");
    const closeBtn = div.querySelector("#cefr-close");

    select.addEventListener("change", ()=>{
      const level = select.value;
      if (!level) { list.innerHTML=""; return; }
      const words = data.filter(d=>d.CEFR===level).map(d=>d.headword);
      list.innerHTML = `
        <h3>${level} レベル (${words.length}語)</h3>
        <div style="columns: 3; -webkit-columns: 3; -moz-columns: 3;">
          ${words.map(w=>`<div>${w}</div>`).join("")}
        </div>
      `;
    });

    closeBtn.addEventListener("click", ()=>div.remove());

  } catch(e) {
    alert("データの取得に失敗しました: " + e);
  }

})();
