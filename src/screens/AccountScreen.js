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

/******************************************************************
 * FIREBASE
 *****************************************************************/
// Firebase config
import {db, auth, storage} from '../firebase/config';
// firebase firestore
import {doc, getDoc, serverTimestamp, updateDoc} from 'firebase/firestore';
// firebase storage
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
// firebase auth
import {updateProfile} from 'firebase/auth';

/******************************************************************
 * FIREBASE
 *****************************************************************/

// camera

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default function AccountScreen() {
  const [editMode, setEditMode] = useState(false);
  // const [avatar, setAvatar] = useState('');
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
      saveToPhotos: true,
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
      const img = assets[0];
      uploadAvatar(img);
    }
  };

  const getPhotoFromStorage = async () => {
    const response = await launchImageLibrary(options);
    let options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
      saveToPhotos: true,
    };

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
      const img = assets[0];
      uploadAvatar(img);
    }
  };

  const uploadAvatar = async img => {
    // on crée une référence pour l'image que le souhaite update avec son nom de stockage
    const avatarRef = ref(storage, `avatar-${auth.currentUser.uid}.jpg`);
    // On va récupérer dépuis son emplacement via le protocol http
    const request = await fetch(img.uri);
    // On extrait le résultat de l'appel sous forme de blob
    const response = await request.blob();
    // on upload l'image récupérer dans le cloud sous forme de blob
    uploadBytes(avatarRef, response, {contentType: 'image/jpg'}).then(
      snapshot => {
        // on récupère lien de l'image
        getDownloadURL(snapshot.ref).then(downloadUrl => {
          // on met à jour le profil avec le lien de l'image

          // 1 . On met à jour l'utilisateur courant dans firestore
          handleUpdate({image: downloadUrl});
          // On met également l'avatar de l'utilisateur dans auth
          updateProfile(auth.currentUser, {photoURL: downloadUrl});
          // on ferme la bottonSheet
          // onClose();
        });
      },
    );
  };

  return (
    <Box flex={1}>
      <Center h={'2/6'} bg="amber.500">
        <Avatar size="xl" mb={2} source={{uri: auth.currentUser.photoURL}}>
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
        <Text>{auth.currentUser.email}</Text>
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
