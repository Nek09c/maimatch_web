const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  
  // Configure the development server
  devServer: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-eval' https://www.gstatic.com https://*.firebaseapp.com;
        connect-src 'self' https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com https://*.googleapis.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        frame-src 'self' https://*.firebaseapp.com https://*.firebase.com;
      `.replace(/\s+/g, ' ').trim()
    }
  },

  // Configure the build output
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].meta = {
          ...args[0].meta,
          'Content-Security-Policy': {
            'http-equiv': 'Content-Security-Policy',
            content: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' https://www.gstatic.com https://*.firebaseapp.com;
              connect-src 'self' https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com https://*.googleapis.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              frame-src 'self' https://*.firebaseapp.com https://*.firebase.com;
            `.replace(/\s+/g, ' ').trim()
          }
        }
        return args
      })
  }
})
