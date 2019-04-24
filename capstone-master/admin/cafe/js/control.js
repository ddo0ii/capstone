/*
작성 : 김응준
날짜 : 2018-1-23
*/

// SW 객체
var swRegistration = null;

// VAPID 공개키
var vapidPublicKey = 'BOjvSuytEQTw1wjuCnD8vWcwC8OUM7FI35hvHW_JUIuP9DGQ6cqD6N-6amGLEt-CQ-UX8Xk0YZN5nqZdBX1Veak';
var applicationServerKey = urlB64ToUint8Array(vapidPublicKey);

var regadminbtn = document.querySelector('#regAdmin-btn'); // 관리자 등록 버튼
var initform = document.querySelector('#initform'); // 마감 form
var isSubscribed = false; // 구독 상황 체크

if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
}

// 서비스워커 등록
if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('/admin/cafe/sw-admin.js')
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
            regadminbtn.checked = false;
        }
    });
    
    // 새로고침 시 isSubscribed 갱신
    swRegistration.pushManager.getSubscription()
    .then(function(subscription){
        if(subscription){
          console.log('이미 구독되어 있음.');
          isSubscribed = true;
        }
    });
    
    regadminbtn.addEventListener('change', function(){
       //regadminbtn.checked = true;        
        
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
        
        $.ajax({
            type: 'POST',
            url: 'https://hdarts.kr:3000/process/Admin',
            async: true, //비동기식
            contentType: 'application/json',
            data: JSON.stringify({
                "subscriptionJson": JSON.stringify(subscription),
                "tag": 'add',
                "currentUserID": currentUserID
            }),
            dataType:'json',
            processData: true,
            success: function(msg){
                alert(msg);
                console.log('Subscription 전송!');
            }
          });
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
                url: 'https://hdarts.kr:3000/process/Admin',
                contentType: 'application/json',
                async: true,
                data: JSON.stringify({
                    "subscriptionJson": JSON.stringify(delSub),
                    "tag": 'delete',
                    "currentUserID": currentUserID
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
      regadminbtn.checked = false;
      
      return;
    }

    //regadminbtn.checked;
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

initform.addEventListener('submit',function(e){
    var confirminit = confirm('관리자등록 해제와 주문이 없음을 확인하셨습니까?');
            if(!confirminit){
                e.preventDefault();
            }
})

