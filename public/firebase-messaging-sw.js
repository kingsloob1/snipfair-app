/* eslint-disable no-undef */
importScripts(
    'https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js',
);
importScripts(
    'https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js',
);

/** @type {ServiceWorkerGlobalScope} */
// var sw = self;

var firebaseClient = firebase;

firebaseClient.initializeApp({
    apiKey: 'AIzaSyBh3gjqkcIBoyFWb85Hn3Owph_oyX52hWE',
    authDomain: 'snipfair-firebase.firebaseapp.com',
    projectId: 'snipfair-firebase',
    storageBucket: 'snipfair-firebase.firebasestorage.app',
    messagingSenderId: '93247050443',
    appId: '1:93247050443:web:58ac9f7003c60d9e32c14e',
    measurementId: 'G-8XFC1B455F',
});

var messaging = firebaseClient.messaging();

//Handle foreground messages
messaging.onMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received foreground message ',
        payload,
    );
});

// //Handle background messages
// messaging.onBackgroundMessage((payload) => {
//     console.log(
//         '[firebase-messaging-sw.js] Received background message ',
//         payload,
//     );
//     // Customize notification here
//     // const notificationTitle = 'Background Message Title';
//     // const notificationOptions = {
//     //     body: 'Background Message body.',
//     //     icon: '/images/logo/logo.png',
//     // };

//     // sw.registration.showNotification(notificationTitle, notificationOptions);
// });
