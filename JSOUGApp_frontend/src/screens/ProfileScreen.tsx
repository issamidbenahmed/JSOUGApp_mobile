import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// TODO: Replace with your real token management
const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [promoNotification, setPromoNotification] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const res = await axios.get('http://localhost:5000/api/moniteur/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile data received:', res.data);
      console.log('Avatar path:', res.data.avatar);
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      AsyncStorage.getItem('userRole').then(setRole);
    }, [])
  );

  const onEditPress = () => {
    navigation.navigate('EditProfile');
  };
  const onLogoutPress = () => {
    // TODO: Clear token and navigate to login
    navigation.replace('LoginScreen');
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF7A00" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.openDrawer && navigation.openDrawer()}>
          <Icon name="menu" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Notifications')}>
          <Icon name="notifications-none" size={28} color="#000" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* Profile infos */}
      <View style={styles.profileInfoContainer}>
        <Image
          source={
            profile?.avatar
              ? { uri: 'http://localhost:5000' + profile.avatar }
              : { uri: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80' }
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.fullName || 'Moniteur'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
        {profile?.description ? (
          <Text style={styles.profileField}>{profile.description}</Text>
        ) : null}
        {profile?.phone ? (
          <Text style={styles.profileField}>{profile.phone}</Text>
        ) : null}
        {profile?.address ? (
          <Text style={styles.profileField}>{profile.address}</Text>
        ) : null}
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Sections */}
      <View style={styles.sectionContainer}>
        {role === 'moniteur' && (
          <>
            <Text style={styles.sectionTitle}>GENERAL</Text>
            <MenuItem
              icon="credit-card-outline"
              title="Payment"
              description="Add your credit & debit cards"
              onPress={() => Alert.alert('Payment')}
            />
            <MenuItem
              icon="map-marker-outline"
              title="Locations"
              description="Add your home & work locations"
              onPress={() => navigation.navigate('MoniteurInfoScreen', { section: 'locations' })}
            />
            <MenuItem
              icon="car"
              title="Car Pictures"
              description="Add or edit car pictures"
              onPress={() => navigation.navigate('MoniteurInfoScreen', { section: 'car' })}
            />
            <MenuItem
              icon="certificate-outline"
              title="Certificates"
              description="Add certificates"
              onPress={() => navigation.navigate('MoniteurInfoScreen', { section: 'certificates' })}
            />
          </>
        )}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>NOTIFICATIONS</Text>
        <NotificationToggle
          icon="bell-outline"
          title="Push Notifications"
          description="For daily update and others."
          value={pushNotification}
          onValueChange={setPushNotification}
        />
        <NotificationToggle
          icon="bell-ring-outline"
          title="Promotional Notifications"
          description="New Offers"
          value={promoNotification}
          onValueChange={setPromoNotification}
        />

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>MORE</Text>
        <MenuItem
          icon="phone-outline"
          title="Contact Us"
          onPress={() => Alert.alert('Contact Us')}
        />
        <MenuItem
          icon="logout"
          title="Logout"
          onPress={onLogoutPress}
        />
      </View>
    </ScrollView>
  );
}

const MenuItem = ({ icon, title, description, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem} activeOpacity={0.7}>
    <MaterialCommunityIcons name={icon} size={22} color="#333" />
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.menuItemTitle}>{title}</Text>
      {description ? (
        <Text style={styles.menuItemDescription}>{description}</Text>
      ) : null}
    </View>
    <Icon name="chevron-right" size={28} color="#999" />
  </TouchableOpacity>
);

const NotificationToggle = ({ icon, title, description, value, onValueChange }: any) => (
  <View style={styles.menuItem}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <MaterialCommunityIcons name={icon} size={22} color="#333" />
      <View style={{ marginLeft: 15 }}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        <Text style={styles.menuItemDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      trackColor={{ false: '#ccc', true: '#FFB100' }}
      thumbColor="#fff"
      ios_backgroundColor="#ccc"
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  profileInfoContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 23,
  },
  name: {
    marginTop: 16,
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
  email: {
    marginTop: 5,
    fontSize: 14,
    color: '#FBB614',
    fontWeight: '500',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#FBB614',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  editButtonText: {
    color: '#FBB614',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#FBB614',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000',
  },
  menuItemDescription: {
    color: '#888',
    marginTop: 3,
    fontSize: 13,
  },
  profileField: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
}); 