/* Larry 工作台 · Service Worker */
var CACHE_NAME = 'larry-workbench-v3.7.2';
var CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './quotes.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      // 逐个添加，任何一个失败都不阻塞
      return Promise.all(CORE_ASSETS.map(function(url){
        return cache.add(url).catch(function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k !== CACHE_NAME;
      }).map(function(k){
        return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  // 只处理 GET
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch(err){ return; }
  // 只处理同源资源（GitHub Pages 自己托管的），跨域的天气 API 不拦截
  if (url.origin !== location.origin) return;

  // HTML 用 network-first：联网时拿到新版就显示新版并更新缓存
  var isHTML = url.pathname.endsWith('/') ||
               url.pathname.endsWith('/index.html') ||
               (req.headers.get('accept') || '').indexOf('text/html') >= 0;

  if (isHTML){
    e.respondWith(
      fetch(req).then(function(res){
        if (res && res.status === 200){
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c){ c.put(req, clone).catch(function(){}); });
        }
        return res;
      }).catch(function(){
        return caches.match(req).then(function(c){
          return c || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // 其他静态资源（图标、背景图、quotes.json）用 cache-first
  e.respondWith(
    caches.match(req).then(function(cached){
      if (cached) return cached;
      return fetch(req).then(function(res){
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(c){ c.put(req, clone).catch(function(){}); });
        return res;
      });
    })
  );
});