const CACHE='sodeystvie-v1.2.2-shell';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
});
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?.json()||{}}catch{data={body:event.data?.text()||'Новое событие УК «Содействие»'}}
  const title=data.title||'УК «Содействие»';
  const options={
    body:data.body||'Есть новое уведомление',
    icon:'./icon-192.png',
    badge:'./icon-192.png',
    tag:data.tag||`sodeystvie-${data.issue_id||Date.now()}`,
    renotify:true,
    data:{url:data.url||'./index.html',issue_id:data.issue_id||null}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./index.html',self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if('focus' in c){c.navigate(target).catch(()=>{});return c.focus()}}
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});
