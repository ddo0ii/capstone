// Express 기본 모듈
var express = require('express'),
    http = require('http'),
    https = require('https'),
    path = require('path');

// Express 미들웨어 
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler'),
    expressSession = require('express-session');

// 에러 핸들러 모듈
var expressErrorHandler = require('express-error-handler');

// 파일 시스템 모듈
var fs = require('fs');

// 도메인 충돌 예방하기 위함
var cors = require('cors');

// 설정을 위한 모듈 파일 로딩
var config = require('./config');

// 데이터베이스 스키마 파일들을 위한 모듈 파일 로딩
var database = require('./database/database');

// 익스프레스 객체
var app = express();

//console.log('config.server_port : %d', config.server_port);
app.set('port', config.server_port);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
 
// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

// 도메인 충돌 방지
app.use(cors());
//app.use(express.static(path.join(__dirname, '../')));

// 설정 파일의 정보를 이용해 라우팅 함수 설정
config.initRoutes(app);

// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

/===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database) {
		database.close();
	}
});

// Express 서버 시작
//sudo chmod 755 /etc/letsencrypt/live /etc/letsencrypt/archive
https.createServer({
    key: fs.readFileSync("/etc/letsencrypt/live/hdarts.kr/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/hdarts.kr/fullchain.pem")
},app).listen(app.get('port'), function(){
  console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

  // 데이터베이스 모듈 파일을 이용해 데이터베이스 초기화
  database.init(app, config);
});