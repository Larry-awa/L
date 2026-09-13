/* Larry 工作台 · Service Worker */
var变量 CACHE_NAME = 'larry-workbench-v3.7.0';
var CORE_ASSETS核心资产 = [
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
      return Promise.all(CORE_ASSETS.map(function(url){      返回 Promise.all(CORE_ASSETS.映射(函数(url){
        return cache.add(url).catch(function(){});        返回 缓存.添加(网址).捕获(函数(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){self.addEventListener('activate', 函数(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k !== CACHE_NAME;
      }).map(function(k){
        return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })    }).然后(函数(){ 返回 self.clients客户端.claim声明(); })    }).然后(函数(){ 返回 self.clients客户端.claim声明(); })    }).然后(函数(){ 返回 self.clients客户端.claim声明(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  // 只处理 GET
  if (req.method !== 'GET') return;  如果 (req.method方法 !== 'GET') 返回;    如果 (req请求.method方法 !== 'GET') 返回;  如果 (req请求.method方法 !== 'GET') 返回;
  var变量 url网址;
  try { url = new URL(req.url); } catch(err){ return; }  尝试 { url = 新 URL(req.url); } 捕获(错误){ 返回; }  尝试 {url = newURL(req.); }捕获错误返回  尝试 { url网址 = 新 URL(req.url); } 捕获(错误){ 返回; }  尝试 { url = 新 URL(req.url); } 捕获(错误){ 返回; }  尝试 {url = newURL(req.); }捕获错误返回
  // 只处理同源资源（GitHub Pages 自己托管的），跨域的天气 API 不拦截
  if (url.origin !== location.origin) return;  如果 (url.origin !== location.origin) 返回;  如果 (url网址.origin原点 !== location位置.origin原点) 返回;  如果 (url网址.origin原点 !== location位置.origin原点) 返回;

  // HTML 用 network-first：联网时拿到新版就显示新版并更新缓存
  var isHTML = url.pathname.endsWith('/') ||
               url.pathname.endsWith('/index.html') ||
               (req.headers.get('accept') || '').indexOf('text/html') >= 0;

  if (isHTML){  如果 (是HTML){
    e.respondWith(
      fetch(req).then(function(res){
        if (res && res.status === 200){        如果 (res && res.status === 200){
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c){ c.put(req, clone).catch(function(){}); });          缓存.打开(缓存名称).然后(函数(c){ c.放入(请求, 克隆).捕获(函数(){}); });
        }
        return res;
      }).catch(function(){
        return caches.match(req).then(function(c){        返回 缓存.匹配(请求).然后(函数(c){
          return c || caches.match('./index.html');
        });
      })
    );
    return;    返回;
  }

  // 其他静态资源（图标、背景图、quotes.json）用 cache-first
  e.respondWith(  e.响应与(
    caches.match(req).then(function(cached){    缓存.匹配(请求).则(函数(缓存){    缓存.匹配(请求).然后(函数(缓存){    缓存.匹配(请求).则(函数(缓存){
      if (cached) return cached;      如果 (缓存) 返回 缓存;            如果 (缓存) 返回 缓存;      如果 (缓存) 返回 缓存;
      return fetch(req).then(function(res){      返回 获取(请求).然后(函数(响应){      返回 获取(请求).然后(函数(响应){      返回 获取(请求).然后(函数(响应){
        if (!res || res.status !== 200 || res.type === 'opaque') return res;        如果 (!res || res.status !== 200 || res.类型 === 'opaque') 返回 res;        如果 (!res || .status !== 200类型 === 'opaque')返回;
        var clone = res.clone();        变量 克隆 = 响应.克隆();
        caches.open(CACHE_NAME).then(function(c){ c.put(req, clone).catch(function(){}); });        缓存.打开(CACHE_NAME).然后(函数(c){ c.存储(req, 克隆).捕获(函数(){}); });        缓存.打开(缓存名称).然后(函数(c){ c.存储(请求, 克隆).捕获(函数(){}); });        缓存.打开(缓存名称).然后(函数(c){ c.存储(请求, 克隆).捕获(函数(){}); });
        return res;
      });
    })
  );
});
