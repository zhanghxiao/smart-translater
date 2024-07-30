require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// DeepL 翻译 API
app.post('/api/translate/deepl', async (req, res) => {
  try {
    const { text, source_lang, target_lang } = req.body;
    const response = await axios.post(process.env.VUE_APP_TRANSLATE_API_URL, {
      text,
      source_lang,
      target_lang
    });
    res.json(response.data);
  } catch (error) {
    console.error('DeepL translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// LLM 翻译 API
app.post('/api/translate/llm', async (req, res) => {
  try {
    const { messages, model, temperature } = req.body;
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/v1/chat/completions`, {
      messages,
      model,
      temperature
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('LLM translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// TTS API
app.post('/api/tts', async (req, res) => {
  try {
    const { model, input, voice } = req.body;
    const response = await axios.post(process.env.VUE_APP_TTS_API_URL, {
      model,
      input,
      voice
    }, {
      responseType: 'arraybuffer'
    });
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'TTS failed' });
  }
});

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, stream, model, temperature, presence_penalty } = req.body;
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/v1/chat/completions`, {
      messages,
      stream,
      model,
      temperature,
      presence_penalty
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}`
      },
      responseType: 'stream'
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
});

// 处理所有其他路由，返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
