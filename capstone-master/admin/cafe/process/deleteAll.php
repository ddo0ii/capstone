<?php
	include_once "connectDB.php";
    
    // Event DB에서도 지워야 하니까... 모든 구독객체 가져와서
    $rlt = $dbConnect->query("SELECT subscription FROM Customer");
    
    while($row=mysqli_fetch_array($rlt)){
        $sub=json_decode($row[0]);
        $endpoint = $sub->endpoint;
  
        // Event DB에서 지움
        $rlt3 = $dbConnect->query("delete from CustomerEvent where JSON_EXTRACT(subscription, '$.endpoint') ='$endpoint';");
        $row3=mysqli_fetch_array($rlt3);
        echo '==========================';
    }

    // Cafe DB에서 지움
    $dbConnect->query("DELETE FROM Customer");

    echo "<script>alert('전체 삭제되었습니다.');</script>";
?>
<meta http-equiv="refresh" content="0 url=../html/control.html" />