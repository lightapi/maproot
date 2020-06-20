const proxy = require('http-proxy-middleware');
const cors = require('cors');

module.exports = function(app) {
  var corsOptions = {
    origin: 'https://devsignin.lightapi.net',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cors(corsOptions));
  app.use(proxy('/portal/command', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/portal/query', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/client', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/code', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/key', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/refresh_token', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/service', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/token', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/oauth2/user', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/authorization', { target: 'https://local.lightapi.net', secure: false }));
  app.use(proxy('/logout', { target: 'https://local.lightapi.net', secure: false }));
};
