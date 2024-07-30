const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;  // 使用环境变量或默认值
const TRANSLATE_API_URL = process.env.VUE_APP_TRANSLATE_API_URL;
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
const API_KEY = process.env.VUE_APP_API_KEY;
const TTS_API_URL = process.env.VUE_APP_TTS_API_URL;
app.use(express.json());

// DeepL翻译路由
app.post('/api/translate/deepl', async (req, res) => {
  try {
    const response = await axios.post(TRANSLATE_API_URL, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// 大语言模型翻译路由
app.post('/api/translate/llm', async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/chat/completions`, req.body, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

// TTS路由
app.post('/api/tts', async (req, res) => {
  try {
    const response = await axios.post(`${TTS_API_URL}/v1/audio/speech`, req.body, {
      responseType: 'arraybuffer'
    });
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: 'TTS failed' });
  }
});

// 多轮对话路由（流式响应）
app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v1/chat/completions`, req.body, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. The server may already be running.`);
  } else {
    console.error(err);
  }
});