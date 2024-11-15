<template>
  <div class="translation-container">
    <el-card class="translation-card" :class="{ 'dark-mode': isDarkMode }">
      <!-- 语言选择器部分 -->
      <div class="language-selector">
        <el-select 
          v-model="sourceLang" 
          placeholder="源语言"
          class="language-select"
        >
          <el-option
            v-for="lang in languages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value">
          </el-option>
        </el-select>
        
        <el-button 
          class="swap-btn"
          @click="swapLanguages"
        >
          <i class="el-icon-refresh"></i>
        </el-button>
        
        <el-select 
          v-model="targetLang" 
          placeholder="目标语言"
          class="language-select"
        >
          <el-option
            v-for="lang in languages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value">
          </el-option>
        </el-select>
      </div>

      <!-- 输入框部分 -->
      <el-input
        type="textarea"
        :rows="4"
        placeholder="请输入要翻译的文本"
        v-model="sourceText"
        class="translation-input"
      >
      </el-input>

      <!-- 翻译选项部分 -->
      <div class="translation-options">
        <div class="translation-source">
          <el-radio-group v-model="translationSource" class="radio-group">
            <el-radio label="deepl">DeepL</el-radio>
            <el-radio label="llm">大语言模型</el-radio>
          </el-radio-group>
          
          <el-select 
            v-if="translationSource === 'llm'" 
            v-model="selectedModel" 
            placeholder="选择模型"
            class="model-select"
          >
            <el-option
              v-for="model in models"
              :key="model"
              :label="model"
              :value="model">
            </el-option>
          </el-select>
        </div>
        
        <el-button 
          type="primary" 
          @click="translate"
          class="translate-btn"
        >
          翻译
        </el-button>
      </div>

      <!-- 翻译结果部分 -->
      <el-card v-if="translatedText" class="result-card">
        <div slot="header" class="result-header">
          <span>翻译结果</span>
          <div class="result-actions">
            <el-button 
              icon="el-icon-document-copy" 
              @click="copyText(translatedText)"
              class="action-btn"
            ></el-button>
            <el-button 
              icon="el-icon-headset" 
              @click="speakText(translatedText)"
              class="action-btn"
            ></el-button>
          </div>
        </div>
        <p class="result-text">{{ translatedText }}</p>
      </el-card>

      <!-- 替代翻译部分 -->
      <el-card v-if="alternatives.length > 0" class="result-card alternatives-card">
        <div slot="header" class="result-header">
          <span>替代翻译</span>
          <div class="result-actions">
            <el-button 
              icon="el-icon-document-copy" 
              @click="copyText(alternatives.join('\n'))"
              class="action-btn"
            ></el-button>
            <el-button 
              icon="el-icon-headset" 
              @click="speakText(alternatives.join('. '))"
              class="action-btn"
            ></el-button>
          </div>
        </div>
        <ul class="alternatives-list">
          <li v-for="(alt, index) in alternatives" :key="index">{{ alt }}</li>
        </ul>
      </el-card>
    </el-card>
  </div>
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
        const response = await fetch(this.getEnvVar('VUE_APP_TRANSLATE_API_URL'), {
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
        const response = await fetch(`${this.getEnvVar('VUE_APP_API_BASE_URL')}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getEnvVar('VUE_APP_API_KEY')}`
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
        const ttsResponse = await fetch(`${this.getEnvVar('VUE_APP_TTS_API_URL')}/v1/audio/speech`, {
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

        if (!ttsResponse.ok) {
          throw new Error('TTS failed');
        }

        const audioBlob = await ttsResponse.blob();
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
.translation-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.translation-card {
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.translation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.dark-mode.translation-card {
  background: #1a1a1a;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* 语言选择器样式 */
.language-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.language-select {
  flex: 1;
}

.swap-btn {
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: var(--el-color-primary-light-8);
}

.swap-btn:hover {
  background: var(--el-color-primary-light-5);
  transform: rotate(180deg);
}

/* 输入框样式 */
.translation-input {
  margin-bottom: 1.5rem;
}

.translation-input :deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: var(--el-bg-color-page);
}

.translation-input :deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
}

/* 翻译选项样式 */
.translation-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.translation-source {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.radio-group :deep(.el-radio) {
  margin-right: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-group :deep(.el-radio:hover) {
  background: var(--el-color-primary-light-9);
}

.model-select {
  min-width: 180px;
}

.translate-btn {
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.translate-btn:hover {
  transform: translateY(-2px);
}

/* 结果卡片样式 */
.result-card {
  margin-top: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--el-bg-color-page);
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: var(--el-color-primary-light-8);
  transform: translateY(-2px);
}

.result-text {
  padding: 1rem;
  line-height: 1.6;
}

.alternatives-list {
  list-style: none;
  padding: 1rem;
  margin: 0;
}

.alternatives-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.alternatives-list li:last-child {
  border-bottom: none;
}

/* 暗色模式适配 */
.dark-mode {
  --el-bg-color: #1a1a1a;
  --el-bg-color-page: #242424;
  --el-text-color-primary: #ffffff;
  --el-border-color: #333333;
}

.dark-mode .translation-input :deep(.el-textarea__inner) {
  background: #242424;
  color: #ffffff;
}

.dark-mode .radio-group :deep(.el-radio__label) {
  color: #ffffff;
}

.dark-mode .action-btn {
  color: #ffffff;
  border-color: #333333;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .translation-container {
    padding: 0 0.5rem;
  }

  .language-selector {
    flex-direction: column;
  }

  .language-select {
    width: 100%;
  }

  .translation-options {
    flex-direction: column;
    align-items: stretch;
  }

  .translation-source {
    flex-direction: column;
    align-items: stretch;
  }

  .radio-group {
    display: flex;
    justify-content: space-between;
  }

  .model-select {
    width: 100%;
  }

  .translate-btn {
    width: 100%;
  }
}
</style>
