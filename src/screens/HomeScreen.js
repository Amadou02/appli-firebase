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

// firebase
import {collection, getDocs, onSnapshot} from 'firebase/firestore';
import {db} from '../firebase/config';

// dayjs - manipulation de date
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import {useNavigation} from '@react-navigation/native';

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

  useEffect(() => {
    const advertsRef = collection(db, 'adverts');
    // getDocs(advertsRef)
    //   .then(querySnapShot => {
    //     const advertsArray = [];

    //     querySnapShot.forEach(doc => {
    //       advertsArray.push({
    //         ...doc.data(),
    //         id: doc.id,
    //       });
    //     });
    //     setAdverts(advertsArray);
    //   })
    //   .catch(e => {
    //     console.log(e.message);
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
    const unsubscribe = onSnapshot(
      advertsRef,
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
    return () => unsubscribe();
  }, []);

  const renderItem = ({item}) => (
    <Pressable onPress={() => navigation.navigate('Details')}>
      <Divider />
      <Box p="3">
        <VStack space="2">
          <Heading isTruncated size="sm">
            {item.title}
          </Heading>
          <HStack alignItems="center" space="2">
            <Icon as={IonIcons} name="md-time-outline" />
            <Text>{dayjs(item.createdAt?.toDate())?.fromNow()}</Text>
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
