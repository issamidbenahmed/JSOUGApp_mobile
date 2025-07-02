import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// If using TypeScript, you can type navigation as any or use DrawerContentComponentProps from @react-navigation/drawer
export default function CustomDrawerContent({ navigation }: any) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(setRole);
  }, []);

  const handleOffresPress = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = await res.json();
      if (user.isValidated) {
        navigation.navigate('PosteScreen');
      } else {
        navigation.navigate('WaitForValidationScreen');
      }
    } catch (e) {
      navigation.navigate('WaitForValidationScreen');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/jsoug-logo.png')} style={styles.logo} />
      </View>
      {/* Menu Items */}
      <TouchableOpacity style={styles.menuItemActive} onPress={() => navigation.navigate('Profile')}>
        <Icon name="account-outline" size={22} color="#FBB614" />
        <Text style={styles.menuTextActive}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleOffresPress}>
        <Icon name="account-group-outline" size={22} color="#B0B0B0" />
        <Text style={styles.menuText}>Offres/Postes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Messages')}>
        <Icon name="message-outline" size={22} color="#B0B0B0" />
        <Text style={styles.menuText}>Messages</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
        <Icon name="tune" size={22} color="#B0B0B0" />
        <Text style={styles.menuText}>Settings</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      {/* Section grise Upgrade to Pro */}
      <View style={styles.upgradeBox}>
        <Text style={styles.upgradeTitle}>
          Upgrade{"\n"}to <Text style={{ color: '#FBB614' }}>Pro</Text>
        </Text>
        <Text style={styles.upgradeSubtitle}>Get 1 Month Free!</Text>
        {/* Use a placeholder if rocket.png doesn't exist */}
        <Image source={require('../../assets/rocket.png')} style={styles.rocket} />
      </View>
      {/* Badge mode tout en bas */}
      <View style={styles.modeSection}>
        <View style={styles.modeContainer}>
          <Text style={styles.modeText}>
            {role === 'moniteur' ? 'Mode moniteur' : 'Mode élève'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  modeSection: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  modeContainer: {
    backgroundColor: '#D4FF3B',
    borderRadius: 12,
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 0,
  },
  modeText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 120, height: 40, resizeMode: 'contain' },
  menuItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  menuItemActive: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    backgroundColor: '#F6F6F6', borderRadius: 12, padding: 12,
  },
  menuText: { marginLeft: 16, fontSize: 16, color: '#B0B0B0' },
  menuTextActive: { marginLeft: 16, fontSize: 16, color: '#FBB614', fontWeight: '700' },
  upgradeBox: {
    position: 'absolute', bottom: 80, left: 24, right: 24,
    backgroundColor: '#4444', borderRadius: 16, padding: 16, alignItems: 'flex-start',
    marginTop: 0,
  },
  upgradeTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  upgradeSubtitle: { fontSize: 12, color: '#fff', marginTop: 4 },
  rocket: { width: 48, height: 48, position: 'absolute', right: 8, bottom: 8 },
}); 