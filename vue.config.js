const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/maimatch_web2/' : '/',
  
  // Configure the development server
  devServer: {
    headers: {
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
    }
  },

  // Configure the build output
  chainWebpack: config => {
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
            publicPath: process.env.NODE_ENV === 'production' ? '/maimatch_web2/' : '/'
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
            content: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
          }
        }
        // Configure base URL for assets
        args[0].base = process.env.NODE_ENV === 'production' ? '/maimatch_web2/' : '/'
        return args
      })
  }
})
