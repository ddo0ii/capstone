var webPush = require('web-push');

// timestamp 가져와서 seoul에 저장. DB 저장시 timezone을 서울로 변경
//var moment = require('moment');
//var seoul = require('moment-timezone');
// 타임스탬프 가져오기
//seoul = moment(moment().format());

// /process/addSub를 처리
var addSub = function(req, res){
    console.log('subscription 모듈 안에 있는 addSub 호출됨. payload: '+req.body['payload']);
    
    var subscription = req.body['subscriptionJson'];
    
    dupSub(req, res, function(err, result){
        if(result == 1){
            //중복
            console.log('중복발생. insert 취소');
            res.end();
        }else{
            //중복x
            console.log('중복없음. insert 진행');
            addDB(req, res);    
        }
    });
}

var dupSub = function(req, res, callback){
    var database = req.app.get('database');
    
    var dupSub = JSON.parse(req.body['subscriptionJson']);
    var endpoint = dupSub.endpoint;
    
    if(database.db){
        database.db.connect(function(err){
           var sql = "SELECT subscription FROM Customer WHERE JSON_EXTRACT(subscription, '$.endpoint') = ?" 
           var value = [
               endpoint
           ];
           database.db.query(sql, value, function(err, result){
              if(err) throw err;
               if(result.length>0){
                   callback(null, 1);
               }else{
                   callback(null, 0);
               }
           });
        });
    }
}

var addDB = function(req, res){
    console.log('subscription 모듈 안에 있는 addDB 호출됨.');
        // 데이터베이스 객체 참조
        var database = req.app.get('database');

        if(database.db){
            database.db.connect(function(err){
                console.log('addDB 함수 안에서 DB 연결됨.');
                console.log('추가 요청 domain: ',req.body['domain']);
                
                var cafe_sql = req.body['addCafeDBSql'];
                var cafe_value = req.body['addCafeDBValue'].split('&');
                
                var cafe_values= [cafe_value];
                
                database.db.query(cafe_sql, [cafe_values], function(err, result){
                   if(err) throw err;
                    console.log('CafeDB insert 완료!');
                    
                    var event_sql = req.body['addEventDBSql'];
                    var event_value = req.body['addEventDBValue'].split('&');
                    var event_values = [event_value];
                    
                    database.db.query(event_sql, [event_values], function(err, result){
                        if(err) throw err;
                        console.log('EventDB insert 완료!');
                        
                        //관리자에게 새로운 등록을 알림.
                        var sql2 = "SELECT * FROM AdminCafe WHERE subscription IS NOT NULL";
                        var value2 = [];
                        database.db.query(sql2, value2, function(err, result2){
                         if(err) throw err;
                         console.log('해당 관리자 찾음.');

                         // 해당 Obj에게 푸시
                        if(result2.length>0){
                           push2Admin(result2, req, res);
                        }
                        });
                    })
                 });
            });  
        }
        res.end();
}


// /process/delSub를 처리
var delSub = function(req,res){
    console.log('subscripton 모듈 안에 있는 delsub 호출됨.');
    
    var database = req.app.get('database');
    var delsub = JSON.parse(req.body['subscriptionJson']);
    
    if(database.db){
        database.db.connect(function(err){
           console.log('delDB 함수 안에서 DB 연결됨.');
            var cafe_sql = req.body['delCafeDBSql'];
            var value =[
                delsub.endpoint
            ];
            database.db.query(cafe_sql, value, function(err, result){
               if(err) throw err;
                console.log('CafeDB delete 완료!');
                
                var event_sql = req.body['delEventDBSql'];
                var value2 =[
                    delsub.endpoint
                ];
                database.db.query(event_sql, value2, function(err, result){
                   if(err) throw err;
                    console.log('EventDB delete 완료!');
                });
            });
        });
    }
    res.end();
}

// /process/sendPush 처리
var sendPush = function(req, res){
    console.log('subscription 모듈 안에 있는 sendPush 호출됨');
    
    var idx = req.body['idx'];
    console.log('푸시요청 idx: ' + JSON.stringify(idx));
    
    // DB에서 해당 객체 찾기
    findClient(req,res);
}

var findClient = function(req, res){
    console.log('subscription 모듈 안에 있는 findClient 호출됨.');
    
    var database = req.app.get('database');
    
    if(database.db){
        database.db.connect(function(err){
           console.log('findClient 함수 안에서 DB 연결됨.');
            
            if(req.body['tag']==='event'){
                var sql = req.body['findClientSql'];
                
                database.db.query(sql, function (err, result) {
                if (err) throw err;
                console.log('EVENT TAG: 해당 Obj 찾음.');
                //console.log("result: " + result);
                //console.log("result length: " + result.length);
                    
                // 해당 Obj에게 푸시
                push2Client(req, result, res, 0);
            });
            }else{
                var sql = "SELECT * FROM Customer WHERE idx=?";
                var value = [
                    req.body['idx']
                ];
                database.db.query(sql, value, function(err, result){
                    if(err) throw err;
                    console.log('CAFE TAG: 해당 Obj 찾음.');
                
                    // 해당 Obj에게 푸시
                    push2Client(req, result, res, 1);
                });
            }
        });
    }
}

var push2Client = function(req, result, res, tag){
    console.log('subscription 모듈 안에 있는 push2Client 호출됨.');
 
    var vapidPublicKey='BOjvSuytEQTw1wjuCnD8vWcwC8OUM7FI35hvHW_JUIuP9DGQ6cqD6N-6amGLEt-CQ-UX8Xk0YZN5nqZdBX1Veak';
    var vapidPrivateKey='abvupHnrar69iH0OeYqtAzNI_yqdDxKQJQTEMUNr5_A';
    
    var payloadJSON = new Object();
    if(tag == 0){
        console.log('event: ' + req.body['idx'] +', '+req.body['title']+', '+req.body['content']);
        payloadJSON.tag = "event";
        payloadJSON.idx = req.body['idx'];
        payloadJSON.title = req.body['title'];
        payloadJSON.content = req.body['content'];
    }else if(tag == 1){
        //console.log('Tag는 cafe');
        payloadJSON.tag = "cafe";
    }
    var payloadString = JSON.stringify(payloadJSON);
    
    for(var i=0; i<result.length; i++){
        var pushSubscription = JSON.parse(result[i].subscription);
        console.log('pushsubscription: ' +JSON.stringify(result[i].subscription));

        var payload =payloadString;
        var options = {
                    TTL: 60,
                    vapidDetails: {
                    subject: 'mailto:dmdwns67@naver.com',
                    publicKey: vapidPublicKey,
                    privateKey: vapidPrivateKey
                        }
                    };

        //push2Client
        webPush.sendNotification(
            pushSubscription,
            payload,
            options
        );
        res.end();
    }    
    
    console.log('Push 전송 완료!');
}

// process/reception 처리
var reception = function(req, res){
    console.log('subscription 모듈 안에 있는 reception 호출됨.');
    var database = req.app.get('database');
    var confirmedSub = JSON.parse(req.body['subscriptionJson']);
    var date = req.body['dateTime'];
    console.log('dateTime:'+date);
    if(database.db){
        database.db.connect(function(err){
           var sql = "UPDATE Customer SET reception = '수신 확인',time=?,subscription=? WHERE JSON_EXTRACT(subscription, '$.endpoint') = ?"; 
            var value = [
                date,
                req.body['subscriptionJson'],
                confirmedSub.endpoint
            ];
            
            database.db.query(sql, value, function(err, result){
               if(err) throw err;
               console.log('reception 변경 완료!');
                
                // 관리자를 찾아서 푸시 알림: 새로고침 요청
                var sql2 = "SELECT * FROM AdminCafe WHERE subscription IS NOT NULL";
                var value2 = [
                    
                ];
                database.db.query(sql2, value2, function(err, result2){
                    if(err) throw err;
                    console.log('해당 Obj 찾음.');
                
                    // 해당 Obj에게 푸시
                    if(result2.length>0){
                        push2Admin(result2, req, res);
                    }
                });
            });
        });
    }
    res.end();
}

var push2Admin = function(result, req, res){
    console.log('subscription 모듈 안에 있는 push2Admin 호출됨.');
    console.log('payload:'+req.body['payload']);
    
    for(var num in result){
            //console.log('pushsubscription: ' +JSON.stringify(result[num].subscription));
            var pushSubscription = JSON.parse(result[num].subscription);

            var vapidPublicKey='BOjvSuytEQTw1wjuCnD8vWcwC8OUM7FI35hvHW_JUIuP9DGQ6cqD6N-6amGLEt-CQ-UX8Xk0YZN5nqZdBX1Veak';
            var vapidPrivateKey='abvupHnrar69iH0OeYqtAzNI_yqdDxKQJQTEMUNr5_A';
            var payload =req.body['payload'];
            var options = {
                        TTL: 60,
                        vapidDetails: {
                        subject: 'mailto:dmdwns67@naver.com',
                        publicKey: vapidPublicKey,
                        privateKey: vapidPrivateKey
                            }
                        };

            //push2Client
            webPush.sendNotification(
                pushSubscription,
                payload,
                options
            );
    }
    console.log('Push 전송 완료!');
    res.end(); 
}

module.exports.addSub = addSub;
module.exports.delSub = delSub;
module.exports.sendPush = sendPush;
module.exports.reception = reception;