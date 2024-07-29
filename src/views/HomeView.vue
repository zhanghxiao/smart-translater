<template>
  <div class="home">
    <h1 class="title">
      <img src="@/assets/deep.png" alt="Logo" class="logo">
      智能翻译助手
    </h1>
    <TranslationCard @translation-done="onTranslationDone" :key="settingsKey" />
    <div class="settings-container">
      <el-button 
        @click="showSettings" 
        class="settings-button" 
        type="primary" 
        icon="el-icon-setting"
      >
        自定义环境变量
      </el-button>
    </div>
    <ChatDialog :initial-message="translatedText" ref="chatDialog" :key="settingsKey" />
    <HistoryDrawer @restore-chat="onRestoreChat" />
    <SettingsDialog ref="settingsDialog" @settings-updated="onSettingsUpdated" />
  </div>
</template>


<script>
import TranslationCard from '@/components/TranslationCard.vue'
import ChatDialog from '@/components/ChatDialog.vue'
import HistoryDrawer from '@/components/HistoryDrawer.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'

export default {
  name: 'HomeView',
  components: {
    TranslationCard,
    ChatDialog,
    HistoryDrawer,
    SettingsDialog
  },
  data() {
    return {
      translatedText: '',
      settingsKey: 0
    }
  },
  methods: {
    onTranslationDone(text) {
      this.translatedText = text;
      this.$refs.chatDialog.updateInitialMessage(text);
    },
    onRestoreChat(messages) {
      this.$refs.chatDialog.restoreChat(messages);
    },
    showSettings() {
      this.$refs.settingsDialog.showDialog();
    },
    onSettingsUpdated() {
      this.settingsKey += 1;
    }
  }
}
</script>

<style scoped>
.settings-container {
  margin: 20px 0;
  text-align: left;
}

.settings-button {
  margin-bottom: 10px;
}


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

.logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

@media (max-width: 600px) {
  .home {
    padding: 10px;
  }
  
  .title {
    font-size: 1.5em;
  }
  
  .logo {
    width: 30px;
    height: 30px;
  }
}
</style>