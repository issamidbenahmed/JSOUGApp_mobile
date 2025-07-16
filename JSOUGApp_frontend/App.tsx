import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import SplashScreen from './src/screens/SplashScreen';
import LogoTitleScreen from './src/screens/LogoTitleScreen';
import PhoneNumberScreen from './src/screens/PhoneNumberScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgetPasswordScreen from './src/screens/ForgetPasswordScreen';
import ResetEmailSentScreen from './src/screens/ResetEmailSentScreen';
import SetNewPasswordScreen from './src/screens/SetNewPasswordScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CustomDrawerContent from './src/components/CustomDrawerContent';
import { Linking } from 'react-native';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import MoniteurDetailsScreen from './src/screens/MoniteurDetailsScreen';
import MentorsScreen from './src/screens/MentorsScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RoleChoiceScreen from './src/screens/RoleChoiceScreen';
import PosteScreen from './src/screens/PosteScreen';
import WaitForValidationScreen from './src/screens/WaitForValidationScreen';
import StudentDashboardScreen from './src/screens/StudentDashboardScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MoniteursScreen from './src/screens/MentorsScreen';
import BookingScreen from './src/screens/BookingScreen';
import MoniteurInfoScreen from './src/screens/MoniteurInfoScreen';
import MesPostesScreen from './src/screens/MesPostesScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const linking = {
  prefixes: ['jsoug://', 'http://localhost:8081'],
  config: {
    screens: {
      Splash: 'splash',
      LogoTitle: 'logo',
      PhoneNumberScreen: 'phone',
      OTPVerificationScreen: 'otp',
      LoginScreen: 'login',
      RegisterScreen: 'register',
      ForgetPasswordScreen: 'forget',
      ResetEmailSentScreen: 'reset-email',
      SetNewPasswordScreen: {
        path: 'reset-password',
        parse: {
          token: (token: string) => token,
        },
      },
      Profile: 'profile',
    },
  },
};

function DrawerScreens() {
  const [role, setRole] = React.useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('userRole').then(setRole);
  }, []);

  if (role === null) return null; // ou un loader

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '75%' },
      }}
    >
      {role === 'eleve' ? (
        <>
          <Drawer.Screen name="StudentDashboard" component={StudentDashboardScreen} options={{ title: 'Accueil' }} />
          <Drawer.Screen name="Moniteurs" component={MoniteursScreen} options={{ title: 'Moniteurs' }} />
        </>
      ) : null}
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Mentors" component={MentorsScreen} />
      <Drawer.Screen name="Messages" component={MessagesScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      <Drawer.Screen name="MoniteurDetailsScreen" component={MoniteurDetailsScreen} />
      <Drawer.Screen name="PosteScreen" component={PosteScreen} />
      <Drawer.Screen name="MoniteurInfoScreen" component={MoniteurInfoScreen} options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LogoTitle" component={LogoTitleScreen} />
        <Stack.Screen name="PhoneNumberScreen" component={PhoneNumberScreen} />
        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="RoleChoiceScreen" component={RoleChoiceScreen} />
        <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
        <Stack.Screen name="ResetEmailSentScreen" component={ResetEmailSentScreen} />
        <Stack.Screen name="SetNewPasswordScreen" component={SetNewPasswordScreen} />
        {/* Drawer screens for new features */}
        <Stack.Screen name="Profile" component={DrawerScreens} options={{ headerShown: false }} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="WaitForValidationScreen" component={WaitForValidationScreen} />
        <Stack.Screen name="BookingScreen" component={BookingScreen} />
        <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="MoniteurInfoScreen" component={MoniteurInfoScreen} />
        <Stack.Screen name="MesPostes" component={MesPostesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 