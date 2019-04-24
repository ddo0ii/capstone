<?php
	include_once "connectDB.php";
    $term = $_POST['term'];
    
    //오늘 날짜
    $today = date('Y-m-d H:i:s');
    
    if($today < $term){
        echo "<script>alert('과거 기간만 선택 가능합니다!');</script>";
        header("Refresh: 0; url='arrange.php'");
    }else{
        // Event DB에서도 지워야 하니까... 모든 구독객체 가져와서
        $rlt = $dbConnect->query("SELECT subscription FROM Customer WHERE time < '$term'");

        while($row=mysqli_fetch_array($rlt)){
            $sub=json_decode($row[0]);
            $endpoint = $sub->endpoint;

            // Event DB에서 지움
            $rlt3 = $dbConnect->query("delete from CustomerEvent where JSON_EXTRACT(subscription, '$.endpoint') ='$endpoint';");
            $row3=mysqli_fetch_array($rlt3);
        }
    }
    // Cafe DB에서 지움
    $dbConnect->query("DELETE FROM Customer WHERE time < '$term'");

    echo "<script>alert('오래된 미수신 상태의 구독자들을 정리하였습니다!');</script>";
    
?>
<meta http-equiv="refresh" content="0 url=../html/control.html" />
