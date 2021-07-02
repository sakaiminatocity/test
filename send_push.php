<?php

## 関連Json読み込み
$json_path = './';
$json_files = Array(
  'area',
  'routineDetail',
  'notification'
);
$json_extension = '.json';
foreach($json_files as $json_file_name) {
  $json_data = file_get_contents($json_path.$json_file_name.$json_extension);
  $json_data = mb_convert_encoding($json_data, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
  $database[$json_file_name] = json_decode($json_data, true);
}

$area = $database['area'];
$routine_detail = $database['routineDetail'];
$notification = $database['notification'];

## 当日ゴミ回収エリア取得
$today_year = intval(date(‘Y’));
$today_month = intval(date(‘n’)) - 1;
$today_day = intval(date(‘j’));
$today_week = intval(date(‘w’));
$first_week = intval(date(‘w’, mktime(0, 0, 0, 1, $today_month + 1, $today_year)));
$to_year = ($today_month  < 8) ? $today_year  : $today_year  + 1;
$month_list = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
$week_list = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

$area_id_array = [];
$send_area_id = '';

foreach($area_rec as $area) {
  $area_id = $area_rec['id'];
  $routine_id = $area_rec['routineId'];
  foreach($routine_detail_rec as $routine_detail) {
    $date_count = 0;
    $val_week = $first_week;
    $week_count = [0, 0, 0, 0, 0, 0, 0];
    if ($routine_detail_rec['routineId'] == $routine_id) {
      if ($routine_detail_rec['irregularFlag'] == 0) {
        if ($routine_detail_rec['year'] === $to_year) {
          if ($routine_detail_rec['month' + ($today_month + 1)] == 1) {
            while ($date_count < $month_list[$today_month]) {
              $week_count[$val_week]++;
              if ($routine_detail_rec['week'+ $week_count[$val_week]] === 1) {
                if ($routineDetailRecord['day'+ $week_list[$today_week]] === 1) {
                  if ($today_day === $date_count) {
                    if (array_search($area_id, $area_id_array)) {
                      $area_id_array[] = $area_id;
                    }
                  }
                }
              }
              $val_week++;
              if ($val_week === 7) {
                $val_week = 0;
              }
              $date_count++;
            }
          }
        }
      }
    }
  }
}

foreach($area_id_str as $area_id_array) {
  if ($send_area_id != '') {
    $send_area_id = $send_area_id.',';
  }
  $send_area_id = $send_area_id.$area_id_str;
}


## お知らせ取得

$today_date = intval(date("Ymd"));

$send_notification_id_array = [];
$send_notification_id = '';

foreach($notification_rec as  $notification) {
  if (
    (intval($notification_rec['beginDate']) <= $today_date) ||
    (intval($notification_rec['endDate']) >= $today_date)
  ) {
    $send_notification_id_array[] = $notification_rec['id'];
  }
}

foreach($send_notification_id_str as $send_notification_id_array) {
  if ($send_notification_id!= '') {
    $send_notification_id = $send_notification_id.',';
  }
  $send_notification_id = $send_notification_id.$send_notification_id_str;
}

$title = '5374.jp -sakaiminato-';
$body = '';
$url= '<APP URL>';
$token = '<登録トークン>';
$server_key = '<サーバーキー>';

$json = '{
  "data":{"title": "'.$title.'","body": "'.$body.'", "click_action": "'.$url.'", "area": "'.$send_area_id.'", "noti": "'.$send_notification_id.'"},
  "to": "'.$token.'"
}';

$ch = curl_init();

$headers = array(
    'Content-Type: application/json',
    'Authorization: key='.$server_key
);

curl_setopt_array($ch, array(
    CURLOPT_URL => 'https://fcm.googleapis.com/fcm/send',
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POSTFIELDS => $json
));

$response = curl_exec($ch);

echo $response;

curl_close($ch);
