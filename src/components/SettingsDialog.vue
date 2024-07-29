<template>
  <el-dialog title="环境变量设置" :visible.sync="dialogVisible" width="90%" custom-class="settings-dialog">
    <el-form :model="settings" label-width="120px" size="small">
      <el-form-item label="API 基础URL">
        <el-input v-model="settings.VUE_APP_API_BASE_URL" placeholder="请输入 API 基础URL"></el-input>
      </el-form-item>
      <el-form-item label="API 密钥">
        <el-input v-model="settings.VUE_APP_API_KEY" show-password placeholder="请输入 API 密钥"></el-input>
      </el-form-item>
      <el-form-item label="翻译 API URL">
        <el-input v-model="settings.VUE_APP_TRANSLATE_API_URL" placeholder="请输入翻译 API URL"></el-input>
      </el-form-item>
      <el-form-item label="TTS API URL">
        <el-input v-model="settings.VUE_APP_TTS_API_URL" placeholder="请输入 TTS API URL"></el-input>
      </el-form-item>
      <el-form-item label="模型列表">
        <el-input v-model="settings.VUE_APP_MODELS" placeholder="请输入模型列表，用逗号分隔"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="resetSettings" size="small">重置</el-button>
      <el-button type="primary" @click="saveSettings" size="small">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'SettingsDialog',
  data() {
    return {
      dialogVisible: false,
      settings: {
        VUE_APP_API_BASE_URL: '',
        VUE_APP_API_KEY: '',
        VUE_APP_TRANSLATE_API_URL: '',
        VUE_APP_TTS_API_URL: '',
        VUE_APP_MODELS: '',
      },
    };
  },
  methods: {
    showDialog() {
      this.loadSettings();
      this.dialogVisible = true;
    },
    loadSettings() {
      Object.keys(this.settings).forEach(key => {
        this.settings[key] = localStorage.getItem(key) || '';
      });
    },
    saveSettings() {
      Object.keys(this.settings).forEach(key => {
        if (this.settings[key]) {
          localStorage.setItem(key, this.settings[key]);
        } else {
          localStorage.removeItem(key);
        }
      });
      this.dialogVisible = false;
      this.$emit('settings-updated');
    },
    resetSettings() {
      Object.keys(this.settings).forEach(key => {
        localStorage.removeItem(key);
        this.settings[key] = '';
      });
    },
  },
};
</script>

<style>
.settings-dialog .el-dialog__body {
  padding-top: 10px;
}

.settings-dialog .el-form-item {
  margin-bottom: 15px;
}

@media (max-width: 600px) {
  .settings-dialog .el-dialog {
    width: 90% !important;
  }
  
  .settings-dialog .el-form-item__label {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 5px;
  }
  
  .settings-dialog .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
