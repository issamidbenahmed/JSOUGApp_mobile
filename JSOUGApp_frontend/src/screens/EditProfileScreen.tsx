import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import CountryFlag from 'react-native-country-flag';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // You may need to add token to headers
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get('http://localhost:5000/api/moniteur/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setImage(res.data.avatar || null);
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    console.log('ImagePicker result:', result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const formData = new FormData();

      // Append text fields
      formData.append('fullName', profile.fullName || '');
      formData.append('description', profile.description || '');
      formData.append('email', profile.email || '');
      formData.append('phone', profile.phone || '');
      formData.append('address', profile.address || '');

      // Handle the new avatar image, supporting both file and data URIs
      if (image && image !== profile.avatar) {
        console.log('Image URI to process:', image);
        if (image.startsWith('file://')) {
            const uriParts = image.split('.');
            const fileType = uriParts[uriParts.length - 1].toLowerCase();
            const fileName = `avatar.${fileType}`;
            formData.append('avatar', {
              uri: image,
              name: fileName,
              type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
            } as any);
        } else if (image.startsWith('data:')) {
            const response = await fetch(image);
            const blob = await response.blob();
            const fileType = blob.type.split('/')[1];
            const fileName = `avatar.${fileType}`;
            formData.append('avatar', blob, fileName);
        }
      }

      console.log('--- Sending FormData to backend ---');
      const res = await axios.patch('http://localhost:5000/api/moniteur/profile', formData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = res.data;
      if (res.status === 200) {
        Alert.alert('Profile updated!', 'Your changes have been saved.');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.error || 'Failed to save changes');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err.response ? err.response.data : err);
      Alert.alert('Error', 'An error occurred while saving.');
    }
    setSaving(false);
  };

  if (loading || !profile) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FBB614" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Icon name="menu" size={28} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Notifications')}>
          <Icon name="bell-outline" size={28} color="#222" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <Image
          source={image ? { uri: image } : require('../../assets/jsoug-logo.png')}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Icon name="camera-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profile.fullName || ''}
          onChangeText={text => handleChange('fullName', text)}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.description || ''}
          onChangeText={text => handleChange('description', text)}
          multiline
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={profile.email || ''}
          onChangeText={text => handleChange('email', text)}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.flagCircle}>
            <CountryFlag isoCode="ma" size={18} />
          </View>
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0, marginLeft: 8 }]}
            value={profile.phone || ''}
            onChangeText={text => handleChange('phone', text)}
            keyboardType="phone-pad"
          />
          <Icon name="check" size={22} color="#222" style={{ marginLeft: 8 }} />
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Address</Text>
        <TextInput
          style={styles.input}
          value={profile.address || ''}
          onChangeText={text => handleChange('address', text)}
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={'******'}
          editable={false}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.changePasswordBtn} onPress={() => Alert.alert('Change Password')}>
        <Text style={styles.changePasswordText}>Change Password</Text>
        <Icon name="arrow-right" size={20} color="#222" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#222',
    borderRadius: 24,
    padding: 8,
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
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flagCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  changePasswordText: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#FBB614',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
}); 