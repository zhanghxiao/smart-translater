<template>
  <div class="chat-dialog">
    <el-button class="chat-button" icon="el-icon-chat-dot-round" circle @click="openChat"></el-button>
    <el-dialog
      title="与AI助手对话"
      :visible.sync="showChat"
      :append-to-body="true"
      :close-on-click-modal="false"
      :modal="true"
      width="80%"
      class="chat-window"
      @close="closeChat"
    >
      <div class="chat-container">
        <div class="chat-header">
          <el-select v-model="selectedModel" placeholder="选择模型">
            <el-option v-for="model in models" :key="model" :value="model">{{ model }}</el-option>
          </el-select>
        </div>
        <div class="chat-body" ref="chatBody">
          <div v-for="message in messages" :key="message.id" :class="['message', message.role]">
            <div class="avatar" :class="message.role"></div>
            <div class="content">
              <MarkdownRenderer :content="message.content" />
            </div>
          </div>
        </div>
        <div class="input-container">
          <el-input
            v-model="userInput"
            placeholder="输入消息..."
            @keyup.enter.native="sendMessage"
          >
            <el-button slot="append" icon="el-icon-s-promotion" @click="sendMessage">发送</el-button>
          </el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

export default {
  name: 'ChatDialog',
  components: {
    MarkdownRenderer
  },
  props: {
    initialMessage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showChat: false,
      userInput: '',
      messages: [],
      models: [],
      selectedModel: '',
      currentSession: [],
      localInitialMessage: this.initialMessage
    };
  },
  created() {
    this.loadSettings();
  },
  watch: {
    initialMessage(newValue) {
      this.localInitialMessage = newValue;
    }
  },
  methods: {
    loadSettings() {
      this.models = (localStorage.getItem('VUE_APP_MODELS') || process.env.VUE_APP_MODELS || '').split(',').map(model => model.trim());
      this.selectedModel = this.models[0] || 'gpt-4o-mini';
    },
    getEnvVar(key) {
      return localStorage.getItem(key) || process.env[key];
    },
    openChat() {
      this.currentSession = [
        { 
          role: 'system', 
          content: `You are a helpful assistant. The following message is a translation result. Please analyze and discuss it: "${this.localInitialMessage}"`
        }
      ];
      if (this.localInitialMessage) {
        this.messages = [{ id: Date.now(), role: 'assistant', content: this.localInitialMessage }];
        this.currentSession.push({ role: 'assistant', content: this.localInitialMessage });
      } else {
        this.messages = [];
      }
      
      this.$nextTick(() => {
        this.showChat = true;
        setTimeout(() => {
          if (this.$refs.chatBody) {
            this.$refs.chatBody.scrollTop = this.$refs.chatBody.scrollHeight;
          }
        }, 100);
      });
    },
    closeChat() {
      if (this.currentSession.length > 1) {
        this.saveChatHistory();
      }
      this.currentSession = [];
    },
    async sendMessage() {
          if (!this.userInput.trim()) return;
        
          const userMessage = { id: Date.now(), role: 'user', content: this.userInput };
          this.messages.push(userMessage);
          this.currentSession.push({ role: 'user', content: this.userInput });
          this.userInput = '';
        
          const assistantMessage = { id: Date.now() + 1, role: 'assistant', content: '' };
          this.messages.push(assistantMessage);
        
          try {
            const response = await fetch('/api/translateWithLLM', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: this.currentSession.slice(-12), // 保留最新的6次对话记录（12条消息）
                stream: true,
                model: this.selectedModel,
                temperature: 0.5,
                presence_penalty: 2
              })
            });
        
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';
         // eslint-disable-next-line no-constant-condition
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n').filter(line => line.trim());
              for (const line of lines) {
                if (line === 'data: [DONE]') {
                  this.currentSession.push({ role: 'assistant', content: result });
                  // 保留最新的6次对话记录
                  if (this.currentSession.length > 13) { // 13 = 1 (system) + 12 (6 user + 6 assistant)
                    this.currentSession = [
                      this.currentSession[0],
                      ...this.currentSession.slice(-12)
                    ];
                  }
                  return;
                }
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                      result += data.choices[0].delta.content;
                      assistantMessage.content = result;
                      this.$forceUpdate();
                      this.scrollToBottom();
                    }
                  } catch (error) {
                    console.error('Error parsing stream data:', error);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error:', error);
            assistantMessage.content = '对不起，我无法处理您的请求。';
            this.currentSession.push({ role: 'assistant', content: '对不起，我无法处理您的请求。' });
          }
        },
        scrollToBottom() {
          this.$nextTick(() => {
            const chatBody = this.$refs.chatBody;
            chatBody.scrollTo({
              top: chatBody.scrollHeight,
              behavior: 'smooth'
            });
          });
        },
        saveChatHistory() {
          const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
          history.unshift({
            messages: this.currentSession,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('chatHistory', JSON.stringify(history.slice(0, 10)));
        },
        restoreChat(messages) {
          this.currentSession = messages;
          this.messages = messages.filter(msg => msg.role !== 'system').map((msg, index) => ({
            id: Date.now() + index,
            role: msg.role,
            content: msg.content
          }));
          this.showChat = true;
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        },
        updateInitialMessage(message) {
          this.localInitialMessage = message;
        }
      }
    }
</script>
<style scoped>
.chat-dialog {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-button {
  width: 60px;
  height: 60px;
}

.chat-window {
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
}

.el-dialog__body {
  padding: 0 !important;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 60vh;
}

.chat-header {
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
}

.message {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 0 5px;
}

.avatar.user {
  background-color: #409EFF;
}

.avatar.assistant {
  background-color: #67C23A;
}

.content {
  padding: 4px 12px;
  border-radius: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.content :first-child {
  margin-top: 2px;
}

.content :last-child {
  margin-bottom: 2px;
}

.user .content {
  background-color: #409EFF;
  color: white;
  margin-left: auto;
}

.assistant .content {
  background-color: #67C23A;
  color: white;
  margin-right: auto;
}

.input-container {
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
}

.dark-mode .chat-header {
  background-color: #2c2c2c;
  border-bottom-color: #4a4a4a;
}

.dark-mode .chat-body {
  background-color: #1a1a1a;
}

.dark-mode .input-container {
  background-color: #2c2c2c;
  border-top-color: #4a4a4a;
}

.dark-mode .el-input__inner {
  background-color: #333;
  border-color: #555;
  color: #e0e0e0;
}

.dark-mode .el-button {
  background-color: #444;
  border-color: #555;
  color: #e0e0e0;
}
</style>
