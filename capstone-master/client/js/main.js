/*
작성 : 김응준
날짜 : 2018-1-23
*/

// SW 객체
var swRegistration = null;

// VAPID 공개키
var vapidPublicKey = 'BOjvSuytEQTw1wjuCnD8vWcwC8OUM7FI35hvHW_JUIuP9DGQ6cqD6N-6amGLEt-CQ-UX8Xk0YZN5nqZdBX1Veak';
var applicationServerKey = urlB64ToUint8Array(vapidPublicKey);

var pushbtn = document.querySelector('#push-btn'); // 진동벨 버튼
var isSubscribed = false; // 구독 상황 체크
var rebtn= false; // 사용자가 진동벨 확인 창에서 취소를 클릭할 시 true

if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
}

// 서비스워커 등록
if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('/client/sw-client.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg;
        
      initUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
} else {
    console.warn('Push messaging is not supported');
    pushbtn.textContent = '푸시 지원 불가';
}

function initUI(){
    console.log('initUI함수 실행');
    
    // 알림 권한 얻기
    Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
        if(status == 'denied'){
            pushbtn.checked = false;
        }
    });
    
    pushbtn.addEventListener('change', function(){
        if (isSubscribed) {
            console.log('구독자가 있으니 구독취소하기');
            unsubscribeUser();
        } else {
            console.log('구독자가 없으니 구독신청하기');
            subscribeUser();
        }
    });
}

function subscribeUser() {
     swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
    .then(function(subscription) {   
        console.log('User is subscribed:', subscription);
        isSubscribed = true;
        updateBtn();
        
        //server로 subscription 추가요청 전송
        console.log('Subscription 추가 요청 전송 시도. Json:'+JSON.stringify(subscription));
        var dateTime = getDatetime();
        
        $.ajax({
            type: 'POST',
            url: 'https://hdarts.kr:3000/process/addSub',
            async: true, //비동기식
            contentType: 'application/json',
            data: JSON.stringify({
                "subscriptionJson": JSON.stringify(subscription),
                "payload": '새로운 구독자 추가되었습니다.',
                "domain": 'hdarts.kr',
                "addEventDBSql": "INSERT INTO CustomerEvent(subscription, subscriptionDatetime, reception) VALUES ?",
                "addEventDBValue": JSON.stringify(subscription) + "&" + dateTime + "&수신대기",
                "addCafeDBSql": "INSERT INTO Customer(nickname, subscription, time, reception, domain) VALUES ?",
                "addCafeDBValue": "hdarts구독자&"+ JSON.stringify(subscription) +"&"+ dateTime + "&수신 대기&hdarts.kr"
            }),
            dataType:'json',
            processData: true,
            success: function(msg){
                alert(msg);
                console.log('Subscription 전송!');
            }
          });
         alert('웹브라우저 창을 닫으셔도 알림을 받으실 수 있습니다. 절전모드 시에는 서비스가 원활하지 않을 수 있습니다. 진동벨을 Off하시면 주문정보가 사라지게 되며 카운터에서 다시 주문하셔야 합니다.');
  
    })
    .catch(function(err) {
        if (Notification.permission === 'denied') {
            console.warn('Permission for notifications was denied');
        } else {
            console.error('Failed to subscribe the user: ', err);
        }
        updateBtn();
    }); 
}

var delSub={};    
    
function unsubscribeUser() {
      swRegistration.pushManager.getSubscription()
          .then(function(subscription) {
            if (subscription) {
                delSub = subscription;
                return subscription.unsubscribe();
            }
          })
          .catch(function(error) {
            console.log('Error unsubscribing', error);
          })
          .then(function() {
          
          console.log('User is unsubscribed');
            isSubscribed = false;
            updateBtn();
            
            //server로 subscription 삭제 요청 전송
            console.log('Subscription 삭제 요청 전송 시도... Json:'+JSON.stringify(delSub));
            $.ajax({
                type: 'POST',
                url: 'https://hdarts.kr:3000/process/delSub',
                contentType: 'application/json',
                async: true,
                data: JSON.stringify({
                    "subscriptionJson": JSON.stringify(delSub),
                    "payload": 'hdarts.kr구독자가 삭제되었습니다.',
                    "domain": 'hdarts.kr',
                    "delCafeDBSql":"DELETE FROM Customer WHERE JSON_EXTRACT(subscription, '$.endpoint') = ?",
                    "delEventDBSql":"DELETE FROM CustomerEvent WHERE JSON_EXTRACT(subscription, '$.endpoint') = ?"
                }),
                dataType:'json',
                processData: true,
                success: function(msg){
                    alert(msg);
                    console.log('Subscription 전송!');
                }
            });     
          });
}

function updateBtn() {
    console.log('updateBtn() 실행됨.');
    if (Notification.permission === 'denied') {
      pushbtn.textContent = 'Push Messaging Blocked';
      pushbtn.checked = true;
      
      return;
    }

    if (isSubscribed) {
        console.log('btn on으로 변경!');
        pushbtn.textContent = '진동벨 ON 상태';
    } else {
        console.log('btn off으로 변경!');
      pushbtn.textContent = '진동벨 OFF 상태';
    }
  }

function urlB64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function getDatetime() {
    var temp = new Date();
    var year = temp.getFullYear().toString();
    var month = pad(temp.getMonth() + 1, 2);
    var day = pad(temp.getDate(), 2);
    var hour = pad(temp.getHours(), 2);
    var min = pad(temp.getMinutes(), 2);
    var sec = pad(temp.getSeconds(), 2);
    var datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
    return datetime;
}

function pad(num, len) {
    var str = num.toString();
    while (str.length < len)
        str = '0' + str;
    return str
}