importScripts("https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js");
importScripts("https://www.gstatic.com/firebasejs/8.6.8/firebase-analytics.js");

const routMassageLabel = ['本日はゴミ回収の日です。', 'Today is the day of garbage collection.', 'Hôm nay là ngày thu gom rác.'];
const notiMassageLabel = ['新しいお知らせがあります。', 'I have a new announcement.', 'Tôi có một thông báo mới.'];

const firebaseConfig = {
  // FCM コードコピー
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

self.addEventListener("push", event => {
  console.log('Catch push signal.');
});


self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data))
});

messaging.setBackgroundMessageHandler( payload => {
  console.log(
    "[serviceworker.js] Received background message ",
    payload
  );
  const areaId = payload.data.area;
  const noti = payload.data.noti;

  let lang = 0;
  let areaId1 = 0;
  let areaId2 = -1;
  let confirmSetTim = 6;
  
  let messageBody = '';
  let areaIdArray = [];
  let notiArray = [];

  let notiIdFlag = [];

  let theTime = new Date();
  let nowHour = theTime.getHours();

  let routFlag = false;
  let notificationFlag = false;
  let timeFlag = false;

  let db = null;
  
  db = indexedDB.open('5374.jp-sakaiminato');
  
  db.onupgradeneeded = event => {
    console.log('db upgrade');
  }
  db.onsuccess = event => {
    console.log('db open success');
    let db = event.target.result;
    let trans = db.transaction('cache', 'readonly');
    let store = trans.objectStore('cache');
    lang = store.get('lang');
    areaId1 = store.get('areaId1');
    areaId2 = store.get('areaId2');
    confirmSetTim = store.get('confirmSetTim');
    db.close();
  }
  db.onerror = event => {
    console.log('db open error:' + event);
  }

  if (confirmSetTim === nowHour) { 
    timeFlag = true;
  }

  if (areaId !== '') {
    areaIdArray = areaId.split(',');
    if (areaId2 !== -1) {
      areaIdArray.forEach( areaIdStr => {
        if (parseInt(areaIdStr) === areaId2) {
          routFlag = true;
        }
      });
    } else {
      areaIdArray.forEach( areaIdStr => {
        if (parseInt(areaIdStr) === areaId1) {
          routFlag = true;
        }
      });
    }
  }

  if (routFlag) {
    messageBody = messageBody + routMassageLabel[lang]
  }

  if (noti !== '') {
    notiArray = noti.split(',');
    notiArray.forEach( notiStr => {
      db = indexedDB.open('5374.jp-sakaiminato');
  
      db.onupgradeneeded = event => {
        console.log('db upgrade');
      }
      db.onsuccess = event => {
        console.log('db open success');
        let db = event.target.result;
        let trans = db.transaction('cache', 'readonly');
        let store = trans.objectStore('cache');
        let notiIdFlag = store.get('notification-' + notiStr);
        db.close();
      }
      db.onerror = event => {
        console.log('db open error:' + event);
      }
    
      if ( (notiIdFlag === undefined) && (!notificationFlag)) {
        notificationFlag = true;
      }

      db = indexedDB.open('5374.jp-sakaiminato');
  
      db.onupgradeneeded = event => {
        console.log('db upgrade');
      }
      db.onsuccess = event => {
        console.log('db open success');
        let db = event.target.result;
        let trans = db.transaction('cache', 'readwrite');
        let store = trans.objectStore('cache');
        let putReq = store.put({key: 'notification-' + notiStr, val: true});

        putReq.onsuccess = () => {
          console.log('put data success');
        }
        trans.oncomplete = () => {
          console.log('transaction complete');
        }

        db.close();
      }
      db.onerror = event => {
        console.log('db open error:' + event);
      }

    });
  }

  if (notificationFlag) {
    messageBody = messageBody + notiMassageLabel[lang];
  }

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: messageBody,
    data: payload.data.click_action
  };
  if (timeFlag && (routFlag || notificationFlag)) {
    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  } else {
    return false;
  }
});