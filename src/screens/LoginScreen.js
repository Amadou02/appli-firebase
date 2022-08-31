import React, {useContext} from 'react';
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
} from 'native-base';

import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/config';
import {signInWithEmailAndPassword} from '@firebase/auth';

import {AuthContext} from './../contexts/AuthContext';
import {useFormik} from 'formik';

export default function LoginScreen() {
  const navigation = useNavigation();

  const authenContext = useContext(AuthContext);
  const {setAuthenticated} = authenContext;

  const {values, handleChange, handleBlur, handleSubmit, errors, touched} =
    useFormik({
      initialValues: {
        email: 'johndoe@gmail.com',
        password: 'Secret123',
      },
      onSubmit: values => login(values),
    });

  const login = values => {
    const {email, password} = values;
    // Condition de connexion ok
    signInWithEmailAndPassword(auth, email, password).then(userCredential => {
      console.log('vous êtes connecté !');
      setAuthenticated(true);
    });
  };
  console.log(values);
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
