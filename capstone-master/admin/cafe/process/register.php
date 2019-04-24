<?php
	include_once "connectDB.php";

    $id = $_POST['username2'];
    $password = $_POST['password2'];
    $confirmpw = $_POST['confirm-password2'];
    $domain = $_POST['domain']; 

    if($password === $confirmpw){
        if($dbConnect->query("INSERT INTO AdminCafe(id, password, domain) VALUES ('$id', '$password', '$domain')") === TRUE){
            echo "<script>alert('회원가입 성공! 로그인 해주세요.')</script>";
        } 
    }else{
        echo "<script>alert('비밀번호 불일치!')</script>";
    }
    header("Refresh:0; url='../html/login.html'");
?>