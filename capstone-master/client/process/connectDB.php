<?php
    $host = "localhost";
    $user = "root";
    $pw ="1607";
    $dbName ="ChungUlLim";
    $dbConnect=new mysqli($host, $user, $pw, $dbName);
    $dbConnect->set_charset("utf8");
    $dbh=new PDO("mysql:host=localhost;dbname=$dbName;charset=utf8",$user,$pw);

    if(mysqli_connect_errno()){
         echo "<script>console.log('" . $dbName . "데이터베이스 접속 실패!: " . mysqli_connect_error() . "' );</script>";
    }
    else{
         echo "<script>console.log('" . $dbName . " 데이터베이스 접속 성공!');</script>";
    }
?>