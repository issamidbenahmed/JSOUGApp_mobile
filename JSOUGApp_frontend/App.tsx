import React, { useEffect } from 'react';
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

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const linking = {
  prefixes: ['jsoug://'],
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
      SetNewPasswordScreen: 'set-password',
      Profile: 'profile',
    },
  },
};

function DrawerScreens() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '75%' },
      }}
    >
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="EditProfile" component={EditProfileScreen} />
      {/* Add new screens here */}
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
        <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
        <Stack.Screen name="ResetEmailSentScreen" component={ResetEmailSentScreen} />
        <Stack.Screen name="SetNewPasswordScreen" component={SetNewPasswordScreen} />
        {/* Drawer screens for new features */}
        <Stack.Screen name="Profile" component={DrawerScreens} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 