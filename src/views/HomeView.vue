<template>
  <div class="home">
    <h1 class="title">
      <div class="logo-container" :class="{ 'dark-mode': isDarkMode }">
        <img src="@/assets/deep.png" alt="Logo" class="logo">
      </div>
      <span class="title-text">智能翻译助手</span>
    </h1>
    <TranslationCard @translation-done="onTranslationDone" :key="settingsKey" :theme-changed="themeChanged" />
    <ChatDialog :initial-message="translatedText" ref="chatDialog" :key="settingsKey" />
    <HistoryDrawer @restore-chat="onRestoreChat" />
  </div>
</template>

<script>
import TranslationCard from '@/components/TranslationCard.vue'
import ChatDialog from '@/components/ChatDialog.vue'
import HistoryDrawer from '@/components/HistoryDrawer.vue'

export default {
  name: 'HomeView',
  components: {
    TranslationCard,
    ChatDialog,
    HistoryDrawer,
  },
  data() {
    return {
      translatedText: '',
      settingsKey: 0,
      isDarkMode: false
    }
  },
  created() {
    this.isDarkMode = document.body.classList.contains('dark-mode');
  },
  methods: {
    onTranslationDone(text) {
      this.translatedText = text;
      this.$refs.chatDialog.updateInitialMessage(text);
    },
    onRestoreChat(messages) {
      this.$refs.chatDialog.restoreChat(messages);
    },
    handleCommand(command) {
      if (command === 'showSettings') {
        this.$refs.settingsDialog.showDialog();
      }
    },
    onSettingsUpdated() {
      this.settingsKey += 1;
    }
  },
  props: {
    themeChanged: Number
  }
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  margin-right: 10px;
}

.logo-container.dark-mode {
  background-color: #fff;
}

.logo {
  width: 40px;
  height: 40px;
}

.title-text {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.dark-mode .title-text {
  color: #60a0ff;
}

.settings-container {
  margin: 20px 0;
  text-align: left;
}

@media (max-width: 600px) {
  .home {
    padding: 10px;
  }
  
  .title-text {
    font-size: 20px;
  }
  
  .logo-container {
    width: 40px;
    height: 40px;
  }
  
  .logo {
    width: 30px;
    height: 30px;
  }
}
</style>
