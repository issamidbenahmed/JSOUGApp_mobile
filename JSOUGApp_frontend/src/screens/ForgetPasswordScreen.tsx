import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { requestPasswordReset } from '../services/api';

const ForgetPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('saadell@email.com');

  const onReset = async () => {
    console.log('[ForgetPasswordScreen] Attempting password reset for:', email);
    try {
      const res = await requestPasswordReset(email);
      console.log('[ForgetPasswordScreen] API response:', res);
      if (res.message) {
        Alert.alert('Password reset email sent');
        navigation.navigate('ResetEmailSentScreen');
      } else {
        Alert.alert('Error', res.error || 'Could not send reset email');
      }
    } catch (err) {
      console.error('[ForgetPasswordScreen] API call failed:', err);
      Alert.alert('Erreur', 'Erreur lors de la requête.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding' })}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Forget Password</Text>
      <Text style={styles.subtitle}>Enter your email address to reset password.</Text>

      <TextInput
        mode="outlined"
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        outlineColor="#EAEAEA"
        activeOutlineColor="#FBB614"
        theme={{ roundness: 12 }}
      />

      <Button
        mode="contained"
        onPress={onReset}
        style={styles.loginButton}
        contentStyle={{ height: 50, justifyContent: 'center' }}
        labelStyle={{ fontWeight: 'bold' }}
      >
        Reset Password
      </Button>
    </KeyboardAvoidingView>
  );
};

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
    marginBottom: 24,
  },
  input: {
    marginTop: 24,
    backgroundColor: '#fff',
  },
  loginButton: {
    marginTop: 28,
    borderRadius: 10,
    backgroundColor: '#FBB614',
  },
});

export default ForgetPasswordScreen; 