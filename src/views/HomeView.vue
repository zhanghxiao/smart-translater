<template>
  <div class="home">
    <h1 class="title">
      <img src="@/assets/deep.png" alt="Logo" class="logo">
      智能翻译助手
    </h1>
    <TranslationCard @translation-done="onTranslationDone" />
    <ChatDialog :initial-message="translatedText" ref="chatDialog" />
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
    HistoryDrawer
  },
  data() {
    return {
      translatedText: ''
    }
  },
  methods: {
    onTranslationDone(text) {
      this.translatedText = text;
      // 不自动打开对话框，但更新初始消息
      this.$refs.chatDialog.updateInitialMessage(text);
    },
    onRestoreChat(messages) {
      this.$refs.chatDialog.restoreChat(messages);
    }
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