module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'  // 这里不需要重写路径
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
