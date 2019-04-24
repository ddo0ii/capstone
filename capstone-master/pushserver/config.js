// 사용자 관련 모듈 불러오기
var subscription = require('./routes/subscription');
var admin = require('./routes/admin');

module.exports = {
    server_port: 3000,
    db_info:{
        host:'localhost',
        port: '3306',
        user: 'root',
        password: '1607',
        database: 'ChungUlLim'
    },
    initRoutes: function(app){
        console.log('initRoutes() 호출됨.');
        
        // 구독자 추가
        app.post('/process/addSub', subscription.addSub);
        
        // 구독자 삭제
        app.post('/process/delSub', subscription.delSub);
        
        // 푸시메시지 요청 받기
        app.post('/process/sendPush', subscription.sendPush);
        
        // reception 변경 요청
        app.post('/process/reception', subscription.reception);
        
        // 관리자 추가/삭제
        app.post('/process/Admin', admin.admin);
    }
}