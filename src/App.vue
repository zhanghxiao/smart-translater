<template>
  <div id="app" :class="{ 'dark-mode': isDarkMode }">
    <HomeView :theme-changed="themeChanged" />
    <el-button 
      class="theme-toggle" 
      :icon="isDarkMode ? 'el-icon-sunny' : 'el-icon-moon'" 
      circle
      @click="toggleTheme"
    ></el-button>
  </div>
</template>

<script>
import HomeView from './views/HomeView.vue'

export default {
  name: 'App',
  components: {
    HomeView
  },
  data() {
    return {
        isDarkMode: false,
        themeChanged: 0
    }  
  },
  created() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    } else {
      this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  },
  methods: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      this.applyTheme();
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      this.themeChanged++; // 增加这行
    },
    applyTheme() {
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  transition: background-color 0.3s, color 0.3s;
}

.dark-mode {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.dark-mode .theme-toggle {
  background-color: #333;
  border-color: #555;
  color: #e0e0e0;
}

/* Dark mode styles for Element UI components */
.dark-mode .el-button:not(.el-button--primary) {
  background-color: #2c2c2c;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.dark-mode .el-input__inner,
.dark-mode .el-textarea__inner {
  background-color: #2c2c2c;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.dark-mode .el-select-dropdown,
.dark-mode .el-dropdown-menu {
  background-color: #2c2c2c;
  border-color: #4a4a4a;
}

.dark-mode .el-select-dropdown__item,
.dark-mode .el-dropdown-menu__item {
  color: #e0e0e0;
}

.dark-mode .el-select-dropdown__item.hover,
.dark-mode .el-select-dropdown__item:hover,
.dark-mode .el-dropdown-menu__item:hover {
  background-color: #3a3a3a;
}

.dark-mode .el-card {
  background-color: #2c2c2c;
  border-color: #4a4a4a;
  color: #e0e0e0;
}

.dark-mode .el-dialog,
.dark-mode .el-drawer {
  background-color: #2c2c2c;
  border-color: #4a4a4a;
}

.dark-mode .el-dialog__title,
.dark-mode .el-drawer__header {
  color: #e0e0e0;
}

.dark-mode .el-tabs__item {
  color: #b0b0b0;
}

.dark-mode .el-tabs__item.is-active {
  color: #409EFF;
}

.dark-mode .el-tabs__nav-wrap::after {
  background-color: #4a4a4a;
}

.dark-mode .el-dialog__body {
  color: #e0e0e0;
}

.dark-mode .el-form-item__label {
  color: #e0e0e0;
}
</style>
