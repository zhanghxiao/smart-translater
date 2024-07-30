<template>
  <el-card class="translation-card" :class="{ 'dark-mode': isDarkMode }">
    <div class="language-selector">
      <el-select v-model="sourceLang" placeholder="源语言">
        <el-option
          v-for="lang in languages"
          :key="lang.value"
          :label="lang.label"
          :value="lang.value">
        </el-option>
      </el-select>
      <el-button icon="el-icon-refresh" @click="swapLanguages"></el-button>
      <el-select v-model="targetLang" placeholder="目标语言">
        <el-option
          v-for="lang in languages"
          :key="lang.value"
          :label="lang.label"
          :value="lang.value">
        </el-option>
      </el-select>
    </div>

    <el-input
      type="textarea"
      :rows="4"
      placeholder="请输入要翻译的文本"
      v-model="sourceText"
    >
    </el-input>

    <div class="translation-options">
      <el-radio-group v-model="translationSource">
        <el-radio label="deepl">DeepL</el-radio>
        <el-radio label="llm">大语言模型</el-radio>
      </el-radio-group>
      <el-select v-if="translationSource === 'llm'" v-model="selectedModel" placeholder="选择模型">
        <el-option
          v-for="model in models"
          :key="model"
          :label="model"
          :value="model">
        </el-option>
      </el-select>
      <el-button type="primary" @click="translate">翻译</el-button>
    </div>

    <el-card v-if="translatedText" class="result-card">
      <div slot="header" class="result-header">
        <span>翻译结果</span>
        <div>
          <el-button icon="el-icon-document-copy" @click="copyText(translatedText)"></el-button>
          <el-button icon="el-icon-headset" @click="speakText(translatedText)"></el-button>
        </div>
      </div>
      <p>{{ translatedText }}</p>
    </el-card>

    <el-card v-if="alternatives.length > 0" class="result-card">
      <div slot="header" class="result-header">
        <span>替代翻译</span>
        <div>
          <el-button icon="el-icon-document-copy" @click="copyText(alternatives.join('\n'))"></el-button>
          <el-button icon="el-icon-headset" @click="speakText(alternatives.join('. '))"></el-button>
        </div>
      </div>
      <ul>
        <li v-for="(alt, index) in alternatives" :key="index">{{ alt }}</li>
      </ul>
    </el-card>
  </el-card>
</template>

<script>
export default {
  name: 'TranslationCard',
  data() {
    return {
      languages: [
        { value: 'EN', label: '英语' },
        { value: 'ZH', label: '中文' },
        { value: 'JA', label: '日语' },
        { value: 'KO', label: '韩语' },
        { value: 'FR', label: '法语' },
        { value: 'DE', label: '德语' },
      ],
      sourceLang: 'EN',
      targetLang: 'ZH',
      sourceText: '',
      translatedText: '',
      alternatives: [],
      translationSource: 'deepl',
      models: [],
      selectedModel: '',
      isDarkMode: false,
    }
  },
  created() {
    this.loadSettings();
	this.isDarkMode = document.body.classList.contains('dark-mode');
  },
  mounted() {
    this.updateTheme();
  },
  methods: {
    updateTheme() {
      this.isDarkMode = document.body.classList.contains('dark-mode');
    },
    loadSettings() {
      this.models = (localStorage.getItem('VUE_APP_MODELS') || process.env.VUE_APP_MODELS || '').split(',').map(model => model.trim());
      this.selectedModel = this.models[0] || 'gpt-4o-mini';
    },
    getEnvVar(key) {
      return localStorage.getItem(key) || process.env[key];
    },
    copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('复制成功');
      }, () => {
        this.$message.error('复制失败，请手动复制');
      });
    },
    swapLanguages() {
      [this.sourceLang, this.targetLang] = [this.targetLang, this.sourceLang];
    },
    async translate() {
      if (this.translationSource === 'deepl') {
        await this.translateWithDeepL();
      } else {
        await this.translateWithLLM();
      }
      this.$emit('translation-done', this.translatedText);
      this.saveToHistory();
    },
    async translateWithDeepL() {
      try {
        const response = await fetch('/api/translate/deepl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: this.sourceText,
            source_lang: this.sourceLang,
            target_lang: this.targetLang
          })
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        this.translatedText = data.data;
        this.alternatives = data.alternatives || [];
      } catch (error) {
        console.error('Translation error:', error);
        this.$message.error('翻译失败，请稍后重试');
      }
    },

    async translateWithLLM() {
      try {
        const response = await fetch('/api/translate/llm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a professional, authentic machine translation engine.' },
              { role: 'user', content: `Translate the following source text to ${this.getLanguageName(this.targetLang)}, Output translation directly without any additional text.\nSource Text: ${this.sourceText}\nTranslated Text:` }
            ],
            model: this.selectedModel,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        this.translatedText = data.choices[0].message.content;
        this.alternatives = [];
      } catch (error) {
        console.error('Translation error:', error);
        this.$message.error('翻译失败，请稍后重试');
      }
    },

    async speakText(text) {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.getTTSModel(),
            input: text,
            voice: 'pitch:0.1|rate:0.2'
          })
        });

        if (!response.ok) {
          throw new Error('TTS failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (error) {
        console.error('TTS error:', error);
        this.$message.error('语音播放失败，请稍后重试');
      }
    },
    getTTSModel() {
      const langModelMap = {
        'EN': 'en-US-JennyNeural',
        'ZH': 'zh-TW-HsiaoChenNeural',
        'JA': 'en-US-AvaMultilingualNeural',
        'KO': 'en-US-AvaMultilingualNeural',
        'FR': 'fr-FR-VivienneMultilingualNeural',
        'DE': 'de-DE-SeraphinaMultilingualNeural'
      };
      return langModelMap[this.targetLang] || 'en-US-JennyNeural';
    },
    saveToHistory() {
      const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      history.unshift({
        sourceText: this.sourceText,
        translatedText: this.translatedText,
        sourceLang: this.sourceLang,
        targetLang: this.targetLang,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('translationHistory', JSON.stringify(history.slice(0, 10)));
    },
    getLanguageName(code) {
      const langs = {
        'EN': '英语',
        'ZH': '中文',
        'JA': '日语',
        'KO': '韩语',
        'FR': '法语',
        'DE': '德语'
      };
      return langs[code] || code;
    }
  },
  props: {
    themeChanged: Number
  },
  watch: {
    themeChanged() {
      this.updateTheme();
    }
  }
}
</script>
<style scoped>

.dark-mode .el-radio__label {
  color: #fff;
}

.dark-mode .el-radio__input.is-checked .el-radio__inner {
  border-color: #409EFF;
  background: #409EFF;
}

.dark-mode .el-radio__input.is-checked+.el-radio__label {
  color: #409EFF;
}

.dark-mode .el-radio__inner {
  background-color: #000;
  border-color: #5a5a5a;
}

.dark-mode .el-radio__inner:hover {
  border-color: #409EFF;
}
.translation-card {
  margin-bottom: 20px;
}

.language-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.translation-options {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-card {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 600px) {
  .language-selector {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .language-selector .el-button {
    padding: 8px;
    font-size: 14px;
  }

  .translation-options {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
  
  .translation-options .el-radio-group {
    margin-bottom: 15px;
  }

  .translation-options .el-radio {
    margin-right: 15px;
  }
  
  .translation-options .el-select {
    margin-bottom: 15px;
  }

  .translation-options .el-button {
    width: 100%;
  }
}
</style>