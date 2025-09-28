const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = 'onetap.json';

// 保存
app.post('/save', (req, res) => {
  const {
    color,
    backgroundColor,
    fontSize,
    fontWeight,
    textShadow,
    fontFamily,
    scrollSettings
  } = req.body;

  // 文字スタイルもスクロール設定も両方空ならエラー
  if (
    !color &&
    !backgroundColor &&
    !fontSize &&
    !fontWeight &&
    !textShadow &&
    !fontFamily &&
    !scrollSettings
  ) {
    return res.status(400).send({ error: '保存するスタイルがありません' });
  }

  const data = {
    color,
    backgroundColor,
    fontSize,
    fontWeight,
    textShadow,
    fontFamily,
    scrollSettings: scrollSettings || null
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.send({ status: 'ok', ...data });
});

// 取得
app.get('/get', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.send({
      color: null,
      backgroundColor: null,
      fontSize: null,
      fontWeight: null,
      textShadow: null,
      fontFamily: null,
      scrollSettings: null
    });
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});
