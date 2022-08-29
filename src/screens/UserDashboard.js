import {View, Text, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import {collection, getDocs, query, where} from 'firebase/firestore';

import {db, auth} from '../firebase/config';
import {Box, Divider, FlatList, Heading, VStack} from 'native-base';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/fr';

dayjs.extend(localizedFormat);
dayjs.locale('fr');

export default function UserDashboard() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user_id = auth.currentUser.uid;
    const advertColRef = collection(db, 'adverts');

    const q = query(advertColRef, where('user_id', '==', user_id));

    getDocs(q)
      .then(querySnapshot => {
        const advertsArray = [];
        querySnapshot.forEach(doc => {
          advertsArray.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        setAdverts(advertsArray);
      })
      .catch(e => {
        console.log(e.massage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const renderItem = ({item}) => (
    <Pressable>
      <Divider />
      <VStack p={3} space="2">
        <Heading size="sm">{item.title}</Heading>
        <Box _text={{color: 'muted.500'}}>
          {dayjs(item.createdAt.toDate()).format('LLLL')}
        </Box>
      </VStack>
    </Pressable>
  );
  return (
    <Box flex={1} p={2}>
      <Heading size="md">Mes annonces</Heading>
      <FlatList
        data={adverts}
        key={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={renderItem}
      />
    </Box>
  );
}
