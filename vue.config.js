const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/maimatch_web/' : '/',
  
  // Configure the development server
  devServer: {
    headers: {
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src 'self' *.firebaseapp.com *.firebase.com; connect-src 'self' *.firebaseio.com *.firebase.com wss://*.firebaseio.com;"
    }
  },

  // Configure the build output
  chainWebpack: config => {
    // Handle source files
    config.resolve.alias
      .set('@', path.resolve(__dirname, 'src'))
      .set('src', path.resolve(__dirname, 'src'))

    // Handle static assets
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        options = options || {}
        options.limit = 4096
        options.fallback = {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[hash:8].[ext]',
            publicPath: process.env.NODE_ENV === 'production' ? '/maimatch_web/' : '/'
          }
        }
        return options
      })

    // Configure HTML plugin
    config
      .plugin('html')
      .tap(args => {
        args[0].meta = {
          ...args[0].meta,
          'Content-Security-Policy': {
            'http-equiv': 'Content-Security-Policy',
            content: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-src 'self' *.firebaseapp.com *.firebase.com; connect-src 'self' *.firebaseio.com *.firebase.com wss://*.firebaseio.com;"
          }
        }
        // Configure base URL for assets
        args[0].base = process.env.NODE_ENV === 'production' ? '/maimatch_web/' : '/'
        return args
      })
  },

  // Configure output directory
  outputDir: 'dist',
  assetsDir: '',
  indexPath: 'index.html',

  // Source maps in production for debugging
  productionSourceMap: false,

  // Configure TypeScript compilation
  parallel: require('os').cpus().length > 1,
  css: {
    sourceMap: false
  }
})
