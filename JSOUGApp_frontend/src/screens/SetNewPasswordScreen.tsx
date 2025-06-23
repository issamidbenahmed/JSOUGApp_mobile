import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { resetPasswordWithToken } from '../services/api';

const SetNewPasswordScreen = ({ navigation, route }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const token = route?.params?.token;

  const isPasswordValid = password.length >= 6; // example rule
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;

  const hasError = !isPasswordValid || !isConfirmValid;

  const onSavePassword = async () => {
    if (hasError) return;
    if (!token) {
      Alert.alert('Error', 'No reset token found.');
      return;
    }
    const res = await resetPasswordWithToken(token, password);
    if (res.message) {
      Alert.alert('Password saved successfully');
      navigation.navigate('LoginScreen');
    } else {
      Alert.alert('Error', res.error || 'Could not reset password');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding' })}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Set new password</Text>
      <Text style={styles.subtitle}>Create strong and secured new password.</Text>

      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry={!passwordVisible}
        outlineColor={hasError && !isPasswordValid ? '#FF3B30' : '#EAEAEA'}
        activeOutlineColor={hasError && !isPasswordValid ? '#FF3B30' : '#89D66D'}
        error={hasError && !isPasswordValid}
        theme={{ roundness: 12 }}
        right={
          <TextInput.Icon
            icon={passwordVisible ? 'eye' : 'eye-off'}
            onPress={() => setPasswordVisible(!passwordVisible)}
            forceTextInputFocus={false}
          />
        }
      />

      <TextInput
        mode="outlined"
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry={!confirmPasswordVisible}
        outlineColor={hasError && !isConfirmValid ? '#FF3B30' : '#EAEAEA'}
        activeOutlineColor={hasError && !isConfirmValid ? '#FF3B30' : '#89D66D'}
        error={hasError && !isConfirmValid}
        theme={{ roundness: 12 }}
        right={
          isConfirmValid ? (
            <TextInput.Icon icon="check-circle" color="#89D66D" forceTextInputFocus={false} />
          ) : (
            <TextInput.Icon
              icon={confirmPasswordVisible ? 'eye' : 'eye-off'}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              forceTextInputFocus={false}
            />
          )
        }
      />

      <Button
        mode="contained"
        onPress={onSavePassword}
        disabled={hasError}
        style={[styles.loginButton, hasError && styles.loginButtonDisabled]}
        contentStyle={{ height: 50, justifyContent: 'center' }}
        labelStyle={{ fontWeight: 'bold' }}
      >
        Save Password
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
  loginButtonDisabled: {
    backgroundColor: '#D8D8D8',
  },
});

export default SetNewPasswordScreen; 