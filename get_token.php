$ApiDID = 0775381337;
$password = 130890;

$str = file_get_contents("https://www.call2all.co.il/ym/api/Login?username=$ApiDID&password=$password");
$str = json_decode($str,true);

if ($str["responseStatus"] === "OK"){
    echo "ה-API Token שלך הוא: " . $str["token"];
} else {
    echo "שגיאה בקבלת ה-Token: " . $str["message"];
}
