// React react-native
import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';

// native-base
import {
  Box,
  Divider,
  FlatList,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from 'native-base';

// react-native-vector-icons
import IonIcons from 'react-native-vector-icons/Ionicons';

/********************************************************
 * FIREBASE
 ********************************************************/
// firestore
// import {collection, onSnapshot} from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';
// google firestore cloud messaging
import messaging from '@react-native-firebase/messaging';
// firebase auth
import auth from '@react-native-firebase/auth';
// dayjs - manipulation de date
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import {useNavigation} from '@react-navigation/native';
import {VAPID_KEY} from '../constants';

dayjs.locale('fr');
dayjs.extend(relativeTime);

dayjs.extend(updateLocale);

dayjs.updateLocale('fr', {
  relativeTime: {
    future: '- %s',
    past: '+ %s',
    s: '1 s',
    m: '1 mn',
    mm: '%d mn',
    h: '1 h',
    hh: '%d h',
    d: '1 j',
    dd: '%d j',
    M: '1 mois',
    MM: '%d mois',
    y: '1 an',
    yy: '%d ans',
  },
});

export default function HomeScreen() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  /**
   * Permet de faire une demande d'autorisation avec la boite de dialogue native de la plateforme (IOS/Android)
   * @returns boolean
   */
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  };
  /**
   *
   * @param any userRef
   */
  const isNotifiable = async userRef => {
    const querySnap = await userRef.get();
    const userData = querySnap.data();
    if (userData.role === 'collector') {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const subscriber = firestore()
      .collection('adverts')
      .onSnapshot(
        querySnapShot => {
          const advertsArray = [];
          querySnapShot.forEach(doc => {
            advertsArray.push({
              ...doc.data(),
              id: doc.id,
            });
          });
          setAdverts(advertsArray);
          setLoading(false);
        },
        error => {
          console.log(error.message);
        },
      );
    return () => subscriber();
  }, []);

  // Demande de permission de reception de notification
  useEffect(() => {
    const asyncBootstrap = async () => {
      const userDocID = auth().currentUser.uid;
      const userRef = firestore().collection('users').doc(userDocID);
      // status de l'utilisateur et auth
      const checkIsNotifiable = await isNotifiable(userRef);
      const checkPermission = await requestUserPermission();
      console.log(checkPermission);
      // Utilisateur est notifiable et à donner son accord
      if (checkIsNotifiable && checkPermission) {
        await messaging().registerDeviceForRemoteMessages();
        // on récupère le jeton unique FCM pour l'utilisateur
        const fcmToken = await messaging().getToken();
        console.log(fcmToken);
        // On persiste l'identifiant unique de l'utilisateur courant
        userRef.update({
          fcmToken: fcmToken,
        });
      }
    };

    asyncBootstrap();
  }, []);

  const renderItem = ({item}) => (
    <Pressable onPress={() => navigation.navigate('Details')}>
      <Divider />
      <Box
        p="3"
        _dark={{
          bg: 'coolGray.800',
        }}
        _light={{
          bg: 'white',
        }}
      >
        <VStack space="2">
          <Heading isTruncated size="sm">
            {item.title}
          </Heading>
          <HStack alignItems="center" space="2">
            <Icon as={IonIcons} name="md-time-outline" />
            <Text>{dayjs(item?.createdAt?.toDate())?.fromNow()}</Text>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );

  return loading ? (
    <ActivityIndicator size="large" />
  ) : (
    <Box px={'2'}>
      <Heading mt="2" textTransform="uppercase">
        Derniers dons
      </Heading>
      <FlatList
        data={adverts}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={renderItem}
        ListEmptyComponent={() => <Text my="5">Aucun don n'est trouvé !</Text>}
      />
    </Box>
  );
}
