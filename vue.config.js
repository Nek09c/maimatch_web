const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/maimatch_web/' : '/',
  
  // Configure the development server
  devServer: {
    headers: {
      'Content-Security-Policy': `
        default-src 'self' http://localhost:* http://127.0.0.1:*;
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://*.firebaseapp.com https://apis.google.com;
        connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
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
            content: process.env.NODE_ENV === 'production' 
              ? `default-src 'self' https://*.github.io; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.github.io https://www.gstatic.com https://*.firebaseapp.com https://apis.google.com; connect-src 'self' https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com; style-src 'self' 'unsafe-inline' https://*.github.io; img-src 'self' data: https: blob:; font-src 'self' data:; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;`
              : `default-src 'self' http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.gstatic.com https://*.firebaseapp.com https://apis.google.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;`
          }
        }
        return args
      })
  }
})
