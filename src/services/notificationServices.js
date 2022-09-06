import {KEY} from '../constants';
// to: '/topics/chatroom',

export const sendPushNotification = async (registration_ids, body) => {
  console.log('====================================');
  console.log(registration_ids);
  console.log('====================================');
  const message = {
    registration_ids: registration_ids,
    collapse_key: 'type_a',
    notification: {
      title: "Un nouveau don dans l'app",
      body: body,
      vibrate: 1,
      sound: 1,
      show_in_foreground: true,
      priority: 'high',
      content_available: true
    },
  };

  return await fetch(`https://fcm.googleapis.com/fcm/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${KEY}`,
    },
    body: JSON.stringify(message),
  }).then(res => {
    console.log(res);
    res.json();
  });
};
