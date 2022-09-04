// React
import React, {useState, useRef} from 'react';
// Native base
import {
  Box,
  Button,
  FormControl,
  Heading,
  Input,
  VStack,
  useToast,
} from 'native-base';

// DateTime picker widget
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
/**
 * Google firebase
 */
// firebase firestore
import {
  collection,
  setDoc,
  addDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
// configuration de firestore
import {db, auth} from '../firebase/config';

/**
 * Traitement et validation de formulaire
 */
// Traitement de formulaire
import {useFormik} from 'formik';
// Validation de formulaire
import * as yup from 'yup';
// règles de validation des champs du formulaire
const validationSchema = yup.object({
  title: yup.string().required('Le titre est requis'),
  description: yup.string(),
  available: yup
    .date()
    .typeError("La valeur renseigné n'est pas une date valide")
    .required('La date de disponibilité du don est requis'),
  expiration: yup
    .date()
    .typeError("La valeur renseigné n'est pas une date valide")
    .required("La date d'expiration est requise"),
});

export default function AdvertForm() {
  // Gestion de l'affichage des pickers de date
  const [showAvailableDatePicker, setShowAvailableDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(
    false,
  );
  // création de ref sur les inputs des champs date afin de leur enlever le focus un fois que l'utilisateur a chosi une date
  const availableInputRef = useRef(null);
  const expirationInputRef = useRef(null);
  // toast de notification de l'utilisateur
  const toast = useToast();
  // initialisation de formik avec le hook dédié
  const {
    values,
    setFieldValue,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      title: '',
      description: '',
      available: null,
      expiration: null,
    },
    onSubmit: values => createAds(values),
    validationSchema,
  });

  const availableDateChange = (event, selectedDate) => {
    const nextDate = selectedDate;
    console.log(nextDate);
    setShowAvailableDatePicker(false);
    setFieldValue('available', nextDate);
    availableInputRef.current.blur();
  };

  const expirationDateChange = (event, selectedDate) => {
    const nextDate = selectedDate;
    setShowExpirationDatePicker(false);
    setFieldValue('expiration', nextDate);
    expirationInputRef.current.blur();
  };

  const createAds = values => {
    const advertsRef = collection(db, 'adverts');
    addDoc(advertsRef, {
      ...values,
      available: Timestamp.fromDate(values.available),
      expiration: Timestamp.fromDate(values.expiration),
      createdAt: serverTimestamp(),
      user_id: auth.currentUser.uid,
    }).then(newAdvert => {
      console.log('nouveau', newAdvert.id);
      // notification de succès
      toast.show({
        description: 'Annonce ajoutée avec succès !',
      });
      resetForm();
    });
  };

  const updateAds = (values, id) => {
    // on récupère le document à modifier
    const advertsDocRef = doc(db, 'adverts', id);
    // on le modifier avec la méthode setDoc (possibilité d'utiliser un autre méthode)
    // le merge est import sinon, les colonnes non présente dans values seront écrasées de la nouvelle version du document.
    // j'ai ajouté la colonne updatedAt pour avoir une date de dernière modification
    setDoc(
      advertsDocRef,
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      },
    ).then(() => {
      console.log('annonce modifiée avec succès');
    });
  };

  return (
    <Box p={5}>
      <Heading>Nouvelle annonce</Heading>
      <VStack space={2}>
        <FormControl isInvalid={touched.title && errors?.title}>
          <FormControl.Label>Titre</FormControl.Label>
          <Input value={values.title} onChangeText={handleChange('title')} />
          <FormControl.ErrorMessage>{errors?.title}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={touched.description && errors?.description}>
          <FormControl.Label>Description</FormControl.Label>
          <Input
            value={values.description}
            onChangeText={handleChange('description')}
          />
          <FormControl.ErrorMessage>
            {errors?.description}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={touched.available && errors?.available}>
          <FormControl.Label>Disponibilité</FormControl.Label>
          <Input
            onFocus={() => setShowAvailableDatePicker(true)}
            showSoftInputOnFocus={false}
            ref={availableInputRef}
            value={values.available?.toISOString()}
            onChangeText={handleChange('available')}
          />
          <FormControl.ErrorMessage>
            {errors?.available}
          </FormControl.ErrorMessage>
        </FormControl>
        {showAvailableDatePicker &&
          DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: availableDateChange,
          })}
        <FormControl isInvalid={touched.expiration && errors?.expiration}>
          <FormControl.Label>DLC/DLUO</FormControl.Label>
          <Input
            onFocus={() => {
              //   Keyboard.dismiss();
              setShowExpirationDatePicker(true);
            }}
            showSoftInputOnFocus={false}
            ref={expirationInputRef}
            value={values.expiration?.toISOString()}
            onChangeText={handleChange('expiration')}
          />
          <FormControl.ErrorMessage>
            {errors?.expiration}
          </FormControl.ErrorMessage>
        </FormControl>
        {showExpirationDatePicker &&
          DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: expirationDateChange,
          })}
        <Button onPress={handleSubmit} mt={'4'} colorScheme={'amber'}>
          Enregistrer
        </Button>
      </VStack>
    </Box>
  );
}
