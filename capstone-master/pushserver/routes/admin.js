
/* 관리자 모듈 */
var webPush = require('web-push');
// timestamp 가져와서 seoul에 저장. DB 저장시 timezone을 서울로 변경
var moment = require('moment');
var seoul = require('moment-timezone');

// 관리자 요청 처리
var admin = function(req, res){
    console.log('subscription 모듈 안에 있는 admin 호출됨.');
    var tag = req.body['tag'];
    
    if(tag == 'add'){
        addAdmin(req,res);
    }else if(tag == 'delete'){
        delAdmin(req,res);
    }
}

var addAdmin = function(req, res){
    console.log('subscription 모듈 안에 있는 addAdmin 호출됨.');
    
    var subscription = req.body['subscriptionJson'];
    var currentUserID = req.body['currentUserID'];
    var database = req.app.get('database');
    
    if(database.db){
        database.db.connect(function(err){
            seoul = moment(moment().format());
            var sql = "UPDATE AdminCafe SET subscription=?, time=? WHERE id=?";
            var values =[
                subscription,
                seoul.tz('Asia/Seoul').format('HH:mm:ss'),
                currentUserID
            ];
            database.db.query(sql, values, function(err,result){
                if(err) throw err;
                
                console.log(currentUserID + ' 의 구독객체를 등록했습니다.');
                
            })
        })
    }
    res.end();
}

var delAdmin = function(req,res){
    console.log('subscripton 모듈 안에 있는 delAdmin 호출됨.');
    
    var database = req.app.get('database');
    var currentUserID = req.body['currentUserID'];
    
    if(database.db){
        database.db.connect(function(err){
           console.log('delDB 함수 안에서 DB 연결됨.');
            var sql = "UPDATE AdminCafe SET subscription = null WHERE id=?";
            var value = [
                currentUserID
            ];
            database.db.query(sql, value, function(err, result){
                if(err) throw err;
                
                console.log(currentUserID + ' 의 구독객체를 삭제합니다.');
            })
        });
    }
    res.end();
}
/* 관리자 모듈 END*/

module.exports.admin = admin;