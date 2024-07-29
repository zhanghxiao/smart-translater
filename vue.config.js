module.exports = {
  devServer: {
    port: 7000,
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  publicPath: process.env.NODE_ENV === 'production' ? './' : './' ,
  chainWebpack: config => {
    config.plugin('html')
      .tap(args => {
        args[0].title = "Smart-Translater";
        return args;
      })
  }
}