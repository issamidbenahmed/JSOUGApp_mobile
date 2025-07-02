import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput, Checkbox } from 'react-native-paper';
import { register } from '../services/api';

const states = [
  'sous massa', 'casablanca', 'rabat', 'marrakech', 'tanger', 'fes', 'oujda', 'laayoune', 'autre'
];

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(true);
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [state, setState] = useState('');
  const [showStateList, setShowStateList] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checked, setChecked] = useState(false);
  const [confirmValid, setConfirmValid] = useState(false);
  const [role, setRole] = useState<'eleve' | 'moniteur'>('eleve');

  const validateEmail = (email: string) => {
    if (email.length === 0) return true; // Don't show error when empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailValid(validateEmail(text));
  };

  const handleConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    setConfirmValid(text.length > 0 && text === password);
  };

  const isFormValid =
    fullName &&
    email &&
    emailValid &&
    address &&
    price &&
    state &&
    password &&
    confirmPassword &&
    confirmValid &&
    checked;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 0 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.navigate('PhoneNumberScreen')} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
            <Icon name="arrow-left" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.heading}>Getting Started</Text>
          <Text style={styles.subtitle}>
            Seems you are new here,{"\n"}Let's set up your profile.
          </Text>
          <TextInput
            label="Full Name"
            mode="outlined"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            theme={{ roundness: 16, colors: { primary: '#FFA000', placeholder: '#bbb' } }}
          />
          <TextInput
            label="Email Address"
            mode="outlined"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            style={styles.input}
            theme={
              !emailValid
                ? {
                    roundness: 16,
                    colors: {
                      primary: '#F44336',
                      outline: '#F44336',
                      placeholder: '#FFCDD2',
                      text: '#222',
                    },
                  }
                : {
                    roundness: 16,
                    colors: { primary: '#FFA000', placeholder: '#bbb' },
                  }
            }
            right={
              !emailValid && email.length > 0 ? (
                <TextInput.Icon icon="alert-circle" color="#F44336" size={28} />
              ) : undefined
            }
          />
          <TextInput
            label="Current Address"
            mode="outlined"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            theme={{ roundness: 16, colors: { primary: '#FFA000', placeholder: '#bbb' } }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              label="Price (DHS)"
              mode="outlined"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={[styles.input, { flex: 0.8 }]}
              theme={{ roundness: 16, colors: { primary: '#FFA000', placeholder: '#bbb' } }}
            />
            <TextInput
              label="State"
              mode="outlined"
              value={state}
              style={[styles.input, { flex: 1.2 }]}
              theme={{ roundness: 16, colors: { primary: '#FFA000', placeholder: '#bbb' } }}
              right={<TextInput.Icon icon="chevron-down" color="#aaa" onPress={() => setShowStateList(!showStateList)} />} 
              editable={false}
              pointerEvents="none"
            />
          </View>
          {showStateList && (
            <ScrollView style={styles.dropdown} nestedScrollEnabled={true}>
              {states.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={{ padding: 12 }}
                  onPress={() => {
                    setState(s);
                    setShowStateList(false);
                  }}
                >
                  <Text>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TextInput
            label="Password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            theme={{ roundness: 16, colors: { primary: '#FFA000', placeholder: '#bbb' } }}
            right={<TextInput.Icon icon={showPassword ? 'eye-off-outline' : 'eye-outline'} color="#aaa" onPress={() => setShowPassword((v) => !v)} />} 
          />
          <TextInput
            label="Confirm Password"
            mode="outlined"
            value={confirmPassword}
            onChangeText={handleConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            theme={
              confirmValid
                ? {
                    roundness: 16,
                    colors: {
                      primary: '#4CAF50',
                      outline: '#4CAF50',
                      placeholder: '#A5D6A7',
                      text: '#222',
                    },
                  }
                : {
                    roundness: 16,
                    colors: { primary: '#FFA000', placeholder: '#bbb' },
                  }
            }
            right={
              confirmValid ? (
                <TextInput.Icon icon="check-circle" color="#4CAF50" size={28} />
              ) : (
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  color="#aaa"
                  onPress={() => setShowConfirmPassword((v) => !v)}
                />
              )
            }
          />
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setChecked((v) => !v)}
            >
              {checked && <Icon name="check" size={18} color="#FFA000" />}
            </TouchableOpacity>
            <Text style={{ color: '#888', fontSize: 13 }}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: '#FFA000', fontWeight: 'bold' }}>Term and Conditions</Text>
            </Text>
          </View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isFormValid ? '#FFB800' : '#E0E0E0' }]}
            disabled={!isFormValid}
            onPress={async () => {
              const data = {
                fullName,
                email,
                password,
                address,
                price,
                state,
                role,
              };
              const res = await register(data);
              if (res.id) {
                navigation.navigate('RoleChoiceScreen', { userId: res.id });
              } else {
                Alert.alert('Erreur', res.error || "Inscription impossible");
              }
            }}
          >
            <Text style={{ color: isFormValid ? 'white' : '#888', fontWeight: 'bold', fontSize: 17 }}>Continue</Text>
          </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account ?{' '}
            <Text style={{ color: '#FFA000', fontWeight: 'bold' }} onPress={() => navigation.navigate('LoginScreen')}>
              Login
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 18,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
    borderRadius: 24,
  },
  dropdown: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 12,
    marginBottom: 12,
    maxHeight: 180,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#FFA000',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 8,
  },
  bottomContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  loginText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    marginTop: 18,
    marginBottom: 0,
  },
});

export default RegisterScreen; 