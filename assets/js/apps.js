const firebaseConfig = {
  // FCM Copy
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.requestPermission()
.then( () => {
  console.log('Have permission');
  return messaging.getToken();
})
.then( token => {
  console.log(token);
})
.catch( err => {
  console.log('error Occuerd at getpermission');
   return messaging.getToken();
})
.then( token => {
  console.log(token);
});

messaging.usePublicVapidKey('<Webプッシュ証明書>');
messaging.onMessage( payload => {
  console.log('onMessage:',payload);
});