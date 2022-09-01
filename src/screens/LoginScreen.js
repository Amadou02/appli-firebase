import React, {useContext, useEffect, useRef, useState} from 'react';
// NATIVE BASE
import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  HStack,
  Input,
  Link,
  VStack,
  Text,
  AlertDialog,
} from 'native-base';

// Hook React navigation pour accéder au context de la react-navigation
import {useNavigation} from '@react-navigation/native';
/*******************************************************
 * FIREBASE
 ******************************************************/
// Import de la constante auth de ma config firebase
import {auth} from '../firebase/config';
// Méthode de connexion email/mot-de-passe de firebase auth
import {signInWithEmailAndPassword} from '@firebase/auth';

/*******************************************************
 * FIREBASE                                            \
 ******************************************************/

// Custom context pour la gestion globale du state du status d'auth avec son setter.
import {AuthContext} from './../contexts/AuthContext';

// Librairie de traitement de formulaire
import {useFormik} from 'formik';

// TouchID
import touchID from 'react-native-touch-id';
import {Alert} from 'react-native';

// React native secure key store
import RNSecureKeyStore, {ACCESSIBLE} from 'react-native-secure-key-store';

export default function LoginScreen() {
  const navigation = useNavigation();

  const authenContext = useContext(AuthContext);
  const {setAuthenticated} = authenContext;

  // vérif accord pour le touch id
  const [requestSaveCredentential, setRequestSaveCredentential] =
    useState(false);

  // Ouverture / fermeture popup
  const [isOpen, setIsOpen] = useState(true);

  const onClose = () => setIsOpen(false);

  const cancelRef = useRef(null);

  const {values, handleChange, handleBlur, handleSubmit, errors, touched} =
    useFormik({
      initialValues: {
        email: 'johndoe@gmail.com',
        password: 'Secret123',
      },
      onSubmit: values => login(values),
    });

  useEffect(() => {
    AuthWithTouchId();
  }, []);

  const login = values => {
    const {email, password} = values;
    // Condition de connexion ok
    signInWithEmailAndPassword(auth, email, password).then(userCredential => {
      if (requestSaveCredentential) {
        console.log('vous êtes connecté !');
        setAuthenticated(true);
      }
    });
  };
  /**
   * Authentifcation par l'empreinte digitale
   */
  const AuthWithTouchId = () => {
    const options = {
      title: 'Confirmez votre identité',
      sensorDescription:
        'Utilisez votre empreinte pour confirmer votre identité',
      sensorErrorDescription: 'empreinte non reconnue',
    };
    // On vérifie que le touch id est configurée sur l'appareil de l'utilisateur
    if (touchID.isSupported) {
      // On vérifie si l'utilsateur à déjà donnée son accord pour être authentifier par mot de passe
      checkUserCredentialStored();
      touchID
        .authenticate('Authentification par empreinte digital', options)
        .then(success => {
          Alert.alert('Authenticated Successfully');
        })
        .catch(error => {
          Alert.alert('Authentication Failed');
        });
    }
  };

  const checkUserCredentialStored = () => {
    RNSecureKeyStore.get('user')
      .then(res => {
        console.log('====================================');
        console.log('user log');
        console.log('====================================');
      })
      .catch(error => {
        setRequestSaveCredentential(true);
      });
  };

  // Affichage du popup demande activation touch id
  return (
    <Center flex={'1'} bgColor="warmGray.5">
      <Box w={'90%'}>
        <Heading mb="1.5" fontWeight={'semibold'}>
          Connexion
        </Heading>
        <VStack space={'2'}>
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <Input value={values.email} onChangeText={handleChange('email')} />
          </FormControl>
          <FormControl>
            <FormControl.Label>Mot de passe</FormControl.Label>
            <Input
              value={values.password}
              onChangeText={handleChange('password')}
            />
          </FormControl>
          <Button onPress={handleSubmit} colorScheme={'amber'}>
            Se connecter
          </Button>
          <HStack justifyContent={'center'} mt="3">
            <Text>Pas encore membre ? </Text>
            <Link
              onPress={() => navigation.navigate('Registration')}
              _text={{
                color: 'amber.500',
                fontWeight: 'medium',
                fontSize: 'sm',
              }}>
              Créer un compte
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
}
