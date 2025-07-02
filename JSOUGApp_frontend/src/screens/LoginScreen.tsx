import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, GestureResponderEvent } from 'react-native';
import { TextInput, Button, Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { login } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('example@gmail.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const onLogin = async () => {
    const res = await login(email, password);
    if (res.token && res.user) {
      setLoginFailed(false);
      await AsyncStorage.setItem('userToken', res.token);
      await AsyncStorage.setItem('userRole', res.user.role);
      Alert.alert('Connexion réussie');
      if (res.user.role === 'moniteur') {
        navigation.replace('Profile');
      } else {
        navigation.replace('EleveDashboard');
      }
    } else {
      setLoginFailed(true);
      setRememberMe(false);
      Alert.alert('Erreur', res.error || 'Connexion impossible');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Let's Sign You In</Text>
      <Text style={styles.subtitle}>Welcome back, you've been missed!</Text>

      {/* Email Input */}
      <TextInput
        mode="outlined"
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        activeOutlineColor="#FBB614"
        outlineColor="#D9D9D9"
        theme={{ roundness: 10 }}
      />

      {/* Password Input */}
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (loginFailed) setLoginFailed(false);
        }}
        secureTextEntry={!passwordVisible}
        right={
          <TextInput.Icon
            icon={passwordVisible ? 'eye' : 'eye-off'}
            onPress={() => setPasswordVisible(!passwordVisible)}
            forceTextInputFocus={false}
          />
        }
        style={[styles.input]}
        activeOutlineColor={loginFailed ? '#FF6B6B' : '#FBB614'}
        outlineColor={loginFailed ? '#FF6B6B' : '#D9D9D9'}
        theme={{ roundness: 10 }}
        error={loginFailed}
      />

      {/* Remember Me & Forgot Password */}
      <View style={styles.row}>
        <Checkbox.Android
          status={rememberMe ? 'checked' : 'unchecked'}
          onPress={() => {
            if (!loginFailed) setRememberMe(!rememberMe);
          }}
          disabled={loginFailed}
          uncheckedColor="#999"
          color="#FBB614"
        />
        <Text style={[styles.rememberMeText, loginFailed && { color: '#999' }]}>Remember Me</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ForgetPasswordScreen')}>
          <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <Button
        mode="contained"
        onPress={onLogin}
        disabled={loginFailed}
        style={[styles.loginButton, loginFailed && styles.loginButtonDisabled]}
        contentStyle={{ height: 50, justifyContent: 'center' }}
        labelStyle={{ fontWeight: 'bold' }}
      >
        Login
      </Button>

      {/* OR Text */}
      <Text style={styles.orText}>OR</Text>

      {/* Continue with Google */}
      <Button
        mode="outlined"
        icon={({ size }) => <Icon name="google" size={size} color="#EA4335" />}
        onPress={() => Alert.alert('Continue with Google')}
        style={styles.googleButton}
        contentStyle={{ height: 50, justifyContent: 'center' }}
        labelStyle={{ color: '#000' }}
        uppercase={false}
      >
        Continue with Google
      </Button>

      {/* Sign Up */}
      <View style={styles.signUpContainer}>
        <Text style={styles.noAccountText}>Don't have an account ? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles to match your screenshot details + theming colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 26,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    marginTop: 6,
  },
  input: {
    marginTop: 24,
    backgroundColor: '#fff',
  },
  row: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberMeText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  forgotPasswordText: {
    color: '#FBB614',
    fontWeight: '500',
    fontSize: 14,
  },
  loginButton: {
    marginTop: 28,
    borderRadius: 10,
    backgroundColor: '#FBB614',
  },
  loginButtonDisabled: {
    backgroundColor: '#D8D8D8',
  },
  orText: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#000',
  },
  googleButton: {
    marginTop: 20,
    borderRadius: 10,
    borderColor: '#E0E0E0',
    backgroundColor: '#F1F3F6',
  },
  signUpContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noAccountText: {
    fontSize: 14,
    color: '#000',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FBB614',
  },
});

export default LoginScreen; 