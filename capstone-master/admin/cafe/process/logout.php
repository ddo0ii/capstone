<?php
    session_start();
    
	include_once "connectDB.php";
    
    $curUser = $_SESSION['auth'];

    $rlt = $dbConnect->query("UPDATE AdminCafe SET subscription=null WHERE id='$curUser'");
    
    if($rlt === true){
        unset($_SESSION['auth']);
        echo "<script>alert('로그아웃 되었습니다.');</script>";
        header("Refresh: 0; url='../html/login.html'");
    }else{
        unset($_SESSION['auth']);
        echo "로그아웃 에러: 구독값 초기화 실패".$dbConnect->error;
    }
?>