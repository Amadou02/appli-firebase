// react react-native
import {ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';

// firebase
import {collection, getDocs, query, where} from 'firebase/firestore';
import {db, auth} from '../firebase/config';

import {
  Box,
  Divider,
  Text,
  Heading,
  VStack,
  Pressable,
  HStack,
  Icon,
} from 'native-base';
// dayjs
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/fr';
dayjs.extend(localizedFormat);
dayjs.locale('fr');

// react-native-swipe-list-view
import {SwipeListView} from 'react-native-swipe-list-view';

// react-native-vector-icon
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

  // react-native-swipe-list-view

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const deleteRow = (rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
    const newData = [...adverts];
    const prevIndex = adverts.findIndex(item => item.key === rowKey);
    newData.splice(prevIndex, 1);
    setAdverts(newData);
  };

  const renderItem = ({item}) => (
    <Pressable>
      <Divider />
      <Box
        _dark={{
          bg: 'coolGray.800',
        }}
        _light={{
          bg: 'white',
        }}>
        <VStack p={3} space="2">
          <Heading size="sm">{item.title}</Heading>
          <Box _text={{color: 'muted.500'}}>
            {dayjs(item.createdAt.toDate()).format('LLLL')}
          </Box>
        </VStack>
      </Box>
    </Pressable>
  );

  const renderHiddenItem = (data, rowMap) => (
    <HStack flex="1" pl="2">
      <Pressable
        w="70"
        ml="auto"
        cursor="pointer"
        bg="coolGray.200"
        justifyContent="center"
        onPress={() => closeRow(rowMap, data.item.key)}
        _pressed={{
          opacity: 0.5,
        }}>
        <VStack alignItems="center" space={2}>
          <Icon
            as={<Entypo name="dots-three-horizontal" />}
            size="xs"
            color="coolGray.800"
          />
          <Text fontSize="xs" fontWeight="medium" color="coolGray.800">
            Archiver
          </Text>
        </VStack>
      </Pressable>
      <Pressable
        w="70"
        cursor="pointer"
        bg="red.500"
        justifyContent="center"
        onPress={() => deleteRow(rowMap, data.item.key)}
        _pressed={{
          opacity: 0.5,
        }}>
        <VStack alignItems="center" space={2}>
          <Icon as={<MaterialIcons name="delete" />} color="white" size="xs" />
          <Text color="white" fontSize="xs" fontWeight="medium">
            Supprimer
          </Text>
        </VStack>
      </Pressable>
    </HStack>
  );

  return loading ? (
    <ActivityIndicator />
  ) : (
    <Box flex={1} p={2}>
      <Heading size="md">Mes annonces</Heading>
      {/* <FlatList
        data={adverts}
        key={item => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={renderItem}
      /> */}

      <SwipeListView
        data={adverts}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-130}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        // onRowDidOpen={onRowDidOpen}
      />
    </Box>
  );
}
