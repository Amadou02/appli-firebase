import React, {useContext} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import AccountScreen from '../screens/AccountScreen';
import UserDashboard from '../screens/UserDashboard';

import {
  Box,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
  Pressable,
  Avatar,
  useTheme,
} from 'native-base';

import IonIcons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../contexts/AuthContext';

import {signOut} from 'firebase/auth';
import {auth} from '../firebase/config';
import {useColorScheme} from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerContent = props => {
  const authContext = useContext(AuthContext);
  const {setAuthenticated} = authContext;

  const handleLogout = () => {
    signOut(auth).then(userCredential => {
      setAuthenticated(false);
      console.log('====================================');
      console.log('déconnexion réussie');
      console.log('====================================');
    });
  };
  return (
    <DrawerContentScrollView
      contentContainerStyle={{
        flex: 1,
      }}>
      <VStack space="6" p={5} flex={1}>
        <Box>
          <Avatar
            bg={'amber.500'}
            size="lg"
            mb={3}
            source={{
              uri: auth.currentUser.photoURL,
            }}>
            AC
          </Avatar>
          <Text>{auth.currentUser.email}</Text>
        </Box>
        <VStack divider={<Divider />} space="4" flexGrow={1}>
          <VStack space={4}>
            <Pressable onPress={() => props.navigation.navigate('Dashboard')}>
              <HStack space={3} alignItems="center">
                <Icon as={IonIcons} name="md-grid-outline" />
                <Text>Dashboard</Text>
              </HStack>
            </Pressable>
            <Pressable onPress={() => props.navigation.navigate('Profile')}>
              <HStack space={3} alignItems="center">
                <Icon as={IonIcons} name="md-person-outline" />
                <Text>Profil</Text>
              </HStack>
            </Pressable>
          </VStack>
        </VStack>
        <HStack alignItems={'center'} space={3}>
          <Icon as={IonIcons} name="md-log-out-outline" color={'amber.500'} />
          <Pressable onPress={handleLogout}>
            <Text>Déconnexion</Text>
          </Pressable>
        </HStack>
      </VStack>
    </DrawerContentScrollView>
  );
};

export default function DrawerNavigation() {
  const schema = useColorScheme();
  const theme = useTheme();
  return (
    <Box safeArea flex={1}>
      <Drawer.Navigator
        drawerContent={DrawerContent}
        screenOptions={{
          headerTintColor:
            schema === 'dark'
              ? theme.colors.warmGray[50]
              : theme.colors.coolGray[800],
        }}>
        <Drawer.Screen
          name="Dashboard"
          component={UserDashboard}
          options={{title: 'Espace personnel'}}
        />
        <Drawer.Screen
          name="Profile"
          component={AccountScreen}
          options={{title: '', headerShown: true, headerTransparent: true}}
        />
      </Drawer.Navigator>
    </Box>
  );
}
