<template>
  <div id="app">
    <HomeView />
    <SettingsDialog :visible.sync="showSettings" @settings-updated="updateSettings" />
  </div>
</template>

<script>
import HomeView from './views/HomeView.vue'
import SettingsDialog from './components/SettingsDialog.vue'

export default {
  name: 'App',
  components: {
    HomeView,
    SettingsDialog
  },
  data() {
    return {
      showSettings: false
    }
  },
  methods: {
    updateSettings(newSettings) {
      this.$root.$data.env = newSettings;
    }
  }
}
</script>