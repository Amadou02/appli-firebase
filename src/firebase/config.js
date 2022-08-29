import {initializeApp} from 'firebase/app';

import {getFirestore, initializeFirestore} from 'firebase/firestore';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA2nbKXZi-f0JWS9guFJMFlo_-HVOAXDA8',
  authDomain: 'test-34edd.firebaseapp.com',
  projectId: 'test-34edd',
  storageBucket: 'test-34edd.appspot.com',
  messagingSenderId: '177324772543',
  appId: '1:177324772543:web:b44e35dc4057e8779b0a0a',
};

const app = initializeApp(firebaseConfig);

initializeFirestore(app, {experimentalAutoDetectLongPolling: true});

export const db = getFirestore(app);

export const auth = getAuth(app);
