<?php 
    $today = date('Y-m-d H:i:s');
?>
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
        .text-center{
            text-align: center;
        }
        tr{
            text-align: center;
        }
    </style>

    <div class="image"`>
        <br><br><br>
        <div class="container">
            <div class="starter-template">
                <h1 class = "hello">Arrange Page</h1>
            </div>
        </div><!-- /.container -->

        <!--event table-->
        <div class ="container">
        <div class = "jumbotron">
        <div id="push_edit">
          <form action="arrange_ok.php" method="post">
              
                    <label for="Time">현재 시각</label>
                   <input type="text" id="term" name="term"  value='<?php echo $today; ?>'>
                <p>가장 최근 알림을 수신한 시각이 위의 입력한 시각보다 이전인 구독자들은 더 이상 알림을 수신 못한다고 판단하여 구독자 정보를 삭제합니다.</p>

              <div class="bt_se">
                  <input type="submit" class="btn btn-default btn-sm" value="정리하기">
              </div>
          </form>
        </div>
        </div>
        </div>

    </div>

<script src="../../../bootstrap/js/jquery-3.3.1.min.js"></script>
<script src="../../../bootstrap/js/bootstrap.js"></script>

    </body>
</html>
