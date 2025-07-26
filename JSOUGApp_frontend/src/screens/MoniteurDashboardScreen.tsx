import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const API_URL = 'http://localhost:5000/api/moniteur';

interface Booking {
  id: number;
  date: string;
  hour: string;
  eleve_id: number;
  poste_id: number;
  status: string;
}

const MoniteurDashboardScreen = ({ navigation }: any) => {
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rechargeLoading, setRechargeLoading] = useState(false);

  // Récupérer le token stocké
  const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
  };

  // Charger les réservations et le solde
  const fetchData = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      // Récupérer le profil (pour le solde)
      const profileRes = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();
      setBalance(profile.balance || 0);
      // Récupérer les réservations
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReservations(data.filter((b: any) => b.status === 'pending'));
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les données.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Accepter ou refuser une réservation
  const respondToBooking = async (booking_id: number, action: 'accept' | 'reject') => {
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/booking/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id, action }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Succès', `Réservation ${action === 'accept' ? 'acceptée' : 'refusée'}`);
        fetchData();
      } else {
        Alert.alert('Erreur', data.error || 'Action impossible.');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau.');
    }
  };

  // Recharger le solde via Stripe
  const handleRecharge = async () => {
    setRechargeLoading(true);
    const token = await getToken();
    // Demander le montant
    let amount = 0;
    // Pour une vraie app, utiliser un modal/input. Ici, prompt simple :
    // @ts-ignore
    amount = parseFloat(prompt('Montant à recharger (MAD) ?') || '0');
    if (!amount || amount <= 0) {
      setRechargeLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/stripe/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        // Ouvre Stripe Checkout dans le navigateur
        window.open(data.url, '_blank');
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de créer la session Stripe.');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau.');
    }
    setRechargeLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={{ position: 'absolute', top: 20, left: 16, zIndex: 10 }}>
        <Icon name="menu" size={28} color="#222" />
      </TouchableOpacity>
      <Text style={[styles.title, { marginTop: 40 }]}>Tableau de bord Moniteur</Text>
      <Text style={styles.balance}>Solde : {balance} MAD</Text>
      <TouchableOpacity style={styles.rechargeBtn} onPress={handleRecharge} disabled={rechargeLoading}>
        <Text style={styles.rechargeBtnText}>{rechargeLoading ? 'Chargement...' : 'Recharger mon solde'}</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Réservations à traiter</Text>
      {loading ? <ActivityIndicator size="large" color="#FFA800" /> : (
        <FlatList
          data={reservations}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }: { item: Booking }) => (
            <View style={styles.bookingCard}>
              <Text>Date : {item.date} {item.hour}</Text>
              <Text>Élève : {item.eleve_id}</Text>
              <Text>Poste : {item.poste_id}</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => respondToBooking(item.id, 'accept')}>
                  <Text style={styles.btnText}>Accepter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => respondToBooking(item.id, 'reject')}>
                  <Text style={styles.btnText}>Refuser</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20 }}>Aucune réservation en attente.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  balance: { fontSize: 18, color: '#FFA800', marginBottom: 8 },
  rechargeBtn: { backgroundColor: '#FFA800', borderRadius: 20, padding: 12, alignItems: 'center', marginBottom: 20 },
  rechargeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10, color: '#222' },
  bookingCard: { backgroundColor: '#F6F6F6', borderRadius: 12, padding: 16, marginBottom: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  acceptBtn: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 10, flex: 1, marginRight: 8, alignItems: 'center' },
  rejectBtn: { backgroundColor: '#F44336', borderRadius: 8, padding: 10, flex: 1, marginLeft: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});

export default MoniteurDashboardScreen; 