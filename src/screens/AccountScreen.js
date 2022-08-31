import React, {useEffect, useState} from 'react';
import {
  Avatar,
  Box,
  Center,
  FormControl,
  Input,
  VStack,
  Text,
  Fab,
  Icon,
  Button,
  Pressable,
  Actionsheet,
  useDisclose,
} from 'native-base';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {useFormik} from 'formik';

import {doc, getDoc, serverTimestamp, updateDoc} from 'firebase/firestore';
import {db, auth} from '../firebase/config';

// camera

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default function AccountScreen() {
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstname: '',
    lastname: '',
  });

  const {isOpen, onOpen, onClose} = useDisclose();
  const {values, handleChange, handleSubmit} = useFormik({
    initialValues,
    onSubmit: values => {
      handleUpdate(values);
      setEditMode(false);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    getDoc(userDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setInitialValues({
          firstname: data['firstname'],
          lastname: data['lastname'],
        });
      }
    });
  }, []);

  const handleUpdate = values => {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    updateDoc(userDocRef, {
      ...values,
      updatedAt: serverTimestamp(),
    })
      .then(updatedUser => {
        console.log('====================================');
        console.log('user updated !');
        console.log('====================================');
      })
      .catch(e => {
        console.log('====================================');
        console.log(e.massage);
        console.log('====================================');
      });
  };

  const takePhoto = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    };
    const response = await launchCamera(options);

    const {didCancel, errorCode, errorMessage, assets} = response;

    if (didCancel) {
      console.log('====================================');
      console.log("prise de photo annulé par l'utilisateur");
      console.log('====================================');
    } else if (errorCode) {
      console.log('====================================');
      console.log(errorMessage);
      console.log('====================================');
    } else {
      const {base64, uri} = assets;
      console.log('====================================');
      console.log(uri);
      console.log('====================================');
    }
  };

  const getPhotoFromStorage = async () => {
    const response = await launchImageLibrary(options);

    const {didCancel, errorCode, errorMessage, assets} = response;

    if (didCancel) {
      console.log('====================================');
      console.log("prise de photo annulé par l'utilisateur");
      console.log('====================================');
    } else if (errorCode) {
      console.log('====================================');
      console.log(errorMessage);
      console.log('====================================');
    } else {
      const {base64, uri} = assets;
      console.log('====================================');
      console.log(uri);
      console.log('====================================');
    }
  };

  return (
    <Box flex={1}>
      <Center h={'2/6'} bg="amber.500">
        <Avatar size="xl" mb={2}>
          AC
          <Avatar.Badge
            size="8"
            justifyContent="center"
            backgroundColor="amber.500"
            shadow="2">
            <Pressable onPress={onOpen}>
              <Center>
                <Icon name="edit" as={MaterialIcons} size="sm" color="white" />
              </Center>
            </Pressable>
          </Avatar.Badge>
        </Avatar>
        <Text>johndoe@gmail</Text>
      </Center>
      <VStack p={5} space={2}>
        <FormControl>
          <FormControl.Label>Prénom</FormControl.Label>
          <Input
            value={values.firstname}
            onChangeText={handleChange('firstname')}
            isDisabled={!editMode}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Nom</FormControl.Label>
          <Input
            isDisabled={!editMode}
            value={values.lastname}
            onChangeText={handleChange('lastname')}
          />
          {editMode && (
            <Button colorScheme="amber" onPress={handleSubmit} mt="4">
              Enregister
            </Button>
          )}
        </FormControl>
      </VStack>
      {!editMode && (
        <Fab
          renderInPortal={false}
          shadow="2"
          size={'sm'}
          colorScheme="amber"
          icon={<Icon color="white" name="edit" as={MaterialIcons} />}
          onPress={() => setEditMode(true)}
        />
      )}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Actionsheet.Item onPress={takePhoto}>Camera</Actionsheet.Item>
          <Actionsheet.Item onPress={getPhotoFromStorage}>
            Galerie photo
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </Box>
  );
}
