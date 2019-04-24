var CACHE_NAME = 'client-cache';
var urlsToCache = [
    '/',
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(	//프라미스를 사용하여 설치 소요 시간 및 설치 성공 여부를 확인
    caches.open(CACHE_NAME).then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('notificationclose', function(e) {
    var notification = e.notification;
    var primaryKey = notification.data.primaryKey;
    var idx = notification.data.idx;
    var tag = notification.data.tag;

    console.log('Closed notification: ' + primaryKey);
  });

  self.addEventListener('notificationclick', function(e) {
    var notification = e.notification;
    var primaryKey = notification.data.primaryKey;
    var tag = notification.data.tag;
    var idx = notification.data.idx;
    var action = e.action;

    if (action === 'close') {
      notification.close();
    } else {
      if(tag === 'cafe'){
            clients.openWindow('/client/html/' + primaryKey + '.html');
            notification.close();
      }else if(tag === 'event'){
            clients.openWindow('/client/html/' + primaryKey + '.html?idx=' + idx);
            notification.close();  
      }
    }
  });

self.addEventListener('push', function(e) {
    var myData = e.data.text();
    var plz = JSON.parse(myData);
    
    if(plz.tag === 'event'){
        var options = {
            body: plz.content,
            icon: '../images/alert.jpg',
            vibrate: [300,100,300], //테스트용
            //vibrate: [500, 700, 500, 700, 500, 700, 500, 700, 500],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: 'showEvent',
              tag: plz.tag,
              idx: plz.idx
            },
            actions: [
              {action: 'explore', title: '알림 확인',
                icon: '../images/checkmark.png'},
              {action: 'close', title: '알림 끄기',
                icon: '../images/xmark.png'},
            ]
        };
        e.waitUntil(
            self.registration.showNotification(plz.title, options)
        );
    }else if(plz.tag === 'cafe'){
        var options = {
            body: "카운터에서 음료를 수령해가시길 바랍니다:)",
            icon: '../images/pushicon-coffee.jpg',
            vibrate: [300,100,300], //테스트용
            //vibrate: [500, 700, 500, 700, 500, 700, 500, 700, 500],
            data: {
              dateOfArrival: Date.now(),
              primaryKey: 'confirmNotification',
              tag: plz.tag,
            },
            actions: [
              {action: 'explore', title: '알림 확인',
                icon: '../images/checkmark.png'},
              {action: 'close', title: '알림 끄기',
                icon: '../images/xmark.png'},
            ]
        };
        e.waitUntil(
            self.registration.showNotification('음료 제조완료', options)
        );
    }
});
