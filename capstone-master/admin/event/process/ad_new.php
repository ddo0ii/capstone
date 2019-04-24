<!DOCTYPE html>
<html lang ="ko">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Set character encoding -->
  <meta charset="utf-8">
  <title>A_Push</title>
  <link rel = "stylesheet" href="../../../bootstrap/css/bootstrap.css">
</head>
<body>
    <style>
        body {
            margin: 0;
        }
        .image{
            position : relative;
            height: 726px;
            background: url(../../../images/darkcafeimage.jpg) no-repeat center center;
            -webkit-background-size: cover;
            -moz-background-size: cover;
            -o-background-size: cover;
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            height: calc(100vh);
            min-height: 200px;
        }
        .image.container{
        position:absolute;
        color:white;
        }
        .hello{
        color:white;
        font-size:3rem;
        text-align: center;
        }
        .push_edit{
        position : absolute;
        color : white;
        }
    
    </style>

    <div class="image"`>
        <br><br><br>
        <div class="container">
            <div class="starter-template">
                <h1 class = "hello">새로운 이벤트 등록</h1>
            </div>
        </div>

        <div class ="container">
        <div class = "jumbotron">
        <div id="push_edit">
        <form action="ad_new_ok.php" method="post" enctype="multipart/form-data">
           
        <div class="form-group">
          <label for="title">제목</label>
          <input type="text" class="form-control" id="title" name="title" placeholder="제목을 입력하세요.">
        </div>
        <div class="form-group">
          <label for="content">내용</label>
          <textarea class="form-control" id="content" name="content" rows="3" placeholder="내용을 입력하세요."></textarea>
        </div>
        <div class="form-group">
          <label for="term">진행기간</label>
          <input type="text" class="form-control" id="term" name="term" placeholder="2018-03-07 22:00:00">
    </div>
        <div class="form-group">
<input type="file" size=100 name="upload"><hr>
    </div>
<button type="submit" class="btn btn-primary pull-right">완료</button>
      </form>
      </div>
  </div>
  </div>
  </body>
  </html>
   
<script src="../../../bootstrap/js/jquery-3.3.1.min.js"></script>
<script src="../../../bootstrap/js/bootstrap.js"></script>

    </body>
</html>
