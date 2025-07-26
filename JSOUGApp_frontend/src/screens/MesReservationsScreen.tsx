import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://localhost:5000/api/moniteur';

interface Booking {
  id: number;
  date: string;
  hour: string;
  moniteur_id: number;
  poste_id: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
}

const MesReservationsScreen = ({ navigation }: any) => {
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const getToken = async () => {
    return await AsyncStorage.getItem('userToken');
  };

  const fetchData = async () => {
    setLoading(true);
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les réservations.');
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // Paiement Stripe
  const handleStripePay = async (booking_id: number) => {
    setPayingId(booking_id);
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/booking/stripe-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de créer la session Stripe.');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau.');
    }
    setPayingId(null);
  };

  // Paiement local
  const handleLocalPay = async (booking_id: number) => {
    setPayingId(booking_id);
    const token = await getToken();
    try {
      const res = await fetch(`${API_URL}/booking/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id, payment_method: 'local' }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Succès', 'Paiement confirmé !');
        fetchData();
      } else {
        Alert.alert('Erreur', data.error || 'Impossible de confirmer le paiement.');
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau.');
    }
    setPayingId(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 20, left: 16, zIndex: 10 }}>
        <Icon name="arrow-left" size={28} color="#222" />
      </TouchableOpacity>
      <Text style={[styles.title, { marginTop: 40 }]}>Mes réservations</Text>
      {loading ? <ActivityIndicator size="large" color="#FFA800" /> : (
        <FlatList
          data={reservations}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <Text>Date : {item.date} {item.hour}</Text>
              <Text>Moniteur : {item.moniteur_id}</Text>
              <Text>Poste : {item.poste_id}</Text>
              <Text>Statut : {item.status}</Text>
              <Text>Paiement : {item.payment_status}</Text>
              {item.status === 'accepted' && item.payment_status !== 'paid' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.payBtn} onPress={() => handleStripePay(item.id)} disabled={payingId === item.id}>
                    <Text style={styles.btnText}>{payingId === item.id ? 'Chargement...' : 'Payer en ligne (Stripe)'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.payBtn} onPress={() => handleLocalPay(item.id)} disabled={payingId === item.id}>
                    <Text style={styles.btnText}>{payingId === item.id ? 'Chargement...' : 'J’ai payé en local'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20 }}>Aucune réservation.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  bookingCard: { backgroundColor: '#F6F6F6', borderRadius: 12, padding: 16, marginBottom: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  payBtn: { backgroundColor: '#FFA800', borderRadius: 8, padding: 10, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});

export default MesReservationsScreen; 