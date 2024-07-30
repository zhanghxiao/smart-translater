const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());

// 添加环境变量中间件
app.use((req, res, next) => {
  const envVars = {
    VUE_APP_API_BASE_URL: process.env.VUE_APP_API_BASE_URL,
    VUE_APP_API_KEY: process.env.VUE_APP_API_KEY,
    VUE_APP_MODELS: process.env.VUE_APP_MODELS,
    VUE_APP_TRANSLATE_API_URL: process.env.VUE_APP_TRANSLATE_API_URL,
    VUE_APP_TTS_API_URL: process.env.VUE_APP_TTS_API_URL
  };
  
  const encodedEnvVars = Buffer.from(JSON.stringify(envVars)).toString('base64');
  
  res.header('Access-Control-Expose-Headers', 'X-Environment-Variables');
  res.header('X-Environment-Variables', encodedEnvVars);
  next();
});

// API 路由
app.post('/api/translate/deepl', async (req, res) => {
  try {
    const response = await axios.post(process.env.VUE_APP_TRANSLATE_API_URL, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.post('/api/translate/llm', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/v1/chat/completions`, req.body, {
      headers: { 'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'LLM translation failed' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/v1/chat/completions`, req.body, {
      headers: { 'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}` },
      responseType: 'stream'
    });
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Chat request failed' });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const response = await axios.post(process.env.VUE_APP_TTS_API_URL, req.body, {
      responseType: 'arraybuffer'
    });
    res.type('audio/mpeg');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: 'TTS request failed' });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 所有其他请求返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});