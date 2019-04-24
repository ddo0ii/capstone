<?php
	include "connectDB.php";
	//header('Content-Type: text/html; charset=utf-8');

	$bno = $_GET['idx'];
	$rlt = $dbConnect->query("delete from EventList where idx='$bno';");
	echo "<script>alert('삭제되었습니다.');</script>";
    $row=mysqli_fetch_array($rlt);
?>
<meta http-equiv="refresh" content="0 url=../html/control.html" />
