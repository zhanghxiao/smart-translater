import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
Vue.config.productionTip = false;

// 获取环境变量
fetch('/')
  .then(response => {
    const encodedEnvVars = response.headers.get('X-Environment-Variables');
    if (encodedEnvVars) {
      const envVars = JSON.parse(atob(encodedEnvVars));
      Object.keys(envVars).forEach(key => {
        process.env[key] = envVars[key];
      });
    }
    
    new Vue({
      render: h => h(App),
    }).$mount('#app');
  })
  .catch(error => {
    console.error('Error fetching environment variables:', error);
    new Vue({
      render: h => h(App),
    }).$mount('#app');
  });