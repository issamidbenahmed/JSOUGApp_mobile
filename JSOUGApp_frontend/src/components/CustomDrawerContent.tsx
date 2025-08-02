import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotifications } from '../services/api';

// If using TypeScript, you can type navigation as any or use DrawerContentComponentProps from @react-navigation/drawer
export default function CustomDrawerContent({ navigation, state }: any) {
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(setRole);
    const fetchUnread = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const notifs = await getNotifications(token);
      if (Array.isArray(notifs)) {
        setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
      }
    };
    fetchUnread();
  }, []);

  // Récupérer la route active
  const activeRoute = state?.routeNames[state?.index] || '';

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
      {role === 'eleve' ? (
        <>
          <TouchableOpacity
            style={activeRoute === 'Profile' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="account-outline" size={22} color={activeRoute === 'Profile' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Profile' ? styles.menuTextActive : styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'StudentDashboard' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('StudentDashboard')}
          >
            <Icon name="home-outline" size={22} color={activeRoute === 'StudentDashboard' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'StudentDashboard' ? styles.menuTextActive : styles.menuText}>Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'MesReservations' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('MesReservations')}
          >
            <Icon name="calendar-check-outline" size={22} color={activeRoute === 'MesReservations' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'MesReservations' ? styles.menuTextActive : styles.menuText}>Mes réservations</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Moniteurs' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Moniteurs')}
          >
            <Icon name="account-group-outline" size={22} color={activeRoute === 'Moniteurs' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Moniteurs' ? styles.menuTextActive : styles.menuText}>Moniteurs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Messages' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Messages')}
          >
            <Icon name="message-outline" size={22} color={activeRoute === 'Messages' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Messages' ? styles.menuTextActive : styles.menuText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Notifications' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="bell-outline" size={22} color={activeRoute === 'Notifications' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Notifications' ? styles.menuTextActive : styles.menuText}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Historique' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Historique')}
          >
            <Icon name="history" size={22} color={activeRoute === 'Historique' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Historique' ? styles.menuTextActive : styles.menuText}>Historique</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeRoute === 'SetNewPasswordScreen' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('SetNewPasswordScreen')}
          >
            <Icon name="shield-outline" size={22} color={activeRoute === 'SetNewPasswordScreen' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'SetNewPasswordScreen' ? styles.menuTextActive : styles.menuText}>Sécurité</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeRoute === 'Settings' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="tune" size={22} color={activeRoute === 'Settings' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Settings' ? styles.menuTextActive : styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Menu moniteur (déjà existant) */}
          <TouchableOpacity
            style={activeRoute === 'Profile' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="account-outline" size={22} color={activeRoute === 'Profile' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Profile' ? styles.menuTextActive : styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'MoniteurDashboard' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('MoniteurDashboard')}
          >
            <Icon name="view-dashboard-outline" size={22} color={activeRoute === 'MoniteurDashboard' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'MoniteurDashboard' ? styles.menuTextActive : styles.menuText}>Tableau de bord</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'PosteScreen' ? styles.menuItemActive : styles.menuItem}
            onPress={handleOffresPress}
          >
            <Icon name="account-group-outline" size={22} color={activeRoute === 'PosteScreen' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'PosteScreen' ? styles.menuTextActive : styles.menuText}>Offres/Postes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Messages' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Messages')}
          >
            <Icon name="message-outline" size={22} color={activeRoute === 'Messages' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Messages' ? styles.menuTextActive : styles.menuText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Notifications' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="bell-outline" size={22} color={activeRoute === 'Notifications' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Notifications' ? styles.menuTextActive : styles.menuText}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Historique' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Historique')}
          >
            <Icon name="history" size={22} color={activeRoute === 'Historique' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Historique' ? styles.menuTextActive : styles.menuText}>Historique</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'SetNewPasswordScreen' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('SetNewPasswordScreen')}
          >
            <Icon name="shield-outline" size={22} color={activeRoute === 'SetNewPasswordScreen' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'SetNewPasswordScreen' ? styles.menuTextActive : styles.menuText}>Sécurité</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeRoute === 'Settings' ? styles.menuItemActive : styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="tune" size={22} color={activeRoute === 'Settings' ? '#FBB614' : '#B0B0B0'} />
            <Text style={activeRoute === 'Settings' ? styles.menuTextActive : styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </>
      )}
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
  badgeContainer: {
    backgroundColor: '#FBB614',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 