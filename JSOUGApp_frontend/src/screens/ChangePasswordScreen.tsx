import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changePassword } from '../services/api';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isValid = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token');
      const res = await changePassword(currentPassword, newPassword, token);
      if (res.error) {
        Alert.alert('Error', res.error);
      } else {
        Alert.alert('Success', 'Password changed successfully!');
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Notifications')}>
          <Icon name="bell-outline" size={28} color="#222" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 24 }}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Please note changing password will required again login to the app.
        </Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Icon name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Icon name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={[styles.inputRow, isValid && styles.inputRowValid]}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
              <Icon name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#999" />
            </TouchableOpacity>
            {isValid && (
              <Icon name="check-circle" size={22} color="#4BB543" style={{ marginLeft: 8 }} />
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { opacity: isValid && !saving ? 1 : 0.6 }]}
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Password'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBB614',
    top: 3,
    right: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inputRowValid: {
    borderColor: '#4BB543',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 0,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
  },
  saveBtn: {
    backgroundColor: '#FBB614',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
}); 