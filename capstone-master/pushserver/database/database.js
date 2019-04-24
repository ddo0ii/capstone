//===== MySQL 데이터베이스를 사용할 수 있도록 하는 mysql 모듈 불러오기 =====//
var mysql = require('mysql');

var database = {};

// 초기화를 위해 호출하는 함수
database.init = function(app, config) {
	console.log('database init() 호출됨.');
	
	connect(app, config);
}

//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connect(app, config) {
	console.log('database connect() 호출됨.');
	
    // 데이터베이스 연결
    var conn = mysql.createConnection({
        host: config.db_info.host,
        user: config.db_info.user,
        password: config.db_info.password,
        port: config.db_info.port,
        database: config.db_info.database
    });
    
    // mysql 연결을 database 객체와 연결
    database.db = conn;
    
    database.db.on('error', console.error.bind(console,'mysql connection error.'));
    database.db.on('open', function(){
       console.log('DB에 연결되었습니다. : '+ config.db_info.database); 
    });
    database.db.on('disconnected', connect);
    
    app.set('database', database);
    console.log('database 객체가 app 객체의 속성으로 추가됨.');
};

// database 객체를 module.exports에 할당
module.exports = database;
