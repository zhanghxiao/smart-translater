<template>
  <div class="history-drawer">
    <el-button class="history-button" icon="el-icon-time" circle @click="showDrawer = true"></el-button>
    <el-drawer
      title="历史记录"
      :visible.sync="showDrawer"
      direction="rtl"
      :size="drawerSize"
      :modal="false"
      :with-header="false"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="翻译历史" name="translation">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in translationHistory"
              :key="index"
              :timestamp="formatDate(item.timestamp)"
            >
              <el-card>
                <h4>{{ getLanguageName(item.sourceLang) }} -> {{ getLanguageName(item.targetLang) }}</h4>
                <p>原文：{{ item.sourceText }}</p>
                <p>译文：{{ item.translatedText }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="对话历史" name="chat">
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in chatHistory"
              :key="index"
              :timestamp="formatDate(item.timestamp)"
            >
              <el-card>
                <div v-for="(message, messageIndex) in item.messages" :key="messageIndex">
                  <strong>{{ message.role === 'user' ? '用户' : 'AI' }}:</strong> {{ message.content }}
                </div>
                <el-button size="mini" @click="restoreChat(item)">恢复对话</el-button>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'HistoryDrawer',
  data() {
    return {
      showDrawer: false,
      activeTab: 'translation',
      translationHistory: [],
      chatHistory: []
    }
  },
  computed: {
    drawerSize() {
      return window.innerWidth <= 600 ? '80%' : '60%';
    }
  },
  methods: {
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
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
    },
    loadHistory() {
      this.translationHistory = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      this.chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    },
    restoreChat(chatSession) {
      this.$emit('restore-chat', chatSession.messages);
      this.showDrawer = false;
    },
    handleResize() {
      this.$forceUpdate(); // 强制更新组件以重新计算 drawerSize
    }
  },
  mounted() {
    this.loadHistory();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style scoped>
.history-drawer {
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 1000;
}

.history-button {
  width: 60px;
  height: 60px;
}

.el-drawer__body {
  padding: 20px;
}

.el-timeline-item {
  padding-bottom: 20px;
}

.el-card {
  margin-top: 10px;
}

.el-button {
  margin-top: 10px;
}

/* @media (max-width: 600px) {
  .history-button {
    width: 50px;
    height: 50px;
  }
} */
</style>